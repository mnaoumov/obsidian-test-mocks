import type { HoverPopover } from 'obsidian';

import { App } from './App.ts';
import { Editor } from './Editor.ts';

class MockEditor extends Editor {}

export class MarkdownEditView {
  public app: App = App.__create();
  public editor: Editor = new MockEditor();
  public hoverPopover: HoverPopover | null = null;

  public applyScroll(_scroll: number): void {
  }

  public clear(): void {
    this.editor.setValue('');
  }

  public get(): string {
    return this.editor.getValue();
  }

  public getScroll(): number {
    return 0;
  }

  public getSelection(): string {
    return this.editor.getSelection();
  }

  public set(data: string, _clear: boolean): void {
    this.editor.setValue(data);
  }
}
