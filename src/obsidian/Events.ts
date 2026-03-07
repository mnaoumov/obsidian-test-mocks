import type { EventRef } from 'obsidian';
import type { EventsEntry } from 'obsidian-typings';

export class Events {
  public _: Record<string, EventsEntry[]> = {};

  public off(name: string, callback: (...data: unknown[]) => unknown): void {
    const entries = this._[name];
    if (!entries) {
      return;
    }
    this._[name] = entries.filter((entry) => entry.fn !== callback);
  }

  public offref(ref: EventRef): void {
    this.off(ref.name, ref.fn as (...data: unknown[]) => unknown);
  }

  public on(name: string, callback: (...data: unknown[]) => unknown, ctx?: unknown): EventRef {
    if (!this._[name]) {
      this._[name] = [];
    }
    this._[name].push({ ctx, e: this, fn: callback, name });
    return { e: this, fn: callback, name };
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
    evt.fn.call(evt.e, ...args);
  }
}
