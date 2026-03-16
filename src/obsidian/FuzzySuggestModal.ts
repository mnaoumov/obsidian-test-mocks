import type {
  FuzzyMatch as FuzzyMatchOriginal,
  FuzzySuggestModal as FuzzySuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { Modal } from './Modal.ts';

export abstract class FuzzySuggestModal<T> extends Modal {
  public inputEl: HTMLInputElement;

  public constructor(app: App) {
    super(app);
    this.inputEl = createEl('input');
    const self = createMockOfUnsafe(this);
    self.constructor2__(app);
    return self;
  }

  public static fromOriginalType2__<T>(value: FuzzySuggestModalOriginal<T>): FuzzySuggestModal<T> {
    return createMockOfUnsafe<FuzzySuggestModal<T>>(value);
  }

  public asOriginalType2__(): FuzzySuggestModalOriginal<T> {
    return createMockOfUnsafe<FuzzySuggestModalOriginal<T>>(this);
  }

  public constructor2__(_app: App): void {
    noop();
  }

  public getItems(): T[] {
    return [];
  }

  public getItemText(_item: T): string {
    return '';
  }

  public onChooseItem(_item: T, _evt: KeyboardEvent | MouseEvent): void {
    noop();
  }

  public selectSuggestion(value: FuzzyMatchOriginal<T>, evt: KeyboardEvent | MouseEvent): void {
    this.onChooseItem(value.item, evt);
    this.close();
  }

  public setPlaceholder(placeholder: string): void {
    this.inputEl.placeholder = placeholder;
  }
}
