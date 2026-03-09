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
    return strictMock(this);
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- Abstract-like override point for subclasses.
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
