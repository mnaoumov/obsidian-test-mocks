/**
 * @file
 *
 * Mock of Obsidian's `SecretComponent`, a control for choosing a secret from the app's secret storage.
 */

import type { SecretComponent as SecretComponentOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { BaseComponent } from './BaseComponent.ts';

/**
 * Mock of Obsidian's `SecretComponent`, a control whose value is the id of a secret in `SecretStorage`.
 *
 * Nothing is rendered. As in Obsidian, {@link SecretComponent.setValue} does not call the change callback, and there is no `getValue`: in Obsidian the
 * callback runs only when the user picks or clears a secret in its UI, which the mock does not render.
 */
export class SecretComponent extends BaseComponent {
  /**
   * The callback registered with {@link SecretComponent.onChange}, if any.
   */
  public changeCallback?: (value: string) => unknown;

  /**
   * Creates the secret control.
   *
   * @param app - The app instance.
   * @param containerEl - The element to create the control in; the mock renders nothing into it.
   */
  public constructor(app: App, containerEl: HTMLElement) {
    super();
    const self = strictProxy(this);
    self.constructor2__(app, containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a secret component, spyable via `vi.spyOn(SecretComponent, 'create__')`.
   *
   * @param app - The app instance.
   * @param containerEl - The element to create the control in.
   * @returns The new secret component.
   */
  public static create__(app: App, containerEl: HTMLElement): SecretComponent {
    return new SecretComponent(app, containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `SecretComponent` as this mock.
   *
   * @param value - The value typed as the original `SecretComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: SecretComponentOriginal): SecretComponent {
    return strictProxy(value, SecretComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `SecretComponent` type.
   *
   * @returns The same object, typed as the original `SecretComponent`.
   */
  public asOriginalType2__(): SecretComponentOriginal {
    return strictProxy<SecretComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(SecretComponent.prototype, 'constructor2__')`.
   *
   * @param _app - The app the component was created with.
   * @param _containerEl - The element the component was created in.
   */
  public constructor2__(_app: App, _containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Registers the callback run when the selected secret changes, replacing any previous one.
   *
   * @param callback - The callback, given the new secret id.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: string) => unknown): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Selects a secret. Obsidian only renders the choice, which the mock does not, and does not call the change
   * callback.
   *
   * @param _value - The secret id.
   * @returns This component, for chaining.
   */
  public setValue(_value: string): this {
    noop();
    return this;
  }
}
