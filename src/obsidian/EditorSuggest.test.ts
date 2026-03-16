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

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
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
  async function createSuggest(): Promise<ConcreteEditorSuggest> {
    const app = await App.createConfigured__();
    return new ConcreteEditorSuggest(app);
  }

  it('should create an instance', async () => {
    const suggest = await createSuggest();
    expect(suggest).toBeInstanceOf(EditorSuggest);
  });

  it('should throw when accessing an unmocked property', async () => {
    const suggest = await createSuggest();
    const record = castTo<Record<string, unknown>>(suggest);
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const suggest = await createSuggest();
      const original: EditorSuggestOriginal<string> = suggest.asOriginalType2__();
      expect(original).toBe(suggest);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const suggest = await createSuggest();
      const mock = EditorSuggest.fromOriginalType2__(suggest.asOriginalType2__());
      expect(mock).toBe(suggest);
    });
  });

  describe('limit', () => {
    it('should default to 100', async () => {
      const suggest = await createSuggest();
      const DEFAULT_LIMIT = 100;
      expect(suggest.limit).toBe(DEFAULT_LIMIT);
    });
  });

  describe('setInstructions', () => {
    it('should store the instructions', async () => {
      const suggest = await createSuggest();
      const instructions = [{ command: 'Enter', purpose: 'Select' }];
      suggest.setInstructions(instructions);
      expect(suggest.instructions__).toBe(instructions);
    });
  });
});
