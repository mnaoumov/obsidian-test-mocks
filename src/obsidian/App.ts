import type {
  App as AppOriginal,
  DataAdapter as DataAdapterOriginal,
  UserEvent as UserEventOriginal
} from 'obsidian';

import type { AppCreateConfiguredOptions } from '../internal/app-create-configured-options.ts';

import { noop } from '../internal/noop.ts';
import { Plugins } from '../internal/plugins.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { FileManager } from './FileManager.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { Keymap } from './Keymap.ts';
import { MetadataCache } from './MetadataCache.ts';
import { RenderContext } from './RenderContext.ts';
import { Scope } from './Scope.ts';
import { SecretStorage } from './SecretStorage.ts';
import { Platform } from './vars/Platform.ts';
import { Vault } from './Vault.ts';
import { Workspace } from './Workspace.ts';

/**
 * Obsidian's name for the dark theme.
 */
const DARK_THEME = 'obsidian';

/**
 * Obsidian's name for the light theme.
 */
const LIGHT_THEME = 'moonstone';

export class App {
  public appId: string;
  public fileManager: FileManager;
  public keymap: Keymap;
  public lastEvent: null | UserEventOriginal = null;
  public metadataCache: MetadataCache;
  public plugins: Plugins;
  public renderContext: RenderContext;
  public scope: Scope;
  public secretStorage: SecretStorage;
  public vault: Vault;
  public workspace: Workspace;

  /**
   * Whether Obsidian is running on mobile.
   *
   * Answers from the mocked `Platform`, so a test that flips `Platform.isMobile` sees the change here
   * too — the two are the same fact, and Obsidian keeps them consistent as well.
   */
  public get isMobile(): boolean {
    return Platform.isMobile;
  }

  private readonly localStorage = new Map<string>();
  private theme: 'moonstone' | 'obsidian' = LIGHT_THEME;

  protected constructor(adapter: DataAdapterOriginal, appId: string) {
    this.appId = appId;
    this.vault = Vault.create2__(adapter);
    this.fileManager = FileManager.create__(this);
    this.keymap = Keymap.create__();
    this.metadataCache = MetadataCache.create2__(this, this.vault);
    this.plugins = Plugins.create2__(this);
    this.scope = Scope.create__();
    this.workspace = Workspace.create2__(this, createDiv());
    this.renderContext = RenderContext.create__(this);
    this.secretStorage = SecretStorage.create2__(this);
    const self = strictProxy(this);
    self.constructor__(adapter, appId);
    return self;
  }

  public static create__(adapter: DataAdapterOriginal, appId: string): App {
    return new App(adapter, appId);
  }

  // eslint-disable-next-line obsidian-dev-utils/params-options-name-match -- The rule derives `AppCreateConfigured__Options` from the method name, which the core `camelcase` rule then rejects for its embedded `__`. `AppCreateConfiguredOptions` carries the same owner prefix and optional-bag suffix without the collision.
  public static createConfigured__(options: AppCreateConfiguredOptions = {}): App {
    let adapter: DataAdapterOriginal;
    if (options.adapter) {
      adapter = options.adapter;
    } else {
      const mockAdapter = FileSystemAdapter.create__('/mock-vault');
      if (options.isAdapterCaseInsensitive) {
        mockAdapter.insensitive = true;
      }
      adapter = mockAdapter.asOriginalType__();
    }
    const app = App.create__(adapter, options.appId ?? 'mock-app-id');

    const neededFolders = new Set<string>();
    const fileEntries: [string, string][] = [];

    for (const [path, content] of Object.entries(options.files ?? {})) {
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
      app.vault.createFolderSync__(folder);
    }

    for (const [filePath, content] of fileEntries) {
      app.vault.createSync__(filePath, content);
    }

    return app;
  }

  public static fromOriginalType__(value: AppOriginal): App {
    return strictProxy(value, App);
  }

  public asOriginalType__(): AppOriginal {
    return strictProxy<AppOriginal>(this);
  }

  /**
   * Switches the theme, the way the appearance settings do.
   *
   * @param theme - The theme to switch to.
   */
  public changeTheme(theme: 'moonstone' | 'obsidian'): void {
    this.theme = theme;
  }

  public constructor__(_adapter: DataAdapterOriginal, _appId: string): void {
    noop();
  }

  /**
   * The active theme.
   *
   * @returns `'moonstone'` for the light theme, `'obsidian'` for the dark one.
   */
  public getTheme(): 'moonstone' | 'obsidian' {
    return this.theme;
  }

  public isDarkMode(): boolean {
    return this.theme === DARK_THEME;
  }

  public loadLocalStorage(key: string): unknown {
    return this.localStorage.get(key) ?? null;
  }

  public saveLocalStorage(key: string, data: unknown): void {
    this.localStorage.set(key, data);
  }

  /**
   * Records the theme without applying it.
   *
   * Obsidian distinguishes this from {@link changeTheme}, which also re-renders; the mock has nothing
   * to re-render, so both simply store.
   *
   * @param theme - The theme to record.
   */
  public setTheme(theme: 'moonstone' | 'obsidian'): void {
    this.theme = theme;
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
