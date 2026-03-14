import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { addIcon } from './addIcon.ts';
import { getIconIds } from './getIconIds.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('getIconIds', () => {
  it('should return all registered icon IDs', () => {
    addIcon('alpha', '<path/>');
    addIcon('beta', '<path/>');
    const ids = getIconIds();
    expect(ids).toContain('alpha');
    expect(ids).toContain('beta');
  });

  it('should return empty array when no icons registered', () => {
    expect(getIconIds()).toEqual([]);
  });
});
