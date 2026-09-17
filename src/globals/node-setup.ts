/**
 * @file
 *
 * Installs and removes the `constructorWin`, `doc` and `win` members Obsidian adds to `Node.prototype`.
 */

const NODE_MEMBER_NAMES = ['constructorWin', 'doc', 'win'];

/**
 * Defines `constructorWin`, `doc` and `win` on `Node.prototype`: `doc` is the node's owner document, falling back to
 * the global document; `win` is that document's window, falling back to the global window; `constructorWin` is the
 * global window.
 */
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
        // The fallback is the GLOBAL document, not `this`, matching Obsidian 1.13.4 verbatim:
        // `n(Node.prototype, 'doc', function () { return this.ownerDocument || document })`.
        // A `Document` is the one node whose `ownerDocument` is `null`, so a pop-out document's
        // `doc` — and therefore its `win` — resolves to the MAIN document/window.
        // That is Obsidian's own behavior, which is why `obsidian-dev-utils` offers
        // `getDocumentWindow(doc)` for code that needs a document's own window.
        // Do NOT "correct" this to `?? this` — the mock would then lie.
        // A pop-out test would pass here while the real code resolved the main window.
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

/**
 * Deletes the members {@link setupNodePrototype} defined.
 */
export function teardownNodePrototype(): void {
  for (const name of NODE_MEMBER_NAMES) {
    Reflect.deleteProperty(Node.prototype, name);
  }
}
