import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { DateValue } from './DateValue.ts';
import { RelativeDateValue } from './RelativeDateValue.ts';
import { RenderContext } from './RenderContext.ts';

const MILLISECONDS_IN_HOUR = 60 * 60 * 1000;

describe('RelativeDateValue', () => {
  it('should inherit the date icons, which follow the time rather than the class', () => {
    expect(RelativeDateValue.create2__(new Date(), true).icon).toBe('lucide-clock');
    expect(RelativeDateValue.create2__(new Date(), false).icon).toBe('lucide-calendar');
  });

  it('should create an instance via create2__', () => {
    const value = RelativeDateValue.create2__(new Date());
    expect(value).toBeInstanceOf(RelativeDateValue);
  });

  it('should accept showTime parameter', () => {
    const value = RelativeDateValue.create2__(new Date(), true);
    expect(value).toBeInstanceOf(RelativeDateValue);
  });

  it('should be truthy', () => {
    const value = RelativeDateValue.create2__(new Date());
    expect(value.isTruthy()).toBe(true);
  });

  describe('toString', () => {
    const DAYS_AGO = 3;
    const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

    it('should render the date relative to now, not in the absolute form', () => {
      const date = new Date(Date.now() - (DAYS_AGO * MILLISECONDS_IN_DAY));
      const value = RelativeDateValue.create2__(date);
      expect(String(value)).toBe(`${DAYS_AGO.toString()} days ago`);
      expect(String(value)).toBe(value.relative());
      expect(String(value)).not.toBe(new DateValue(date).toString());
    });

    it('should render relative to now for a value without its time too', () => {
      const date = new Date(Date.now() - (DAYS_AGO * MILLISECONDS_IN_DAY));
      const value = RelativeDateValue.create2__(date, false);
      expect(String(value)).toBe(`${DAYS_AGO.toString()} days ago`);
    });
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', () => {
      const value = RelativeDateValue.create2__(new Date());
      const original: RelativeDateValueOriginal = value.asOriginalType4__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = RelativeDateValue.create2__(new Date());
      const mock = RelativeDateValue.fromOriginalType4__(value.asOriginalType4__());
      expect(mock).toBe(value);
    });
  });

  describe('renderTo', () => {
    it('should render the relative text in a span rather than the base input', () => {
      const value = new RelativeDateValue(new Date(Date.now() - MILLISECONDS_IN_HOUR));
      const el = createDiv();
      value.renderTo(el, RenderContext.create__(App.createConfigured__()));

      expect(el.findAll('input')).toHaveLength(0);
      const spanEl = el.find('span');
      expect(spanEl.className).toBe('mod-datetime');
      expect(spanEl.textContent).toBe(value.relative());
    });

    it('should carry the mod-date class when the time is hidden', () => {
      const el = createDiv();
      new RelativeDateValue(new Date(), false).renderTo(el, RenderContext.create__(App.createConfigured__()));
      expect(el.find('span').className).toBe('mod-date');
    });
  });
});
