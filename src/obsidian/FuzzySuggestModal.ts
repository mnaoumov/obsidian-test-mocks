import type {
  FuzzyMatch,
  FuzzySuggestModal as FuzzySuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Modal } from './Modal.ts';

export abstract class FuzzySuggestModal<T> extends Modal {
  public inputEl: HTMLInputElement;

  public constructor(app: App) {
    super(app);
    this.inputEl = createEl('input');
    const mock = strictMock(this);
    FuzzySuggestModal.constructor__(mock, app);
    return mock;
  }

  public static override constructor__(_instance: FuzzySuggestModal<unknown>, _app: App): void {
    // Spy hook.
  }

  public override asOriginalType__(): FuzzySuggestModalOriginal<T> {
    return castTo<FuzzySuggestModalOriginal<T>>(this);
  }

  public getItems(): T[] {
    return [];
  }

  public getItemText(_item: T): string {
    return '';
  }

  public onChooseItem(_item: T, _evt: KeyboardEvent | MouseEvent): void {
  }

  public selectSuggestion(value: FuzzyMatch<T>, evt: KeyboardEvent | MouseEvent): void {
    this.onChooseItem(value.item, evt);
    this.close();
  }

  public setPlaceholder(placeholder: string): void {
    this.inputEl.placeholder = placeholder;
  }
}
