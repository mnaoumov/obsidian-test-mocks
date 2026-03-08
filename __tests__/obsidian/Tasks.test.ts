import {
  describe,
  expect,
  it
} from 'vitest';

import { Tasks } from '../../src/obsidian/Tasks.ts';

describe('Tasks', () => {
  it('should start empty', () => {
    const tasks = new Tasks();
    expect(tasks.isEmpty()).toBe(true);
  });

  it('should not be empty after add', () => {
    const tasks = new Tasks();
    tasks.add(() => Promise.resolve());
    expect(tasks.isEmpty()).toBe(false);
  });

  it('should not be empty after addPromise', () => {
    const tasks = new Tasks();
    tasks.addPromise(Promise.resolve());
    expect(tasks.isEmpty()).toBe(false);
  });

  it('should invoke the callback immediately on add', () => {
    const tasks = new Tasks();
    let called = false;
    tasks.add(() => {
      called = true;
      return Promise.resolve();
    });
    expect(called).toBe(true);
  });

  it('should resolve all promises on promise()', async () => {
    const tasks = new Tasks();
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
});
