import type {
  FuzzyMatch as FuzzyMatchOriginal,
  FuzzySuggestModal as FuzzySuggestModalOriginal
} from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { SuggestModal } from './SuggestModal.ts';

export abstract class FuzzySuggestModal<T> extends SuggestModal<FuzzyMatchOriginal<T>> {
  public constructor(app: App) {
    super(app);
    const self = strictProxy(this);
    self.constructor3__(app);
    return self;
  }

  public static fromOriginalType3__<T>(value: FuzzySuggestModalOriginal<T>): FuzzySuggestModal<T> {
    return strictProxy<FuzzySuggestModal<T>>(value);
  }

  public asOriginalType3__(): FuzzySuggestModalOriginal<T> {
    return strictProxy<FuzzySuggestModalOriginal<T>>(this);
  }

  public constructor3__(_app: App): void {
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

  public override onChooseSuggestion(item: FuzzyMatchOriginal<T>, evt: KeyboardEvent | MouseEvent): void {
    this.onChooseItem(item.item, evt);
  }
}
