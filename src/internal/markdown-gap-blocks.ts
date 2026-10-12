/**
 * @file
 *
 * The top-level blocks of the text between two sections the parser has already found, read the way Obsidian's metadata
 * worker reads them. That worker is `remark-parse` 8 with `commonmark` and `gfm` on, plus two block tokenizers of
 * Obsidian's own, a `%%` comment and a `$$` math block, so each tokenizer below is a port of one of those, quirks and
 * all:
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
 *
 * List items, link reference definitions, footnote definitions and block ids are not read here.
 */

/**
 * A block found in the text.
 */
export interface GapBlock {
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
const BLANK_LINE_END_REGEX = /^$/;

interface HtmlBlockKind {
  // Whether the kind may interrupt a paragraph or a blockquote.
  readonly canInterrupt: boolean;
  // What a line ending the block holds.
  readonly end: RegExp;
  // What the block's first line starts with.
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

/**
 * Reads the top-level blocks of a text that holds no list item and no heading the parser has already found.
 *
 * @param text - The text.
 * @returns The blocks, in order, with positions relative to the text.
 */
export function scanGapBlocks(text: string): GapBlock[] {
  const blocks: GapBlock[] = [];
  let index = 0;
  while (index < text.length) {
    const rest = text.slice(index);
    const blankLength = measureBlankLines(rest);
    if (blankLength > 0) {
      index += blankLength;
      continue;
    }
    const token = tokenizeBlock(rest);
    blocks.push({
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

function canHtmlBlockInterrupt(text: string): boolean {
  return findHtmlBlockKind(text)?.canInterrupt === true;
}

function findHtmlBlockKind(text: string): HtmlBlockKind | undefined {
  const tagStart = skipSpacesAndTabs(text, 0);
  if (text[tagStart] !== '<') {
    return undefined;
  }
  const firstLine = text.slice(tagStart, findLineEnd(text, tagStart + 1));
  return HTML_BLOCK_KINDS.find((kind) => kind.start.test(firstLine));
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

function tokenizeBlock(text: string): Token {
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
    tokenizeTable
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
 * Reads a table: a header row, a delimiter row and the rows after it. Every row holds a `|` past its first character,
 * and starts with a `|` exactly when the header does.
 *
 * @param text - The text, from the table's line start.
 * @returns The table, if the text starts with one.
 */
function tokenizeTable(text: string): Token | undefined {
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
