export function renderMath(source: string, _display: boolean): HTMLElement {
  return createSpan({ text: source });
}
