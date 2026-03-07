import type { Instruction } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/Noop.ts';
import { Modal } from './Modal.ts';

export abstract class SuggestModal<T> extends Modal {
  public emptyStateText = 'No results found.';
  public inputEl: HTMLInputElement = createEl('input');
  public limit = 100;
  public resultContainerEl: HTMLElement = createDiv();

  public constructor(app: App) {
    super(app);
  }

  public override close(): void {
    super.close();
  }

  public abstract getSuggestions(query: string): T[] | Promise<T[]>;

  public abstract onChooseSuggestion(item: T, evt: KeyboardEvent | MouseEvent): void;

  public onNoSuggestion(): void {
    noop();
  }

  public abstract renderSuggestion(value: T, el: HTMLElement): void;

  public selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void {
    this.onChooseSuggestion(value, evt);
    this.close();
  }

  public setInstructions(_instructions: Instruction[]): void {
    noop();
  }

  public setPlaceholder(_placeholder: string): void {
    noop();
  }
}
