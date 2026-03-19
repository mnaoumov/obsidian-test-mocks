import type {
  HoverPopover as HoverPopoverOriginal,
  MarkdownSubView as MarkdownSubViewOriginal,
  MarkdownView as MarkdownViewOriginal
} from 'obsidian';

import { MarkdownSubViewImpl } from '../internal/markdown-sub-view-impl.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Editor } from './Editor.ts';
import { MarkdownPreviewView } from './MarkdownPreviewView.ts';
import { TextFileView } from './TextFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class MockEditor extends Editor {}

export class MarkdownView extends TextFileView {
  public currentMode: MarkdownSubViewOriginal;

  public editor: Editor;

  public hoverPopover: HoverPopoverOriginal | null = null;

  public previewMode: MarkdownPreviewView;

  private readonly mode: 'preview' | 'source' = 'source';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.editor = new MockEditor();
    this.currentMode = new MarkdownSubViewImpl();
    this.previewMode = MarkdownPreviewView.create3__(this);

    const self = strictProxy(this);
    self.constructor7__(leaf);
    return self;
  }

  public static create2__(leaf: WorkspaceLeaf): MarkdownView {
    return new MarkdownView(leaf);
  }

  public static fromOriginalType7__(value: MarkdownViewOriginal): MarkdownView {
    return strictProxy(value, MarkdownView);
  }

  public asOriginalType7__(): MarkdownViewOriginal {
    return strictProxy<MarkdownViewOriginal>(this);
  }

  public override canAcceptExtension(extension: string): boolean {
    return extension === 'md';
  }

  public clear(): void {
    this.data = '';
    this.editor.setValue('');
  }

  public constructor7__(_leaf: WorkspaceLeaf): void {
    noop();
  }

  public getMode(): 'preview' | 'source' {
    return this.mode;
  }

  public getViewData(): string {
    return this.data;
  }

  public override getViewType(): string {
    return 'markdown';
  }

  public setViewData(data: string, _clear: boolean): void {
    this.data = data;
    this.editor.setValue(data);
  }

  public showSearch(_replace?: boolean): void {
    noop();
  }
}
