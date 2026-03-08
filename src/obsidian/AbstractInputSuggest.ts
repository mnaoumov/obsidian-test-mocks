import type { AbstractInputSuggest as AbstractInputSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private readonly inputEl: HTMLInputElement | HTMLTextAreaElement;
  public constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
    super(app);
    this.inputEl = inputEl;
    const mock = strictMock(this);
    AbstractInputSuggest.constructor__(mock, app, inputEl);
    return mock;
  }

  public static override constructor__(_instance: AbstractInputSuggest<unknown>, _app: App, _inputEl: HTMLInputElement | HTMLTextAreaElement): void {
    // Spy hook.
  }

  public override asOriginalType__(): AbstractInputSuggestOriginal<T> {
    return castTo<AbstractInputSuggestOriginal<T>>(this);
  }

  public getValue(): string {
    return this.inputEl.value;
  }

  public setValue(value: string): void {
    this.inputEl.value = value;
  }
}
