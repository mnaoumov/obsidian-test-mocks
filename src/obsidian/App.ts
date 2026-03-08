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

  public static create__(): App {
    return new App();
  }

  public static constructor__(_instance: App): void {
    // Spy hook.
  }

  protected constructor() {
    this.vault = Vault.create__();
    this.fileManager = FileManager.create__(this);
    this.keymap = Keymap.create__();
    this.metadataCache = MetadataCache.create__(this);
    this.scope = Scope.create__();
    this.workspace = Workspace.create__();
    const mock = strictMock(this);
    App.constructor__(mock);
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
