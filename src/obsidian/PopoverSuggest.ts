import type { PopoverSuggest as PopoverSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Scope } from './Scope.ts';

export abstract class PopoverSuggest<T> {
  public app: App;
  public scope: Scope;
  private isOpen = false;

  public constructor(app: App, scope?: Scope) {
    this.app = app;
    this.scope = scope ?? Scope.create__();
    const self = strictMock(this);
    self.constructor__(app, scope);
    return self;
  }

  public asOriginalType__(): PopoverSuggestOriginal<T> {
    return castTo<PopoverSuggestOriginal<T>>(this);
  }

  public close(): void {
    this.isOpen = false;
  }

  public constructor__(_app: App, _scope?: Scope): void {
    noop();
  }

  public isOpen__(): boolean {
    return this.isOpen;
  }

  public open(): void {
    this.isOpen = true;
  }

  public abstract renderSuggestion(value: T, el: HTMLElement): void;

  public abstract selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;

  protected abstract getSuggestions(query: unknown): Promise<T[]> | T[];
}
