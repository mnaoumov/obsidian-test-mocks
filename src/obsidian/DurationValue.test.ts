import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { DateValue } from './DateValue.ts';
import { DurationValue } from './DurationValue.ts';
import { moment } from './vars/moment.ts';

type Components = [number, number, number, number, number, number, number];

function getComponents(value: DurationValue | null): Components | null {
  return value && [value.years, value.months, value.days, value.hours, value.minutes, value.seconds, value.milliseconds];
}

describe('DurationValue', () => {
  it('should be falsy when every component is zero', () => {
    const value = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(value.isTruthy()).toBe(false);
  });

  it('should be truthy when any component is non-zero', () => {
    const COMPONENT_COUNT = 7;
    for (let index = 0; index < COMPONENT_COUNT; index++) {
      const componentArguments = Array.from({ length: COMPONENT_COUNT }, (_, componentIndex) => componentIndex === index ? -1 : 0) as Components;
      expect(new DurationValue(...componentArguments).isTruthy()).toBe(true);
    }
  });

  it('should expose its components', () => {
    const value = new DurationValue(1, 2, 3, 4, 5, 6, 7);
    expect(getComponents(value)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  describe('toString', () => {
    it('should humanize the duration with moment', () => {
      const value = new DurationValue(0, 0, 3, 0, 0, 0, 0);
      expect(String(value)).toBe('3 days');
      expect(String(value)).toBe(moment.duration({ days: 3 }).humanize());
    });

    it('should humanize a zero duration', () => {
      expect(String(new DurationValue(0, 0, 0, 0, 0, 0, 0))).toBe('a few seconds');
    });
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = DurationValue.create__(1, 0, 0, 0, 0, 0, 0);
      expect(value).toBeInstanceOf(DurationValue);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const value = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const original = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const mock = DurationValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });

  describe('with a fixed clock', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 1, 1, 12, 0, 0));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('getMilliseconds', () => {
      it('should sum the time components', () => {
        expect(DurationValue.create__(0, 0, 0, 0, 0, 1, 500).getMilliseconds()).toBe(1500);
      });

      it('should measure a month by the calendar from now', () => {
        const DAYS_IN_FEBRUARY_2023 = 28;
        const MILLISECONDS_IN_DAY = 86_400_000;
        expect(DurationValue.create__(0, 1, 0, 0, 0, 0, 0).getMilliseconds()).toBe(DAYS_IN_FEBRUARY_2023 * MILLISECONDS_IN_DAY);
      });
    });

    describe('fromMilliseconds', () => {
      it('should build a duration carrying the given milliseconds', () => {
        const value = DurationValue.fromMilliseconds(2000);
        expect(value.milliseconds).toBe(2000);
        expect(value.getMilliseconds()).toBe(2000);
      });
    });
  });

  describe('parseFromString', () => {
    it('should parse every single-unit spelling into its component', () => {
      const cases: [string, Components][] = [
        ['2y', [2, 0, 0, 0, 0, 0, 0]],
        ['2 year', [2, 0, 0, 0, 0, 0, 0]],
        ['2years', [2, 0, 0, 0, 0, 0, 0]],
        ['2M', [0, 2, 0, 0, 0, 0, 0]],
        ['2 month', [0, 2, 0, 0, 0, 0, 0]],
        ['2 months', [0, 2, 0, 0, 0, 0, 0]],
        ['2w', [0, 0, 14, 0, 0, 0, 0]],
        ['2 week', [0, 0, 14, 0, 0, 0, 0]],
        ['2 weeks', [0, 0, 14, 0, 0, 0, 0]],
        ['2d', [0, 0, 2, 0, 0, 0, 0]],
        ['2 day', [0, 0, 2, 0, 0, 0, 0]],
        ['2 days', [0, 0, 2, 0, 0, 0, 0]],
        ['2h', [0, 0, 0, 2, 0, 0, 0]],
        ['2 hour', [0, 0, 0, 2, 0, 0, 0]],
        ['2 hours', [0, 0, 0, 2, 0, 0, 0]],
        ['2m', [0, 0, 0, 0, 2, 0, 0]],
        ['2 minute', [0, 0, 0, 0, 2, 0, 0]],
        ['2 minutes', [0, 0, 0, 0, 2, 0, 0]],
        ['2s', [0, 0, 0, 0, 0, 2, 0]],
        ['2 second', [0, 0, 0, 0, 0, 2, 0]],
        ['-2 seconds', [0, 0, 0, 0, 0, -2, 0]]
      ];
      for (const [input, expected] of cases) {
        expect(getComponents(DurationValue.parseFromString(input))).toEqual(expected);
      }
    });

    it('should parse an ISO 8601 duration with a time part, anywhere in the string', () => {
      expect(getComponents(DurationValue.parseFromString('P1Y2M1W3DT4H5M6S'))).toEqual([1, 2, 10, 4, 5, 6, 0]);
      expect(getComponents(DurationValue.parseFromString('in PT90M'))).toEqual([0, 0, 0, 0, 90, 0, 0]);
    });

    it('should not parse an ISO 8601 duration without a time part', () => {
      expect(DurationValue.parseFromString('P3D')).toBeNull();
    });

    it('should return null for unsupported units and malformed input', () => {
      for (const input of ['1mo', '100ms', '2h30m', '1.5d', 'abc', '5', '', ' 1d', '1  d', '1D']) {
        expect(DurationValue.parseFromString(input)).toBeNull();
      }
    });
  });

  describe('addToDate', () => {
    const YEAR = 2024;
    const JANUARY = 0;
    const MARCH = 2;
    const LAST_DAY_OF_JANUARY = 31;
    const NOON = 12;

    it('should shift the date component by component and keep a date-only value without time', () => {
      const original = DateValue.create__(new Date(YEAR, JANUARY, LAST_DAY_OF_JANUARY), false).asOriginalType3__();
      const result = DateValue.fromOriginalType3__(DurationValue.create__(1, 1, 1, 0, 0, 0, 0).addToDate(original));
      expect(result).not.toBe(original);
      expect(result.time).toBe(false);
      // 2025-01-31 plus one month overflows to 2025-03-03, plus one day is 2025-03-04.
      expect(result.date.getTime()).toBe(new Date(YEAR + 1, MARCH, 4).getTime());
    });

    it('should subtract and switch the time on for any time component', () => {
      const original = DateValue.create__(new Date(YEAR, JANUARY, LAST_DAY_OF_JANUARY, NOON), false).asOriginalType3__();
      const timeCases: [number, number, number, number][] = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
      for (const [hours, minutes, seconds, milliseconds] of timeCases) {
        const duration = DurationValue.create__(0, 0, 0, hours, minutes, seconds, milliseconds);
        const result = DateValue.fromOriginalType3__(duration.addToDate(original, true));
        expect(result.time).toBe(true);
        expect(result.date.getTime()).toBe(new Date(YEAR, JANUARY, LAST_DAY_OF_JANUARY, NOON - hours, -minutes, -seconds, -milliseconds).getTime());
      }
    });

    it('should keep the time of a value that has it', () => {
      const original = DateValue.create__(new Date(YEAR, JANUARY, LAST_DAY_OF_JANUARY), true).asOriginalType3__();
      const result = DateValue.fromOriginalType3__(DurationValue.create__(0, 0, 0, 0, 0, 0, 0).addToDate(original));
      expect(result.time).toBe(true);
    });
  });
});
