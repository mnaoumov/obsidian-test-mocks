import type { SuggestModal as SuggestModalOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { App } from './App.ts';
import { SuggestModal } from './SuggestModal.ts';

class ConcreteSuggestModal extends SuggestModal<string> {
  public onChooseSuggestion = vi.fn();

  public getSuggestions(_query: string): string[] {
    return ['alpha', 'beta'];
  }

  public renderSuggestion(_value: string, _el: HTMLElement): void {
    noop();
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

  it('should have an instructionsEl__', () => {
    const app = App.createConfigured__();
    const modal = new ConcreteSuggestModal(app);
    expect(modal.instructionsEl__).toBeInstanceOf(HTMLDivElement);
    expect(modal.instructionsEl__.classList.contains('prompt-instructions')).toBe(true);
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

    it('should render each instruction as a prompt-instruction with command and purpose spans', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      modal.setInstructions([
        { command: '↑↓', purpose: 'to navigate' },
        { command: '↵', purpose: 'to select' }
      ]);

      const promptInstructions = modal.instructionsEl__.findAll('.prompt-instruction');
      expect(promptInstructions).toHaveLength(2);

      const commandEls = modal.instructionsEl__.findAll('.prompt-instruction > span:nth-child(1)');
      const purposeEls = modal.instructionsEl__.findAll('.prompt-instruction > span:nth-child(2)');
      expect(commandEls.map((el) => el.textContent)).toEqual(['↑↓', '↵']);
      expect(purposeEls.map((el) => el.textContent)).toEqual(['to navigate', 'to select']);
      expect(commandEls.every((el) => el.classList.contains('prompt-instruction-command'))).toBe(true);
    });

    it('should attach instructionsEl to modalEl when instructions are present', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      modal.setInstructions([{ command: 'Enter', purpose: 'Select' }]);
      expect(modal.instructionsEl__.parentElement).toBe(modal.modalEl);
    });

    it('should re-render instructions on a subsequent call', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      modal.setInstructions([{ command: 'Enter', purpose: 'Select' }]);
      modal.setInstructions([{ command: 'Esc', purpose: 'Dismiss' }]);

      const commandEls = modal.instructionsEl__.findAll('.prompt-instruction > span:nth-child(1)');
      expect(commandEls.map((el) => el.textContent)).toEqual(['Esc']);
    });

    it('should detach instructionsEl when instructions are empty', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      modal.setInstructions([{ command: 'Enter', purpose: 'Select' }]);
      expect(modal.instructionsEl__.parentElement).toBe(modal.modalEl);

      modal.setInstructions([]);
      expect(modal.instructionsEl__.parentElement).toBeNull();
    });
  });

  describe('selectActiveSuggestion', () => {
    it('should not throw', () => {
      const app = App.createConfigured__();
      const modal = new ConcreteSuggestModal(app);
      expect(() => {
        modal.selectActiveSuggestion(new MouseEvent('click'));
      }).not.toThrow();
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
