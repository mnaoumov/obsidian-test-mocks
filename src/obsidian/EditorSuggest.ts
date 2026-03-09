// eslint-disable-next-line capitalized-comments -- dprint-ignore directive must be lowercase.
// dprint-ignore -- Alias sort order differs from original name order.
import type {
  Editor as EditorOriginal,
  EditorPosition as EditorPositionOriginal,
  EditorSuggestContext as EditorSuggestContextOriginal,
  EditorSuggest as EditorSuggestOriginal,
  EditorSuggestTriggerInfo as EditorSuggestTriggerInfoOriginal,
  Instruction as InstructionOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

const DEFAULT_LIMIT = 100;

export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
  public instructions__: InstructionOriginal[] = [];
  public limit = DEFAULT_LIMIT;

  public constructor(app: App) {
    super(app);
    return strictMock(this);
  }

  public override asOriginalType__(): EditorSuggestOriginal<T> {
    return castTo<EditorSuggestOriginal<T>>(this);
  }

  public abstract override getSuggestions(_context: EditorSuggestContextOriginal): Promise<T[]> | T[];

  public abstract onTrigger(cursor: EditorPositionOriginal, editor: EditorOriginal, file: null | TFileOriginal): EditorSuggestTriggerInfoOriginal | null;

  public abstract override renderSuggestion(value: T, el: HTMLElement): void;

  public abstract override selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;

  public setInstructions(instructions: InstructionOriginal[]): void {
    this.instructions__ = instructions;
  }
}
