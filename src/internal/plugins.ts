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
  public app: App;
  /**
   * The ids of the enabled plugins.
   *
   * Kept in step with {@link plugins} by {@link registerPlugin__} / {@link unregisterPlugin__}: this
   * mock has no notion of a plugin that is installed but switched off, so the two always agree.
   */
  public enabledPlugins = new Set<string>();
  public plugins: Record<string, PluginOriginal> = {};

  protected constructor(app: App) {
    super();
    this.app = app;
    const self = strictProxy(this);
    self.constructor2__(app);
    return self;
  }

  public static create2__(app: App): Plugins {
    return new Plugins(app);
  }

  public constructor2__(_app: App): void {
    noop();
  }

  public getPlugin(id: string): null | PluginOriginal {
    return this.plugins[id] ?? null;
  }

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
