import {
  describe,
  expect,
  it
} from 'vitest';

import { parseYaml } from '../../../src/obsidian/functions/parseYaml.ts';
import { stringifyYaml } from '../../../src/obsidian/functions/stringifyYaml.ts';

describe('parseYaml', () => {
  it('should parse a YAML string into an object', () => {
    const EXPECTED_COUNT = 3;
    const result = parseYaml('title: Hello\ncount: 3');
    expect(result).toEqual({ count: EXPECTED_COUNT, title: 'Hello' });
  });

  it('should parse a YAML array', () => {
    const result = parseYaml('- a\n- b');
    expect(result).toEqual(['a', 'b']);
  });

  it('should return null for empty string', () => {
    expect(parseYaml('')).toBeNull();
  });
});

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
