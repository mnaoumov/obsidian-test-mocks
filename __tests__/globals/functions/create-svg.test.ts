import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { createSvg } from '../../../src/globals/functions/createSvg.ts';

const VIEW_BOX = '0 0 100 100';
const WIDTH = '50';

describe('createSvg', () => {
  it('should create an SVG element with the given tag', () => {
    const el = createSvg('svg');
    expect(el.tagName).toBe('svg');
    expect(el.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('should set class attribute when passed a string', () => {
    const el = createSvg('svg', 'my-svg-class');
    expect(el.getAttribute('class')).toBe('my-svg-class');
  });

  it('should set class from SvgElementInfo with string cls', () => {
    const el = createSvg('svg', { cls: 'svg-cls' });
    expect(el.getAttribute('class')).toBe('svg-cls');
  });

  it('should set class from SvgElementInfo with array cls', () => {
    const el = createSvg('svg', { cls: ['cls-a', 'cls-b'] });
    expect(el.getAttribute('class')).toBe('cls-a cls-b');
  });

  it('should set attributes from SvgElementInfo', () => {
    const el = createSvg('svg', { attr: { viewBox: VIEW_BOX, width: WIDTH } });
    expect(el.getAttribute('viewBox')).toBe(VIEW_BOX);
    expect(el.getAttribute('width')).toBe(WIDTH);
  });

  it('should remove attributes when value is null', () => {
    const el = createSvg('svg', { attr: { 'data-test': null } });
    expect(el.getAttribute('data-test')).toBeNull();
  });

  it('should append to parent', () => {
    const parent = document.createElement('div');
    const el = createSvg('svg', { parent });
    expect(parent.firstChild).toBe(el);
  });

  it('should prepend to parent when prepend is true', () => {
    const parent = document.createElement('div');
    const existing = document.createElement('span');
    parent.appendChild(existing);
    const el = createSvg('svg', { parent, prepend: true });
    expect(parent.firstChild).toBe(el);
  });

  it('should invoke the callback with the element', () => {
    const callback = vi.fn();
    const el = createSvg('svg', undefined, callback);
    expect(callback).toHaveBeenCalledWith(el);
  });

  it('should handle empty options object', () => {
    const el = createSvg('svg', {});
    expect(el.tagName).toBe('svg');
  });
});
