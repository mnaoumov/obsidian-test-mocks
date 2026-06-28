import {
  describe,
  expect,
  it
} from 'vitest';

import { DateValue } from './DateValue.ts';
import { DurationValue } from './DurationValue.ts';

describe('DurationValue', () => {
  it('should always be truthy', () => {
    const val = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(String(val)).toBe('');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const val = DurationValue.create__(1, 0, 0, 0, 0, 0, 0);
      expect(val).toBeInstanceOf(DurationValue);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const original = val.asOriginalType3__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const mock = DurationValue.fromOriginalType3__(val.asOriginalType3__());
      expect(mock).toBe(val);
    });
  });

  describe('getMilliseconds', () => {
    it('should sum all the duration components', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 1, 500);
      expect(val.getMilliseconds()).toBe(1500);
    });
  });

  describe('fromMilliseconds', () => {
    it('should build a duration carrying the given milliseconds', () => {
      expect(DurationValue.fromMilliseconds(2000).getMilliseconds()).toBe(2000);
    });
  });

  describe('parseFromString', () => {
    const MILLISECONDS_IN_DAY = 86_400_000;
    const MILLISECONDS_IN_HOUR = 3_600_000;
    const MILLISECONDS_IN_MINUTE = 60_000;
    const MILLISECONDS_IN_SECOND = 1_000;
    const MILLISECONDS_IN_WEEK = 604_800_000;
    const MILLISECONDS_IN_YEAR = 31_536_000_000;
    const MILLISECONDS_IN_30_DAY_MONTH = 2_592_000_000;

    it('should parse an abbreviated day unit', () => {
      expect(DurationValue.parseFromString('1d')?.getMilliseconds()).toBe(MILLISECONDS_IN_DAY);
    });

    it('should parse a full unit word separated by a space', () => {
      expect(DurationValue.parseFromString('1 day')?.getMilliseconds()).toBe(MILLISECONDS_IN_DAY);
    });

    it('should parse hours', () => {
      expect(DurationValue.parseFromString('1h')?.getMilliseconds()).toBe(MILLISECONDS_IN_HOUR);
    });

    it('should parse minutes', () => {
      expect(DurationValue.parseFromString('1m')?.getMilliseconds()).toBe(MILLISECONDS_IN_MINUTE);
    });

    it('should parse seconds', () => {
      expect(DurationValue.parseFromString('1s')?.getMilliseconds()).toBe(MILLISECONDS_IN_SECOND);
    });

    it('should parse weeks as seven days', () => {
      expect(DurationValue.parseFromString('1w')?.getMilliseconds()).toBe(MILLISECONDS_IN_WEEK);
    });

    it('should parse years', () => {
      expect(DurationValue.parseFromString('1y')?.getMilliseconds()).toBe(MILLISECONDS_IN_YEAR);
    });

    it('should parse a month into the months component', () => {
      expect(DurationValue.parseFromString('1month')?.getMilliseconds()).toBe(MILLISECONDS_IN_30_DAY_MONTH);
    });

    it('should parse a negative value', () => {
      expect(DurationValue.parseFromString('-1d')?.getMilliseconds()).toBe(-MILLISECONDS_IN_DAY);
    });

    it('should return null for unsupported units and malformed input', () => {
      for (const input of ['1mo', '100ms', '2h30m', '1.5d', 'abc', '5', '']) {
        expect(DurationValue.parseFromString(input)).toBeNull();
      }
    });
  });

  describe('addToDate', () => {
    it('should return the provided date value', () => {
      const original = DateValue.create__(new Date()).asOriginalType3__();
      const dur = DurationValue.create__(0, 0, 1, 0, 0, 0, 0);
      expect(dur.addToDate(original)).toBe(original);
    });
  });
});
