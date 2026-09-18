import type { App as AppOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { Plugins } from '../internal/plugins.ts';
import {
  ensureGenericObject,
  ensureNonNullable
} from '../internal/type-guards.ts';
import { ViewRegistry } from '../internal/view-registry.ts';
import { App } from './App.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';
import { RenderContext } from './RenderContext.ts';
import { SecretStorage } from './SecretStorage.ts';
import { Platform } from './vars/Platform.ts';

describe('App', () => {
  it('should create an instance via createConfigured__', () => {
    const app = App.createConfigured__();
    expect(app).toBeInstanceOf(App);
  });

  it('should create folders for paths ending with /', () => {
    const app = App.createConfigured__({
      files: {
        'archive/2023/': ''
      }
    });
    const folder = app.vault.getAbstractFileByPath('archive/2023');
    expect(folder).not.toBeNull();
    expect(folder?.constructor.name).toBe('TFolder');
  });

  it('should create parent folders for folder paths ending with /', () => {
    const app = App.createConfigured__({
      files: {
        'a/b/c/': ''
      }
    });
    expect(app.vault.getAbstractFileByPath('a')).not.toBeNull();
    expect(app.vault.getAbstractFileByPath('a/b')).not.toBeNull();
    expect(app.vault.getAbstractFileByPath('a/b/c')).not.toBeNull();
  });

  it('should throw when folder path has non-empty content', () => {
    expect(() =>
      App.createConfigured__({
        files: {
          'folder/': 'non-empty'
        }
      })
    ).toThrow('Folder path "folder/" must have empty content');
  });

  it('should create an instance via create__', () => {
    const adapter = FileSystemAdapter.create__('/mock').asOriginalType__();
    const app = App.create__(adapter, 'test-id');
    expect(app).toBeInstanceOf(App);
  });

  it('should use provided adapter in createConfigured__', () => {
    const adapter = FileSystemAdapter.create__('/custom');
    const app = App.createConfigured__({ adapter });
    expect(app).toBeInstanceOf(App);
  });

  it('should set insensitive on adapter when isAdapterCaseInsensitive is true', () => {
    const app = App.createConfigured__({ isAdapterCaseInsensitive: true });
    expect(app).toBeInstanceOf(App);
  });

  it('should create files with parent folders', () => {
    const app = App.createConfigured__({
      files: {
        'deeply/nested/file.md': 'content'
      }
    });
    expect(app.vault.getAbstractFileByPath('deeply')).not.toBeNull();
    expect(app.vault.getAbstractFileByPath('deeply/nested')).not.toBeNull();
    expect(app.vault.getFileByPath('deeply/nested/file.md')).not.toBeNull();
  });

  it('should create files at root level without parent folder', () => {
    const app = App.createConfigured__({
      files: {
        'root-file.md': 'content'
      }
    });
    expect(app.vault.getFileByPath('root-file.md')).not.toBeNull();
  });

  describe('isDarkMode', () => {
    it('should return false', () => {
      const app = App.createConfigured__();
      expect(app.isDarkMode()).toBe(false);
    });
  });

  describe('loadLocalStorage / saveLocalStorage', () => {
    it('should return null for unset keys', () => {
      const app = App.createConfigured__();
      expect(app.loadLocalStorage('missing')).toBeNull();
    });

    it('should return saved values', () => {
      const app = App.createConfigured__();
      app.saveLocalStorage('key', 'value');
      expect(app.loadLocalStorage('key')).toBe('value');
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original obsidian type', () => {
      const app = App.createConfigured__();
      const original: AppOriginal = app.asOriginalType__();
      expect(original).toBe(app);
    });

    it('should throw when accessing an unmocked property', () => {
      const app = App.createConfigured__();
      const record = ensureGenericObject(app);
      expect(() => record['nonExistentProperty']).toThrow(
        'Property "nonExistentProperty" is not mocked in App. To override, assign a value first: mock.nonExistentProperty = ...'
      );
    });

    it('should allow accessing a property after assigning it', () => {
      const app = App.createConfigured__();
      const record = ensureGenericObject(app);
      const mockValue = { test: true };
      record['customProperty'] = mockValue;
      expect(record['customProperty']).toBe(mockValue);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const mock = App.fromOriginalType__(app.asOriginalType__());
      expect(mock).toBe(app);
    });
  });

  describe('renderContext', () => {
    it('should expose a RenderContext instance', () => {
      const app = App.createConfigured__();
      expect(app.renderContext).toBeInstanceOf(RenderContext);
    });
  });

  describe('plugins', () => {
    it('should expose a Plugins instance', () => {
      const app = App.createConfigured__();
      expect(app.plugins).toBeInstanceOf(Plugins);
    });

    it('should report a vault with no community plugins installed', () => {
      const app = App.createConfigured__();
      expect(app.plugins.getPlugin('notebook-navigator')).toBeNull();
    });
  });

  describe('secretStorage', () => {
    it('should expose a SecretStorage instance', () => {
      const app = App.createConfigured__();
      expect(app.secretStorage).toBeInstanceOf(SecretStorage);
    });
  });

  describe('viewRegistry', () => {
    it('should expose a ViewRegistry instance holding Obsidian\'s Markdown view', () => {
      const app = App.createConfigured__();
      expect(app.viewRegistry).toBeInstanceOf(ViewRegistry);
      expect(app.viewRegistry.getTypeByExtension('md')).toBe('markdown');
    });
  });

  // A note whose `%%` comment sits on its own line after a blank line is the ordinary Obsidian layout,
  // and it used to be rejected on EVERY write — both seeding and `vault.modify` — because the markdown
  // parser computed the wrong offset for the second block of a gap. Asserted here, at the surface a
  // plugin's tests actually use, rather than only against the parser internals.
  describe('a standalone comment block after a blank line', () => {
    const CONTENT_WITH_COMMENT_BLOCK = 'text\n\n%% c %%\n';

    it('should be accepted when seeding files', () => {
      const app = App.createConfigured__({ files: { 'A.md': CONTENT_WITH_COMMENT_BLOCK } });
      const file = ensureNonNullable(app.vault.getFileByPath('A.md'));
      expect(app.metadataCache.getFileCache(file)).not.toBeNull();
    });

    it('should be accepted when modifying a note', async () => {
      const app = App.createConfigured__({ files: { 'A.md': 'text\n' } });
      const file = ensureNonNullable(app.vault.getFileByPath('A.md'));
      await app.vault.modify(file, CONTENT_WITH_COMMENT_BLOCK);
      expect(await app.vault.read(file)).toBe(CONTENT_WITH_COMMENT_BLOCK);
    });
  });
  describe('obsidian-typings internals', () => {
    it('should expose the appId it was created with', () => {
      const app = App.createConfigured__({ appId: 'my-vault-id' });
      expect(app.appId).toBe('my-vault-id');
    });

    it('should answer isMobile from Platform', () => {
      const app = App.createConfigured__();
      expect(app.isMobile).toBe(Platform.isMobile);
    });

    it('should default to the light theme', () => {
      const app = App.createConfigured__();
      expect(app.getTheme()).toBe('moonstone');
      expect(app.isDarkMode()).toBe(false);
    });

    it('should report dark mode once the theme is changed', () => {
      const app = App.createConfigured__();
      app.changeTheme('obsidian');
      expect(app.getTheme()).toBe('obsidian');
      expect(app.isDarkMode()).toBe(true);
    });

    it('should record a theme set without applying it', () => {
      const app = App.createConfigured__();
      app.setTheme('obsidian');
      expect(app.getTheme()).toBe('obsidian');
    });
  });

  describe('fixFileLinks', () => {
    it('should resolve an in-vault img source to the vault resource path', () => {
      const app = App.createConfigured__({ files: { 'Folder/pic.png': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('Folder/pic.png'));
      const getResourcePathSpy = vi.spyOn(app.vault, 'getResourcePath').mockReturnValue('app://resource/pic.png');

      const el = createDiv();
      el.createEl('img').setAttr('src', 'Folder/pic.png');
      app.fixFileLinks(el, '');

      expect(getResourcePathSpy).toHaveBeenCalledWith(file);
      expect(el.find('img').getAttr('src')).toBe('app://resource/pic.png');
    });

    it('should decode a percent-encoded source before resolving it', () => {
      const app = App.createConfigured__({ files: { 'my pic.png': '' } });
      vi.spyOn(app.vault, 'getResourcePath').mockReturnValue('app://resource/my-pic.png');

      const el = createDiv();
      el.createEl('audio').setAttr('src', 'my%20pic.png');
      app.fixFileLinks(el, '');

      expect(el.find('audio').getAttr('src')).toBe('app://resource/my-pic.png');
    });

    it('should re-prefix a desktop file URL', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      el.createEl('video').setAttr('src', 'file:///C:/clips/clip.mp4');
      app.fixFileLinks(el, '');

      expect(el.find('video').getAttr('src')).toBe(`${Platform.resourcePathPrefix}C:/clips/clip.mp4`);
    });

    it('should leave a file URL alone on mobile', () => {
      const app = App.createConfigured__();
      Platform.isDesktopApp = false;
      try {
        const el = createDiv();
        el.createEl('video').setAttr('src', 'file:///C:/clips/clip.mp4');
        app.fixFileLinks(el, '');
        expect(el.find('video').getAttr('src')).toBe('file:///C:/clips/clip.mp4');
      } finally {
        Platform.isDesktopApp = true;
      }
    });

    it('should leave an external source, a source-less element and an unresolved path alone', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      el.createEl('img').setAttr('src', 'https://example.com/pic.png');
      el.createEl('img');
      el.createEl('img').setAttr('src', 'missing.png');
      app.fixFileLinks(el, '');

      const imgEls = el.findAll('img');
      expect(imgEls[0]?.getAttr('src')).toBe('https://example.com/pic.png');
      expect(imgEls[1]?.getAttr('src')).toBeNull();
      expect(imgEls[2]?.getAttr('src')).toBe('missing.png');
    });

    it('should walk an iframe but never resolve one, as Obsidian does not', () => {
      const app = App.createConfigured__({ files: { 'page.png': '' } });
      const getResourcePathSpy = vi.spyOn(app.vault, 'getResourcePath').mockReturnValue('app://resource/page.png');

      const el = createDiv();
      el.createEl('iframe').setAttr('src', 'page.png');
      app.fixFileLinks(el, '');

      expect(getResourcePathSpy).not.toHaveBeenCalled();
      expect(el.find('iframe').getAttr('src')).toBe('page.png');
    });

    it('should resolve a source against the source path it is given', () => {
      const app = App.createConfigured__({
        files: {
          'Folder/Note.md': '',
          'Folder/pic.png': ''
        }
      });
      const getFirstLinkpathDestinationSpy = vi.spyOn(app.metadataCache, 'getFirstLinkpathDest');

      const el = createDiv();
      el.createEl('source').setAttr('src', 'pic.png');
      app.fixFileLinks(el, 'Folder/Note.md');

      expect(getFirstLinkpathDestinationSpy).toHaveBeenCalledWith('pic.png', 'Folder/Note.md');
    });
  });
});
