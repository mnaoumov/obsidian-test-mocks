import type { Tasks as TasksOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';

export class Tasks {
  private readonly promises: Promise<unknown>[] = [];

  protected constructor() {
    const self = createMockOfUnsafe(this);
    self.constructor__();
    return self;
  }

  public static create__(): Tasks {
    return new Tasks();
  }

  public static fromOriginalType__(value: TasksOriginal): Tasks {
    return createMockOfUnsafe<Tasks>(value);
  }

  public add(callback: () => Promise<unknown>): void {
    this.promises.push(callback());
  }

  public addPromise(promise: Promise<unknown>): void {
    this.promises.push(promise);
  }

  public asOriginalType__(): TasksOriginal {
    return createMockOfUnsafe<TasksOriginal>(this);
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
