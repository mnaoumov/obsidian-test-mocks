/**
 * @file
 *
 * Mock of Obsidian's `App`, the root object that owns the vault, workspace, metadata cache and the other managers.
 */

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

/**
 * Mock of Obsidian's `App`, wiring together mocks of the vault, file manager, keymap, metadata cache, plugin
 * registry, scope, workspace, render context and secret storage.
 *
 * Use {@link App.createConfigured__} to get an app over an in-memory vault seeded with files.
 */
export class App {
  /**
   * The id that uniquely identifies the vault, for vault-specific storage.
   */
  public appId: string;
  /**
   * The file manager, which creates, deletes and renames files the way the UI does.
   */
  public fileManager: FileManager;
  /**
   * The keymap, which manages the lifecycle of keymap scopes.
   */
  public keymap: Keymap;
  /**
   * The last known user interaction event, which helps commands tell which modifier keys are pressed. `null` in the
   * mock until a test sets it.
   */
  public lastEvent: null | UserEventOriginal = null;
  /**
   * The metadata cache holding each markdown file's parsed links, headings, tags and frontmatter.
   */
  public metadataCache: MetadataCache;
  /**
   * The community-plugin registry, empty until a test registers a plugin.
   */
  public plugins: Plugins;
  /**
   * The render context, with helpers for rendering Bases values.
   */
  public renderContext: RenderContext;
  /**
   * The app-wide root keymap scope.
   */
  public scope: Scope;
  /**
   * The secret storage, which keeps secrets such as API keys out of plugin data.
   */
  public secretStorage: SecretStorage;
  /**
   * The vault over the app's data adapter.
   */
  public vault: Vault;
  /**
   * The workspace managing leaves, splits and views.
   */
  public workspace: Workspace;

  /**
   * Whether Obsidian is running on mobile.
   *
   * Answers from the mocked `Platform`, so a test that flips `Platform.isMobile` sees the change here
   * too — the two are the same fact, and Obsidian keeps them consistent as well.
   *
   * @returns The current `Platform.isMobile`.
   */
  public get isMobile(): boolean {
    return Platform.isMobile;
  }

  private readonly localStorage = new Map<string>();
  private theme: 'moonstone' | 'obsidian' = LIGHT_THEME;

  /**
   * Creates an app and its managers over a data adapter.
   *
   * @param adapter - The data adapter the vault reads and writes through.
   * @param appId - The id of the vault.
   */
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

  /**
   * Mock-only factory: creates an app, spyable via `vi.spyOn(App, 'create__')`.
   *
   * @param adapter - The data adapter the vault reads and writes through.
   * @param appId - The id of the vault.
   * @returns The new app.
   */
  public static create__(adapter: DataAdapterOriginal, appId: string): App {
    return new App(adapter, appId);
  }

  /**
   * Mock-only factory: creates an app with a ready-made vault, as the test setup does for the global `app`.
   *
   * Without an adapter, the vault uses a `FileSystemAdapter` mock rooted at `/mock-vault`. Each entry of
   * `options.files` becomes a file, or a folder when its path ends with `/`; missing parent folders are created first.
   *
   * @param options - The adapter or its case sensitivity, the app id (`mock-app-id` by default) and the files to seed.
   * @returns The new app.
   * @throws Error when a folder entry has non-empty content.
   */
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

  /**
   * Mock-only: views a value typed as Obsidian's `App` as this mock.
   *
   * @param value - The value typed as the original `App`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: AppOriginal): App {
    return strictProxy(value, App);
  }

  /**
   * Mock-only: views this mock as Obsidian's `App` type.
   *
   * @returns The same object, typed as the original `App`.
   */
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

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(App.prototype, 'constructor__')`.
   *
   * @param _adapter - The adapter the app was created with.
   * @param _appId - The id the app was created with.
   */
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

  /**
   * Checks whether the dark theme is active.
   *
   * @returns `true` when the theme is `obsidian`; the mock starts in the light theme.
   */
  public isDarkMode(): boolean {
    return this.theme === DARK_THEME;
  }

  /**
   * Retrieves a vault-specific value from `localStorage`. The mock keeps values in memory, per app instance.
   *
   * @param key - The key to read.
   * @returns The stored value, or `null` when nothing is stored under `key`.
   */
  public loadLocalStorage(key: string): unknown {
    return this.localStorage.get(key) ?? null;
  }

  /**
   * Saves a vault-specific value to `localStorage`; Obsidian clears the entry when `data` is `null`. The mock keeps
   * values in memory, per app instance, and stores `null` like any other value, which reads back the same as a cleared
   * entry.
   *
   * @param key - The key to write.
   * @param data - The value to save.
   */
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
