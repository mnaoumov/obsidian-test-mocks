/**
 * @file
 *
 * The top-level blocks of the text between two sections the parser has already found, read the way Obsidian's metadata
 * worker reads them. That worker is `remark-parse` 8 with `commonmark` and `gfm` on, plus block tokenizers of
 * Obsidian's own - a `%%` comment, a `$$` math block, a footnote definition and a standalone block id - so each tokenizer
 * below is a port of one of those, quirks and all:
 *
 * - A block's position starts at its line start, its indent included, and ends at the end of its last line, trailing
 *   whitespace included. An unclosed fenced code block, comment, math block or HTML block of the first five kinds runs to
 *   the end of the text, its final line break included.
 * - A line is an indented code block when it starts with a tab or with four spaces. A tab after a space indents nothing,
 *   so ` \tx` is a paragraph.
 * - A paragraph is interrupted by a thematic break, an ATX heading, a fence, a comment, a math block, a blockquote and
 *   the first six kinds of HTML block, but never by a line indented four or more columns.
 * - A blockquote takes every `>` line and every lazy line after it, until a blank line, or a line that starts an indented
 *   code block, a fence, a comment, a math block, an ATX or setext heading, a thematic break or an HTML block of the first
 *   six kinds.
 * - A comment ends just past its closing `%%`, wherever on the line that is, and the rest of the line starts a paragraph.
 * - A table row needs a `|` past its first character, and keeps the header's choice of a leading `|`.
 * - A link reference definition, a footnote definition or a standalone block id interrupts no paragraph.
 *
 * List items are not read here.
 */

import { ensureNonNullable } from './type-guards.ts';

/**
 * A block found in the text.
 */
export interface GapBlock {
  /**
   * The id of a standalone block id, which is no section of its own.
   */
  readonly blockId?: string;

  /**
   * The offset just past the block, relative to the text.
   */
  readonly end: number;

  /**
   * The heading's level and text, when the block is a heading.
   */
  readonly heading?: GapHeading;

  /**
   * The offset the block starts at, relative to the text.
   */
  readonly start: number;

  /**
   * The section type Obsidian reports for the block.
   */
  readonly type: string;
}

/**
 * A heading found in the text.
 */
export interface GapHeading {
  /**
   * The heading level, from `1` to `6`.
   */
  readonly level: number;

  /**
   * The heading text, without its markers.
   */
  readonly text: string;
}

/**
 * A block read at the start of a text.
 */
export interface GapToken {
  /**
   * The id of a standalone block id.
   */
  readonly blockId?: string;

  /**
   * The heading's level and text, when the block is a heading.
   */
  readonly heading?: GapHeading;

  /**
   * How much of the text the block takes.
   */
  readonly length: number;

  /**
   * The section type Obsidian reports for the block.
   */
  readonly type: string;
}

/**
 * A line's leading whitespace as a footnote definition measures it.
 */
interface LineIndent {
  // The columns counted, which stop growing once they pass four.
  readonly column: number;
  // The offset the line's content starts at.
  readonly contentStart: number;
}

type Token = GapToken;

type Tokenizer = (text: string) => Token | undefined;

const ATX_HEADING_MAX_LEVEL = 6;
const FENCE_MIN_LENGTH = 3;
const INDENTED_CODE_COLUMNS = 4;
const MATH_MIN_LENGTH = 2;
const SETEXT_DASHES_LEVEL = 2;
const SETEXT_EQUALS_LEVEL = 1;
const SETEXT_MAX_INDENT = 3;
const THEMATIC_BREAK_MIN_MARKERS = 3;

const COMMENT_MARK = '%%';

// `remark-parse`'s list of HTML block names, which Obsidian's copy carries unchanged.
const HTML_BLOCK_NAMES = [
  'address',
  'article',
  'aside',
  'base',
  'basefont',
  'blockquote',
  'body',
  'caption',
  'center',
  'col',
  'colgroup',
  'dd',
  'details',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'iframe',
  'legend',
  'li',
  'link',
  'main',
  'menu',
  'menuitem',
  'meta',
  'nav',
  'noframes',
  'ol',
  'optgroup',
  'option',
  'p',
  'param',
  'pre',
  'section',
  'source',
  'title',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'track',
  'ul'
];

const HTML_OPEN_TAG = String.raw`<[A-Za-z][A-Za-z0-9\-]*(?:\s+[a-zA-Z_:][a-zA-Z0-9:._-]*(?:\s*=\s*(?:[^"'=<>\u0060\u0000-\u0020]+|'[^']*'|"[^"]*"))?)*\s*\/?>`;
const HTML_CLOSE_TAG = String.raw`<\/[A-Za-z][A-Za-z0-9\-]*\s*>`;
/**
 * What a line ending an HTML block of the last two kinds holds: nothing, since such a block ends before an empty line.
 */
export const BLANK_LINE_END_REGEX = /^$/;

/**
 * One of the seven kinds of HTML block CommonMark defines.
 */
export interface HtmlBlockKind {
  /**
   * Whether the kind may interrupt a paragraph or a blockquote.
   */
  readonly canInterrupt: boolean;

  /**
   * What a line ending the block holds; an empty line for the last two kinds, which end before it.
   */
  readonly end: RegExp;

  /**
   * What the block's first line starts with.
   */
  readonly start: RegExp;
}

const HTML_BLOCK_KINDS: readonly HtmlBlockKind[] = [
  { canInterrupt: true, end: /<\/(?:script|pre|style)>/i, start: /^<(?:script|pre|style)(?=\s|>|$)/i },
  { canInterrupt: true, end: /-->/, start: /^<!--/ },
  { canInterrupt: true, end: /\?>/, start: /^<\?/ },
  { canInterrupt: true, end: />/, start: /^<![A-Za-z]/ },
  { canInterrupt: true, end: /\]\]>/, start: /^<!\[CDATA\[/ },
  { canInterrupt: true, end: BLANK_LINE_END_REGEX, start: new RegExp(String.raw`^</?(?:${HTML_BLOCK_NAMES.join('|')})(?=\s|/?>|$)`, 'i') },
  { canInterrupt: false, end: BLANK_LINE_END_REGEX, start: new RegExp(String.raw`^(?:${HTML_OPEN_TAG}|${HTML_CLOSE_TAG})\s*$`) }
];

const BLANK_LINE_REGEX = /^[ \t]*(?:\n|$)/;
const BLOCK_ID_LINE_REGEX = /^\^(?<id>[a-zA-Z0-9-]+)/;
const NOT_FOUND = -1;
const ESCAPE_LENGTH = 2;
const LABEL_CLOSER = ']:';
const FOOTNOTE_LABEL_OPENER = '[^';
// The length of <>, an empty destination in angle brackets.
const EMPTY_ANGLE_DESTINATION_LENGTH = 2;
const DEFINITION_TITLE_CLOSERS = new Map([['"', '"'], ['(', ')'], ['\'', '\'']]);

/**
 * The type of the token a standalone block id is read as. Obsidian reports no section for it: the parser gives its id to
 * the section before it and drops it.
 */
export const BLOCK_ID_TYPE = 'blockId';

/**
 * Checks whether a text starts an HTML block of a kind that may interrupt a paragraph or a blockquote: one of the first
 * six.
 *
 * @param text - The text, from the line start.
 * @returns Whether it does.
 */
export function canHtmlBlockInterrupt(text: string): boolean {
  return findHtmlBlockKind(text)?.canInterrupt === true;
}

/**
 * Finds the kind of HTML block a text starts with, if any, by its first line.
 *
 * @param text - The text, from the line start.
 * @returns The kind.
 */
export function findHtmlBlockKind(text: string): HtmlBlockKind | undefined {
  const tagStart = skipSpacesAndTabs(text, 0);
  if (text[tagStart] !== '<') {
    return undefined;
  }
  const firstLine = text.slice(tagStart, findLineEnd(text, tagStart + 1));
  return HTML_BLOCK_KINDS.find((kind) => kind.start.test(firstLine));
}

/**
 * Reads the top-level blocks of a text that holds no list item the parser has already found.
 *
 * @param text - The text.
 * @param isAtNoteEnd - Whether the text runs to the end of the note, which a standalone block id can need.
 * @returns The blocks, in order, with positions relative to the text.
 */
export function scanGapBlocks(text: string, isAtNoteEnd: boolean): GapBlock[] {
  const blocks: GapBlock[] = [];
  let index = 0;
  while (index < text.length) {
    const rest = text.slice(index);
    const blankLength = measureBlankLines(rest);
    if (blankLength > 0) {
      index += blankLength;
      continue;
    }
    const token = tokenizeBlock(rest, isAtNoteEnd);
    blocks.push({
      ...token.blockId !== undefined && { blockId: token.blockId },
      end: index + token.length,
      ...token.heading !== undefined && { heading: token.heading },
      start: index,
      type: token.type
    });
    index += token.length;
  }
  return blocks;
}

/**
 * Reads an ATX heading at the start of a text: a run of one to six `#`, then whitespace or the end of the line.
 *
 * @param text - The text, from the heading's line start.
 * @returns The heading, if the text starts with one.
 */
export function tokenizeAtxHeading(text: string): GapToken | undefined {
  let index = skipSpacesAndTabs(text, 0);
  const hashesStart = index;
  while (text[index] === '#') {
    index++;
  }
  const level = index - hashesStart;
  if (level === 0 || level > ATX_HEADING_MAX_LEVEL) {
    return undefined;
  }
  const textStart = skipSpacesAndTabs(text, index);
  if (textStart === index && index < text.length && text[index] !== '\n') {
    return undefined;
  }
  index = textStart;
  let headingText = '';
  let pending = '';
  while (index < text.length && text[index] !== '\n') {
    const char = text.charAt(index);
    if (char !== ' ' && char !== '\t' && char !== '#') {
      headingText += pending + char;
      pending = '';
      index++;
      continue;
    }
    const whitespaceStart = index;
    index = skipSpacesAndTabs(text, index);
    pending += text.slice(whitespaceStart, index);
    if (headingText === '' || pending !== '' || text[index] !== '#') {
      const closingStart = index;
      while (text[index] === '#') {
        index++;
      }
      index = skipSpacesAndTabs(text, index);
      pending += text.slice(closingStart, index);
    } else {
      headingText += '#';
      index++;
    }
  }
  return { heading: { level, text: headingText }, length: index, type: 'heading' };
}

/**
 * Reads a link reference definition, a port of `remark-parse` 8's: a label in brackets and a `:`, a destination after
 * any whitespace, line breaks included, an optional title after more of it, and nothing else on the last line. A title
 * that opens and never closes, or holds an empty line, spoils the whole definition rather than being left out.
 *
 * @param text - The text, from the definition's line start.
 * @returns The definition, if the text starts with one.
 */
export function tokenizeDefinition(text: string): Token | undefined {
  const labelEnd = readDefinitionLabel(text);
  const destinationEnd = labelEnd === NOT_FOUND ? NOT_FOUND : readDefinitionDestination(text, skipWhitespaceAndLineBreaks(text, labelEnd));
  const titleEnd = destinationEnd === NOT_FOUND ? NOT_FOUND : readDefinitionTitle(text, destinationEnd);
  if (titleEnd === NOT_FOUND) {
    return undefined;
  }
  const end = skipSpacesAndTabs(text, titleEnd);
  return end === text.length || text[end] === '\n' ? { length: end, type: 'definition' } : undefined;
}

/**
 * Reads a table: a header row, a delimiter row and the rows after it. Every row holds a `|` past its first character,
 * and starts with a `|` exactly when the header does.
 *
 * @param text - The text, from the table's line start.
 * @returns The table, if the text starts with one.
 */
export function tokenizeTable(text: string): Token | undefined {
  const rows: string[] = [];
  let end = 0;
  let lineStart = 0;
  let hasLeadingPipe = false;
  while (lineStart <= text.length) {
    const lineEnd = findLineEnd(text, lineStart);
    const pipeIndex = text.indexOf('|', lineStart + 1);
    if (pipeIndex === -1 || pipeIndex > lineEnd) {
      break;
    }
    const row = text.slice(lineStart, lineEnd);
    if (rows.length === 0) {
      hasLeadingPipe = row.startsWith('|');
    } else if (row.startsWith('|') !== hasLeadingPipe) {
      break;
    }
    rows.push(row);
    end = lineEnd;
    lineStart = lineEnd + 1;
  }
  // A header and a delimiter row are the least a table holds.
  const delimiterRow = rows[1];
  return delimiterRow === undefined || !isTableDelimiterRow(delimiterRow) ? undefined : { length: end, type: 'table' };
}

function findLineEnd(text: string, from: number): number {
  const lineEnd = text.indexOf('\n', from);
  return lineEnd === -1 ? text.length : lineEnd;
}

function isBlockquoteInterrupted(text: string): boolean {
  return [
    tokenizeIndentedCode,
    tokenizeFencedCode,
    tokenizeComment,
    tokenizeMath,
    tokenizeAtxHeading,
    tokenizeSetextHeading,
    tokenizeThematicBreak
  ].some((tokenizer) => tokenizer(text) !== undefined) || canHtmlBlockInterrupt(text);
}

/**
 * Checks whether a line starts a block that ends a footnote definition: every block Obsidian's worker knew when the
 * footnote tokenizer was installed, other than a paragraph, an indented code block and an empty line. The comment and the
 * standalone block id came later, so they do not end one. Neither does a list item here: only a bullet or an item
 * numbered 1 ends one, and the list parser has already taken each such line out of the text, as an item.
 *
 * @param text - The text, from the line's first character past its indent.
 * @returns Whether it does.
 */
function isFootnoteDefinitionInterrupted(text: string): boolean {
  return [
    tokenizeMath,
    tokenizeFencedCode,
    tokenizeBlockquoteStart,
    tokenizeAtxHeading,
    tokenizeThematicBreak,
    tokenizeSetextHeading,
    tokenizeFootnoteDefinition,
    tokenizeDefinition,
    tokenizeTable
  ].some((tokenizer) => tokenizer(text) !== undefined) || canHtmlBlockInterrupt(text);
}

function isParagraphInterrupted(text: string): boolean {
  return [
    tokenizeThematicBreak,
    tokenizeAtxHeading,
    tokenizeFencedCode,
    tokenizeComment,
    tokenizeMath,
    tokenizeBlockquoteStart
  ].some((tokenizer) => tokenizer(text) !== undefined) || canHtmlBlockInterrupt(text);
}

/**
 * Checks whether a row is a table's delimiter row: cells of `-` and `:` separated by `|`, with at least one cell and no
 * two `|` in a row.
 *
 * @param row - The row.
 * @returns Whether it is one.
 */
function isTableDelimiterRow(row: string): boolean {
  let cellCount = 0;
  let isCellOpen = false;
  let hasSeenPipe = false;
  for (const char of row) {
    if (char === '|') {
      if (isCellOpen) {
        cellCount++;
        isCellOpen = false;
      } else if (hasSeenPipe) {
        return false;
      }
      hasSeenPipe = true;
    } else if (char === ':' || char === '-') {
      isCellOpen = true;
    } else if (!/\s/.test(char)) {
      return false;
    }
  }
  return cellCount + (isCellOpen ? 1 : 0) > 0;
}

function measureBlankLines(text: string): number {
  let length = 0;
  for (;;) {
    const match = BLANK_LINE_REGEX.exec(text.slice(length));
    if (!match || match[0] === '') {
      return length;
    }
    length += match[0].length;
  }
}

/**
 * Measures a later line of a footnote definition the way the worker does: its leading whitespace, counted in columns
 * until it is wider than four, where the worker stops counting and takes the rest of the line as content.
 *
 * @param text - The text.
 * @param lineStart - Where the line starts.
 * @param lineEnd - Where it ends.
 * @returns The columns counted and the offset the line's content starts at.
 */
function measureFootnoteLineIndent(text: string, lineStart: number, lineEnd: number): LineIndent {
  let column = 0;
  let contentStart = lineStart;
  while (contentStart < lineEnd && [' ', '\t'].includes(text.charAt(contentStart)) && column <= INDENTED_CODE_COLUMNS) {
    column += text[contentStart] === ' ' ? 1 : INDENTED_CODE_COLUMNS - (column % INDENTED_CODE_COLUMNS);
    contentStart++;
  }
  return { column, contentStart };
}

/**
 * Reads a definition's destination: one in angle brackets, which may hold whitespace but no bracket, or a run of
 * characters that are neither whitespace nor a bracket. An empty pair of angle brackets is followed by such a run.
 *
 * @param text - The text.
 * @param start - Where the destination starts.
 * @returns The offset past it, or {@link NOT_FOUND}.
 */
function readDefinitionDestination(text: string, start: number): number {
  let index = start;
  if (text[index] === '<') {
    index++;
    while (index < text.length && !'>[]'.includes(text.charAt(index))) {
      index++;
    }
    if (text[index] !== '>') {
      return NOT_FOUND;
    }
    index++;
    if (index - start > EMPTY_ANGLE_DESTINATION_LENGTH) {
      return index;
    }
  }
  const runStart = index;
  while (index < text.length && !/[[\]\s]/.test(text.charAt(index))) {
    index++;
  }
  return index === runStart ? NOT_FOUND : index;
}

/**
 * Reads a definition's label: a `[`, a non-empty label in which a `\` escapes the character after it, and `]:`.
 *
 * @param text - The text, from the definition's line start.
 * @returns The offset past the `:`, or {@link NOT_FOUND}.
 */
function readDefinitionLabel(text: string): number {
  let index = skipSpacesAndTabs(text, 0);
  if (text[index] !== '[' || text[index + 1] === '^') {
    return NOT_FOUND;
  }
  index++;
  const labelStart = index;
  while (index < text.length && text[index] !== ']') {
    index += text[index] === '\\' ? ESCAPE_LENGTH : 1;
  }
  return index === labelStart || text[index] !== ']' || text[index + 1] !== ':' ? NOT_FOUND : index + LABEL_CLOSER.length;
}

/**
 * Reads a definition's optional title: after whitespace, line breaks included, a run in double quotes, single quotes or
 * parentheses. An opened title that never closes, or holds an empty line, spoils the definition.
 *
 * @param text - The text.
 * @param destinationEnd - Where the destination ends.
 * @returns The offset past the title, `destinationEnd` when there is none, or {@link NOT_FOUND}.
 */
function readDefinitionTitle(text: string, destinationEnd: number): number {
  let index = skipWhitespaceAndLineBreaks(text, destinationEnd);
  const titleCloser = DEFINITION_TITLE_CLOSERS.get(text.charAt(index));
  if (titleCloser === undefined) {
    return destinationEnd;
  }
  if (index === destinationEnd) {
    return NOT_FOUND;
  }
  index++;
  while (index < text.length && text[index] !== titleCloser) {
    if (text[index] === '\n') {
      index++;
      if (text[index] === '\n' || text[index] === titleCloser) {
        return NOT_FOUND;
      }
    }
    index++;
  }
  return text[index] === titleCloser ? index + 1 : NOT_FOUND;
}

/**
 * Reads a footnote definition's label: `[^`, a non-empty label holding no space, tab or line break, and `]:`.
 *
 * @param text - The text, from the definition's line start.
 * @returns The offset past the `:`, or {@link NOT_FOUND}.
 */
function readFootnoteLabel(text: string): number {
  let index = skipSpacesAndTabs(text, 0);
  if (!text.startsWith(FOOTNOTE_LABEL_OPENER, index)) {
    return NOT_FOUND;
  }
  index += FOOTNOTE_LABEL_OPENER.length;
  const labelStart = index;
  while (index < text.length && text[index] !== ']') {
    if ([' ', '\t', '\n'].includes(text.charAt(index))) {
      return NOT_FOUND;
    }
    index++;
  }
  return index === labelStart || !text.startsWith(LABEL_CLOSER, index) ? NOT_FOUND : index + LABEL_CLOSER.length;
}

function skipSpaces(text: string, from: number): number {
  let index = from;
  while (text[index] === ' ') {
    index++;
  }
  return index;
}

function skipSpacesAndTabs(text: string, from: number): number {
  let index = from;
  while (text[index] === ' ' || text[index] === '\t') {
    index++;
  }
  return index;
}

function skipWhitespaceAndLineBreaks(text: string, from: number): number {
  let index = from;
  while ([' ', '\t', '\n'].includes(text.charAt(index))) {
    index++;
  }
  return index;
}

function tokenizeBlock(text: string, isAtNoteEnd: boolean): Token {
  const tokenizers: Tokenizer[] = [
    tokenizeIndentedCode,
    tokenizeMath,
    tokenizeComment,
    tokenizeFencedCode,
    tokenizeBlockquote,
    tokenizeAtxHeading,
    tokenizeThematicBreak,
    tokenizeSetextHeading,
    tokenizeHtml,
    tokenizeFootnoteDefinition,
    tokenizeDefinition,
    tokenizeTable,
    (blockText): Token | undefined => tokenizeBlockId(blockText, isAtNoteEnd)
  ];
  for (const tokenizer of tokenizers) {
    const token = tokenizer(text);
    if (token) {
      return token;
    }
  }
  return tokenizeParagraph(text);
}

/**
 * Reads a standalone block id: `^` and an id of letters, digits and `-` alone on its line, followed by the end of the
 * note, a line break and the end of the note, or an empty line. Obsidian gives the id to the block before it and reports
 * no section for the id itself.
 *
 * @param text - The text, from the id's line start.
 * @param isAtNoteEnd - Whether the text runs to the end of the note, rather than stopping before a later section.
 * @returns The block id, if the text starts with one.
 */
function tokenizeBlockId(text: string, isAtNoteEnd: boolean): Token | undefined {
  const match = BLOCK_ID_LINE_REGEX.exec(text);
  if (!match) {
    return undefined;
  }
  const after = text.slice(match[0].length);
  const isFollowedByEnd = isAtNoteEnd && (after === '' || after === '\n');
  return !isFollowedByEnd && !after.startsWith('\n\n') ? undefined : { blockId: ensureNonNullable(match[1]), length: match[0].length, type: BLOCK_ID_TYPE };
}

/**
 * Reads a blockquote: its `>` lines and the lazy lines after them. A callout is a blockquote whose first line, past its
 * `>` and the one optional space after it, opens with a callout header.
 *
 * @param text - The text, from the blockquote's line start.
 * @returns The blockquote, if the text starts with one.
 */
function tokenizeBlockquote(text: string): Token | undefined {
  if (tokenizeBlockquoteStart(text) === undefined) {
    return undefined;
  }
  let lineStart = 0;
  let end = 0;
  let isCallout = false;
  while (lineStart < text.length) {
    const lineEnd = findLineEnd(text, lineStart);
    const markerIndex = skipSpacesAndTabs(text, lineStart);
    const hasMarker = text[markerIndex] === '>';
    if (!hasMarker) {
      const rest = text.slice(lineStart);
      if (text.slice(lineStart, lineEnd).trim() === '' || isBlockquoteInterrupted(rest)) {
        break;
      }
    } else if (lineStart === 0) {
      // Past the `>` and the one optional space after it.
      const afterMarker = markerIndex + 1;
      const contentStart = text[afterMarker] === ' ' ? afterMarker + 1 : afterMarker;
      isCallout = /^\[![^\]]+\][+-]?(?:\s|$)/.test(text.slice(contentStart, lineEnd));
    }
    end = lineEnd;
    lineStart = lineEnd + 1;
  }
  return { length: end, type: isCallout ? 'callout' : 'blockquote' };
}

function tokenizeBlockquoteStart(text: string): Token | undefined {
  return text[skipSpacesAndTabs(text, 0)] === '>' ? { length: 0, type: 'blockquote' } : undefined;
}

/**
 * Reads a `%%` comment block. Its first line holds no other `%`, and it ends just past the next `%%`, or at the end of
 * the text.
 *
 * @param text - The text, from the comment's line start.
 * @returns The comment, if the text starts with one.
 */
function tokenizeComment(text: string): Token | undefined {
  const markStart = skipSpaces(text, 0);
  if (!text.startsWith(COMMENT_MARK, markStart)) {
    return undefined;
  }
  const lineEnd = findLineEnd(text, markStart);
  if (text.slice(markStart + COMMENT_MARK.length, lineEnd).includes('%')) {
    return undefined;
  }
  const closeStart = text.indexOf(COMMENT_MARK, lineEnd);
  return { length: closeStart === -1 ? text.length : closeStart + COMMENT_MARK.length, type: 'comment' };
}

/**
 * Reads a fenced code block, which ends with the end of its closing fence's line, or at the end of the text.
 *
 * @param text - The text, from the fence's line start.
 * @returns The code block, if the text starts with one.
 */
function tokenizeFencedCode(text: string): Token | undefined {
  let index = skipSpacesAndTabs(text, 0);
  const fenceChar = text.charAt(index);
  if (fenceChar !== '`' && fenceChar !== '~') {
    return undefined;
  }
  const fenceStart = index;
  while (text[index] === fenceChar) {
    index++;
  }
  const fenceLength = index - fenceStart;
  if (fenceLength < FENCE_MIN_LENGTH) {
    return undefined;
  }
  const openerEnd = findLineEnd(text, index);
  if (fenceChar === '`' && text.slice(index, openerEnd).includes('`')) {
    return undefined;
  }
  let lineStart = openerEnd + 1;
  while (lineStart <= text.length) {
    const lineEnd = findLineEnd(text, lineStart);
    const closerStart = skipSpaces(text, lineStart);
    if (closerStart - lineStart < INDENTED_CODE_COLUMNS) {
      let closerEnd = closerStart;
      while (text[closerEnd] === fenceChar) {
        closerEnd++;
      }
      if (closerEnd - closerStart >= fenceLength && skipSpacesAndTabs(text, closerEnd) === lineEnd) {
        return { length: lineEnd, type: 'code' };
      }
    }
    lineStart = lineEnd + 1;
  }
  return { length: text.length, type: 'code' };
}

/**
 * Reads a footnote definition, a port of the tokenizer Obsidian's worker carries: `[^label]:` with a label holding no
 * whitespace, then every later line until an empty line followed by a line indented less than four columns, or a line
 * indented less than four columns that starts another block. Any other line is a lazy continuation. It ends at the end
 * of its last line that holds more than whitespace, that whitespace included.
 *
 * @param text - The text, from the definition's line start.
 * @returns The footnote definition, if the text starts with one.
 */
function tokenizeFootnoteDefinition(text: string): Token | undefined {
  const labelEnd = readFootnoteLabel(text);
  if (labelEnd === NOT_FOUND) {
    return undefined;
  }
  // The end of the last line that holds more than whitespace; the first line always counts, and is empty only when
  // nothing follows its `:`.
  let end = findLineEnd(text, labelEnd);
  let isAfterEmptyLine = end === labelEnd;
  let lineStart = end + 1;
  while (lineStart <= text.length) {
    const lineEnd = findLineEnd(text, lineStart);
    const { column, contentStart } = measureFootnoteLineIndent(text, lineStart, lineEnd);
    // Whitespace wider than four columns counts as content, as the worker counts it.
    const hasContent = contentStart < lineEnd || column > INDENTED_CODE_COLUMNS;
    if (hasContent && column < INDENTED_CODE_COLUMNS && (isAfterEmptyLine || isFootnoteDefinitionInterrupted(text.slice(contentStart)))) {
      break;
    }
    if (hasContent) {
      end = lineEnd;
    }
    isAfterEmptyLine = !hasContent;
    lineStart = lineEnd + 1;
  }
  return { length: end, type: 'footnoteDefinition' };
}

/**
 * Reads an HTML block. The first five kinds end with the line that holds their end marker, or at the end of the text;
 * the last two end before the first empty line.
 *
 * @param text - The text, from the block's line start.
 * @returns The HTML block, if the text starts with one.
 */
function tokenizeHtml(text: string): Token | undefined {
  const kind = findHtmlBlockKind(text);
  if (!kind) {
    return undefined;
  }
  let end = findLineEnd(text, skipSpacesAndTabs(text, 0) + 1);
  if (!kind.end.test(text.slice(skipSpacesAndTabs(text, 0), end))) {
    while (end < text.length) {
      const lineEnd = findLineEnd(text, end + 1);
      const line = text.slice(end + 1, lineEnd);
      if (kind.end.test(line)) {
        if (line !== '') {
          end = lineEnd;
        }
        break;
      }
      end = lineEnd;
    }
  }
  return { length: end, type: 'html' };
}

/**
 * Reads an indented code block: lines that start with a tab or with four spaces, and the blank lines between them.
 *
 * @param text - The text, from the block's line start.
 * @returns The code block, if the text starts with one.
 */
function tokenizeIndentedCode(text: string): Token | undefined {
  let end = 0;
  let hasContent = false;
  let lineStart = 0;
  while (lineStart < text.length) {
    let contentStart = -1;
    if (text[lineStart] === '\t') {
      contentStart = lineStart + 1;
    } else if (text.startsWith(' '.repeat(INDENTED_CODE_COLUMNS), lineStart)) {
      contentStart = lineStart + INDENTED_CODE_COLUMNS;
    }
    const lineEnd = findLineEnd(text, lineStart);
    if (contentStart === -1) {
      if (skipSpacesAndTabs(text, lineStart) !== lineEnd || lineEnd === text.length) {
        break;
      }
    } else {
      end = lineEnd;
      hasContent ||= contentStart < lineEnd;
    }
    lineStart = lineEnd + 1;
  }
  return hasContent ? { length: end, type: 'code' } : undefined;
}

/**
 * Reads a `$$` math block. Its first line holds no other `$` and must end with a line break, and it ends with the first
 * later line whose only `$` run closes it, or at the end of the text.
 *
 * @param text - The text, from the block's line start.
 * @returns The math block, if the text starts with one.
 */
function tokenizeMath(text: string): Token | undefined {
  const markStart = skipSpaces(text, 0);
  let index = markStart;
  while (text[index] === '$') {
    index++;
  }
  const markLength = index - markStart;
  if (markLength < MATH_MIN_LENGTH) {
    return undefined;
  }
  const openerEnd = findLineEnd(text, index);
  if (text.slice(index, openerEnd).includes('$') || openerEnd === text.length) {
    return undefined;
  }
  // Obsidian looks for each line's end from one past its start, so an empty line is read together with the next one.
  let lineStart = openerEnd + 1;
  let lineEnd = findLineEnd(text, lineStart + 1);
  while (lineStart < text.length) {
    let runEnd = lineEnd;
    while (runEnd > lineStart && text[runEnd - 1] === ' ') {
      runEnd--;
    }
    let runStart = runEnd;
    while (runStart > lineStart && text[runStart - 1] === '$') {
      runStart--;
    }
    if (runEnd - runStart >= markLength && text.indexOf('$', lineStart) === runStart) {
      break;
    }
    lineStart = lineEnd + 1;
    lineEnd = findLineEnd(text, lineStart + 1);
  }
  return { length: Math.min(lineEnd, text.length), type: 'math' };
}

/**
 * Reads a paragraph, which runs until an empty or whitespace-only line, or a line that interrupts it.
 *
 * @param text - The text, from the paragraph's line start.
 * @returns The paragraph.
 */
function tokenizeParagraph(text: string): Token {
  let lineEnd = text.indexOf('\n');
  while (lineEnd !== -1 && lineEnd < text.length) {
    if (text[lineEnd + 1] === '\n') {
      break;
    }
    let indent = 0;
    let char = '';
    for (let index = lineEnd + 1; index < text.length; index++) {
      char = text.charAt(index);
      if (char === '\t') {
        indent = INDENTED_CODE_COLUMNS;
        break;
      }
      if (char !== ' ') {
        break;
      }
      indent++;
    }
    if (indent >= INDENTED_CODE_COLUMNS && char !== '\n') {
      lineEnd = text.indexOf('\n', lineEnd + 1);
      continue;
    }
    if (isParagraphInterrupted(text.slice(lineEnd + 1))) {
      break;
    }
    const nextLineEnd = text.indexOf('\n', lineEnd + 1);
    if (nextLineEnd !== -1 && text.slice(lineEnd, nextLineEnd).trim() === '') {
      break;
    }
    lineEnd = nextLineEnd;
  }
  let end = lineEnd === -1 ? text.length : lineEnd;
  while (end > 0 && text[end - 1] === '\n') {
    end--;
  }
  return { length: end, type: 'paragraph' };
}

/**
 * Reads a setext heading: one line of text, indented at most three spaces, then a line of only `=` or only `-`.
 *
 * @param text - The text, from the heading's line start.
 * @returns The heading, if the text starts with one.
 */
function tokenizeSetextHeading(text: string): Token | undefined {
  let textStart = 0;
  while (textStart < SETEXT_MAX_INDENT && text[textStart] === ' ') {
    textStart++;
  }
  const lineEnd = findLineEnd(text, textStart);
  const underlineChar = text.charAt(lineEnd + 1);
  if (lineEnd === text.length || (underlineChar !== '=' && underlineChar !== '-')) {
    return undefined;
  }
  let underlineEnd = lineEnd + 1;
  while (text[underlineEnd] === underlineChar) {
    underlineEnd++;
  }
  if (underlineEnd < text.length && text[underlineEnd] !== '\n') {
    return undefined;
  }
  return {
    heading: { level: underlineChar === '=' ? SETEXT_EQUALS_LEVEL : SETEXT_DASHES_LEVEL, text: text.slice(textStart, lineEnd).trim() },
    length: underlineEnd,
    type: 'heading'
  };
}

/**
 * Reads a thematic break: three or more of one of `*`, `-` and `_`, with only spaces between them.
 *
 * @param text - The text, from the break's line start.
 * @returns The thematic break, if the text starts with one.
 */
function tokenizeThematicBreak(text: string): Token | undefined {
  let index = skipSpacesAndTabs(text, 0);
  const marker = text.charAt(index);
  if (marker !== '*' && marker !== '-' && marker !== '_') {
    return undefined;
  }
  let markerCount = 0;
  while (text[index] === marker || text[index] === ' ') {
    if (text[index] === marker) {
      markerCount++;
    }
    index++;
  }
  return markerCount < THEMATIC_BREAK_MIN_MARKERS || (index < text.length && text[index] !== '\n') ? undefined : { length: index, type: 'thematicBreak' };
}
