const STRICT_MOCK_MARKER = Symbol('strictMock');

const PASSTHROUGH_PROPS = new Set<string | symbol>([
  'then',
  'toJSON',
  Symbol.toPrimitive,
  Symbol.toStringTag,
  Symbol.iterator
]);

const strictMockHandler: ProxyHandler<object> = {
  get(target, prop, receiver): unknown {
    if (typeof prop === 'symbol' || prop in target || PASSTHROUGH_PROPS.has(prop)) {
      return Reflect.get(target, prop, receiver);
    }

    const name = target.constructor.name;
    throw new Error(`Property "${prop}" is not mocked in ${name}. To override, assign a value first: mock.${prop} = ...`);
  }
};

export function strictMock<T extends object>(instance: T): T {
  if (STRICT_MOCK_MARKER in instance) {
    return instance;
  }
  Object.defineProperty(instance, STRICT_MOCK_MARKER, { value: true });
  return new Proxy(instance, strictMockHandler) as T;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function strictCastTo<T>(instance: object): T {
  return strictMock(instance) as unknown as T;
}
