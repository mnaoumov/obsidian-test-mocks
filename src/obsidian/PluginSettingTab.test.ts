import type { PluginSettingTab as PluginSettingTabOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { App } from './App.ts';
import { PluginSettingTab } from './PluginSettingTab.ts';

class ConcretePluginSettingTab extends PluginSettingTab {
  public display(): void {
    // Noop
  }
}

describe('PluginSettingTab', () => {
  it('should create an instance', async () => {
    const app = await App.createConfigured__();
    // Create a minimal plugin mock
    const plugin = { app } as never;
    const tab = new ConcretePluginSettingTab(app, plugin);
    expect(tab).toBeInstanceOf(PluginSettingTab);
  });

  it('should have plugin property', async () => {
    const app = await App.createConfigured__();
    const plugin = { app } as never;
    const tab = new ConcretePluginSettingTab(app, plugin);
    expect(tab.plugin).toBe(plugin);
  });

  it('should have app property', async () => {
    const app = await App.createConfigured__();
    const plugin = { app } as never;
    const tab = new ConcretePluginSettingTab(app, plugin);
    expect(tab.app).toBe(app);
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', async () => {
      const app = await App.createConfigured__();
      const plugin = { app } as never;
      const tab = new ConcretePluginSettingTab(app, plugin);
      const original: PluginSettingTabOriginal = tab.asOriginalType2__();
      expect(original).toBe(tab);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', async () => {
      const app = await App.createConfigured__();
      const plugin = { app } as never;
      const tab = new ConcretePluginSettingTab(app, plugin);
      const mock = PluginSettingTab.fromOriginalType2__(tab.asOriginalType2__());
      expect(mock).toBe(tab);
    });
  });
});
