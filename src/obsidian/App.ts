import type { UserEvent } from 'obsidian';

import { strictMock } from '../internal/StrictMock.ts';
import { FileManager } from './FileManager.ts';
import { Keymap } from './Keymap.ts';
import { MetadataCache } from './MetadataCache.ts';
import { Scope } from './Scope.ts';
import { Vault } from './Vault.ts';
import { Workspace } from './Workspace.ts';

export class App {
  public fileManager: FileManager;
  public keymap: Keymap;
  public lastEvent: null | UserEvent = null;
  public metadataCache: MetadataCache;
  public scope: Scope;
  public vault: Vault;
  public workspace: Workspace;

  private readonly _localStorage = new Map<string, unknown>();

  public static __create(): App {
    return new App();
  }

  public static __constructor(_instance: App): void {
    // Spy hook.
  }

  protected constructor() {
    this.vault = Vault.__create();
    this.fileManager = FileManager.__create(this);
    this.keymap = Keymap.__create();
    this.metadataCache = MetadataCache.__create(this);
    this.scope = Scope.__create();
    this.workspace = Workspace.__create();
    const mock = strictMock(this);
    App.__constructor(mock);
    return mock;
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
