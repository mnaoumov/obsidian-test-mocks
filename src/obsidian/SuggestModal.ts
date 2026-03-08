import { castTo } from '../internal/Cast.ts';
import type {
  Instruction,
  SuggestModal as RealSuggestModal
} from 'obsidian';

import type { App } from './App.ts';

import {
  strictMock
} from '../internal/StrictMock.ts';
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
    const mock = strictMock(this);
    SuggestModal.constructor__(mock, app);
    return mock;
  }

  public static override constructor__(_instance: SuggestModal<unknown>, _app: App): void {
    // Spy hook.
  }

  public override close(): void {
    super.close();
  }

  public abstract getSuggestions(query: string): T[] | Promise<T[]>;

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

  public override asReal__(): RealSuggestModal<T> {
    return castTo<RealSuggestModal<T>>(this);
  }
}
