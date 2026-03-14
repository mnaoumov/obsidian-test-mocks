import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { addIcon } from './addIcon.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('addIcon', () => {
  it('should add an icon to the registry', () => {
    addIcon('my-icon', '<path d="M0 0"/>');
    expect(iconRegistry.has('my-icon')).toBe(true);
  });
});
