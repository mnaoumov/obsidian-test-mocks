/**
 * @file
 *
 * The link reference definitions and footnote definitions a note holds inside its containers: its blockquotes,
 * callouts, list items and footnote definitions, at any depth. Obsidian's metadata worker walks the whole parsed tree
 * for them, so a definition inside a container counts as one at the top level does.
 *
 * Each container's text is read with its prefix stripped from every line, the way `remark-parse` 8 reads a container's
 * blocks:
 *
 * - A blockquote's `>` and the one space after it. A callout's first line, its header, is left out.
 * - On a list item's first line, its marker, the whitespace up to its content column and its checkbox. On its later
 *   lines, the least indent among the ones indented past the item's container, up to the marker's width with the spaces
 *   after it, which is one column wider than the content for a widened ordered marker.
 * - On a footnote definition's first line, its label and the whitespace after it. On its later lines, up to four
 *   columns of whitespace.
 *
 * The stripped text goes through the same block scan the top level does, so a definition still cannot interrupt a
 * paragraph, and a blockquote or a footnote definition found there is read the same way in turn. A list item is read by
 * itself, from the parser's own list items, and a definition the scan of an enclosing container finds inside one is left
 * to it.
 *
 * Approximated: a list inside a footnote definition is not one the parser finds, so a definition in its items is missed.
 */

import type {
  ListItemCache,
  SectionCache
} from 'obsidian';

import { ensureNonNullable } from '../type-guards.ts';
import { scanGapBlocks } from './markdown-gap-blocks.ts';
import {
  getBulletWidth,
  getItemContentColumn
} from './markdown-leaf-blocks.ts';

/**
 * A definition found inside a container.
 */
export interface ContainerDefinition {
  /**
   * The offset just past it, in the note.
   */
  readonly end: number;

  /**
   * The offset of the end of its label, the `:` included, in the note; the label of a footnote definition is no
   * reference to it.
   */
  readonly labelEnd: number;

  /**
   * The offset it starts at, in the note.
   */
  readonly start: number;

  /**
   * Its text, with the containers' prefixes stripped from each line.
   */
  readonly text: string;

  /**
   * Its section type, as the top level reports it.
   */
  readonly type: 'definition' | 'footnoteDefinition';
}

/**
 * What {@link findContainerDefinitions} needs.
 */
export interface FindContainerDefinitionsParams {
  /**
   * The note's full text.
   */
  readonly content: string;

  /**
   * The note's list items, at every depth.
   */
  readonly listItems: readonly ListItemCache[];

  /**
   * The note's top-level sections.
   */
  readonly sections: readonly SectionCache[];
}

/**
 * One line of a container's text, its prefix stripped.
 */
interface ContainerLine {
  // The offset in the note of the line's first character after the prefix.
  readonly offset: number;
  readonly text: string;
}

/**
 * A container's range in the note, the start excluded: a list item starting inside it is read by itself.
 */
interface OffsetRange {
  readonly end: number;
  readonly start: number;
}

const CALLOUT_TYPE = 'callout';
const QUOTE_SECTION_TYPES: ReadonlySet<string> = new Set(['blockquote', CALLOUT_TYPE]);
const FOOTNOTE_DEFINITION_TYPE = 'footnoteDefinition';
const DEFINITION_TYPES: ReadonlySet<string> = new Set(['definition', FOOTNOTE_DEFINITION_TYPE]);
// How far a footnote definition's later lines are stripped.
const FOOTNOTE_CONTENT_COLUMN = 4;
const QUOTE_LEVEL_REGEX = /^[ \t]*> ?/;
const LIST_MARKER_REGEX = /^(?:[-*+]|\d{1,9}[.)])/;
// A task item's checkbox, which `remark-parse` 8 takes off the item's text only when whitespace follows it.
const CHECKBOX_REGEX = /^\[[ \txX]\][ \t]/;
const LABEL_END_REGEX = /^[ \t]*\[(?:\\.|[^\\\]])*\]:/;
const TAB_SIZE = 4;

/**
 * Finds the definitions a note holds inside its blockquotes, callouts and list items.
 *
 * @param params - The note, its top-level sections and its list items.
 * @returns The definitions, in no particular order.
 */
export function findContainerDefinitions(params: FindContainerDefinitionsParams): ContainerDefinition[] {
  const { content, listItems, sections } = params;
  const lines = splitLines(content);
  const definitions = new Map<number, ContainerDefinition>();

  for (const section of sections) {
    const { end, start } = section.position;
    const sectionLines = lines.slice(start.line, end.line + 1);
    const container = { end: end.offset, start: start.offset };
    if (QUOTE_SECTION_TYPES.has(section.type)) {
      scanContainer(readQuoteLines(sectionLines, section.type), container, listItems, definitions);
    } else if (section.type === FOOTNOTE_DEFINITION_TYPE) {
      scanContainer(readFootnoteLines(sectionLines), container, listItems, definitions);
    }
  }

  for (const item of listItems) {
    scanContainer(readItemLines(lines, item), { end: item.position.end.offset, start: item.position.start.offset }, listItems, definitions);
  }

  return [...definitions.values()];
}

/**
 * Measures the visual column a line reaches at an offset, a tab advancing to the next multiple of four.
 *
 * @param text - The line.
 * @param end - The offset.
 * @returns The column.
 */
function getColumn(text: string, end: number): number {
  let column = 0;
  for (const char of text.slice(0, end)) {
    column = char === '\t' ? column + TAB_SIZE - column % TAB_SIZE : column + 1;
  }
  return column;
}

/**
 * Checks whether a list item starts inside a container, so that the item, not the container, reads its blocks.
 *
 * @param item - The list item.
 * @param container - The container's range.
 * @returns Whether it does.
 */
function isItemInside(item: ListItemCache, container: OffsetRange): boolean {
  return item.position.start.offset > container.start && item.position.start.offset <= container.end;
}

/**
 * Maps an offset in a container's stripped text back to the note.
 *
 * @param lines - The container's lines.
 * @param lineStarts - The offset each line starts at in the stripped text.
 * @param offset - The offset in the stripped text.
 * @returns The offset in the note.
 */
function mapOffset(lines: readonly ContainerLine[], lineStarts: readonly number[], offset: number): number {
  let lineIndex = lineStarts.length - 1;
  while (ensureNonNullable(lineStarts[lineIndex]) > offset) {
    lineIndex--;
  }
  return ensureNonNullable(lines[lineIndex]).offset + offset - ensureNonNullable(lineStarts[lineIndex]);
}

/**
 * Reads a footnote definition's lines, each stripped of its prefix: on its first line, its label and the whitespace after
 * it; on its later lines, up to four columns of whitespace.
 *
 * @param lines - The definition's lines, its first from its line start.
 * @returns The definition's lines.
 */
function readFootnoteLines(lines: readonly ContainerLine[]): ContainerLine[] {
  return lines.map((line, lineIndex) => {
    const index = lineIndex === 0
      ? skipWhitespace(line.text, ensureNonNullable(LABEL_END_REGEX.exec(line.text))[0].length, Infinity)
      : skipWhitespace(line.text, 0, FOOTNOTE_CONTENT_COLUMN);
    return { offset: line.offset + index, text: line.text.slice(index) };
  });
}

/**
 * Reads a list item's lines, each stripped of the item's prefix: on its first line, everything up to its content and its
 * checkbox; on its later lines, the quote levels the item sits in and the whitespace up to the width Obsidian strips.
 *
 * @param lines - The note's lines.
 * @param item - The list item.
 * @returns The item's lines.
 */
function readItemLines(lines: readonly ContainerLine[], item: ListItemCache): ContainerLine[] {
  const { end, start } = item.position;
  const firstLine = ensureNonNullable(lines[start.line]);
  const markerStart = skipWhitespace(firstLine.text, start.col, Infinity);
  const markerEnd = markerStart + ensureNonNullable(LIST_MARKER_REGEX.exec(firstLine.text.slice(markerStart)))[0].length;
  const afterMarker = firstLine.text.slice(markerEnd);
  let contentStart = skipWhitespace(firstLine.text, markerEnd, getItemContentColumn(getColumn(firstLine.text, markerEnd), afterMarker));
  contentStart += CHECKBOX_REGEX.exec(firstLine.text.slice(contentStart))?.[0].length ?? 0;
  const quoteDepth = firstLine.text.slice(0, start.col).split('>').length - 1;
  const marker = firstLine.text.slice(markerStart, markerEnd);

  // The later lines past the quote levels the item sits in.
  const laterLines = lines.slice(start.line + 1, end.line + 1).map((line) => {
    let index = 0;
    for (let level = 0; level < quoteDepth; level++) {
      index += QUOTE_LEVEL_REGEX.exec(line.text.slice(index))?.[0].length ?? 0;
    }
    return { index, line };
  });
  // `remark-parse` 8 strips the later lines to the least indent among the ones indented past the item's container.
  const containerColumn = getColumn(firstLine.text, start.col);
  const indents = laterLines.map(({ index, line }) => getColumn(line.text, skipWhitespace(line.text, index, Infinity)))
    .filter((indent, lineIndex) => indent > containerColumn && ensureNonNullable(laterLines[lineIndex]).line.text.trim() !== '');
  const stripColumn = Math.min(getColumn(firstLine.text, markerStart) + getBulletWidth(markerStart - start.col, marker, afterMarker), ...indents);

  const itemLines: ContainerLine[] = [{ offset: firstLine.offset + contentStart, text: firstLine.text.slice(contentStart) }];
  for (const { index, line } of laterLines) {
    const contentIndex = skipWhitespace(line.text, index, stripColumn);
    itemLines.push({ offset: line.offset + contentIndex, text: line.text.slice(contentIndex) });
  }
  return itemLines;
}

/**
 * Reads a blockquote's or a callout's lines, each stripped of one quote level. A callout's first line is its header,
 * which Obsidian reads as no block of the callout's content.
 *
 * @param lines - The blockquote's lines.
 * @param type - Its section type.
 * @returns The lines of its content.
 */
function readQuoteLines(lines: readonly ContainerLine[], type: string): ContainerLine[] {
  return lines.slice(type === CALLOUT_TYPE ? 1 : 0).map((line) => stripQuoteLevel(line));
}

/**
 * Scans a container's lines for definitions, and the blockquotes among its blocks in turn.
 *
 * @param lines - The container's lines, its prefix stripped.
 * @param container - The container's range in the note.
 * @param listItems - The note's list items.
 * @param definitions - The definitions found so far, by their start, which this adds to.
 */
function scanContainer(
  lines: readonly ContainerLine[],
  container: OffsetRange,
  listItems: readonly ListItemCache[],
  definitions: Map<number, ContainerDefinition>
): void {
  const text = lines.map((line) => line.text).join('\n');
  const lineStarts: number[] = [];
  let lineStart = 0;
  for (const line of lines) {
    lineStarts.push(lineStart);
    lineStart += line.text.length + 1;
  }

  for (const block of scanGapBlocks(text, false)) {
    const start = mapOffset(lines, lineStarts, block.start);
    const firstLine = lineStarts.filter((offset) => offset <= block.start).length - 1;
    const blockLines = lines.slice(firstLine, lineStarts.filter((offset) => offset < block.end).length);
    if (QUOTE_SECTION_TYPES.has(block.type)) {
      scanContainer(readQuoteLines(blockLines, block.type), container, listItems, definitions);
      continue;
    }
    const isInItem = listItems.some((item) => isItemInside(item, container) && start >= item.position.start.offset && start <= item.position.end.offset);
    if (!DEFINITION_TYPES.has(block.type) || isInItem) {
      continue;
    }
    const blockText = text.slice(block.start, block.end);
    definitions.set(start, {
      end: mapOffset(lines, lineStarts, block.end),
      labelEnd: start + ensureNonNullable(LABEL_END_REGEX.exec(blockText))[0].length,
      start,
      text: blockText,
      type: block.type === FOOTNOTE_DEFINITION_TYPE ? FOOTNOTE_DEFINITION_TYPE : 'definition'
    });
    if (block.type === FOOTNOTE_DEFINITION_TYPE) {
      scanContainer(readFootnoteLines(blockLines), container, listItems, definitions);
    }
  }
}

/**
 * Skips whitespace up to a visual column.
 *
 * @param text - The line.
 * @param start - The offset to start at.
 * @param column - The column to stop at.
 * @returns The offset past the whitespace skipped.
 */
function skipWhitespace(text: string, start: number, column: number): number {
  let index = start;
  while ((text[index] === ' ' || text[index] === '\t') && getColumn(text, index) < column) {
    index++;
  }
  return index;
}

/**
 * Splits a note into its lines.
 *
 * @param content - The note's full text.
 * @returns Its lines, without their line breaks.
 */
function splitLines(content: string): ContainerLine[] {
  const lines: ContainerLine[] = [];
  let offset = 0;
  for (const text of content.split('\n')) {
    lines.push({ offset, text });
    offset += text.length + 1;
  }
  return lines;
}

/**
 * Strips one blockquote level from a line: a `>` and the one space after it. A line with none is a lazy line of the
 * blockquote, kept whole.
 *
 * @param line - The line.
 * @returns The line, stripped.
 */
function stripQuoteLevel(line: ContainerLine): ContainerLine {
  const prefixLength = QUOTE_LEVEL_REGEX.exec(line.text)?.[0].length ?? 0;
  return { offset: line.offset + prefixLength, text: line.text.slice(prefixLength) };
}
