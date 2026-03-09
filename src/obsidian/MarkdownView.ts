import type {
  HoverPopover,
  MarkdownView as MarkdownViewOriginal
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Editor } from './Editor.ts';
import { TextFileView } from './TextFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class MockEditor extends Editor {}

export class MarkdownView extends TextFileView {
  public editor: Editor;
  private _currentModeScroll = 0;

  public currentMode = {
    applyScroll: (scroll: number): void => {
      this._currentModeScroll = scroll;
    },
    clear: (): void => {
      this.editor.setValue('');
    },
    get: (): string => {
      return this.editor.getValue();
    },
    getScroll: (): number => {
      return this._currentModeScroll;
    },
    rerender: (): void => {
      // No-op in mock.
    },
    set: (data: string, _clear: boolean): void => {
      this.editor.setValue(data);
    }
  };

  public hoverPopover: HoverPopover | null = null;

  private _previewModeScroll = 0;
  public previewMode = {
    applyScroll: (scroll: number): void => {
      this._previewModeScroll = scroll;
    },
    clear: (): void => {
      this.data = '';
    },
    containerEl: createDiv(),
    get: (): string => {
      return this.data;
    },
    getScroll: (): number => {
      return this._previewModeScroll;
    },
    rerender: (): void => {
      // No-op in mock.
    },
    set: (data: string, _clear: boolean): void => {
      this.data = data;
    }
  };

  private readonly _mode: 'preview' | 'source' = 'source';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.editor = new MockEditor();
    return strictMock(this);
  }

  public override asOriginalType__(): MarkdownViewOriginal {
    return castTo<MarkdownViewOriginal>(this);
  }

  public override canAcceptExtension(extension: string): boolean {
    return extension === 'md';
  }

  public clear(): void {
    this.data = '';
    this.editor.setValue('');
  }

  public getMode(): 'preview' | 'source' {
    return this._mode;
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
    // No-op in mock.
  }
}
