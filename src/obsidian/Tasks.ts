import type { Tasks as TasksOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';

export class Tasks {
  private readonly promises: Promise<unknown>[] = [];

  public add(callback: () => Promise<unknown>): void {
    this.promises.push(callback());
  }

  public addPromise(promise: Promise<unknown>): void {
    this.promises.push(promise);
  }

  public asOriginalType__(): TasksOriginal {
    return castTo<TasksOriginal>(this);
  }

  public isEmpty(): boolean {
    return this.promises.length === 0;
  }

  public async promise(): Promise<unknown> {
    return Promise.all(this.promises);
  }
}
