/**
 * @file
 *
 * Mock of Obsidian's `Events`, the named-event emitter many Obsidian classes extend.
 */

import type {
  EventRef as EventRefOriginal,
  Events as EventsOriginal
} from 'obsidian';

import type { EventsEntry } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Events`, a working in-memory event emitter.
 *
 * Handlers are kept per event name and run synchronously, in registration order, by {@link Events.trigger}.
 */
export class Events {
  private _: Record<string, EventsEntry[]> = {};

  /**
   * Creates an emitter with no handlers.
   */
  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only factory: creates an emitter, spyable via `vi.spyOn(Events, 'create__')`.
   *
   * @returns The new emitter.
   */
  public static create__(): Events {
    return new Events();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Events` as this mock.
   *
   * @param value - The value typed as the original `Events`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: EventsOriginal): Events {
    return strictProxy(value, Events);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Events` type.
   *
   * @returns The same object, typed as the original `Events`.
   */
  public asOriginalType__(): EventsOriginal {
    return strictProxy<EventsOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Events.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Removes every registration of a handler for an event.
   *
   * @param name - The event name.
   * @param callback - The handler to remove, compared by identity.
   */
  public off(name: string, callback: (...data: unknown[]) => unknown): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    this._[name] = entries.filter((entry) => entry.fn !== callback);
  }

  /**
   * Removes the handler an event ref was created for. The mock does this through {@link Events.off}, so every
   * registration of the same handler for that event is removed.
   *
   * @param ref - The ref returned by {@link Events.on}; a ref without a name or handler is ignored.
   */
  public offref(ref: EventRefOriginal): void {
    const entry = ref as Partial<EventsEntry>;
    if (!entry.name || !entry.fn) {
      return;
    }

    const $function = entry.fn;
    this.off(entry.name, $function);
  }

  /**
   * Registers a handler for an event.
   *
   * @param name - The event name.
   * @param callback - The handler, called with the arguments passed to {@link Events.trigger}.
   * @param context - The `this` the handler is called with.
   * @returns A ref for {@link Events.offref} or `Component.registerEvent`, carrying the emitter, handler and name.
   */
  public on(name: string, callback: (...data: unknown[]) => unknown, context?: unknown): EventRefOriginal {
    this._[name] ??= [];
    const self = this.asOriginalType__();
    /* eslint-disable unicorn/name-replacements -- `ctx` / `e` / `fn` are the member names on Obsidian's own `EventRef`, which `offref` and every consumer read by name. */
    this._[name].push({ ctx: context, e: self, fn: callback, name });
    return { e: self, fn: callback, name };
    /* eslint-enable unicorn/name-replacements -- Restores the rule after the `EventRef` shape. */
  }

  /**
   * Calls every handler registered for an event, in registration order, each with its registered context.
   *
   * @param name - The event name.
   * @param data - The arguments passed to each handler.
   */
  public trigger(name: string, ...data: unknown[]): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    for (const entry of entries) {
      entry.fn.call(entry.ctx, ...data);
    }
  }

  /**
   * Calls the handler of a single event ref. The mock calls it with the emitter as `this`, since the ref does not
   * carry the registered context, and lets any error it throws propagate.
   *
   * @param event - The ref returned by {@link Events.on}; a ref without a handler or emitter is ignored.
   * @param $arguments - The arguments passed to the handler.
   */
  public tryTrigger(event: EventRefOriginal, $arguments: unknown[]): void {
    const entry = event as Partial<EventsEntry>;
    if (!entry.fn || !entry.e) {
      return;
    }
    entry.fn.call(entry.e, ...$arguments);
  }
}
