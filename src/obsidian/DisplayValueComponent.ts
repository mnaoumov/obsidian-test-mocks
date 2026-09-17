/**
 * @file
 *
 * Mock of Obsidian's `DisplayValueComponent`, the read-only value label of a setting row.
 */

import type { DisplayValueComponent as DisplayValueComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `DisplayValueComponent`: a read-only value label with an optional status indicator, which
 * on a navigable setting row shows the value edited on the page the row opens.
 */
export class DisplayValueComponent {
  /**
   * The element holding the value label.
   */
  public valueEl: HTMLElement;

  /**
   * Creates the value label inside a container.
   *
   * @param containerEl - The element the value element is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    this.valueEl = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a display value, spyable via `vi.spyOn(DisplayValueComponent, 'create__')`.
   *
   * @param containerEl - The element the value element is appended to.
   * @returns The new display value.
   */
  public static create__(containerEl: HTMLElement): DisplayValueComponent {
    return new DisplayValueComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `DisplayValueComponent` as this mock.
   *
   * @param value - The value typed as the original `DisplayValueComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: DisplayValueComponentOriginal): DisplayValueComponent {
    return strictProxy(value, DisplayValueComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `DisplayValueComponent` type.
   *
   * @returns The same object, typed as the original `DisplayValueComponent`.
   */
  public asOriginalType__(): DisplayValueComponentOriginal {
    return strictProxy<DisplayValueComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(DisplayValueComponent.prototype, 'constructor__')`.
   *
   * @param _containerEl - The container the display value was created in.
   */
  public constructor__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Shows or clears the status indicator. The mock toggles the `mod-warning` class on the value element.
   *
   * @param status - `'warning'` when the value needs the user's attention, or `null` to clear it.
   * @returns This component, for chaining.
   */
  public setStatus(status: 'warning' | null): this {
    this.valueEl.toggleClass('mod-warning', status === 'warning');
    return this;
  }

  /**
   * Sets the value label's text.
   *
   * @param value - The text; `''` or `null` clears it.
   * @returns This component, for chaining.
   */
  public setValue(value: null | string): this {
    this.valueEl.textContent = value ?? '';
    return this;
  }
}
