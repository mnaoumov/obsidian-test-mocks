import {
  describe,
  expect,
  it
} from 'vitest';

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
