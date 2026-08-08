export function fishAll(selector: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(selector)];
}
