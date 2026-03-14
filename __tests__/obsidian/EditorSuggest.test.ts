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

import { App } from '../../src/obsidian/App.ts';
import { EditorSuggest } from '../../src/obsidian/EditorSuggest.ts';

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
    // Intentionally empty for testing.
  }

  public override selectSuggestion(_value: string, _evt: KeyboardEvent | MouseEvent): void {
    // Intentionally empty for testing.
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
    const record = suggest as unknown as Record<string, unknown>;
    expect(() => record['nonExistentProperty']).toThrow();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const suggest = await createSuggest();
      const original: EditorSuggestOriginal<string> = suggest.asOriginalType__();
      expect(original).toBe(suggest);
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
