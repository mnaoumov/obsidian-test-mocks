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

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

const DEFAULT_LIMIT = 100;

export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
  public instructions__: InstructionOriginal[] = [];
  public limit = DEFAULT_LIMIT;

  public constructor(app: App) {
    super(app);
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  public static fromOriginalType2__<T>(value: EditorSuggestOriginal<T>): EditorSuggest<T> {
    return bridgeType<EditorSuggest<T>>(value);
  }

  public asOriginalType2__(): EditorSuggestOriginal<T> {
    return bridgeType<EditorSuggestOriginal<T>>(this);
  }

  public constructor2__(_app: App): void {
    noop();
  }

  public abstract override getSuggestions(_context: EditorSuggestContextOriginal): Promise<T[]> | T[];

  public abstract onTrigger(cursor: EditorPositionOriginal, editor: EditorOriginal, file: null | TFileOriginal): EditorSuggestTriggerInfoOriginal | null;

  public abstract override renderSuggestion(value: T, el: HTMLElement): void;

  public abstract override selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;

  public setInstructions(instructions: InstructionOriginal[]): void {
    this.instructions__ = instructions;
  }
}
