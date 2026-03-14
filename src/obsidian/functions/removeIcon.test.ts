import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { addIcon } from './addIcon.ts';
import { removeIcon } from './removeIcon.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('removeIcon', () => {
  it('should remove an icon from the registry', () => {
    addIcon('my-icon', '<path d="M0 0"/>');
    removeIcon('my-icon');
    expect(iconRegistry.has('my-icon')).toBe(false);
  });

  it('should not throw when removing a non-existent icon', () => {
    expect(() => {
      removeIcon('non-existent');
    }).not.toThrow();
  });
});
