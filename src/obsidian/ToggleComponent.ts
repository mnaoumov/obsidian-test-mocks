/**
 * @file
 *
 * Mock of Obsidian's `ToggleComponent`, an on/off switch.
 */

import type {
  ToggleComponent as ToggleComponentOriginal,
  TooltipOptions as TooltipOptionsOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

/**
 * Mock of Obsidian's `ToggleComponent`.
 *
 * The on/off state is kept in {@link ToggleComponent.on}. As in Obsidian, {@link ToggleComponent.setValue} calls the
 * change callback only when the value actually changes, and {@link ToggleComponent.onClick} flips the toggle unless
 * it is disabled.
 */
export class ToggleComponent extends ValueComponent<boolean> {
  /**
   * The callback registered with {@link ToggleComponent.onChange}, if any.
   */
  public changeCallback?: (value: boolean) => unknown;

  /**
   * Whether the toggle is on.
   */
  public on = false;

  /**
   * The toggle's element.
   */
  public toggleEl: HTMLElement;

  /**
   * Creates a toggle, initially off, and appends its element to the container.
   *
   * @param containerEl - The element to create the toggle in.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.toggleEl = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor3__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a toggle, spyable via `vi.spyOn(ToggleComponent, 'create__')`.
   *
   * @param containerEl - The element to create the toggle in.
   * @returns The new toggle.
   */
  public static create__(containerEl: HTMLElement): ToggleComponent {
    return new ToggleComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ToggleComponent` as this mock.
   *
   * @param value - The value typed as the original `ToggleComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ToggleComponentOriginal): ToggleComponent {
    return strictProxy(value, ToggleComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ToggleComponent` type.
   *
   * @returns The same object, typed as the original `ToggleComponent`.
   */
  public asOriginalType3__(): ToggleComponentOriginal {
    return strictProxy<ToggleComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ToggleComponent.prototype, 'constructor3__')`.
   *
   * @param _containerEl - The container the toggle was created in.
   */
  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Gets whether the toggle is on.
   *
   * @returns `true` when on.
   */
  public override getValue(): boolean {
    return this.on;
  }

  /**
   * Registers the callback invoked when the value changes, replacing any previous one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: boolean) => unknown): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Handles a click: flips the toggle through {@link ToggleComponent.setValue}, unless the toggle is disabled.
   */
  public onClick(): void {
    if (this.disabled) {
      return;
    }
    this.setValue(!this.getValue());
  }

  /**
   * Disables or enables the toggle, toggling the `is-disabled` class on {@link ToggleComponent.toggleEl}.
   *
   * @param disabled - Whether the toggle is disabled.
   * @returns This component, for chaining.
   */
  public override setDisabled(disabled: boolean): this {
    super.setDisabled(disabled);
    this.toggleEl.toggleClass('is-disabled', disabled);
    return this;
  }

  /**
   * Sets the toggle's tooltip. The mock writes it to the element's `aria-label` and ignores the options.
   *
   * @param tooltip - The tooltip text.
   * @param _options - Tooltip placement and delay options.
   * @returns This component, for chaining.
   */
  public setTooltip(tooltip: string, _options?: TooltipOptionsOriginal): this {
    this.toggleEl.setAttribute('aria-label', tooltip);
    return this;
  }

  /**
   * Turns the toggle on or off. When the value changes, toggles the `is-enabled` class on
   * {@link ToggleComponent.toggleEl} and calls the change callback; an unchanged value does nothing.
   *
   * @param value - Whether the toggle should be on.
   * @returns This component, for chaining.
   */
  public override setValue(value: boolean): this {
    if (this.on !== value) {
      this.on = value;
      this.toggleEl.toggleClass('is-enabled', value);
      this.changeCallback?.(value);
    }
    return this;
  }
}
