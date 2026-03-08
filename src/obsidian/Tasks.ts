import { castTo } from '../internal/Cast.ts';
import type { Tasks as RealTasks } from 'obsidian';

export class Tasks {
  private readonly promises: Promise<unknown>[] = [];

  public add(callback: () => Promise<unknown>): void {
    this.promises.push(callback());
  }

  public addPromise(promise: Promise<unknown>): void {
    this.promises.push(promise);
  }

  public isEmpty(): boolean {
    return this.promises.length === 0;
  }

  public async promise(): Promise<unknown> {
    return Promise.all(this.promises);
  }

  public asReal__(): RealTasks {
    return castTo<RealTasks>(this);
  }
}
