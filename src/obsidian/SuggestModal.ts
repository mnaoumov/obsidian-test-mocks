import type {
  Instruction,
  SuggestModal as SuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Modal } from './Modal.ts';

const DEFAULT_LIMIT = 100;

export abstract class SuggestModal<T> extends Modal {
  public emptyStateText = 'No results found.';
  public inputEl: HTMLInputElement;
  public instructions: Instruction[] = [];
  public limit = DEFAULT_LIMIT;
  public resultContainerEl: HTMLElement;

  public constructor(app: App) {
    super(app);
    this.inputEl = createEl('input');
    this.resultContainerEl = createDiv();
    return strictMock(this);
  }

  public override asOriginalType__(): SuggestModalOriginal<T> {
    return castTo<SuggestModalOriginal<T>>(this);
  }

  public override close(): void {
    super.close();
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

  public setInstructions(instructions: Instruction[]): void {
    this.instructions = instructions;
  }

  public setPlaceholder(placeholder: string): void {
    this.inputEl.placeholder = placeholder;
  }
}
