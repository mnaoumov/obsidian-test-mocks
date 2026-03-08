import { castTo } from '../internal/Cast.ts';
import type { AbstractInputSuggest as RealAbstractInputSuggest } from 'obsidian';

import type { App } from './App.ts';

import {
  strictMock
} from '../internal/StrictMock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private inputEl: HTMLInputElement | HTMLTextAreaElement;
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

  public getValue(): string {
    return this.inputEl.value;
  }

  public setValue(value: string): void {
    this.inputEl.value = value;
  }

  public override asReal__(): RealAbstractInputSuggest<T> {
    return castTo<RealAbstractInputSuggest<T>>(this);
  }
}
