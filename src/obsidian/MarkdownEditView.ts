import type { HoverPopover } from 'obsidian';

import { noop } from '../internal/Noop.ts';
import { App } from './App.ts';
import { Editor } from './Editor.ts';

class MockEditor extends Editor {}

export class MarkdownEditView {
  public app: App = new App();
  public editor: Editor = new MockEditor();
  public hoverPopover: HoverPopover | null = null;

  public applyScroll(_scroll: number): void {
    noop();
  }

  public clear(): void {
    noop();
  }

  public get(): string {
    return '';
  }

  public getScroll(): number {
    return 0;
  }

  public getSelection(): string {
    return '';
  }

  public set(_data: string, _clear: boolean): void {
    noop();
  }
}
