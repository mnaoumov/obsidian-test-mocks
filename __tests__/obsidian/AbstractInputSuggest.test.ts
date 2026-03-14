import {
  describe,
  expect,
  it
} from 'vitest';

import { AbstractInputSuggest } from '../../src/obsidian/AbstractInputSuggest.ts';
import { App } from '../../src/obsidian/App.ts';

class ConcreteInputSuggest extends AbstractInputSuggest<string> {
  public override getSuggestions(_query: string): string[] {
    return ['suggestion'];
  }

  public override renderSuggestion(_value: string, _el: HTMLElement): void {
    // Intentionally empty for testing.
  }

  public override selectSuggestion(_value: string, _evt: KeyboardEvent | MouseEvent): void {
    // Intentionally empty for testing.
  }
}

describe('AbstractInputSuggest', () => {
  async function createSuggestWithInput(el: HTMLDivElement | HTMLInputElement): Promise<ConcreteInputSuggest> {
    const app = await App.createConfigured__();
    return new ConcreteInputSuggest(app, el);
  }

  it('should create an instance with HTMLInputElement', async () => {
    const input = createEl('input');
    const suggest = await createSuggestWithInput(input);
    expect(suggest).toBeInstanceOf(AbstractInputSuggest);
  });

  it('should create an instance with HTMLDivElement', async () => {
    const div = createDiv();
    const suggest = await createSuggestWithInput(div);
    expect(suggest).toBeInstanceOf(AbstractInputSuggest);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', async () => {
      const input = createEl('input');
      const suggest = await createSuggestWithInput(input);
      const original = suggest.asOriginalType__();
      expect(original).toBe(suggest);
    });
  });

  describe('getValue', () => {
    it('should return value from HTMLInputElement', async () => {
      const input = createEl('input');
      input.value = 'test value';
      const suggest = await createSuggestWithInput(input);
      expect(suggest.getValue()).toBe('test value');
    });

    it('should return textContent from HTMLDivElement', async () => {
      const div = createDiv();
      div.textContent = 'div content';
      const suggest = await createSuggestWithInput(div);
      expect(suggest.getValue()).toBe('div content');
    });

    it('should return empty string when div has no textContent', async () => {
      const div = createDiv();
      const suggest = await createSuggestWithInput(div);
      Object.defineProperty(div, 'textContent', { value: null });
      expect(suggest.getValue()).toBe('');
    });
  });

  describe('setValue', () => {
    it('should set value on HTMLInputElement', async () => {
      const input = createEl('input');
      const suggest = await createSuggestWithInput(input);
      suggest.setValue('new value');
      expect(input.value).toBe('new value');
    });

    it('should set textContent on HTMLDivElement', async () => {
      const div = createDiv();
      const suggest = await createSuggestWithInput(div);
      suggest.setValue('new content');
      expect(div.textContent).toBe('new content');
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', async () => {
      const input = createEl('input');
      const app = await App.createConfigured__();
      const suggest = new ConcreteInputSuggest(app, input);
      expect(() => {
        suggest.constructor2__(app, input);
      }).not.toThrow();
    });
  });
});
