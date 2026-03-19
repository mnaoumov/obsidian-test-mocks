import type { MarkdownSubView as MarkdownSubViewOriginal } from 'obsidian';

export class MarkdownSubViewImpl implements MarkdownSubViewOriginal {
  private data = '';
  private scroll = 0;

  public applyScroll(scroll: number): void {
    this.scroll = scroll;
  }

  public get(): string {
    return this.data;
  }

  public getScroll(): number {
    return this.scroll;
  }

  public set(data: string, _clear: boolean): void {
    this.data = data;
  }
}
