// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- We need to cast.
export function castTo<T>(value: unknown): T {
  return value as T;
}
