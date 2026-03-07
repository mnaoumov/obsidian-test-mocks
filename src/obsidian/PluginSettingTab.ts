import type { App } from './App.ts';
import type { Plugin } from './Plugin.ts';

import { strictMock } from '../internal/StrictMock.ts';
import { SettingTab } from './SettingTab.ts';

export abstract class PluginSettingTab extends SettingTab {
  public plugin: Plugin;

  public constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
    const mock = strictMock(this);
    PluginSettingTab.__constructor(mock, app, plugin);
    return mock;
  }

  public static override __constructor(_instance: PluginSettingTab, _app: App, _plugin: Plugin): void {
    // Spy hook.
  }
}
