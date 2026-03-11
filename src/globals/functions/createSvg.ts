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
        o.parent.appendChild(el);
      }
    }
  }
  callback?.(el);
  return el;
}
