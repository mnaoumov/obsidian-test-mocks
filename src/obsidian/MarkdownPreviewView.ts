import type { TFile } from 'obsidian';

import { noop } from '../internal/Noop.ts';
import { castTo } from '../internal/Cast.ts';
import { MarkdownRenderer } from './MarkdownRenderer.ts';

export class MarkdownPreviewView extends MarkdownRenderer {
  public override containerEl: HTMLElement = createDiv();

  public constructor() {
    super(createDiv());
  }

  public applyScroll(_scroll: number): void {
    noop();
  }

  public clear(): void {
    noop();
  }

  public get file(): TFile {
    return castTo<TFile>(null);
  }

  public get(): string {
    return '';
  }

  public getScroll(): number {
    return 0;
  }

  public rerender(_full?: boolean): void {
    noop();
  }

  public set(_data: string, _clear: boolean): void {
    noop();
  }
}
