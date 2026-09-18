import type { ViewCreator as ViewCreatorOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from '../obsidian/App.ts';
import { MarkdownView } from '../obsidian/MarkdownView.ts';
import { WorkspaceLeaf } from '../obsidian/WorkspaceLeaf.ts';
import { castTo } from './castTo.ts';
import { ViewRegistry } from './view-registry.ts';

const CANVAS_EXTENSIONS = ['canvas'];

function createCreator(): ViewCreatorOriginal {
  return (leaf) => MarkdownView.create2__(WorkspaceLeaf.fromOriginalType3__(leaf)).asOriginalType7__();
}

describe('ViewRegistry', () => {
  describe('create2__()', () => {
    it('should create an instance', () => {
      expect(ViewRegistry.create2__()).toBeInstanceOf(ViewRegistry);
    });

    it('should call the construction hook', () => {
      const spy = vi.spyOn(ViewRegistry.prototype, 'constructor2__');
      ViewRegistry.create2__();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('the Markdown view it starts with', () => {
    it('should be the app\'s registry', () => {
      const app = App.createConfigured__();
      expect(app.viewRegistry).toBeInstanceOf(ViewRegistry);
    });

    it('should register the Markdown view and its extension', () => {
      const registry = ViewRegistry.create2__();
      expect(registry.getViewCreatorByType('markdown')).toBeDefined();
      expect(registry.getTypeByExtension('md')).toBe('markdown');
      expect(registry.isExtensionRegistered('md')).toBe(true);
    });

    it('should build a Markdown view from that creator', () => {
      const app = App.createConfigured__();
      const leaf = WorkspaceLeaf.create2__(app);
      const viewCreator = castTo<ViewCreatorOriginal>(app.viewRegistry.getViewCreatorByType('markdown'));
      expect(viewCreator(leaf.asOriginalType3__())).toBeInstanceOf(MarkdownView);
    });

    it('should register nothing else', () => {
      const registry = ViewRegistry.create2__();
      expect(Object.keys(registry.viewByType)).toEqual(['markdown']);
      expect(Object.keys(registry.typeByExtension)).toEqual(['md']);
    });
  });

  describe('getTypeByExtension() / isExtensionRegistered()', () => {
    it('should answer for an unregistered extension', () => {
      const registry = ViewRegistry.create2__();
      expect(registry.getTypeByExtension('png')).toBeUndefined();
      expect(registry.isExtensionRegistered('png')).toBe(false);
    });
  });

  describe('getViewCreatorByType()', () => {
    it('should answer undefined for an unregistered type', () => {
      const registry = ViewRegistry.create2__();
      expect(registry.getViewCreatorByType('canvas')).toBeUndefined();
    });
  });

  describe('registerView() / unregisterView()', () => {
    it('should register a creator and trigger view-registered', () => {
      const registry = ViewRegistry.create2__();
      const handler = vi.fn();
      registry.on('view-registered', handler);
      const viewCreator = createCreator();

      registry.registerView('canvas', viewCreator);

      expect(registry.getViewCreatorByType('canvas')).toBe(viewCreator);
      expect(handler).toHaveBeenCalledExactlyOnceWith('canvas');
    });

    it('should refuse a type that is already registered', () => {
      const registry = ViewRegistry.create2__();
      expect(() => {
        registry.registerView('markdown', createCreator());
      }).toThrow('Attempting to register an existing view type "markdown"');
    });

    it('should unregister a creator and trigger view-unregistered', () => {
      const registry = ViewRegistry.create2__();
      const handler = vi.fn();
      registry.on('view-unregistered', handler);

      registry.unregisterView('markdown');

      expect(registry.getViewCreatorByType('markdown')).toBeUndefined();
      expect(handler).toHaveBeenCalledExactlyOnceWith('markdown');
    });

    it('should do nothing for a type that was never registered', () => {
      const registry = ViewRegistry.create2__();
      const handler = vi.fn();
      registry.on('view-unregistered', handler);

      registry.unregisterView('canvas');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('registerExtensions() / unregisterExtensions()', () => {
    it('should register extensions and trigger extensions-updated', () => {
      const registry = ViewRegistry.create2__();
      const handler = vi.fn();
      registry.on('extensions-updated', handler);

      registry.registerExtensions(CANVAS_EXTENSIONS, 'canvas');

      expect(registry.getTypeByExtension('canvas')).toBe('canvas');
      expect(handler).toHaveBeenCalledOnce();
    });

    it('should refuse an extension that is already registered, leaving the registry untouched', () => {
      const registry = ViewRegistry.create2__();

      expect(() => {
        registry.registerExtensions(['canvas', 'md'], 'canvas');
      }).toThrow('Attempting to register an existing file extension "md"');
      expect(registry.getTypeByExtension('canvas')).toBeUndefined();
    });

    it('should unregister extensions and trigger extensions-updated', () => {
      const registry = ViewRegistry.create2__();
      const handler = vi.fn();
      registry.on('extensions-updated', handler);

      registry.unregisterExtensions(['md', 'png']);

      expect(registry.getTypeByExtension('md')).toBeUndefined();
      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe('registerViewWithExtensions()', () => {
    it('should register the type and its extensions together', () => {
      const registry = ViewRegistry.create2__();
      const viewCreator = createCreator();

      registry.registerViewWithExtensions(CANVAS_EXTENSIONS, 'canvas', viewCreator);

      expect(registry.getViewCreatorByType('canvas')).toBe(viewCreator);
      expect(registry.getTypeByExtension('canvas')).toBe('canvas');
    });
  });
});
