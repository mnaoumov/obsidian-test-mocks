import {
  describe,
  expect,
  it
} from 'vitest';

import { displayTooltip } from '../../src/obsidian/functions/displayTooltip.ts';

describe('displayTooltip', () => {
  it('should create a span with tooltip class and text content', () => {
    const el = createDiv();
    displayTooltip(el, 'Hello tooltip');
    const span = el.querySelector('span.tooltip');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('Hello tooltip');
  });

  it('should accept DocumentFragment as content', () => {
    const el = createDiv();
    const fragment = document.createDocumentFragment();
    fragment.append('fragment text');
    displayTooltip(el, fragment as unknown as string);
    const span = el.querySelector('span.tooltip');
    expect(span).not.toBeNull();
  });

  it('should accept options parameter', () => {
    const el = createDiv();
    expect(() => {
      displayTooltip(el, 'tip', { placement: 'top' });
    }).not.toThrow();
  });
});
