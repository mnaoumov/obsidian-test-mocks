import type { MarkdownPreviewView as MarkdownPreviewViewOriginal } from 'obsidian';

import type { MarkdownView } from './MarkdownView.ts';
import type { TFile } from './TFile.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';

export class MarkdownPreviewView extends MarkdownRenderer {
  public override containerEl: HTMLElement;
  public get file(): TFile {
    return castTo<TFile>(null);
  }

  private _data = '';

  public constructor(markdownView: MarkdownView) {
    super(markdownView.app, markdownView.containerEl);
    this.containerEl = markdownView.containerEl;
    const self = strictMock(this);
    self.constructor4__(markdownView);
    return self;
  }

  public static create3__(markdownView: MarkdownView): MarkdownPreviewView {
    return new MarkdownPreviewView(markdownView);
  }

  public applyScroll(_scroll: number): void {
    noop();
  }

  public override asOriginalType__(): MarkdownPreviewViewOriginal {
    return castTo<MarkdownPreviewViewOriginal>(this);
  }

  public clear(): void {
    this._data = '';
  }

  public constructor4__(_markdownView: MarkdownView): void {
    noop();
  }

  public get(): string {
    return this._data;
  }

  public getScroll(): number {
    return 0;
  }

  public rerender(_full?: boolean): void {
    noop();
  }

  public set(data: string, _clear: boolean): void {
    this._data = data;
  }
}
