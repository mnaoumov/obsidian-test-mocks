/**
 * @file
 *
 * Mock of Obsidian's `Tasks`, a collector of pending promises that can be awaited together.
 */

import type { Tasks as TasksOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';

/**
 * Mock of Obsidian's `Tasks`: collects promises in memory and awaits them all at once.
 */
export class Tasks {
  private readonly promises: Promise<unknown>[] = [];

  /**
   * Creates an empty task collection.
   */
  protected constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only factory: creates an empty task collection, spyable via `vi.spyOn(Tasks, 'create__')`.
   *
   * @returns The new task collection.
   */
  public static create__(): Tasks {
    return new Tasks();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Tasks` as this mock.
   *
   * @param value - The value typed as the original `Tasks`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: TasksOriginal): Tasks {
    return strictProxy(value, Tasks);
  }

  /**
   * Starts a task by calling the callback immediately and collecting the promise it returns.
   *
   * @param callback - Starts the task and returns its promise.
   */
  public add(callback: () => Promise<unknown>): void {
    this.promises.push(callback());
  }

  /**
   * Collects an already-started promise.
   *
   * @param promise - The promise to collect.
   */
  public addPromise(promise: Promise<unknown>): void {
    this.promises.push(promise);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Tasks` type.
   *
   * @returns The same object, typed as the original `Tasks`.
   */
  public asOriginalType__(): TasksOriginal {
    return strictProxy<TasksOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Tasks.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Checks whether no promise has been collected.
   *
   * @returns `true` when nothing has been added.
   */
  public isEmpty(): boolean {
    return this.promises.length === 0;
  }

  /**
   * Waits for every collected promise.
   *
   * @returns A promise resolving to the array of results, rejecting as soon as any collected promise rejects.
   */
  public async promise(): Promise<unknown> {
    return Promise.all(this.promises);
  }
}
