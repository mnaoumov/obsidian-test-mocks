import type { PluginSettingTab as PluginSettingTabOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { Plugin } from './Plugin.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { SettingTab } from './SettingTab.ts';

export abstract class PluginSettingTab extends SettingTab {
  public plugin: Plugin;

  public constructor(app: App, plugin: Plugin) {
    super(app);
    this.plugin = plugin;
    const self = strictProxy(this);
    self.constructor2__(app, plugin);
    return self;
  }

  public static fromOriginalType2__(value: PluginSettingTabOriginal): PluginSettingTab {
    return bridgeType<PluginSettingTab>(value);
  }

  public asOriginalType2__(): PluginSettingTabOriginal {
    return bridgeType<PluginSettingTabOriginal>(this);
  }

  public constructor2__(_app: App, _plugin: Plugin): void {
    noop();
  }
}
