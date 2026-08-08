import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { fishAll } from './fishAll.ts';

describe('fishAll', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should return all matching elements', () => {
    const items = [document.createElement('div'), document.createElement('div')];
    for (const item of items) {
      item.className = 'item';
      document.body.append(item);
    }

    const results = fishAll('.item');
    expect(results).toHaveLength(items.length);
  });

  it('should return an empty array when no elements match', () => {
    const results = fishAll('.nonexistent');
    expect(results).toHaveLength(0);
  });
});
