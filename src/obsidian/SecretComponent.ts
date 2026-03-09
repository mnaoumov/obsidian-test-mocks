import type { SecretComponent as SecretComponentOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  private _onChange: ((value: string) => unknown) | null = null;

  public constructor(_app: App, _containerEl: HTMLElement) {
    super();
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
