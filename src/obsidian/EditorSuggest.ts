// eslint-disable-next-line capitalized-comments -- dprint-ignore directive must be lowercase.
// dprint-ignore -- Alias sort order differs from original name order.
import type {
  Editor,
  EditorPosition,
  EditorSuggestContext,
  EditorSuggest as EditorSuggestOriginal,
  EditorSuggestTriggerInfo,
  Instruction,
  TFile
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

const DEFAULT_LIMIT = 100;

export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
  public instructions: Instruction[] = [];
  public limit = DEFAULT_LIMIT;

  public constructor(app: App) {
    super(app);
    return strictMock(this);
  }

  public override asOriginalType__(): EditorSuggestOriginal<T> {
    return castTo<EditorSuggestOriginal<T>>(this);
  }

  public abstract override getSuggestions(_context: EditorSuggestContext): Promise<T[]> | T[];

  public abstract onTrigger(cursor: EditorPosition, editor: Editor, file: null | TFile): EditorSuggestTriggerInfo | null;

  public abstract override renderSuggestion(value: T, el: HTMLElement): void;

  public abstract override selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;

  public setInstructions(instructions: Instruction[]): void {
    this.instructions = instructions;
  }
}
