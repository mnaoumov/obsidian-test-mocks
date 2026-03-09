import type {
  Component as ComponentOriginal,
  EventRef
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class Component {
  public children__: Component[] = [];
  public cleanups__: (() => unknown)[] = [];
  public events__: EventRef[] = [];
  public intervals__: number[] = [];
  public loaded__ = false;

  public constructor() {
    noop();
  }

  public static create__(): Component {
    return strictMock(new Component());
  }

  public addChild<T extends Component>(component: T): T {
    this.children__.push(component);
    if (this.loaded__) {
      component.load();
    }
    return component;
  }

  public asOriginalType__(): ComponentOriginal {
    return castTo<ComponentOriginal>(this);
  }

  public load(): void {
    this.loaded__ = true;
    this.onload();
  }

  public onload(): void {
    // Override point
  }

  public onunload(): void {
    // Override point
  }

  public register(cb: () => unknown): void {
    this.cleanups__.push(cb);
  }

  public registerDomEvent<K extends keyof WindowEventMap>(
    el: Window,
    type: K,
    callback: (this: HTMLElement, ev: WindowEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  public registerDomEvent<K extends keyof DocumentEventMap>(
    el: Document,
    type: K,
    callback: (this: HTMLElement, ev: DocumentEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  public registerDomEvent<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  public registerDomEvent(
    el: Document | HTMLElement | Window,
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean
  ): void {
    el.addEventListener(type, callback, options);
    this.register(() => {
      el.removeEventListener(type, callback, options);
    });
  }

  public registerEvent(ref: EventRef): void {
    this.events__.push(ref);
  }

  public registerInterval(id: number): number {
    this.intervals__.push(id);
    return id;
  }

  public removeChild<T extends Component>(component: T): T {
    const index = this.children__.indexOf(component);
    if (index !== -1) {
      this.children__.splice(index, 1);
    }
    component.unload();
    return component;
  }

  public unload(): void {
    if (!this.loaded__) {
      return;
    }
    this.onunload();

    for (const child of [...this.children__]) {
      this.removeChild(child);
    }
    this.children__ = [];

    this.events__ = [];

    for (const cleanup of this.cleanups__) {
      cleanup();
    }
    this.cleanups__ = [];

    for (const id of this.intervals__) {
      clearInterval(id);
    }
    this.intervals__ = [];

    this.loaded__ = false;
  }
}
