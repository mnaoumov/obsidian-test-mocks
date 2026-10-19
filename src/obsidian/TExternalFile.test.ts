import type { TExternalFile as TExternalFileOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureGenericObject } from '../internal/type-guards.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { TExternalFile } from './TExternalFile.ts';
import { TFile } from './TFile.ts';
import { Vault } from './Vault.ts';

function createVault(): Vault {
  return Vault.create2__(FileSystemAdapter.create__('/mock-vault').asOriginalType__());
}

describe('TExternalFile', () => {
  it('should create a TFile via create2__', () => {
    const file = TExternalFile.create2__(createVault(), '/outside/notes/report.md');
    expect(file).toBeInstanceOf(TExternalFile);
    expect(file).toBeInstanceOf(TFile);
  });

  it('should put the file: prefix in front of the real path', () => {
    const file = TExternalFile.create2__(createVault(), '/outside/notes/report.md');
    expect(file.path).toBe('file:/outside/notes/report.md');
  });

  it('should derive name, basename and extension from the real path', () => {
    const file = TExternalFile.create2__(createVault(), '/outside/notes/report.md');
    expect(file.name).toBe('report.md');
    expect(file.basename).toBe('report');
    expect(file.extension).toBe('md');
  });

  it('should return the real path from getRealPath', () => {
    const file = TExternalFile.create2__(createVault(), 'C:/outside/image.png');
    expect(file.getRealPath()).toBe('C:/outside/image.png');
  });

  it('should call constructor3__ with the vault and the real path', () => {
    const spy = vi.spyOn(TExternalFile.prototype, 'constructor3__');
    const vault = createVault();
    TExternalFile.create2__(vault, '/outside/a.md');
    expect(spy).toHaveBeenCalledWith(vault, '/outside/a.md');
    spy.mockRestore();
  });

  it('should throw when accessing an unmocked property', () => {
    const file = TExternalFile.create2__(createVault(), '/outside/a.md');
    const record = ensureGenericObject(file);
    expect(() => record['nonExistentProperty']).toThrow(
      'Property "nonExistentProperty" is not mocked in TExternalFile'
    );
  });

  it('should round-trip through asOriginalType3__ and fromOriginalType3__', () => {
    const file = TExternalFile.create2__(createVault(), '/outside/a.md');
    const original: TExternalFileOriginal = file.asOriginalType3__();
    const mock = TExternalFile.fromOriginalType3__(original);
    expect(mock.getRealPath()).toBe('/outside/a.md');
  });
});
