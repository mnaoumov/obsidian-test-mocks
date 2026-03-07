import type { App as ObsidianApp } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { App } from '../obsidian/App.ts';

export interface MockAppParams {
  files?: MockFileEntry[];
  folders?: string[];
}

export interface MockFileEntry {
  content?: string;
  path: string;
}

export async function createMockApp(params: MockAppParams = {}): Promise<ObsidianApp> {
  const app = App.__create();

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
