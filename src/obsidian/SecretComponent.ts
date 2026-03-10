import type { SecretComponent as SecretComponentOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  private _onChange: ((value: string) => unknown) | null = null;

  public constructor(_app: App, _containerEl: HTMLElement) {
    super();
    const self = strictMock(this);
    self.constructor2__(_app, _containerEl);
    return self;
  }

  public static create__(app: App, containerEl: HTMLElement): SecretComponent {
    return new SecretComponent(app, containerEl);
  }

  public override asOriginalType__(): SecretComponentOriginal {
    return castTo<SecretComponentOriginal>(this);
  }

  public constructor2__(_app: App, _containerEl: HTMLElement): void {
    noop();
  }

  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public setValue(value: string): this {
    this._onChange?.(value);
    return this;
  }
}
