/**
 * @file
 *
 * Mock of Obsidian's global `createSvg` helper, which builds an SVG element from `SvgElementInfo` options.
 */

import type { SvgElementInfo } from '../../internal/types.ts';

/**
 * Creates an element in the SVG namespace and applies its options: class and attributes, then appends it to
 * `parent` (or prepends it when `prepend` is set).
 *
 * @typeParam K - The SVG tag name.
 * @param tag - The tag name of the SVG element to create.
 * @param o - A class name, or the element's options; a `null` attribute value removes that attribute.
 * @param callback - Called with the new element after the options are applied.
 * @returns The new SVG element.
 */
export function createSvg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  o?: string | SvgElementInfo,
  callback?: (el: SVGElementTagNameMap[K]) => void
): SVGElementTagNameMap[K] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (typeof o === 'string') {
    el.setAttribute('class', o);
  } else if (o) {
    if (o.cls) {
      el.setAttribute('class', Array.isArray(o.cls) ? o.cls.join(' ') : o.cls);
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
