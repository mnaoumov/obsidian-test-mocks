import type {
  Instruction as InstructionOriginal,
  SuggestModal as SuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Modal } from './Modal.ts';

const DEFAULT_LIMIT = 100;

export abstract class SuggestModal<T> extends Modal {
  public emptyStateText = 'No results found.';
  public inputEl: HTMLInputElement;
  public instructions__: InstructionOriginal[] = [];
  public limit = DEFAULT_LIMIT;
  public resultContainerEl: HTMLElement;

  public constructor(app: App) {
    super(app);
    this.inputEl = createEl('input');
    this.resultContainerEl = createDiv();
    const self = strictMock(this);
    self.constructor2__(app);
    return self;
  }

  public static override fromOriginalType__<T>(value: SuggestModalOriginal<T>): SuggestModal<T> {
    return castTo<SuggestModal<T>>(value);
  }

  public override asOriginalType__(): SuggestModalOriginal<T> {
    return castTo<SuggestModalOriginal<T>>(this);
  }

  public override close(): void {
    super.close();
  }

  public constructor2__(_app: App): void {
    noop();
  }

  public abstract getSuggestions(_query: string): Promise<T[]> | T[];

  public abstract onChooseSuggestion(item: T, evt: KeyboardEvent | MouseEvent): void;

  public onNoSuggestion(): void {
    noop();
  }

  public abstract renderSuggestion(value: T, _el: HTMLElement): void;

  public selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void {
    this.onChooseSuggestion(value, evt);
    this.close();
  }

  public setInstructions(instructions: InstructionOriginal[]): void {
    this.instructions__ = instructions;
  }

  public setPlaceholder(placeholder: string): void {
    this.inputEl.placeholder = placeholder;
  }
}
