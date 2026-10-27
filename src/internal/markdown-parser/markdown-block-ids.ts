/**
 * @file
 *
 * Block ids, assigned the way Obsidian's metadata worker assigns them once it has parsed a note. An id is `^` and a run
 * of letters, digits and `-`, read in two places:
 *
 * - Inline, at the end of a paragraph's or a heading's text, or of the content of an inline token in it, where the `^`
 *   starts that text, follows whitespace, or follows another inline token (see `markdown-inline-block-ids.ts`). Trailing
 *   whitespace after the id spoils it.
 * - Standalone, as a block of its own (see `markdown-gap-blocks.ts`). Its id goes to the top-level section before it,
 *   whatever that section is, and the block itself is dropped, so a note opening with one keeps no trace of it.
 *
 * A top-level section takes the LAST id found anywhere inside it, a standalone one after it overriding that. A list
 * section takes none of its own, only a standalone one after it; each of its items takes the FIRST id in its own blocks,
 * the lists nested in it left out. `blocks` keys every id lower-cased, sections first and list items after them.
 */

import type {
  BlockCache,
  HeadingCache,
  ListItemCache,
  SectionCache
} from 'obsidian';

import type { FootnoteSource } from './markdown-references.ts';

import { ensureNonNullable } from '../type-guards.ts';
import { BLOCK_ID_TYPE } from './markdown-gap-blocks.ts';
import { findInlineBlockIds } from './markdown-inline-block-ids.ts';
import { findInlineNoteTexts } from './markdown-references.ts';

/**
 * What {@link assignBlockIds} needs.
 */
export interface AssignBlockIdsParams {
  /**
   * The note's full text.
   */
  readonly content: string;

  /**
   * The footnotes the note references, which the `element` section Obsidian appends for them holds.
   */
  readonly footnoteSources: readonly FootnoteSource[];

  /**
   * The note's headings, which hold the text an ATX or setext heading's id is read from.
   */
  readonly headings: readonly HeadingCache[];

  /**
   * The note's list items, each of which is given the id it holds.
   */
  readonly listItems: readonly ListItemCache[];

  /**
   * The note's sections, sorted, standalone block ids among them; those are removed, and every other section is given
   * the id it holds.
   */
  readonly sections: SectionCache[];
}

/**
 * Consecutive lines of one block, of one blockquote, or of one comment block.
 */
interface LineGroup {
  // eslint-disable-next-line typescript-dev-toolkit/readonly-interface-members -- The parser updates this state field as it advances through the document.
  isOpenComment: boolean;
  readonly kind: 'comment' | 'quote' | 'text';
  readonly lines: string[];
}

const QUOTE_PREFIX_REGEX = /^(?:[ \t]*> ?)+/;
const LIST_MARKER_REGEX = /^[ \t]*(?:[-*+]|\d+[.)])(?:[ \t]+\[.\](?=[ \t]|$))?/;
const FOOTNOTE_LABEL_REGEX = /^[ \t]*\[\^[^\]]*\]:/;
const COMMENT_MARKER = '%%';
// A line opening a comment block: spaces, `%%`, and no other `%` on the line, which would make it inline.
const COMMENT_OPENER_REGEX = /^ *%%[^%\n]*(?:\n|$)/;
// The sections whose text holds inline content, which an id can end.
const QUOTE_SECTION_TYPES: ReadonlySet<string> = new Set(['blockquote', 'callout']);

/**
 * The type of the section Obsidian's worker appends to a note that references a footnote: the list of those footnotes.
 */
export const FOOTNOTE_LIST_SECTION_TYPE = 'element';

/**
 * Assigns the block ids of a note's sections and list items, and drops its standalone block ids.
 *
 * @param params - The note, its sections, headings and list items.
 * @returns The `blocks` collection: each id, lower-cased, to the section or list item that holds it.
 */
export function assignBlockIds(params: AssignBlockIdsParams): Record<string, BlockCache> {
  const { content, footnoteSources, headings, listItems, sections } = params;
  const blocks: Record<string, BlockCache> = {};
  const headingsByStart = new Map(headings.map((heading) => [heading.position.start.offset, heading]));
  const kept: SectionCache[] = [];
  for (const section of sections) {
    if (section.type === BLOCK_ID_TYPE) {
      const previous = kept.at(-1);
      if (previous) {
        previous.id = section.id;
      }
      continue;
    }
    section.id = section.type === FOOTNOTE_LIST_SECTION_TYPE
      ? findFootnoteListBlockId(footnoteSources)
      : findSectionBlockId(content, section, headingsByStart.get(section.position.start.offset));
    kept.push(section);
  }
  sections.splice(0, sections.length, ...kept);

  for (const section of sections) {
    if (section.id !== undefined) {
      blocks[section.id.toLowerCase()] = { id: section.id, position: section.position };
    }
  }

  const listSections = sections.filter((section) => section.type === 'list');
  for (const item of listItems) {
    const isInListSection = listSections.some((section) => section.position.start.offset <= item.position.start.offset && item.position.start.offset < section.position.end.offset);
    if (!isInListSection) {
      continue;
    }
    const id = findListItemBlockId(content, item, listItems);
    if (id === undefined) {
      continue;
    }

    item.id = id;
    blocks[id.toLowerCase()] = { id, position: item.position };
  }
  return blocks;
}

/**
 * Finds the id a block holds: the last one in its inline content, which for a comment block is what the comment holds.
 *
 * @param block - The block's lines, joined with `\n`.
 * @returns The ids, in document order.
 */
function findBlockIds(block: string): string[] {
  return findInlineBlockIds(COMMENT_OPENER_REGEX.test(block) ? getCommentText(block) : block);
}

/**
 * Finds the id a footnote definition holds: the last one in its blocks.
 *
 * @param text - The definition's text, its label included, and the line break after it when the note goes on. The
 *   worker's definition then holds that line break, and so does a comment block the definition leaves unclosed, which
 *   no id can end then.
 * @returns The id.
 */
function findFootnoteDefinitionBlockId(text: string): string | undefined {
  return findLastBlockId(splitIntoBlocks(text.replace(FOOTNOTE_LABEL_REGEX, '').split('\n')));
}

/**
 * Finds the id the footnote list Obsidian appends to a note holds: the last one in the footnotes it copies there, in the
 * order they are first referenced. It is found anywhere in them, so the list takes an id that ends an inline footnote's
 * text, which the paragraph holding that footnote does not.
 *
 * @param footnoteSources - The footnotes the note references.
 * @returns The id.
 */
function findFootnoteListBlockId(footnoteSources: readonly FootnoteSource[]): string | undefined {
  let lastId: string | undefined;
  for (const source of footnoteSources) {
    lastId = (source.isDefinition ? findFootnoteDefinitionBlockId(source.text) : findInlineNoteBlockId(source.text)) ?? lastId;
  }
  return lastId;
}

/**
 * Finds the id a paragraph's inline text holds: the last one, in a paragraph that holds more than one through its inline
 * tokens.
 *
 * @param text - The paragraph's text, without its trailing line breaks.
 * @returns The id.
 */
function findInlineBlockId(text: string): string | undefined {
  return findInlineBlockIds(text).at(-1);
}

/**
 * Finds the last id an inline footnote holds: the one ending its text, or else the last one in the inline footnotes
 * nested in it, which Obsidian leaves in place inside the outer one rather than turning into references of their own.
 *
 * @param text - What the inline footnote holds.
 * @returns The id.
 */
function findInlineNoteBlockId(text: string): string | undefined {
  let lastId = findInlineBlockId(text);
  for (const nestedText of lastId === undefined ? findInlineNoteTexts(text) : []) {
    lastId = findInlineNoteBlockId(nestedText) ?? lastId;
  }
  return lastId;
}

function findLastBlockId(blocks: readonly string[]): string | undefined {
  let lastId: string | undefined;
  for (const block of blocks) {
    lastId = findBlockIds(block).at(-1) ?? lastId;
  }
  return lastId;
}

/**
 * Finds the id a list item holds: the first among its own blocks, which are its lines with the lines of the items nested
 * in it left out, split at empty lines.
 *
 * @param content - The note's full text.
 * @param item - The item.
 * @param listItems - Every list item of the note.
 * @returns The id.
 */
function findListItemBlockId(content: string, item: ListItemCache, listItems: readonly ListItemCache[]): string | undefined {
  const nestedRanges = getDescendants(item, listItems).map((nested) => [nested.position.start.line, nested.position.end.line]);
  const lines = content.slice(item.position.start.offset, item.position.end.offset).split('\n');
  const ownLines: string[] = [];
  for (const [index, line] of lines.entries()) {
    const lineNumber = item.position.start.line + index;
    if (nestedRanges.some(([start = 0, end = 0]) => start <= lineNumber && lineNumber <= end)) {
      continue;
    }
    ownLines.push(index === 0 ? line.replace(LIST_MARKER_REGEX, '') : line);
  }
  for (const block of splitIntoBlocks(ownLines)) {
    const [id] = findBlockIds(block);
    if (id !== undefined) {
      return id;
    }
  }
  return undefined;
}

/**
 * Finds the id a section holds: the last one in its inline text, for the sections that have any.
 *
 * @param content - The note's full text.
 * @param section - The section.
 * @param heading - The heading the section is, if it is one.
 * @returns The id.
 */
function findSectionBlockId(content: string, section: SectionCache, heading: HeadingCache | undefined): string | undefined {
  const text = content.slice(section.position.start.offset, section.position.end.offset);
  switch (section.type) {
    case 'comment': {
      return findInlineBlockId(getCommentText(text));
    }
    case 'footnoteDefinition': {
      return findFootnoteDefinitionBlockId(content.length > section.position.end.offset ? `${text}\n` : text);
    }
    case 'heading': {
      // Every heading section has its heading, at the same start.
      return findInlineBlockId(ensureNonNullable(heading).heading);
    }
    case 'paragraph': {
      return findInlineBlockId(text);
    }
    case 'table': {
      return findLastBlockId(text.split('\n').flatMap((row) => row.split('|').map((cell) => cell.trim())));
    }
    default: {
      return QUOTE_SECTION_TYPES.has(section.type) ? findLastBlockId(splitIntoBlocks(text.split('\n'))) : undefined;
    }
  }
}

/**
 * Finds what a comment block holds, which the worker tokenizes as inline content: the text past its opening `%%`, up to
 * its closing `%%`, or to its end when it has none.
 *
 * @param text - The comment section's text.
 * @returns What it holds.
 */
function getCommentText(text: string): string {
  const contentStart = text.indexOf(COMMENT_MARKER) + COMMENT_MARKER.length;
  const close = text.indexOf(COMMENT_MARKER, contentStart);
  return text.slice(contentStart, close === -1 ? text.length : close);
}

/**
 * Finds every list item nested in an item, at any depth: the items that start inside it, further right than it does. Its
 * `parent` cannot say, since a list nested in an item that holds nothing else is rooted at its own first line.
 *
 * @param item - The item.
 * @param listItems - Every list item of the note.
 * @returns The nested items.
 */
function getDescendants(item: ListItemCache, listItems: readonly ListItemCache[]): ListItemCache[] {
  const { end, start } = item.position;
  return listItems.filter((candidate) => candidate.position.start.offset > start.offset && candidate.position.start.offset < end.offset && candidate.position.start.col > start.col);
}

/**
 * Splits lines into the blocks whose text an id can end, in document order: an empty line ends a block, and a `>` line
 * after a line that is not one starts a blockquote, which takes every line after it up to an empty line, lazy ones
 * included. A blockquote is split the same way once its `>` prefixes are removed.
 *
 * @param lines - The lines.
 * @returns The blocks, each its lines joined with `\n`.
 */
function splitIntoBlocks(lines: readonly string[]): string[] {
  const groups: LineGroup[] = [];
  let current: LineGroup | undefined;
  for (const line of lines) {
    if (current?.isOpenComment) {
      current.lines.push(line);
      current.isOpenComment = !line.includes(COMMENT_MARKER);
      continue;
    }
    if (line.trim() === '') {
      current = undefined;
      continue;
    }
    const isQuoteLine = QUOTE_PREFIX_REGEX.test(line);
    const isCommentOpener = !isQuoteLine && COMMENT_OPENER_REGEX.test(line);
    if (!current || isCommentOpener || (isQuoteLine && current.kind !== 'quote')) {
      current = { isOpenComment: isCommentOpener, kind: isCommentOpener ? 'comment' : (isQuoteLine ? 'quote' : 'text'), lines: [] };
      groups.push(current);
    }
    current.lines.push(line);
  }
  return groups.flatMap((group) => group.kind === 'quote' ? splitIntoBlocks(group.lines.map((line) => line.replace(QUOTE_PREFIX_REGEX, ''))) : [group.lines.join('\n')]);
}
