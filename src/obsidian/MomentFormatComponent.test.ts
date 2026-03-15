import type { MomentFormatComponent as MomentFormatComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { MomentFormatComponent } from './MomentFormatComponent.ts';

describe('MomentFormatComponent', () => {
  it('should create an instance via create2__', () => {
    const comp = MomentFormatComponent.create2__(createDiv());
    expect(comp).toBeInstanceOf(MomentFormatComponent);
  });

  it('should have a sampleEl', () => {
    const comp = MomentFormatComponent.create2__(createDiv());
    expect(comp.sampleEl).toBeInstanceOf(HTMLElement);
  });

  it('should have empty defaultFormat initially', () => {
    const comp = MomentFormatComponent.create2__(createDiv());
    expect(comp.defaultFormat).toBe('');
  });

  describe('setDefaultFormat', () => {
    it('should set defaultFormat and return this', () => {
      const comp = MomentFormatComponent.create2__(createDiv());
      const result = comp.setDefaultFormat('YYYY-MM-DD');
      expect(comp.defaultFormat).toBe('YYYY-MM-DD');
      expect(result).toBe(comp);
    });
  });

  describe('setSampleEl', () => {
    it('should set sampleEl and return this', () => {
      const comp = MomentFormatComponent.create2__(createDiv());
      const el = createDiv();
      const result = comp.setSampleEl(el);
      expect(comp.sampleEl).toBe(el);
      expect(result).toBe(comp);
    });
  });

  describe('setValue', () => {
    it('should delegate to super and return this', () => {
      const comp = MomentFormatComponent.create2__(createDiv());
      const result = comp.setValue('2024-01-01');
      expect(comp.getValue()).toBe('2024-01-01');
      expect(result).toBe(comp);
    });
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const comp = MomentFormatComponent.create2__(createDiv());
      const original: MomentFormatComponentOriginal = comp.asOriginalType5__();
      expect(original).toBe(comp);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const comp = MomentFormatComponent.create2__(createDiv());
      const mock = MomentFormatComponent.fromOriginalType5__(comp.asOriginalType5__());
      expect(mock).toBe(comp);
    });
  });
});
