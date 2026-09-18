import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { DateValue } from './DateValue.ts';
import { NumberValue } from './NumberValue.ts';
import { RenderContext } from './RenderContext.ts';
import { StringValue } from './StringValue.ts';
import { moment } from './vars/moment.ts';

describe('DateValue', () => {
  describe('icon', () => {
    it('should be the clock when the value has its time', () => {
      expect(new DateValue(new Date(), true).icon).toBe('lucide-clock');
    });

    it('should be the calendar when the value has no time', () => {
      expect(new DateValue(new Date(), false).icon).toBe('lucide-calendar');
    });
  });

  describe('keys', () => {
    it('should add the eight date parts to the inherited keys', () => {
      expect(new DateValue(new Date(), false).keys()).toEqual([
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
        'timestamp'
      ]);
    });
  });

  describe('objectAccess', () => {
    const SAMPLE = new Date(2026, 8, 17, 13, 45, 6, 78);

    it('should answer each date part in local time, counting the month from one', () => {
      const value = new DateValue(SAMPLE);
      expect(value.objectAccess('year')?.toString()).toBe('2026');
      expect(value.objectAccess('month')?.toString()).toBe('9');
      expect(value.objectAccess('day')?.toString()).toBe('17');
      expect(value.objectAccess('hour')?.toString()).toBe('13');
      expect(value.objectAccess('minute')?.toString()).toBe('45');
      expect(value.objectAccess('second')?.toString()).toBe('6');
      expect(value.objectAccess('millisecond')?.toString()).toBe('78');
      expect(value.objectAccess('timestamp')?.toString()).toBe(String(SAMPLE.getTime()));
    });

    it('should ignore the key\'s case', () => {
      expect(new DateValue(SAMPLE).objectAccess('YEAR')?.toString()).toBe('2026');
    });

    it('should answer null for any other key', () => {
      expect(new DateValue(SAMPLE).objectAccess('week')).toBeNull();
    });
  });

  const YEAR = 2024;
  const JANUARY = 0;
  const DAY = 5;
  const HOURS = 9;
  const MINUTES = 8;
  const SECONDS = 7;

  it('should always be truthy', () => {
    const value = new DateValue(new Date());
    expect(value.isTruthy()).toBe(true);
  });

  it('should expose the wrapped date and time flag', () => {
    const date = new Date();
    const value = new DateValue(date, false);
    expect(value.date).toBe(date);
    expect(value.time).toBe(false);
  });

  it('should have its time by default', () => {
    expect(new DateValue(new Date()).time).toBe(true);
  });

  describe('toString', () => {
    it('should write January as month 01 without the time', () => {
      const value = new DateValue(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), false);
      expect(value.toString()).toBe('2024-01-05');
    });

    it('should append the zero-padded time when the value has it', () => {
      const value = new DateValue(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS));
      expect(value.toString()).toBe('2024-01-05T09:08:07');
    });

    it('should pad a year below 1000 to four digits', () => {
      const EARLY_YEAR = 900;
      const date = new Date(YEAR, JANUARY, DAY);
      date.setFullYear(EARLY_YEAR);
      expect(new DateValue(date, false).toString()).toBe('0900-01-05');
    });
  });

  describe('printDate and printTime', () => {
    it('should format the date and time parts separately', () => {
      const value = new DateValue(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS));
      expect(value.printDate()).toBe('2024-01-05');
      expect(value.printTime()).toBe('09:08:07');
    });
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = DateValue.create__(new Date());
      expect(value).toBeInstanceOf(DateValue);
      expect(value.time).toBe(true);
    });

    it('should create an instance with showTime', () => {
      const value = DateValue.create__(new Date(), false);
      expect(value.time).toBe(false);
    });
  });

  describe('dateOnly', () => {
    it('should return a value at local midnight without time', () => {
      const value = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), true);
      const result = value.dateOnly();
      expect(result).not.toBe(value);
      expect(result.time).toBe(false);
      expect(result.date.getTime()).toBe(new Date(YEAR, JANUARY, DAY).getTime());
      expect(String(result)).toBe('2024-01-05');
    });

    it('should return the same value when it has no time', () => {
      const value = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS), false);
      expect(value.dateOnly()).toBe(value);
    });
  });

  describe('equals', () => {
    it('should compare the instant and whether the time is shown', () => {
      const value = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), true);
      expect(value.equals(DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), true))).toBe(true);
      expect(value.equals(DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS + 1), true))).toBe(false);
      expect(value.equals(DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), false))).toBe(false);
    });

    it('should separate two instants that print identically', () => {
      const MILLISECOND = 1;
      const a = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS, 0), true);
      const b = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS, MILLISECOND), true);
      expect(String(a)).toBe(String(b));
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('looseEquals', () => {
    it('should compare the instant when both sides show their time', () => {
      const value = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), true);
      expect(value.looseEquals(DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), true))).toBe(true);
      expect(value.looseEquals(DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS + 1), true))).toBe(false);
    });

    it('should compare the day alone when either side hides its time', () => {
      const withTime = DateValue.create__(new Date(YEAR, JANUARY, DAY, HOURS, MINUTES, SECONDS), true);
      const withoutTime = DateValue.create__(new Date(YEAR, JANUARY, DAY), false);
      expect(withTime.equals(withoutTime)).toBe(false);
      expect(withTime.looseEquals(withoutTime)).toBe(true);
      expect(withoutTime.looseEquals(withTime)).toBe(true);
      expect(withoutTime.looseEquals(DateValue.create__(new Date(YEAR, JANUARY, DAY + 1), false))).toBe(false);
    });

    it('should parse a string value into a date first', () => {
      const value = DateValue.create__(new Date(YEAR, JANUARY, DAY), false);
      expect(value.looseEquals(new StringValue('2024-01-05'))).toBe(true);
      expect(value.looseEquals(new StringValue('2024-01-06'))).toBe(false);
    });

    it('should answer false for a string that is no date, and for a value of another type', () => {
      const value = DateValue.create__(new Date(YEAR, JANUARY, DAY), false);
      expect(value.looseEquals(new StringValue('not a date'))).toBe(false);
      expect(value.looseEquals(new NumberValue(0))).toBe(false);
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
    it('should parse a date as local midnight without time', () => {
      const result = DateValue.parseFromString('2024-01-15');
      expect(result?.time).toBe(false);
      expect(result?.date.getTime()).toBe(new Date(YEAR, JANUARY, 15).getTime());
    });

    it('should parse a date-time with a T or a space as a value with time', () => {
      for (const input of ['2024-01-15T10:30', '2024-01-15 10:30:45', '2024-01-15T10:30:45.123Z', '2024-01-15T10:30+02:00']) {
        const result = DateValue.parseFromString(input);
        expect(result?.time).toBe(true);
        expect(result?.date.getTime()).toBe(new Date(input).getTime());
      }
    });

    it('should return null for any other string', () => {
      for (const input of ['not a date', '2024-1-15', '2024-01-15T10', 'January 15, 2024', '2024-01-15 ']) {
        expect(DateValue.parseFromString(input)).toBeNull();
      }
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

  describe('renderTo', () => {
    it('should render a disabled datetime-local input when the time is shown', () => {
      const value = new DateValue(new Date(2024, 0, 2, 3, 4, 5));
      const el = createDiv();
      value.renderTo(el, RenderContext.create__(App.createConfigured__()));

      const inputEl = el.find('input') as HTMLInputElement;
      expect(inputEl.getAttr('type')).toBe('datetime-local');
      expect(inputEl.value).toBe(value.toString());
      expect(inputEl.getAttr('step')).toBe('any');
      expect(inputEl.hasAttribute('disabled')).toBe(true);
      expect(inputEl.className).toBe('metadata-input metadata-input-text mod-datetime');
    });

    it('should render a disabled date input when the time is hidden', () => {
      const value = new DateValue(new Date(2024, 0, 2), false);
      const el = createDiv();
      value.renderTo(el, RenderContext.create__(App.createConfigured__()));

      const inputEl = el.find('input') as HTMLInputElement;
      expect(inputEl.getAttr('type')).toBe('date');
      expect(inputEl.value).toBe('2024-01-02');
      expect(inputEl.className).toBe('metadata-input metadata-input-text mod-date');
    });
  });
});
