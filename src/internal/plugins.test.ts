import type { Plugin as PluginOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from '../obsidian/App.ts';
import { castTo } from './castTo.ts';
import { Plugins } from './plugins.ts';
import { bypassStrictProxy } from './strict-proxy.ts';
import { ensureGenericObject } from './type-guards.ts';

const PLUGIN_ID = 'notebook-navigator';

function createPluginStandIn(): PluginOriginal {
  return castTo<PluginOriginal>({ api: {} });
}

describe('Plugins', () => {
  it('should create an instance via create2__', () => {
    const app = App.createConfigured__();
    expect(Plugins.create2__(app)).toBeInstanceOf(Plugins);
  });

  it('should call constructor2__ on construction', () => {
    const app = App.createConfigured__();
    const spy = vi.spyOn(Plugins.prototype, 'constructor2__');
    Plugins.create2__(app);
    expect(spy).toHaveBeenCalledWith(app);
    spy.mockRestore();
  });

  it('should expose the app it belongs to', () => {
    const app = App.createConfigured__();
    // The subsystem is built inside `App`'s constructor, before `strictProxy` wraps it, so the
    // Back-reference is the raw instance the proxy fronts — exactly as `MetadataCache.app` is.
    expect(app.plugins.app).toBe(bypassStrictProxy(app));
  });

  describe('getPlugin()', () => {
    it('should answer null for a vault with no community plugins', () => {
      const app = App.createConfigured__();
      expect(app.plugins.getPlugin(PLUGIN_ID)).toBeNull();
    });

    it('should answer the registered plugin', () => {
      const app = App.createConfigured__();
      const plugin = createPluginStandIn();
      app.plugins.registerPlugin__(PLUGIN_ID, plugin);
      expect(app.plugins.getPlugin(PLUGIN_ID)).toBe(plugin);
    });

    it('should answer null for an id nobody registered', () => {
      const app = App.createConfigured__();
      app.plugins.registerPlugin__(PLUGIN_ID, createPluginStandIn());
      expect(app.plugins.getPlugin('some-other-plugin')).toBeNull();
    });
  });

  describe('getPluginFolder()', () => {
    it('should sit under the vault config folder', () => {
      const app = App.createConfigured__();
      expect(app.plugins.getPluginFolder()).toBe('.obsidian/plugins');
    });

    it('should track a changed config folder', () => {
      const app = App.createConfigured__();
      // eslint-disable-next-line unicorn/name-replacements -- `configDir` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
      app.vault.configDir = '.obsidian-custom';
      expect(app.plugins.getPluginFolder()).toBe('.obsidian-custom/plugins');
    });
  });

  describe('registerPlugin__()', () => {
    it('should record the plugin as enabled', () => {
      const app = App.createConfigured__();
      app.plugins.registerPlugin__(PLUGIN_ID, createPluginStandIn());
      expect(app.plugins.enabledPlugins).toEqual(new Set([PLUGIN_ID]));
    });

    it('should replace an already registered plugin', () => {
      const app = App.createConfigured__();
      app.plugins.registerPlugin__(PLUGIN_ID, createPluginStandIn());
      const replacement = createPluginStandIn();
      app.plugins.registerPlugin__(PLUGIN_ID, replacement);
      expect(app.plugins.getPlugin(PLUGIN_ID)).toBe(replacement);
      expect(app.plugins.enabledPlugins).toEqual(new Set([PLUGIN_ID]));
    });
  });

  describe('unregisterPlugin__()', () => {
    it('should undo a registration', () => {
      const app = App.createConfigured__();
      app.plugins.registerPlugin__(PLUGIN_ID, createPluginStandIn());
      app.plugins.unregisterPlugin__(PLUGIN_ID);
      expect(app.plugins.getPlugin(PLUGIN_ID)).toBeNull();
      expect(app.plugins.enabledPlugins).toEqual(new Set());
    });

    it('should ignore an id that was never registered', () => {
      const app = App.createConfigured__();
      expect(() => {
        app.plugins.unregisterPlugin__(PLUGIN_ID);
      }).not.toThrow();
    });
  });

  it('should inherit the Events behavior obsidian-typings declares', () => {
    const app = App.createConfigured__();
    const listener = vi.fn();
    app.plugins.on('changed', listener);
    app.plugins.trigger('changed');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should throw for a member it deliberately does not model', () => {
    const app = App.createConfigured__();
    const record = ensureGenericObject(app.plugins);
    expect(() => record['enablePlugin']).toThrow(
      'Property "enablePlugin" is not mocked in Plugins. To override, assign a value first: mock.enablePlugin = ...'
    );
  });
});
