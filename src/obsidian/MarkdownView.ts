import type {
  HoverPopover as HoverPopoverOriginal,
  MarkdownView as MarkdownViewOriginal
} from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { Editor } from './Editor.ts';
import { TextFileView } from './TextFileView.ts';
import { WorkspaceLeaf } from './WorkspaceLeaf.ts';

class MockEditor extends Editor {}

export class MarkdownView extends TextFileView {
  public editor: Editor;
  private currentModeScroll = 0;

  public currentMode = {
    applyScroll: (scroll: number): void => {
      this.currentModeScroll = scroll;
    },
    clear: (): void => {
      this.editor.setValue('');
    },
    get: (): string => {
      return this.editor.getValue();
    },
    getScroll: (): number => {
      return this.currentModeScroll;
    },
    rerender: (): void => {
      noop();
    },
    set: (data: string, _clear: boolean): void => {
      this.editor.setValue(data);
    }
  };

  public hoverPopover: HoverPopoverOriginal | null = null;

  private previewModeScroll = 0;
  public previewMode = {
    applyScroll: (scroll: number): void => {
      this.previewModeScroll = scroll;
    },
    clear: (): void => {
      this.data = '';
    },
    containerEl: createDiv(),
    get: (): string => {
      return this.data;
    },
    getScroll: (): number => {
      return this.previewModeScroll;
    },
    rerender: (): void => {
      noop();
    },
    set: (data: string, _clear: boolean): void => {
      this.data = data;
    }
  };

  private readonly mode: 'preview' | 'source' = 'source';

  public constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.editor = new MockEditor();
    const self = createMockOfUnsafe(this);
    self.constructor7__(leaf);
    return self;
  }

  public static create2__(leaf: WorkspaceLeaf): MarkdownView {
    return new MarkdownView(leaf);
  }

  public static fromOriginalType7__(value: MarkdownViewOriginal): MarkdownView {
    return createMockOfUnsafe<MarkdownView>(value);
  }

  public asOriginalType7__(): MarkdownViewOriginal {
    return createMockOfUnsafe<MarkdownViewOriginal>(this);
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
