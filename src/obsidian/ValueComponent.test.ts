import type { ValueComponent as ValueComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ProgressBarComponent } from './ProgressBarComponent.ts';
import { ValueComponent } from './ValueComponent.ts';

class BareValueComponent extends ValueComponent<string> {
  public constructor() {
    super();
  }

  public getValue(): string {
    return '';
  }

  public setValue(_value: string): this {
    return this;
  }
}

describe('ValueComponent', () => {
  describe('registerOptionListener', () => {
    it('should return this', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      const result = comp.registerOptionListener({}, 'key');
      expect(result).toBe(comp);
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      expect(() => {
        comp.constructor2__();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance via ValueComponent base class', () => {
      const comp = new BareValueComponent();
      const original: ValueComponentOriginal<string> = comp.asOriginalType__();
      expect(original).toBe(comp);
    });
  });
});
