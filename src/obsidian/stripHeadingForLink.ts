export function stripHeadingForLink(heading: string): string {
  return heading.replace(/^#+\s*/, '').replace(/[[\]|#^\\]/g, '');
}
