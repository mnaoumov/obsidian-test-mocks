import type { RenderContext as RenderContextOriginal } from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ensureNonNullable } from '../internal/type-guards.ts';
import { App } from './App.ts';
import { RenderContext } from './RenderContext.ts';
import { StringValue } from './StringValue.ts';

describe('RenderContext', () => {
  it('should create an instance via create__', () => {
    const app = App.createConfigured__();
    const context = RenderContext.create__(app);
    expect(context).toBeInstanceOf(RenderContext);
  });

  it('should have hoverPopover default to null', () => {
    const app = App.createConfigured__();
    const context = RenderContext.create__(app);
    expect(context.hoverPopover).toBeNull();
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const app = App.createConfigured__();
      const context = RenderContext.create__(app);
      const original: RenderContextOriginal = context.asOriginalType__();
      expect(original).toBe(context);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const app = App.createConfigured__();
      const context = RenderContext.create__(app);
      const mock = RenderContext.fromOriginalType__(context.asOriginalType__());
      expect(mock).toBe(context);
    });
  });

  it('should keep the app it was created with', () => {
    const app = App.createConfigured__();
    expect(RenderContext.create__(app).app).toBe(app);
  });

  describe('renderExternalLink', () => {
    it('should build an anchor opening in a new tab, showing the URL when there is no display', () => {
      const context = RenderContext.create__(App.createConfigured__());
      const el = createDiv();
      context.renderExternalLink('https://example.com', null, el);

      const anchorEl = el.find('a');
      expect(anchorEl.className).toBe('external-link');
      expect(anchorEl.getAttr('href')).toBe('https://example.com');
      expect(anchorEl.getAttr('target')).toBe('_blank');
      expect(anchorEl.getAttr('rel')).toBe('noopener');
      expect(anchorEl.textContent).toBe('https://example.com');
    });

    it('should render the display value inside the anchor through its own renderTo', () => {
      const context = RenderContext.create__(App.createConfigured__());
      const display = new StringValue('Example');
      const renderToSpy = vi.spyOn(display, 'renderTo');

      const el = createDiv();
      context.renderExternalLink('https://example.com', display, el);

      const anchorEl = el.find('a');
      expect(renderToSpy).toHaveBeenCalledWith(anchorEl, context);
      expect(anchorEl.textContent).toBe('Example');
    });
  });

  describe('renderFileLink', () => {
    it('should build an internal-link span inside a markdown-rendered container for a TFile', () => {
      const app = App.createConfigured__({ files: { 'Folder/Note.md': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('Folder/Note.md'));
      const el = createDiv();
      RenderContext.create__(app).renderFileLink(file, null, el);

      expect(el.hasClass('markdown-rendered')).toBe(true);
      const linkEl = el.find('.internal-link');
      expect(linkEl.textContent).toBe('Note');
      expect(linkEl.getAttr('data-href')).toBe('Folder/Note.md');
      expect(linkEl.hasClass('is-unresolved')).toBe(false);
    });

    it('should show a non-markdown file by its full name, as getShortName answers', () => {
      const app = App.createConfigured__({ files: { 'pic.png': '' } });
      const file = ensureNonNullable(app.vault.getFileByPath('pic.png'));
      const el = createDiv();
      RenderContext.create__(app).renderFileLink(file, null, el);
      expect(el.find('.internal-link').textContent).toBe('pic.png');
    });

    it('should resolve a link path and show its subpath with the arrow separator Obsidian uses', () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Note#Section', null, el);

      const linkEl = el.find('.internal-link');
      expect(linkEl.textContent).toBe('Note > Section');
      expect(linkEl.getAttr('data-href')).toBe('Note#Section');
      expect(linkEl.hasClass('is-unresolved')).toBe(false);
    });

    it('should mark a link path that resolves to nothing as unresolved', () => {
      const app = App.createConfigured__();
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Missing', null, el);
      expect(el.find('.internal-link').hasClass('is-unresolved')).toBe(true);
    });

    it('should render the display value into the link', () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Note', new StringValue('Shown'), el);
      expect(el.find('.internal-link').textContent).toBe('Shown');
    });

    it('should treat an embed size on an image link as a size rather than a label', () => {
      const app = App.createConfigured__({ files: { 'pic.png': '' } });
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('pic.png', new StringValue('200x100'), el);
      expect(el.find('.internal-link').textContent).toBe('pic.png');
    });

    it('should still show an embed-size-looking display on a link to a note, which is not an image', () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Note', new StringValue('200'), el);
      expect(el.find('.internal-link').textContent).toBe('200');
    });

    it('should open the link on a left click, through the workspace', () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const openLinkTextSpy = vi.spyOn(app.workspace, 'openLinkText').mockResolvedValue();
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Note', null, el);

      const event = new MouseEvent('click', { button: 0, cancelable: true });
      el.find('.internal-link').dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
      expect(openLinkTextSpy).toHaveBeenCalledWith('Note', '', false);
    });

    it('should open the link in a tab on a middle click, and suppress its mousedown default', () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const openLinkTextSpy = vi.spyOn(app.workspace, 'openLinkText').mockResolvedValue();
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Note', null, el);
      const linkEl = el.find('.internal-link');

      const mouseDownEvent = new MouseEvent('mousedown', { button: 1, cancelable: true });
      linkEl.dispatchEvent(mouseDownEvent);
      expect(mouseDownEvent.defaultPrevented).toBe(true);

      linkEl.dispatchEvent(new MouseEvent('click', { button: 1, cancelable: true }));
      expect(openLinkTextSpy).toHaveBeenCalledWith('Note', '', 'tab');
    });

    it('should log a rejected open rather than leaving the rejection unhandled', async () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const error = new Error('open failed');
      vi.spyOn(app.workspace, 'openLinkText').mockRejectedValue(error);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        const el = createDiv();
        RenderContext.create__(app).renderFileLink('Note', null, el);
        el.find('.internal-link').dispatchEvent(new MouseEvent('click', { button: 0, cancelable: true }));

        await vi.waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        });
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    it('should ignore any other button, on the click and on the mousedown alike', () => {
      const app = App.createConfigured__({ files: { 'Note.md': '' } });
      const openLinkTextSpy = vi.spyOn(app.workspace, 'openLinkText').mockResolvedValue();
      const el = createDiv();
      RenderContext.create__(app).renderFileLink('Note', null, el);
      const linkEl = el.find('.internal-link');

      const mouseDownEvent = new MouseEvent('mousedown', { button: 2, cancelable: true });
      linkEl.dispatchEvent(mouseDownEvent);
      expect(mouseDownEvent.defaultPrevented).toBe(false);

      const clickEvent = new MouseEvent('click', { button: 2, cancelable: true });
      linkEl.dispatchEvent(clickEvent);
      expect(clickEvent.defaultPrevented).toBe(false);
      expect(openLinkTextSpy).not.toHaveBeenCalled();
    });
  });

  describe('renderTag', () => {
    it('should build a tag anchor without the leading hash', () => {
      const el = createDiv();
      RenderContext.create__(App.createConfigured__()).renderTag('#parent/child', el);

      const anchorEl = el.find('a');
      expect(anchorEl.className).toBe('tag');
      expect(anchorEl.textContent).toBe('parent/child');
    });
  });
});
