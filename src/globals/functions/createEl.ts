/**
 * @file
 *
 * Mock of Obsidian's global `createEl` helper, which builds an HTML element from `DomElementInfo` options.
 */

interface ElementEx {
  placeholder?: string;
  type?: string;
  value?: string;
}

/**
 * Creates an HTML element and applies its options: class, title, `href`, placeholder, type, value, text and
 * attributes, then appends it to `parent` (or prepends it when `prepend` is set).
 *
 * @typeParam K - The tag name.
 * @param tag - The tag name of the element to create.
 * @param o - A class name, or the element's options; a `null` attribute value removes that attribute.
 * @param callback - Called with the new element after the options are applied.
 * @returns The new element.
 */
export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  o?: DomElementInfo | string,
  callback?: (el: HTMLElementTagNameMap[K]) => void
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  const elEx = el as ElementEx;
  if (typeof o === 'string') {
    el.className = o;
  } else if (o) {
    if (o.cls) {
      el.className = Array.isArray(o.cls) ? o.cls.join(' ') : o.cls;
    }
    if (o.title !== undefined) {
      el.title = o.title;
    }
    if (o.href !== undefined) {
      el.setAttribute('href', o.href);
    }
    if (o.placeholder !== undefined) {
      elEx.placeholder = o.placeholder;
    }
    if (o.type !== undefined) {
      elEx.type = o.type;
    }
    if (o.value !== undefined) {
      elEx.value = o.value;
    }
    if (o.text !== undefined) {
      if (typeof o.text === 'string') {
        el.textContent = o.text;
      } else {
        el.append(o.text);
      }
    }
    if (o.attr) {
      for (const [k, v] of Object.entries(o.attr)) {
        // eslint-disable-next-line unicorn/prefer-toggle-attribute -- Not equivalent: `toggleAttribute` forces an EMPTY value, while this sets the stringified `v`. Obsidian's `DomElementInfo.attr` carries real attribute values, so the mock has to preserve them.
        if (v === null) {
          el.removeAttribute(k);
        } else {
          el.setAttribute(k, String(v));
        }
      }
    }
    if (o.parent) {
      if (o.prepend) {
        o.parent.insertBefore(el, o.parent.firstChild);
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append -- The receiver is a `Node`, which has no `append()` — only the `ParentNode` mixin does. Obsidian declares these members and `DomElementInfo.parent` on `Node`, so the mock has to match.
        o.parent.appendChild(el);
      }
    }
  }
  callback?.(el);
  return el;
}
