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
  it('should set the icon content on a parent element', () => {
    addIcon('my-icon', '<b>icon</b>');
    const el = createDiv();
    el.textContent = 'old content';
    setIcon(el, 'my-icon');
    expect(el.textContent).not.toBe('old content');
  });

  it('should do nothing when icon is not registered', () => {
    const el = createDiv();
    el.textContent = 'original';
    setIcon(el, 'missing');
    expect(el.textContent).toBe('original');
  });
});
