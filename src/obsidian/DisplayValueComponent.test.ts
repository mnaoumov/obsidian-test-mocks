import type { DisplayValueComponent as DisplayValueComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { DisplayValueComponent } from './DisplayValueComponent.ts';

describe('DisplayValueComponent', () => {
  it('should create an instance via create__ and append valueEl', () => {
    const container = createDiv();
    const comp = DisplayValueComponent.create__(container);
    expect(comp).toBeInstanceOf(DisplayValueComponent);
    expect(container.contains(comp.valueEl)).toBe(true);
  });

  describe('setValue', () => {
    it('should set valueEl text content', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      comp.setValue('hello');
      expect(comp.valueEl.textContent).toBe('hello');
    });

    it('should clear text content when value is null', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      comp.setValue('hello');
      comp.setValue(null);
      expect(comp.valueEl.textContent).toBe('');
    });

    it('should return this for chaining', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      expect(comp.setValue('x')).toBe(comp);
    });
  });

  describe('setStatus', () => {
    it('should add mod-warning class when status is warning', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      comp.setStatus('warning');
      expect(comp.valueEl.classList.contains('mod-warning')).toBe(true);
    });

    it('should remove mod-warning class when status is null', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      comp.setStatus('warning');
      comp.setStatus(null);
      expect(comp.valueEl.classList.contains('mod-warning')).toBe(false);
    });

    it('should return this for chaining', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      expect(comp.setStatus(null)).toBe(comp);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      const original: DisplayValueComponentOriginal = comp.asOriginalType__();
      expect(original).toBe(comp);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const comp = DisplayValueComponent.create__(createDiv());
      const mock = DisplayValueComponent.fromOriginalType__(comp.asOriginalType__());
      expect(mock).toBe(comp);
    });
  });
});
