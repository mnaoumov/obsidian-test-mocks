/**
 * @file
 *
 * The inline block ids of a run of inline text, read the way Obsidian's metadata worker reads them. The worker's inline
 * block id tokenizer takes `^id` when it reaches the `^` at a token boundary and the id runs to the end of the inline
 * content it is tokenizing: the start of that content, a `^` after whitespace, which its locator finds, or the end of any
 * other inline token. So `a\*^id`, ``a`c`^id`` and `a*b*^id` each end with an id, while `a*^id` and `a\q^id` do not.
 * Emphasis, strong, a strikethrough, a highlight, a comment and a link's text tokenize their own content, so an id can
 * end any of those too: `*a ^id* b` holds one.
 *
 * This is a port of the inline tokenizer loop of `remark-parse` 8, with `commonmark` and `gfm` on, and of the tokenizers
 * the worker runs in it, Obsidian's own among them. A tokenizer is tried at every position the loop reaches; when none
 * matches, the text tokenizer eats up to the next position any tokenizer's locator finds. The tokenizers whose only part
 * here is where they end are approximated: an HTML tag, an autolink, a bare URL, a link's destination.
 */

import {
  findInlineNoteClose,
  findReferenceLabelEnd,
  measureBacktickRun
} from './markdown-references.ts';
import { ensureNonNullable } from './type-guards.ts';

/**
 * Where a bracketed run closes.
 */
interface BracketClose {
  /**
   * The offset of the closing `]`.
   */
  readonly close: number;

  /**
   * Whether a nested `[` was seen before it.
   */
  readonly isBracketed: boolean;
}

/**
 * A tokenizer of the worker's inline loop: it eats a token starting at `start`, collecting the ids the token's content
 * holds, and answers the offset past it, or `-1` when no token starts there.
 */
type Tokenizer = (text: string, start: number, end: number, ids: string[]) => number;

const NO_TOKEN = -1;
// The length of a doubled marker (`**`, `~~`, `==`, `$$`, `%%`), of an escape, and of an image's `![`.
const PAIR_LENGTH = 2;
const BLOCK_ID_REGEX = /^\^(?<id>[a-zA-Z0-9-]+)$/;
const ASCII_PUNCTUATION_REGEX = /[!-/:-@[-`{-~]/;
const WHITESPACE_REGEX = /\s/;
const WORD_CHARACTER_REGEX = /\w/;
// Obsidian's tag pattern, from its worker.
const TAG_REGEX = /^#[^\u{2000}-\u{206F}\u{2E00}-\u{2E7F}'!"#$%&()*+,.:;<=>?@^`{|}~[\]\\\s]+/u;
const NUMERIC_TAG_REGEX = /^#\d+$/;
const WIKILINK_REGEX = /^!?\[\[(?<target>.+?)\]\]/;
const COMMENT_REGEX = /^%%.*?%%/;
const HTML_REGEX = /^<(?:[A-Za-z][A-Za-z\d+.-]{1,31}:[^\s<>]*|[^\s<>@]+@[^\s<>]+|\/?[A-Za-z][A-Za-z\d-]*(?:\s[^<>]*)?\/?|!--[\s\S]*?--|\?[\s\S]*?\?|![A-Za-z][^>]*|!\[CDATA\[[\s\S]*?\]\])>/;
const URL_PREFIX_REGEX = /^(?:https?:\/\/|mailto:|www\.)/i;
const URL_PREFIX_MAX_LENGTH = 'https://'.length;
const URL_TRAILING_PUNCTUATION = '.,:;"\')]';
const EMAIL_LOCAL_REGEX = /[A-Za-z\d+._-]/;
const EMAIL_DOMAIN_REGEX = /[A-Za-z\d._-]/;
const COMMENT_MARKER = '%%';
const INLINE_NOTE_OPENER = '^[';
const FOOTNOTE_CALL_OPENER = '[^';
const MARK_REFUSED_OPENER = '====';
const DOLLAR = '$';
const BACKSLASH = '\\';

/**
 * The tokenizers of the worker's inline loop, in the order it tries them, the text tokenizer left out.
 */
const TOKENIZERS: readonly Tokenizer[] = [
  tokenizeEscape,
  tokenizeHtml,
  tokenizeUrl,
  tokenizeEmail,
  tokenizeWikilink,
  tokenizeLink,
  tokenizeInlineNote,
  tokenizeFootnoteCall,
  tokenizeReference,
  tokenizeStrong,
  tokenizeEmphasis,
  tokenizeDeletion,
  tokenizeCode,
  tokenizeTag,
  tokenizeMark,
  tokenizeMath,
  tokenizeBlockId,
  tokenizeComment
];

/**
 * Finds the block ids a run of inline text holds, in document order: the one ending the text, and those ending the
 * content of an inline token inside it. A paragraph takes the last of them, and a list item the first.
 *
 * @param text - The inline text, without its trailing line breaks.
 * @returns The ids.
 */
export function findInlineBlockIds(text: string): string[] {
  const ids: string[] = [];
  scanInline(text, 0, text.length, ids);
  return ids;
}

/**
 * Reads the character at an offset, or `''` past the end of the inline content, which a tokenizer must not look beyond.
 *
 * @param text - The text.
 * @param index - The offset.
 * @param end - The offset the inline content ends at.
 * @returns The character.
 */
function charAtBefore(text: string, index: number, end: number): string {
  return index < end ? text.charAt(index) : '';
}

/**
 * Finds where a bracketed run closes: the `]` that balances the `[` before `start`, a `\` escaping the character after
 * it.
 *
 * @param text - The text.
 * @param start - The offset just past the `[`.
 * @param end - The offset the inline content ends at.
 * @returns Where it closes, or `undefined` when it does not.
 */
function findBracketClose(text: string, start: number, end: number): BracketClose | undefined {
  let depth = 0;
  let isBracketed = false;
  let index = start;
  while (index < end) {
    switch (text.charAt(index)) {
      case '[': {
        isBracketed = true;
        depth++;
        break;
      }
      case ']': {
        if (depth === 0) {
          return { close: index, isBracketed };
        }
        depth--;
        break;
      }
      case '\\': {
        index++;
        break;
      }
      default: {
        break;
      }
    }
    index++;
  }
  return undefined;
}

/**
 * Finds where the GFM email tokenizer's locator stops the text tokenizer: the start of the run of local-part characters
 * before an `@`, though never before `from`. An `@` with no such character right before it is skipped, and the search
 * goes on from past it.
 *
 * @param text - The text.
 * @param from - The offset the search starts at.
 * @param end - The offset the inline content ends at.
 * @returns The position, or `end` when there is none.
 */
function findEmailLocatorPosition(text: string, from: number, end: number): number {
  let lower = from;
  for (let at = text.indexOf('@', from); at !== -1 && at < end; at = text.indexOf('@', at + 1)) {
    if (at === lower || !EMAIL_LOCAL_REGEX.test(text.charAt(at - 1))) {
      lower = at + 1;
      continue;
    }
    let position = at;
    while (position > lower && EMAIL_LOCAL_REGEX.test(text.charAt(position - 1))) {
      position--;
    }
    return position;
  }
  return end;
}

/**
 * Finds where the text tokenizer stops: the first position from `from` that any tokenizer's locator finds.
 *
 * @param text - The text.
 * @param from - The offset the search starts at.
 * @param end - The offset the inline content ends at.
 * @returns The position, or `end` when there is none.
 */
function findNextLocatorPosition(text: string, from: number, end: number): number {
  const emailPosition = findEmailLocatorPosition(text, from, end);
  for (let index = from; index < emailPosition; index++) {
    if (isLocatorPosition(text, index, end)) {
      return index;
    }
  }
  return emailPosition;
}

/**
 * Checks whether a locator other than the email one finds a position, where the text tokenizer stops so that every
 * tokenizer is tried there.
 *
 * @param text - The text.
 * @param index - The position.
 * @param end - The offset the inline content ends at.
 * @returns Whether it is found.
 */
function isLocatorPosition(text: string, index: number, end: number): boolean {
  const char = text.charAt(index);
  const next = charAtBefore(text, index + 1, end);
  switch (char) {
    case '\n':
    case '_':
    case '[':
    case '*':
    case '\\':
    case '`':
    case '<':
    case '$': {
      return true;
    }
    case '!': {
      return next === '[';
    }
    case '#': {
      return isWhitespace(text.charAt(index - 1));
    }
    case '%':
    case '=':
    case '~': {
      return next === char;
    }
    case '^': {
      return next === '[' || isWhitespace(text.charAt(index - 1));
    }
    default: {
      return URL_PREFIX_REGEX.test(text.slice(index, Math.min(end, index + URL_PREFIX_MAX_LENGTH)));
    }
  }
}

/**
 * Checks whether a character is whitespace, the empty string past the end of the content not being any.
 *
 * @param char - The character.
 * @returns Whether it is whitespace.
 */
function isWhitespace(char: string): boolean {
  return char !== '' && WHITESPACE_REGEX.test(char);
}

/**
 * Runs the worker's inline loop over a range: at each position the loop reaches, the first tokenizer that matches eats
 * its token, and when none does, the text tokenizer eats up to the next position a locator finds.
 *
 * @param text - The text.
 * @param start - The offset the inline content starts at.
 * @param end - The offset it ends at.
 * @param ids - Where the ids found are collected.
 */
function scanInline(text: string, start: number, end: number, ids: string[]): void {
  let index = start;
  while (index < end) {
    let tokenEnd = NO_TOKEN;
    for (const tokenizer of TOKENIZERS) {
      tokenEnd = tokenizer(text, index, end, ids);
      if (tokenEnd !== NO_TOKEN) {
        break;
      }
    }
    index = tokenEnd === NO_TOKEN ? findNextLocatorPosition(text, index + 1, end) : tokenEnd;
  }
}

/**
 * Skips what display math eats after its closing `$$`: whitespace up to and including a line break, when only whitespace
 * comes before it.
 *
 * @param text - The text.
 * @param from - The offset past the closing `$$`.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token.
 */
function skipDisplayMathTrail(text: string, from: number, end: number): number {
  for (let index = from; index < end; index++) {
    const char = text.charAt(index);
    if (char === '\n') {
      return index + 1;
    }
    if (!isWhitespace(char)) {
      break;
    }
  }
  return from;
}

/**
 * The inline block id tokenizer: `^id` running to the end of the inline content.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the id is collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeBlockId(text: string, start: number, end: number, ids: string[]): number {
  const id = text.charAt(start) === '^' ? BLOCK_ID_REGEX.exec(text.slice(start, end))?.groups?.['id'] : undefined;
  if (id === undefined) {
    return NO_TOKEN;
  }
  ids.push(id);
  return end;
}

/**
 * The code span tokenizer: a run of backticks and the next run of the same length.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeCode(text: string, start: number, end: number): number {
  const runLength = measureBacktickRun(text, start, end);
  if (runLength === 0) {
    return NO_TOKEN;
  }
  let index = start + runLength;
  while (index < end) {
    if (text.charAt(index) === '`') {
      const closingLength = measureBacktickRun(text, index, end);
      if (closingLength === runLength) {
        return index + closingLength;
      }
      index += closingLength;
    } else {
      index++;
    }
  }
  return NO_TOKEN;
}

/**
 * Obsidian's inline comment tokenizer: `%%`, text on the same line, `%%`, the text tokenized as inline content.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its content holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeComment(text: string, start: number, end: number, ids: string[]): number {
  const match = text.charAt(start) === '%' ? COMMENT_REGEX.exec(text.slice(start, end)) : null;
  if (!match) {
    return NO_TOKEN;
  }
  scanInline(text, start + COMMENT_MARKER.length, start + match[0].length - COMMENT_MARKER.length, ids);
  return start + match[0].length;
}

/**
 * The GFM strikethrough tokenizer: `~~`, content not opening with whitespace, and the first `~~` not after whitespace.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its content holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeDeletion(text: string, start: number, end: number, ids: string[]): number {
  return tokenizeDoubleDelimited(text, start, end, ids, '~');
}

/**
 * The strikethrough tokenizer's shape, which Obsidian's highlight tokenizer shares: two markers, content that does not
 * open with whitespace, and the first two markers in a row not after whitespace.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its content holds are collected.
 * @param marker - The marker.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeDoubleDelimited(text: string, start: number, end: number, ids: string[], marker: string): number {
  const contentStart = start + PAIR_LENGTH;
  if (text.charAt(start) !== marker || charAtBefore(text, start + 1, end) !== marker || isWhitespace(charAtBefore(text, contentStart, end))) {
    return NO_TOKEN;
  }
  for (let index = contentStart + 1; index < end; index++) {
    const beforePair = index - PAIR_LENGTH;
    const isAfterWhitespace = beforePair >= contentStart && isWhitespace(text.charAt(beforePair));
    if (text.charAt(index) === marker && text.charAt(index - 1) === marker && !isAfterWhitespace) {
      scanInline(text, contentStart, index - 1, ids);
      return index + 1;
    }
  }
  return NO_TOKEN;
}

/**
 * The GFM email tokenizer: local-part characters, `@`, and domain characters holding a `.`. At the end of the content, a
 * trailing `.` is left out and a trailing `-` or `_` refuses the whole.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeEmail(text: string, start: number, end: number): number {
  let index = start;
  while (index < end && EMAIL_LOCAL_REGEX.test(text.charAt(index))) {
    index++;
  }
  if (index === start || charAtBefore(text, index, end) !== '@') {
    return NO_TOKEN;
  }
  index++;
  let firstDot = NO_TOKEN;
  let last = '';
  while (index < end && EMAIL_DOMAIN_REGEX.test(text.charAt(index))) {
    last = text.charAt(index);
    index++;
    if (firstDot === NO_TOKEN && last === '.') {
      firstDot = index;
    }
  }
  const isAtEnd = index === end;
  if (firstDot === NO_TOKEN || firstDot === index || (isAtEnd && (last === '-' || last === '_'))) {
    return NO_TOKEN;
  }
  return isAtEnd && last === '.' ? index - 1 : index;
}

/**
 * The emphasis tokenizer: one `*` or `_`, and the next single one that is not right after another, with a `\` escaping
 * the character after it. A closing `_` followed by a word character is part of the content.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its content holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeEmphasis(text: string, start: number, end: number, ids: string[]): number {
  const marker = text.charAt(start);
  if (marker !== '*' && marker !== '_') {
    return NO_TOKEN;
  }
  let content = '';
  let char = '';
  let index = start + 1;
  while (index < end) {
    const previous = char;
    char = text.charAt(index);
    if (char === marker) {
      index++;
      char = charAtBefore(text, index, end);
      if (char !== marker) {
        if (content.trim() === '' || previous === marker) {
          return NO_TOKEN;
        }
        if (marker === '_' && char !== '' && WORD_CHARACTER_REGEX.test(char)) {
          content += marker;
          continue;
        }
        scanInline(text, start + 1, index - 1, ids);
        return index;
      }
      content += marker;
    }
    if (char === BACKSLASH) {
      content += char;
      index++;
      char = charAtBefore(text, index, end);
    }
    content += char;
    index++;
  }
  return NO_TOKEN;
}

/**
 * The escape tokenizer: a `\` and an ASCII punctuation character or a line break.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeEscape(text: string, start: number, end: number): number {
  if (text.charAt(start) !== BACKSLASH) {
    return NO_TOKEN;
  }
  const char = charAtBefore(text, start + 1, end);
  return char === '\n' || (char !== '' && ASCII_PUNCTUATION_REGEX.test(char)) ? start + PAIR_LENGTH : NO_TOKEN;
}

/**
 * The footnote call tokenizer: `[^`, a label holding no whitespace, `]`. It is a token whether a definition carries the
 * label or not.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeFootnoteCall(text: string, start: number, end: number): number {
  if (!text.startsWith(FOOTNOTE_CALL_OPENER, start)) {
    return NO_TOKEN;
  }
  const labelEnd = findReferenceLabelEnd(text, start + FOOTNOTE_CALL_OPENER.length, end);
  return labelEnd === NO_TOKEN ? NO_TOKEN : labelEnd + 1;
}

/**
 * An autolink or an inline HTML tag, approximated: what matters here is only where it ends.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeHtml(text: string, start: number, end: number): number {
  const match = text.charAt(start) === '<' ? HTML_REGEX.exec(text.slice(start, end)) : null;
  return match ? start + match[0].length : NO_TOKEN;
}

/**
 * The inline footnote tokenizer: `^[`, text with balanced brackets, `]`. Its text is the footnote's, so an id ending it
 * is the footnote list's rather than the paragraph's.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeInlineNote(text: string, start: number, end: number): number {
  if (!text.startsWith(INLINE_NOTE_OPENER, start)) {
    return NO_TOKEN;
  }
  const close = findInlineNoteClose(text, start + INLINE_NOTE_OPENER.length, end);
  return close === NO_TOKEN ? NO_TOKEN : close + 1;
}

/**
 * The link tokenizer: `[text](destination)`, or an image's `![alt](destination)`. The text is tokenized as inline
 * content, an image's alternative text is not. The destination and title are approximated: up to the `)` that balances
 * the `(`.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its text holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeLink(text: string, start: number, end: number, ids: string[]): number {
  const isImage = text.charAt(start) === '!';
  const textStart = start + (isImage ? PAIR_LENGTH : 1);
  if (charAtBefore(text, textStart - 1, end) !== '[') {
    return NO_TOKEN;
  }
  const bracket = findBracketClose(text, textStart, end);
  if (!bracket || charAtBefore(text, bracket.close + 1, end) !== '(') {
    return NO_TOKEN;
  }
  let depth = 0;
  for (let index = bracket.close + PAIR_LENGTH; index < end; index++) {
    switch (text.charAt(index)) {
      case '(': {
        depth++;
        break;
      }
      case ')': {
        if (depth === 0) {
          if (!isImage) {
            scanInline(text, textStart, bracket.close, ids);
          }
          return index + 1;
        }
        depth--;
        break;
      }
      case '\\': {
        index++;
        break;
      }
      default: {
        break;
      }
    }
  }
  return NO_TOKEN;
}

/**
 * Obsidian's highlight tokenizer: `==`, not `====`, then the strikethrough tokenizer's shape.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its content holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeMark(text: string, start: number, end: number, ids: string[]): number {
  return text.startsWith(MARK_REFUSED_OPENER, start) ? NO_TOKEN : tokenizeDoubleDelimited(text, start, end, ids, '=');
}

/**
 * Obsidian's inline math tokenizer: `$`, content not opening with a space or a tab, and a `$` not after a space or a tab
 * nor before a digit; or `$$`, any content, and `$$`.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeMath(text: string, start: number, end: number): number {
  if (text.charAt(start) !== DOLLAR) {
    return NO_TOKEN;
  }
  const isDisplay = charAtBefore(text, start + 1, end) === DOLLAR;
  let index = start + (isDisplay ? PAIR_LENGTH : 1);
  if (!isDisplay && [' ', '\t'].includes(charAtBefore(text, index, end))) {
    return NO_TOKEN;
  }
  while (index < end) {
    const char = text.charAt(index);
    if (char === DOLLAR) {
      const before = text.charAt(index - 1);
      const after = charAtBefore(text, index + 1, end);
      const isInlineClose = !isDisplay && before !== ' ' && before !== '\t' && !(after >= '0' && after <= '9');
      if (isInlineClose) {
        return index + 1;
      }
      if (isDisplay && after === DOLLAR) {
        return skipDisplayMathTrail(text, index + PAIR_LENGTH, end);
      }
    } else if (char === BACKSLASH) {
      index++;
    }
    index++;
  }
  return NO_TOKEN;
}

/**
 * The reference tokenizer: `[text]`, `[text][]` or `[text][label]`, or an image's form of each. It is a token whether a
 * definition carries the label or not; a `[` followed by `^` is left to the footnote tokenizers. The text is tokenized as
 * inline content, unless it is an image's.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its text holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeReference(text: string, start: number, end: number, ids: string[]): number {
  const isImage = text.charAt(start) === '!';
  const textStart = start + (isImage ? PAIR_LENGTH : 1);
  if (charAtBefore(text, textStart - 1, end) !== '[' || charAtBefore(text, textStart, end) === '^') {
    return NO_TOKEN;
  }
  const bracket = findBracketClose(text, textStart, end);
  if (!bracket) {
    return NO_TOKEN;
  }
  let tokenEnd = bracket.close + 1;
  let isFull = false;
  if (charAtBefore(text, tokenEnd, end) === '[') {
    let index = tokenEnd + 1;
    while (index < end && text.charAt(index) !== '[' && text.charAt(index) !== ']') {
      index += text.charAt(index) === BACKSLASH ? PAIR_LENGTH : 1;
    }
    if (index < end && text.charAt(index) === ']') {
      isFull = index > tokenEnd + 1;
      tokenEnd = index + 1;
    }
  } else if (bracket.close === textStart) {
    return NO_TOKEN;
  }
  if (!isFull && bracket.isBracketed) {
    return NO_TOKEN;
  }
  if (!isImage) {
    scanInline(text, textStart, bracket.close, ids);
  }
  return tokenEnd;
}

/**
 * The strong tokenizer: `**` or `__`, and the next pair of the same marker not followed by a third, with a `\` escaping
 * the character after it.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @param ids - Where the ids its content holds are collected.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeStrong(text: string, start: number, end: number, ids: string[]): number {
  const marker = text.charAt(start);
  if ((marker !== '*' && marker !== '_') || charAtBefore(text, start + 1, end) !== marker) {
    return NO_TOKEN;
  }
  const contentStart = start + PAIR_LENGTH;
  let index = contentStart;
  while (index < end) {
    const char = text.charAt(index);
    if (char === marker && charAtBefore(text, index + 1, end) === marker && charAtBefore(text, index + PAIR_LENGTH, end) !== marker) {
      if (text.slice(contentStart, index).trim() === '') {
        return NO_TOKEN;
      }
      scanInline(text, contentStart, index, ids);
      return index + PAIR_LENGTH;
    }
    index += char === BACKSLASH ? PAIR_LENGTH : 1;
  }
  return NO_TOKEN;
}

/**
 * Obsidian's tag tokenizer: `#` and a run of tag characters, a run of digits alone being no tag.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeTag(text: string, start: number, end: number): number {
  const match = text.charAt(start) === '#' ? TAG_REGEX.exec(text.slice(start, end)) : null;
  return match && !NUMERIC_TAG_REGEX.test(match[0]) ? start + match[0].length : NO_TOKEN;
}

/**
 * A bare URL, approximated: a scheme or `www.`, then everything up to whitespace or a `<`, less trailing punctuation.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeUrl(text: string, start: number, end: number): number {
  const prefix = URL_PREFIX_REGEX.exec(text.slice(start, end));
  if (!prefix) {
    return NO_TOKEN;
  }
  const bodyStart = start + prefix[0].length;
  let index = bodyStart;
  while (index < end && !isWhitespace(text.charAt(index)) && text.charAt(index) !== '<') {
    index++;
  }
  while (index > bodyStart && URL_TRAILING_PUNCTUATION.includes(text.charAt(index - 1))) {
    index--;
  }
  return index > bodyStart ? index : NO_TOKEN;
}

/**
 * Obsidian's wikilink tokenizer: `[[`, a target on one line holding no `[[`, `]]`, with an optional `!` before it.
 *
 * @param text - The text.
 * @param start - The offset the token would start at.
 * @param end - The offset the inline content ends at.
 * @returns The offset past the token, or `-1`.
 */
function tokenizeWikilink(text: string, start: number, end: number): number {
  const match = text.charAt(start) === '[' || text.charAt(start) === '!' ? WIKILINK_REGEX.exec(text.slice(start, end)) : null;
  return match && !ensureNonNullable(match.groups?.['target']).trim().includes('[[') ? start + match[0].length : NO_TOKEN;
}
