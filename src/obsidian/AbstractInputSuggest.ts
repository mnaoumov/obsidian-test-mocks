import type { App } from './App.ts';

import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private inputEl: HTMLInputElement | HTMLTextAreaElement;
  public constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
    super(app);
    this.inputEl = inputEl;
    AbstractInputSuggest.__constructor(this, app, inputEl);
  }

  public static override __constructor(_instance: AbstractInputSuggest<unknown>, _app: App, _inputEl: HTMLInputElement | HTMLTextAreaElement): void {
    // Spy hook.
  }

  public getValue(): string {
    return this.inputEl.value;
  }

  public setLimit(_limit: number): this {
    return this;
  }

  public setValue(value: string): void {
    this.inputEl.value = value;
  }
}
