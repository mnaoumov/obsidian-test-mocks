import type { SuggestModal as SuggestModalOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { SuggestModal } from './SuggestModal.ts';

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
  it('should create an instance', () => {
    const app = App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal).toBeInstanceOf(SuggestModal);
  });

  it('should have an inputEl', () => {
    const app = App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal.inputEl).toBeInstanceOf(HTMLInputElement);
  });

  it('should have a resultContainerEl', () => {
    const app = App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal.resultContainerEl).toBeInstanceOf(HTMLElement);
  });

  describe('setPlaceholder', () => {
    it('should set the input placeholder', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      modal.setPlaceholder('Search...');
      expect(modal.inputEl.placeholder).toBe('Search...');
    });
  });

  describe('setInstructions', () => {
    it('should set instructions', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const instructions = [{ command: 'Enter', purpose: 'Select' }];
      modal.setInstructions(instructions);
      expect(modal.instructions__).toEqual(instructions);
    });
  });

  describe('selectSuggestion', () => {
    it('should call onChooseSuggestion and close', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const closeSpy = vi.spyOn(modal, 'close');
      const event = new MouseEvent('click');
      modal.selectSuggestion('alpha', event);
      expect(modal.onChooseSuggestion).toHaveBeenCalledWith('alpha', event);
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('onNoSuggestion', () => {
    it('should not throw', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      expect(() => {
        modal.onNoSuggestion();
      }).not.toThrow();
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const original: SuggestModalOriginal<string> = modal.asOriginalType2__();
      expect(original).toBe(modal);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      const mock = SuggestModal.fromOriginalType2__(modal.asOriginalType2__());
      expect(mock).toBe(modal);
    });
  });
});
