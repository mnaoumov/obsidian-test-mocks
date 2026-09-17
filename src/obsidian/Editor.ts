/**
 * @file
 *
 * Mock of Obsidian's `Editor`, backed by an in-memory string buffer.
 */

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
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';

/**
 * Mock of Obsidian's abstract `Editor`, the common interface over the CodeMirror editors.
 *
 * The document is a plain string with `\n` line breaks. The mock tracks one selection (an anchor and a head),
 * focus and scroll position, and keeps whole-document snapshots for undo and redo. Folding and scrolling a range
 * into view are no-ops.
 */
export abstract class Editor {
  private anchor: EditorPositionOriginal = { ch: 0, line: 0 };

  private content = '';

  private focused = false;
  private head: EditorPositionOriginal = { ch: 0, line: 0 };
  private redoStack: string[] = [];
  private scrollLeft = 0;
  private scrollTop = 0;
  private readonly undoStack: string[] = [];
  /**
   * Creates an editor with an empty document, the cursor at the start and no focus.
   */
  public constructor() {
    const self = strictProxy(this);
    self.constructor__();
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `Editor` as this mock.
   *
   * @param value - The value typed as the original `Editor`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType__(value: EditorOriginal): Editor {
    return strictProxy(value, Editor);
  }

  /**
   * Mock-only: views this mock as Obsidian's `Editor` type.
   *
   * @returns The same object, typed as the original `Editor`.
   */
  public asOriginalType__(): EditorOriginal {
    return strictProxy<EditorOriginal>(this);
  }

  /**
   * Removes focus from the editor; {@link Editor.hasFocus} then returns `false`.
   */
  public blur(): void {
    this.focused = false;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(Editor.prototype, 'constructor__')`.
   */
  public constructor__(): void {
    noop();
  }

  /**
   * Runs a built-in editor command. The mock implements cursor movement, line deletion, line swapping,
   * indentation with tabs and newline-with-indent against its buffer; the folding commands are no-ops.
   *
   * @param command - The command to run.
   */
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

  /**
   * Gives the editor focus; {@link Editor.hasFocus} then returns `true`.
   */
  public focus(): void {
    this.focused = true;
  }

  /**
   * Gets one end of the selection.
   *
   * @param side - `'anchor'` or `'head'` for that end, `'from'` or `'to'` for the earlier or later end; the head
   * when omitted.
   * @returns A copy of the requested position.
   */
  public getCursor(side?: 'anchor' | 'from' | 'head' | 'to'): EditorPositionOriginal {
    switch (side) {
      case 'anchor': {
        return { ...this.anchor };
      }
      case 'from': {
        return this.minPos(this.anchor, this.head);
      }
      case 'to': {
        return this.maxPos(this.anchor, this.head);
      }
      default: {
        return { ...this.head };
      }
    }
  }

  /**
   * Gets the document object.
   *
   * @returns This editor.
   */
  public getDoc(): this {
    return this;
  }

  /**
   * Gets the text of a line.
   *
   * @param line - The zero-based line number.
   * @returns The line's text without its line break, or `''` when the line does not exist.
   */
  public getLine(line: number): string {
    return this.getLines()[line] ?? '';
  }

  /**
   * Gets the text between two positions.
   *
   * @param from - The start position.
   * @param to - The end position, exclusive.
   * @returns The text in that range.
   */
  public getRange(from: EditorPositionOriginal, to: EditorPositionOriginal): string {
    const startOffset = this.posToOffset(from);
    const endOffset = this.posToOffset(to);
    return this.content.slice(startOffset, endOffset);
  }

  /**
   * Gets the scroll position.
   *
   * @returns The position last set with {@link Editor.scrollTo}, initially `0` on both axes.
   */
  public getScrollInfo(): CoordsLeftTop {
    return { left: this.scrollLeft, top: this.scrollTop };
  }

  /**
   * Gets the selected text.
   *
   * @returns The text between the anchor and the head, or `''` when nothing is selected.
   */
  public getSelection(): string {
    if (!this.somethingSelected()) {
      return '';
    }
    const from = this.minPos(this.anchor, this.head);
    const to = this.maxPos(this.anchor, this.head);
    return this.getRange(from, to);
  }

  /**
   * Gets the whole document.
   *
   * @returns The document text.
   */
  public getValue(): string {
    return this.content;
  }

  /**
   * Checks whether the editor has focus.
   *
   * @returns The state set by {@link Editor.focus} and {@link Editor.blur}, initially `false`.
   */
  public hasFocus(): boolean {
    return this.focused;
  }

  /**
   * Gets the number of the last line.
   *
   * @returns The zero-based index of the last line.
   */
  public lastLine(): number {
    return this.lineCount() - 1;
  }

  /**
   * Gets the number of lines in the document.
   *
   * @returns The line count; an empty document has one line.
   */
  public lineCount(): number {
    return this.getLines().length;
  }

  /**
   * Lists the selections.
   *
   * @returns A single selection, since the mock tracks only one, with copies of its anchor and head.
   */
  public listSelections(): EditorSelectionOriginal[] {
    return [{ anchor: { ...this.anchor }, head: { ...this.head } }];
  }

  /**
   * Converts a character offset into a line and column position.
   *
   * @param offset - The offset from the start of the document; clamped to the document's bounds.
   * @returns The matching position.
   */
  public offsetToPos(offset: number): EditorPositionOriginal {
    const clamped = Math.max(0, Math.min(offset, this.content.length));
    const before = this.content.slice(0, clamped);
    const lines = before.split('\n');
    const line = lines.length - 1;
    const ch = ensureNonNullable(lines[line]).length;
    return { ch, line };
  }

  /**
   * Converts a line and column position into a character offset.
   *
   * @param pos - The position; a column past the end of its line is clamped to the line's end.
   * @returns The offset from the start of the document.
   * @throws When `pos.line` is past the last line.
   */
  public posToOffset(pos: EditorPositionOriginal): number {
    const lines = this.getLines();
    let offset = 0;
    for (let index = 0; index < pos.line && index < lines.length; index++) {
      offset += ensureNonNullable(lines[index]).length + 1;
    }
    const lineLength = ensureNonNullable(lines[pos.line]).length;
    offset += Math.min(pos.ch, lineLength);
    return offset;
  }

  /**
   * Reads every line and applies the changes computed from them in one pass.
   *
   * @typeParam T - The type of the value read from each line.
   * @param read - Called for each line; returns a value for `write`, or `null`.
   * @param write - Called for each line with the value `read` returned; returns the change to make, if any.
   * @param _ignoreEmpty - Whether to skip empty lines; ignored by the mock, which visits every line.
   */
  public processLines<T>(
    read: (line: number, lineText: string) => null | T,
    write: (line: number, lineText: string, value: null | T) => EditorChangeOriginal | undefined,
    _ignoreEmpty?: boolean
  ): void {
    const lines = this.getLines();
    const changes: EditorChangeOriginal[] = [];

    for (const [index, lineText] of lines.entries()) {
      const value = read(index, lineText);
      const change = write(index, lineText, value);
      if (change) {
        changes.push(change);
      }
    }

    for (let index = changes.length - 1; index >= 0; index--) {
      const change = ensureNonNullable(changes[index]);
      this.replaceRange(change.text, change.from, change.to);
    }
  }

  /**
   * Redoes the last undone change. The mock restores the next redo snapshot, if any, and moves the cursor to the end
   * of the document.
   */
  public redo(): void {
    const entry = this.redoStack.pop();
    if (entry === undefined) {
      return;
    }

    this.undoStack.push(this.content);
    this.content = entry;
    const endPos = this.offsetToPos(this.content.length);
    this.anchor = { ...endPos };
    this.head = { ...endPos };
  }

  /**
   * Re-measures and redraws the editor. A no-op in the mock, which renders nothing.
   */
  public refresh(): void {
    noop();
  }

  /**
   * Replaces the text between two positions, or inserts it at one. The mock records an undo snapshot, clears the
   * redo history and puts the cursor after the inserted text.
   *
   * @param replacement - The text to insert.
   * @param from - The start of the range.
   * @param to - The end of the range; when omitted the text is inserted at `from`.
   * @param _origin - The change's origin, used by Obsidian for undo grouping; ignored by the mock.
   */
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

  /**
   * Replaces the selected text, or inserts at the cursor when nothing is selected.
   *
   * @param replacement - The text to insert.
   * @param _origin - The change's origin; ignored by the mock.
   */
  public replaceSelection(replacement: string, _origin?: string): void {
    const from = this.minPos(this.anchor, this.head);
    const to = this.maxPos(this.anchor, this.head);
    this.replaceRange(replacement, from, to);
  }

  /**
   * Scrolls a range into view. A no-op in the mock; the scroll position is unchanged.
   *
   * @param _range - The range to reveal.
   * @param _center - Whether to center the range in the viewport.
   */
  public scrollIntoView(_range: EditorRangeOriginal, _center?: boolean): void {
    noop();
  }

  /**
   * Scrolls to a position. The mock only records it for {@link Editor.getScrollInfo}.
   *
   * @param x - The horizontal scroll position; `null` or omitted keeps the current one.
   * @param y - The vertical scroll position; `null` or omitted keeps the current one.
   */
  public scrollTo(x?: null | number, y?: null | number): void {
    if (x !== null && x !== undefined) {
      this.scrollLeft = x;
    }
    if (y !== null && y !== undefined) {
      this.scrollTop = y;
    }
  }

  /**
   * Moves the cursor, collapsing the selection.
   *
   * @param pos - The position, or a zero-based line number.
   * @param ch - The column, when `pos` is a line number; `0` when omitted.
   */
  public setCursor(pos: EditorPositionOriginal | number, ch?: number): void {
    const resolved: EditorPositionOriginal = typeof pos === 'number'
      ? { ch: ch ?? 0, line: pos }
      : { ...pos };
    this.anchor = { ...resolved };
    this.head = { ...resolved };
  }

  /**
   * Replaces the text of a line, as a {@link Editor.replaceRange} over the whole line.
   *
   * @param n - The zero-based line number.
   * @param text - The new text of the line.
   * @throws When the line does not exist.
   */
  public setLine(n: number, text: string): void {
    const from: EditorPositionOriginal = { ch: 0, line: n };
    const lineLength = ensureNonNullable(this.getLines()[n]).length;
    const to: EditorPositionOriginal = { ch: lineLength, line: n };
    this.replaceRange(text, from, to);
  }

  /**
   * Sets the selection.
   *
   * @param anchor - The fixed end of the selection.
   * @param head - The moving end; when omitted the selection collapses to a cursor at `anchor`.
   */
  public setSelection(anchor: EditorPositionOriginal, head?: EditorPositionOriginal): void {
    this.anchor = { ...anchor };
    this.head = head ? { ...head } : { ...anchor };
  }

  /**
   * Sets multiple selections. The mock tracks only one, so it keeps the main range.
   *
   * @param ranges - The selections or carets.
   * @param main - The index of the main selection; the first range is used when that index does not exist.
   * @throws When `ranges` is empty.
   */
  public setSelections(ranges: EditorSelectionOrCaretOriginal[], main = 0): void {
    const sel = ensureNonNullable(ranges[main] ?? ranges[0]);
    this.anchor = { ...sel.anchor };
    this.head = sel.head ? { ...sel.head } : { ...sel.anchor };
  }

  /**
   * Replaces the whole document. The mock moves the cursor to the start and does not record an undo snapshot.
   *
   * @param content - The new document text.
   */
  public setValue(content: string): void {
    this.content = content;
    this.anchor = { ch: 0, line: 0 };
    this.head = { ch: 0, line: 0 };
  }

  /**
   * Checks whether any text is selected.
   *
   * @returns `true` when the anchor and head differ.
   */
  public somethingSelected(): boolean {
    return this.anchor.line !== this.head.line || this.anchor.ch !== this.head.ch;
  }

  /**
   * Applies a set of changes and selections as one transaction. The mock applies each change through
   * {@link Editor.replaceRange} in order, each against the document as the previous change left it, then sets the
   * selection.
   *
   * @param tx - The changes and selection to apply.
   * @param _origin - The transaction's origin; ignored by the mock.
   */
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

  /**
   * Undoes the last change. The mock restores the previous snapshot, if any, and moves the cursor to the end of the
   * document.
   */
  public undo(): void {
    const entry = this.undoStack.pop();
    if (entry === undefined) {
      return;
    }

    this.redoStack.push(this.content);
    this.content = entry;
    const endPos = this.offsetToPos(this.content.length);
    this.anchor = { ...endPos };
    this.head = { ...endPos };
  }

  /**
   * Finds the word at a position. The mock treats a word as a run of `\w` characters on one line.
   *
   * @param pos - The position to look at; the character at `pos.ch` must be a word character.
   * @returns The range of the word, or `null` when there is no word at that position.
   */
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
    const lineLength = ensureNonNullable(lines[newLine]).length;
    this.setCursor({ ch: Math.min(cursor.ch, lineLength), line: newLine });
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
      const previousLineLength = ensureNonNullable(lines[cursor.line - 1]).length;
      this.setCursor({ ch: previousLineLength, line: cursor.line - 1 });
    }
  }

  private execGoRight(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    const currentLineLength = ensureNonNullable(lines[cursor.line]).length;
    if (cursor.ch < currentLineLength) {
      this.setCursor({ ch: cursor.ch + 1, line: cursor.line });
    } else if (cursor.line < lines.length - 1) {
      this.setCursor({ ch: 0, line: cursor.line + 1 });
    }
  }

  private execGoUp(): void {
    const cursor = this.getCursor();
    const lines = this.content.split('\n');
    const newLine = Math.max(0, cursor.line - 1);
    const lineLength = ensureNonNullable(lines[newLine]).length;
    this.setCursor({ ch: Math.min(cursor.ch, lineLength), line: newLine });
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
    for (let index = endLine; index >= startLine; index--) {
      if (more) {
        this.replaceRange('\t', { ch: 0, line: index }, { ch: 0, line: index });
      } else if (this.getLine(index).startsWith('\t')) {
        this.replaceRange('', { ch: 0, line: index }, { ch: 1, line: index });
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
    return a.line > b.line || (a.line === b.line && a.ch > b.ch) ? { ...a } : { ...b };
  }

  private minPos(a: EditorPositionOriginal, b: EditorPositionOriginal): EditorPositionOriginal {
    return a.line < b.line || (a.line === b.line && a.ch < b.ch) ? { ...a } : { ...b };
  }
}
