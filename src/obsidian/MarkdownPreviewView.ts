import type {
  MarkdownPreviewView as MarkdownPreviewViewOriginal,
  TFile as TFileOriginal
} from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';

export class MarkdownPreviewView extends MarkdownRenderer {
  public override containerEl: HTMLElement;
  public get file(): TFileOriginal {
    return castTo<TFileOriginal>(null);
  }

  private _data = '';

  protected constructor() {
    super(createDiv());
    this.containerEl = createDiv();
    const self = strictMock(this);
    self.constructor4__();
    return self;
  }

  public static override create__(): MarkdownPreviewView {
    return new MarkdownPreviewView();
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

  public constructor4__(): void {
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
