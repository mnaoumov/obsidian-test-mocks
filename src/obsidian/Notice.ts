import type { Notice as NoticeOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class Notice {
  private static insideCreate__ = false;
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
    } else if (message instanceof DocumentFragment) {
      this.messageEl.appendChild(message.cloneNode(true));
    }
    (this as { duration__: number }).duration__ = duration ?? 0;
    if (new.target === Notice && !Notice.insideCreate__) {
      return Notice.create__(message, duration);
    }
  }

  public static create__(message: DocumentFragment | string, duration?: number): Notice {
    Notice.insideCreate__ = true;
    const instance = strictMock(new Notice(message, duration));
    Notice.insideCreate__ = false;
    return instance;
  }

  public asOriginalType__(): NoticeOriginal {
    return castTo<NoticeOriginal>(this);
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
