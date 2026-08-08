export function normalizePath(path: string): string {
  return path.replaceAll('\\', '/').replaceAll(/\/+/g, '/').replaceAll(/^\/|\/$/g, '');
}
