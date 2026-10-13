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
 * - A list marker of the closed item's kind on a line that closes a list item starts the next item at any indent; a
 *   marker of another kind ends the list there.
 * - An indented code block inside a list item is measured from the column Obsidian strips the item's lines to, which is
 *   the least indent among them, and at most the marker's width (see {@link getBulletWidth}).
 * - Only a bullet or an ordered marker numbered 1 starts a list that interrupts a paragraph.
 */

import type { HtmlBlockKind } from './markdown-gap-blocks.ts';

import {
  BLANK_LINE_END_REGEX,
  canHtmlBlockInterrupt,
  findHtmlBlockKind,
  tokenizeDefinition,
  tokenizeTable
} from './markdown-gap-blocks.ts';
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
   * Lines that close a list item with a marker of another kind than the item's, indented too far to start an item, so
   * they end the item's list and start an indented code block rather than continuing the item lazily.
   */
  readonly listEndLines: ReadonlySet<number>;

  /**
   * Lines that open a fenced code block, a comment, a math block or an indented code block.
   */
  readonly openerLines: ReadonlySet<number>;
}

type ClosableLeaf = CommentLeaf | FencedLeaf | HtmlLeaf | MathLeaf;

interface CommentLeaf {
  readonly kind: 'comment';
}

type Container = ItemContainer | QuoteContainer;

interface Cursor {
  // The column the innermost matched container's content starts at, which the next container's prefix is measured from.
  base: number;
  // The visual column of `line[index]`.
  column: number;
  // The column an indented code block is measured from: the column Obsidian strips the innermost matched list item's
  // lines to, which can stand before its content, and `base` otherwise.
  indentBase: number;
  index: number;
}

interface DefinitionLeaf {
  // The definition's last line, which can be a later one than its first: its destination and its title may each follow a
  // line break.
  readonly endLine: number;
  readonly kind: 'definition';
}

interface FencedLeaf {
  readonly char: string;
  readonly kind: 'fence';
  readonly length: number;
}

interface HtmlLeaf {
  // The block's kind, whose `end` says which line closes it.
  readonly htmlKind: HtmlBlockKind;
  readonly kind: 'html';
}

interface ItemContainer {
  readonly kind: 'item';
  // The marker's bullet character, or its delimiter for an ordered marker; a marker of another kind starts another list.
  readonly markerKind: string;
  // How many columns past its container's content Obsidian strips the item's later lines to: the least indent of those
  // lines so far, and at most the width of its marker (see `getBulletWidth`).
  removalWidth: number;
  // How many columns past its container's content the item's own content starts.
  readonly width: number;
}

interface ItemMarker extends LinePosition {
  readonly marker: string;
}

type Leaf = ClosableLeaf | DefinitionLeaf | SimpleLeaf | TableLeaf;

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

interface MathLeaf {
  readonly kind: 'math';
  // The length of the opening `$` run, which a closing run must reach.
  readonly length: number;
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
  // Whether the line before the current one was blank, containers' prefixes included.
  isAfterEmptyLine: boolean;
  // Whether the current line is the note's last, with no line break after it.
  isOnLastLine: boolean;
  readonly itemLines: Set<number>;
  // The leaf block open in the innermost container, if any.
  leaf: Leaf | undefined;
  // The note's lines, which an opening list item reads ahead in.
  readonly lines: readonly string[];
  readonly listEndLines: Set<number>;
  readonly openerLines: Set<number>;
}

interface SimpleLeaf {
  readonly kind: 'heading' | 'indented' | 'paragraph';
}

interface TableLeaf {
  // Whether the header row starts with a `|`, which every later row must match.
  readonly hasLeadingPipe: boolean;
  readonly kind: 'table';
}

const TAB_WIDTH = 4;
const INDENTED_CODE_COLUMNS = 4;
const MAX_LIST_ITEM_CONTENT_GAP = 4;
// The ordered markers `remark-parse` 8 widens by a column are the ones numbered below this.
const ORDERED_WIDENING_LIMIT = 10;
// The bullet width is widened when its length is odd.
const PARITY_DIVISOR = 2;
const ITEM_REGEX = /^(?<marker>[-*+]|\d+[.)]) /;
const PARAGRAPH_INTERRUPTING_MARKER_REGEX = /^(?:[-*+]|1[.)])$/;
const FENCE_OPEN_REGEX = /^(?<fence>`{3,}|~{3,})(?<info>.*)$/;
const HEADING_REGEX = /^#{1,6}(?:[ \t]|$)/;
const THEMATIC_BREAK_REGEX = /^(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const COMMENT_MARK = '%%';
const MATH_MIN_LENGTH = 2;
// How many lines a link reference definition is looked for in: its label line, and the empty lines and the destination and
// title lines after it.
const DEFINITION_MAX_LINES = 16;
const CLOSABLE_LEAF_KINDS: ReadonlySet<Leaf['kind']> = new Set<Leaf['kind']>(['comment', 'fence', 'html', 'math']);

/**
 * Computes the widest indent Obsidian strips from a list item's later lines before it reads the item's blocks: the
 * width of the marker and the spaces after it, which are one to four spaces not followed by another, and otherwise one.
 * `remark-parse` 8, which Obsidian's metadata worker runs, widens an ordered marker below 10 with a `.` by one column
 * whenever the item's indent, marker and spaces together have an odd length, so `1. A` strips four columns where its
 * content starts at the third.
 *
 * @param indentLength - How many characters of indent stand before the marker inside the item's container.
 * @param marker - The marker, such as `-` or `1.`.
 * @param afterMarker - The line's text after the marker.
 * @returns The width, from the marker's column.
 */
export function getBulletWidth(indentLength: number, marker: string, afterMarker: string): number {
  const [spaces] = ensureNonNullable(/^ */.exec(afterMarker));
  const gapLength = spaces.length <= MAX_LIST_ITEM_CONTENT_GAP ? spaces.length : 1;
  const isWidened = marker.endsWith('.') && Number.parseInt(marker, 10) < ORDERED_WIDENING_LIMIT
    && (indentLength + marker.length + gapLength) % PARITY_DIVISOR === 1;
  return marker.length + gapLength + (isWidened ? 1 : 0);
}

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
    isAfterEmptyLine: false,
    isOnLastLine: false,
    itemLines: new Set(),
    leaf: undefined,
    lines,
    listEndLines: new Set(),
    openerLines: new Set()
  };
  for (let lineNumber = firstLine; lineNumber < lines.length; lineNumber++) {
    state.isOnLastLine = lineNumber === lines.length - 1;
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
  if (isClosableLeaf(leaf)) {
    takeHiddenLine(state, leaf, lineNumber, text, 0);
    return;
  }
  const mathLength = getMathOpenerLength(state, text);
  if (mathLength !== undefined) {
    openHidingLeaf(state, { kind: 'math', length: mathLength }, lineNumber);
    return;
  }
  // The container gathers the line before it reads its blocks, so an HTML block the line starts opens inside it, and
  // hides what follows: one of the first six kinds interrupts the paragraph above, and any kind starts a block after a
  // block that is not a paragraph.
  const htmlKind = findHtmlBlockKind(text);
  if (htmlKind && (htmlKind.canInterrupt || leaf?.kind !== 'paragraph')) {
    openHtmlLeaf(state, htmlKind, text, lineNumber);
    return;
  }
  if (text.startsWith('>') && state.containers.at(-1)?.kind === 'item') {
    state.containers.push({ isLazy: true, kind: 'quote' });
    const cursor: Cursor = { base: 0, column: 0, indentBase: 0, index: 0 };
    openQuote(line, cursor, rest);
    openBlocks(state, line, lineNumber, cursor);
    state.isAfterBlankLine = line.slice(cursor.index).trim() === '';
    return;
  }
  state.leaf = { kind: 'paragraph' };
}

function countQuotes(containers: readonly Container[]): number {
  return containers.filter((container) => container.kind === 'quote').length;
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
    if ((position.column - cursor.indentBase >= INDENTED_CODE_COLUMNS && !container.isLazy) || line[position.index] !== '>') {
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
  container.removalWidth = Math.min(container.removalWidth, position.column - cursor.base);
  const contentBase = cursor.base + container.width;
  const indentBase = cursor.base + container.removalWidth;
  while (cursor.column < contentBase) {
    cursor.column = advanceColumn(cursor.column, line.charAt(cursor.index));
    cursor.index++;
  }
  cursor.base = contentBase;
  cursor.indentBase = indentBase;
  return true;
}

/**
 * Checks whether a line is one of the open link reference definition's later lines, or a row of the open table, which
 * holds a `|` past its first character and starts with one exactly when the header does.
 *
 * @param leaf - The open leaf, if any.
 * @param row - The line past its containers.
 * @param lineNumber - The line's number.
 * @returns Whether the leaf takes the line.
 */
function doesDefinitionOrTableTakeLine(leaf: Leaf | undefined, row: string, lineNumber: number): boolean {
  return leaf?.kind === 'definition' ? lineNumber <= leaf.endLine : leaf?.kind === 'table' && row.includes('|', 1) && row.startsWith('|') === leaf.hasLeadingPipe;
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
 * Reads ahead over the lines a list item outside any blockquote gathers, for the least indent among them that Obsidian
 * strips the item's lines to. `remark-parse` 8 gathers an item's lines before it reads any block in them: a line indented
 * to the item's content, or more than four columns, belongs to it, and so does a lazy line, one not after a blank line
 * that starts no item and interrupts nothing. Only a line indented past the item's container counts.
 *
 * @param lines - The note's lines.
 * @param lineNumber - The item's line.
 * @param contentColumn - The visual column the item's content starts at.
 * @param baseColumn - The visual column the item's container content starts at.
 * @returns The least indent, or `Infinity` when no later line counts.
 */
function findLeastLaterIndent(lines: readonly string[], lineNumber: number, contentColumn: number, baseColumn: number): number {
  let leastIndent = Infinity;
  let isAfterBlankLine = false;
  for (let index = lineNumber + 1; index < lines.length; index++) {
    const line = ensureNonNullable(lines[index]);
    const { column, index: textIndex } = skipWhitespace(line, { column: 0, index: 0 });
    const text = line.slice(textIndex);
    if (text === '') {
      isAfterBlankLine = true;
      continue;
    }
    const isMember = column >= contentColumn || column - baseColumn > INDENTED_CODE_COLUMNS;
    if (!isMember && (isAfterBlankLine || isLazyInterrupter(text))) {
      break;
    }
    if (column > baseColumn) {
      leastIndent = Math.min(leastIndent, column);
    }
    isAfterBlankLine = false;
  }
  return leastIndent;
}

function getMarkerKind(marker: string): string {
  return ensureNonNullable(marker.at(-1));
}

/**
 * Reads the `$` run that opens a math block: at least two `$` at the start of a line's text, with no other `$` after
 * them on the line, since a math block closed on the line that opens it is part of a paragraph. Obsidian also wants a
 * line break after the run's line, so the note's last line opens none.
 *
 * @param state - The scan.
 * @param text - The line's text past its whitespace.
 * @returns The length of the run, or `undefined` when the line opens no math block.
 */
function getMathOpenerLength(state: ScanState, text: string): number | undefined {
  if (state.isOnLastLine) {
    return undefined;
  }
  let length = 0;
  while (text[length] === '$') {
    length++;
  }
  return length >= MATH_MIN_LENGTH && !text.slice(length).includes('$') ? length : undefined;
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
 * Checks whether a leaf hides the lines it holds until a line closes it, which an indented code block does not.
 *
 * @param leaf - The leaf, if any.
 * @returns Whether it is a fenced code block, a comment or a math block.
 */
function isClosableLeaf(leaf: Leaf | undefined): leaf is ClosableLeaf {
  return leaf !== undefined && CLOSABLE_LEAF_KINDS.has(leaf.kind);
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
  const isLeavingQuote = countQuotes(state.containers.slice(matchedCount)) > 0;
  return !(isLeavingQuote && (rest.indent >= INDENTED_CODE_COLUMNS || isMathOpener(state, rest.text) || canHtmlBlockInterrupt(rest.text)))
    && !isLazyInterrupter(rest.text);
}

/**
 * Checks whether a line closes the open fenced code block, comment or math block it is a line of.
 *
 * @param leaf - The open block.
 * @param text - The line's text past its containers.
 * @param indent - The columns of whitespace before it.
 * @returns Whether the block ends with this line.
 */
function isLeafClosedBy(leaf: ClosableLeaf, text: string, indent: number): boolean {
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
    case 'html': {
      // The last two kinds end before an empty line, which is no line of theirs; see `scanMatchedLine`.
      return leaf.htmlKind.end !== BLANK_LINE_END_REGEX && leaf.htmlKind.end.test(text);
    }
    default: {
      // Obsidian closes a math block on a line whose only `$` run is the one it ends with, trailing spaces aside, so
      // `$$ x $$` is a line of the block.
      const runEnd = text.replace(/ +$/, '').length;
      let runStart = runEnd;
      while (runStart > 0 && text[runStart - 1] === '$') {
        runStart--;
      }
      return runEnd - runStart >= leaf.length && text.indexOf('$') === runStart;
    }
  }
}

/**
 * Checks whether a line's text opens a `$$` math block.
 *
 * @param state - The scan.
 * @param text - The line's text past its whitespace.
 * @returns Whether it does.
 */
function isMathOpener(state: ScanState, text: string): boolean {
  return getMathOpenerLength(state, text) !== undefined;
}

/**
 * Checks whether the text past a line's containers starts a block that interrupts a paragraph in its own container.
 *
 * @param state - The scan.
 * @param text - The text past the line's whitespace.
 * @returns Whether it does.
 */
function isParagraphInterrupter(state: ScanState, text: string): boolean {
  // Only a bullet or an ordered marker numbered exactly 1 starts a list that interrupts a paragraph.
  const itemMarker = ITEM_REGEX.exec(text)?.groups?.['marker'];
  return itemMarker === undefined || THEMATIC_BREAK_REGEX.test(text)
    ? isLazyInterrupter(text) || text.startsWith('>') || isMathOpener(state, text) || canHtmlBlockInterrupt(text)
    : PARAGRAPH_INTERRUPTING_MARKER_REGEX.test(itemMarker);
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
 * @param closedItemKind - The kind of the list item's marker the line closed, if it closed one. Obsidian takes a marker
 * of that kind at any indent as the next item of the list, where it would otherwise start an indented code block; a
 * marker of another kind ends the list instead.
 */
function openBlocks(state: ScanState, line: string, lineNumber: number, cursor: Cursor, closedItemKind?: string): void {
  let isAfterQuote = false;
  let siblingItemKind = closedItemKind;
  for (;; siblingItemKind = undefined) {
    const position = skipWhitespace(line, cursor);
    const text = line.slice(position.index);
    if (text === '') {
      state.leaf = undefined;
      return;
    }
    const indentedMarker = ITEM_REGEX.exec(text)?.groups?.['marker'];
    const isSiblingItem = indentedMarker !== undefined && getMarkerKind(indentedMarker) === siblingItemKind;
    if (position.column - cursor.indentBase >= INDENTED_CODE_COLUMNS && !isSiblingItem) {
      if (indentedMarker !== undefined && siblingItemKind !== undefined) {
        state.listEndLines.add(lineNumber);
      }
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
    // `remark-parse` tries a thematic break before a list item, so `* * *` and `- - -` are breaks.
    const itemMatch = (isAfterQuote && line[cursor.index] === '\t') || THEMATIC_BREAK_REGEX.test(text) ? null : ITEM_REGEX.exec(text);
    if (!itemMatch) {
      openLeaf(state, line, text, lineNumber);
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
 * Opens an HTML block. One of the first five kinds hides the lines up to the one holding its end marker, which can be its
 * own first line, and one of the last two the lines up to the next empty one.
 *
 * @param state - The scan.
 * @param htmlKind - The block's kind.
 * @param text - The text past the line's containers and whitespace.
 * @param lineNumber - The line that opens it.
 */
function openHtmlLeaf(state: ScanState, htmlKind: HtmlBlockKind, text: string, lineNumber: number): void {
  if (htmlKind.end === BLANK_LINE_END_REGEX) {
    state.leaf = { htmlKind, kind: 'html' };
    state.openerLines.add(lineNumber);
    return;
  }
  if (htmlKind.end.test(text)) {
    state.leaf = { kind: 'heading' };
    state.openerLines.add(lineNumber);
    return;
  }
  openHidingLeaf(state, { htmlKind, kind: 'html' }, lineNumber);
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
  const bulletWidth = getBulletWidth(marker.index - cursor.index, marker.marker, line.slice(marker.index + marker.marker.length));
  let removalColumn = marker.column + bulletWidth;
  // Outside a blockquote every column is the line's own, so the item's later lines can be read ahead for their indent.
  if (countQuotes(state.containers) === 0) {
    removalColumn = Math.min(removalColumn, findLeastLaterIndent(state.lines, lineNumber, content.column, cursor.base));
  }
  state.containers.push({
    kind: 'item',
    markerKind: getMarkerKind(marker.marker),
    removalWidth: removalColumn - cursor.base,
    width: content.column - cursor.base
  });
  state.itemLines.add(lineNumber);
  state.leaf = undefined;
  cursor.index = content.index;
  cursor.column = content.column;
  cursor.base = content.column;
  cursor.indentBase = content.column;
}

/**
 * Opens the leaf a line's text starts.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param text - The text past the line's containers and whitespace.
 * @param lineNumber - The line's number.
 */
function openLeaf(state: ScanState, line: string, text: string, lineNumber: number): void {
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
  const mathLength = getMathOpenerLength(state, text);
  if (mathLength !== undefined) {
    openHidingLeaf(state, { kind: 'math', length: mathLength }, lineNumber);
    return;
  }
  if (HEADING_REGEX.test(text) || THEMATIC_BREAK_REGEX.test(text)) {
    state.leaf = { kind: 'heading' };
    return;
  }
  const htmlKind = findHtmlBlockKind(text);
  if (htmlKind) {
    openHtmlLeaf(state, htmlKind, text, lineNumber);
    return;
  }
  // A link reference definition and a table are read only where a block starts, never as an interruption, and only
  // outside every container, where the later lines' own text is the whole line. A definition hides the lines its
  // destination and title run onto, which could otherwise open a block.
  if (state.containers.length === 0 && text.startsWith('[')) {
    const definitionLines = state.lines.slice(lineNumber, lineNumber + DEFINITION_MAX_LINES);
    const definition = tokenizeDefinition(definitionLines.join('\n'));
    if (definition) {
      const lineCount = definitionLines.join('\n').slice(0, definition.length).split('\n').length;
      state.leaf = { endLine: lineNumber + lineCount - 1, kind: 'definition' };
      return;
    }
  }
  const nextLine = state.lines[lineNumber + 1];
  if (state.containers.length === 0 && nextLine !== undefined && tokenizeTable(`${line}\n${nextLine}`)) {
    state.leaf = { hasLeadingPipe: line.startsWith('|'), kind: 'table' };
    return;
  }
  state.leaf = { kind: 'paragraph' };
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
  cursor.indentBase = cursor.column;
}

/**
 * Records the indent of a lazy continuation line on the list items it continues without reaching their content, which
 * Obsidian counts when it decides how far to strip each item's lines. An item counts it only when the line is indented
 * past the item's container.
 *
 * @param containers - The containers the line does not continue, outermost first.
 * @param indent - The columns of whitespace before the line's text, past the containers it does continue.
 */
function recordLazyIndent(containers: readonly Container[], indent: number): void {
  let rest = indent;
  for (const container of containers) {
    if (container.kind === 'quote' || rest <= 0) {
      return;
    }
    container.removalWidth = Math.min(container.removalWidth, rest);
    rest -= container.width;
  }
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
  const wasAfterEmptyLine = state.isAfterEmptyLine;
  state.isAfterEmptyLine = line.trim() === '';
  const cursor: Cursor = { base: 0, column: 0, indentBase: 0, index: 0 };
  const matchedCount = matchContainers(containers, line, cursor);
  const position = skipWhitespace(line, cursor);
  const rest: LineRest = { ...position, indent: position.column - cursor.indentBase, text: line.slice(position.index) };

  if (matchedCount === containers.length) {
    scanMatchedLine(state, line, lineNumber, cursor, rest);
    return;
  }

  const isBlank = rest.text === '';
  const { isAfterBlankLine } = state;
  if (!isBlank && !isAfterBlankLine && isLazyLine(state, matchedCount, rest)) {
    recordLazyIndent(containers.slice(matchedCount), rest.column - cursor.base);
    continueLazily(state, line, lineNumber, rest);
    return;
  }

  // A blockquote opened lazily inside a list item ends on a line it cannot hold, a `$$` or a line after its own blank
  // `>` line among them, but the item gathers its lines before it reads its blocks, and holds such a line lazily unless
  // the line before it was empty.
  const lazyQuoteIndex = findLazyQuoteAfter(containers, matchedCount);
  if (lazyQuoteIndex !== -1 && !isBlank && !wasAfterEmptyLine && !isLazyInterrupter(rest.text)) {
    state.breakLines.set(lineNumber, countQuotes(containers.slice(0, lazyQuoteIndex)));
    containers.length = lazyQuoteIndex;
    state.leaf = undefined;
    continueLazily(state, line, lineNumber, rest);
    return;
  }

  // The list parser already ends a list on a blank line, after one, and on a block that interrupts. What it cannot see is
  // a line that leaves a blockquote for another reason, an indent or a `$$`.
  const closedContainer = containers[matchedCount];
  const isAfterListItem = closedContainer?.kind === 'item';
  if (!isBlank && !isAfterBlankLine && !isAfterListItem) {
    state.breakLines.set(lineNumber, countQuotes(containers.slice(0, matchedCount)));
  }
  containers.length = matchedCount;
  state.leaf = undefined;
  state.isAfterBlankLine = isBlank;
  openBlocks(state, line, lineNumber, cursor, isAfterListItem ? closedContainer.markerKind : undefined);
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
  // An HTML block of the last two kinds ends before an empty line, which is not one of its lines.
  if (leaf?.kind === 'html' && leaf.htmlKind.end === BLANK_LINE_END_REGEX && isBlank) {
    state.leaf = undefined;
    state.isAfterBlankLine = true;
    return;
  }
  if (isClosableLeaf(leaf)) {
    takeHiddenLine(state, leaf, lineNumber, text, indent);
    // A blank line inside a block a blockquote holds leaves the next line free to continue it lazily.
    state.isAfterBlankLine = isBlank && state.containers.at(-1)?.kind !== 'quote';
    return;
  }
  state.isAfterBlankLine = isBlank;
  if (doesDefinitionOrTableTakeLine(leaf, line.slice(cursor.index), lineNumber)) {
    return;
  }
  // A blank line inside an indented code block is left an ordinary blank line, since one that trails the block is not
  // part of it.
  if (leaf?.kind === 'indented' && (isBlank || indent >= INDENTED_CODE_COLUMNS)) {
    if (!isBlank) {
      state.contentLines.add(lineNumber);
    }
    return;
  }
  // A paragraph goes on through a line indented four or more columns, which starts no indented code block there.
  if (leaf?.kind === 'paragraph' && !isBlank && (indent >= INDENTED_CODE_COLUMNS || !isParagraphInterrupter(state, text))) {
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
function takeHiddenLine(state: ScanState, leaf: ClosableLeaf, lineNumber: number, text: string, indent: number): void {
  state.contentLines.add(lineNumber);
  if (!isLeafClosedBy(leaf, text, indent)) {
    return;
  }

  state.leaf = undefined;
  state.closerLines.add(lineNumber);
}
