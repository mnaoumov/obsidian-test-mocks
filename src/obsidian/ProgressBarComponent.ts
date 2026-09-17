/**
 * @file
 *
 * Mock of Obsidian's `ProgressBarComponent`, a horizontal progress bar.
 */

import type { ProgressBarComponent as ProgressBarComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ValueComponent } from './ValueComponent.ts';

/**
 * Mock of Obsidian's `ProgressBarComponent`, a progress bar whose value is a percentage.
 *
 * The value is tracked in memory and mirrored onto {@link ProgressBarComponent.progressBar} as its `width` style
 * and `data-value` attribute, so a test can read it back from the element.
 */
export class ProgressBarComponent extends ValueComponent<number> {
  /**
   * The bar element whose width reflects the progress.
   */
  public progressBar: HTMLElement;

  private value = 0;

  /**
   * Creates the progress bar inside `containerEl`, starting at `0`.
   *
   * @param containerEl - The element to create the progress bar in.
   */
  public constructor(containerEl: HTMLElement) {
    super();
    this.progressBar = containerEl.createDiv();
    const self = strictProxy(this);
    self.constructor3__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a progress bar, spyable via `vi.spyOn(ProgressBarComponent, 'create__')`.
   *
   * @param containerEl - The element to create the progress bar in.
   * @returns The new progress bar.
   */
  public static create__(containerEl: HTMLElement): ProgressBarComponent {
    return new ProgressBarComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ProgressBarComponent` as this mock.
   *
   * @param value - The value typed as the original `ProgressBarComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ProgressBarComponentOriginal): ProgressBarComponent {
    return strictProxy(value, ProgressBarComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ProgressBarComponent` type.
   *
   * @returns The same object, typed as the original `ProgressBarComponent`.
   */
  public asOriginalType3__(): ProgressBarComponentOriginal {
    return strictProxy<ProgressBarComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ProgressBarComponent.prototype, 'constructor3__')`.
   *
   * @param _containerEl - The element the progress bar was created in.
   */
  public constructor3__(_containerEl: HTMLElement): void {
    noop();
  }

  /**
   * Gets the current progress.
   *
   * @returns The progress amount, between 0 and 100.
   */
  public override getValue(): number {
    return this.value;
  }

  /**
   * Sets the progress, updating the bar's width and its `data-value` attribute.
   *
   * @param value - The progress amount, between 0 and 100.
   * @returns This component, for chaining.
   */
  public override setValue(value: number): this {
    this.value = value;
    this.progressBar.style.width = `${String(value)}%`;
    this.progressBar.dataset['value'] = String(value);
    return this;
  }
}
