import type { UserEvent } from 'obsidian';

import { App as ObsidianApp } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { FileManager } from './FileManager.ts';
import { Keymap } from './Keymap.ts';
import { MetadataCache } from './MetadataCache.ts';
import { Scope } from './Scope.ts';
import { TFile } from './TFile.ts';
import { TFolder } from './TFolder.ts';
import {
  setVaultAbstractFile,
  Vault
} from './Vault.ts';
import { Workspace } from './Workspace.ts';

export interface MockAppParams {
  files?: MockFileEntry[];
  folders?: string[];
}

export interface MockFileEntry {
  content?: string;
  extension?: string;
  path: string;
}

export class App {
  public fileManager = new FileManager(this);
  public keymap = new Keymap();
  public lastEvent: null | UserEvent = null;
  public metadataCache = new MetadataCache();
  public scope = new Scope();
  public vault = new Vault();
  public workspace = new Workspace();

  private readonly _localStorage = new Map<string, unknown>();

  public constructor() {
    this.metadataCache.app = this;
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

export function createMockApp(params: MockAppParams = {}): ObsidianApp {
  const app = new App();

  for (const folderPath of params.folders ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Creating mock file system entries.
    const folder = new TFolder(app.vault, folderPath);
    setVaultAbstractFile(app.vault, folderPath, folder);
    app.vault.adapter.mkdir(folderPath);
  }

  for (const fileOpt of params.files ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Creating mock file system entries.
    const file = new TFile(app.vault, fileOpt.path);
    setVaultAbstractFile(app.vault, fileOpt.path, file);
    const content = fileOpt.content ?? '';
    app.vault.adapter.write(fileOpt.path, content);
  }

  return castTo<ObsidianApp>(app);
}
