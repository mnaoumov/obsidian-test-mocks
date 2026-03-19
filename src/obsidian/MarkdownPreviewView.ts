import type { MarkdownPreviewView as MarkdownPreviewViewOriginal } from 'obsidian';

import type { MarkdownView } from './MarkdownView.ts';
import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';

export class MarkdownPreviewView extends MarkdownRenderer {
  public override containerEl: HTMLElement;
  public get file(): TFile {
    return ensureNonNullable(this.markdownView.file);
  }

  private data = '';
  private readonly markdownView: MarkdownView;
  private scroll = 0;

  public constructor(markdownView: MarkdownView) {
    super(markdownView.app, markdownView.containerEl);
    this.containerEl = markdownView.containerEl;
    this.markdownView = markdownView;
    const self = strictProxy(this);
    self.constructor4__(markdownView);
    return self;
  }

  public static create3__(markdownView: MarkdownView): MarkdownPreviewView {
    return new MarkdownPreviewView(markdownView);
  }

  public static fromOriginalType4__(value: MarkdownPreviewViewOriginal): MarkdownPreviewView {
    return strictProxy(value, MarkdownPreviewView);
  }

  public applyScroll(scroll: number): void {
    this.scroll = scroll;
  }

  public asOriginalType4__(): MarkdownPreviewViewOriginal {
    return strictProxy<MarkdownPreviewViewOriginal>(this);
  }

  public clear(): void {
    this.data = '';
  }

  public constructor4__(_markdownView: MarkdownView): void {
    noop();
  }

  public get(): string {
    return this.data;
  }

  public getScroll(): number {
    return this.scroll;
  }

  public rerender(_full?: boolean): void {
    noop();
  }

  public set(data: string, _clear: boolean): void {
    this.data = data;
  }
}
