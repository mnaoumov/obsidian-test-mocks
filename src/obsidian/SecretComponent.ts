import { castTo } from '../internal/Cast.ts';
import type { SecretComponent as RealSecretComponent } from 'obsidian';

import type { App } from './App.ts';

import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  private _onChange: ((value: string) => unknown) | null = null;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Match obsidian.d.ts constructor signature.
  public constructor(_app: App, _containerEl: HTMLElement) {
    super();
  }

  public onChange(callback: (value: string) => unknown): this {
    this._onChange = callback;
    return this;
  }

  public setValue(value: string): this {
    this._onChange?.(value);
    return this;
  }

  public override asReal__(): RealSecretComponent {
    return castTo<RealSecretComponent>(this);
  }
}
