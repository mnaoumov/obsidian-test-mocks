import type {
  DataAdapter as DataAdapterOriginal,
  HoverPopover as HoverPopoverOriginal,
  MarkdownEditView as MarkdownEditViewOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { App } from './App.ts';
import { Editor } from './Editor.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';

class MockEditor extends Editor {}

export class MarkdownEditView {
  public app: App;
  public editor__: Editor;
  public hoverPopover: HoverPopoverOriginal | null = null;

  private _scroll = 0;

  public constructor() {
    this.app = App.create__(FileSystemAdapter.create__('/mock-vault') as unknown as DataAdapterOriginal, '');
    this.editor__ = new MockEditor();
  }

  public static create__(): MarkdownEditView {
    return strictMock(new MarkdownEditView());
  }

  public applyScroll(scroll: number): void {
    this._scroll = scroll;
  }

  public asOriginalType__(): MarkdownEditViewOriginal {
    return castTo<MarkdownEditViewOriginal>(this);
  }

  public clear(): void {
    this.editor__.setValue('');
  }

  public get(): string {
    return this.editor__.getValue();
  }

  public getScroll(): number {
    return this._scroll;
  }

  public getSelection(): string {
    return this.editor__.getSelection();
  }

  public set(data: string, _clear: boolean): void {
    this.editor__.setValue(data);
  }
}
