export function getLinkpath(linktext: string): string {
  return linktext.split('#')[0] ?? '';
}
