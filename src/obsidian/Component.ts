import type {
  Component as ComponentOriginal,
  EventRef
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';

export class Component {
  public _children: Component[] = [];
  public _cleanups: (() => unknown)[] = [];
  public _events: EventRef[] = [];
  public _intervals: number[] = [];
  public _loaded = false;

  protected constructor() {
    noop();
  }

  public addChild<T extends Component>(component: T): T {
    this._children.push(component);
    if (this._loaded) {
      component.load();
    }
    return component;
  }

  public asOriginalType__(): ComponentOriginal {
    return castTo<ComponentOriginal>(this);
  }

  public load(): void {
    this._loaded = true;
    this.onload();
  }

  public onload(): void {
    // Override point
  }

  public onunload(): void {
    // Override point
  }

  public register(cb: () => unknown): void {
    this._cleanups.push(cb);
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
    this._events.push(ref);
  }

  public registerInterval(id: number): number {
    this._intervals.push(id);
    return id;
  }

  public removeChild<T extends Component>(component: T): T {
    const index = this._children.indexOf(component);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
    component.unload();
    return component;
  }

  public unload(): void {
    if (!this._loaded) {
      return;
    }
    this.onunload();

    for (const child of [...this._children]) {
      this.removeChild(child);
    }
    this._children = [];

    this._events = [];

    for (const cleanup of this._cleanups) {
      cleanup();
    }
    this._cleanups = [];

    for (const id of this._intervals) {
      clearInterval(id);
    }
    this._intervals = [];

    this._loaded = false;
  }
}
