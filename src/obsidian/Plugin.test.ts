import type {
  MarkdownPostProcessorContext as MarkdownPostProcessorContextOriginal,
  PluginManifest as PluginManifestOriginal,
  Plugin as PluginOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { strictProxy } from '../internal/strict-proxy.ts';
import { App } from './App.ts';
import { Plugin } from './Plugin.ts';

const MANIFEST: PluginManifestOriginal = {
  author: 'test',
  description: 'test plugin',
  id: 'test-plugin',
  isDesktopOnly: false,
  minAppVersion: '1.0.0',
  name: 'Test Plugin',
  version: '1.0.0'
};

class ConcretePlugin extends Plugin {
  public override onload(): void {
    // Noop
  }
}

describe('Plugin', () => {
  it('should create an instance with app and manifest', () => {
    const app = App.createConfigured__();
    const plugin = new ConcretePlugin(app, MANIFEST);
    expect(plugin.app).toBe(app);
    expect(plugin.manifest).toBe(MANIFEST);
  });

  describe('addCommand', () => {
    it('should store and return the command', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const cmd = { id: 'my-cmd', name: 'My Command' };
      const result = plugin.addCommand(cmd);
      expect(result).toBe(cmd);
      expect(plugin.commands.get('my-cmd')).toBe(cmd);
    });
  });

  describe('removeCommand', () => {
    it('should remove the command by id', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      plugin.addCommand({ id: 'cmd1', name: 'Cmd 1' });
      plugin.removeCommand('cmd1');
      expect(plugin.commands.has('cmd1')).toBe(false);
    });
  });

  describe('addRibbonIcon', () => {
    it('should return an element and track it', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const el = plugin.addRibbonIcon('star', 'My Action', vi.fn());
      expect(el).toBeInstanceOf(HTMLElement);
      expect(plugin.ribbonActions__).toContain(el);
    });
  });

  describe('addSettingTab', () => {
    it('should track the setting tab', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      type MockTab = PluginOriginal extends { addSettingTab(tab: infer T): void } ? T : never;
      const mockTab = strictProxy<MockTab>({});
      plugin.addSettingTab(mockTab);
      expect(plugin.settingTabs__).toContain(mockTab);
    });
  });

  describe('addStatusBarItem', () => {
    it('should return an element and track it', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const el = plugin.addStatusBarItem();
      expect(el).toBeInstanceOf(HTMLElement);
      expect(plugin.statusBarItems__).toContain(el);
    });
  });

  describe('loadData / saveData', () => {
    it('should default to empty object', async () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const data = await plugin.loadData();
      expect(data).toEqual({});
    });

    it('should persist saved data', async () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      await plugin.saveData({ foo: 'bar' });
      const data = await plugin.loadData();
      expect(data).toEqual({ foo: 'bar' });
    });
  });

  describe('onUserEnable', () => {
    it('should not throw', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      expect(() => {
        plugin.onUserEnable();
      }).not.toThrow();
    });
  });

  describe('registerExtensions', () => {
    it('should register extensions for a view type', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      plugin.registerExtensions(['csv', 'tsv'], 'table-view');
      expect(plugin.extensions__.get('csv')).toBe('table-view');
      expect(plugin.extensions__.get('tsv')).toBe('table-view');
    });
  });

  describe('registerHoverLinkSource', () => {
    it('should register a hover link source', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const info = { defaultMod: true, display: 'Test' };
      plugin.registerHoverLinkSource('test-id', info);
      expect(plugin.hoverLinkSources__.get('test-id')).toBe(info);
    });
  });

  describe('registerMarkdownCodeBlockProcessor', () => {
    it('should register handler and return a post processor', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const handler = vi.fn();
      const processor = plugin.registerMarkdownCodeBlockProcessor('mermaid', handler);
      expect(plugin.markdownCodeBlockProcessors__.get('mermaid')).toBe(handler);
      expect(typeof processor).toBe('function');
      expect(plugin.markdownPostProcessors__).toContain(processor);
    });

    it('should return a noop processor that does not throw when called', async () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const processor = plugin.registerMarkdownCodeBlockProcessor('lang', vi.fn());
      const result = processor(createDiv(), strictProxy<MarkdownPostProcessorContextOriginal>({}));
      await Promise.resolve(result);
      expect(result).toBeUndefined();
    });
  });

  describe('registerMarkdownPostProcessor', () => {
    it('should register and return the processor', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const processor = vi.fn();
      const result = plugin.registerMarkdownPostProcessor(processor);
      expect(result).toBe(processor);
      expect(plugin.markdownPostProcessors__).toContain(processor);
    });
  });

  describe('registerView', () => {
    it('should register a view creator', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const creator = vi.fn();
      plugin.registerView('my-view', creator);
      expect(plugin.views__.get('my-view')).toBe(creator);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const original: PluginOriginal = plugin.asOriginalType2__();
      expect(original).toBe(plugin);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const plugin = new ConcretePlugin(app, MANIFEST);
      const mock = Plugin.fromOriginalType2__(plugin.asOriginalType2__());
      expect(mock).toBe(plugin);
    });
  });
});
