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
 *   the blockquote. Either needs a line break after it in the text the list item around it gathers.
 * - A line indented four or more columns past a blockquote it does not continue is no lazy continuation: it ends the
 *   blockquote and starts an indented code block.
 * - A `>` line that lazily continues a list item opens a blockquote inside that item, which later `>` lines continue at
 *   any indent.
 * - A list marker of the closed item's kind on a line that closes a list item starts the next item at any indent; a
 *   marker of another kind ends the list there.
 * - An indented code block inside a list item is measured from the column Obsidian strips the item's lines to, which is
 *   the least indent among them, and at most the marker's width (see {@link getBulletWidth}).
 * - A whitespace-only line led by a tab continues a paragraph outside a list item.
 * - Only a bullet or an ordered marker numbered 1 starts a list that interrupts a paragraph.
 * - A line starting an ordered item not numbered 1 continues a blockquote lazily, and is read inside it as if it carried
 *   the quote's prefix.
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
   * Lines that start a list item, each with the index of every marker on it. A line can start several items, each
   * nested in the one before it: `- - x` is an item holding a nested item.
   */
  readonly itemMarkerIndexes: ReadonlyMap<number, readonly number[]>;

  /**
   * Lines that continue blockquote levels lazily, with no `>` of their own for those levels, and that are still read
   * inside them, each with the number of blockquote levels it sits in. Only a line that starts an ordered list item not
   * numbered 1 is one, since that item cannot interrupt the blockquote: `> - q\n2. y` is one blockquote holding both
   * items.
   */
  readonly lazyQuoteLines: ReadonlyMap<number, number>;

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
  readonly itemMarkerIndexes: Map<number, number[]>;
  readonly lazyQuoteLines: Map<number, number>;
  // The leaf block open in the innermost container, if any.
  leaf: Leaf | undefined;
  // The number of the line being scanned.
  lineNumber: number;
  // The note's lines, which an opening list item reads ahead in.
  readonly lines: readonly string[];
  readonly listEndLines: Set<number>;
  readonly openerLines: Set<number>;
  // The leaf a line opened where a block starts, which the next line can underline as a setext heading, and that line.
  setextText: SetextText | undefined;
}

/**
 * A leaf whose first line a setext underline on the next line can turn into a heading, and that line.
 */
interface SetextText {
  readonly leaf: Leaf;
  readonly lineNumber: number;
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
const ITEM_REGEX = /^(?<marker>[-*+]|\d+[.)])(?: |$)/;
const PARAGRAPH_INTERRUPTING_MARKER_REGEX = /^(?:[-*+]|1[.)])$/;
const FENCE_OPEN_REGEX = /^(?<fence>`{3,}|~{3,})(?<info>.*)$/;
const HEADING_REGEX = /^#{1,6}(?:[ \t]|$)/;
const THEMATIC_BREAK_REGEX = /^(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const SETEXT_UNDERLINE_REGEX = /^(?:=+|-+)$/;
const MARKER_LIKE_REGEX = /^(?:[-*+]|\d+[.)])(?=[^ \t])/;
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
 * Measures the marker-like run a line's text opens with when it starts no list item: a bullet, or a number with its
 * delimiter, followed by anything but whitespace, as in `-x`, `---` or `10.x`. `remark-parse` 8 counts that run into the
 * line's indent before it finds no whitespace after it, and then decides whether the line belongs to the list item above
 * by that indent, so `-\n\n-x` and `-\n---` are each one item, holding a paragraph and a thematic break.
 *
 * @param text - The line's text past its whitespace.
 * @returns The run's width, or `0` when the text opens with none.
 */
export function getMarkerLikeWidth(text: string): number {
  return MARKER_LIKE_REGEX.exec(text)?.[0].length ?? 0;
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
    itemMarkerIndexes: new Map(),
    lazyQuoteLines: new Map(),
    leaf: undefined,
    lineNumber: firstLine,
    lines,
    listEndLines: new Set(),
    openerLines: new Set(),
    setextText: undefined
  };
  for (let lineNumber = firstLine; lineNumber < lines.length; lineNumber++) {
    state.lineNumber = lineNumber;
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
  // A list item reads the lines it holds lazily as its own, so such a line can underline the line of text before it, and
  // one after a block that is not a paragraph starts a paragraph the next line can underline.
  // A list item strips the indent of the lines it holds lazily, and a blockquote keeps it.
  if ((rest.indent === 0 || state.containers.at(-1)?.kind === 'item') && isUnderline(state, lineNumber, text)) {
    state.leaf = { kind: 'heading' };
    return;
  }
  if (leaf?.kind === 'paragraph') {
    return;
  }
  openSetextTextLeaf(state, { kind: 'paragraph' }, lineNumber);
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
  const indent = position.column - cursor.base;
  if (indent + getMarkerLikeWidth(line.slice(position.index)) < container.width) {
    return false;
  }
  // Only a line indented past the item's container counts towards how far its lines are stripped.
  if (indent > 0) {
    container.removalWidth = Math.min(container.removalWidth, indent);
  }
  const contentBase = cursor.base + container.width;
  const indentBase = cursor.base + container.removalWidth;
  while (cursor.column < contentBase && cursor.index < position.index) {
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
 * Checks whether the open leaf takes a line that would otherwise start a block: a setext underline, which turns the
 * leaf into a heading, or a whitespace-only line holding a tab, which a paragraph takes (see
 * {@link doesParagraphTakeTabLine}). `remark-parse` 8 reads a setext heading before a paragraph and a list, so a line of
 * `-` under one line of text, at no indent, underlines it, where a lone `-` would otherwise open an empty list item.
 *
 * @param state - The scan; its leaf becomes a heading on an underline.
 * @param row - The line past its containers' prefixes.
 * @param lineNumber - The line's number.
 * @param rest - Where the line's text starts.
 * @returns Whether it does.
 */
function doesOpenLeafTakeLine(state: ScanState, row: string, lineNumber: number, rest: LineRest): boolean {
  if (rest.indent === 0 && isUnderline(state, lineNumber, rest.text)) {
    state.leaf = { kind: 'heading' };
    return true;
  }
  return doesParagraphTakeTabLine(state, row);
}

/**
 * Checks whether the open paragraph takes a whitespace-only line whose whitespace holds a tab after any spaces.
 * `remark-parse` 8 reads such a tab as four columns of indent and takes the line into the paragraph without looking
 * further. Inside a list item the strip has already changed what precedes the tab, so only a paragraph outside every
 * item is read that way here.
 *
 * @param state - The scan.
 * @param rest - The line past its containers' prefixes.
 * @returns Whether it does.
 */
function doesParagraphTakeTabLine(state: ScanState, rest: string): boolean {
  return state.leaf?.kind === 'paragraph' && /^ *\t[ \t]*$/.test(rest) && state.containers.every((container) => container.kind === 'quote');
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
 * Reads ahead over the lines a list item gathers, for the least indent among them that Obsidian strips the item's lines
 * to. `remark-parse` 8 gathers an item's lines before it reads any block in them: a line indented to the item's content,
 * or more than four columns, belongs to it, and so does a lazy line, one not after a blank line that starts no item and
 * interrupts nothing. Only a line indented past the item's container counts.
 *
 * Inside blockquotes the columns are the quote content's: a line carrying the quotes' prefixes is measured past them, and
 * a lazy line the quote holds without one is measured whole, as the quote's content holds it.
 *
 * @param state - The scan.
 * @param containers - The containers around the item: list items only, or blockquotes only.
 * @param contentColumn - The visual column the item's content starts at.
 * @param baseColumn - The visual column the item's container content starts at.
 * @returns The least indent, or `Infinity` when no later line counts.
 */
function findLeastLaterIndent(state: ScanState, containers: readonly Container[], contentColumn: number, baseColumn: number): number {
  const { lines } = state;
  const quotes = containers.filter((container) => container.kind === 'quote');
  // Inside blockquotes the item's container content starts where the innermost quote's does.
  const quoteBase = quotes.length === 0 ? 0 : baseColumn;
  let leastIndent = Infinity;
  let isAfterBlankLine = false;
  for (let index = state.lineNumber + 1; index < lines.length; index++) {
    const line = ensureNonNullable(lines[index]);
    const cursor: Cursor = { base: 0, column: 0, indentBase: 0, index: 0 };
    const isInQuotes = matchContainers(quotes.map((quote) => ({ ...quote })), line, cursor) === quotes.length;
    const position = skipWhitespace(line, isInQuotes ? cursor : { column: 0, index: 0 });
    const column = position.column - (isInQuotes ? cursor.base : 0) + quoteBase;
    const text = line.slice(position.index);
    if (text === '' || (!isInQuotes && isAfterBlankLine)) {
      if (!isInQuotes) {
        break;
      }
      isAfterBlankLine = true;
      continue;
    }
    const isMember = column + getMarkerLikeWidth(text) >= contentColumn || column - baseColumn > INDENTED_CODE_COLUMNS;
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
 * line break after the run's line in the text its container reads, so the note's last line opens none, and neither does
 * the last line a list item gathers (see {@link hasLineBreakInItem}).
 *
 * @param state - The scan.
 * @param text - The line's text past its whitespace.
 * @param containers - The containers that hold the line, outermost first.
 * @returns The length of the run, or `undefined` when the line opens no math block.
 */
function getMathOpenerLength(state: ScanState, text: string, containers: readonly Container[] = state.containers): number | undefined {
  if (state.lineNumber === state.lines.length - 1 || !hasLineBreakInItem(state, containers)) {
    return undefined;
  }
  let length = 0;
  while (text[length] === '$') {
    length++;
  }
  return length >= MATH_MIN_LENGTH && !text.slice(length).includes('$') ? length : undefined;
}

/**
 * Measures a line of whitespace once list items have stripped it. `remark-parse` 8 strips each item's later lines to the
 * item's removal width, taking whole characters, so a tab it takes only part of goes whole, and measures what is left
 * afresh, from a column of its own.
 *
 * @param line - The line of whitespace.
 * @param items - The list items around the line, outermost first.
 * @returns The visual width of what is left.
 */
function getStrippedWidth(line: string, items: readonly ItemContainer[]): number {
  let rest = line;
  for (const item of items) {
    let column = 0;
    let index = 0;
    while (index < rest.length && column < item.removalWidth) {
      column = advanceColumn(column, rest.charAt(index));
      index++;
    }
    rest = rest.slice(index);
  }
  return skipWhitespace(rest, { column: 0, index: 0 }).column;
}

/**
 * Checks whether the innermost list item holding the current line gathers a later line, so that the line ends with a
 * line break in the text the item reads. `remark-parse` 8 gathers an item's lines before it reads any block in them: a
 * line indented to the item's content belongs to it, whitespace-only or not, and so does a lazy line, one not after an
 * empty line that interrupts nothing. Empty lines belong to it only when a later line does, and a sibling item after
 * them leaves one empty line behind. Trailing empty lines are dropped.
 *
 * @param state - The scan.
 * @param containers - The containers that hold the current line, outermost first.
 * @returns Whether a line break follows the current line, or `true` when no list item holds it.
 */
function hasLineBreakInItem(state: ScanState, containers: readonly Container[]): boolean {
  let itemIndex = containers.length - 1;
  while (itemIndex >= 0 && containers[itemIndex]?.kind !== 'item') {
    itemIndex--;
  }
  const item = containers[itemIndex];
  if (item?.kind !== 'item') {
    return true;
  }
  const outerContainers = containers.slice(0, itemIndex);
  const outerItems = outerContainers.filter((container) => container.kind === 'item');
  let isAfterEmptyLine = false;
  for (let lineNumber = state.lineNumber + 1; lineNumber < state.lines.length; lineNumber++) {
    const line = ensureNonNullable(state.lines[lineNumber]);
    const cursor: Cursor = { base: 0, column: 0, indentBase: 0, index: 0 };
    const isInItemContainer = matchContainers(outerContainers.map((container) => ({ ...container })), line, cursor) === itemIndex;
    const position = skipWhitespace(line, cursor);
    const text = line.slice(position.index);
    if (text === '') {
      // A line of whitespace continues no blockquote, and each list item around this one strips it as Obsidian strips
      // every later line of an item, a tab the strip takes only part of included.
      if (outerItems.length === itemIndex && getStrippedWidth(line, outerItems) >= item.width) {
        return true;
      }
      isAfterEmptyLine = true;
      continue;
    }
    if (isInItemContainer && position.column - cursor.base >= item.width) {
      return true;
    }
    const marker = ITEM_REGEX.exec(text)?.groups?.['marker'];
    // A sibling item leaves one empty line behind it; any other line belongs to the item only lazily.
    return isInItemContainer && marker !== undefined && !THEMATIC_BREAK_REGEX.test(text)
      ? isAfterEmptyLine && getMarkerKind(marker) === item.markerKind
      : !isAfterEmptyLine && !isLazyInterrupter(text);
  }
  return false;
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
  const quoteIndex = state.containers.findIndex((container, index) => index >= matchedCount && container.kind === 'quote');
  const isLeavingQuote = quoteIndex !== -1;
  // A `$$` is read as a math opener in the text of the containers around the blockquote it would end.
  const isLeavingMathOpener = isLeavingQuote && getMathOpenerLength(state, rest.text, state.containers.slice(0, quoteIndex)) !== undefined;
  return !(isLeavingQuote
    && (rest.indent >= INDENTED_CODE_COLUMNS || isLeavingMathOpener || canHtmlBlockInterrupt(rest.text)
      || isUnderlinedBy(state, state.containers.slice(0, quoteIndex))))
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
 * Checks whether a line's text is a setext underline of the line before it: a run of `-` or of `=` and nothing else,
 * under the one line of text a paragraph, a link reference definition or a table opened where a block starts.
 *
 * @param state - The scan.
 * @param lineNumber - The line's number.
 * @param text - The line's text past its containers and whitespace.
 * @returns Whether it is one.
 */
function isUnderline(state: ScanState, lineNumber: number, text: string): boolean {
  const { leaf, setextText } = state;
  return leaf !== undefined && setextText?.leaf === leaf && setextText.lineNumber === lineNumber - 1 && SETEXT_UNDERLINE_REGEX.test(text);
}

/**
 * Checks whether the line after the current one is a setext underline in the containers given, at no indent past them.
 * `remark-parse` 8 tries a setext heading on the text after a blockquote's line before taking the line lazily, so a line
 * followed by one of `-` or `=` ends the blockquote and becomes a heading: `> a\nb\n-` is a blockquote and the heading
 * `b`, where a lone `-` would otherwise open an empty list item.
 *
 * @param state - The scan.
 * @param containers - The containers the underline has to continue.
 * @returns Whether it is one.
 */
function isUnderlinedBy(state: ScanState, containers: readonly Container[]): boolean {
  const nextLine = state.lines[state.lineNumber + 1];
  if (nextLine === undefined) {
    return false;
  }
  const cursor: Cursor = { base: 0, column: 0, indentBase: 0, index: 0 };
  return matchContainers(containers.map((container) => ({ ...container })), nextLine, cursor) === containers.length
    && SETEXT_UNDERLINE_REGEX.test(nextLine.slice(cursor.index));
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
 * Continues the blockquotes a line leaves lazily when the line starts an ordered list item not numbered 1, which cannot
 * interrupt a blockquote, and matches the containers inside them against the line as if the quotes' prefixes were
 * there with no width. `remark-parse` 8, which Obsidian's metadata worker runs, takes such a line into the blockquote
 * and reads it there with the rest of the quote's content, so `> - q\n2. y` is one blockquote holding two lists,
 * `> text\n9. C` one holding a paragraph, and `> - q\n  2. y` one holding an item whose paragraph runs on.
 *
 * @param state - The scan.
 * @param line - The line.
 * @param cursor - Past the containers the line continues; moved past the ones it continues lazily.
 * @param matchedCount - How many containers the line continues.
 * @returns How many containers the line continues, the lazily continued ones included.
 */
function matchLazyQuotes(state: ScanState, line: string, cursor: Cursor, matchedCount: number): number {
  const { containers } = state;
  let quoteEnd = matchedCount;
  while (containers[quoteEnd]?.kind === 'quote') {
    quoteEnd++;
  }
  if (quoteEnd === matchedCount) {
    return matchedCount;
  }
  const position = skipWhitespace(line, cursor);
  const text = line.slice(position.index);
  const marker = ITEM_REGEX.exec(text)?.groups?.['marker'];
  if (
    marker === undefined
    || PARAGRAPH_INTERRUPTING_MARKER_REGEX.test(marker)
    || THEMATIC_BREAK_REGEX.test(text)
    || position.column - cursor.indentBase >= INDENTED_CODE_COLUMNS
  ) {
    return matchedCount;
  }
  state.lazyQuoteLines.set(state.lineNumber, countQuotes(containers.slice(0, quoteEnd)));
  return quoteEnd + matchContainers(containers.slice(quoteEnd), line, cursor);
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
  // past it. Obsidian applies that to an item with nothing after its marker too, while a marker that ends its line has
  // its content right past it.
  const markerEnd = marker.index + marker.marker.length;
  let content: LinePosition = markerEnd === line.length
    ? { column: markerEndColumn, index: markerEnd }
    : { column: markerEndColumn + 1, index: markerEnd + 1 };
  const gap = skipWhitespace(line, content);
  if (gap.column - markerEndColumn <= MAX_LIST_ITEM_CONTENT_GAP) {
    content = gap;
  }
  const bulletWidth = getBulletWidth(marker.index - cursor.index, marker.marker, line.slice(marker.index + marker.marker.length));
  let removalColumn = marker.column + bulletWidth;
  // The item's later lines are read ahead for their indent when nothing but blockquotes stands around it, whose prefixes
  // the read-ahead strips. Behind a list item, those prefixes sit past an indent the read-ahead would have to strip too.
  const { containers } = state;
  const quoteCount = countQuotes(containers);
  if (quoteCount === 0 || quoteCount === containers.length) {
    removalColumn = Math.min(removalColumn, findLeastLaterIndent(state, containers, content.column, cursor.base));
  }
  state.containers.push({
    kind: 'item',
    markerKind: getMarkerKind(marker.marker),
    removalWidth: removalColumn - cursor.base,
    width: content.column - cursor.base
  });
  let markerIndexes = state.itemMarkerIndexes.get(lineNumber);
  if (!markerIndexes) {
    markerIndexes = [];
    state.itemMarkerIndexes.set(lineNumber, markerIndexes);
  }
  markerIndexes.push(marker.index);
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
  // `remark-parse` 8 tries a setext heading before an HTML block, so `<div>\n-` is a heading.
  if (htmlKind && !isUnderlinedBy(state, state.containers)) {
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
      openSetextTextLeaf(state, { endLine: lineNumber + lineCount - 1, kind: 'definition' }, lineNumber);
      return;
    }
  }
  const nextLine = state.lines[lineNumber + 1];
  if (state.containers.length === 0 && nextLine !== undefined && tokenizeTable(`${line}\n${nextLine}`)) {
    openSetextTextLeaf(state, { hasLeadingPipe: line.startsWith('|'), kind: 'table' }, lineNumber);
    return;
  }
  openSetextTextLeaf(state, { kind: 'paragraph' }, lineNumber);
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
 * Opens a leaf whose first line a setext underline on the next line can turn into a heading: a paragraph, a link
 * reference definition or a table, which `remark-parse` 8 tries only after a setext heading.
 *
 * @param state - The scan.
 * @param leaf - The leaf.
 * @param lineNumber - The line that opens it.
 */
function openSetextTextLeaf(state: ScanState, leaf: Leaf, lineNumber: number): void {
  state.leaf = leaf;
  state.setextText = { leaf, lineNumber };
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
  const matchedCount = matchLazyQuotes(state, line, cursor, matchContainers(containers, line, cursor));
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
  if (doesOpenLeafTakeLine(state, line.slice(cursor.index), lineNumber, rest)) {
    state.isAfterBlankLine = false;
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

  // The text after a comment's closing `%%` starts a paragraph, which a later line can only continue or interrupt.
  state.leaf = leaf.kind === 'comment' && text.slice(text.indexOf(COMMENT_MARK) + COMMENT_MARK.length).trim() !== '' ? { kind: 'paragraph' } : undefined;
  state.closerLines.add(lineNumber);
}
