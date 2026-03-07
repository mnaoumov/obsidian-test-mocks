import type { HoverPopover } from 'obsidian';

import { App } from './App.ts';
import { Editor } from './Editor.ts';

class MockEditor extends Editor {}

export class MarkdownEditView {
  public app: App = App.__create();
  public editor: Editor = new MockEditor();
  public hoverPopover: HoverPopover | null = null;

  private _scroll = 0;

  public applyScroll(scroll: number): void {
    this._scroll = scroll;
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
