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

const SURROGATE_PAIR_LENGTH = 2;
const WORD_CHAR_REG_EXP = /[\p{Alphabetic}\p{Number}_]/u;

interface ChangeSection {
  // The length of new text replacing this section, or `-1` when the section is unchanged.
  insertLength: number;
  length: number;
}

interface ChangeSet {
  readonly newText: string;
  readonly sections: readonly ChangeSection[];
}

interface HistoryEntry {
  // The document this entry restores.
  readonly content: string;
  // The forward change `content` was turned into by the change this entry undoes, so the opposite branch can
  // map `selection` through it: CodeMirror's `HistEvent.changes.invertedDesc`.
  readonly sections: readonly ChangeSection[];
  // The selection this entry restores, as offsets into `content`: CodeMirror's `HistEvent.startSelection`.
  readonly selection: OffsetSelection;
}

interface OffsetChange {
  readonly from: number;
  readonly insert: string;
  readonly to: number;
}

interface OffsetSelection {
  readonly anchor: number;
  readonly head: number;
}

/**
 * Mock of Obsidian's abstract `Editor`, the common interface over the CodeMirror editors.
 *
 * The document is a plain string with `\n` line breaks. The mock tracks one selection (an anchor and a head),
 * focus and scroll position, and keeps whole-document snapshots for undo and redo, each carrying the selection its
 * change started from. Folding and scrolling a range into view are no-ops.
 *
 * Two properties of CodeMirror's history are deliberately not modelled, because both would make the mock's
 * history depend on wall-clock time or on where the cursor has been since a change: a bare selection change is
 * not recorded against the last change (CodeMirror's `selectionsAfter`, which would take precedence over the
 * mapped selection when redoing), and consecutive typing or deleting changes are never grouped into one history
 * entry (CodeMirror's `addChanges` joins them within its `newGroupDelay`, keyed on the `origin` the mock ignores).
 */
export abstract class Editor {
  private anchor: EditorPositionOriginal = { ch: 0, line: 0 };

  private content = '';

  private focused = false;
  private head: EditorPositionOriginal = { ch: 0, line: 0 };
  private redoStack: HistoryEntry[] = [];
  private scrollLeft = 0;
  private scrollTop = 0;
  private readonly undoStack: HistoryEntry[] = [];
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
   * Converts a line and column position into a character offset, resolving it the way Obsidian does.
   *
   * @param pos - The position. A line before the first resolves to the start of the document and a line past the
   * last to its end. A non-finite column resolves to the end of its line, and a negative one counts back from that
   * end, stopping at the line's start. Any other column is added to the line's start as is, so a column past the end
   * of its line runs on into the lines after it.
   * @returns The offset from the start of the document.
   */
  public posToOffset(pos: EditorPositionOriginal): number {
    if (pos.line < 0) {
      return 0;
    }

    const lines = this.getLines();
    if (pos.line >= lines.length) {
      return this.content.length;
    }

    let lineStart = 0;
    for (let index = 0; index < pos.line; index++) {
      lineStart += ensureNonNullable(lines[index]).length + 1;
    }

    const lineLength = ensureNonNullable(lines[pos.line]).length;
    const ch = Number.isFinite(pos.ch) ? pos.ch : lineLength;
    return lineStart + (ch < 0 ? Math.max(0, lineLength + ch) : ch);
  }

  /**
   * Reads the lines the selection covers and applies the changes computed from them as one transaction, as Obsidian
   * does. `read` is called for every such line first, then `write` for each of them, so both see the document as it
   * was before any change, and the whole pass is a single undo step.
   *
   * @typeParam T - The type of the value read from each line.
   * @param read - Called for each line the selection covers; returns a value for `write`, or `null`.
   * @param write - Called for each line with the value `read` returned; returns the change to make, if any.
   * @param ignoreEmpty - Whether to skip lines that hold nothing but whitespace, which are then neither read nor
   * written; `true` when omitted, and only honoured when more than one line is in play.
   */
  public processLines<T>(
    read: (line: number, lineText: string) => null | T,
    write: (line: number, lineText: string, value: null | T) => EditorChangeOriginal | undefined,
    ignoreEmpty = true
  ): void {
    // The mock tracks one selection, so Obsidian's union over every selection's lines is one contiguous run, and
    // its "there is only one selection" guard on the cursor case below is vacuous here.
    const selection = ensureNonNullable(this.listSelections()[0]);
    const firstLine = Math.min(selection.anchor.line, selection.head.line);
    const lastLine = Math.max(selection.anchor.line, selection.head.line);
    const lines: number[] = [];
    for (let line = firstLine; line <= lastLine; line++) {
      lines.push(line);
    }

    const reads = lines.map((line) => {
      const lineText = this.getLine(line);
      const skipped = ignoreEmpty && lines.length > 1 && !lineText.trim();
      return { line, value: skipped ? null : read(line, lineText) };
    });

    const changes: EditorChangeOriginal[] = [];
    for (const { line, value } of reads) {
      if (ignoreEmpty && value === null) {
        continue;
      }
      const change = write(line, this.getLine(line), value);
      if (change) {
        changes.push(change);
      }
    }

    if (changes.length === 0) {
      return;
    }

    // Obsidian's one special case: a lone cursor at the start of the first change's line is kept at the start of
    // that line's text by shifting it over what that change added or removed, never past the line's start.
    const firstChange = ensureNonNullable(changes[0]);
    const isCursor = selection.anchor.line === selection.head.line && selection.anchor.ch === selection.head.ch;
    if (selection.anchor.ch === 0 && isCursor && selection.anchor.line === firstChange.from.line) {
      const replacedLength = firstChange.to ? firstChange.to.ch - firstChange.from.ch : 0;
      const ch = Math.max(0, firstChange.text.length - replacedLength);
      this.transaction({ changes, selection: { from: { ch, line: selection.anchor.line } } });
      return;
    }

    this.transaction({ changes });
  }

  /**
   * Redoes the last undone change. The mock restores the document and the selection the change was undone from, as
   * CodeMirror's history does, so redoing an insertion puts the cursor after the inserted text.
   */
  public redo(): void {
    this.popHistory(this.redoStack, this.undoStack);
  }

  /**
   * Re-measures and redraws the editor. A no-op in the mock, which renders nothing.
   */
  public refresh(): void {
    noop();
  }

  /**
   * Replaces the text between two positions, or inserts it at one, as one change: it can be undone, it clears the
   * redo history, and the selection is mapped through it rather than set, as Obsidian dispatches no selection of its
   * own. So a cursor exactly at the insertion point stays in FRONT of the inserted text, and one after it shifts
   * along. A change that changes nothing is no change at all.
   *
   * @param replacement - The text to insert.
   * @param from - The start of the range.
   * @param to - The end of the range; when omitted the text is inserted at `from`.
   * @param _origin - The change's origin, used by Obsidian for undo grouping; ignored by the mock.
   * @throws RangeError when the range runs backwards or ends past the end of the document.
   */
  public replaceRange(replacement: string, from: EditorPositionOriginal, to?: EditorPositionOriginal, _origin?: string): void {
    const startOffset = this.posToOffset(from);
    const endOffset = to ? this.posToOffset(to) : startOffset;
    this.dispatchChanges([{ from: startOffset, insert: replacement, to: endOffset }]);
  }

  /**
   * Replaces the selected text, or inserts at the cursor when nothing is selected. Unlike
   * {@link Editor.replaceRange}, this one sets the selection: the cursor goes after the inserted text, as
   * CodeMirror's `EditorState.replaceSelection` puts it.
   *
   * @param replacement - The text to insert.
   * @param _origin - The change's origin; ignored by the mock.
   */
  public replaceSelection(replacement: string, _origin?: string): void {
    const from = this.posToOffset(this.minPos(this.anchor, this.head));
    const to = this.posToOffset(this.maxPos(this.anchor, this.head));
    this.dispatchChanges([{ from, insert: replacement, to }], () => {
      const cursor = from + replacement.length;
      return { anchor: cursor, head: cursor };
    });
  }

  /**
   * Mock-only: replaces the whole document and drops the undo and redo history, as Obsidian does when a view loads
   * a file into a fresh editor state. The cursor moves to the start of the document.
   *
   * @param content - The new document text.
   */
  public resetState__(content: string): void {
    this.content = content;
    this.anchor = { ch: 0, line: 0 };
    this.head = { ch: 0, line: 0 };
    this.undoStack.length = 0;
    this.redoStack = [];
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
   * Replaces the whole document as one change, as Obsidian does: the change can be undone and clears the redo
   * history, and the selection is mapped through it, so a cursor at the end of the old document stays at the end of
   * the new one and a cursor anywhere else moves to the start. Replacing an empty document with an empty one is no
   * change at all.
   *
   * @param content - The new document text.
   */
  public setValue(content: string): void {
    this.dispatchChanges([{ from: 0, insert: content, to: this.content.length }]);
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
   * Applies a set of changes and selections as one transaction, as Obsidian does.
   *
   * `replaceSelection` replaces the selected text and `changes` follow it. Every position in them refers to the
   * document as it was BEFORE the transaction, the way CodeMirror reads a change set, so a change listed after one
   * that precedes it in the document still lands where its positions say. The whole transaction is a single undo
   * step.
   *
   * The selection is then taken from `selections` (the mock keeps the first), else `selection`, both resolved against
   * the document AFTER the changes; else the cursor goes after the `replaceSelection` text; else the existing
   * selection is mapped through the changes.
   *
   * @param tx - The changes and selection to apply.
   * @param _origin - The transaction's origin; ignored by the mock.
   */
  public transaction(tx: EditorTransactionOriginal, _origin?: string): void {
    const changes: OffsetChange[] = [];
    let replaceSelectionEnd: null | number = null;

    if (typeof tx.replaceSelection === 'string') {
      const from = this.posToOffset(this.minPos(this.anchor, this.head));
      const to = this.posToOffset(this.maxPos(this.anchor, this.head));
      changes.push({ from, insert: tx.replaceSelection, to });
      replaceSelectionEnd = from + tx.replaceSelection.length;
    }

    for (const change of tx.changes ?? []) {
      const from = this.posToOffset(change.from);
      const to = change.to ? this.posToOffset(change.to) : from;
      changes.push({ from, insert: change.text, to });
    }

    this.dispatchChanges(changes, () => {
      const range = tx.selections?.[0] ?? tx.selection;
      if (range) {
        const anchor = this.posToOffset(range.from);
        return { anchor, head: range.to ? this.posToOffset(range.to) : anchor };
      }

      return replaceSelectionEnd === null ? null : { anchor: replaceSelectionEnd, head: replaceSelectionEnd };
    });
  }

  /**
   * Undoes the last change. The mock restores the document and the selection the change started from, as
   * CodeMirror's history does.
   */
  public undo(): void {
    this.popHistory(this.undoStack, this.redoStack);
  }

  /**
   * Finds the word at a position, as CodeMirror does. A word is a run of letters, digits and underscores on one line,
   * found from either side of the position, so a position just after a word (the end of a line included) finds that
   * word.
   *
   * @param pos - The position to look at, resolved as {@link Editor.posToOffset} resolves it.
   * @returns The range of the word, or `null` when neither the character before the position nor the one after it is
   * a word character.
   * @throws RangeError when the position resolves past the end of the document.
   */
  public wordAt(pos: EditorPositionOriginal): EditorRangeOriginal | null {
    const offset = this.posToOffset(pos);
    if (offset > this.content.length) {
      throw new RangeError(`Invalid position ${String(offset)} in document of length ${String(this.content.length)}`);
    }

    const lineStart = offset === 0 ? 0 : this.content.lastIndexOf('\n', offset - 1) + 1;
    const lineBreakIndex = this.content.indexOf('\n', offset);
    const lineText = this.content.slice(lineStart, lineBreakIndex === -1 ? this.content.length : lineBreakIndex);

    let start = offset - lineStart;
    while (start > 0) {
      const previous = start - (endsWithSurrogatePair(lineText.slice(0, start)) ? SURROGATE_PAIR_LENGTH : 1);
      if (!WORD_CHAR_REG_EXP.test(lineText.slice(previous, start))) {
        break;
      }
      start = previous;
    }

    let end = offset - lineStart;
    while (end < lineText.length) {
      const next = end + (startsWithSurrogatePair(lineText.slice(end)) ? SURROGATE_PAIR_LENGTH : 1);
      if (!WORD_CHAR_REG_EXP.test(lineText.slice(end, next))) {
        break;
      }
      end = next;
    }

    return start === end
      ? null
      : {
        from: this.offsetToPos(lineStart + start),
        to: this.offsetToPos(lineStart + end)
      };
  }

  private dispatchChanges(
    changes: readonly OffsetChange[],
    resolveSelection?: (oldSelection: OffsetSelection, sections: readonly ChangeSection[]) => null | OffsetSelection
  ): void {
    const oldLength = this.content.length;
    const oldSelection: OffsetSelection = {
      anchor: Math.min(this.posToOffset(this.anchor), oldLength),
      head: Math.min(this.posToOffset(this.head), oldLength)
    };
    const { newText, sections } = buildChangeSet(this.content, changes);

    if (sections.some((section) => section.insertLength >= 0)) {
      this.undoStack.push({ content: this.content, sections, selection: oldSelection });
      this.redoStack = [];
      this.content = newText;
    }

    const selection = resolveSelection?.(oldSelection, sections) ?? mapSelection(oldSelection, sections, -1);
    this.anchor = this.offsetToPos(selection.anchor);
    this.head = this.offsetToPos(selection.head);
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

  // CodeMirror's `indentMore` / `indentLess`, which go through `changeBySelectedLine`: one transaction over every
  // line in play, with BOTH ends of the selection mapped at assoc 1 rather than the usual from-forward /
  // to-backward, so an indent shifts a cursor at the start of a line along with its text.
  private execIndent(more: boolean): void {
    const cursor = this.getCursor();
    const from = this.getCursor('from');
    const to = this.getCursor('to');
    const startLine = this.somethingSelected() ? from.line : cursor.line;
    const endLine = this.somethingSelected() ? to.line : cursor.line;
    const changes: OffsetChange[] = [];

    for (let index = startLine; index <= endLine; index++) {
      const lineStart = this.posToOffset({ ch: 0, line: index });
      if (more) {
        changes.push({ from: lineStart, insert: '\t', to: lineStart });
      } else if (this.getLine(index).startsWith('\t')) {
        changes.push({ from: lineStart, insert: '', to: lineStart + 1 });
      }
    }

    this.dispatchChanges(changes, (oldSelection, sections) => ({
      anchor: mapPos(sections, oldSelection.anchor, 1),
      head: mapPos(sections, oldSelection.head, 1)
    }));
  }

  // CodeMirror's `insertNewlineAndIndent`, whose range is an explicit cursor after the inserted break and indent.
  private execNewlineAndIndent(): void {
    const cursor = this.getCursor();
    const currentLine = ensureNonNullable(this.content.split('\n')[cursor.line]);
    const indent = ensureNonNullable(/^[\t ]*/.exec(currentLine)?.[0]);
    const insert = `\n${indent}`;
    const offset = this.posToOffset(cursor);
    this.dispatchChanges([{ from: offset, insert, to: offset }], () => {
      const end = offset + insert.length;
      return { anchor: end, head: end };
    });
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

  // CodeMirror's `HistoryState.pop` and the entry its transaction leaves on the opposite branch.
  private popHistory(from: HistoryEntry[], to: HistoryEntry[]): void {
    const entry = from.pop();
    if (!entry) {
      return;
    }

    // CodeMirror records the popped entry's own selection, mapped FORWARD through the change being undone at
    // assoc 1, so the opposite branch lands after that change's text rather than in front of it.
    to.push({
      content: this.content,
      sections: invertSections(entry.sections),
      selection: mapSelection(entry.selection, entry.sections, 1)
    });

    this.content = entry.content;
    this.anchor = this.offsetToPos(entry.selection.anchor);
    this.head = this.offsetToPos(entry.selection.head);
  }
}

// CodeMirror's `addSection`: skips an empty section and joins it to the last one where CodeMirror does.
function addSection(sections: ChangeSection[], length: number, insertLength: number): void {
  if (length === 0 && insertLength <= 0) {
    return;
  }

  const last = sections.at(-1);
  if (last && insertLength <= 0 && insertLength === last.insertLength) {
    last.length += length;
  } else if (last && length === 0 && last.length === 0) {
    last.insertLength += insertLength;
  } else {
    sections.push({ insertLength, length });
  }
}

// Builds the change set CodeMirror's `ChangeSet.of` builds from changes whose positions all refer to one document.
// The changes are taken in document order, keeping the listed order among those that start at one position, so
// text inserted there keeps that order too. A change starting inside the range an earlier one replaces extends that
// deletion and puts its text after the earlier text, so no change deletes text another inserted.
function buildChangeSet(text: string, changes: readonly OffsetChange[]): ChangeSet {
  const sections: ChangeSection[] = [];
  let newText = '';
  let pos = 0;

  // `Array.prototype.sort` is stable, so changes starting at one position keep their listed order.
  for (const change of [...changes].sort((a, b) => a.from - b.from)) {
    if (change.from < 0 || change.from > change.to || change.to > text.length) {
      throw new RangeError(
        `Invalid change range ${String(change.from)} to ${String(change.to)} (in doc of length ${String(text.length)})`
      );
    }

    if (change.from >= pos) {
      addSection(sections, change.from - pos, -1);
      addSection(sections, change.to - change.from, change.insert.length);
      newText += text.slice(pos, change.from) + change.insert;
      pos = change.to;
    } else {
      addSection(sections, Math.max(0, change.to - pos), change.insert.length);
      newText += change.insert;
      pos = Math.max(pos, change.to);
    }
  }

  addSection(sections, text.length - pos, -1);
  newText += text.slice(pos);
  return { newText, sections };
}

function endsWithSurrogatePair(text: string): boolean {
  return /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(text);
}

// CodeMirror's `ChangeDesc.invertedDesc`: a changed section swaps what it replaced for what it inserted, and an
// unchanged one describes the same untouched text either way round.
function invertSections(sections: readonly ChangeSection[]): ChangeSection[] {
  return sections.map((section) =>
    section.insertLength < 0
      ? { insertLength: section.insertLength, length: section.length }
      : { insertLength: section.length, length: section.insertLength }
  );
}

// CodeMirror's `ChangeDesc.mapPos` in its simple mode.
function mapPos(sections: readonly ChangeSection[], pos: number, assoc: -1 | 1): number {
  let posA = 0;
  let posB = 0;
  for (const section of sections) {
    const endA = posA + section.length;
    if (section.insertLength < 0) {
      if (endA > pos) {
        return posB + (pos - posA);
      }
      posB += section.length;
    } else {
      if (endA > pos || (endA === pos && assoc < 0 && section.length === 0)) {
        return pos === posA || assoc < 0 ? posB : posB + section.insertLength;
      }
      posB += section.insertLength;
    }
    posA = endA;
  }
  return posB;
}

// CodeMirror's `SelectionRange.map`: a cursor maps with `assoc`, while a range always maps its start forward and
// its end backward, whatever `assoc` says.
function mapSelection(selection: OffsetSelection, sections: readonly ChangeSection[], assoc: -1 | 1): OffsetSelection {
  const { anchor, head } = selection;
  if (anchor === head) {
    const cursor = mapPos(sections, anchor, assoc);
    return { anchor: cursor, head: cursor };
  }

  const from = mapPos(sections, Math.min(anchor, head), 1);
  const to = mapPos(sections, Math.max(anchor, head), -1);
  return anchor < head ? { anchor: from, head: to } : { anchor: to, head: from };
}

function startsWithSurrogatePair(text: string): boolean {
  return /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(text);
}
