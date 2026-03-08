import type { App } from './App.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { Scope } from './Scope.ts';

export abstract class PopoverSuggest<T> {
  public app: App;
  public scope: Scope;
  private _isOpen = false;

  public constructor(app: App, scope?: Scope) {
    this.app = app;
    this.scope = scope ?? Scope.create__();
    const mock = strictMock(this);
    PopoverSuggest.constructor__(mock, app, scope);
    return mock;
  }

  public static constructor__(_instance: PopoverSuggest<unknown>, ..._args: unknown[]): void {
    // Spy hook.
  }

  public close(): void {
    this._isOpen = false;
  }

  protected abstract getSuggestions(query: unknown): T[] | Promise<T[]>;

  public isOpen(): boolean {
    return this._isOpen;
  }

  public open(): void {
    this._isOpen = true;
  }

  public abstract renderSuggestion(value: T, el: HTMLElement): void;

  public abstract selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;
}
