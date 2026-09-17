/**
 * @file
 *
 * Mock of Obsidian's `MomentFormatComponent`, a text input for a moment.js date format with a live sample.
 */

import type { MomentFormatComponent as MomentFormatComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { TextComponent } from './TextComponent.ts';

/**
 * Mock of Obsidian's `MomentFormatComponent`, a text input whose value is a moment.js format string.
 *
 * The sample preview is never rendered: {@link MomentFormatComponent.updateSample} is a no-op, and the default
 * format is only recorded in {@link MomentFormatComponent.defaultFormat__}.
 */
export class MomentFormatComponent extends TextComponent {
  /**
   * Mock-only: the default format last passed to {@link MomentFormatComponent.setDefaultFormat} (`''` until then).
   */
  public defaultFormat__ = '';

  /**
   * The element Obsidian renders the formatted sample date into.
   */
  public sampleEl: HTMLElement;

  /**
   * Creates the format input inside `containerEl`, with a fresh sample element appended to it.
   *
   * @param containerEl - The element to create the component in.
   */
  public constructor(containerEl: HTMLElement) {
    super(containerEl);
    this.sampleEl = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor5__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a moment format component, spyable via `vi.spyOn(MomentFormatComponent, 'create2__')`.
   * It is the subclass variant of `TextComponent`'s factory.
   *
   * @param containerEl - The element to create the component in.
   * @returns The new moment format component.
   */
  public static create2__(containerEl: HTMLElement): MomentFormatComponent {
    return new MomentFormatComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MomentFormatComponent` as this mock.
   *
   * @param value - The value typed as the original `MomentFormatComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: MomentFormatComponentOriginal): MomentFormatComponent {
    return strictProxy(value, MomentFormatComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MomentFormatComponent` type.
   *
   * @returns The same object, typed as the original `MomentFormatComponent`.
   */
  public asOriginalType5__(): MomentFormatComponentOriginal {
    return strictProxy<MomentFormatComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MomentFormatComponent.prototype, 'constructor5__')`.
   *
   * @param _containerEl - The element the component was created in.
   */
  public constructor5__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Sets the format used when the input is cleared, which Obsidian also shows as the placeholder. The mock only
   * records it in {@link MomentFormatComponent.defaultFormat__}.
   *
   * @param defaultFormat - The default moment.js format string.
   * @returns This component, for chaining.
   */
  public setDefaultFormat(defaultFormat: string): this {
    this.defaultFormat__ = defaultFormat;
    return this;
  }

  /**
   * Replaces the element the formatted sample is rendered into.
   *
   * @param sampleEl - The new sample element.
   * @returns This component, for chaining.
   */
  public setSampleEl(sampleEl: HTMLElement): this {
    this.sampleEl = sampleEl;
    return this;
  }

  /**
   * Sets the format string in the input, delegating to `TextComponent.setValue`.
   *
   * @param value - The moment.js format string.
   * @returns This component, for chaining.
   */
  public override setValue(value: string): this {
    return super.setValue(value);
  }

  /**
   * Re-renders the sample date in the current format. A no-op in the mock, which renders no sample.
   */
  public updateSample(): void {
    noop();
  }
}
