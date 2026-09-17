import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { addIcon } from './addIcon.ts';
import { setIcon } from './setIcon.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('setIcon', () => {
  it('should replace the first child with the icon and keep the rest', () => {
    addIcon('my-icon', '<path d="M0 0"></path>');
    const el = createDiv();
    el.createSpan({ text: 'old icon' });
    el.createSpan({ text: 'label' });
    setIcon(el, 'my-icon');
    expect(el.textContent).toBe('label');
    expect(el.lastElementChild?.classList.contains('my-icon')).toBe(true);
  });

  it('should keep an existing svg that already carries the icon id', () => {
    addIcon('my-icon', '<path d="M0 0"></path>');
    const el = createDiv();
    setIcon(el, 'my-icon');
    const svg = el.firstChild;
    setIcon(el, 'my-icon');
    expect(el.firstChild).toBe(svg);
    expect(el.childNodes).toHaveLength(1);
  });

  it('should replace an svg for a different icon', () => {
    addIcon('first-icon', '');
    addIcon('second-icon', '');
    const el = createDiv();
    setIcon(el, 'first-icon');
    setIcon(el, 'second-icon');
    expect(el.childNodes).toHaveLength(1);
    expect(el.querySelector('.second-icon')).not.toBeNull();
  });

  it('should still remove the first child when the icon is unknown', () => {
    const el = createDiv();
    el.textContent = 'original';
    setIcon(el, 'missing');
    expect(el.childNodes).toHaveLength(0);
  });

  it('should do nothing to an empty element when the icon is unknown', () => {
    const el = createDiv();
    setIcon(el, 'missing');
    expect(el.childNodes).toHaveLength(0);
  });
});
