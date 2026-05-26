import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { ensureGenericObject } from '../../internal/type-guards.ts';
import { App } from '../../obsidian/App.ts';
import { TFile } from '../../obsidian/TFile.ts';
import { TFolder } from '../../obsidian/TFolder.ts';
import {
  bridgeTAbstractFile,
  unbridgeTAbstractFile
} from './t-abstract-file-bridge.ts';

describe('t-abstract-file-bridge', () => {
  afterEach(() => {
    unbridgeTAbstractFile();
  });

  it('should bridge deleted getter on TFile', () => {
    bridgeTAbstractFile();
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'test.md');
    file.deleted__ = true;
    expect(ensureGenericObject(file)['deleted']).toBe(true);
  });

  it('should bridge deleted setter on TFile', () => {
    bridgeTAbstractFile();
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'test.md');
    ensureGenericObject(file)['deleted'] = true;
    expect(file.deleted__).toBe(true);
  });

  it('should bridge deleted getter on TFolder', () => {
    bridgeTAbstractFile();
    const app = App.createConfigured__();
    const folder = TFolder.create__(app.vault, 'dir');
    folder.deleted__ = true;
    expect(ensureGenericObject(folder)['deleted']).toBe(true);
  });

  it('should not overwrite if property already exists', () => {
    bridgeTAbstractFile();
    bridgeTAbstractFile();
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'test.md');
    expect(ensureGenericObject(file)['deleted']).toBe(false);
  });

  it('should remove bridge on unbridge', () => {
    bridgeTAbstractFile();
    unbridgeTAbstractFile();
    const app = App.createConfigured__();
    const file = TFile.create__(app.vault, 'test.md');
    expect('deleted' in file).toBe(false);
  });
});
