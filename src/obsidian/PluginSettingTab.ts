/**
 * @file
 *
 * Mock of Obsidian's `PluginSettingTab`, the settings tab a plugin registers.
 */

import type { PluginSettingTab as PluginSettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { Plugin } from './Plugin.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { SettingTab } from './SettingTab.ts';

/**
 * Mock of Obsidian's `PluginSettingTab`, which gives users a unified interface to configure a plugin.
 */
export abstract class PluginSettingTab extends SettingTab {
  /**
   * Mock-only: the plugin the tab was created for.
   */
  public plugin__: Plugin;

  /**
   * Creates a settings tab for `plugin`.
   *
   * @param app - The app instance.
   * @param plugin - The plugin the tab configures.
   */
  public constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin__ = plugin;
    const self = strictProxy(this);
    self.constructor2__(app, plugin);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `PluginSettingTab` as this mock.
   *
   * @param value - The value typed as the original `PluginSettingTab`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: PluginSettingTabOriginal): PluginSettingTab {
    return strictProxy(value, PluginSettingTab);
  }

  /**
   * Mock-only: views this mock as Obsidian's `PluginSettingTab` type.
   *
   * @returns The same object, typed as the original `PluginSettingTab`.
   */
  public asOriginalType2__(): PluginSettingTabOriginal {
    return strictProxy<PluginSettingTabOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(PluginSettingTab.prototype, 'constructor2__')`.
   *
   * @param _app - The app the tab was created with.
   * @param _plugin - The plugin the tab was created with.
   */
  public constructor2__(_app: App, _plugin: Plugin): void {
    noop();
  }
}
