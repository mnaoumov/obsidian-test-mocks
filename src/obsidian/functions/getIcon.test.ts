import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { addIcon } from './addIcon.ts';
import { getIcon } from './getIcon.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('getIcon', () => {
  it('should return an SVG element for a registered icon', () => {
    addIcon('test-icon', '<circle r="5"/>');
    const svg = getIcon('test-icon');
    expect(svg).not.toBeNull();
    expect(svg?.tagName.toLowerCase()).toBe('svg');
  });

  it('should return null for a non-existent icon', () => {
    expect(getIcon('missing')).toBeNull();
  });
});
