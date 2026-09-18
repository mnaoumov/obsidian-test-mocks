/**
 * @file
 *
 * Mock of Obsidian's `MarkdownRenderer`, the base of Markdown-rendering components and home of the static render
 * helpers.
 */

import type { MarkdownRenderer as MarkdownRendererOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { Component } from './Component.ts';
import type { HoverPopover } from './HoverPopover.ts';
import type { TFile } from './TFile.ts';

import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

/**
 * Mock of Obsidian's `MarkdownRenderer`.
 *
 * The static render helpers render nothing: they resolve without touching the target element.
 */
export abstract class MarkdownRenderer extends MarkdownRenderChild {
  /**
   * The app the renderer belongs to.
   */
  public app: App;

  /**
   * The hover popover currently shown for this renderer, or `null` when there is none.
   */
  public hoverPopover: HoverPopover | null = null;

  /**
   * The file whose Markdown is being rendered.
   *
   * @returns The rendered file; subclasses define where it comes from.
   */
  public abstract get file(): TFile;
  /**
   * Creates a renderer.
   *
   * @param app - The app the renderer belongs to.
   * @param containerEl - The element the renderer renders into.
   * @param supportWorker - Whether Markdown may be parsed in a worker.
   */
  public constructor(app: App, containerEl: HTMLElement, supportWorker?: boolean) {
    super(containerEl);
    this.app = app;
    const self = strictProxy(this);
    self.constructor3__(app, containerEl, supportWorker);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MarkdownRenderer` as this mock.
   *
   * @param value - The value typed as the original `MarkdownRenderer`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: MarkdownRendererOriginal): MarkdownRenderer {
    return strictProxy(value, MarkdownRenderer);
  }

  /**
   * Renders a Markdown string into an HTML element. A no-op in the mock, which leaves the element untouched.
   *
   * @param _app - The app, used to resolve links and embeds.
   * @param _markdown - The Markdown source to render.
   * @param _el - The element to append the rendered HTML to.
   * @param _sourcePath - The normalized path of the note the Markdown comes from, used to resolve relative links.
   * @param _component - The component that manages the lifecycle of the rendered child components.
   */
  public static async render(_app: App, _markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
    await noopAsync();
  }

  /**
   * Renders a Markdown string into an HTML element. Obsidian deprecates it in favor of
   * {@link MarkdownRenderer.render}. A no-op in the mock, which leaves the element untouched.
   *
   * @param _markdown - The Markdown source to render.
   * @param _el - The element to append the rendered HTML to.
   * @param _sourcePath - The normalized path of the note the Markdown comes from, used to resolve relative links.
   * @param _component - The component that manages the lifecycle of the rendered child components.
   */
  public static async renderMarkdown(_markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
    await noopAsync();
  }

  /**
   * Mock-only: views this mock as Obsidian's `MarkdownRenderer` type.
   *
   * @returns The same object, typed as the original `MarkdownRenderer`.
   */
  public asOriginalType3__(): MarkdownRendererOriginal {
    return strictProxy<MarkdownRendererOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MarkdownRenderer.prototype, 'constructor3__')`.
   *
   * @param _app - The app the renderer was created with.
   * @param _containerEl - The container element the renderer was created with.
   * @param _supportWorker - The worker-support flag the renderer was created with.
   */
  public constructor3__(_app: App, _containerEl: HTMLElement, _supportWorker?: boolean): void {
    noop();
  }
}
