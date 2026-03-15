import type { ProgressBarComponent as ProgressBarComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ProgressBarComponent } from './ProgressBarComponent.ts';

const TEST_VALUE = 42;
const TEST_VALUE_75 = 75;

describe('ProgressBarComponent', () => {
  it('should create an instance via create__', () => {
    const comp = ProgressBarComponent.create__(createDiv());
    expect(comp).toBeInstanceOf(ProgressBarComponent);
  });

  describe('getValue', () => {
    it('should default to 0', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      expect(comp.getValue()).toBe(0);
    });
  });

  describe('setValue', () => {
    it('should set and get value', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      comp.setValue(TEST_VALUE);
      expect(comp.getValue()).toBe(TEST_VALUE);
    });

    it('should update progressBar__ style width', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      comp.setValue(TEST_VALUE_75);
      expect(comp.progressBar__.style.width).toBe(`${String(TEST_VALUE_75)}%`);
    });

    it('should update progressBar__ dataset value', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      comp.setValue(TEST_VALUE);
      expect(comp.progressBar__.dataset['value']).toBe(String(TEST_VALUE));
    });

    it('should return this for chaining', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      expect(comp.setValue(TEST_VALUE)).toBe(comp);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      const original: ProgressBarComponentOriginal = comp.asOriginalType__();
      expect(original).toBe(comp);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const comp = ProgressBarComponent.create__(createDiv());
      const mock = ProgressBarComponent.fromOriginalType2__(comp.asOriginalType__());
      expect(mock).toBe(comp);
    });
  });
});
