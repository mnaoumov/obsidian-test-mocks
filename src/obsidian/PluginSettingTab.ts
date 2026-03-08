import { castTo } from '../internal/Cast.ts';
import type { PluginSettingTab as RealPluginSettingTab } from 'obsidian';

import type { App } from './App.ts';
import type { Plugin } from './Plugin.ts';

import {
  strictMock
} from '../internal/StrictMock.ts';
import { SettingTab } from './SettingTab.ts';

export abstract class PluginSettingTab extends SettingTab {
  public plugin: Plugin;

  public constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
    const mock = strictMock(this);
    PluginSettingTab.constructor__(mock, app, plugin);
    return mock;
  }

  public static override constructor__(_instance: PluginSettingTab, _app: App, _plugin: Plugin): void {
    // Spy hook.
  }

  public override asReal__(): RealPluginSettingTab {
    return castTo<RealPluginSettingTab>(this);
  }
}
