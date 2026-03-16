import type {
  EventRef as EventRefOriginal,
  Events as EventsOriginal
} from 'obsidian';

import type { EventsEntry } from '../internal/types.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class Events {
  private _: Record<string, EventsEntry[]> = {};

  public constructor() {
    const self = strictMock(this);
    self.constructor__();
    return self;
  }

  public static create__(): Events {
    return new Events();
  }

  public static fromOriginalType__(value: EventsOriginal): Events {
    return createMockOfUnsafe<Events>(value);
  }

  public asOriginalType__(): EventsOriginal {
    return createMockOfUnsafe<EventsOriginal>(this);
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

    const fn = entry.fn as (...data: unknown[]) => unknown;
    this.off(entry.name, fn);
  }

  public on(name: string, callback: (...data: unknown[]) => unknown, ctx?: unknown): EventRefOriginal {
    this._[name] ??= [];
    const self = this.asOriginalType__();
    this._[name].push({ ctx, e: self, fn: callback, name });
    return { e: self, fn: callback, name };
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

  public tryTrigger(evt: EventRefOriginal, args: unknown[]): void {
    const entry = evt as Partial<EventsEntry>;
    if (!entry.fn || !entry.e) {
      return;
    }
    entry.fn.call(entry.e, ...args);
  }
}
