import {
  describe,
  expect,
  it
} from 'vitest';

import { DateValue } from '../../src/obsidian/DateValue.ts';

describe('DateValue', () => {
  it('should always be truthy', () => {
    const val = new DateValue(new Date());
    expect(val.isTruthy()).toBe(true);
  });

  it('should return formatted date string without time', () => {
    const YEAR = 2024;
    const MONTH_INDEX = 0;
    const DAY = 15;
    const val = new DateValue(new Date(YEAR, MONTH_INDEX, DAY));
    const str = String(val);
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should include time when showTime is true', () => {
    const YEAR = 2024;
    const MONTH_INDEX = 0;
    const DAY = 15;
    const HOURS = 10;
    const MINUTES = 30;
    const SECONDS = 45;
    const val = new DateValue(new Date(YEAR, MONTH_INDEX, DAY, HOURS, MINUTES, SECONDS), true);
    const str = String(val);
    expect(str).toContain('T');
    expect(str).toMatch(/T\d{2}:\d{2}:\d{2}$/);
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const val = DateValue.create__(new Date());
      expect(val).toBeInstanceOf(DateValue);
    });

    it('should create an instance with showTime', () => {
      const val = DateValue.create__(new Date(), true);
      expect(val).toBeInstanceOf(DateValue);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const val = DateValue.create__(new Date());
      const original = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});
