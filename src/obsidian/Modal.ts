import type { App } from './App.ts';

import { Scope } from './Scope.ts';

export class Modal {
  public app: App;
  public containerEl: HTMLElement = createDiv();
  public contentEl: HTMLElement = createDiv();
  public modalEl: HTMLElement = createDiv();
  public scope = Scope.__create();
  public shouldRestoreSelection = true;
  public titleEl: HTMLElement = createDiv();

  private _closeCallback: (() => unknown) | null = null;

  public constructor(app: App) {
    this.app = app;
    Modal.__constructor(this, app);
  }

  public static __constructor(_instance: Modal, _app: App): void {
    // Spy hook.
  }

  public close(): void {
    this.onClose();
    this._closeCallback?.();
  }

  public onClose(): void {
  }

  public onOpen(): void {
  }

  public open(): void {
    this.onOpen();
    // Use setTimeout so tests can intercept (e.g. simulate button clicks)
    // Before the modal auto-closes.
    setTimeout(() => {
      this.close();
    }, 0);
  }

  public setCloseCallback(callback: () => unknown): this {
    this._closeCallback = callback;
    return this;
  }

  public setContent(content: DocumentFragment | string): this {
    if (typeof content === 'string') {
      this.contentEl.textContent = content;
    } else {
      this.contentEl.appendChild(content);
    }
    return this;
  }

  public setTitle(title: string): this {
    this.titleEl.textContent = title;
    return this;
  }
}
