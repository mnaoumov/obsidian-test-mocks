import type { Modal as ModalOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Scope } from './Scope.ts';

export class Modal {
  public app: App;
  public containerEl: HTMLElement;
  public contentEl: HTMLElement;
  public modalEl: HTMLElement;
  public scope: Scope;
  public shouldRestoreSelection = true;
  public titleEl: HTMLElement;

  private _closeCallback: (() => unknown) | null = null;

  public constructor(app: App) {
    this.app = app;
    this.containerEl = createDiv();
    this.contentEl = createDiv();
    this.modalEl = createDiv();
    this.scope = Scope.create__();
    this.titleEl = createDiv();
    return strictMock(this);
  }

  public asOriginalType__(): ModalOriginal {
    return castTo<ModalOriginal>(this);
  }

  public close(): void {
    this.onClose();
    this._closeCallback?.();
  }

  public onClose(): void {
    noop();
  }

  public onOpen(): void {
    noop();
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
