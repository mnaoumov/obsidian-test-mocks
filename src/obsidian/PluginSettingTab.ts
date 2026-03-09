import type { PluginSettingTab as PluginSettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { Plugin } from './Plugin.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { SettingTab } from './SettingTab.ts';

export abstract class PluginSettingTab extends SettingTab {
  public plugin: Plugin;

  public constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
    return strictMock(this);
  }

  public override asOriginalType__(): PluginSettingTabOriginal {
    return castTo<PluginSettingTabOriginal>(this);
  }
}
