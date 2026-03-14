import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { TextAreaComponent } from './TextAreaComponent.ts';

describe('TextAreaComponent', () => {
  it('should create an instance via create__', () => {
    const component = TextAreaComponent.create__(createDiv());
    expect(component).toBeInstanceOf(TextAreaComponent);
  });

  it('should have a textarea input element', () => {
    const component = TextAreaComponent.create__(createDiv());
    expect(component.inputEl.tagName.toLowerCase()).toBe('textarea');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const component = TextAreaComponent.create__(createDiv());
      const original: TextAreaComponentOriginal = component.asOriginalType__();
      expect(original).toBe(component);
    });
  });
});
