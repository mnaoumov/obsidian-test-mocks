import type { AbstractInputSuggest as AbstractInputSuggestOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PopoverSuggest } from './PopoverSuggest.ts';

export abstract class AbstractInputSuggest<T> extends PopoverSuggest<T> {
  private readonly inputEl: HTMLInputElement | HTMLTextAreaElement;
  public constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement) {
    super(app);
    this.inputEl = inputEl;
    const self = strictMock(this);
    self.constructor2__(app, inputEl);
    return self;
  }

  public override asOriginalType__(): AbstractInputSuggestOriginal<T> {
    return castTo<AbstractInputSuggestOriginal<T>>(this);
  }

  public constructor2__(_app: App, _inputEl: HTMLInputElement | HTMLTextAreaElement): void {
    noop();
  }

  public getValue(): string {
    return this.inputEl.value;
  }

  public setValue(value: string): void {
    this.inputEl.value = value;
  }
}
