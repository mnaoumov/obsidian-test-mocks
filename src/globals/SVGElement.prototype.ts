/**
 * @file
 *
 * Mocks of the inline-style helpers Obsidian adds to `SVGElement.prototype`.
 */

/**
 * Sets CSS properties, including custom properties such as `--size`, on the element's inline style.
 *
 * @param props - Property names mapped to the values to set.
 */
export function setCssProps(this: SVGElement, props: Record<string, string>): void {
  const style = this.style;
  for (const [k, v] of Object.entries(props)) {
    style.setProperty(k, v);
  }
}

/**
 * Assigns camelCase style declarations to the element's inline style.
 *
 * @param styles - The style declarations to assign.
 */
export function setCssStyles(this: SVGElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(this.style, styles);
}
