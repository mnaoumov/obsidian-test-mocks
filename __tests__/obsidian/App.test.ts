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

    it('should throw when accessing an unmocked property via the original type', async () => {
      const app = await createMockApp();
      const original = app.asOriginalType__();
      expect(() => original.internalPlugins).toThrow(
        'Property "internalPlugins" is not mocked in App. To override, assign a value first: mock.internalPlugins = ...'
      );
    });

    it('should allow accessing an unmocked property after assigning it', async () => {
      const app = await createMockApp();
      const original = app.asOriginalType__();
      const mockPlugins = { manifests: {} };
      original.internalPlugins = mockPlugins;
      expect(original.internalPlugins).toBe(mockPlugins);
    });
  });
});
