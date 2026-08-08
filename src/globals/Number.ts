export function isNumber(object: unknown): object is number {
  return typeof object === 'number' && !Number.isNaN(object);
}
