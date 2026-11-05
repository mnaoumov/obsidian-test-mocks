import {
  describe,
  expect,
  it
} from 'vitest';

import { setTooltip } from './setTooltip.ts';

describe('setTooltip', () => {
  it('should write the tooltip text to aria-label', () => {
    const el = createDiv();
    setTooltip(el, 'tip');
    expect(el.getAttribute('aria-label')).toBe('tip');
    expect(el.getAttributeNames()).toEqual(['aria-label']);
  });

  it('should write every set option to its data-tooltip attribute', () => {
    const el = createDiv();
    setTooltip(el, 'tip', {
      classes: ['mod-a', 'mod-b'],
      delay: 250,
      gap: 8,
      placement: 'top'
    });
    expect(el.getAttribute('data-tooltip-position')).toBe('top');
    expect(el.getAttribute('data-tooltip-classes')).toBe('mod-a mod-b');
    expect(el.getAttribute('data-tooltip-delay')).toBe('250');
    expect(el.getAttribute('data-tooltip-gap')).toBe('8');
  });

  it('should write nothing for the default bottom placement, a zero delay or a zero gap', () => {
    const el = createDiv();
    setTooltip(el, 'tip', { delay: 0, gap: 0, placement: 'bottom' });
    expect(el.getAttributeNames()).toEqual(['aria-label']);
  });

  it('should keep the attributes an earlier call wrote, as Obsidian does', () => {
    const el = createDiv();
    setTooltip(el, 'first', { placement: 'left' });
    setTooltip(el, 'second', { placement: 'bottom' });
    expect(el.getAttribute('aria-label')).toBe('second');
    expect(el.getAttribute('data-tooltip-position')).toBe('left');
  });
});
