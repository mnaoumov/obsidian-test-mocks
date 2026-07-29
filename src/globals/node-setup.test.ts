import {
  describe,
  expect,
  it
} from 'vitest';

import { castTo } from '../internal/castTo.ts';
import {
  setupNodePrototype,
  teardownNodePrototype
} from './node-setup.ts';

describe('Node.prototype', () => {
  it('should expose doc as a value property, not a method', () => {
    const el = document.createElement('div');
    expect(typeof el.doc).not.toBe('function');
    expect(el.doc).toBe(document);
  });

  it('should expose doc as the global document when ownerDocument is null', () => {
    // Document nodes have null ownerDocument
    expect(document.doc).toBe(document);
  });

  it('should expose doc as the GLOBAL document for a document node, not that document itself', () => {
    // A `Document` is the one node whose `ownerDocument` is `null`.
    // Obsidian 1.13.4 falls back to the global `document`, NOT to `this`:
    // `n(Node.prototype, 'doc', function () { return this.ownerDocument || document })`.
    // A second document is what makes those two candidate fallbacks distinguishable.
    // The assertion above passes under both, so on its own it pins nothing.
    const otherDocument = document.implementation.createHTMLDocument();
    expect(otherDocument.ownerDocument).toBeNull();
    expect(otherDocument.doc).toBe(document);
    expect(otherDocument.doc).not.toBe(otherDocument);
  });

  it('should expose win as a value property, not a method', () => {
    const el = document.createElement('div');
    expect(typeof el.win).not.toBe('function');
    expect(el.win).toBe(window);
  });

  it('should expose win as the global window when the owner document has no default view', () => {
    const detachedDocument = document.implementation.createHTMLDocument();
    expect(detachedDocument.defaultView).toBeNull();
    expect(detachedDocument.createElement('div').win).toBe(window);
  });

  it('should expose win as the MAIN window for a document node that has a view of its own', () => {
    // `win` reads `this.doc.defaultView`, so it inherits the global-document fallback asserted above.
    // A pop-out document therefore resolves to the MAIN window, not to its own.
    // That is real Obsidian's behavior, and it is why `obsidian-dev-utils` offers
    // `getDocumentWindow(doc)` for code that needs a document's own window.
    const popoutDocument = document.implementation.createHTMLDocument();
    const popoutWindow = castTo<Window>({});
    Object.defineProperty(popoutDocument, 'defaultView', { value: popoutWindow });
    expect(popoutDocument.defaultView).toBe(popoutWindow);
    expect(popoutDocument.win).toBe(window);
    expect(popoutDocument.win).not.toBe(popoutWindow);
  });

  it('should expose constructorWin as the global window', () => {
    const el = document.createElement('div');
    expect(typeof el.constructorWin).not.toBe('function');
    expect(el.constructorWin).toBe(window);
  });

  describe('teardownNodePrototype', () => {
    it('should remove the members, and setup should restore them', () => {
      teardownNodePrototype();
      expect('doc' in Node.prototype).toBe(false);
      setupNodePrototype();
      expect('doc' in Node.prototype).toBe(true);
    });
  });
});
