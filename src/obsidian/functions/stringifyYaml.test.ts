import {
  describe,
  expect,
  it
} from 'vitest';

import { stringifyYaml } from './stringifyYaml.ts';

describe('stringifyYaml', () => {
  it('should stringify an object to YAML', () => {
    const result = stringifyYaml({ title: 'Hello' });
    expect(result).toContain('title: Hello');
  });

  it('should handle arrays', () => {
    const result = stringifyYaml(['a', 'b']);
    expect(result).toContain('- a');
    expect(result).toContain('- b');
  });
});
