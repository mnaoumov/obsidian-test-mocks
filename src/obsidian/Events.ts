import type {
  EventRef as EventRefOriginal,
  Events as EventsOriginal
} from 'obsidian';

import type { EventsEntry } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class Events {
  private _: Record<string, EventsEntry[]> = {};

  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static create__(): Events {
    return new Events();
  }

  public static fromOriginalType__(value: EventsOriginal): Events {
    return strictProxy(value, Events);
  }

  public asOriginalType__(): EventsOriginal {
    return strictProxy<EventsOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public off(name: string, callback: (...data: unknown[]) => unknown): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    this._[name] = entries.filter((entry) => entry.fn !== callback);
  }

  public offref(ref: EventRefOriginal): void {
    const entry = ref as Partial<EventsEntry>;
    if (!entry.name || !entry.fn) {
      return;
    }

    const $function = entry.fn;
    this.off(entry.name, $function);
  }

  public on(name: string, callback: (...data: unknown[]) => unknown, context?: unknown): EventRefOriginal {
    this._[name] ??= [];
    const self = this.asOriginalType__();
    /* eslint-disable unicorn/name-replacements -- `ctx` / `e` / `fn` are the member names on Obsidian's own `EventRef`, which `offref` and every consumer read by name. */
    this._[name].push({ ctx: context, e: self, fn: callback, name });
    return { e: self, fn: callback, name };
    /* eslint-enable unicorn/name-replacements -- Restores the rule after the `EventRef` shape. */
  }

  public trigger(name: string, ...data: unknown[]): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    for (const entry of entries) {
      entry.fn.call(entry.ctx, ...data);
    }
  }

  public tryTrigger(event: EventRefOriginal, $arguments: unknown[]): void {
    const entry = event as Partial<EventsEntry>;
    if (!entry.fn || !entry.e) {
      return;
    }
    entry.fn.call(entry.e, ...$arguments);
  }
}
