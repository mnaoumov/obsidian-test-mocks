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
    this.metadataCache.app = this;
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

  for (const folderPath of params.folders ?? []) {
    await app.vault.createFolder(folderPath);
  }

  for (const fileOpt of params.files ?? []) {
    await app.vault.create(fileOpt.path, fileOpt.content ?? '');
  }

  return castTo<ObsidianApp>(app);
}
