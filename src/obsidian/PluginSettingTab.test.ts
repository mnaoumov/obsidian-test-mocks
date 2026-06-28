import type { PluginSettingTab as PluginSettingTabOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { App } from './App.ts';
import { Plugin } from './Plugin.ts';
import { PluginSettingTab } from './PluginSettingTab.ts';

class ConcretePluginSettingTab extends PluginSettingTab {
  public override display(): void {
    noop();
  }
}

describe('PluginSettingTab', () => {
  it('should create an instance', () => {
    const app = App.createConfigured__();
    // Create a minimal plugin mock
    const plugin = strictProxy<Plugin>({ app });
    const tab = new ConcretePluginSettingTab(app, plugin);
    expect(tab).toBeInstanceOf(PluginSettingTab);
  });

  it('should have plugin__ property', () => {
    const app = App.createConfigured__();
    const plugin = strictProxy<Plugin>({ app });
    const tab = new ConcretePluginSettingTab(app, plugin);
    expect(tab.plugin__).toBe(plugin);
  });

  it('should have app property', () => {
    const app = App.createConfigured__();
    const plugin = strictProxy<Plugin>({ app });
    const tab = new ConcretePluginSettingTab(app, plugin);
    expect(tab.app).toBe(app);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const plugin = strictProxy<Plugin>({ app });
      const tab = new ConcretePluginSettingTab(app, plugin);
      const original: PluginSettingTabOriginal = tab.asOriginalType2__();
      expect(original).toBe(tab);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const plugin = strictProxy<Plugin>({ app });
      const tab = new ConcretePluginSettingTab(app, plugin);
      const mock = PluginSettingTab.fromOriginalType2__(tab.asOriginalType2__());
      expect(mock).toBe(tab);
    });
  });
});
