const NODE_MEMBER_NAMES = ['constructorWin', 'doc', 'win'];

export function setupNodePrototype(): void {
  Object.defineProperties(Node.prototype, {
    constructorWin: {
      configurable: true,
      enumerable: false,
      value: window,
      writable: true
    },
    doc: {
      configurable: true,
      enumerable: false,
      get(this: Node): Document {
        return this.ownerDocument ?? document;
      }
    },
    win: {
      configurable: true,
      enumerable: false,
      get(this: Node): Window {
        return this.doc.defaultView ?? window;
      }
    }
  });
}

export function teardownNodePrototype(): void {
  for (const name of NODE_MEMBER_NAMES) {
    Reflect.deleteProperty(Node.prototype, name);
  }
}
