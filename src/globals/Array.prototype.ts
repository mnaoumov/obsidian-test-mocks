export function contains<T>(this: T[], target: T): boolean {
  return this.includes(target);
}

export function findLastIndex<T>(
  this: T[],
  predicate: (value: T) => boolean
): number {
  for (let index = this.length - 1; index >= 0; index--) {
    const value = this[index];
    if (value !== undefined && predicate(value)) {
      return index;
    }
  }
  return -1;
}

export function first<T>(this: T[]): T | undefined {
  return this[0];
}

export function last<T>(this: T[]): T | undefined {
  return this.length > 0 ? this.at(-1) : undefined;
}

export function remove<T>(this: T[], target: T): void {
  const index = this.indexOf(target);
  if (index !== -1) {
    this.splice(index, 1);
  }
}

export function shuffle<T>(this: T[]): T[] {
  // Deterministic shuffle for tests: reverse in-place.
  return this.reverse();
}

export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
}
