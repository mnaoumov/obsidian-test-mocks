import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { iconRegistry } from './icon-registry.ts';

afterEach(() => {
  iconRegistry.clear();
});

describe('iconRegistry', () => {
  it('should be a Map', () => {
    expect(iconRegistry).toBeInstanceOf(Map);
  });

  it('should store and retrieve icon data', () => {
    iconRegistry.set('my-icon', '<svg/>');
    expect(iconRegistry.get('my-icon')).toBe('<svg/>');
  });

  it('should start empty', () => {
    expect(iconRegistry.size).toBe(0);
  });
});
