import {
  describe,
  expect,
  it
} from 'vitest';

import { ProgressBarComponent } from '../../src/obsidian/ProgressBarComponent.ts';

describe('ValueComponent', () => {
  describe('registerOptionListener', () => {
    it('should return this', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      const result = comp.registerOptionListener({}, 'key');
      expect(result).toBe(comp);
    });
  });
});
