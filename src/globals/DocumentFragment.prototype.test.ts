import {
  describe,
  expect,
  it
} from 'vitest';

import {
  find,
  findAll
} from './DocumentFragment.prototype.ts';

describe('DocumentFragment.prototype extensions', () => {
  describe('find', () => {
    it('should return the matching element', () => {
      const frag = document.createDocumentFragment();
      const div = document.createElement('div');
      div.className = 'target';
      frag.appendChild(div);
      const result = find.call(frag, '.target');
      expect(result).toBe(div);
    });

    it('should throw when no element matches', () => {
      const frag = document.createDocumentFragment();
      expect(() => find.call(frag, '.nonexistent')).toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all matching elements', () => {
      const frag = document.createDocumentFragment();
      const items = [document.createElement('div'), document.createElement('div')];
      for (const item of items) {
        item.className = 'item';
        frag.appendChild(item);
      }

      const results = findAll.call(frag, '.item');
      expect(results).toHaveLength(items.length);
    });

    it('should return empty array when no elements match', () => {
      const frag = document.createDocumentFragment();
      const results = findAll.call(frag, '.nonexistent');
      expect(results).toHaveLength(0);
    });
  });
});
