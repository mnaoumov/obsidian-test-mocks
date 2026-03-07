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
    this.metadataCache.app = this;
    App.__constructor(this);
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
  const app = App.__create();

  for (const folderPath of params.folders ?? []) {
    const folder = TFolder.__create(app.vault, folderPath);
    setVaultAbstractFile(app.vault, folderPath, folder);
    app.vault.adapter.mkdir(folderPath);
  }

  for (const fileOpt of params.files ?? []) {
    const file = TFile.__create(app.vault, fileOpt.path);
    setVaultAbstractFile(app.vault, fileOpt.path, file);
    const content = fileOpt.content ?? '';
    app.vault.adapter.write(fileOpt.path, content);
  }

  return castTo<ObsidianApp>(app);
}
