/**
 * @file
 *
 * Mock of Obsidian's `Component`, the base of everything with a load/unload lifecycle.
 */

import type {
  Component as ComponentOriginal,
  EventRef as EventRefOriginal
} from 'obsidian';

import type { EventsEntry } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Component`, with a working load/unload lifecycle.
 *
 * Loading loads children; unloading unloads children in reverse order, runs registered cleanups in reverse order
 * (detaching DOM listeners and event refs, clearing intervals) and then calls {@link Component.onunload}.
 */
export class Component {
  /**
   * The child components, unloaded when this component unloads.
   */
  public _children: Component[] = [];

  /**
   * The event refs registered with {@link Component.registerEvent}, detached when this component unloads.
   */
  public _events: EventRefOriginal[] = [];

  /**
   * Whether this component is currently loaded.
   */
  public _loaded = false;

  /**
   * Mock-only: the callbacks registered with {@link Component.register}, run in reverse order on unload.
   */
  public cleanups__: (() => unknown)[] = [];

  /**
   * Mock-only: the interval ids registered with {@link Component.registerInterval}, cleared on unload.
   */
  public intervals__: number[] = [];

  /**
   * Creates an unloaded component.
   */
  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only factory: creates a component, spyable via `vi.spyOn(Component, 'create__')`.
   *
   * @returns The new component.
   */
  public static create__(): Component {
    return new Component();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Component` as this mock.
   *
   * @param value - The value typed as the original `Component`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: ComponentOriginal): Component {
    return strictProxy(value, Component);
  }

  /**
   * Adds a child component, loading it if this component is already loaded.
   *
   * @typeParam T - The type of the child component.
   * @param component - The component to add.
   * @returns The added component.
   */
  public addChild<T extends Component>(component: T): T {
    this._children.push(component);
    if (this._loaded) {
      component.load();
    }
    return component;
  }

  /**
   * Mock-only: views this mock as Obsidian's `Component` type.
   *
   * @returns The same object, typed as the original `Component`.
   */
  public asOriginalType__(): ComponentOriginal {
    return strictProxy<ComponentOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Component.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Loads this component and then its children; does nothing if it is already loaded.
   */
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

  /**
   * Called when the component loads; override it to set the component up. A no-op by default.
   */
  public onload(): void {
    noop();
  }

  /**
   * Called when the component unloads; override it to tear the component down. A no-op by default.
   */
  public onunload(): void {
    noop();
  }

  /**
   * Registers a callback to run when this component unloads.
   *
   * @param callback - The cleanup callback.
   */
  public register(callback: () => unknown): void {
    this.cleanups__.push(callback);
  }

  /**
   * Adds a DOM event listener to a window, removed when this component unloads.
   *
   * @typeParam K - The event name.
   * @param el - The window to listen on.
   * @param type - The event name.
   * @param callback - The listener.
   * @param options - The listener options, also used to remove it.
   */
  public registerDomEvent<K extends keyof WindowEventMap>(
    el: Window,
    type: K,
    callback: (this: HTMLElement, event: WindowEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  /**
   * Adds a DOM event listener to a document, removed when this component unloads.
   *
   * @typeParam K - The event name.
   * @param el - The document to listen on.
   * @param type - The event name.
   * @param callback - The listener.
   * @param options - The listener options, also used to remove it.
   */
  public registerDomEvent<K extends keyof DocumentEventMap>(
    el: Document,
    type: K,
    callback: (this: HTMLElement, event: DocumentEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  /**
   * Adds a DOM event listener to an element, removed when this component unloads.
   *
   * @typeParam K - The event name.
   * @param el - The element to listen on.
   * @param type - The event name.
   * @param callback - The listener.
   * @param options - The listener options, also used to remove it.
   */
  public registerDomEvent<K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    callback: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown,
    options?: AddEventListenerOptions | boolean
  ): void;
  /**
   * Adds a DOM event listener, and registers a cleanup that removes it when this component unloads.
   *
   * @param el - The window, document or element to listen on.
   * @param type - The event name.
   * @param callback - The listener.
   * @param options - The listener options, also used to remove it.
   */
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

  /**
   * Registers an event ref to be detached, through its owning `Events` object's `offref`, when this component
   * unloads.
   *
   * @param ref - The event ref returned by an `on` call.
   */
  public registerEvent(ref: EventRefOriginal): void {
    this._events.push(ref);
    this.register(() => {
      const entry = ref as Partial<EventsEntry>;
      entry.e?.offref(ref);
    });
  }

  /**
   * Registers an interval to be cleared with `clearInterval` when this component unloads.
   *
   * @param id - The id returned by `window.setInterval`.
   * @returns The same id.
   */
  public registerInterval(id: number): number {
    this.intervals__.push(id);
    this.register(() => {
      clearInterval(id);
    });
    return id;
  }

  /**
   * Removes a child component, if present, and unloads it.
   *
   * @typeParam T - The type of the child component.
   * @param component - The component to remove.
   * @returns The removed component.
   */
  public removeChild<T extends Component>(component: T): T {
    const index = this._children.indexOf(component);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
    component.unload();
    return component;
  }

  /**
   * Unloads this component: unloads and forgets its children, runs its registered cleanups, clears the tracked
   * events and intervals, then calls {@link Component.onunload}. Does nothing if it is not loaded.
   */
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
