import {
  describe,
  expect,
  it
} from 'vitest';

import {
  addClass,
  addClasses,
  find,
  findAll,
  findAllSelf,
  getAttr,
  getCssPropertyValue,
  getText,
  hasClass,
  isActiveElement,
  matchParent,
  removeClass,
  removeClasses,
  setAttr,
  setAttrs,
  setText,
  toggleClass
} from '../../src/globals/Element.prototype.ts';

const ATTR_VALUE = '123';

describe('Element.prototype extensions', () => {
  describe('addClass', () => {
    it('should add classes to the element', () => {
      const el = document.createElement('div');
      addClass.call(el, 'foo', 'bar');
      expect(el.classList.contains('foo')).toBe(true);
      expect(el.classList.contains('bar')).toBe(true);
    });
  });

  describe('addClasses', () => {
    it('should add an array of classes', () => {
      const el = document.createElement('div');
      addClasses.call(el, ['alpha', 'beta']);
      expect(el.classList.contains('alpha')).toBe(true);
      expect(el.classList.contains('beta')).toBe(true);
    });
  });

  describe('find', () => {
    it('should return matching child element', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.className = 'target';
      parent.appendChild(child);
      expect(find.call(parent, '.target')).toBe(child);
    });

    it('should return null when no child matches', () => {
      const parent = document.createElement('div');
      expect(find.call(parent, '.missing')).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all matching children', () => {
      const parent = document.createElement('div');
      const items = [document.createElement('span'), document.createElement('span')];
      for (const item of items) {
        item.className = 'item';
        parent.appendChild(item);
      }
      expect(findAll.call(parent, '.item')).toHaveLength(items.length);
    });
  });

  describe('findAllSelf', () => {
    it('should include self when it matches the selector', () => {
      const el = document.createElement('div');
      el.className = 'target';
      const results = findAllSelf.call(el, '.target');
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(el);
    });

    it('should not include self when it does not match', () => {
      const el = document.createElement('div');
      const child = document.createElement('span');
      child.className = 'target';
      el.appendChild(child);
      const results = findAllSelf.call(el, '.target');
      expect(results).toHaveLength(1);
      expect(results[0]).toBe(child);
    });
  });

  describe('getAttr', () => {
    it('should return the attribute value', () => {
      const el = document.createElement('div');
      el.setAttribute('data-id', ATTR_VALUE);
      expect(getAttr.call(el, 'data-id')).toBe(ATTR_VALUE);
    });

    it('should return null for missing attributes', () => {
      const el = document.createElement('div');
      expect(getAttr.call(el, 'data-missing')).toBeNull();
    });
  });

  describe('getText', () => {
    it('should return the text content', () => {
      const el = document.createElement('div');
      el.textContent = 'hello';
      expect(getText.call(el)).toBe('hello');
    });
  });

  describe('hasClass', () => {
    it('should return true when element has the class', () => {
      const el = document.createElement('div');
      el.classList.add('active');
      expect(hasClass.call(el, 'active')).toBe(true);
    });

    it('should return false when element lacks the class', () => {
      const el = document.createElement('div');
      expect(hasClass.call(el, 'active')).toBe(false);
    });
  });

  describe('isActiveElement', () => {
    it('should return false when element is not active', () => {
      const el = document.createElement('div');
      expect(isActiveElement.call(el)).toBe(false);
    });
  });

  describe('matchParent', () => {
    it('should return the matching ancestor', () => {
      const grandparent = document.createElement('div');
      grandparent.className = 'ancestor';
      const parent = document.createElement('div');
      const child = document.createElement('span');
      grandparent.appendChild(parent);
      parent.appendChild(child);
      document.body.appendChild(grandparent);

      const result = matchParent.call(child, '.ancestor');
      expect(result).toBe(grandparent);

      document.body.removeChild(grandparent);
    });

    it('should return null when no ancestor matches', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);

      expect(matchParent.call(child, '.nonexistent')).toBeNull();

      document.body.removeChild(parent);
    });

    it('should stop at lastParent', () => {
      const grandparent = document.createElement('div');
      grandparent.className = 'ancestor';
      const parent = document.createElement('div');
      const child = document.createElement('span');
      grandparent.appendChild(parent);
      parent.appendChild(child);
      document.body.appendChild(grandparent);

      // Stop at parent, so grandparent is not checked
      const result = matchParent.call(child, '.ancestor', parent);
      expect(result).toBeNull();

      document.body.removeChild(grandparent);
    });
  });

  describe('removeClass', () => {
    it('should remove classes from the element', () => {
      const el = document.createElement('div');
      el.classList.add('foo', 'bar');
      removeClass.call(el, 'foo');
      expect(el.classList.contains('foo')).toBe(false);
      expect(el.classList.contains('bar')).toBe(true);
    });
  });

  describe('removeClasses', () => {
    it('should remove an array of classes', () => {
      const el = document.createElement('div');
      el.classList.add('a', 'b', 'c');
      removeClasses.call(el, ['a', 'c']);
      expect(el.classList.contains('a')).toBe(false);
      expect(el.classList.contains('b')).toBe(true);
      expect(el.classList.contains('c')).toBe(false);
    });
  });

  describe('setAttr', () => {
    it('should set an attribute', () => {
      const el = document.createElement('div');
      setAttr.call(el, 'data-val', 'test');
      expect(el.getAttribute('data-val')).toBe('test');
    });

    it('should remove attribute when value is null', () => {
      const el = document.createElement('div');
      el.setAttribute('data-val', 'test');
      setAttr.call(el, 'data-val', null);
      expect(el.getAttribute('data-val')).toBeNull();
    });

    it('should convert numbers to strings', () => {
      const el = document.createElement('div');
      const NUM = 42;
      setAttr.call(el, 'data-num', NUM);
      expect(el.getAttribute('data-num')).toBe(String(NUM));
    });

    it('should convert booleans to strings', () => {
      const el = document.createElement('div');
      setAttr.call(el, 'data-bool', true);
      expect(el.getAttribute('data-bool')).toBe('true');
    });
  });

  describe('setAttrs', () => {
    it('should set multiple attributes', () => {
      const el = document.createElement('div');
      setAttrs.call(el, { 'data-a': 'one', 'data-b': 'two' });
      expect(el.getAttribute('data-a')).toBe('one');
      expect(el.getAttribute('data-b')).toBe('two');
    });
  });

  describe('setText', () => {
    it('should set text content from a string', () => {
      const el = document.createElement('div');
      el.appendChild(document.createElement('span'));
      setText.call(el, 'new text');
      expect(el.textContent).toBe('new text');
      expect(el.childNodes).toHaveLength(1);
    });

    it('should replace content with a DocumentFragment', () => {
      const el = document.createElement('div');
      el.textContent = 'old';
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode('fragment content'));
      setText.call(el, frag);
      expect(el.textContent).toBe('fragment content');
    });
  });

  describe('getCssPropertyValue', () => {
    it('should return the computed style property value', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      const result = getCssPropertyValue.call(el, 'display');
      expect(typeof result).toBe('string');
      document.body.removeChild(el);
    });
  });

  describe('toggleClass', () => {
    it('should add a class when value is true', () => {
      const el = document.createElement('div');
      toggleClass.call(el, 'active', true);
      expect(el.classList.contains('active')).toBe(true);
    });

    it('should remove a class when value is false', () => {
      const el = document.createElement('div');
      el.classList.add('active');
      toggleClass.call(el, 'active', false);
      expect(el.classList.contains('active')).toBe(false);
    });

    it('should handle an array of classes', () => {
      const el = document.createElement('div');
      toggleClass.call(el, ['a', 'b'], true);
      expect(el.classList.contains('a')).toBe(true);
      expect(el.classList.contains('b')).toBe(true);
    });
  });
});
