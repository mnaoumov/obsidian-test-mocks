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
  /**
   * The registered handlers, keyed by event name, in registration order. Obsidian keeps them under this name too.
   */
  public _: Record<string, EventsEntry[]> = {};

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
   * Removes every registration of a handler for an event. As in Obsidian, the event's entry list is dropped once it
   * is empty.
   *
   * @param name - The event name.
   * @param callback - The handler to remove, compared by identity.
   */
  public off(name: string, callback: (...data: unknown[]) => unknown): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    this.setEntries(name, entries.filter((entry) => entry.fn !== callback));
  }

  /**
   * Removes the one registration an event ref was returned for, compared by identity, so other registrations of the
   * same handler stay.
   *
   * @param ref - The ref returned by {@link Events.on}; a ref without a name is ignored.
   */
  public offref(ref: EventRefOriginal): void {
    const entry = ref as Partial<EventsEntry>;
    if (entry.name === undefined) {
      return;
    }
    const entries = this._[entry.name];
    if (!entries) {
      return;
    }
    this.setEntries(entry.name, entries.filter((existingEntry) => existingEntry !== entry));
  }

  /**
   * Registers a handler for an event.
   *
   * @param name - The event name.
   * @param callback - The handler, called with the arguments passed to {@link Events.trigger}.
   * @param context - The `this` the handler is called with.
   * @returns The stored registration itself, as in Obsidian: a ref carrying the emitter, name, handler and context,
   * for {@link Events.offref} or `Component.registerEvent`.
   */
  public on(name: string, callback: (...data: unknown[]) => unknown, context?: unknown): EventRefOriginal {
    this._[name] ??= [];
    /* eslint-disable unicorn/name-replacements -- `ctx` / `e` / `fn` are the member names on Obsidian's own `EventRef`, which `offref` and every consumer read by name. */
    const entry: EventsEntry = { ctx: context, e: this.asOriginalType__(), fn: callback, name };
    /* eslint-enable unicorn/name-replacements -- Restores the rule after the `EventRef` shape. */
    this._[name].push(entry);
    return entry;
  }

  /**
   * Calls every handler registered for an event, in registration order, through {@link Events.tryTrigger}. As in
   * Obsidian, it iterates a copy of the list, so handlers added or removed while it runs do not change this pass.
   *
   * @param name - The event name.
   * @param data - The arguments passed to each handler.
   */
  public trigger(name: string, ...data: unknown[]): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    // eslint-disable-next-line unicorn/no-useless-spread -- The copy is the point: handlers added or removed during the pass must not change it.
    for (const entry of [...entries]) {
      this.tryTrigger(entry, data);
    }
  }

  /**
   * Calls the handler of a single event ref with its registered context as `this`. As in Obsidian, an error the
   * handler throws does not propagate: it is rethrown from a `setTimeout(0)`, so the remaining handlers still run
   * and the error surfaces as an uncaught exception.
   *
   * @param event - The ref returned by {@link Events.on}.
   * @param $arguments - The arguments passed to the handler.
   */
  public tryTrigger(event: EventRefOriginal, $arguments: unknown[]): void {
    const entry = event as EventsEntry;
    try {
      entry.fn.apply(entry.ctx, $arguments);
    } catch (error) {
      setTimeout(() => {
        throw error;
      }, 0);
    }
  }

  private setEntries(name: string, entries: EventsEntry[]): void {
    if (entries.length > 0) {
      this._[name] = entries;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- Obsidian drops an event's key once its last handler is removed.
      delete this._[name];
    }
  }
}
