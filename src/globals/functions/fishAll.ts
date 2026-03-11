export function fishAll(selector: string): HTMLElement[] {
  return Array.from(document.querySelectorAll(selector));
}
