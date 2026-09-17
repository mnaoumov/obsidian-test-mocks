import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import {
  appendText,
  createDiv,
  createEl,
  createSpan,
  createSvg,
  detach,
  empty,
  indexOf,
  insertAfter,
  instanceOf,
  setChildrenInPlace
} from './Node.prototype.ts';

describe('Node.prototype extensions', () => {
  describe('appendText', () => {
    it('should append a text node', () => {
      const el = document.createElement('div');
      appendText.call(el, 'hello');
      expect(el.textContent).toBe('hello');
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

    it('should throw when the created element is not a div', () => {
      const parent = document.createElement('div');
      const span = document.createElement('span');
      vi.spyOn(document, 'createElement').mockReturnValueOnce(span);
      expect(() => createDiv.call(parent)).toThrow('Expected a div element, but got span');
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
      parent.append(child);
      detach.call(child);
      expect(parent.contains(child)).toBe(false);
    });

    it('should not throw when node has no parent', () => {
      const el = document.createElement('div');
      detach.call(el);
      expect(el.parentNode).toBeNull();
    });
  });

  describe('empty', () => {
    it('should remove all children', () => {
      const el = document.createElement('div');
      el.append(document.createElement('span'));
      el.append(document.createElement('span'));
      empty.call(el);
      expect(el.childNodes).toHaveLength(0);
    });

    it('should remove the last child first', () => {
      const el = document.createElement('div');
      const first = document.createElement('span');
      const last = document.createElement('span');
      el.append(first, last);
      const observer = new MutationObserver(noop);
      observer.observe(el, { childList: true });
      empty.call(el);
      expect(removedNodes(observer.takeRecords())).toEqual([last, first]);
    });
  });

  describe('indexOf', () => {
    it('should return the index of the child among siblings', () => {
      const parent = document.createElement('div');
      const c1 = document.createElement('span');
      const c2 = document.createElement('span');
      parent.append(c1);
      parent.append(c2);
      expect(indexOf.call(parent, c2)).toBe(1);
    });

    it('should return -1 when node has no parent', () => {
      const orphan = document.createElement('div');
      expect(indexOf.call(document.createElement('div'), orphan)).toBe(-1);
    });

    it('should return -1 when node is a child of another parent', () => {
      const parent = document.createElement('div');
      const otherParent = document.createElement('div');
      const c1 = document.createElement('span');
      const c2 = document.createElement('span');
      otherParent.append(c1);
      otherParent.append(c2);
      expect(indexOf.call(parent, c2)).toBe(-1);
    });

    it('should search the receiver when called through the installed prototype', () => {
      const parent = document.createElement('div');
      const c1 = document.createElement('span');
      const c2 = document.createElement('span');
      parent.append(c1);
      parent.append(c2);
      expect(parent.indexOf(c2)).toBe(1);
      expect(c2.indexOf(c2)).toBe(-1);
    });
  });

  describe('insertAfter', () => {
    it('should insert a node after the reference child', () => {
      const parent = document.createElement('div');
      const firstChild = document.createElement('span');
      const second = document.createElement('span');
      parent.append(firstChild);
      insertAfter.call(parent, second, firstChild);
      expect(parent.childNodes[1]).toBe(second);
    });

    it('should insert the node first when reference is null', () => {
      const parent = document.createElement('div');
      const existing = document.createElement('span');
      parent.append(existing);
      const child = document.createElement('span');
      const result = insertAfter.call(parent, child, null);
      expect([...parent.childNodes]).toEqual([child, existing]);
      expect(result).toBe(child);
    });

    it('should insert the node after the last child', () => {
      const parent = document.createElement('div');
      const existing = document.createElement('span');
      parent.append(existing);
      const child = document.createElement('span');
      insertAfter.call(parent, child, existing);
      expect([...parent.childNodes]).toEqual([existing, child]);
    });

    it('should throw when the reference is not a child of this node', () => {
      const parent = document.createElement('div');
      const other = document.createElement('div');
      const reference = document.createElement('span');
      const sibling = document.createElement('span');
      other.append(reference, sibling);
      expect(() => insertAfter.call(parent, document.createElement('span'), reference)).toThrow();
      expect([...other.childNodes]).toEqual([reference, sibling]);
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
      parent.append(document.createElement('span'));
      const newChildren = [document.createElement('p'), document.createElement('a')];
      setChildrenInPlace.call(parent, newChildren);
      expect(parent.childNodes).toHaveLength(newChildren.length);
      expect(parent.firstChild).toBe(newChildren[0]);
      expect(parent.childNodes[1]).toBe(newChildren[1]);
    });

    it('should keep children that are already in place attached', () => {
      const parent = document.createElement('div');
      const kept1 = document.createElement('span');
      const dropped = document.createElement('span');
      const kept2 = document.createElement('span');
      parent.append(kept1, dropped, kept2);
      const added = document.createElement('p');
      const observer = new MutationObserver(noop);
      observer.observe(parent, { childList: true });
      setChildrenInPlace.call(parent, [kept1, kept2, added]);
      const records = observer.takeRecords();
      expect([...parent.childNodes]).toEqual([kept1, kept2, added]);
      expect(removedNodes(records)).toEqual([dropped]);
      expect(records.flatMap((record) => [...record.addedNodes])).toEqual([added]);
    });

    it('should move only the misplaced children when reordering', () => {
      const parent = document.createElement('div');
      const a = document.createElement('span');
      const b = document.createElement('span');
      const c = document.createElement('span');
      parent.append(a, b, c);
      setChildrenInPlace.call(parent, [c, a, b]);
      expect([...parent.childNodes]).toEqual([c, a, b]);
    });

    it('should remove every trailing child that is not wanted', () => {
      const parent = document.createElement('div');
      const kept = document.createElement('span');
      parent.append(kept, document.createElement('span'), document.createElement('span'));
      setChildrenInPlace.call(parent, [kept]);
      expect([...parent.childNodes]).toEqual([kept]);
    });
  });
});

function removedNodes(records: MutationRecord[]): Node[] {
  return records.flatMap((record) => [...record.removedNodes]);
}
