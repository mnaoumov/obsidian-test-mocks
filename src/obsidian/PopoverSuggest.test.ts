import type { PopoverSuggest as PopoverSuggestOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';
import { Scope } from './Scope.ts';

class ConcretePopoverSuggest extends PopoverSuggest<string> {
  public getSuggestions(_query: unknown): string[] {
    return [];
  }

  public renderSuggestion(_value: string, _el: HTMLElement): void {
    // Noop
  }

  public selectSuggestion(_value: string, _evt: KeyboardEvent | MouseEvent): void {
    // Noop
  }
}

describe('PopoverSuggest', () => {
  it('should create an instance with default scope', () => {
    const app = App.createConfigured__();
    const suggest = new ConcretePopoverSuggest(app);
    expect(suggest.app).toBe(app);
    expect(suggest.scope).toBeInstanceOf(Scope);
  });

  it('should accept a custom scope', () => {
    const app = App.createConfigured__();
    const scope = Scope.create__();
    const suggest = new ConcretePopoverSuggest(app, scope);
    expect(suggest.scope).toBe(scope);
  });

  describe('open / close / isOpen__', () => {
    it('should start closed', () => {
      const app = App.createConfigured__();
      const suggest = new ConcretePopoverSuggest(app);
      expect(suggest.isOpen__()).toBe(false);
    });

    it('should be open after open()', () => {
      const app = App.createConfigured__();
      const suggest = new ConcretePopoverSuggest(app);
      suggest.open();
      expect(suggest.isOpen__()).toBe(true);
    });

    it('should be closed after close()', () => {
      const app = App.createConfigured__();
      const suggest = new ConcretePopoverSuggest(app);
      suggest.open();
      suggest.close();
      expect(suggest.isOpen__()).toBe(false);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const suggest = new ConcretePopoverSuggest(app);
      const original: PopoverSuggestOriginal<string> = suggest.asOriginalType__();
      expect(original).toBe(suggest);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const suggest = new ConcretePopoverSuggest(app);
      const mock = PopoverSuggest.fromOriginalType__(suggest.asOriginalType__());
      expect(mock).toBe(suggest);
    });
  });
});
