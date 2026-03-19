import type { Notice as NoticeOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class Notice {
  public containerEl: HTMLElement;
  public readonly duration__: number = 0;
  public messageEl: HTMLElement;

  public noticeEl: HTMLElement;

  public constructor(message: DocumentFragment | string, duration?: number) {
    this.containerEl = createDiv();
    this.messageEl = this.containerEl.createDiv();
    this.noticeEl = this.containerEl.createDiv();
    if (typeof message === 'string') {
      this.messageEl.textContent = message;
    } else {
      this.messageEl.appendChild(message.cloneNode(true));
    }
    this.duration__ = duration ?? 0;
    const self = strictProxy(this);
    self.constructor__(message, duration);
    return self;
  }

  public static create__(message: DocumentFragment | string, duration?: number): Notice {
    return new Notice(message, duration);
  }

  public static fromOriginalType__(value: NoticeOriginal): Notice {
    return strictProxy(value, Notice);
  }

  public asOriginalType__(): NoticeOriginal {
    return strictProxy<NoticeOriginal>(this);
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
