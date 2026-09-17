/**
 * @file
 *
 * Mock of Obsidian's `TextAreaComponent`, a multi-line text input.
 */

import type { TextAreaComponent as TextAreaComponentOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { AbstractTextComponent } from './AbstractTextComponent.ts';

/**
 * Mock of Obsidian's `TextAreaComponent`: a text component backed by a `<textarea>`.
 */
export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
  /**
   * Creates a text area and appends its `<textarea>` to the container.
   *
   * @param containerEl - The element to create the text area in.
   */
  public constructor(containerEl: HTMLElement) {
    super(containerEl.createEl('textarea'));
    const self = strictProxy(this);
    self.constructor4__(containerEl);
    return self;
  }

  /**
   * Mock-only factory: creates a text area, spyable via `vi.spyOn(TextAreaComponent, 'create__')`.
   *
   * @param containerEl - The element to create the text area in.
   * @returns The new text area.
   */
  public static create__(containerEl: HTMLElement): TextAreaComponent {
    return new TextAreaComponent(containerEl);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `TextAreaComponent` as this mock.
   *
   * @param value - The value typed as the original `TextAreaComponent`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: TextAreaComponentOriginal): TextAreaComponent {
    return strictProxy(value, TextAreaComponent);
  }

  /**
   * Mock-only: views this mock as Obsidian's `TextAreaComponent` type.
   *
   * @returns The same object, typed as the original `TextAreaComponent`.
   */
  public asOriginalType4__(): TextAreaComponentOriginal {
    return strictProxy<TextAreaComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(TextAreaComponent.prototype, 'constructor4__')`.
   *
   * @param _containerEl - The container the text area was created in.
   */
  public constructor4__(_containerEl: HTMLElement): void {
    noop();
  }
}
