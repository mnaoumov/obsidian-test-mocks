/**
 * @file
 *
 * Mock of Obsidian's `renderMath`.
 */

/**
 * Renders LaTeX math with MathJax. The mock renders nothing: it returns a `span` holding the source text.
 *
 * @param source - The LaTeX source.
 * @param _display - Whether to render as a display block rather than inline.
 * @returns A `span` whose text is the source.
 */
export function renderMath(source: string, _display: boolean): HTMLElement {
  return createSpan({ text: source });
}
