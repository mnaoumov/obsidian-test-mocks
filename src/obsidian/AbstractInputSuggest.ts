import type { App } from './App.ts';

import { noop } from '../internal/Noop.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private inputEl: HTMLInputElement | HTMLTextAreaElement;
  public constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
    super(app);
    this.inputEl = inputEl;
  }

  public getValue(): string {
    return this.inputEl.value;
  }

  public setLimit(_limit: number): this {
    return this;
  }

  public setValue(_value: string): void {
    noop();
  }
}
