import type {
  MarkdownPreviewView as MarkdownPreviewViewOriginal,
  TFile
} from 'obsidian';

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

  public constructor() {
    super(createDiv());
    this.containerEl = createDiv();
    return strictMock(this);
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
