import type { DropdownComponent as DropdownComponentOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { DropdownComponent } from './DropdownComponent.ts';

describe('DropdownComponent', () => {
  function createDropdown(): DropdownComponent {
    const containerEl = createDiv();
    return DropdownComponent.create__(containerEl);
  }

  it('should create an instance via create__', () => {
    const dropdown = createDropdown();
    expect(dropdown).toBeInstanceOf(DropdownComponent);
  });

  it('should create selectEl as child of containerEl', () => {
    const containerEl = createDiv();
    const dropdown = DropdownComponent.create__(containerEl);
    expect(dropdown.selectEl.parentElement).toBe(containerEl);
  });

  it('should throw when accessing an unmocked property', () => {
    const dropdown = createDropdown();
    const record = ensureGenericObject(dropdown);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in DropdownComponent. To override, assign a value first: mock.nonExistentProperty = ...'
    );
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const dropdown = createDropdown();
      const original: DropdownComponentOriginal = dropdown.asOriginalType3__();
      expect(original).toBe(dropdown);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const dropdown = createDropdown();
      const mock = DropdownComponent.fromOriginalType3__(dropdown.asOriginalType3__());
      expect(mock).toBe(dropdown);
    });
  });

  describe('addOption', () => {
    it('should add an option to selectEl', () => {
      const dropdown = createDropdown();
      dropdown.addOption('val1', 'Display 1');
      const options = dropdown.selectEl.querySelectorAll('option');
      expect(options).toHaveLength(1);
      expect(options[0]?.value).toBe('val1');
      expect(options[0]?.text).toBe('Display 1');
    });

    it('should return this for chaining', () => {
      const dropdown = createDropdown();
      expect(dropdown.addOption('v', 'd')).toBe(dropdown);
    });
  });

  describe('addOptions', () => {
    it('should add multiple options', () => {
      const dropdown = createDropdown();
      const options = { a: 'Alpha', b: 'Beta' };
      dropdown.addOptions(options);
      const optionEls = dropdown.selectEl.querySelectorAll('option');
      expect(optionEls).toHaveLength(Object.keys(options).length);
    });

    it('should return this for chaining', () => {
      const dropdown = createDropdown();
      expect(dropdown.addOptions({})).toBe(dropdown);
    });
  });

  describe('getValue', () => {
    it('should return the selectEl value', () => {
      const dropdown = createDropdown();
      dropdown.addOption('foo', 'Foo');
      dropdown.selectEl.value = 'foo';
      expect(dropdown.getValue()).toBe('foo');
    });
  });

  describe('setValue', () => {
    it('should set the selectEl value', () => {
      const dropdown = createDropdown();
      dropdown.addOption('bar', 'Bar');
      dropdown.setValue('bar');
      expect(dropdown.selectEl.value).toBe('bar');
    });

    it('should invoke the change callback', () => {
      const dropdown = createDropdown();
      dropdown.addOption('x', 'X');
      const cb = vi.fn();
      dropdown.onChange(cb);
      dropdown.setValue('x');
      expect(cb).toHaveBeenCalledWith('x');
    });

    it('should return this for chaining', () => {
      const dropdown = createDropdown();
      expect(dropdown.setValue('v')).toBe(dropdown);
    });
  });

  describe('onChange', () => {
    it('should register a callback invoked on setValue', () => {
      const dropdown = createDropdown();
      dropdown.addOption('a', 'A');
      const cb = vi.fn();
      dropdown.onChange(cb);
      dropdown.setValue('a');
      expect(cb).toHaveBeenCalledWith('a');
    });

    it('should return this for chaining', () => {
      const dropdown = createDropdown();
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Testing chaining with noop callback.
      expect(dropdown.onChange(() => {})).toBe(dropdown);
    });
  });

  describe('simulateChange__', () => {
    it('should trigger the change callback', () => {
      const dropdown = createDropdown();
      dropdown.addOption('val', 'Val');
      dropdown.setValue('val');
      const cb = vi.fn();
      dropdown.onChange(cb);
      dropdown.simulateChange__();
      expect(cb).toHaveBeenCalledWith('val');
    });

    it('should not throw if no callback is registered', () => {
      const dropdown = createDropdown();
      expect(() => {
        dropdown.simulateChange__();
      }).not.toThrow();
    });
  });
});
