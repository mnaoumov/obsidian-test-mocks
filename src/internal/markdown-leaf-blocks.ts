/**
 * @file
 *
 * A container-aware pre-pass over a note's body that finds which lines start a list item, and which lines sit inside a
 * block that hides them: a fenced code block, a `%%` comment, a `$$` math block or an indented code block. Obsidian
 * never reports a list item inside one of those, and an unclosed one runs to the end of its container, which is the
 * end of the note at the top level. A regular expression over the whole note cannot see either fact, since both depend
 * on the blockquote levels and list items the block sits in.
 *
 * The container model follows CommonMark's, with the departures measured against Obsidian 1.14.4:
 *
 * - A line that leaves a container is a lazy continuation of whatever block is open, a fenced code block or a comment
 *   included, unless it starts a block that can interrupt a paragraph, or follows a blank line.
 * - A `$$` line lazily continuing a list item opens a math block inside the item, while one leaving a blockquote ends
 *   the blockquote.
 * - A line indented four or more columns past a blockquote it does not continue is no lazy continuation: it ends the
 *   blockquote and starts an indented code block.
 * - A `>` line that lazily continues a list item opens a blockquote inside that item, which later `>` lines continue at
 *   any indent.
 * - A list marker on a line that closes a list item starts the next item at any indent.
 */

import { ensureNonNullable } from './type-guards.ts';

/**
 * What the pre-pass found, by line number in the note.
 */
export interface LeafBlockScan {
  /**
   * Non-blank lines that leave a blockquote without being a lazy continuation, so they end it, each with the number of
   * blockquote levels it stays inside.
   */
  readonly breakLines: ReadonlyMap<number, number>;

  /**
   * Lines that close a fenced code block, a comment or a math block.
   */
  readonly closerLines: ReadonlySet<number>;

  /**
   * Lines inside a fenced code block, a comment, a math block or an indented code block, other than the line that opens
   * it. Such a line is never a list item and never ends one.
   */
  readonly contentLines: ReadonlySet<number>;

  /**
   * Lines that open a fenced code block, a comment or a math block outside a blockquote, which unlike an indented code
   * block runs on until a line closes it or its container ends.
   */
  readonly hidingOpenerLines: ReadonlySet<number>;

  /**
   * Lines that start a list item.
   */
  readonly itemLines: ReadonlySet<number>;

  /**
   * Lines that open a fenced code block, a comment, a math block or an indented code block.
   */
  readonly openerLines: ReadonlySet<number>;
}

type Container = ItemContainer | QuoteContainer;

interface Cursor {
  // The column the innermost matched container's content starts at, which indentation is measured from.
  base: number;
  // The visual column of `line[index]`.
  column: number;
  index: number;
}

interface FencedLeaf {
  readonly char: string;
  readonly kind: 'fence';
  readonly length: number;
}

interface ItemContainer {
  readonly kind: 'item';
  // How many columns past its container's content the item's own content starts.
  readonly width: number;
}

interface ItemMarker extends LinePosition {
  readonly marker: string;
}

type Leaf = FencedLeaf | SimpleLeaf;

interface LinePosition {
  // The visual column of `line[index]`.
  readonly column: number;
  readonly index: number;
}

/**
 * A line once its containers are matched: where its own text starts, and that text.
 */
interface LineRest extends LinePosition {
  // The columns of whitespace before the text, past the innermost container it continues.
  readonly indent: number;
  readonly text: string;
}

interface QuoteContainer {
  // Whether the blockquote opened on a line that lazily continued a list item, so that its `>` lines continue it at
  // any indent.
  readonly isLazy: boolean;
  readonly kind: 'quote';
}

interface ScanState {
  readonly breakLines: Map<number, number>;
  readonly closerLines: Set<number>;
  readonly containers: Container[];
  readonly contentLines: Set<number>;
  readonly hidingOpenerLines: Set<number>;
  // Whether the line before the current one was blank past its containers.
  isAfterBlankLine: boolean;
  readonly itemLines: Set<number>;
  // The leaf block open in the innermost container, if any.
  leaf: Leaf | undefined;
  readonly openerLines: Set<number>;
}

interface SimpleLeaf {
  readonly kind: 'comment' | 'heading' | 'indented' | 'math' | 'paragraph';
}

const TAB_WIDTH = 4;
const INDENTED_CODE_COLUMNS = 4;
const MAX_LIST_ITEM_CONTENT_GAP = 4;
const ITEM_REGEX = /^(?<marker>[-*+]|\d+[.)]) /;
const FENCE_OPEN_REGEX = /^(?<fence>`{3,}|~{3,})(?<info>.*)$/;
const HEADING_REGEX = /^#{1,6}(?:[ \t]|$)/;
const THEMATIC_BREAK_REGEX = /^(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const COMMENT_MARK = '%%';
const MATH_MARK = '$$';

/**
 * Scans a note's body for list items and the blocks that hide them.
 *
 * @param lines - The note's lines, without their line breaks.
 * @param firstLine - The first line of the body, past any frontmatter.
 * @returns What the scan found.
 */
export function scanLeafBlocks(lines: readonly string[], firstLine: number): LeafBlockScan {
  const state: ScanState = {
    breakLines: new Map(),
    closerLines: new Set(),
    containers: [],
    contentLines: new Set(),
    hidingOpenerLines: new Set(),
    isAfterBlankLine: false,
    itemLines: new Set(),
    leaf: undefined,
    openerLines: new Set()
  };
  for (let lineNumber = firstLine; lineNumber < lines.length; lineNumber++) {
    scanLine(state, ensureNonNullable(lines[lineNumber]), lineNumber);
  }
  return state;
}

function advanceColumn(column: number, char: string): number {
  return char === '\t' ? column + TAB_WIDTH - (column % TAB_WIDTH) : column + 1;
}

/**
 * Takes a lazy continuation line into the open leaf: a line of a hiding block, or paragraph text. A `$$` line opens a
 * math block in the innermost container, and a `>` line lazily continuing a list item opens a blockquote inside it.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param lineNumber - Its number.
 * @param rest - Where the line's text starts.
 */
function continueLazily(state: ScanState, line: string, lineNumber: number, rest: LineRest): void {
  const { leaf } = state;
  const { text } = rest;
  state.isAfterBlankLine = false;
  if (leaf && isHidingLeaf(leaf) && leaf.kind !== 'indented') {
    takeHiddenLine(state, leaf, lineNumber, text, 0);
    return;
  }
  if (isMathOpener(text)) {
    openHidingLeaf(state, { kind: 'math' }, lineNumber);
    return;
  }
  if (text.startsWith('>') && state.containers.at(-1)?.kind === 'item') {
    state.containers.push({ isLazy: true, kind: 'quote' });
    const cursor: Cursor = { base: 0, column: 0, index: 0 };
    openQuote(line, cursor, rest);
    openBlocks(state, line, lineNumber, cursor);
    state.isAfterBlankLine = line.slice(cursor.index).trim() === '';
    return;
  }
  state.leaf = { kind: 'paragraph' };
}

/**
 * Checks whether a line continues a container, moving the cursor past the container's prefix when it does.
 *
 * @param container - The container.
 * @param line - The line.
 * @param cursor - Where the container's prefix would start; advanced past it on a match.
 * @returns Whether the line continues the container.
 */
function doesContinueContainer(container: Container, line: string, cursor: Cursor): boolean {
  const position = skipWhitespace(line, cursor);
  if (container.kind === 'quote') {
    if ((position.column - cursor.base >= INDENTED_CODE_COLUMNS && !container.isLazy) || line[position.index] !== '>') {
      return false;
    }
    openQuote(line, cursor, position);
    return true;
  }
  if (position.index === line.length) {
    return true;
  }
  if (position.column - cursor.base < container.width) {
    return false;
  }
  const contentBase = cursor.base + container.width;
  while (cursor.column < contentBase) {
    cursor.column = advanceColumn(cursor.column, line.charAt(cursor.index));
    cursor.index++;
  }
  cursor.base = contentBase;
  return true;
}

/**
 * Finds the first blockquote among the containers after a position, if it opened lazily inside a list item.
 *
 * @param containers - The open containers.
 * @param afterIndex - The position to search after.
 * @returns The blockquote's index, or `-1`.
 */
function findLazyQuoteAfter(containers: readonly Container[], afterIndex: number): number {
  for (let index = afterIndex + 1; index < containers.length; index++) {
    const container = containers[index];
    if (container?.kind === 'quote') {
      return container.isLazy ? index : -1;
    }
  }
  return -1;
}

/**
 * Checks whether a backtick fence line carries a backtick in its info string, which makes it a paragraph rather than a
 * fence.
 *
 * @param text - The line's text past its whitespace.
 * @returns Whether it does.
 */
function isBacktickFenceWithBacktickInfo(text: string): boolean {
  const match = FENCE_OPEN_REGEX.exec(text);
  return match?.groups?.['fence']?.startsWith('`') === true && ensureNonNullable(match.groups['info']).includes('`');
}

/**
 * Checks whether a line's text opens a `%%` comment block: it starts with `%%` and does not close it again, since a
 * comment closed on the line that opens it is part of a paragraph.
 *
 * @param text - The line's text past its whitespace.
 * @returns Whether it does.
 */
function isCommentOpener(text: string): boolean {
  return text.startsWith(COMMENT_MARK) && !text.slice(COMMENT_MARK.length).includes(COMMENT_MARK);
}

/**
 * Checks whether a leaf hides the lines it holds.
 *
 * @param leaf - The leaf, if any.
 * @returns Whether it is a fenced code block, a comment, a math block or an indented code block.
 */
function isHidingLeaf(leaf: Leaf | undefined): boolean {
  return leaf !== undefined && leaf.kind !== 'heading' && leaf.kind !== 'paragraph';
}

/**
 * Checks whether the text past a line's containers starts a block that ends a paragraph, and with it any lazy
 * continuation. A `$$` line is not one of them, nor is a `>` line, which opens a blockquote rather than ending anything.
 *
 * @param text - The text past the line's whitespace.
 * @returns Whether it interrupts.
 */
function isLazyInterrupter(text: string): boolean {
  return ITEM_REGEX.test(text)
    || (FENCE_OPEN_REGEX.test(text) && !isBacktickFenceWithBacktickInfo(text))
    || isCommentOpener(text)
    || HEADING_REGEX.test(text)
    || THEMATIC_BREAK_REGEX.test(text);
}

/**
 * Checks whether a line that leaves some of the open containers continues them lazily.
 *
 * @param state - The scan.
 * @param matchedCount - How many containers the line continues.
 * @param rest - The text past the containers it continues.
 * @returns Whether it does.
 */
function isLazyLine(state: ScanState, matchedCount: number, rest: LineRest): boolean {
  const isLeavingQuote = state.containers[matchedCount]?.kind === 'quote';
  return !(isLeavingQuote && (rest.indent >= INDENTED_CODE_COLUMNS || isMathOpener(rest.text))) && !isLazyInterrupter(rest.text);
}

/**
 * Checks whether a line closes the open fenced code block, comment or math block it is a line of.
 *
 * @param leaf - The open block, which is never a paragraph, a heading or an indented code block.
 * @param text - The line's text past its containers.
 * @param indent - The columns of whitespace before it.
 * @returns Whether the block ends with this line.
 */
function isLeafClosedBy(leaf: Leaf, text: string, indent: number): boolean {
  switch (leaf.kind) {
    case 'comment': {
      return text.includes(COMMENT_MARK);
    }
    case 'fence': {
      if (indent >= INDENTED_CODE_COLUMNS) {
        return false;
      }
      let runLength = 0;
      while (text[runLength] === leaf.char) {
        runLength++;
      }
      return runLength >= leaf.length && text.slice(runLength).trim() === '';
    }
    default: {
      return text.trimEnd().endsWith(MATH_MARK);
    }
  }
}

/**
 * Checks whether a line's text opens a `$$` math block: it starts with `$$` and does not end with another, since a math
 * block closed on the line that opens it is part of a paragraph.
 *
 * @param text - The line's text past its whitespace.
 * @returns Whether it does.
 */
function isMathOpener(text: string): boolean {
  return text.startsWith(MATH_MARK) && !text.slice(MATH_MARK.length).trimEnd().endsWith(MATH_MARK);
}

/**
 * Checks whether the text past a line's containers starts a block that interrupts a paragraph in its own container.
 *
 * @param text - The text past the line's whitespace.
 * @returns Whether it does.
 */
function isParagraphInterrupter(text: string): boolean {
  return isLazyInterrupter(text) || text.startsWith('>') || text.startsWith(MATH_MARK);
}

/**
 * Matches the open containers against a line, moving the cursor past each prefix it continues.
 *
 * @param containers - The open containers.
 * @param line - The line.
 * @param cursor - The cursor, moved.
 * @returns How many containers the line continues.
 */
function matchContainers(containers: readonly Container[], line: string, cursor: Cursor): number {
  let matchedCount = 0;
  while (matchedCount < containers.length) {
    const container = containers[matchedCount];
    if (container && doesContinueContainer(container, line, cursor)) {
      matchedCount++;
      continue;
    }
    // A blockquote opened lazily inside a list item continues on its own `>` lines, whatever their indent, and so do
    // the items around it.
    const quoteIndex = findLazyQuoteAfter(containers, matchedCount);
    const quote = containers[quoteIndex];
    const quoteCursor = { ...cursor };
    if (!quote || !doesContinueContainer(quote, line, quoteCursor)) {
      break;
    }
    Object.assign(cursor, quoteCursor);
    matchedCount = quoteIndex + 1;
  }
  return matchedCount;
}

/**
 * Opens the blocks a line starts past the containers it continues: blockquote levels and list items, then one leaf.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param lineNumber - Its number.
 * @param cursor - Where the new blocks start.
 * @param isAfterListItem - Whether the line closed a list item, in which case Obsidian takes a marker at any indent as
 * the next item of the list, where it would otherwise start an indented code block.
 */
function openBlocks(state: ScanState, line: string, lineNumber: number, cursor: Cursor, isAfterListItem = false): void {
  let isAfterQuote = false;
  let canIndentItem = isAfterListItem;
  for (;; canIndentItem = false) {
    const position = skipWhitespace(line, cursor);
    const text = line.slice(position.index);
    if (text === '') {
      state.leaf = undefined;
      return;
    }
    if (position.column - cursor.base >= INDENTED_CODE_COLUMNS && !(canIndentItem && ITEM_REGEX.test(text))) {
      state.leaf = { kind: 'indented' };
      state.openerLines.add(lineNumber);
      return;
    }
    if (text.startsWith('>')) {
      state.containers.push({ isLazy: false, kind: 'quote' });
      openQuote(line, cursor, position);
      isAfterQuote = true;
      continue;
    }
    // Measured on Obsidian 1.14.4: a tab straight after a quote marker, or after its optional space, never starts a list
    // item.
    const itemMatch = isAfterQuote && line[cursor.index] === '\t' ? null : ITEM_REGEX.exec(text);
    if (!itemMatch) {
      openLeaf(state, text, lineNumber);
      return;
    }
    openItem(state, line, lineNumber, cursor, { ...position, marker: ensureNonNullable(itemMatch.groups?.['marker']) });
    isAfterQuote = false;
  }
}

/**
 * Opens a fenced code block, a comment or a math block. One inside a blockquote is not recorded as a hiding opener: the
 * blank line that could leave it open before a sibling item ends the blockquote, and the block with it.
 *
 * @param state - The scan.
 * @param leaf - The block.
 * @param lineNumber - The line that opens it.
 */
function openHidingLeaf(state: ScanState, leaf: Leaf, lineNumber: number): void {
  state.leaf = leaf;
  state.openerLines.add(lineNumber);
  if (state.containers.at(-1)?.kind !== 'quote') {
    state.hidingOpenerLines.add(lineNumber);
  }
}

/**
 * Opens a list item and moves the cursor to its content.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param lineNumber - Its number.
 * @param cursor - The cursor, moved.
 * @param marker - The marker, with its index and visual column.
 */
function openItem(state: ScanState, line: string, lineNumber: number, cursor: Cursor, marker: ItemMarker): void {
  const markerEndColumn = marker.column + marker.marker.length;
  // One to four columns of whitespace after the marker belong to it, and anything wider leaves the content one column
  // past it. Obsidian applies that to an item with nothing after its marker too.
  let content: LinePosition = { column: markerEndColumn + 1, index: marker.index + marker.marker.length + 1 };
  const gap = skipWhitespace(line, content);
  if (gap.column - markerEndColumn <= MAX_LIST_ITEM_CONTENT_GAP) {
    content = gap;
  }
  state.containers.push({ kind: 'item', width: content.column - cursor.base });
  state.itemLines.add(lineNumber);
  state.leaf = undefined;
  cursor.index = content.index;
  cursor.column = content.column;
  cursor.base = content.column;
}

/**
 * Opens the leaf a line's text starts.
 *
 * @param state - The scan.
 * @param text - The text past the line's containers and whitespace.
 * @param lineNumber - The line's number.
 */
function openLeaf(state: ScanState, text: string, lineNumber: number): void {
  const fenceMatch = FENCE_OPEN_REGEX.exec(text);
  if (fenceMatch && !isBacktickFenceWithBacktickInfo(text)) {
    const fence = ensureNonNullable(fenceMatch.groups?.['fence']);
    openHidingLeaf(state, { char: fence.charAt(0), kind: 'fence', length: fence.length }, lineNumber);
    return;
  }
  // A comment or a math block closed on the line that opens it is part of a paragraph.
  if (isCommentOpener(text)) {
    openHidingLeaf(state, { kind: 'comment' }, lineNumber);
    return;
  }
  if (isMathOpener(text)) {
    openHidingLeaf(state, { kind: 'math' }, lineNumber);
    return;
  }
  state.leaf = { kind: HEADING_REGEX.test(text) || THEMATIC_BREAK_REGEX.test(text) ? 'heading' : 'paragraph' };
}

/**
 * Moves a cursor past a `>` and the one optional space after it.
 *
 * @param line - The line.
 * @param cursor - The cursor, moved.
 * @param quote - Where the `>` is.
 */
function openQuote(line: string, cursor: Cursor, quote: LinePosition): void {
  cursor.index = quote.index + 1;
  cursor.column = quote.column + 1;
  if (line[cursor.index] === ' ') {
    cursor.index++;
    cursor.column++;
  }
  cursor.base = cursor.column;
}

/**
 * Scans one line.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param lineNumber - Its number.
 */
function scanLine(state: ScanState, line: string, lineNumber: number): void {
  const { containers } = state;
  const cursor: Cursor = { base: 0, column: 0, index: 0 };
  const matchedCount = matchContainers(containers, line, cursor);
  const position = skipWhitespace(line, cursor);
  const rest: LineRest = { ...position, indent: position.column - cursor.base, text: line.slice(position.index) };

  if (matchedCount === containers.length) {
    scanMatchedLine(state, line, lineNumber, cursor, rest);
    return;
  }

  const isBlank = rest.text === '';
  const { isAfterBlankLine } = state;
  if (!isBlank && !isAfterBlankLine && isLazyLine(state, matchedCount, rest)) {
    continueLazily(state, line, lineNumber, rest);
    return;
  }

  // The list parser already ends a list on a blank line, after one, and on a block that interrupts. What it cannot see is
  // a line that leaves a blockquote for another reason, an indent or a `$$`.
  const isAfterListItem = containers[matchedCount]?.kind === 'item';
  if (!isBlank && !isAfterBlankLine && !isAfterListItem) {
    state.breakLines.set(lineNumber, containers.slice(0, matchedCount).filter((container) => container.kind === 'quote').length);
  }
  containers.length = matchedCount;
  state.leaf = undefined;
  state.isAfterBlankLine = isBlank;
  openBlocks(state, line, lineNumber, cursor, isAfterListItem);
}

/**
 * Scans a line that continues every open container.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param lineNumber - Its number.
 * @param cursor - Past the containers' prefixes.
 * @param rest - The text past them.
 */
function scanMatchedLine(state: ScanState, line: string, lineNumber: number, cursor: Cursor, rest: LineRest): void {
  const { leaf } = state;
  const { indent, text } = rest;
  const isBlank = text === '';
  if (leaf && isHidingLeaf(leaf) && leaf.kind !== 'indented') {
    takeHiddenLine(state, leaf, lineNumber, text, indent);
    // A blank line inside a block a blockquote holds leaves the next line free to continue it lazily.
    state.isAfterBlankLine = isBlank && state.containers.at(-1)?.kind !== 'quote';
    return;
  }
  state.isAfterBlankLine = isBlank;
  // A blank line inside an indented code block is left an ordinary blank line, since one that trails the block is not
  // part of it.
  if (leaf?.kind === 'indented' && (isBlank || indent >= INDENTED_CODE_COLUMNS)) {
    if (!isBlank) {
      state.contentLines.add(lineNumber);
    }
    return;
  }
  // A paragraph goes on through a line indented four or more columns, which starts no indented code block there.
  if (leaf?.kind === 'paragraph' && !isBlank && (indent >= INDENTED_CODE_COLUMNS || !isParagraphInterrupter(text))) {
    return;
  }
  openBlocks(state, line, lineNumber, cursor);
}

function skipWhitespace(line: string, start: LinePosition): LinePosition {
  let { column, index } = start;
  while (line[index] === ' ' || line[index] === '\t') {
    column = advanceColumn(column, line.charAt(index));
    index++;
  }
  return { column, index };
}

/**
 * Records a line of an open fenced code block, comment or math block, and closes the block when the line does.
 *
 * @param state - The scan.
 * @param leaf - The block.
 * @param lineNumber - The line's number.
 * @param text - The line's text past its containers and whitespace.
 * @param indent - The columns of that whitespace.
 */
function takeHiddenLine(state: ScanState, leaf: Leaf, lineNumber: number, text: string, indent: number): void {
  state.contentLines.add(lineNumber);
  if (!isLeafClosedBy(leaf, text, indent)) {
    return;
  }

  state.leaf = undefined;
  state.closerLines.add(lineNumber);
}
