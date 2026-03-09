import type { App as AppOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { createMockApp } from '../../src/helpers/createMockApp.ts';
import { App } from '../../src/obsidian/App.ts';

describe('App', () => {
  it('should create an instance via createMockApp', async () => {
    const app = await createMockApp();
    expect(app).toBeInstanceOf(App);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', async () => {
      const app = await createMockApp();
      const original: AppOriginal = app.asOriginalType__();
      expect(original).toBe(app);
    });

    it('should throw when accessing an unmocked property', async () => {
      const app = await createMockApp();
      const record = app as unknown as Record<string, unknown>;
      expect(() => record['nonExistentProperty']).toThrow(
        'Property "nonExistentProperty" is not mocked in App. To override, assign a value first: mock.nonExistentProperty = ...'
      );
    });

    it('should allow accessing a property after assigning it', async () => {
      const app = await createMockApp();
      const record = app as unknown as Record<string, unknown>;
      const mockValue = { test: true };
      record['customProperty'] = mockValue;
      expect(record['customProperty']).toBe(mockValue);
    });
  });
});
