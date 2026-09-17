/**
 * @file
 *
 * Installs and removes the `innerHeight` and `innerWidth` getters Obsidian adds to `HTMLElement.prototype`.
 */

const HTML_ELEMENT_MEMBER_NAMES = ['innerHeight', 'innerWidth'];

/**
 * Defines the `innerHeight` and `innerWidth` getters on `HTMLElement.prototype`: the element's scroll height or width
 * minus its computed vertical or horizontal padding. Under jsdom, which does no layout, the scroll sizes are `0`, so
 * both come out as `0` minus any padding.
 */
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

/**
 * Deletes the getters {@link setupHTMLElementPrototype} defined.
 */
export function teardownHTMLElementPrototype(): void {
  for (const name of HTML_ELEMENT_MEMBER_NAMES) {
    Reflect.deleteProperty(HTMLElement.prototype, name);
  }
}

function parsePadding(value: string): number {
  const padding = Number.parseFloat(value);
  return Number.isNaN(padding) ? 0 : padding;
}
