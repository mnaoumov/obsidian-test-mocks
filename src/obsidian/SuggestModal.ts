import type {
  Instruction,
  SuggestModal as SuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Modal } from './Modal.ts';

export abstract class SuggestModal<T> extends Modal {
  public emptyStateText = 'No results found.';
  public inputEl: HTMLInputElement;
  public instructions: Instruction[] = [];
  public limit = 100;
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

  public abstract getSuggestions(query: string): Promise<T[]> | T[];

  public abstract onChooseSuggestion(item: T, evt: KeyboardEvent | MouseEvent): void;

  public onNoSuggestion(): void {
  }

  public abstract renderSuggestion(value: T, el: HTMLElement): void;

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
