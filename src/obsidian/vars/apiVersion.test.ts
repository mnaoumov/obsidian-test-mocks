import obsidianManifest from 'obsidian/package.json';
import {
  describe,
  expect,
  it
} from 'vitest';

import { apiVersion } from './apiVersion.ts';

describe('apiVersion', () => {
  it('should be a valid version string', () => {
    expect(apiVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should match the installed obsidian package version (the recorded API baseline)', () => {
    expect(apiVersion).toBe(obsidianManifest.version);
  });
});
