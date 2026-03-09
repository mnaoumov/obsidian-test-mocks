import type { Notice as NoticeOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';
import { strictMock } from '../internal/StrictMock.ts';

export class Notice {
  public containerEl: HTMLElement;
  public readonly duration: number = 0;
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
    (this as { duration: number }).duration = duration ?? 0;
    return strictMock(this);
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
