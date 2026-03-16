import {
  describe,
  expect,
  it
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { AbstractInputSuggest } from './AbstractInputSuggest.ts';
import { App } from './App.ts';

class ConcreteInputSuggest extends AbstractInputSuggest<string> {
  public override getSuggestions(_query: string): string[] {
    return ['suggestion'];
  }

  public override renderSuggestion(_value: string, _el: HTMLElement): void {
    noop();
  }

  public override selectSuggestion(_value: string, _evt: KeyboardEvent | MouseEvent): void {
    noop();
  }
}

describe('AbstractInputSuggest', () => {
  function createSuggestWithInput(el: HTMLDivElement | HTMLInputElement): ConcreteInputSuggest {
    const app = App.createConfigured__();
    return new ConcreteInputSuggest(app, el);
  }

  it('should create an instance with HTMLInputElement', () => {
    const input = createEl('input');
    const suggest = createSuggestWithInput(input);
    expect(suggest).toBeInstanceOf(AbstractInputSuggest);
  });

  it('should create an instance with HTMLDivElement', () => {
    const div = createDiv();
    const suggest = createSuggestWithInput(div);
    expect(suggest).toBeInstanceOf(AbstractInputSuggest);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance', () => {
      const input = createEl('input');
      const suggest = createSuggestWithInput(input);
      const original = suggest.asOriginalType2__();
      expect(original).toBe(suggest);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const input = createEl('input');
      const suggest = createSuggestWithInput(input);
      const mock = AbstractInputSuggest.fromOriginalType2__(suggest.asOriginalType2__());
      expect(mock).toBe(suggest);
    });
  });

  describe('getValue', () => {
    it('should return value from HTMLInputElement', () => {
      const input = createEl('input');
      input.value = 'test value';
      const suggest = createSuggestWithInput(input);
      expect(suggest.getValue()).toBe('test value');
    });

    it('should return textContent from HTMLDivElement', () => {
      const div = createDiv();
      div.textContent = 'div content';
      const suggest = createSuggestWithInput(div);
      expect(suggest.getValue()).toBe('div content');
    });
  });

  describe('setValue', () => {
    it('should set value on HTMLInputElement', () => {
      const input = createEl('input');
      const suggest = createSuggestWithInput(input);
      suggest.setValue('new value');
      expect(input.value).toBe('new value');
    });

    it('should set textContent on HTMLDivElement', () => {
      const div = createDiv();
      const suggest = createSuggestWithInput(div);
      suggest.setValue('new content');
      expect(div.textContent).toBe('new content');
    });
  });

  describe('constructor2__', () => {
    it('should be callable without throwing', () => {
      const input = createEl('input');
      const app = App.createConfigured__();
      const suggest = new ConcreteInputSuggest(app, input);
      expect(() => {
        suggest.constructor2__(app, input);
      }).not.toThrow();
    });
  });
});
