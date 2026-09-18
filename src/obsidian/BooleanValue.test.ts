import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { BooleanValue } from './BooleanValue.ts';
import { RenderContext } from './RenderContext.ts';

describe('BooleanValue', () => {
  it('should carry the boolean icon', () => {
    expect(new BooleanValue().icon).toBe('lucide-check-square');
  });

  it('should default to false', () => {
    const value = new BooleanValue();
    expect(value.data).toBe(false);
  });

  it('should accept a value', () => {
    const value = new BooleanValue(true);
    expect(value.data).toBe(true);
  });

  it('should return false for isTruthy when false', () => {
    const value = new BooleanValue(false);
    expect(value.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when true', () => {
    const value = new BooleanValue(true);
    expect(value.isTruthy()).toBe(true);
  });

  it('should return "false" for toString when false', () => {
    const value = new BooleanValue(false);
    expect(String(value)).toBe('false');
  });

  it('should return "true" for toString when true', () => {
    const value = new BooleanValue(true);
    expect(String(value)).toBe('true');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = BooleanValue.create__();
      expect(value).toBeInstanceOf(BooleanValue);
      expect(value.data).toBe(false);
    });

    it('should create an instance with value via factory method', () => {
      const value = BooleanValue.create__(true);
      expect(value.data).toBe(true);
    });
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance', () => {
      const value = BooleanValue.create__();
      const original = value.asOriginalType4__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = BooleanValue.create__();
      const mock = BooleanValue.fromOriginalType4__(value.asOriginalType4__());
      expect(mock).toBe(value);
    });
  });

  describe('renderTo', () => {
    it.each([true, false])('should render a disabled checkbox checked %s', (data) => {
      const el = createDiv();
      new BooleanValue(data).renderTo(el, RenderContext.create__(App.createConfigured__()));
      const inputEl = el.find('input');
      expect(inputEl).toBeInstanceOf(HTMLInputElement);
      expect(inputEl.getAttr('type')).toBe('checkbox');
      expect(inputEl.hasAttribute('disabled')).toBe(true);
      expect((inputEl as HTMLInputElement).checked).toBe(data);
    });

    it('should set checked as a property, leaving the attribute absent as Obsidian does', () => {
      const el = createDiv();
      new BooleanValue(true).renderTo(el, RenderContext.create__(App.createConfigured__()));
      expect(el.find('input').hasAttribute('checked')).toBe(false);
    });
  });
});
