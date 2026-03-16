import type {
  EditorChange as EditorChangeOriginal,
  EditorCommandName as EditorCommandNameOriginal,
  Editor as EditorOriginal,
  EditorPosition as EditorPositionOriginal,
  EditorRange as EditorRangeOriginal,
  EditorSelectionOrCaret as EditorSelectionOrCaretOriginal,
  EditorSelection as EditorSelectionOriginal,
  EditorTransaction as EditorTransactionOriginal
} from 'obsidian';

import type { CoordsLeftTop } from '../internal/types.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';

export abstract class Editor {
  private anchor: EditorPositionOriginal = { ch: 0, line: 0 };

  private content = '';

  private focused = false;
  private head: EditorPositionOriginal = { ch: 0, line: 0 };
  private redoStack: string[] = [];
  private scrollLeft = 0;
  private scrollTop = 0;
  private readonly undoStack: string[] = [];
  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  public static fromOriginalType__(value: EditorOriginal): Editor {
    return bridgeType<Editor>(value);
  }

  public asOriginalType__(): EditorOriginal {
    return bridgeType<EditorOriginal>(this);
  }

  public blur(): void {
    this.focused = false;
  }

  public constructor__(): void {
    noop();
  }

  public exec(command: EditorCommandNameOriginal): void {
    const handlers: Record<EditorCommandNameOriginal, () => void> = {
      deleteLine: () => {
        this.execDeleteLine();
      },
      foldAll: noop,
      goDown: () => {
        this.execGoDown();
      },
      goEnd: () => {
        this.execGoEnd();
      },
      goLeft: () => {
        this.execGoLeft();
      },
      goRight: () => {
        this.execGoRight();
      },
      goStart: () => {
        this.setCursor({ ch: 0, line: 0 });
      },
      goUp: () => {
        this.execGoUp();
      },
      goWordLeft: () => {
        this.execGoWordLeft();
      },
      goWordRight: () => {
        this.execGoWordRight();
      },
      indentLess: () => {
        this.execIndent(false);
      },
      indentMore: () => {
        this.execIndent(true);
      },
      newlineAndIndent: () => {
        this.execNewlineAndIndent();
      },
      swapLineDown: () => {
        this.execSwapLine(1);
      },
      swapLineUp: () => {
        this.execSwapLine(-1);
      },
      toggleFold: noop,
      unfoldAll: noop
    };

    handlers[command]();
  }

  public focus(): void {
    this.focused = true;
  }

  public getCursor(side?: 'anchor' | 'from' | 'head' | 'to'): EditorPositionOriginal {
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

  public getRange(from: EditorPositionOriginal, to: EditorPositionOriginal): string {
    const startOffset = this.posToOffset(from);
    const endOffset = this.posToOffset(to);
    return this.content.slice(startOffset, endOffset);
  }

  public getScrollInfo(): CoordsLeftTop {
    return { left: this.scrollLeft, top: this.scrollTop };
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
    return this.focused;
  }

  public lastLine(): number {
    return this.lineCount() - 1;
  }

  public lineCount(): number {
    return this.getLines().length;
  }

  public listSelections(): EditorSelectionOriginal[] {
    return [{ anchor: { ...this.anchor }, head: { ...this.head } }];
  }

  public offsetToPos(offset: number): EditorPositionOriginal {
    const clamped = Math.max(0, Math.min(offset, this.content.length));
    const before = this.content.slice(0, clamped);
    const lines = before.split('\n');
    const line = lines.length - 1;
    const ch = ensureNonNullable(lines[line]).length;
    return { ch, line };
  }

  public posToOffset(pos: EditorPositionOriginal): number {
    const lines = this.getLines();
    let offset = 0;
    for (let i = 0; i < pos.line && i < lines.length; i++) {
      offset += ensureNonNullable(lines[i]).length + 1;
    }
    const lineLength = ensureNonNullable(lines[pos.line]).length;
    offset += Math.min(pos.ch, lineLength);
    return offset;
  }

  public processLines<T>(
    read: (line: number, lineText: string) => null | T,
    write: (line: number, lineText: string, value: null | T) => EditorChangeOriginal | undefined,
    _ignoreEmpty?: boolean
  ): void {
    const lines = this.getLines();
    const changes: EditorChangeOriginal[] = [];

    for (let i = 0; i < lines.length; i++) {
      const lineText = ensureNonNullable(lines[i]);
      const value = read(i, lineText);
      const change = write(i, lineText, value);
      if (change) {
        changes.push(change);
      }
    }

    for (let i = changes.length - 1; i >= 0; i--) {
      const change = ensureNonNullable(changes[i]);
      this.replaceRange(change.text, change.from, change.to);
    }
  }

  public redo(): void {
    const entry = this.redoStack.pop();
    if (entry !== undefined) {
      this.undoStack.push(this.content);
      this.content = entry;
      const endPos = this.offsetToPos(this.content.length);
      this.anchor = { ...endPos };
      this.head = { ...endPos };
    }
  }

  public refresh(): void {
    noop();
  }

  public replaceRange(replacement: string, from: EditorPositionOriginal, to?: EditorPositionOriginal, _origin?: string): void {
    this.undoStack.push(this.content);
    this.redoStack = [];
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

  public scrollIntoView(_range: EditorRangeOriginal, _center?: boolean): void {
    noop();
  }

  public scrollTo(x?: null | number, y?: null | number): void {
    if (x !== null && x !== undefined) {
      this.scrollLeft = x;
    }
    if (y !== null && y !== undefined) {
      this.scrollTop = y;
    }
  }

  public setCursor(pos: EditorPositionOriginal | number, ch?: number): void {
    const resolved: EditorPositionOriginal = typeof pos === 'number'
      ? { ch: ch ?? 0, line: pos }
      : { ...pos };
    this.anchor = { ...resolved };
    this.head = { ...resolved };
  }

  public setLine(n: number, text: string): void {
    const from: EditorPositionOriginal = { ch: 0, line: n };
    const lineLength = ensureNonNullable(this.getLines()[n]).length;
    const to: EditorPositionOriginal = { ch: lineLength, line: n };
    this.replaceRange(text, from, to);
  }

  public setSelection(anchor: EditorPositionOriginal, head?: EditorPositionOriginal): void {
    this.anchor = { ...anchor };
    this.head = head ? { ...head } : { ...anchor };
  }

  public setSelections(ranges: EditorSelectionOrCaretOriginal[], main?: number): void {
    const index = main ?? 0;
    const sel = ensureNonNullable(ranges[index] ?? ranges[0]);
    this.anchor = { ...sel.anchor };
    this.head = sel.head ? { ...sel.head } : { ...sel.anchor };
  }

  public setValue(content: string): void {
    this.content = content;
    this.anchor = { ch: 0, line: 0 };
    this.head = { ch: 0, line: 0 };
  }

  public somethingSelected(): boolean {
    return this.anchor.line !== this.head.line || this.anchor.ch !== this.head.ch;
  }

  public transaction(tx: EditorTransactionOriginal, _origin?: string): void {
    if (tx.changes) {
      for (const change of tx.changes) {
        this.replaceRange(change.text, change.from, change.to);
      }
    }

    if (tx.selection) {
      this.setSelection(tx.selection.from, tx.selection.to);
    }

    if (tx.selections) {
      this.setSelections(tx.selections.map((sel) => ({ anchor: sel.from, head: sel.to ?? sel.from })));
    }
  }

  public undo(): void {
    const entry = this.undoStack.pop();
    if (entry !== undefined) {
      this.redoStack.push(this.content);
      this.content = entry;
      const endPos = this.offsetToPos(this.content.length);
      this.anchor = { ...endPos };
      this.head = { ...endPos };
    }
  }

  public wordAt(pos: EditorPositionOriginal): EditorRangeOriginal | null {
    const line = this.getLine(pos.line);
    if (!line || pos.ch > line.length) {
      return null;
    }

    const wordChars = /\w/;
    if (!wordChars.test(ensureNonNullable(line[pos.ch]))) {
      return null;
    }

    let start = pos.ch;
    while (start > 0 && wordChars.test(ensureNonNullable(line[start - 1]))) {
      start--;
    }

    let end = pos.ch;
    while (end < line.length && wordChars.test(ensureNonNullable(line[end]))) {
      end++;
    }

    return {
      from: { ch: start, line: pos.line },
      to: { ch: end, line: pos.line }
    };
  }

  private execDeleteLine(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    if (lines.length <= 1) {
      this.setValue('');
    } else if (cursor.line === lines.length - 1) {
      const from: EditorPositionOriginal = { ch: ensureNonNullable(lines[cursor.line - 1]).length, line: cursor.line - 1 };
      const to: EditorPositionOriginal = { ch: ensureNonNullable(lines[cursor.line]).length, line: cursor.line };
      this.replaceRange('', from, to);
    } else {
      const from: EditorPositionOriginal = { ch: 0, line: cursor.line };
      const to: EditorPositionOriginal = { ch: 0, line: cursor.line + 1 };
      this.replaceRange('', from, to);
    }
  }

  private execGoDown(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    const lastLine = lines.length - 1;
    const newLine = Math.min(lastLine, cursor.line + 1);
    const lineLen = ensureNonNullable(lines[newLine]).length;
    this.setCursor({ ch: Math.min(cursor.ch, lineLen), line: newLine });
  }

  private execGoEnd(): void {
    const lines = this.content.split('\n');
    const lastLine = lines.length - 1;
    this.setCursor({ ch: ensureNonNullable(lines[lastLine]).length, line: lastLine });
  }

  private execGoLeft(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    if (cursor.ch > 0) {
      this.setCursor({ ch: cursor.ch - 1, line: cursor.line });
    } else if (cursor.line > 0) {
      const prevLineLen = ensureNonNullable(lines[cursor.line - 1]).length;
      this.setCursor({ ch: prevLineLen, line: cursor.line - 1 });
    }
  }

  private execGoRight(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    const currentLineLen = ensureNonNullable(lines[cursor.line]).length;
    if (cursor.ch < currentLineLen) {
      this.setCursor({ ch: cursor.ch + 1, line: cursor.line });
    } else if (cursor.line < lines.length - 1) {
      this.setCursor({ ch: 0, line: cursor.line + 1 });
    }
  }

  private execGoUp(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    const newLine = Math.max(0, cursor.line - 1);
    const lineLen = ensureNonNullable(lines[newLine]).length;
    this.setCursor({ ch: Math.min(cursor.ch, lineLen), line: newLine });
  }

  private execGoWordLeft(): void {
    const offset = this.posToOffset(this.getCursor());
    let pos = offset;
    while (pos > 0 && /\s/.test(ensureNonNullable(this.content[pos - 1]))) {
      pos--;
    }
    while (pos > 0 && /\w/.test(ensureNonNullable(this.content[pos - 1]))) {
      pos--;
    }
    this.setCursor(this.offsetToPos(pos));
  }

  private execGoWordRight(): void {
    const offset = this.posToOffset(this.getCursor());
    let pos = offset;
    if (pos < this.content.length && /\w/.test(ensureNonNullable(this.content[pos]))) {
      while (pos < this.content.length && /\w/.test(ensureNonNullable(this.content[pos]))) {
        pos++;
      }
    } else {
      while (pos < this.content.length && /\W/.test(ensureNonNullable(this.content[pos]))) {
        pos++;
      }
      while (pos < this.content.length && /\w/.test(ensureNonNullable(this.content[pos]))) {
        pos++;
      }
    }
    this.setCursor(this.offsetToPos(pos));
  }

  private execIndent(more: boolean): void {
    const cursor = this.getCursor();
    const from = this.getCursor('from');
    const to = this.getCursor('to');
    const startLine = this.somethingSelected() ? from.line : cursor.line;
    const endLine = this.somethingSelected() ? to.line : cursor.line;
    for (let i = endLine; i >= startLine; i--) {
      if (more) {
        this.replaceRange('\t', { ch: 0, line: i }, { ch: 0, line: i });
      } else if (this.getLine(i).startsWith('\t')) {
        this.replaceRange('', { ch: 0, line: i }, { ch: 1, line: i });
      }
    }
  }

  private execNewlineAndIndent(): void {
    const cursor = this.getCursor();
    const currentLine = ensureNonNullable(this.content.split('\n')[cursor.line]);
    const indent = ensureNonNullable(/^[\t ]*/.exec(currentLine)?.[0]);
    this.replaceRange(`\n${indent}`, cursor, cursor);
  }

  private execSwapLine(direction: -1 | 1): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    const targetLine = cursor.line + direction;
    if (targetLine < 0 || targetLine >= lines.length) {
      return;
    }
    const currentLine = ensureNonNullable(lines[cursor.line]);
    const otherLine = ensureNonNullable(lines[targetLine]);
    if (direction === -1) {
      this.setLine(cursor.line - 1, currentLine);
      this.setLine(cursor.line, otherLine);
    } else {
      this.setLine(cursor.line, otherLine);
      this.setLine(cursor.line + 1, currentLine);
    }
    this.setCursor({ ch: cursor.ch, line: targetLine });
  }

  private getLines(): string[] {
    return this.content.split('\n');
  }

  private maxPos(a: EditorPositionOriginal, b: EditorPositionOriginal): EditorPositionOriginal {
    if (a.line > b.line || (a.line === b.line && a.ch > b.ch)) {
      return { ...a };
    }
    return { ...b };
  }

  private minPos(a: EditorPositionOriginal, b: EditorPositionOriginal): EditorPositionOriginal {
    if (a.line < b.line || (a.line === b.line && a.ch < b.ch)) {
      return { ...a };
    }
    return { ...b };
  }
}
