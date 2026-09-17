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
 * The on/off state is kept in memory; {@link ToggleComponent.onClick} flips it, and both it and
 * {@link ToggleComponent.setValue} invoke the change callback.
 */
export class ToggleComponent extends ValueComponent<boolean> {
  /**
   * The toggle's element.
   */
  public toggleEl: HTMLElement;

  private _onChange: ((value: boolean) => unknown) | null = null;
  private value = false;

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
    return this.value;
  }

  /**
   * Registers the callback invoked when the value changes, replacing any previous one.
   *
   * @param callback - Called with the new value.
   * @returns This component, for chaining.
   */
  public onChange(callback: (value: boolean) => unknown): this {
    this._onChange = callback;
    return this;
  }

  /**
   * Handles a click: flips the toggle and invokes the change callback with the new value.
   */
  public onClick(): void {
    this.value = !this.value;
    this._onChange?.(this.value);
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
   * Turns the toggle on or off and invokes the change callback, even when the value is unchanged.
   *
   * @param value - Whether the toggle should be on.
   * @returns This component, for chaining.
   */
  public override setValue(value: boolean): this {
    this.value = value;
    this._onChange?.(value);
    return this;
  }
}
