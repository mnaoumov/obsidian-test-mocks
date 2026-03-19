import type {
  FuzzyMatch as FuzzyMatchOriginal,
  FuzzySuggestModal as FuzzySuggestModalOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { FuzzySuggestModal } from './FuzzySuggestModal.ts';

class ConcreteFuzzySuggestModal extends FuzzySuggestModal<string> {
  public override getItems(): string[] {
    const items = super.getItems();
    items.push('alpha', 'beta', 'gamma');
    return items;
  }

  public override getItemText(item: string): string {
    return item;
  }

  public override getSuggestions(_query: string): FuzzyMatchOriginal<string>[] | Promise<FuzzyMatchOriginal<string>[]> {
    return [];
  }

  public override renderSuggestion(_value: FuzzyMatchOriginal<string>, _el: HTMLElement): void {
    noop();
  }
}

class MinimalFuzzySuggestModal extends FuzzySuggestModal<string> {
  public override getSuggestions(_query: string): FuzzyMatchOriginal<string>[] | Promise<FuzzyMatchOriginal<string>[]> {
    return [];
  }

  public override renderSuggestion(_value: FuzzyMatchOriginal<string>, _el: HTMLElement): void {
    noop();
  }
}

describe('FuzzySuggestModal', () => {
  function createModal(): FuzzySuggestModal<string> {
    const app = App.createConfigured__();
    return new ConcreteFuzzySuggestModal(app);
  }

  it('should create an instance', () => {
    const modal = createModal();
    expect(modal).toBeInstanceOf(FuzzySuggestModal);
  });

  it('should throw when accessing an unmocked property', () => {
    const modal = createModal();
    const record = ensureGenericObject(modal);
    expect(() => record['nonExistentProperty']).toThrow();
  });

  it('should have an inputEl', () => {
    const modal = createModal();
    expect(modal.inputEl).toBeInstanceOf(HTMLInputElement);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const modal = createModal();
      const original: FuzzySuggestModalOriginal<string> = modal.asOriginalType3__();
      expect(original).toBe(modal);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const modal = createModal();
      const mock = FuzzySuggestModal.fromOriginalType2__(modal.asOriginalType2__());
      expect(mock).toBe(modal);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const modal = createModal();
      const mock = FuzzySuggestModal.fromOriginalType3__(modal.asOriginalType3__());
      expect(mock).toBe(modal);
    });
  });

  describe('constructor3__', () => {
    it('should be callable and spyable', () => {
      const spy = vi.spyOn(ConcreteFuzzySuggestModal.prototype, 'constructor3__');
      createModal();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });
  });

  describe('getItems', () => {
    it('should return items', () => {
      const modal = createModal();
      const items = modal.getItems();
      const EXPECTED_LENGTH = 3;
      expect(items).toHaveLength(EXPECTED_LENGTH);
    });
  });

  describe('getItemText', () => {
    it('should return the item text', () => {
      const modal = createModal();
      expect(modal.getItemText('alpha')).toBe('alpha');
    });
  });

  describe('setPlaceholder', () => {
    it('should set the placeholder on inputEl', () => {
      const modal = createModal();
      modal.setPlaceholder('Search...');
      expect(modal.inputEl.placeholder).toBe('Search...');
    });
  });

  describe('selectSuggestion', () => {
    it('should call onChooseItem and close', () => {
      const modal = createModal();
      const spy = vi.spyOn(modal, 'onChooseItem');
      const closeSpy = vi.spyOn(modal, 'close');
      const fuzzyMatch = { item: 'alpha', match: { matches: [], score: 0 } };
      modal.selectSuggestion(fuzzyMatch, new MouseEvent('click'));
      expect(spy).toHaveBeenCalledWith('alpha', expect.any(MouseEvent));
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('base class defaults', () => {
    it('should return empty array from getItems', () => {
      const app = App.createConfigured__();
      const modal = new MinimalFuzzySuggestModal(app);
      expect(modal.getItems()).toEqual([]);
    });

    it('should return empty string from getItemText', () => {
      const app = App.createConfigured__();
      const modal = new MinimalFuzzySuggestModal(app);
      expect(modal.getItemText('anything')).toBe('');
    });

    it('should not throw from onChooseItem', () => {
      const app = App.createConfigured__();
      const modal = new MinimalFuzzySuggestModal(app);
      expect(() => {
        modal.onChooseItem('anything', new MouseEvent('click'));
      }).not.toThrow();
    });
  });
});
