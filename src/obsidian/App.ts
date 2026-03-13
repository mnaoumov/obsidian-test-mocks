import type {
  App as AppOriginal,
  DataAdapter as DataAdapterOriginal,
  UserEvent as UserEventOriginal
} from 'obsidian';

import type { CreateConfiguredParams } from '../internal/create-configured-params.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { FileManager } from './FileManager.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { Keymap } from './Keymap.ts';
import { MetadataCache } from './MetadataCache.ts';
import { Scope } from './Scope.ts';
import { Vault } from './Vault.ts';
import { Workspace } from './Workspace.ts';

export class App {
  public fileManager: FileManager;
  public keymap: Keymap;
  public lastEvent: null | UserEventOriginal = null;
  public metadataCache: MetadataCache;
  public scope: Scope;
  public vault: Vault;
  public workspace: Workspace;

  private readonly _localStorage = new Map<string, unknown>();

  protected constructor(adapter: DataAdapterOriginal, _appId: string) {
    this.vault = Vault.create2__(adapter);
    this.fileManager = FileManager.create__(this);
    this.keymap = Keymap.create__();
    this.metadataCache = MetadataCache.create2__(this, this.vault);
    this.scope = Scope.create__();
    this.workspace = Workspace.create2__(this, createDiv());
    const self = strictMock(this);
    self.constructor__(adapter, _appId);
    return self;
  }

  public static create__(adapter: DataAdapterOriginal, appId: string): App {
    return new App(adapter, appId);
  }

  public static async createConfigured__(params: CreateConfiguredParams = {}): Promise<App> {
    const adapter = params.adapter ?? FileSystemAdapter.create__('/mock-vault') as DataAdapterOriginal;
    const app = App.create__(adapter, params.appId ?? '');

    const neededFolders = new Set<string>();
    const fileEntries: [string, string][] = [];

    for (const [path, content] of Object.entries(params.files ?? {})) {
      if (path.endsWith('/')) {
        if (content !== '') {
          throw new Error(`Folder path "${path}" must have empty content`);
        }

        const folderPath = path.slice(0, -1);
        addFolderAndParents(neededFolders, folderPath);
      } else {
        const lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
          addFolderAndParents(neededFolders, path.slice(0, lastSlash));
        }

        fileEntries.push([path, content]);
      }
    }

    const sortedFolders = [...neededFolders].sort();
    for (const folder of sortedFolders) {
      await app.vault.createFolder(folder);
    }

    for (const [filePath, content] of fileEntries) {
      await app.vault.create(filePath, content);
    }

    return app;
  }

  public asOriginalType__(): AppOriginal {
    return castTo<AppOriginal>(this);
  }

  public constructor__(_adapter: DataAdapterOriginal, _appId: string): void {
    noop();
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
