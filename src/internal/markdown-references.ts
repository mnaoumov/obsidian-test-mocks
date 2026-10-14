/**
 * @file
 *
 * A note's footnotes, footnote references and link reference definitions, collected the way Obsidian's metadata worker
 * collects them. The worker reads them with `remark-footnotes` 2 (inline notes on) on top of `remark-parse` 8:
 *
 * - A link reference definition with a destination is a `referenceLinks` entry: its label as written, and its destination
 *   unescaped, with its character references decoded.
 * - A footnote definition is a `footnotes` entry, keyed by its label lower-cased.
 * - A footnote reference, `[^label]`, is a `footnoteRefs` entry, but only when some footnote definition carries its label;
 *   any other is plain text.
 * - An inline footnote, `^[text]`, is a `footnotes` entry whose position is its text's, keyed `[inline<n>`, where `n`
 *   counts the inline footnotes and the definitions first referenced before it. An empty one, `^[]`, is a `footnoteRefs`
 *   entry keyed `''` instead, at the whole of it.
 *
 * A definition counts wherever it is, a top-level section or a block inside a blockquote, a callout or a list item (see
 * `markdown-container-definitions.ts`).
 *
 * Approximated: references are found by a scan of the inline text of the sections that hold any, which knows escapes,
 * code spans and fenced code but none of the other inline constructs.
 */

import type {
  FootnoteCache,
  FootnoteRefCache,
  ListItemCache,
  Pos,
  ReferenceLinkCache,
  SectionCache
} from 'obsidian';

import { findContainerDefinitions } from './markdown-container-definitions.ts';
import { readDefinitionParts } from './markdown-gap-blocks.ts';
import { ensureNonNullable } from './type-guards.ts';

/**
 * What {@link collectReferences} needs.
 */
export interface CollectReferencesParams {
  /**
   * The ranges of the fenced code blocks, which hold no reference.
   */
  readonly codeZones: readonly (readonly [number, number])[];

  /**
   * The note's full text.
   */
  readonly content: string;

  /**
   * The note's list items, at every depth, which a definition can sit in.
   */
  readonly listItems: readonly ListItemCache[];

  /**
   * Builds a position from two offsets.
   */
  readonly makePos: (startOffset: number, endOffset: number) => Pos;

  /**
   * The note's top-level sections, sorted.
   */
  readonly sections: readonly SectionCache[];
}

/**
 * A footnote the note references, which Obsidian's worker copies into the footnote list it appends to the note.
 */
export interface FootnoteSource {
  /**
   * Whether it is a footnote definition, whose text is the whole definition, label included, and the line break after
   * it when the note goes on; otherwise it is an inline footnote, whose text is what it holds.
   */
  readonly isDefinition: boolean;

  /**
   * The footnote's text.
   */
  readonly text: string;
}

/**
 * What {@link collectReferences} finds.
 */
export interface NoteReferences {
  /**
   * The `footnoteRefs` collection.
   */
  readonly footnoteRefs: FootnoteRefCache[];

  /**
   * The `footnotes` collection.
   */
  readonly footnotes: FootnoteCache[];

  /**
   * The footnotes the note references, each once, in the order each is first referenced. When there is any, Obsidian's
   * worker appends a `text` and an `element` section to the note, the latter holding these.
   */
  readonly footnoteSources: FootnoteSource[];

  /**
   * The `referenceLinks` collection.
   */
  readonly referenceLinks: ReferenceLinkCache[];
}

/**
 * A definition the note holds, at the top level or inside a container.
 */
interface FoundDefinition {
  readonly end: number;
  readonly start: number;
  // Its text, with the prefixes of the containers holding it stripped from each line.
  readonly text: string;
  readonly type: string;
}

/**
 * The state of one scan of the note's inline text.
 */
interface ScanState {
  readonly definitions: ReadonlyMap<string, string>;
  readonly footnoteRefs: FootnoteRefCache[];
  readonly footnotes: SortableFootnote[];
  readonly footnoteSources: FootnoteSource[];
  readonly makePos: (startOffset: number, endOffset: number) => Pos;
  readonly referencedLabels: Set<string>;
}

/**
 * A `footnotes` entry and the offset of the node that holds it, which orders the collection.
 */
interface SortableFootnote {
  readonly footnote: FootnoteCache;
  readonly nodeStart: number;
}

const FOOTNOTE_DEFINITION_LABEL_REGEX = /^[ \t]*\[\^(?<label>[^\]]+)\]:/;
// A `\` escapes any ASCII punctuation character, and only those.
const ESCAPE_REGEX = /\\(?<char>[!-/:-@[-`{-~])/g;
// A decimal, a hexadecimal or a named character reference, closed by its `;`.
const CHARACTER_REFERENCE_REGEX = /&(?:#\d{1,7}|#[xX][\da-fA-F]{1,6}|[A-Za-z][A-Za-z\d]{0,31});/g;
const HEX_RADIX = 16;
const MAX_CODE_POINT = 0x10_FF_FF;
const REPLACEMENT_CHARACTER = '�';
const SURROGATE_START = 0xD8_00;
const SURROGATE_END = 0xDF_FF;
const ESCAPE_LENGTH = 2;
const INLINE_NOTE_OPENER = '^[';
const FOOTNOTE_REFERENCE_OPENER = '[^';
// The sections whose text Obsidian's worker reads inline content in.
const INLINE_SECTION_TYPES: ReadonlySet<string> = new Set([
  'blockquote',
  'callout',
  'footnoteDefinition',
  'heading',
  'list',
  'paragraph',
  'table'
]);

/**
 * Collects a note's footnotes, footnote references and link reference definitions.
 *
 * @param params - The note, its sections and fenced code blocks, and a way to build a position.
 * @returns The three collections, and the footnotes the note references.
 */
export function collectReferences(params: CollectReferencesParams): NoteReferences {
  const { codeZones, content, listItems, makePos, sections } = params;
  const referenceLinks: ReferenceLinkCache[] = [];
  const definitions = new Map<string, string>();
  const state: ScanState = {
    definitions,
    footnoteRefs: [],
    footnotes: [],
    footnoteSources: [],
    makePos,
    referencedLabels: new Set()
  };

  const topLevelDefinitions: FoundDefinition[] = sections.filter((section) => section.type === 'definition' || section.type === 'footnoteDefinition').map(
    (section) => ({
      end: section.position.end.offset,
      start: section.position.start.offset,
      text: content.slice(section.position.start.offset, section.position.end.offset),
      type: section.type
    })
  );
  const containerDefinitions = findContainerDefinitions({ content, listItems, sections });
  const allDefinitions = [...topLevelDefinitions, ...containerDefinitions].sort((a, b) => a.start - b.start);

  for (const { end, start, text, type } of allDefinitions) {
    const position = makePos(start, end);
    if (type === 'definition') {
      const { destination, label } = readDefinitionParts(text);
      // Obsidian's worker skips a definition whose destination comes out empty, which no definition the gap scan
      // accepts does: an empty pair of angle brackets is a definition only with a run after it, which is the destination.
      const link = decodeCharacterReferences(destination.replaceAll(ESCAPE_REGEX, '$<char>'));
      referenceLinks.push({ id: label, link, position });
    } else {
      const id = ensureNonNullable(FOOTNOTE_DEFINITION_LABEL_REGEX.exec(text)?.groups?.['label']).toLowerCase();
      // A later definition of a label replaces an earlier one as what a reference to it shows. The worker's definition
      // holds the line break after it when the note goes on.
      definitions.set(id, content.length > end ? `${text}\n` : text);
      state.footnotes.push({ footnote: { id, position }, nodeStart: start });
    }
  }

  // A definition inside a container sits in the text of the section holding it, which is scanned whole: its label is no
  // reference, and a link reference definition holds no inline text at all.
  const skippedZones = [
    ...codeZones,
    ...containerDefinitions.map(({ end, labelEnd, start, type }): [number, number] => [start, type === 'definition' ? end : labelEnd])
  ];
  for (const section of sections) {
    if (!INLINE_SECTION_TYPES.has(section.type)) {
      continue;
    }
    const { end, start } = section.position;
    const labelLength = section.type === 'footnoteDefinition' ? ensureNonNullable(FOOTNOTE_DEFINITION_LABEL_REGEX.exec(content.slice(start.offset))?.[0]).length : 0;
    scanInlineText(content, start.offset + labelLength, end.offset, skippedZones, state);
  }

  return {
    footnoteRefs: state.footnoteRefs,
    // The worker walks the parsed tree in document order, where a node comes before the nodes inside it.
    footnotes: state.footnotes.sort((a, b) => a.nodeStart - b.nodeStart).map(({ footnote }) => footnote),
    footnoteSources: state.footnoteSources,
    referenceLinks
  };
}

/**
 * Finds where an inline footnote closes, a port of the worker's tokenizer: the `]` that balances the opening `[`, with a
 * `\` escaping the character after it and the brackets inside a code span ignored.
 *
 * @param content - The note's full text.
 * @param contentStart - The offset just past the `^[`.
 * @param end - The offset the inline text ends at.
 * @returns The offset of the closing `]`, or `-1` when there is none.
 */
export function findInlineNoteClose(content: string, contentStart: number, end: number): number {
  let index = contentStart;
  let depth = 0;
  let codeRunLength: number | undefined;
  while (index < end) {
    const char = content[index];
    if (char === '`') {
      const runLength = measureBacktickRun(content, index, end);
      index += runLength;
      if (codeRunLength === undefined) {
        codeRunLength = runLength;
      } else if (codeRunLength === runLength) {
        codeRunLength = undefined;
      }
    } else if (codeRunLength === undefined) {
      switch (char) {
        case '[': {
          depth++;
          index++;

          break;
        }
        case ']': {
          if (depth === 0) {
            return index;
          }
          depth--;
          index++;

          break;
        }
        case '\\': {
          index += ESCAPE_LENGTH;

          break;
        }
        default: {
          index++;
        }
      }
    } else {
      index++;
    }
  }
  return -1;
}

/**
 * Finds the inline footnotes in inline text, the ones nested in another left out.
 *
 * @param text - The text.
 * @returns What each inline footnote holds, in document order.
 */
export function findInlineNoteTexts(text: string): string[] {
  const texts: string[] = [];
  let index = 0;
  while (index < text.length) {
    const close = text.startsWith(INLINE_NOTE_OPENER, index) ? findInlineNoteClose(text, index + INLINE_NOTE_OPENER.length, text.length) : -1;
    if (close === -1) {
      index = skipInlineCharacter(text, index, text.length);
    } else {
      texts.push(text.slice(index + INLINE_NOTE_OPENER.length, close));
      index = close + 1;
    }
  }
  return texts;
}

/**
 * Finds where a footnote reference's label ends: a non-empty run holding no space, tab or line break, and a `]`.
 *
 * @param content - The note's full text.
 * @param labelStart - The offset just past the `[^`.
 * @param end - The offset the inline text ends at.
 * @returns The offset of the closing `]`, or `-1` when there is none.
 */
export function findReferenceLabelEnd(content: string, labelStart: number, end: number): number {
  let index = labelStart;
  while (index < end && content[index] !== ']') {
    if ([' ', '\t', '\n'].includes(content.charAt(index))) {
      return -1;
    }
    index++;
  }
  return index === labelStart || index === end ? -1 : index;
}

/**
 * Measures a run of backticks.
 *
 * @param content - The text.
 * @param start - The offset the run starts at.
 * @param end - The offset the inline text ends at.
 * @returns How many backticks the run holds, `0` when `start` holds none.
 */
export function measureBacktickRun(content: string, start: number, end: number): number {
  let index = start;
  while (index < end && content[index] === '`') {
    index++;
  }
  return index - start;
}

/**
 * Decodes the character references in a destination: a decimal or hexadecimal one, and a named one the document knows.
 * One without its closing `;` stays as written, as it does in a destination in Obsidian.
 *
 * @param text - The text.
 * @returns The text, decoded.
 */
function decodeCharacterReferences(text: string): string {
  return text.replaceAll(CHARACTER_REFERENCE_REGEX, (reference) => {
    if (!reference.startsWith('&#')) {
      return decodeNamedReference(reference);
    }
    const isHex = /^&#x/i.test(reference);
    const codePoint = isHex ? Number.parseInt(reference.slice('&#x'.length, -1), HEX_RADIX) : Number(reference.slice('&#'.length, -1));
    const isValid = codePoint !== 0 && codePoint <= MAX_CODE_POINT && (codePoint < SURROGATE_START || codePoint > SURROGATE_END);
    return isValid ? String.fromCodePoint(codePoint) : REPLACEMENT_CHARACTER;
  });
}

/**
 * Decodes a named character reference through the document, which knows every name HTML does; the same list the worker
 * decodes from. Without a document, the reference stays as written.
 *
 * @param reference - The reference, `&` and `;` included.
 * @returns What it stands for.
 */
function decodeNamedReference(reference: string): string {
  if (typeof document === 'undefined') {
    return reference;
  }
  const textarea = document.createElement('textarea');
  // A `textarea` holds raw text, and the reference is one `&name;` match, so nothing in it can become markup.
  textarea.innerHTML = reference;
  return textarea.value;
}

function isInCodeZone(codeZones: readonly (readonly [number, number])[], offset: number): boolean {
  return codeZones.some(([start, end]) => offset >= start && offset < end);
}

/**
 * Records an inline footnote.
 *
 * @param state - The scan's state.
 * @param noteStart - The offset of its `^`.
 * @param contentStart - The offset just past its `^[`.
 * @param close - The offset of its closing `]`.
 * @param content - The note's full text.
 */
function recordInlineNote(state: ScanState, noteStart: number, contentStart: number, close: number, content: string): void {
  const counter = state.footnoteSources.length;
  state.footnoteSources.push({ isDefinition: false, text: content.slice(contentStart, close) });
  if (close === contentStart) {
    // An empty inline footnote has no text to point at, so the worker keeps it as a reference with no label.
    state.footnoteRefs.push({ id: '', position: state.makePos(noteStart, close + 1) });
    return;
  }
  state.footnotes.push({ footnote: { id: `[inline${String(counter)}`, position: state.makePos(contentStart, close) }, nodeStart: noteStart });
}

/**
 * Scans inline text for footnote references and inline footnotes. An inline footnote is skipped whole once read, so a
 * reference inside it is no reference, as in Obsidian.
 *
 * @param content - The note's full text.
 * @param start - The offset the inline text starts at.
 * @param end - The offset it ends at.
 * @param codeZones - The ranges of the fenced code blocks.
 * @param state - The scan's state.
 */
function scanInlineText(content: string, start: number, end: number, codeZones: readonly (readonly [number, number])[], state: ScanState): void {
  let index = start;
  while (index < end) {
    const noteClose = content.startsWith(INLINE_NOTE_OPENER, index) ? findInlineNoteClose(content, index + INLINE_NOTE_OPENER.length, end) : -1;
    const labelEnd = content.startsWith(FOOTNOTE_REFERENCE_OPENER, index) ? findReferenceLabelEnd(content, index + FOOTNOTE_REFERENCE_OPENER.length, end) : -1;
    if (isInCodeZone(codeZones, index)) {
      index++;
    } else if (noteClose !== -1) {
      recordInlineNote(state, index, index + INLINE_NOTE_OPENER.length, noteClose, content);
      index = noteClose + 1;
    } else if (labelEnd === -1) {
      index = skipInlineCharacter(content, index, end);
    } else {
      const id = content.slice(index + FOOTNOTE_REFERENCE_OPENER.length, labelEnd).toLowerCase();
      const definition = state.definitions.get(id);
      // A reference to a label no definition carries is plain text.
      if (definition !== undefined) {
        state.footnoteRefs.push({ id, position: state.makePos(index, labelEnd + 1) });
        if (!state.referencedLabels.has(id)) {
          state.referencedLabels.add(id);
          state.footnoteSources.push({ isDefinition: true, text: definition });
        }
      }
      index = labelEnd + 1;
    }
  }
}

/**
 * Skips a code span: a run of backticks, the text up to the next run of the same length, and that run. A run with no
 * such closing run is plain text.
 *
 * @param content - The note's full text.
 * @param start - The offset of the opening run.
 * @param end - The offset the inline text ends at.
 * @returns The offset past the span, or past the opening run when it closes nowhere.
 */
function skipCodeSpan(content: string, start: number, end: number): number {
  const runLength = measureBacktickRun(content, start, end);
  let index = start + runLength;
  while (index < end) {
    if (content[index] === '`') {
      const closingLength = measureBacktickRun(content, index, end);
      if (closingLength === runLength) {
        return index + closingLength;
      }
      index += closingLength;
    } else {
      index++;
    }
  }
  return start + runLength;
}

/**
 * Steps past one piece of inline text that holds no footnote: an escape, a code span, or a single character.
 *
 * @param text - The text.
 * @param index - The offset of the piece.
 * @param end - The offset the inline text ends at.
 * @returns The offset past the piece.
 */
function skipInlineCharacter(text: string, index: number, end: number): number {
  switch (text[index]) {
    case '\\': {
      return index + ESCAPE_LENGTH;
    }
    case '`': {
      return skipCodeSpan(text, index, end);
    }
    default: {
      return index + 1;
    }
  }
}
