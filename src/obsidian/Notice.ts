/**
 * @file
 *
 * Mock of Obsidian's `Notice`, the transient notification toast.
 */

import type { Notice as NoticeOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Notice` notification component.
 *
 * Nothing is shown on screen: the message is rendered into detached elements, so a test can read it back from
 * {@link Notice.messageEl}, and the requested duration is kept in {@link Notice.duration__}.
 */
export class Notice {
  /**
   * The notice's outer container element.
   */
  public containerEl: HTMLElement;

  /**
   * Mock-only: the duration, in milliseconds, the notice was created with (`0` when none was given).
   */
  public readonly duration__: number = 0;

  /**
   * The element holding the notice's message.
   */
  public messageEl: HTMLElement;

  /**
   * The notice element. Obsidian deprecates it in favor of {@link Notice.messageEl}.
   */
  public noticeEl: HTMLElement;

  /**
   * Creates a notice and renders its message.
   *
   * @param message - The message to display, as text or as a fragment (which is cloned).
   * @param duration - Time in milliseconds to show the notice for; `0` or omitted keeps it until dismissed.
   */
  public constructor(message: DocumentFragment | string, duration?: number) {
    this.containerEl = createDiv();
    this.messageEl = this.containerEl.createDiv();
    this.noticeEl = this.containerEl.createDiv();
    if (typeof message === 'string') {
      this.messageEl.textContent = message;
    } else {
      this.messageEl.append(message.cloneNode(true));
    }
    this.duration__ = duration ?? 0;
    const self = strictProxy(this);
    self.constructor__(message, duration);
    return self;
  }

  /**
   * Mock-only factory: creates a notice, spyable via `vi.spyOn(Notice, 'create__')`.
   *
   * @param message - The message to display.
   * @param duration - Time in milliseconds to show the notice for.
   * @returns The new notice.
   */
  public static create__(message: DocumentFragment | string, duration?: number): Notice {
    return new Notice(message, duration);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Notice` as this mock.
   *
   * @param value - The value typed as the original `Notice`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: NoticeOriginal): Notice {
    return strictProxy(value, Notice);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Notice` type.
   *
   * @returns The same object, typed as the original `Notice`.
   */
  public asOriginalType__(): NoticeOriginal {
    return strictProxy<NoticeOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Notice.prototype, 'constructor__')`.
   *
   * @param _message - The message the notice was created with.
   * @param _duration - The duration the notice was created with.
   */
  public constructor__(_message: DocumentFragment | string, _duration?: number): void {
    noop();
  }

  /**
   * Hides the notice. A no-op in the mock, since nothing is shown.
   */
  public hide(): void {
    noop();
  }

  /**
   * Replaces the notice's message.
   *
   * @param message - The new message, as text or as a fragment (which is cloned).
   * @returns This notice, for chaining.
   */
  public setMessage(message: DocumentFragment | string): this {
    this.messageEl.textContent = '';
    if (typeof message === 'string') {
      this.messageEl.textContent = message;
    } else {
      this.messageEl.append(message.cloneNode(true));
    }
    return this;
  }
}
