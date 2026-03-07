export class Notice {
  public containerEl: HTMLElement = createDiv();
  public messageEl: HTMLElement = createDiv();
  public noticeEl: HTMLElement = createDiv();

  public readonly duration: number = 0;

  public constructor(message: DocumentFragment | string, duration?: number) {
    if (typeof message === 'string') {
      this.messageEl.textContent = message;
    } else if (message instanceof DocumentFragment) {
      this.messageEl.appendChild(message.cloneNode(true));
    }
    (this as { duration: number }).duration = duration ?? 0;
    Notice.__constructor(this, message, duration);
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
      this.messageEl.appendChild(message);
    }
    return this;
  }
}
