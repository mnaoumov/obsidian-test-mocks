import type { Tasks as TasksOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { Tasks } from './Tasks.ts';

describe('Tasks', () => {
  it('should start empty', () => {
    const tasks = Tasks.create__();
    expect(tasks.isEmpty()).toBe(true);
  });

  it('should not be empty after add', () => {
    const tasks = Tasks.create__();
    tasks.add(() => Promise.resolve());
    expect(tasks.isEmpty()).toBe(false);
  });

  it('should not be empty after addPromise', () => {
    const tasks = Tasks.create__();
    tasks.addPromise(Promise.resolve());
    expect(tasks.isEmpty()).toBe(false);
  });

  it('should invoke the callback immediately on add', () => {
    const tasks = Tasks.create__();
    let called = false;
    tasks.add(() => {
      called = true;
      return Promise.resolve();
    });
    expect(called).toBe(true);
  });

  it('should resolve all promises on promise()', async () => {
    const tasks = Tasks.create__();
    const results: string[] = [];
    tasks.add(() => {
      results.push('a');
      return Promise.resolve();
    });
    tasks.addPromise(
      Promise.resolve().then(() => {
        results.push('b');
      })
    );
    await tasks.promise();
    expect(results).toEqual(['a', 'b']);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const tasks = Tasks.create__();
      const original: TasksOriginal = tasks.asOriginalType__();
      expect(original).toBe(tasks);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const tasks = Tasks.create__();
      const mock = Tasks.fromOriginalType__(tasks.asOriginalType__());
      expect(mock).toBe(tasks);
    });
  });
});
