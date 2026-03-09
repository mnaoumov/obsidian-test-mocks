// eslint-disable-next-line capitalized-comments -- dprint-ignore directive must be lowercase.
// dprint-ignore -- Alias sort order differs from original name order.
import type {
  EditorChange,
  EditorCommandName,
  Editor as EditorOriginal,
  EditorPosition,
  EditorRange,
  EditorSelection,
  EditorSelectionOrCaret,
  EditorTransaction
} from 'obsidian';

import type { CoordsLeftTop } from '../internal/Types.ts';

import { castTo } from '../internal/Cast.ts';
import { noop } from '../internal/Noop.ts';

export abstract class Editor {
  private _focused = false;
  private _redoStack: string[] = [];
  private _scrollLeft = 0;
  private _scrollTop = 0;
  private readonly _undoStack: string[] = [];
  private anchor: EditorPosition = { ch: 0, line: 0 };
  private content = '';
  private head: EditorPosition = { ch: 0, line: 0 };

  public asOriginalType__(): EditorOriginal {
    return castTo<EditorOriginal>(this);
  }

  public blur(): void {
    this._focused = false;
  }

  public exec(_command: EditorCommandName): void {
    noop();
  }

  public focus(): void {
    this._focused = true;
  }

  public getCursor(side?: 'anchor' | 'from' | 'head' | 'to'): EditorPosition {
    switch (side) {
      case 'anchor':
        return { ...this.anchor };
      case 'from':
        return this.minPos(this.anchor, this.head);
      case 'to':
        return this.maxPos(this.anchor, this.head);
      default:
        return { ...this.head };
    }
  }

  public getDoc(): this {
    return this;
  }

  public getLine(line: number): string {
    return this.getLines()[line] ?? '';
  }

  public getRange(from: EditorPosition, to: EditorPosition): string {
    const startOffset = this.posToOffset(from);
    const endOffset = this.posToOffset(to);
    return this.content.slice(startOffset, endOffset);
  }

  public getScrollInfo(): CoordsLeftTop {
    return { left: this._scrollLeft, top: this._scrollTop };
  }

  public getSelection(): string {
    if (!this.somethingSelected()) {
      return '';
    }
    const from = this.minPos(this.anchor, this.head);
    const to = this.maxPos(this.anchor, this.head);
    return this.getRange(from, to);
  }

  public getValue(): string {
    return this.content;
  }

  public hasFocus(): boolean {
    return this._focused;
  }

  public lastLine(): number {
    return this.lineCount() - 1;
  }

  public lineCount(): number {
    return this.getLines().length;
  }

  public listSelections(): EditorSelection[] {
    return [{ anchor: { ...this.anchor }, head: { ...this.head } }];
  }

  public offsetToPos(offset: number): EditorPosition {
    const clamped = Math.max(0, Math.min(offset, this.content.length));
    const before = this.content.slice(0, clamped);
    const lines = before.split('\n');
    const line = lines.length - 1;
    const ch = lines[line]?.length ?? 0;
    return { ch, line };
  }

  public posToOffset(pos: EditorPosition): number {
    const lines = this.getLines();
    let offset = 0;
    for (let i = 0; i < pos.line && i < lines.length; i++) {
      offset += (lines[i]?.length ?? 0) + 1;
    }
    const lineLength = lines[pos.line]?.length ?? 0;
    offset += Math.min(pos.ch, lineLength);
    return offset;
  }

  public processLines<T>(
    read: (line: number, lineText: string) => null | T,
    write: (line: number, lineText: string, value: null | T) => EditorChange | undefined,
    _ignoreEmpty?: boolean
  ): void {
    const lines = this.getLines();
    const changes: EditorChange[] = [];

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i] ?? '';
      const value = read(i, lineText);
      const change = write(i, lineText, value);
      if (change) {
        changes.push(change);
      }
    }

    for (let i = changes.length - 1; i >= 0; i--) {
      const change = changes[i];
      if (change) {
        this.replaceRange(change.text, change.from, change.to);
      }
    }
  }

  public redo(): void {
    const entry = this._redoStack.pop();
    if (entry !== undefined) {
      this._undoStack.push(this.content);
      this.content = entry;
      const endPos = this.offsetToPos(this.content.length);
      this.anchor = { ...endPos };
      this.head = { ...endPos };
    }
  }

  public refresh(): void {
    noop();
  }

  public replaceRange(replacement: string, from: EditorPosition, to?: EditorPosition, _origin?: string): void {
    this._undoStack.push(this.content);
    this._redoStack = [];
    const startOffset = this.posToOffset(from);
    const endOffset = to ? this.posToOffset(to) : startOffset;
    this.content = this.content.slice(0, startOffset) + replacement + this.content.slice(endOffset);

    const newCursor = this.offsetToPos(startOffset + replacement.length);
    this.anchor = { ...newCursor };
    this.head = { ...newCursor };
  }

  public replaceSelection(replacement: string, _origin?: string): void {
    const from = this.minPos(this.anchor, this.head);
    const to = this.maxPos(this.anchor, this.head);
    this.replaceRange(replacement, from, to);
  }

  public scrollIntoView(_range: EditorRange, _center?: boolean): void {
    noop();
  }

  public scrollTo(x?: null | number, y?: null | number): void {
    if (x !== null && x !== undefined) {
      this._scrollLeft = x;
    }
    if (y !== null && y !== undefined) {
      this._scrollTop = y;
    }
  }

  public setCursor(pos: EditorPosition | number, ch?: number): void {
    const resolved: EditorPosition = typeof pos === 'number'
      ? { ch: ch ?? 0, line: pos }
      : { ...pos };
    this.anchor = { ...resolved };
    this.head = { ...resolved };
  }

  public setLine(n: number, text: string): void {
    const from: EditorPosition = { ch: 0, line: n };
    const lineLength = (this.getLines()[n] ?? '').length;
    const to: EditorPosition = { ch: lineLength, line: n };
    this.replaceRange(text, from, to);
  }

  public setSelection(anchor: EditorPosition, head?: EditorPosition): void {
    this.anchor = { ...anchor };
    this.head = head ? { ...head } : { ...anchor };
  }

  public setSelections(ranges: EditorSelectionOrCaret[], main?: number): void {
    const index = main ?? 0;
    const sel = ranges[index] ?? ranges[0];
    if (sel) {
      this.anchor = { ...sel.anchor };
      this.head = sel.head ? { ...sel.head } : { ...sel.anchor };
    }
  }

  public setValue(content: string): void {
    this.content = content;
    this.anchor = { ch: 0, line: 0 };
    this.head = { ch: 0, line: 0 };
  }

  public somethingSelected(): boolean {
    return this.anchor.line !== this.head.line || this.anchor.ch !== this.head.ch;
  }

  public transaction(tx: EditorTransaction, _origin?: string): void {
    if (tx.changes) {
      for (const change of tx.changes) {
        this.replaceRange(change.text, change.from, change.to);
      }
    }

    if (tx.selection) {
      this.setSelection(tx.selection.from, tx.selection.to);
    }

    if (tx.selections) {
      this.setSelections(tx.selections as unknown as EditorSelectionOrCaret[]);
    }
  }

  public undo(): void {
    const entry = this._undoStack.pop();
    if (entry !== undefined) {
      this._redoStack.push(this.content);
      this.content = entry;
      const endPos = this.offsetToPos(this.content.length);
      this.anchor = { ...endPos };
      this.head = { ...endPos };
    }
  }

  public wordAt(pos: EditorPosition): EditorRange | null {
    const line = this.getLine(pos.line);
    if (!line || pos.ch > line.length) {
      return null;
    }

    const wordChars = /\w/;
    if (!wordChars.test(line[pos.ch] ?? '')) {
      return null;
    }

    let start = pos.ch;
    while (start > 0 && wordChars.test(line[start - 1] ?? '')) {
      start--;
    }

    let end = pos.ch;
    while (end < line.length && wordChars.test(line[end] ?? '')) {
      end++;
    }

    return {
      from: { ch: start, line: pos.line },
      to: { ch: end, line: pos.line }
    };
  }

  private getLines(): string[] {
    return this.content.split('\n');
  }

  private maxPos(a: EditorPosition, b: EditorPosition): EditorPosition {
    if (a.line > b.line || (a.line === b.line && a.ch > b.ch)) {
      return { ...a };
    }
    return { ...b };
  }

  private minPos(a: EditorPosition, b: EditorPosition): EditorPosition {
    if (a.line < b.line || (a.line === b.line && a.ch < b.ch)) {
      return { ...a };
    }
    return { ...b };
  }
}
