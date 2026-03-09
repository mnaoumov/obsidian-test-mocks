// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T is the cast target type specified by the caller.
export function castTo<T>(value: unknown): T {
  return value as T;
}
