/**
 * @file
 *
 * Mock of Obsidian's `DropdownComponent`, a select control.
 */

import type { DropdownComponent as DropdownComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

/**
 * Mock of Obsidian's `DropdownComponent`, backed by a real `<select>` element.
 *
 * As in Obsidian, the change handler runs on the element's `change` event, not from
 * {@link DropdownComponent.setValue}; {@link DropdownComponent.simulateChange__} runs it without an event.
 */
export class DropdownComponent extends ValueComponent<string> {
  /**
   * The handler registered with {@link DropdownComponent.onChange}, if any.
   */
  public changeCallback?: (value: string) => unknown;

  /**
   * The `<select>` element the component renders.
   */
  public selectEl: HTMLSelectElement;

  /**
   * Creates an empty dropdown inside a container.
   *
   * @param containerEl - The element the `<select>` is appended to.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.selectEl = containerEl.createEl('select');
    const self = strictProxy(this);
    this.selectEl.addEventListener('change', () => {
      self.simulateChange__();
    });
    self.constructor3__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a dropdown, spyable via `vi.spyOn(DropdownComponent, 'create__')`.
   *
   * @param containerEl - The element the `<select>` is appended to.
   * @returns The new dropdown.
   */
  public static create__(containerEl: HTMLElement): DropdownComponent {
    return new DropdownComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `DropdownComponent` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `DropdownComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: DropdownComponentOriginal): DropdownComponent {
    return strictProxy(value, DropdownComponent);
  }

  /**
   * Appends an `<option>` to the dropdown.
   *
   * @param value - The option's value.
   * @param display - The option's visible text.
   * @returns This dropdown, for chaining.
   */
  public addOption(value: string, display: string): this {
    const option = createEl('option');
    option.value = value;
    option.text = display;
    this.selectEl.append(option);
    return this;
  }

  /**
   * Appends one `<option>` per entry, in the record's order.
   *
   * @param options - A map from option value to visible text.
   * @returns This dropdown, for chaining.
   */
  public addOptions(options: Record<string, string>): this {
    for (const [value, display] of Object.entries(options)) {
      this.addOption(value, display);
    }
    return this;
  }

  /**
   * Mock-only: views this mock as Obsidian's `DropdownComponent` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `DropdownComponent`.
   */
  public asOriginalType3__(): DropdownComponentOriginal {
    return strictProxy<DropdownComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(DropdownComponent.prototype, 'constructor3__')`.
   *
   * @param _containerEl - The container the dropdown was created in.
   */
  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Gets the selected value.
   *
   * @returns The `<select>` element's current value, `''` when it has no options.
   */
  public override getValue(): string {
    return this.selectEl.value;
  }

  /**
   * Sets the handler run when the selection changes, replacing any previous one.
   *
   * @param callback - Receives the selected value at the time the change fires.
   * @returns This dropdown, for chaining.
   */
  public onChange(callback: (value: string) => void): this {
    this.changeCallback = callback;
    return this;
  }

  /**
   * Selects a value by writing it to the `<select>` element, which ignores a value with no matching option. As in
   * Obsidian, the change handler is not called.
   *
   * @param value - The option value to select.
   * @returns This dropdown, for chaining.
   */
  public override setValue(value: string): this {
    this.selectEl.value = value;
    return this;
  }

  /**
   * Mock-only: simulates the user changing the selection by calling the change handler with the current value.
   * Set `selectEl.value` first to simulate picking a particular option.
   */
  public simulateChange__(): void {
    this.changeCallback?.(this.getValue());
  }
}
