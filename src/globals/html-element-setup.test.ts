import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  setupHTMLElementPrototype,
  teardownHTMLElementPrototype
} from './html-element-setup.ts';

const SCROLL_SIZE = 100;

describe('HTMLElement.prototype', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should expose innerWidth as a value property, not a method', () => {
    const el = document.createElement('div');
    expect(typeof el.innerWidth).not.toBe('function');
    expect(el.innerWidth).toBe(0);
  });

  it('should expose innerHeight as a value property, not a method', () => {
    const el = document.createElement('div');
    expect(typeof el.innerHeight).not.toBe('function');
    expect(el.innerHeight).toBe(0);
  });

  it('should subtract the horizontal padding from scrollWidth', () => {
    const el = createScrollingElement('scrollWidth');
    mockComputedStyle({ paddingLeft: '5px', paddingRight: '7px' });
    expect(el.innerWidth).toBe(SCROLL_SIZE - 5 - 7);
  });

  it('should subtract the vertical padding from scrollHeight', () => {
    const el = createScrollingElement('scrollHeight');
    mockComputedStyle({ paddingBottom: '3px', paddingTop: '11px' });
    expect(el.innerHeight).toBe(SCROLL_SIZE - 11 - 3);
  });

  it('should treat a non-numeric padding as zero', () => {
    const el = createScrollingElement('scrollWidth');
    mockComputedStyle({});
    expect(el.innerWidth).toBe(SCROLL_SIZE);
  });

  describe('teardownHTMLElementPrototype', () => {
    it('should remove the members, and setup should restore them', () => {
      teardownHTMLElementPrototype();
      expect('innerWidth' in HTMLElement.prototype).toBe(false);
      setupHTMLElementPrototype();
      expect('innerWidth' in HTMLElement.prototype).toBe(true);
    });
  });
});

function createScrollingElement(scrollProperty: 'scrollHeight' | 'scrollWidth'): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperty(el, scrollProperty, {
    configurable: true,
    value: SCROLL_SIZE
  });
  return el;
}

function mockComputedStyle(paddings: Partial<Record<'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop', string>>): void {
  const style = document.createElement('div').style;
  Object.assign(style, paddings);
  vi.spyOn(window, 'getComputedStyle').mockReturnValue(style);
}
