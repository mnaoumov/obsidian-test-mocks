import type {
  Editor as EditorOriginal,
  EditorPosition as EditorPositionOriginal,
  EditorSuggestContext as EditorSuggestContextOriginal,
  EditorSuggest as EditorSuggestOriginal,
  EditorSuggestTriggerInfo as EditorSuggestTriggerInfoOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { EditorSuggest } from './EditorSuggest.ts';

class ConcreteEditorSuggest extends EditorSuggest<string> {
  public override getSuggestions(_context: EditorSuggestContextOriginal): string[] {
    return ['suggestion'];
  }

  public override onTrigger(
    _cursor: EditorPositionOriginal,
    _editor: EditorOriginal,
    _file: null | TFileOriginal
  ): EditorSuggestTriggerInfoOriginal | null {
    return null;
  }

  public override renderSuggestion(_value: string, _el: HTMLElement): void {
    noop();
  }

  public override selectSuggestion(_value: string, _evt: KeyboardEvent | MouseEvent): void {
    noop();
  }
}

describe('EditorSuggest', () => {
  function createSuggest(): ConcreteEditorSuggest {
    const app = App.createConfigured__();
    return new ConcreteEditorSuggest(app);
  }

  it('should create an instance', () => {
    const suggest = createSuggest();
    expect(suggest).toBeInstanceOf(EditorSuggest);
  });

  it('should throw when accessing an unmocked property', () => {
    const suggest = createSuggest();
    const record = ensureGenericObject(suggest);
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const suggest = createSuggest();
      const original: EditorSuggestOriginal<string> = suggest.asOriginalType2__();
      expect(original).toBe(suggest);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const suggest = createSuggest();
      const mock = EditorSuggest.fromOriginalType2__(suggest.asOriginalType2__());
      expect(mock).toBe(suggest);
    });
  });

  describe('limit', () => {
    it('should default to 100', () => {
      const suggest = createSuggest();
      const DEFAULT_LIMIT = 100;
      expect(suggest.limit).toBe(DEFAULT_LIMIT);
    });
  });

  describe('setInstructions', () => {
    it('should store the instructions', () => {
      const suggest = createSuggest();
      const instructions = [{ command: 'Enter', purpose: 'Select' }];
      suggest.setInstructions(instructions);
      expect(suggest.instructions__).toBe(instructions);
    });
  });
});
