import type { Notice as NoticeOriginal } from 'obsidian';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class Notice {
  public containerEl: HTMLElement;
  public readonly duration__: number = 0;
  public messageEl: HTMLElement;

  public noticeEl: HTMLElement;

  public constructor(message: DocumentFragment | string, duration?: number) {
    this.containerEl = createDiv();
    this.messageEl = createDiv();
    this.noticeEl = createDiv();
    if (typeof message === 'string') {
      this.messageEl.textContent = message;
    } else {
      this.messageEl.appendChild(message.cloneNode(true));
    }
    (this as { duration__: number }).duration__ = duration ?? 0;
    const self = createMockOf(this);
    self.constructor__(message, duration);
    return self;
  }

  public static create__(message: DocumentFragment | string, duration?: number): Notice {
    return new Notice(message, duration);
  }

  public static fromOriginalType__(value: NoticeOriginal): Notice {
    return createMockOfUnsafe<Notice>(value);
  }

  public asOriginalType__(): NoticeOriginal {
    return createMockOfUnsafe<NoticeOriginal>(this);
  }

  public constructor__(_message: DocumentFragment | string, _duration?: number): void {
    noop();
  }

  public hide(): void {
    noop();
  }

  public setMessage(message: DocumentFragment | string): this {
    this.messageEl.textContent = '';
    if (typeof message === 'string') {
      this.messageEl.textContent = message;
    } else {
      this.messageEl.appendChild(message.cloneNode(true));
    }
    return this;
  }
}
