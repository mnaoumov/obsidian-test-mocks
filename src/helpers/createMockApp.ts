import type {
  App as ObsidianApp,
  DataAdapter
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { App } from '../obsidian/App.ts';
import { FileSystemAdapter } from '../obsidian/FileSystemAdapter.ts';

export interface MockAppParams {
  adapter?: DataAdapter;
  appId?: string;
  files?: MockFileEntry[];
  folders?: string[];
}

export interface MockFileEntry {
  content?: string;
  path: string;
}

export async function createMockApp(params: MockAppParams = {}): Promise<ObsidianApp> {
  const adapter = params.adapter ?? FileSystemAdapter.create__('/mock-vault') as unknown as DataAdapter;
  const app = App.create__(adapter, params.appId ?? '');

  const neededFolders = new Set<string>();

  for (const folderPath of params.folders ?? []) {
    addFolderAndParents(neededFolders, folderPath);
  }

  for (const fileOpt of params.files ?? []) {
    const lastSlash = fileOpt.path.lastIndexOf('/');
    if (lastSlash > 0) {
      addFolderAndParents(neededFolders, fileOpt.path.slice(0, lastSlash));
    }
  }

  const sortedFolders = [...neededFolders].sort();
  for (const folder of sortedFolders) {
    await app.vault.createFolder(folder);
  }

  for (const fileOpt of params.files ?? []) {
    await app.vault.create(fileOpt.path, fileOpt.content ?? '');
  }

  return castTo<ObsidianApp>(app);
}

function addFolderAndParents(folders: Set<string>, path: string): void {
  let current = path;
  while (current && current !== '/') {
    if (folders.has(current)) {
      break;
    }
    folders.add(current);
    const lastSlash = current.lastIndexOf('/');
    current = lastSlash > 0 ? current.slice(0, lastSlash) : '';
  }
}
