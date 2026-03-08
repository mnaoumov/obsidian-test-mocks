import type { Tasks as RealTasks } from 'obsidian';
import { strictCastTo } from '../internal/StrictMock.ts';

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
    return strictCastTo<RealTasks>(this);
  }
}
