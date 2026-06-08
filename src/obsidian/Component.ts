import type {
  Component as ComponentOriginal,
  EventRef as EventRefOriginal
} from 'obsidian';

import type { EventsEntry } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class Component {
  public children__: Component[] = [];
  public cleanups__: (() => unknown)[] = [];
  public events__: EventRefOriginal[] = [];
  public intervals__: number[] = [];
  public loaded__ = false;

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
    this.children__.push(component);
    if (this.loaded__) {
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
    if (this.loaded__) {
      return;
    }
    this.loaded__ = true;
    this.onload();
    for (const child of [...this.children__]) {
      child.load();
    }
  }

  public onload(): void {
    noop();
  }

  public onunload(): void {
    noop();
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

  public registerEvent(ref: EventRefOriginal): void {
    this.events__.push(ref);
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
    this.loaded__ = false;

    for (const child of [...this.children__].reverse()) {
      child.unload();
    }
    this.children__ = [];

    for (const cleanup of [...this.cleanups__].reverse()) {
      cleanup();
    }
    this.cleanups__ = [];

    this.events__ = [];
    this.intervals__ = [];

    this.onunload();
  }
}
