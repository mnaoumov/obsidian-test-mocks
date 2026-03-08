import type {
  MarkdownPreviewView as RealMarkdownPreviewView,
  TFile
} from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';

export class MarkdownPreviewView extends MarkdownRenderer {
  private _data = '';
  public override containerEl: HTMLElement;

  public constructor() {
    super(createDiv());
    this.containerEl = createDiv();
    const mock = strictMock(this);
    MarkdownPreviewView.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: MarkdownPreviewView): void {
    // Spy hook.
  }

  public applyScroll(_scroll: number): void {
  }

  public clear(): void {
    this._data = '';
  }

  public get file(): TFile {
    return castTo<TFile>(null);
  }

  public get(): string {
    return this._data;
  }

  public getScroll(): number {
    return 0;
  }

  public rerender(_full?: boolean): void {
  }

  public set(data: string, _clear: boolean): void {
    this._data = data;
  }

  public override asReal__(): RealMarkdownPreviewView {
    return strictCastTo<RealMarkdownPreviewView>(this);
  }
}
