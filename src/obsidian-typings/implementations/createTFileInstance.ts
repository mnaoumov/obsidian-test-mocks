import type {
  App,
  TFile
} from 'obsidian';

import { castTo } from '../../internal/Cast.ts';
import { TFile as MockTFile } from '../../obsidian/TFile.ts';
import { Vault as MockVault } from '../../obsidian/Vault.ts';
import { createTFolderInstance } from './createTFolderInstance.ts';
import { parentFolderPath } from './parentFolderPath.ts';

export function createTFileInstance(app: App, path: string): TFile {
  let file = app.vault.getFileByPath(path);
  if (file) {
    return file;
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- Mock implementation requires deprecated constructor.
  const mockFile = new MockTFile(castTo<MockVault>(app.vault), path);
  mockFile.parent = castTo(createTFolderInstance(app, parentFolderPath(path)));
  mockFile.deleted = true;
  return castTo<TFile>(mockFile);
}
