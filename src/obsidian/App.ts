import type {
  App as ObsidianApp,
  UserEvent
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { FileManager } from './FileManager.ts';
import { Keymap } from './Keymap.ts';
import { MetadataCache } from './MetadataCache.ts';
import { Scope } from './Scope.ts';
import { Vault } from './Vault.ts';
import { Workspace } from './Workspace.ts';

export interface MockAppParams {
  files?: MockFileEntry[];
  folders?: string[];
}

export interface MockFileEntry {
  content?: string;
  path: string;
}

export class App {
  public fileManager = FileManager.__create(this);
  public keymap = Keymap.__create();
  public lastEvent: null | UserEvent = null;
  public metadataCache = MetadataCache.__create();
  public scope = Scope.__create();
  public vault = Vault.__create();
  public workspace = Workspace.__create();

  private readonly _localStorage = new Map<string, unknown>();

  public static __create(): App {
    return new App();
  }

  public static __constructor(_instance: App): void {
    // Spy hook.
  }

  protected constructor() {
    this.metadataCache._app = this;
    App.__constructor(this);
    return strictMock(this);
  }

  public isDarkMode(): boolean {
    return false;
  }

  public loadLocalStorage(key: string): unknown {
    return this._localStorage.get(key) ?? null;
  }

  public saveLocalStorage(key: string, data: unknown): void {
    this._localStorage.set(key, data);
  }
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
