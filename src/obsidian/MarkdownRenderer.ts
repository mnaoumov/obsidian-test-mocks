import type { MarkdownRenderer as MarkdownRendererOriginal } from 'obsidian';

import type { Component } from './Component.ts';
import type { HoverPopover } from './HoverPopover.ts';
import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { App } from './App.ts';
import { MarkdownRenderChild } from './MarkdownRenderChild.ts';

export abstract class MarkdownRenderer extends MarkdownRenderChild {
  public app: App;

  public hoverPopover: HoverPopover | null = null;

  public abstract get file(): TFile;
  public constructor(app: App, containerEl: HTMLElement, supportWorker?: boolean) {
    super(containerEl);
    this.app = app;
    const self = strictMock(this);
    self.constructor3__(app, containerEl, supportWorker);
    return self;
  }

  public static async render(_app: App, _markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
    await noopAsync();
  }

  public static async renderMarkdown(_markdown: string, _el: HTMLElement, _sourcePath: string, _component: Component): Promise<void> {
    await noopAsync();
  }

  public override asOriginalType__(): MarkdownRendererOriginal {
    return castTo<MarkdownRendererOriginal>(this);
  }

  public constructor3__(_app: App, _containerEl: HTMLElement, _supportWorker?: boolean): void {
    noop();
  }
}
