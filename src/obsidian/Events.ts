import type {
  EventRef,
  Events as EventsOriginal,
  Events as ObsidianEvents
} from 'obsidian';

import type { EventsEntry } from '../internal/Types.ts';

import { castTo } from '../internal/Cast.ts';

export class Events {
  private _: Record<string, EventsEntry[]> = {};

  protected constructor() {
  }

  public asOriginalType__(): EventsOriginal {
    return castTo<EventsOriginal>(this);
  }

  public off(name: string, callback: (...data: unknown[]) => unknown): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    this._[name] = entries.filter((entry) => entry.fn !== callback);
  }

  public offref(ref: EventRef): void {
    const entry = castTo<EventsEntry>(ref);
    this.off(entry.name, entry.fn as (...data: unknown[]) => unknown);
  }

  public on(name: string, callback: (...data: unknown[]) => unknown, ctx?: unknown): EventRef {
    if (!this._[name]) {
      this._[name] = [];
    }
    const self = castTo<ObsidianEvents>(this);
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

  public tryTrigger(evt: EventRef, args: unknown[]): void {
    const entry = castTo<EventsEntry>(evt);
    entry.fn.call(entry.e, ...args);
  }
}
