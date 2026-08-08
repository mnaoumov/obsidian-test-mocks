const HTML_ELEMENT_MEMBER_NAMES = ['innerHeight', 'innerWidth'];

export function setupHTMLElementPrototype(): void {
  Object.defineProperties(HTMLElement.prototype, {
    innerHeight: {
      configurable: true,
      enumerable: false,
      get(this: HTMLElement): number {
        const style = getComputedStyle(this);
        return this.scrollHeight - parsePadding(style.paddingTop) - parsePadding(style.paddingBottom);
      }
    },
    innerWidth: {
      configurable: true,
      enumerable: false,
      get(this: HTMLElement): number {
        const style = getComputedStyle(this);
        return this.scrollWidth - parsePadding(style.paddingLeft) - parsePadding(style.paddingRight);
      }
    }
  });
}

export function teardownHTMLElementPrototype(): void {
  for (const name of HTML_ELEMENT_MEMBER_NAMES) {
    Reflect.deleteProperty(HTMLElement.prototype, name);
  }
}

function parsePadding(value: string): number {
  const padding = Number.parseFloat(value);
  return Number.isNaN(padding) ? 0 : padding;
}
