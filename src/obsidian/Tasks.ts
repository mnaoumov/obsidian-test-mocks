import type { Tasks as TasksOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

export class Tasks {
  private readonly promises: Promise<unknown>[] = [];

  protected constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static create__(): Tasks {
    return new Tasks();
  }

  public static fromOriginalType__(value: TasksOriginal): Tasks {
    return strictProxy(value, Tasks);
  }

  public add(callback: () => Promise<unknown>): void {
    this.promises.push(callback());
  }

  public addPromise(promise: Promise<unknown>): void {
    this.promises.push(promise);
  }

  public asOriginalType__(): TasksOriginal {
    return strictProxy<TasksOriginal>(this);
  }

  public constructor__(): void {
    noop();
  }

  public isEmpty(): boolean {
    return this.promises.length === 0;
  }

  public async promise(): Promise<unknown> {
    return Promise.all(this.promises);
  }
}
