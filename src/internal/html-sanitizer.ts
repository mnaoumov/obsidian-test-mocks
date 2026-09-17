/**
 * @file
 *
 * The HTML sanitizer behind the mocked `sanitizeHTMLToDom`: a port of the passes DOMPurify 3.0.1 runs with the
 * configuration Obsidian 1.14.2 passes it, plus the two `afterSanitizeAttributes` hooks Obsidian installs when it
 * loads.
 *
 * Ported: the element allowlist (with Obsidian's added `iframe` and forbidden `style`), keeping the content of a
 * removed element unless it is one whose content DOMPurify forbids, the namespace-nesting check, the markup-in-text
 * check, the attribute allowlist (with Obsidian's added attributes), `data-*` and `aria-*` attributes, the URI checks
 * with unknown protocols allowed, and the `id` / `name` clobbering check. Left out: the hooks Obsidian installs later
 * at runtime, Trusted Types, the options Obsidian does not set, and the `noscript` / `noembed` check, which cannot
 * fire because neither element is allowed.
 */

import {
  HTML_ATTRIBUTES,
  HTML_TAGS,
  MATH_ML_ATTRIBUTES,
  MATH_ML_DISALLOWED_TAGS,
  MATH_ML_TAGS,
  SVG_ATTRIBUTES,
  SVG_DISALLOWED_TAGS,
  SVG_FILTER_TAGS,
  SVG_TAGS,
  XML_ATTRIBUTES
} from './html-sanitizer-allowlists.ts';
import { ensureNonNullable } from './type-guards.ts';

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const MATH_ML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const ALLOWED_TAGS = new Set([...HTML_TAGS, ...SVG_TAGS, ...SVG_FILTER_TAGS, ...MATH_ML_TAGS, '#text', 'iframe', 'tbody']);
const FORBIDDEN_TAGS = new Set(['style']);
const ALLOWED_ATTRIBUTES = new Set([
  ...HTML_ATTRIBUTES,
  ...SVG_ATTRIBUTES,
  ...MATH_ML_ATTRIBUTES,
  ...XML_ATTRIBUTES,
  'allow',
  'allowfullscreen',
  'data-tooltip-position',
  'frameborder',
  'sandbox'
]);
const URI_SAFE_ATTRIBUTES = new Set(['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'style', 'summary', 'title', 'value', 'xmlns']);
const DATA_URI_TAGS = new Set(['audio', 'image', 'img', 'source', 'track', 'video']);
const FORBIDDEN_CONTENTS = new Set([
  'annotation-xml',
  'audio',
  'colgroup',
  'desc',
  'foreignobject',
  'head',
  'iframe',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mtext',
  'noembed',
  'noframes',
  'noscript',
  'plaintext',
  'script',
  'style',
  'svg',
  'template',
  'thead',
  'title',
  'video',
  'xmp'
]);
const ALL_SVG_TAGS = new Set([...SVG_TAGS, ...SVG_FILTER_TAGS, ...SVG_DISALLOWED_TAGS]);
const ALL_MATH_ML_TAGS = new Set([...MATH_ML_TAGS, ...MATH_ML_DISALLOWED_TAGS]);
const MATH_ML_TEXT_INTEGRATION_POINTS = new Set(['mi', 'mn', 'mo', 'ms', 'mtext']);
const HTML_INTEGRATION_POINTS = new Set(['annotation-xml', 'desc', 'foreignobject', 'title']);
const COMMON_SVG_AND_HTML_ELEMENTS = new Set(['a', 'font', 'script', 'style', 'title']);

const IFRAME_ALLOWED_FEATURES = new Set([
  'encrypted-media',
  'fullscreen',
  'gamepad',
  'hid',
  'idle-detection',
  'oversized-images',
  'picture-in-picture',
  'sync-xhr'
]);
const IFRAME_ALLOWED_SANDBOX_TOKENS = new Set([
  'allow-forms',
  'allow-modals',
  'allow-popups',
  'allow-presentation',
  'allow-same-origin',
  'allow-scripts'
]);
const IFRAME_DEFAULT_SANDBOX = 'allow-forms allow-presentation allow-same-origin allow-scripts allow-modals';

const ARIA_ATTRIBUTE_REG_EXP = /^aria-[-\w]+$/;
// eslint-disable-next-line no-control-regex -- DOMPurify strips every control character from a URL before checking it.
const ATTRIBUTE_WHITESPACE_REG_EXP = /[\u{0}-\u{20}\u{A0}\u{1680}\u{180E}\u{2000}-\u{2029}\u{205F}\u{3000}]/gu;
const DATA_ATTRIBUTE_REG_EXP = /^data-[-\w.\u{B7}-\u{FFFF}]/u;
const ALLOWED_URI_REG_EXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;
const SCRIPT_OR_DATA_URI_REG_EXP = /^(?:\w+script|data):/i;
const LEADING_WHITESPACE_REG_EXP = /^[\r\n\t ]+/;
const MARKUP_REG_EXP = /<[/\w]/;

interface ParentInfo {
  namespaceURI: null | string;
  tagName: string;
}

/**
 * Sanitizes an HTML string as Obsidian's `sanitizeHTMLToDom` does and returns the result as a fragment owned by the
 * global `document`.
 *
 * @param html - The HTML to sanitize.
 * @returns The sanitized content.
 */
export function sanitizeHtml(html: string): DocumentFragment {
  const leadingWhitespace = LEADING_WHITESPACE_REG_EXP.exec(html)?.[0];
  const parsedDocument = new DOMParser().parseFromString(html || '<!-->', 'text/html');
  const body = parsedDocument.body;
  if (leadingWhitespace) {
    body.insertBefore(parsedDocument.createTextNode(leadingWhitespace), body.firstChild);
  }

  sanitizeTree(parsedDocument, body);

  const fragment = parsedDocument.createDocumentFragment();
  while (body.firstChild) {
    fragment.append(body.firstChild);
  }
  return document.importNode(fragment, true);
}

function applyObsidianHooks(element: Element): void {
  if (element.namespaceURI !== HTML_NAMESPACE) {
    return;
  }
  if (element.localName === 'a') {
    element.setAttribute('target', '_blank');
    if (!element.hasAttribute('rel')) {
      element.setAttribute('rel', 'noopener nofollow');
    }
    return;
  }
  if (element.localName !== 'iframe') {
    return;
  }
  const sandbox = element.getAttribute('sandbox');
  if (sandbox === null) {
    element.setAttribute('sandbox', IFRAME_DEFAULT_SANDBOX);
  } else {
    filterTokens(element, 'sandbox', sandbox, ' ', IFRAME_ALLOWED_SANDBOX_TOKENS);
  }
  const allow = element.getAttribute('allow');
  if (allow !== null) {
    filterTokens(element, 'allow', allow, ';', IFRAME_ALLOWED_FEATURES);
  }
}

function filterTokens(element: Element, attributeName: string, value: string, separator: string, allowedTokens: Set<string>): void {
  const filteredValue = value
    .split(separator)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => allowedTokens.has(token))
    .join(separator);
  if (filteredValue !== value) {
    element.setAttribute(attributeName, filteredValue);
  }
}

function hasValidNamespace(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // DOMPurify also rejects an HTML element under an SVG or MathML parent that is no integration point. The HTML parser
  // never builds that tree, and every integration point whose removal could hoist HTML into one drops its content, so
  // that check cannot fire on parsed markup and is left out.
  if (element.namespaceURI === HTML_NAMESPACE) {
    return !ALL_MATH_ML_TAGS.has(tagName) && (COMMON_SVG_AND_HTML_ELEMENTS.has(tagName) || !ALL_SVG_TAGS.has(tagName));
  }

  // A top-level node of a template's content has the content fragment as its parent, which has no tag name.
  const parentNode = element.parentNode as Element;
  const parent: ParentInfo = parentNode.tagName
    ? parentNode
    : { namespaceURI: HTML_NAMESPACE, tagName: 'template' };
  const parentTagName = parent.tagName.toLowerCase();

  if (element.namespaceURI === MATH_ML_NAMESPACE) {
    if (parent.namespaceURI === HTML_NAMESPACE) {
      return tagName === 'math';
    }
    return parent.namespaceURI === SVG_NAMESPACE
      ? tagName === 'math' && HTML_INTEGRATION_POINTS.has(parentTagName)
      : ALL_MATH_ML_TAGS.has(tagName);
  }

  // The HTML parser puts every other element in the SVG namespace.
  if (parent.namespaceURI === HTML_NAMESPACE) {
    return tagName === 'svg';
  }
  return parent.namespaceURI === MATH_ML_NAMESPACE
    ? tagName === 'svg' && (parentTagName === 'annotation-xml' || MATH_ML_TEXT_INTEGRATION_POINTS.has(parentTagName))
    : ALL_SVG_TAGS.has(tagName);
}

function isClobberedForm(form: HTMLFormElement): boolean {
  return typeof form.nodeName !== 'string'
    || typeof form.textContent !== 'string'
    || typeof form.removeChild !== 'function'
    || !(form.attributes instanceof NamedNodeMap)
    || typeof form.removeAttribute !== 'function'
    || typeof form.setAttribute !== 'function'
    || typeof form.namespaceURI !== 'string'
    || typeof form.insertBefore !== 'function'
    || typeof form.hasChildNodes !== 'function';
}

function isClobberingName(value: string): boolean {
  const inertDocument = document.createElement('template').content.ownerDocument;
  /* eslint-disable unicorn/no-computed-property-existence-check -- `in` walks the prototype chain, as DOMPurify does: an inherited member is clobbered just as much. */
  return value in inertDocument || value in inertDocument.createElement('form');
  /* eslint-enable unicorn/no-computed-property-existence-check -- Restores the rule after the clobbering check. */
}

function isValidAttribute(tagName: string, attributeName: string, value: string): boolean {
  // DOMPurify runs the clobbering check first, but it only concerns `id` and `name`, which no `data-*` / `aria-*`
  // name can be, so the order does not matter.
  if (DATA_ATTRIBUTE_REG_EXP.test(attributeName) || ARIA_ATTRIBUTE_REG_EXP.test(attributeName)) {
    return true;
  }
  if (((attributeName === 'id' || attributeName === 'name') && isClobberingName(value)) || !ALLOWED_ATTRIBUTES.has(attributeName)) {
    return false;
  }
  if (URI_SAFE_ATTRIBUTES.has(attributeName)) {
    return true;
  }
  const uri = value.replaceAll(ATTRIBUTE_WHITESPACE_REG_EXP, '');
  const isMediaDataUri = ['href', 'src', 'xlink:href'].includes(attributeName)
    && tagName !== 'script'
    && value.startsWith('data:')
    && DATA_URI_TAGS.has(tagName);
  // DOMPurify also keeps an empty value at the end, but an empty value never matches the script-or-data pattern.
  return ALLOWED_URI_REG_EXP.test(uri) || isMediaDataUri || !SCRIPT_OR_DATA_URI_REG_EXP.test(uri);
}

function sanitizeAttributes(element: Element): void {
  const attributes = element.attributes;
  const tagName = element.nodeName.toLowerCase();
  // DOMPurify walks the live list backwards, removing each attribute and adding it back when it is valid, so the
  // attributes that survive end up in reverse order.
  for (let index = attributes.length - 1; index >= 0; index--) {
    const attribute = ensureNonNullable(attributes[index]);
    const { name, namespaceURI } = attribute;
    const value = name === 'value' ? attribute.value : attribute.value.trim();
    const lowerName = name.toLowerCase();
    element.removeAttribute(name);
    if (name === 'is' && !ALLOWED_ATTRIBUTES.has(name)) {
      element.remove();
    }
    if (!isValidAttribute(tagName, lowerName, value)) {
      continue;
    }
    if (namespaceURI) {
      element.setAttributeNS(namespaceURI, name, value);
    } else {
      element.setAttribute(name, value);
    }
  }
  applyObsidianHooks(element);
}

/**
 * Runs DOMPurify's element and attribute passes over a tree.
 *
 * @param ownerDocument - The document that owns `root`. The iterator must come from it: removing a node only keeps
 * the iterators of its own document in step.
 * @param root - The root of the tree.
 */
function sanitizeTree(ownerDocument: Document, root: Node): void {
  // eslint-disable-next-line no-bitwise -- `NodeFilter` flags are bit masks.
  const iterator = ownerDocument.createNodeIterator(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT);
  let node = iterator.nextNode() as ChildNode | null;
  while (node) {
    if (!wasRemovedAsDisallowed(node) && node instanceof Element) {
      if (node instanceof HTMLTemplateElement) {
        sanitizeTree(node.content.ownerDocument, node.content);
      }
      sanitizeAttributes(node);
    }
    node = iterator.nextNode() as ChildNode | null;
  }
}

/**
 * Runs DOMPurify's element pass on one node. Its `template` branch of the markup-in-text check is left out: a parsed
 * `template` keeps its children in `content`, never as child nodes, so the check never reaches it.
 *
 * @param node - The node to check.
 * @returns `true` when the node was removed.
 */
function wasRemovedAsDisallowed(node: ChildNode): boolean {
  if (node instanceof HTMLFormElement && isClobberedForm(node)) {
    node.remove();
    return true;
  }

  if (
    node instanceof Element
    && node.hasChildNodes()
    && !node.firstElementChild
    && MARKUP_REG_EXP.test(node.innerHTML)
    && MARKUP_REG_EXP.test(node.textContent)
  ) {
    node.remove();
    return true;
  }

  const tagName = node.nodeName.toLowerCase();
  if (!ALLOWED_TAGS.has(tagName) || FORBIDDEN_TAGS.has(tagName)) {
    if (!FORBIDDEN_CONTENTS.has(tagName)) {
      for (const childNode of [...node.childNodes].reverse()) {
        node.after(childNode.cloneNode(true));
      }
    }
    node.remove();
    return true;
  }

  if (node instanceof Element && !hasValidNamespace(node)) {
    node.remove();
    return true;
  }

  return false;
}
