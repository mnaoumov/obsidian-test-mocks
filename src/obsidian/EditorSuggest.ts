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

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
  public instructions: Instruction[] = [];
  public limit = 100;

  public constructor(app: App) {
    super(app);
    return strictMock(this);
  }

  public override asOriginalType__(): EditorSuggestOriginal<T> {
    return castTo<EditorSuggestOriginal<T>>(this);
  }

  public abstract override getSuggestions(context: EditorSuggestContext): Promise<T[]> | T[];

  public abstract onTrigger(cursor: EditorPosition, editor: Editor, file: null | TFile): EditorSuggestTriggerInfo | null;

  public abstract override renderSuggestion(value: T, el: HTMLElement): void;

  public abstract override selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;

  public setInstructions(instructions: Instruction[]): void {
    this.instructions = instructions;
  }
}
