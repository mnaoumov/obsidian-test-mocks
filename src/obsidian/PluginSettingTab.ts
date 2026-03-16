import type { PluginSettingTab as PluginSettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { Plugin } from './Plugin.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { SettingTab } from './SettingTab.ts';

export abstract class PluginSettingTab extends SettingTab {
  public plugin: Plugin;

  public constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
    const self = createMockOfUnsafe(this);
    self.constructor2__(app, plugin);
    return self;
  }

  public static fromOriginalType2__(value: PluginSettingTabOriginal): PluginSettingTab {
    return createMockOfUnsafe<PluginSettingTab>(value);
  }

  public asOriginalType2__(): PluginSettingTabOriginal {
    return createMockOfUnsafe<PluginSettingTabOriginal>(this);
  }

  public constructor2__(_app: App, _plugin: Plugin): void {
    noop();
  }
}
