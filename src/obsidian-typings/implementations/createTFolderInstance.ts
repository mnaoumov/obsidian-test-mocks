import type {
  App,
  TFolder
} from 'obsidian';

import { castTo } from '../../internal/Cast.ts';
import { TFolder as MockTFolder } from '../../obsidian/TFolder.ts';
import { Vault as MockVault } from '../../obsidian/Vault.ts';
import { parentFolderPath } from './parentFolderPath.ts';

export function createTFolderInstance(app: App, path: string): TFolder {
  let folder = app.vault.getFolderByPath(path);
  if (folder) {
    return folder;
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- Mock implementation requires deprecated constructor.
  const mockFolder = new MockTFolder(castTo<MockVault>(app.vault), path);
  if (path !== '/') {
    mockFolder.parent = castTo(createTFolderInstance(app, parentFolderPath(path)));
  }
  mockFolder.deleted = true;
  return castTo<TFolder>(mockFolder);
}
