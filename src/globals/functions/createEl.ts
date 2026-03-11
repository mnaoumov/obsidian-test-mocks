interface ElementEx {
  placeholder?: string;
  type?: string;
  value?: string;
}

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
        el.appendChild(o.text);
      }
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
