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

  // eslint-disable-next-line unicorn/consistent-boolean-name -- `clear` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
  public set(data: string, _clear: boolean): void {
    this.data = data;
  }
}
