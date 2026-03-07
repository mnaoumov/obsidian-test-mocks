import { strictMock } from '../internal/StrictMock.ts';

export class Notice {
  public containerEl: HTMLElement;
  public messageEl: HTMLElement;
  public noticeEl: HTMLElement;

  public readonly duration: number = 0;

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
    const mock = strictMock(this);
    Notice.__constructor(mock, message, duration);
    return mock;
  }

  public static __constructor(_instance: Notice, _message: DocumentFragment | string, _duration?: number): void {
    // Spy hook.
  }

  public hide(): void {
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
