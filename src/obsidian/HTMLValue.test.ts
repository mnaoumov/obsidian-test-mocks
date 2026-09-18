import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { App } from './App.ts';
import { HTMLValue } from './HTMLValue.ts';
import { RenderContext } from './RenderContext.ts';

describe('HTMLValue', () => {
  it('should carry the code icon', () => {
    expect(new HTMLValue().icon).toBe('lucide-code-2');
  });

  it('should create an instance via create2__', () => {
    const value = HTMLValue.create2__('test');
    expect(value).toBeInstanceOf(HTMLValue);
  });

  it('should default to empty string', () => {
    const value = HTMLValue.create2__();
    expect(value.data).toBe('');
  });

  it('should store the provided value', () => {
    const value = HTMLValue.create2__('<b>bold</b>');
    expect(value.data).toBe('<b>bold</b>');
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = HTMLValue.create2__();
      const original: HTMLValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = HTMLValue.create2__();
      const mock = HTMLValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });

  describe('renderTo', () => {
    it('should append the sanitized HTML', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      new HTMLValue('<p>hello <b>there</b></p>').renderTo(el, RenderContext.create__(app));
      expect(el.innerHTML).toBe('<p>hello <b>there</b></p>');
    });

    it('should strip what the sanitizer strips, so a script never reaches the element', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      new HTMLValue('<p>safe</p><script>alert(1)</script>').renderTo(el, RenderContext.create__(app));
      expect(el.findAll('script')).toHaveLength(0);
      expect(el.textContent).toBe('safe');
    });

    it('should rewrite an in-vault img source through fixFileLinks, with an empty source path', () => {
      const app = App.createConfigured__({ files: { 'pic.png': '' } });
      vi.spyOn(app.vault, 'getResourcePath').mockReturnValue('app://resource/pic.png');
      const fixFileLinksSpy = vi.spyOn(app, 'fixFileLinks');

      const el = createDiv();
      new HTMLValue('<img src="pic.png">').renderTo(el, RenderContext.create__(app));

      expect(fixFileLinksSpy).toHaveBeenCalledWith(el, '');
      expect(el.find('img').getAttr('src')).toBe('app://resource/pic.png');
    });
  });
});
