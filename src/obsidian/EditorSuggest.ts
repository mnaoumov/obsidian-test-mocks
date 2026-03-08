import type {
  Editor,
  EditorPosition,
  EditorSuggest as RealEditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  Instruction,
  TFile
} from 'obsidian';

import type { App } from './App.ts';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
  public instructions: Instruction[] = [];
  public limit = 100;

  public constructor(app: App) {
    super(app);
    const mock = strictMock(this);
    EditorSuggest.constructor__(mock, app);
    return mock;
  }

  public static override constructor__(_instance: EditorSuggest<unknown>, _app: App): void {
    // Spy hook.
  }

  public abstract override getSuggestions(context: EditorSuggestContext): T[] | Promise<T[]>;

  public abstract onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null;

  public abstract override renderSuggestion(value: T, el: HTMLElement): void;

  public abstract override selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;

  public setInstructions(instructions: Instruction[]): void {
    this.instructions = instructions;
  }

  public override asReal__(): RealEditorSuggest<T> {
    return strictCastTo<RealEditorSuggest<T>>(this);
  }
}
