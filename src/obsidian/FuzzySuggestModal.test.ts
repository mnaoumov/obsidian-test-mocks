import type { FuzzySuggestModal as FuzzySuggestModalOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { App } from './App.ts';
import { FuzzySuggestModal } from './FuzzySuggestModal.ts';

class ConcreteFuzzySuggestModal extends FuzzySuggestModal<string> {
  public override getItems(): string[] {
    return ['alpha', 'beta', 'gamma'];
  }

  public override getItemText(item: string): string {
    return item;
  }

  public override onChooseItem(_item: string, _evt: KeyboardEvent | MouseEvent): void {
    noop();
  }
}

// Tests the base class default implementations
class DefaultFuzzySuggestModal extends FuzzySuggestModal<string> {
}

describe('FuzzySuggestModal', () => {
  async function createModal(): Promise<ConcreteFuzzySuggestModal> {
    const app = await App.createConfigured__();
    return new ConcreteFuzzySuggestModal(app);
  }

  it('should create an instance', async () => {
    const modal = await createModal();
    expect(modal).toBeInstanceOf(FuzzySuggestModal);
  });

  it('should throw when accessing an unmocked property', async () => {
    const modal = await createModal();
    const record = modal as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow();
  });

  it('should have an inputEl', async () => {
    const modal = await createModal();
    expect(modal.inputEl).toBeInstanceOf(HTMLInputElement);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const modal = await createModal();
      const original: FuzzySuggestModalOriginal<string> = modal.asOriginalType__();
      expect(original).toBe(modal);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const modal = await createModal();
      const mock = FuzzySuggestModal.fromOriginalType__(modal.asOriginalType__());
      expect(mock).toBe(modal);
    });
  });

  describe('getItems', () => {
    it('should return items', async () => {
      const modal = await createModal();
      const items = modal.getItems();
      const EXPECTED_LENGTH = 3;
      expect(items).toHaveLength(EXPECTED_LENGTH);
    });
  });

  describe('getItemText', () => {
    it('should return the item text', async () => {
      const modal = await createModal();
      expect(modal.getItemText('alpha')).toBe('alpha');
    });
  });

  describe('setPlaceholder', () => {
    it('should set the placeholder on inputEl', async () => {
      const modal = await createModal();
      modal.setPlaceholder('Search...');
      expect(modal.inputEl.placeholder).toBe('Search...');
    });
  });

  describe('selectSuggestion', () => {
    it('should call onChooseItem and close', async () => {
      const modal = await createModal();
      const spy = vi.spyOn(modal, 'onChooseItem');
      const closeSpy = vi.spyOn(modal, 'close');
      const fuzzyMatch = { item: 'alpha', match: { matches: [], score: 0 } };
      modal.selectSuggestion(fuzzyMatch, new MouseEvent('click'));
      expect(spy).toHaveBeenCalledWith('alpha', expect.any(MouseEvent));
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('base class defaults', () => {
    it('should return empty array from getItems', async () => {
      const app = await App.createConfigured__();
      const modal = new DefaultFuzzySuggestModal(app);
      expect(modal.getItems()).toEqual([]);
    });

    it('should return empty string from getItemText', async () => {
      const app = await App.createConfigured__();
      const modal = new DefaultFuzzySuggestModal(app);
      expect(modal.getItemText('anything')).toBe('');
    });

    it('should not throw from onChooseItem', async () => {
      const app = await App.createConfigured__();
      const modal = new DefaultFuzzySuggestModal(app);
      expect(() => {
        modal.onChooseItem('anything', new MouseEvent('click'));
      }).not.toThrow();
    });
  });
});
