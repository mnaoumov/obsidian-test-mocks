import type { SecretComponent as SecretComponentOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

export class SecretComponent extends BaseComponent {
  private _onChange: ((value: string) => unknown) | null = null;

  public constructor(_app: App, _containerEl: HTMLElement) {
    super();
    const self = strictProxyForce(this);
    self.constructor2__(_app, _containerEl);
    return self;
  }

  public static create__(app: App, containerEl: HTMLElement): SecretComponent {
    return new SecretComponent(app, containerEl);
  }

  public static fromOriginalType2__(value: SecretComponentOriginal): SecretComponent {
    return strictProxyForce(value, SecretComponent);
  }

  public asOriginalType2__(): SecretComponentOriginal {
    return strictProxyForce<SecretComponentOriginal>(this);
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
