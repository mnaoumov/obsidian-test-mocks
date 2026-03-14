import {
  describe,
  expect,
  it
} from 'vitest';

import {
  setCssProps,
  setCssStyles
} from './SVGElement.prototype.ts';

describe('SVGElement.prototype extensions', () => {
  function createSvgElement(): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  describe('setCssProps', () => {
    it('should set CSS custom properties', () => {
      const el = createSvgElement();
      setCssProps.call(el, { '--fill': 'red', '--stroke': 'blue' });
      expect(el.style.getPropertyValue('--fill')).toBe('red');
      expect(el.style.getPropertyValue('--stroke')).toBe('blue');
    });
  });

  describe('setCssStyles', () => {
    it('should assign style properties', () => {
      const el = createSvgElement();
      setCssStyles.call(el, { opacity: '0.5' });
      expect(el.style.opacity).toBe('0.5');
    });
  });
});
