import {
  describe,
  expect,
  it
} from 'vitest';

import { DateValue } from './DateValue.ts';
import { moment } from './vars/moment.ts';

describe('DateValue', () => {
  it('should always be truthy', () => {
    const value = new DateValue(new Date());
    expect(value.isTruthy()).toBe(true);
  });

  it('should return formatted date string without time', () => {
    const YEAR = 2024;
    const MONTH_INDEX = 0;
    const DAY = 15;
    const value = new DateValue(new Date(YEAR, MONTH_INDEX, DAY));
    const $string = String(value);
    expect($string).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should include time when showTime is true', () => {
    const YEAR = 2024;
    const MONTH_INDEX = 0;
    const DAY = 15;
    const HOURS = 10;
    const MINUTES = 30;
    const SECONDS = 45;
    const value = new DateValue(new Date(YEAR, MONTH_INDEX, DAY, HOURS, MINUTES, SECONDS), true);
    const $string = String(value);
    expect($string).toContain('T');
    expect($string).toMatch(/T\d{2}:\d{2}:\d{2}$/);
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = DateValue.create__(new Date());
      expect(value).toBeInstanceOf(DateValue);
    });

    it('should create an instance with showTime', () => {
      const value = DateValue.create__(new Date(), true);
      expect(value).toBeInstanceOf(DateValue);
    });
  });

  describe('dateOnly', () => {
    it('should return a DateValue without time', () => {
      const value = DateValue.create__(new Date('2024-01-15T10:30:00'), true);
      const result = value.dateOnly();
      expect(result).toBeInstanceOf(DateValue);
      expect(String(result)).not.toContain('T');
    });
  });

  describe('relative', () => {
    it('should return a moment-relative-from-now string matching moment.fromNow', () => {
      const date = new Date('2020-01-01T00:00:00Z');
      const value = DateValue.create__(date);
      expect(value.relative()).toBe(moment(date).fromNow());
    });
  });

  describe('parseFromString', () => {
    it('should parse a valid date string', () => {
      expect(DateValue.parseFromString('2024-01-15')).toBeInstanceOf(DateValue);
    });

    it('should return null for an invalid date string', () => {
      expect(DateValue.parseFromString('not a date')).toBeNull();
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const value = DateValue.create__(new Date());
      const original = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = DateValue.create__(new Date());
      const mock = DateValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });
});
