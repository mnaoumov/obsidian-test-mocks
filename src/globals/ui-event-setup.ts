const UI_EVENT_MEMBER_NAMES = ['doc', 'instanceOf', 'targetNode', 'win'];

export function setupUIEventPrototype(): void {
  Object.defineProperties(UIEvent.prototype, {
    doc: {
      configurable: true,
      get(this: UIEvent): Document {
        return this.win.document;
      }
    },
    instanceOf: {
      configurable: true,
      value(this: UIEvent, type: new (...data: never[]) => unknown): boolean {
        return this instanceof type;
      },
      writable: true
    },
    targetNode: {
      configurable: true,
      get(this: UIEvent): Node | null {
        return this.target instanceof Node ? this.target : null;
      }
    },
    win: {
      configurable: true,
      get(): Window {
        return window;
      }
    }
  });
}

export function teardownUIEventPrototype(): void {
  for (const name of UI_EVENT_MEMBER_NAMES) {
    Reflect.deleteProperty(UIEvent.prototype, name);
  }
}
