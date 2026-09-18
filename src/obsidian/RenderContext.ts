/**
 * @file
 *
 * Mock of Obsidian's `RenderContext`, the context Bases values are rendered in.
 */

import type {
  HoverPopover as HoverPopoverOriginal,
  RenderContext as RenderContextOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { IMAGE_EXTENSIONS } from '../internal/resource-path.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { getLinkpath } from './functions/getLinkpath.ts';
import { Keymap } from './Keymap.ts';

/**
 * Obsidian's embed-size pattern: a width alone, or a width and a height separated by an `x`.
 */
const EMBED_SIZE_REGEX = /^\s*\d+\s*(?:x\s*\d+\s*)?$/;

/**
 * The mouse button whose default Obsidian suppresses on an internal link, so a middle click opens a tab
 * instead of starting the browser's auto-scroll.
 */
const MIDDLE_MOUSE_BUTTON = 1;

/**
 * The mouse button a plain left click reports.
 */
const PRIMARY_MOUSE_BUTTON = 0;

/**
 * Mock of Obsidian's `RenderContext`, which provides utilities for rendering Bases values and acts as the hover
 * parent for popovers they open.
 *
 * Its three render helpers and its `app` field are real Obsidian internals `obsidian.d.ts` omits and
 * `obsidian-typings` declares, so per L4 they carry their real names with no `__` suffix. Each builds the DOM
 * Obsidian builds; what each one leaves out, and why, is said at its own site.
 */
export class RenderContext {
  /**
   * The app the context renders against. Obsidian's `RenderContext` takes it in its constructor and keeps it,
   * and its three render helpers read the workspace, the metadata cache and the vault through it.
   */
  public app: App;

  /**
   * The hover popover currently attached to this context, or `null` when none is open.
   */
  public hoverPopover: HoverPopoverOriginal | null = null;

  /**
   * Creates a render context. Use {@link RenderContext.create__} from outside the class.
   *
   * @param app - The app instance.
   */
  protected constructor(app: App) {
    this.app = app;
    const self = strictProxy(this);
    self.constructor__(app);
    return self;
  }

  /**
   * Mock-only factory: creates a render context, spyable via `vi.spyOn(RenderContext, 'create__')`.
   *
   * @param app - The app instance.
   * @returns The new render context.
   */
  public static create__(app: App): RenderContext {
    return new RenderContext(app);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `RenderContext` as this mock.
   *
   * @param value - The value typed as the original `RenderContext`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: RenderContextOriginal): RenderContext {
    return strictProxy(value, RenderContext);
  }

  /**
   * Mock-only: views this mock as Obsidian's `RenderContext` type.
   *
   * @returns The same object, typed as the original `RenderContext`.
   */
  public asOriginalType__(): RenderContextOriginal {
    return strictProxy<RenderContextOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(RenderContext.prototype, 'constructor__')`.
   *
   * @param _app - The app the context was created with.
   */
  public constructor__(_app: App): void {
    noop();
  }

  /**
   * Renders an external link into a container element, as Obsidian does: an `a.external-link` opening in a new
   * tab, showing the display value when there is one and the URL itself otherwise.
   *
   * Obsidian also wires a click that calls `window.open` and a context menu through
   * `Workspace.handleExternalLinkContextMenu`. Neither is modeled: that workspace member is unmocked, and
   * jsdom has no `window.open` to call, so a click here does nothing.
   *
   * @param url - The link URL.
   * @param display - The display value, or `null` to use the URL as text.
   * @param containerEl - The container element to render into.
   */
  public renderExternalLink(url: string, display: null | Value, containerEl: HTMLElement): void {
    const linkEl = containerEl.createEl('a', {
      attr: {
        // eslint-disable-next-line unicorn/name-replacements -- `rel` is the HTML attribute's own name, which Obsidian passes verbatim; renaming it would stop setting the attribute.
        rel: 'noopener',
        target: '_blank'
      },
      cls: 'external-link',
      href: url
    });

    if (display) {
      display.renderTo(linkEl, this);
    } else {
      linkEl.setText(url);
    }
  }

  /**
   * Renders an internal file link into a container element, as Obsidian does: a `span.internal-link` inside a
   * `markdown-rendered` container, carrying the link text as `data-href` and marked `is-unresolved` when the
   * link resolves to nothing. A left or middle click opens the link through `Workspace.openLinkText`, and a
   * middle click's default is suppressed first, as Obsidian suppresses it.
   *
   * The display value is rendered into the link UNLESS it is an embed size such as `200` or `200x100` on a
   * link to an image, which is Obsidian's own guard: such a display is a size, not a label, so the link falls
   * back to showing the target.
   *
   * Obsidian also wires a context menu, `app.dragManager.handleDrag` and a `hover-link` trigger. None is
   * modeled: `App.dragManager` is unmocked, and the menu needs the app's own translated delete label.
   *
   * @param file - The target file, or a link path to resolve.
   * @param display - The display value, or `null` to use the file name as text.
   * @param containerEl - The container element to render into.
   */
  public renderFileLink(file: string | TFile, display: null | Value, containerEl: HTMLElement): void {
    const { app } = this;
    const isLinktext = typeof file === 'string';
    const linktext = isLinktext ? file : file.path;
    const destination = isLinktext ? app.metadataCache.getFirstLinkpathDest(getLinkpath(file), '') : file;

    containerEl.addClass('markdown-rendered');
    const linkEl = containerEl.createSpan('internal-link');

    const isEmbedSize = !!display
      && !!destination
      && IMAGE_EXTENSIONS.includes(destination.extension)
      && EMBED_SIZE_REGEX.test(display.toString());

    if (display && !isEmbedSize) {
      display.renderTo(linkEl, this);
    } else if (isLinktext) {
      linkEl.setText(toDisplayText(file));
    } else {
      linkEl.setText(file.getShortName());
    }

    linkEl.setAttr('data-href', linktext);
    linkEl.toggleClass('is-unresolved', !destination);

    linkEl.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.button === MIDDLE_MOUSE_BUTTON) {
        event.preventDefault();
      }
    });

    linkEl.onClickEvent((event: MouseEvent) => {
      if (event.button !== PRIMARY_MOUSE_BUTTON && event.button !== MIDDLE_MOUSE_BUTTON) {
        return;
      }

      event.preventDefault();
      // Obsidian fires this and forgets it. The mock logs a rejection rather than leaving an unhandled one
      // behind, the same way `ButtonComponent.simulateClick__` handles its click handler's promise.
      app.workspace.openLinkText(linktext, '', Keymap.isModEvent(event)).catch((error: unknown) => {
        console.error(error);
      });
    });
  }

  /**
   * Renders a tag link into a container element, as Obsidian does: an `a.tag` whose text is the tag without
   * its leading `#`.
   *
   * Obsidian also wires a click that opens the global search for the tag. That is not modeled, because it
   * reads `App.internalPlugins`, which this mock deliberately leaves unmocked - a vault reporting no core
   * plugins would be a lie rather than an empty vault.
   *
   * @param tag - The tag, including its leading `#`.
   * @param containerEl - The container element to render into.
   */
  public renderTag(tag: string, containerEl: HTMLElement): void {
    containerEl.createEl('a', {
      cls: 'tag',
      text: tag.slice(1)
    });
  }
}

/**
 * Converts a link path to the text Obsidian shows for it when nothing else is given: each `#` becomes a ` > `,
 * so `Note#Section` shows as `Note > Section`. Obsidian's own transform, and the same one a frontmatter link's
 * `displayText` is built with.
 *
 * @param linktext - The link path, subpath included.
 * @returns The display text.
 */
function toDisplayText(linktext: string): string {
  return linktext.split('#').filter(Boolean).join(' > ').trim();
}
