/**
 * @file
 *
 * Mock of the community-plugin registry Obsidian exposes as `app.plugins`.
 */

import type { Plugin as PluginOriginal } from 'obsidian';

import type { App } from '../obsidian/App.ts';

import { Events } from '../obsidian/Events.ts';
import { noop } from './noop.ts';
import { strictProxy } from './strict-proxy.ts';

/**
 * The community-plugin registry behind {@link App.plugins}.
 *
 * Lives here rather than in `src/obsidian/` because `Plugins` is an `obsidian-typings` interface with
 * no `obsidian.d.ts` counterpart — the same case L7 settles for `DataAdapter`, whose implementation is
 * {@link InMemoryAdapter} in this folder.
 *
 * A mock vault genuinely has no community plugins installed, so an empty registry is the truth about
 * it rather than a placeholder: {@link getPlugin} answering `null` is a real answer. A test that needs
 * one seeds it with {@link registerPlugin__}.
 *
 * Only that honest core is modeled. Everything else `obsidian-typings` declares on `Plugins` — the
 * enable/disable lifecycle, installing, updates, deprecation — stays unmocked and throws through the
 * strict proxy, which is how this package says "not modeled" rather than quietly answering
 * `undefined`.
 */
export class Plugins extends Events {
  /**
   * The app this registry belongs to.
   */
  public app: App;
  /**
   * The ids of the enabled plugins.
   *
   * Kept in step with {@link plugins} by {@link registerPlugin__} / {@link unregisterPlugin__}: this
   * mock has no notion of a plugin that is installed but switched off, so the two always agree.
   */
  public enabledPlugins = new Set<string>();
  /**
   * The loaded plugin instances, keyed by plugin id.
   */
  public plugins: Record<string, PluginOriginal> = {};

  /**
   * Creates an empty registry.
   *
   * @param app - The app this registry belongs to.
   */
  protected constructor(app: App) {
    super();
    this.app = app;
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a plugin registry, spyable via `vi.spyOn(Plugins, 'create2__')`. Numbered because
   * it is the subclass variant of the `Events` factory.
   *
   * @param app - The app this registry belongs to.
   * @returns The new registry.
   */
  public static create2__(app: App): Plugins {
    return new Plugins(app);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Plugins.prototype, 'constructor2__')`.
   *
   * @param _app - The app the registry was created with.
   */
  public constructor2__(_app: App): void {
    noop();
  }

  /**
   * Gets a loaded plugin by id.
   *
   * @param id - The plugin id.
   * @returns The plugin instance, or `null` when no plugin with that id is registered.
   */
  public getPlugin(id: string): null | PluginOriginal {
    return this.plugins[id] ?? null;
  }

  /**
   * Gets the folder community plugins are installed in.
   *
   * @returns The vault's config folder followed by `/plugins`.
   */
  public getPluginFolder(): string {
    return `${this.app.vault.configDir}/plugins`;
  }

  /**
   * Registers a plugin as installed and enabled, the way loading one does.
   *
   * @param id - The plugin id, as {@link getPlugin} is called with.
   * @param plugin - The instance {@link getPlugin} should answer. A full {@link Plugin} mock via
   * `asOriginalType2__()`, or any stand-in carrying the members under test.
   */
  public registerPlugin__(id: string, plugin: PluginOriginal): void {
    this.plugins[id] = plugin;
    this.enabledPlugins.add(id);
  }

  /**
   * Removes a plugin registered by {@link registerPlugin__}, the way uninstalling one does.
   *
   * @param id - The plugin id.
   */
  public unregisterPlugin__(id: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- `plugins` is Obsidian's own record keyed by plugin id, so removing an entry is a dynamic delete by definition.
    delete this.plugins[id];
    this.enabledPlugins.delete(id);
  }
}
