export function contains(this: string, target: string): boolean {
  return this.includes(target);
}

export function format(this: string, ...$arguments: string[]): string {
  // Very small subset used in practice: "{0}" style formatting.
  return this.replaceAll(/\{(?<Index>\d+)\}/g, (_substring: string, index: number | string): string => {
    return $arguments[Number(index)] ?? '';
  });
}
