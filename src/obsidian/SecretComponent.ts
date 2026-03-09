import type { SecretComponent as SecretComponentOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  private static insideCreate__ = false;
  private _onChange: ((value: string) => unknown) | null = null;

  public constructor(_app: App, _containerEl: HTMLElement) {
    super();
    if (new.target === SecretComponent && !SecretComponent.insideCreate__) {
      return SecretComponent.create__(_app, _containerEl);
    }
  }

  public static create__(app: App, containerEl: HTMLElement): SecretComponent {
    SecretComponent.insideCreate__ = true;
    const instance = strictMock(new SecretComponent(app, containerEl));
    SecretComponent.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): SecretComponentOriginal {
    return castTo<SecretComponentOriginal>(this);
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
