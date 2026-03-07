import type { Instruction } from 'obsidian';

import type { App } from './App.ts';

import { Modal } from './Modal.ts';

export abstract class SuggestModal<T> extends Modal {
  public emptyStateText = 'No results found.';
  public inputEl: HTMLInputElement = createEl('input');
  public instructions: Instruction[] = [];
  public limit = 100;
  public resultContainerEl: HTMLElement = createDiv();

  public constructor(app: App) {
    super(app);
    SuggestModal.__constructor(this, app);
  }

  public static override __constructor(_instance: SuggestModal<unknown>, _app: App): void {
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
}
