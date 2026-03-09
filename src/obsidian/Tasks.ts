import type { Tasks as TasksOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';

export class Tasks {
  private readonly promises: Promise<unknown>[] = [];

  protected constructor() {
    noop();
  }

  public static create__(): Tasks {
    return strictMock(new Tasks());
  }

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
