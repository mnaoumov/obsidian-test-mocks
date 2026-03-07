import type { App } from './App.ts';

import { noop } from '../internal/Noop.ts';
import { Scope } from './Scope.ts';

export abstract class PopoverSuggest<T> {
  public app: App;
  public scope: Scope;

  public constructor(app: App, scope?: Scope) {
    this.app = app;
    this.scope = scope ?? new Scope();
  }

  public close(): void {
    noop();
  }

  public abstract getSuggestions(query: string): T[] | Promise<T[]>;

  public open(): void {
    noop();
  }

  public abstract renderSuggestion(value: T, el: HTMLElement): void;

  public abstract selectSuggestion(value: T, evt: KeyboardEvent | MouseEvent): void;
}
