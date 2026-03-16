import type {
  HoverPopover as HoverPopoverOriginal,
  MarkdownEditView as MarkdownEditViewOriginal
} from 'obsidian';

import type { MarkdownView } from './MarkdownView.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { App } from './App.ts';
import { Editor } from './Editor.ts';

class MockEditor extends Editor {}

export class MarkdownEditView {
  public app: App;
  public editor__: Editor;
  public hoverPopover: HoverPopoverOriginal | null = null;

  private scroll = 0;

  public constructor(view: MarkdownView) {
    this.app = view.app;
    this.editor__ = new MockEditor();
    const self = strictMock(this);
    self.constructor__(view);
    return self;
  }

  public static create__(view: MarkdownView): MarkdownEditView {
    return new MarkdownEditView(view);
  }

  public static fromOriginalType__(value: MarkdownEditViewOriginal): MarkdownEditView {
    return createMockOfUnsafe<MarkdownEditView>(value);
  }

  public applyScroll(scroll: number): void {
    this.scroll = scroll;
  }

  public asOriginalType__(): MarkdownEditViewOriginal {
    return createMockOfUnsafe<MarkdownEditViewOriginal>(this);
  }

  public clear(): void {
    this.editor__.setValue('');
  }

  public constructor__(_view: MarkdownView): void {
    noop();
  }

  public get(): string {
    return this.editor__.getValue();
  }

  public getScroll(): number {
    return this.scroll;
  }

  public getSelection(): string {
    return this.editor__.getSelection();
  }

  public set(data: string, _clear: boolean): void {
    this.editor__.setValue(data);
  }
}
