import type { ImageValue as ImageValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { ImageValue } from './ImageValue.ts';
import { RenderContext } from './RenderContext.ts';
import { Platform } from './vars/Platform.ts';

describe('ImageValue', () => {
  it('should carry the image icon', () => {
    expect(new ImageValue().icon).toBe('lucide-image');
  });

  it('should create an instance via create2__', () => {
    const value = ImageValue.create2__('image-url');
    expect(value).toBeInstanceOf(ImageValue);
  });

  it('should default to empty string', () => {
    const value = ImageValue.create2__();
    expect(value.data).toBe('');
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = ImageValue.create2__();
      const original: ImageValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ImageValue.create2__();
      const mock = ImageValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });

  describe('renderTo', () => {
    it('should render an img from the vault resource path for an in-vault image', () => {
      const app = App.createConfigured__({ files: { 'pic.png': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('pic.png'));
      vi.spyOn(app.vault, 'getResourcePath').mockReturnValue('app://resource/pic.png');

      const el = createDiv();
      new ImageValue('pic.png').renderTo(el, RenderContext.create__(app));

      const imgEl = el.find('img') as HTMLImageElement;
      expect(imgEl.src).toBe('app://resource/pic.png');
      expect(app.vault.getResourcePath).toHaveBeenCalledWith(file);
    });

    it('should render nothing when an in-vault path resolves to nothing', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      new ImageValue('missing.png').renderTo(el, RenderContext.create__(app));
      expect(el.childNodes).toHaveLength(0);
    });

    it('should render nothing when an in-vault path resolves to a file that is not an image', () => {
      const app = App.createConfigured__({ files: { 'note.md': '' } });
      const el = createDiv();
      new ImageValue('note.md').renderTo(el, RenderContext.create__(app));
      expect(el.childNodes).toHaveLength(0);
    });

    it('should render an external source as it is', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      new ImageValue('https://example.com/pic.png').renderTo(el, RenderContext.create__(app));
      expect((el.find('img') as HTMLImageElement).src).toBe('https://example.com/pic.png');
    });

    it('should re-prefix a desktop file URL with the resource-path prefix', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      new ImageValue('file:///C:/pics/pic.png').renderTo(el, RenderContext.create__(app));
      expect((el.find('img') as HTMLImageElement).src).toBe(`${Platform.resourcePathPrefix}C:/pics/pic.png`);
    });

    it('should leave a file URL alone on mobile, where Obsidian does not re-prefix it', () => {
      const app = App.createConfigured__();
      Platform.isDesktopApp = false;
      try {
        const el = createDiv();
        new ImageValue('file:///C:/pics/pic.png').renderTo(el, RenderContext.create__(app));
        expect((el.find('img') as HTMLImageElement).src).toBe('file:///C:/pics/pic.png');
      } finally {
        Platform.isDesktopApp = true;
      }
    });
  });
});
