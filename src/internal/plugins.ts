/**
 * @file
 *
 * Mock of the community-plugin registry Obsidian exposes as `app.plugins`.
 */

import type {
  PluginManifest as PluginManifestOriginal,
  Plugin as PluginOriginal
} from 'obsidian';

import type { App } from '../obsidian/App.ts';

import { Events } from '../obsidian/Events.ts';
import { noop } from './noop.ts';
import {
  bypassStrictProxy,
  strictProxy
} from './strict-proxy.ts';

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
   * {@link manifests} follows the same registrations, and holds an entry only for a plugin that came
   * with a manifest.
   */
  public enabledPlugins = new Set<string>();
  /**
   * The manifests of the installed plugins, keyed by plugin id.
   *
   * Empty on a fresh registry for the same reason {@link plugins} is, and filled by
   * {@link registerPlugin__} from the instance's own {@link Plugin.manifest} — which is where Obsidian
   * takes it from too. A stand-in that carries no manifest registers the instance alone and leaves this
   * record untouched, so a test that needs the plugin's NAME rather than its instance — as
   * `obsidian-dev-utils`' resource lock does, reading `app.plugins.manifests[id]?.name` — assigns one
   * here directly.
   */
  public manifests: Record<string, PluginManifestOriginal> = {};
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
   * `asOriginalType2__()`, or any stand-in carrying the members under test. One carrying a
   * {@link Plugin.manifest} files it in {@link manifests} as installing the plugin does; one without
   * leaves that record alone.
   */
  public registerPlugin__(id: string, plugin: PluginOriginal): void {
    this.plugins[id] = plugin;
    this.enabledPlugins.add(id);
    // Read past the strict proxy: a stand-in built with `strictProxy` THROWS on a member it does not carry,
    // and "does this one carry a manifest?" is exactly the question that has to be answerable without one.
    const { manifest } = bypassStrictProxy<Partial<PluginOriginal>>(plugin);
    if (manifest) {
      this.manifests[id] = manifest;
    }
  }

  /**
   * Removes a plugin registered by {@link registerPlugin__}, the way uninstalling one does.
   *
   * @param id - The plugin id.
   */
  public unregisterPlugin__(id: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- `plugins` is Obsidian's own record keyed by plugin id, so removing an entry is a dynamic delete by definition.
    delete this.plugins[id];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- `manifests` is the same shape as `plugins`, keyed by the same plugin id.
    delete this.manifests[id];
    this.enabledPlugins.delete(id);
  }
}
