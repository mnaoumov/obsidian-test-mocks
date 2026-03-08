import { castTo } from '../internal/Cast.ts';
import type {
  App as RealApp,
  DataAdapter,
  UserEvent
} from 'obsidian';

import {
  strictMock
} from '../internal/StrictMock.ts';
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

  protected constructor(adapter: DataAdapter, _appId: string) {
    this.vault = Vault.create__(adapter);
    this.fileManager = FileManager.create__(this);
    this.keymap = Keymap.create__();
    this.metadataCache = MetadataCache.create__(this, this.vault);
    this.scope = Scope.create__();
    this.workspace = Workspace.create__(this, createDiv());
    const mock = strictMock(this);
    App.constructor__(mock, adapter, _appId);
    return mock;
  }

  public static constructor__(_instance: App, _adapter: DataAdapter, _appId: string): void {
    // Spy hook.
  }

  public static create__(adapter: DataAdapter, _appId: string): App {
    return new App(adapter, _appId);
  }

  public asReal__(): RealApp {
    return castTo<RealApp>(this);
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
