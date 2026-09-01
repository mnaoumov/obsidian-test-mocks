import type {
  Component as ComponentOriginal,
  EventRef as EventRefOriginal
} from 'obsidian';

import type { EventsEntry } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class Component {
  public _children: Component[] = [];
  public _events: EventRefOriginal[] = [];
  public _loaded = false;
  public cleanups__: (() => unknown)[] = [];
  public intervals__: number[] = [];

  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static create__(): Component {
    return new Component();
  }

  public static fromOriginalType__(value: ComponentOriginal): Component {
    return strictProxy(value, Component);
  }

  public addChild<T extends Component>(component: T): T {
    this._children.push(component);
    if (this._loaded) {
      component.load();
    }
    return component;
  }

  public asOriginalType__(): ComponentOriginal {
    return strictProxy<ComponentOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public load(): void {
    if (this._loaded) {
      return;
    }
    this._loaded = true;
    this.onload();
    for (const child of this._children) {
      child.load();
    }
  }

  public onload(): void {
    noop();
  }

  public onunload(): void {
    noop();
  }

  public register(callback: () => unknown): void {
    this.cleanups__.push(callback);
  }

  public registerDomEvent<K extends keyof WindowEventMap>(
    el: Window,
    type: K,
    callback: (this: HTMLElement, event: WindowEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  public registerDomEvent<K extends keyof DocumentEventMap>(
    el: Document,
    type: K,
    callback: (this: HTMLElement, event: DocumentEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  public registerDomEvent<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    callback: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
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

  public registerEvent(ref: EventRefOriginal): void {
    this._events.push(ref);
    this.register(() => {
      const entry = ref as Partial<EventsEntry>;
      entry.e?.offref(ref);
    });
  }

  public registerInterval(id: number): number {
    this.intervals__.push(id);
    this.register(() => {
      clearInterval(id);
    });
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
    this._loaded = false;

    for (const child of [...this._children].reverse()) {
      child.unload();
    }
    this._children = [];

    for (const cleanup of [...this.cleanups__].reverse()) {
      cleanup();
    }
    this.cleanups__ = [];

    this._events = [];
    this.intervals__ = [];

    this.onunload();
  }
}
