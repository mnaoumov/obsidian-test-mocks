import type {
  DataAdapter,
  HoverPopover,
  MarkdownEditView as MarkdownEditViewOriginal
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { App } from './App.ts';
import { Editor } from './Editor.ts';
import { FileSystemAdapter } from './FileSystemAdapter.ts';

class MockEditor extends Editor {}

export class MarkdownEditView {
  public app: App;
  public editor: Editor;
  public hoverPopover: HoverPopover | null = null;

  private _scroll = 0;

  public constructor() {
    this.app = App.create__(FileSystemAdapter.create__('/mock-vault') as unknown as DataAdapter, '');
    this.editor = new MockEditor();
  }

  public applyScroll(scroll: number): void {
    this._scroll = scroll;
  }

  public asOriginalType__(): MarkdownEditViewOriginal {
    return castTo<MarkdownEditViewOriginal>(this);
  }

  public clear(): void {
    this.editor.setValue('');
  }

  public get(): string {
    return this.editor.getValue();
  }

  public getScroll(): number {
    return this._scroll;
  }

  public getSelection(): string {
    return this.editor.getSelection();
  }

  public set(data: string, _clear: boolean): void {
    this.editor.setValue(data);
  }
}
