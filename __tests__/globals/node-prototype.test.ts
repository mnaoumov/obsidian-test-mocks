import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  appendText,
  constructorWin,
  createDiv,
  createEl,
  createSpan,
  createSvg,
  detach,
  doc,
  empty,
  indexOf,
  insertAfter,
  instanceOf,
  setChildrenInPlace,
  win
} from '../../src/globals/Node.prototype.ts';

describe('Node.prototype extensions', () => {
  describe('appendText', () => {
    it('should append a text node', () => {
      const el = document.createElement('div');
      appendText.call(el, 'hello');
      expect(el.textContent).toBe('hello');
    });
  });

  describe('constructorWin', () => {
    it('should return window', () => {
      const el = document.createElement('div');
      expect(constructorWin.call(el)).toBe(window);
    });
  });

  describe('createDiv', () => {
    it('should create a div and append it to the node', () => {
      const parent = document.createElement('div');
      const div = createDiv.call(parent);
      expect(div.tagName).toBe('DIV');
      expect(parent.contains(div)).toBe(true);
    });

    it('should accept a string class', () => {
      const parent = document.createElement('div');
      const div = createDiv.call(parent, 'my-class');
      expect(div.className).toBe('my-class');
    });

    it('should accept DomElementInfo options', () => {
      const parent = document.createElement('div');
      const div = createDiv.call(parent, { cls: 'info-class' });
      expect(div.className).toBe('info-class');
    });

    it('should invoke the callback', () => {
      const parent = document.createElement('div');
      const callback = vi.fn();
      createDiv.call(parent, undefined, callback);
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('createEl', () => {
    it('should create an element and append it to the node', () => {
      const parent = document.createElement('div');
      const span = createEl.call(parent, 'span');
      expect(span.tagName).toBe('SPAN');
      expect(parent.contains(span)).toBe(true);
    });

    it('should pass string as cls option', () => {
      const parent = document.createElement('div');
      const span = createEl.call(parent, 'span', 'test-cls');
      expect(span.className).toBe('test-cls');
    });

    it('should pass DomElementInfo options', () => {
      const parent = document.createElement('div');
      const span = createEl.call(parent, 'span', { cls: 'from-info' });
      expect(span.className).toBe('from-info');
    });

    it('should handle undefined options', () => {
      const parent = document.createElement('div');
      const span = createEl.call(parent, 'span', undefined);
      expect(span.tagName).toBe('SPAN');
      expect(parent.contains(span)).toBe(true);
    });

    it('should invoke callback', () => {
      const parent = document.createElement('div');
      const callback = vi.fn();
      createEl.call(parent, 'span', undefined, callback);
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('createSpan', () => {
    it('should create a span and append it', () => {
      const parent = document.createElement('div');
      const span = createSpan.call(parent);
      expect(span.tagName).toBe('SPAN');
      expect(parent.contains(span)).toBe(true);
    });

    it('should accept a string class', () => {
      const parent = document.createElement('div');
      const span = createSpan.call(parent, 'span-class');
      expect(span.className).toBe('span-class');
    });

    it('should accept DomElementInfo options', () => {
      const parent = document.createElement('div');
      const span = createSpan.call(parent, { cls: 'info-span' });
      expect(span.className).toBe('info-span');
    });

    it('should invoke the callback', () => {
      const parent = document.createElement('div');
      const callback = vi.fn();
      createSpan.call(parent, undefined, callback);
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('createSvg', () => {
    it('should create an SVG element and append it', () => {
      const parent = document.createElement('div');
      const svg = createSvg.call(parent, 'svg');
      expect(svg.tagName).toBe('svg');
      expect(parent.contains(svg)).toBe(true);
    });

    it('should pass string as cls', () => {
      const parent = document.createElement('div');
      const svg = createSvg.call(parent, 'svg', 'svg-class');
      expect(svg.getAttribute('class')).toBe('svg-class');
    });

    it('should pass SvgElementInfo options', () => {
      const parent = document.createElement('div');
      const svg = createSvg.call(parent, 'svg', { cls: 'info-cls' });
      expect(svg.getAttribute('class')).toBe('info-cls');
    });

    it('should handle undefined options', () => {
      const parent = document.createElement('div');
      const svg = createSvg.call(parent, 'svg', undefined);
      expect(svg.tagName).toBe('svg');
      expect(parent.contains(svg)).toBe(true);
    });

    it('should invoke callback', () => {
      const parent = document.createElement('div');
      const callback = vi.fn();
      createSvg.call(parent, 'svg', undefined, callback);
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('detach', () => {
    it('should remove the node from its parent', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      detach.call(child);
      expect(parent.contains(child)).toBe(false);
    });

    it('should not throw when node has no parent', () => {
      const el = document.createElement('div');
      detach.call(el);
      expect(el.parentNode).toBeNull();
    });
  });

  describe('doc', () => {
    it('should return the owner document', () => {
      const el = document.createElement('div');
      expect(doc.call(el)).toBe(document);
    });
  });

  describe('empty', () => {
    it('should remove all children', () => {
      const el = document.createElement('div');
      el.appendChild(document.createElement('span'));
      el.appendChild(document.createElement('span'));
      empty.call(el);
      expect(el.childNodes).toHaveLength(0);
    });
  });

  describe('indexOf', () => {
    it('should return the index of the child among siblings', () => {
      const parent = document.createElement('div');
      const c1 = document.createElement('span');
      const c2 = document.createElement('span');
      parent.appendChild(c1);
      parent.appendChild(c2);
      expect(indexOf.call(parent, c2)).toBe(1);
    });

    it('should return -1 when node has no parent', () => {
      const orphan = document.createElement('div');
      expect(indexOf.call(document.createElement('div'), orphan)).toBe(-1);
    });
  });

  describe('insertAfter', () => {
    it('should insert a node after the reference child', () => {
      const parent = document.createElement('div');
      const firstChild = document.createElement('span');
      const second = document.createElement('span');
      parent.appendChild(firstChild);
      insertAfter.call(parent, second, firstChild);
      expect(parent.childNodes[1]).toBe(second);
    });

    it('should append when reference is null', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      const result = insertAfter.call(parent, child, null);
      expect(parent.lastChild).toBe(child);
      expect(result).toBe(child);
    });
  });

  describe('instanceOf', () => {
    it('should return true for matching type', () => {
      const el = document.createElement('div');
      expect(instanceOf.call(el, HTMLDivElement)).toBe(true);
    });

    it('should return false for non-matching type', () => {
      const el = document.createElement('div');
      expect(instanceOf.call(el, HTMLSpanElement)).toBe(false);
    });
  });

  describe('setChildrenInPlace', () => {
    it('should replace all children', () => {
      const parent = document.createElement('div');
      parent.appendChild(document.createElement('span'));
      const newChildren = [document.createElement('p'), document.createElement('a')];
      setChildrenInPlace.call(parent, newChildren);
      expect(parent.childNodes).toHaveLength(newChildren.length);
      expect(parent.childNodes[0]).toBe(newChildren[0]);
      expect(parent.childNodes[1]).toBe(newChildren[1]);
    });
  });

  describe('win', () => {
    it('should return window', () => {
      const el = document.createElement('div');
      expect(win.call(el)).toBe(window);
    });
  });
});
