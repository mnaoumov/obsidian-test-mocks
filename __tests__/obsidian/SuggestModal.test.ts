import type { SuggestModal as SuggestModalOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from '../../src/obsidian/App.ts';
import { SuggestModal } from '../../src/obsidian/SuggestModal.ts';

class ConcreteSuggestModal extends SuggestModal<string> {
  public onChooseSuggestion = vi.fn();

  public getSuggestions(_query: string): string[] {
    return ['alpha', 'beta'];
  }

  public renderSuggestion(_value: string, _el: HTMLElement): void {
    // Noop
  }
}

describe('SuggestModal', () => {
  it('should create an instance', async () => {
    const app = await App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal).toBeInstanceOf(SuggestModal);
  });

  it('should have an inputEl', async () => {
    const app = await App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal.inputEl).toBeInstanceOf(HTMLInputElement);
  });

  it('should have a resultContainerEl', async () => {
    const app = await App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal.resultContainerEl).toBeInstanceOf(HTMLElement);
  });

  describe('setPlaceholder', () => {
    it('should set the input placeholder', async () => {
      const app = await App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      modal.setPlaceholder('Search...');
      expect(modal.inputEl.placeholder).toBe('Search...');
    });
  });

  describe('setInstructions', () => {
    it('should set instructions', async () => {
      const app = await App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const instructions = [{ command: 'Enter', purpose: 'Select' }];
      modal.setInstructions(instructions);
      expect(modal.instructions__).toEqual(instructions);
    });
  });

  describe('selectSuggestion', () => {
    it('should call onChooseSuggestion and close', async () => {
      const app = await App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const closeSpy = vi.spyOn(modal, 'close');
      const event = new MouseEvent('click');
      modal.selectSuggestion('alpha', event);
      expect(modal.onChooseSuggestion).toHaveBeenCalledWith('alpha', event);
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('onNoSuggestion', () => {
    it('should not throw', async () => {
      const app = await App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      expect(() => {
        modal.onNoSuggestion();
      }).not.toThrow();
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const original: SuggestModalOriginal<string> = modal.asOriginalType__();
      expect(original).toBe(modal);
    });
  });
});
