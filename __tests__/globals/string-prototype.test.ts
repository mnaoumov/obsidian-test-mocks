import {
  describe,
  expect,
  it
} from 'vitest';

import {
  contains,
  format
} from '../../src/globals/String.prototype.ts';

describe('String.prototype extensions', () => {
  describe('contains', () => {
    it('should return true when string includes the target', () => {
      expect(contains.call('hello world', 'world')).toBe(true);
    });

    it('should return false when string does not include the target', () => {
      expect(contains.call('hello world', 'foo')).toBe(false);
    });
  });

  describe('format', () => {
    it('should replace placeholders with arguments', () => {
      const result = format.call('Hello, {0}! Welcome to {1}.', 'Alice', 'Wonderland');
      expect(result).toBe('Hello, Alice! Welcome to Wonderland.');
    });

    it('should return empty string for missing arguments', () => {
      const result = format.call('{0} and {1}', 'first');
      expect(result).toBe('first and ');
    });

    it('should handle no placeholders', () => {
      const result = format.call('no placeholders');
      expect(result).toBe('no placeholders');
    });

    it('should handle repeated placeholders', () => {
      const result = format.call('{0} {0}', 'echo');
      expect(result).toBe('echo echo');
    });
  });
});
