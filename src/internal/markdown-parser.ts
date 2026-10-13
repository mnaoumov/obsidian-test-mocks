/**
 * @file
 *
 * A small regex-based markdown parser that builds the `CachedMetadata` the `MetadataCache` mock serves: frontmatter,
 * headings, tags, links, embeds, list items and sections.
 */

import type {
  CachedMetadata,
  EmbedCache,
  FrontmatterLinkCache,
  HeadingCache,
  LinkCache,
  ListItemCache,
  Loc,
  Pos,
  SectionCache,
  TagCache
} from 'obsidian';

import type { LeafBlockScan } from './markdown-leaf-blocks.ts';

import { getFrontMatterInfo } from '../obsidian/functions/getFrontMatterInfo.ts';
import { parseYaml } from '../obsidian/functions/parseYaml.ts';
import {
  decodeUriSafely,
  isInternalLinkTarget,
  normalizeLinkTarget
} from './link-target.ts';
import {
  scanGapBlocks,
  tokenizeAtxHeading
} from './markdown-gap-blocks.ts';
import {
  getBulletWidth,
  scanLeafBlocks
} from './markdown-leaf-blocks.ts';
import { ensureNonNullable } from './type-guards.ts';

/**
 * A wikilink's inner text split as Obsidian splits it.
 */
interface WikilinkTarget {
  /**
   * The target to resolve, with a trailing escape and any non-breaking space already folded away.
   */
  href: string;

  /**
   * The text the link shows.
   */
  title: string;
}

/**
 * Obsidian's own markdown-link regex, applied to a WHOLE frontmatter value. Its shape is what decides
 * which part of `[text](Target.md "title")` is the target: the optional title is a group of its own, so
 * the target never swallows it. Only `displayText` and `target` are read; the rest carry names because
 * the structure is Obsidian's and this is the only place it is written down.
 */
const FRONTMATTER_DELIMITER = '---';

const FRONTMATTER_MARKDOWN_LINK_REGEX = /^(?<open>!?\[)(?<displayText>.*?)(?<separator>]\(\s*)(?<targetAndTitle>(?<target><[^>]*?>|[^ "]+?)(?<spacedTitle>\s+(?<title>[^ ]+|"[^"]+"|'[^']+'|\([^']+\)))?)?(?<close>\s*\))$/;

/**
 * A non-breaking space, which Obsidian folds into an ordinary one before it resolves a link target.
 */

const WIKILINK_CLOSE = ']]';

const WIKILINK_OPEN = '[[';

/**
 * The lines between two items of a list, as the list's container sees them.
 */
interface ContainerLines {
  // Whether a line that leaves the list's blockquote ended the list before the last of the raw lines.
  readonly isCut: boolean;
  // The lines inside the container, each with the container's quote prefix removed.
  readonly lines: string[];
}

/**
 * What {@link getContainerLines} needs.
 */
interface GetContainerLinesParams {
  // The number of `>` levels the list sits in.
  readonly depth: number;
  // The note's line number of the first raw line.
  readonly firstLine: number;
  // The lines, as they are in the note.
  readonly rawLines: string[];
  readonly scan: LeafBlockScan;
}

/**
 * What {@link getListItemParent} needs.
 */
interface GetListItemParentParams {
  readonly item: ListItemCache;
  // The kind of the item's marker (see `getListMarkerKind`).
  readonly kind: string;
  // The first line of the item's list.
  readonly listFirstLine: number;
  // The open item the item is nested in, if any.
  readonly parentItem: OpenListItem | undefined;
}

/**
 * What {@link getListState} needs.
 */
interface GetListStateParams {
  readonly content: string;
  readonly depth: number;
  // The line of the item, which the deeper lists it finishes end before.
  readonly endLine: number;
  readonly lineStarts: number[];
  readonly scan: LeafBlockScan;
  readonly sections: SectionCache[];
  readonly states: Map<number, ListState>;
}

/**
 * A line that holds a list item.
 */
interface ListItemLine {
  // The number of `>` levels before the item.
  readonly depth: number;
  // The list-item match, against the text past the quote prefix.
  readonly match: RegExpExecArray;
  // The length of the quote prefix.
  readonly prefixLength: number;
}

/**
 * The lines between two items of a list, as {@link closeListItems} reads them.
 */
interface ListLines {
  // The offset just past each line, line break excluded.
  readonly ends: number[];
  // The note's line number of the first line.
  readonly firstLine: number;
  // Each line, with the container's quote prefix removed.
  readonly lines: string[];
  // What the leaf-block pre-pass found.
  readonly scan: LeafBlockScan;
  // The offset each line starts at once the quote prefix is removed.
  readonly starts: number[];
}

/**
 * The list currently open at one blockquote depth. Each depth keeps its own, since a list never spans two containers:
 * a quoted list inside an item of an outer list leaves that outer list open around it.
 */
interface ListState {
  // The number of `>` levels the list sits in; `0` for a list outside any blockquote.
  readonly depth: number;
  // The first line of the list, which its root items are parented to.
  firstLine: number;
  // The end offset of the list's section so far; only a depth-0 list has a section.
  groupEnd: number;
  // The offset the list's section starts at.
  groupStart: number;
  // The kind of the list's top-level markers (see `getListMarkerKind`).
  kind: string;
  // The stack of open items, root first.
  readonly openItems: OpenListItem[];
  // The line of the list's latest item.
  previousLine: number;
  // What the leaf-block pre-pass found.
  readonly scan: LeafBlockScan;
}

/**
 * The line of an item nested directly in an open list item.
 */
interface NestedItemLine {
  readonly cache: ListItemCache;
  // The visual column of each character of the line's leading whitespace past its quote prefix, and the column past it.
  readonly indentColumns: number[];
  // The offset just past the line's quote prefix.
  readonly textStart: number;
}

/**
 * A list nested in an open list item.
 */
interface NestedList {
  // The list's first line, which its items are rooted at unless they name the item as their parent.
  readonly firstLine: number;
  readonly items: ListItemCache[];
  // The kind of the list's markers (see `getListMarkerKind`); an item of another kind starts a list of its own.
  readonly kind: string;
}

interface OpenListItem {
  // Where the item would end if a sibling item followed it after the blank lines seen since its last value line: the
  // start of the first of them, past the containers' prefix. `undefined` while no such blank line has been seen.
  blankLineEnd: number | undefined;
  // The end of the item's last child that is not a list, or `-1` while it has none.
  blockEnd: number;
  // The item in the cache, whose end is written when the item closes.
  readonly cache: ListItemCache;
  // How many child blocks the item holds: its first paragraph, each nested list and each later block.
  childCount: number;
  // The lines of the items nested directly in the item, whose start is moved when the item closes.
  readonly childLines: NestedItemLine[];
  // The content column of the item's container, which a blank line's whitespace is part of the prefix up to.
  readonly containerColumn: number;
  readonly contentColumn: number;
  // Whether the item's last block is a fenced code block, a comment or a math block that no line has closed yet.
  isInHidingBlock: boolean;
  readonly line: number;
  // The lists nested in the item since its last block that is not a list, whose items are parented when the item
  // closes, or re-rooted when a block follows them inside the item.
  readonly nestedLists: NestedList[];
  // The visual column up to which Obsidian strips each later line of the item before it reads the item's blocks: the
  // least indent of those lines past the item's container, and at most the width of the item's marker.
  removalColumn: number;
  // The end of the item's last value line: any line it holds, a nested item's included, or a blank line indented at
  // least as far as its content.
  valueEnd: number;
}

/**
 * What {@link recordBlankListLine} needs.
 */
interface RecordBlankListLineParams {
  // The visual column of each character of the line's leading whitespace, and the column past it.
  readonly indentColumns: number[];
  readonly lineEnd: number;
  readonly lineStart: number;
  readonly openItems: OpenListItem[];
}

/**
 * Parses markdown content into a `CachedMetadata` object.
 *
 * This approximates Obsidian's parser rather than reproducing it: tags, links and embeds are found by regular
 * expressions outside fenced code blocks and inline code spans, and the blocks between the recognized sections are read
 * by a port of the block tokenizers Obsidian's metadata worker runs (see `markdown-gap-blocks.ts`).
 *
 * Obsidian takes `\r\n`, `\n` and a lone `\r` as one line break each, and reports every position in the original text,
 * with a line ending before its `\r`. So a note holding a `\r` is parsed with its line breaks turned into `\n`, which
 * keeps every line and every column, and each position is then moved to the same line and column of the original.
 *
 * @param content - The note's full text, frontmatter included.
 * @returns The metadata, with each collection present only when it is non-empty.
 */
export function parseMarkdownContent(content: string): CachedMetadata {
  if (!content.includes('\r')) {
    return parseLfContent(content);
  }

  const cache = parseLfContent(content.replaceAll(/\r\n?/g, '\n'));
  const lineStarts = buildOriginalLineStarts(content);
  const positions = [
    ...cache.embeds ?? [],
    ...cache.headings ?? [],
    ...cache.links ?? [],
    ...cache.listItems ?? [],
    ...cache.sections ?? [],
    ...cache.tags ?? []
  ].map((entry) => entry.position);
  if (cache.frontmatterPosition) {
    positions.push(cache.frontmatterPosition);
  }
  for (const pos of positions) {
    pos.start = moveLocToOriginal(lineStarts, pos.start);
    pos.end = moveLocToOriginal(lineStarts, pos.end);
  }
  // A link's text may span a line break, which the original spells with its `\r`.
  for (const reference of [...cache.embeds ?? [], ...cache.links ?? []]) {
    reference.original = content.slice(reference.position.start.offset, reference.position.end.offset);
  }
  return cache;
}

/**
 * Adds a section for each block between two sections found earlier, and a heading for each heading among them.
 *
 * @param content - The note's full text.
 * @param gapStart - The offset the gap starts at.
 * @param gapEnd - The offset just past the gap.
 * @param lineStarts - The offset each line starts at.
 * @param sections - The collection each section is pushed onto.
 * @param headings - The collection each heading is pushed onto.
 */
function addGapSections(
  content: string,
  gapStart: number,
  gapEnd: number,
  lineStarts: number[],
  sections: SectionCache[],
  headings: HeadingCache[]
): void {
  for (const block of scanGapBlocks(content.slice(gapStart, gapEnd))) {
    const position = makePos(lineStarts, gapStart + block.start, gapStart + block.end);
    sections.push({ id: undefined, position, type: block.type });
    if (block.heading) {
      headings.push({
        heading: block.heading.text,
        level: block.heading.level,
        position: makePos(lineStarts, gapStart + block.start, gapStart + block.end)
      });
    }
  }
}

/**
 * Builds an array of [start, end] offset ranges that represent code zones
 * (fenced code blocks and inline code spans) where tags/links should not be parsed.
 *
 * @param content - The note's full text.
 * @returns The zones as `[start, end)` offset pairs, fenced blocks first, then inline spans.
 */
function buildCodeZones(content: string): [number, number][] {
  const zones: [number, number][] = [];

  // Fenced code blocks: ``` or ~~~, inside a blockquote too, closed by a fence carrying the same quote prefix
  const fencedRegex = /^(?<quote>(?:[ \t]*> ?)*)(?<fence>`{3,}|~{3,}).*\n[\s\S]*?^\k<quote>\k<fence>\s*$/gm;
  let match = fencedRegex.exec(content);
  while (match) {
    zones.push([match.index, match.index + match[0].length]);
    match = fencedRegex.exec(content);
  }

  // Inline code spans: `...`
  const inlineRegex = /`[^`\n]+`/g;
  match = inlineRegex.exec(content);
  while (match) {
    zones.push([match.index, match.index + match[0].length]);
    match = inlineRegex.exec(content);
  }

  return zones;
}

/**
 * Precomputes an array of character offsets for each line start in the content.
 * `lineStarts[i]` is the offset of the first character on line `i`.
 *
 * @param content - The note's full text.
 * @returns The line start offsets, beginning with `0`.
 */
function buildLineStarts(content: string): number[] {
  const starts: number[] = [0];
  // eslint-disable-next-line unicorn/no-for-loop -- `i` has to be a UTF-16 CODE UNIT offset, since that is what every other offset in the parser is. Iterating the string with `for…of` walks code POINTS, so a surrogate pair would shift every line start after it.
  for (let index = 0; index < content.length; index++) {
    if (content[index] === '\n') {
      starts.push(index + 1);
    }
  }
  return starts;
}

/**
 * Computes the offset each line of a note starts at, taking `\r\n`, `\n` and a lone `\r` as one line break each.
 *
 * @param content - The note's full text.
 * @returns The line start offsets, beginning with `0`.
 */
function buildOriginalLineStarts(content: string): number[] {
  const starts: number[] = [0];
  for (const match of content.matchAll(/\r\n?|\n/g)) {
    starts.push(match.index + match[0].length);
  }
  return starts;
}

/**
 * Reads ONE frontmatter string as a link, as Obsidian does.
 *
 * A frontmatter link is the WHOLE value rather than something found inside it, which is the difference
 * that makes `see [[Target]] later` no link at all. Two shapes qualify: a wikilink, wrapped in `[[` and
 * `]]`, and a markdown link whose target is internal.
 *
 * @param key - The dotted path of the value within the frontmatter.
 * @param value - The string value.
 * @param links - The collection each find is pushed onto.
 */
function collectFrontmatterLink(key: string, value: string, links: FrontmatterLinkCache[]): void {
  if (value.startsWith(WIKILINK_OPEN) && value.endsWith(WIKILINK_CLOSE)) {
    const { href, title } = parseWikilinkTarget(value.slice(WIKILINK_OPEN.length, -WIKILINK_CLOSE.length));
    links.push({ displayText: title, key, link: href, original: value });
  }

  if (!value.startsWith('[') || !value.endsWith(')')) {
    return;
  }

  const match = FRONTMATTER_MARKDOWN_LINK_REGEX.exec(value);
  if (!match) {
    return;
  }
  const rawTarget = match.groups?.['target'];
  // Obsidian reads that group unguarded, so a value of `[text]()` — which matches with the group
  // unmatched — throws a `TypeError` out of its metadata parse. Reading it as no link is the one
  // deliberate divergence here: reproducing the throw would lose the whole note's metadata.
  if (rawTarget === undefined) {
    return;
  }
  const target = rawTarget.startsWith('<') && rawTarget.endsWith('>') ? rawTarget.slice(1, -1).trim() : rawTarget;
  if (!isInternalLinkTarget(target)) {
    return;
  }
  links.push({
    displayText: ensureNonNullable(match.groups?.['displayText']),
    key,
    link: decodeUriSafely(target),
    original: value
  });
}

function extractFrontmatterLinks(frontmatter: object): FrontmatterLinkCache[] {
  const links: FrontmatterLinkCache[] = [];
  visitFrontmatterValue('', frontmatter, links);
  return links;
}

function isInCodeZone(zones: [number, number][], offset: number): boolean {
  return zones.some(([start, end]) => offset >= start && offset < end);
}

function makePos(lineStarts: number[], startOffset: number, endOffset: number): Pos {
  return {
    end: offsetToLoc(lineStarts, endOffset),
    start: offsetToLoc(lineStarts, startOffset)
  };
}

/**
 * Moves a location in the text with its line breaks turned into `\n` to the same line and column of the original.
 *
 * @param lineStarts - The offset each line of the original starts at.
 * @param loc - The location.
 * @returns The location in the original.
 */
function moveLocToOriginal(lineStarts: number[], loc: Loc): Loc {
  return { col: loc.col, line: loc.line, offset: ensureNonNullable(lineStarts[loc.line]) + loc.col };
}

function offsetToLoc(lineStarts: number[], offset: number): Loc {
  let low = 0;
  let high = lineStarts.length - 1;
  const BINARY_SEARCH_DIVISOR = 2;
  while (low < high) {
    const mid = Math.floor((low + high + 1) / BINARY_SEARCH_DIVISOR);
    if (lineStarts[mid] !== undefined && lineStarts[mid] <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  const lineStart = ensureNonNullable(lineStarts[low]);
  return { col: offset - lineStart, line: low, offset };
}

function parseEmbeds(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  codeZones: [number, number][]
): EmbedCache[] {
  const embeds: EmbedCache[] = [];

  // Wiki embeds: ![[link]] or ![[link|display]]
  const wikiRegex = /!\[\[(?<link>[^\]|]+?)(?:\|(?<display>[^\]]*?))?\]\]/g;
  wikiRegex.lastIndex = bodyStart;
  let match = wikiRegex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const link = ensureNonNullable(match.groups?.['link']);
      const display = match.groups?.['display'];
      embeds.push({
        displayText: display ?? link,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length)
      });
    }
    match = wikiRegex.exec(content);
  }

  // Markdown embeds: ![alt](url)
  const mdRegex = /!\[(?<alt>[^\]]*)\]\((?<url>[^)]+)\)/g;
  mdRegex.lastIndex = bodyStart;
  match = mdRegex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const displayText = ensureNonNullable(match.groups?.['alt']);
      const link = ensureNonNullable(match.groups?.['url']);
      embeds.push({
        displayText,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length)
      });
    }
    match = mdRegex.exec(content);
  }

  return embeds;
}

function parseFrontmatter(
  content: string,
  lineStarts: number[],
  cache: CachedMetadata,
  sections: SectionCache[]
): number {
  const info = getFrontMatterInfo(content);
  if (!info.exists) {
    return 0;
  }

  const parsed = parseFrontmatterYaml(info.frontmatter);
  // Both positions end at the end of the closing `---`, not at the start of the line after it, as Obsidian's metadata
  // worker reports them. `to` is where that delimiter starts, so the block's end is three characters later. The body
  // still starts at `contentStart`, past the line break.
  const endOffset = info.to + FRONTMATTER_DELIMITER.length;

  // A block that does not parse to a plain object leaves NO `frontmatter` and NO `frontmatterPosition`
  // behind - not an empty record, which is what a consumer branching on `cache.frontmatter` would read as
  // a note that HAS frontmatter. Obsidian writes both keys behind the same guard, so a scalar block, a
  // YAML SEQUENCE, invalid YAML and an empty one all read exactly like a note with no frontmatter at all.
  // The `yaml` SECTION below is pushed regardless, as Obsidian's own sections loop does.
  //
  // `!Array.isArray(parsed)` is the sequence half, and it is not defensive: an array passes
  // `typeof parsed === 'object'`, and Obsidian's own frontmatter parse excludes it by name -
  // `if (n && "object" == typeof n && !Array.isArray(n))` - then falls off the end and answers
  // `undefined`. So a note whose whole block is a bare YAML list reads as a note with no frontmatter, not
  // as one whose frontmatter is an array. Nothing else would catch the deviation: `FrontMatterCache` is
  // `{ [key: string]: any }`, which an array satisfies structurally, and an array has no `tags` key, so
  // neither TypeScript nor a `frontmatter['tags']` read objects to it.
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    cache.frontmatter = parsed;
    cache.frontmatterPosition = makePos(lineStarts, 0, endOffset);

    // `frontmatterLinks` is the ONE collection that is present even when empty, so it is assigned
    // unconditionally rather than behind the `length > 0` guard the ten collections beside it take.
    // Obsidian's cache builder writes it in the same statement as the two keys above - all three sit
    // behind the same `frontmatter &&` - and its extractor opens an empty array and returns that, so a
    // frontmatter block holding no link at all yields `[]`. The builder's tail then deletes every OTHER
    // empty collection by hand (`links`, `embeds`, `tags`, `headings`, `footnotes`, `footnoteRefs`,
    // `referenceLinks`, `sections`, `listItems`, `blocks`) and conspicuously does not delete this one. A
    // consumer branching on the key's presence therefore sees a truthy empty array here, and one
    // iterating it unguarded does not throw. The boundary is the `if` above, not this line: a note with
    // no frontmatter record at all - no block, a whitespace-only one, a scalar one, a sequence one,
    // invalid YAML - still has no `frontmatterLinks` key whatsoever.
    cache.frontmatterLinks = extractFrontmatterLinks(parsed);
  }

  sections.push({
    id: undefined,
    position: makePos(lineStarts, 0, endOffset),
    type: 'yaml'
  });

  return info.contentStart;
}

function parseFrontmatterYaml(yaml: string): unknown {
  if (!yaml.trim()) {
    return null;
  }

  try {
    return parseYaml(yaml);
  } catch {
    // Obsidian does the same: its own frontmatter parse wraps `parseYaml` in a `try` and answers `null`,
    // so a block that is not well-formed YAML falls through to the same branch a non-object one takes
    // instead of throwing out of the whole parse. Without this, indexing a note with a broken frontmatter
    // block leaves it with no cache at all and rethrows from a timer, and `computeMetadataAsync` - public
    // Obsidian API that never rejects there - rejects.
    return null;
  }
}

function parseHeadings(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  codeZones: [number, number][],
  sections: SectionCache[]
): HeadingCache[] {
  const headings: HeadingCache[] = [];
  // `[ \t]`, not `\s`, which would carry a heading across a line break and read `#\nText` as a heading `Text`. A line
  // that is no more than `#` is a heading too, and is left to the gap scan, which reads it in its context.
  const regex = /^#{1,6}[ \t]+.+$/gm;
  regex.lastIndex = bodyStart;
  let match = regex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const heading = ensureNonNullable(ensureNonNullable(tokenizeAtxHeading(match[0])).heading);
      const startOffset = match.index;
      const endOffset = match.index + match[0].length;
      headings.push({
        heading: heading.text,
        level: heading.level,
        position: makePos(lineStarts, startOffset, endOffset)
      });
      sections.push({
        id: undefined,
        position: makePos(lineStarts, startOffset, endOffset),
        type: 'heading'
      });
    }
    match = regex.exec(content);
  }
  return headings;
}

/**
 * Parses markdown content whose every line break is a `\n`.
 *
 * @param content - The note's full text.
 * @returns The metadata.
 */
function parseLfContent(content: string): CachedMetadata {
  const cache: CachedMetadata = {};
  const lineStarts = buildLineStarts(content);
  const sections: SectionCache[] = [];
  const codeZones = buildCodeZones(content);

  const bodyStart = parseFrontmatter(content, lineStarts, cache, sections);

  const headings = parseHeadings(content, bodyStart, lineStarts, codeZones, sections);

  const tags = parseTags(content, bodyStart, lineStarts, codeZones);
  if (tags.length > 0) {
    cache.tags = tags;
  }

  const links = parseLinks(content, bodyStart, lineStarts, codeZones);
  if (links.length > 0) {
    cache.links = links;
  }

  const embeds = parseEmbeds(content, bodyStart, lineStarts, codeZones);
  if (embeds.length > 0) {
    cache.embeds = embeds;
  }

  const listItems = parseListItems(content, bodyStart, lineStarts, sections);
  if (listItems.length > 0) {
    cache.listItems = listItems;
  }

  parseParagraphSections(content, bodyStart, lineStarts, sections, headings);
  if (headings.length > 0) {
    cache.headings = headings.sort((a, b) => a.position.start.offset - b.position.start.offset);
  }

  if (sections.length > 0) {
    cache.sections = sections.sort((a, b) => a.position.start.offset - b.position.start.offset);
  }

  return cache;
}

function parseLinks(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  codeZones: [number, number][]
): LinkCache[] {
  const links: LinkCache[] = [];

  // Wikilinks: [[link]] or [[link|display]] (not preceded by !)
  const wikiRegex = /(?<!!)\[\[(?<link>[^\]|]+?)(?:\|(?<display>[^\]]*?))?\]\]/g;
  wikiRegex.lastIndex = bodyStart;
  let match = wikiRegex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const link = ensureNonNullable(match.groups?.['link']);
      const display = match.groups?.['display'];
      const entry: LinkCache = {
        displayText: display ?? link,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length)
      };
      links.push(entry);
    }
    match = wikiRegex.exec(content);
  }

  // Markdown links (non-embed): [text](url)
  const mdRegex = /(?<!!)\[(?<text>[^\]]*)\]\((?<url>[^)]+)\)/g;
  mdRegex.lastIndex = bodyStart;
  match = mdRegex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const displayText = ensureNonNullable(match.groups?.['text']);
      const link = ensureNonNullable(match.groups?.['url']);
      links.push({
        displayText,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length)
      });
    }
    match = mdRegex.exec(content);
  }

  return links;
}

const TAB_WIDTH = 4;
const MAX_LIST_ITEM_CONTENT_GAP = 4;
// The blocks that end a list with no blank line before them, when indented less than the list's content: a heading, a
// code fence, a thematic break and a `%%` comment the line does not close. A blockquote, a `$$` math block, an HTML
// block, a table and a one-line `%% … %%` comment do not - Obsidian reads each of those as a lazy continuation of the item
// above.
const LIST_INTERRUPTING_LINE_REGEX = /^ {0,3}(?:#{1,6}(?:[ \t]|$)|`{3}|~{3}|%%(?!.*%%)|(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$)/;

const LIST_ITEM_REGEX = /^(?<indent>[ \t]*)(?<marker>[-*+]|\d+[.)]) (?:\[(?<task>.)\] )?(?<rest>.*)$/;
// A blockquote level: a `>` and the one space after it that belongs to the marker. Any indent may precede the first,
// which lets a blockquote sit inside a list item; up to three spaces may precede each later one.
// A line opening a blockquote, which starts a block of its own inside a list item even with no blank line before it.
const BLOCKQUOTE_LINE_REGEX = /^[ \t]*>/;
const FIRST_QUOTE_LEVEL_REGEX = /^[ \t]*> ?/;
const NESTED_QUOTE_LEVEL_REGEX = /^ {0,3}> ?/;

function advanceColumn(column: number, char: string): number {
  return char === '\t' ? column + TAB_WIDTH - (column % TAB_WIDTH) : column + 1;
}

/**
 * Writes a closed list item's end, as Obsidian computes it: the end of the item's last child that is not a list, when
 * it has more than one child, and otherwise where the item's own text ends. That is its last value line, or, when a
 * sibling item follows it after blank lines, the start of the first of them.
 *
 * @param item - The item.
 * @param isFollowedBySibling - Whether the item is closed by the next item of its own list.
 * @param lineStarts - The offset of each line's start.
 */
function closeListItem(item: OpenListItem, isFollowedBySibling: boolean, lineStarts: number[]): void {
  // Obsidian names the item as the parent of the lists nested in it only when it has more than one child, so a list
  // nested in an item with nothing else in it is rooted at its own first line.
  for (const nestedList of item.nestedLists) {
    const parent = item.childCount > 1 ? item.line : getRootListParent(nestedList.firstLine);
    for (const nestedItem of nestedList.items) {
      nestedItem.parent = parent;
    }
  }
  // A nested item starts where Obsidian's stripping of the item's lines leaves its line, and a tab is never split.
  for (const childLine of item.childLines) {
    const startColumn = childLine.indentColumns.findIndex((column) => column >= item.removalColumn);
    childLine.cache.position.start = offsetToLoc(lineStarts, childLine.textStart + startColumn);
  }
  let end = item.valueEnd;
  // An unclosed code block, comment or math block runs on over the empty lines before a sibling, so the item ends where
  // they start, as an item holding only its first paragraph does.
  const isEndedByBlankLines = isFollowedBySibling && item.blankLineEnd !== undefined;
  if (item.childCount > 1 && item.blockEnd >= 0 && !(item.isInHidingBlock && isEndedByBlankLines)) {
    end = item.blockEnd;
  } else if (isEndedByBlankLines) {
    end = ensureNonNullable(item.blankLineEnd);
  }
  item.cache.position.end = offsetToLoc(lineStarts, end);
}

/**
 * Walks the non-item lines that follow a list item, closing every open item they end, and finds where the list ends.
 * Obsidian ends a list on content that is indented less than the list's root item's content, but only on content
 * after a blank line, or on a block that can interrupt a paragraph; any other line is a lazy continuation of the item
 * above. A blank line alone ends nothing.
 *
 * Content of either kind that the root item does hold closes each nested item it is indented less than, and becomes a
 * block of the innermost item it stays in. That re-roots the list nested in that item, if one was open: Obsidian
 * names an item as its nested list's parent only while nothing but lists follow that list inside it, and otherwise
 * roots the nested list at its own first line, as it does for a list nested in an item with nothing after its marker.
 *
 * Every line the list holds is recorded on the items it belongs to, for {@link closeListItem}.
 *
 * @param listLines - The lines after the item, up to the next item or the end of the note.
 * @param openItems - The stack of open items, root first; the nested items the lines close are popped off it.
 * @param lineStarts - The offset of each line's start.
 * @returns How many of the lines belong to the list: all of them, or the index of the line that ends it.
 */
function closeListItems(listLines: ListLines, openItems: OpenListItem[], lineStarts: number[]): number {
  const { ends, firstLine, lines, scan, starts } = listLines;
  const listContentColumn = ensureNonNullable(openItems[0]).contentColumn;
  let isAfterBlankLine = false;
  for (const [index, line] of lines.entries()) {
    const [indent] = ensureNonNullable(/^[ \t]*/.exec(line));
    const indentColumns = getVisualColumns(indent);
    const column = ensureNonNullable(indentColumns.at(-1));
    const lineStart = ensureNonNullable(starts[index]);
    const lineEnd = ensureNonNullable(ends[index]);
    const lineNumber = firstLine + index;
    // A line inside a code block, a comment or a math block belongs to the block, which is a block of the innermost
    // item that holds it, and it ends nothing.
    if (scan.contentLines.has(lineNumber)) {
      const owner = ensureNonNullable(openItems.at(-1));
      if (line.trim() === '') {
        recordBlankListLine({ indentColumns, lineEnd, lineStart, openItems });
      } else {
        recordListLine(openItems, lineEnd);
        recordListLineIndent(openItems, column);
      }
      // A line of whitespace is a line of the block; an empty one is only when more of the block follows it.
      if (line !== '') {
        owner.blockEnd = lineEnd;
      }
      if (scan.closerLines.has(lineNumber)) {
        owner.isInHidingBlock = false;
      }
      isAfterBlankLine = line.trim() === '';
      continue;
    }
    if (line.trim() === '') {
      isAfterBlankLine = true;
      recordBlankListLine({ indentColumns, lineEnd, lineStart, openItems });
      continue;
    }
    const canEndItems = isAfterBlankLine || LIST_INTERRUPTING_LINE_REGEX.test(line) || scan.listEndLines.has(lineNumber);
    const isBlockStart = canEndItems || BLOCKQUOTE_LINE_REGEX.test(line) || scan.openerLines.has(lineNumber);
    isAfterBlankLine = false;
    if (canEndItems) {
      if (column < listContentColumn) {
        return index;
      }
      while (ensureNonNullable(openItems.at(-1)).contentColumn > column) {
        closeListItem(ensureNonNullable(openItems.pop()), false, lineStarts);
      }
      detachNestedList(ensureNonNullable(openItems.at(-1)));
    }
    recordListLine(openItems, lineEnd);
    recordListLineIndent(openItems, column);
    // The line is a block of the innermost item that holds it: a new one after a blank line or on a block that starts
    // one, and otherwise a lazy continuation of the paragraph above.
    const owner = ensureNonNullable(openItems.at(-1));
    if (isBlockStart || owner.childCount === 0) {
      owner.childCount++;
    }
    owner.blockEnd = lineEnd;
    owner.isInHidingBlock = scan.hidingOpenerLines.has(lineNumber);
  }
  return lines.length;
}

/**
 * Closes the items a new item's marker falls short of. The shallowest of them is the new item's sibling, unless the
 * new item starts a list of its own; the deeper ones end with their nested lists.
 *
 * @param closedItems - The items, deepest first.
 * @param isNewList - Whether the new item starts a list of its own.
 * @param lineStarts - The offset of each line's start.
 */
function closeListItemsBeforeItem(closedItems: OpenListItem[], isNewList: boolean, lineStarts: number[]): void {
  for (const closedItem of closedItems) {
    closeListItem(closedItem, !isNewList && closedItem === closedItems.at(-1), lineStarts);
  }
}

/**
 * Closes every item still open in a list that has ended.
 *
 * @param openItems - The stack of open items, emptied.
 * @param lineStarts - The offset of each line's start.
 */
function closeOpenListItems(openItems: OpenListItem[], lineStarts: number[]): void {
  for (const item of openItems) {
    closeListItem(item, false, lineStarts);
  }
  openItems.length = 0;
}

/**
 * Roots the list nested in an item at that list's own first line, once a block follows the list inside the item, and
 * forgets the list, so a list nested after the block starts afresh.
 *
 * @param item - The item the block landed in.
 */
function detachNestedList(item: OpenListItem): void {
  for (const nestedList of item.nestedLists) {
    const rootParent = getRootListParent(nestedList.firstLine);
    for (const nestedItem of nestedList.items) {
      nestedItem.parent = rootParent;
    }
  }
  item.nestedLists.length = 0;
}

/**
 * Walks the lines between a list's latest item and a line, closing the items they end, and extends a depth-0 list's
 * section over the content it holds there.
 *
 * @param content - The note's full text.
 * @param lineStarts - The offset of each line's start.
 * @param state - The list.
 * @param endLine - The line to stop before.
 * @returns Whether the lines ended the list.
 */
function doesListEndBefore(content: string, lineStarts: number[], state: ListState, endLine: number): boolean {
  const firstLine = state.previousLine + 1;
  const rawLines = getLines(content, lineStarts, firstLine, endLine);
  const { scan } = state;
  const { isCut, lines } = getContainerLines({ depth: state.depth, firstLine, rawLines, scan });
  const ends: number[] = [];
  const starts: number[] = [];
  for (const [index, line] of lines.entries()) {
    const end = ensureNonNullable(lineStarts[firstLine + index]) + ensureNonNullable(rawLines[index]).length;
    ends.push(end);
    starts.push(end - line.length);
  }
  const listLineCount = closeListItems({ ends, firstLine, lines, scan, starts }, state.openItems, lineStarts);
  if (state.depth === 0) {
    state.groupEnd = Math.max(state.groupEnd, getListContentEnd(lineStarts, firstLine, lines, listLineCount));
  }
  return isCut || listLineCount < lines.length;
}

/**
 * Closes a list for good: walks the lines after its latest item, up to a line, for the blocks that re-root its nested
 * lists, and records the section of a depth-0 list. Obsidian reports no `list` section for a list inside a blockquote,
 * whose only section is the blockquote's own.
 *
 * @param content - The note's full text.
 * @param lineStarts - The offset of each line's start.
 * @param state - The list.
 * @param endLine - The line to stop before.
 * @param sections - The collection the section is pushed onto.
 */
function finishList(content: string, lineStarts: number[], state: ListState, endLine: number, sections: SectionCache[]): void {
  doesListEndBefore(content, lineStarts, state, endLine);
  closeOpenListItems(state.openItems, lineStarts);
  pushListSection(lineStarts, state, sections);
}

/**
 * Reads the lines between two items of a list as the list's container sees them. A line holding the list's quote
 * levels is cut down to what follows them. A line holding fewer leaves the blockquote, and with it the list, when it
 * is blank, follows a blank line, or can interrupt a paragraph; any other such line is a lazy continuation of the
 * paragraph above, and the list holds it.
 *
 * A line that the leaf-block pre-pass found ending a container is no lazy continuation either.
 *
 * @param params - The lines, as they are in the note, the first one's line number, the number of quote levels the list
 * sits in, and what the leaf-block pre-pass found.
 * @returns The lines inside the container, and whether one of the raw lines left it.
 */
function getContainerLines(params: GetContainerLinesParams): ContainerLines {
  const { depth, firstLine, rawLines, scan } = params;
  if (depth === 0) {
    return { isCut: false, lines: rawLines };
  }
  const lines: string[] = [];
  let isAfterBlankLine = false;
  for (const [index, rawLine] of rawLines.entries()) {
    const levelEnds = getQuoteLevelEnds(rawLine);
    const containerEnd = levelEnds[depth - 1];
    if (containerEnd !== undefined) {
      const line = rawLine.slice(containerEnd);
      isAfterBlankLine = line.trim() === '';
      lines.push(line);
      continue;
    }
    const ownText = rawLine.slice(levelEnds.at(-1) ?? 0);
    if (
      isAfterBlankLine
      || ownText.trim() === ''
      || LIST_INTERRUPTING_LINE_REGEX.test(ownText)
      || (scan.breakLines.get(firstLine + index) ?? depth) < depth
    ) {
      return { isCut: true, lines };
    }
    lines.push(rawLine);
  }
  return { isCut: false, lines };
}

function getLineEnd(content: string, lineStarts: number[], line: number): number {
  const nextLineStart = lineStarts[line + 1];
  return nextLineStart === undefined ? content.length : nextLineStart - 1;
}

/**
 * Reads the lines in a range, without their line breaks.
 *
 * @param content - The note's full text.
 * @param lineStarts - The offset of each line's start.
 * @param firstLine - The first line to read.
 * @param endLine - The line to stop before.
 * @returns The lines.
 */
function getLines(content: string, lineStarts: number[], firstLine: number, endLine: number): string[] {
  const lines: string[] = [];
  for (let line = firstLine; line < endLine; line++) {
    lines.push(content.slice(ensureNonNullable(lineStarts[line]), getLineEnd(content, lineStarts, line)));
  }
  return lines;
}

/**
 * Finds where the content a list holds after an item ends: the end of its last non-blank line, trailing whitespace
 * excluded, which is where Obsidian ends the list's section when that content comes last.
 *
 * @param lineStarts - The offset of each line's start.
 * @param firstLine - The line `lines` starts at.
 * @param lines - The lines after the item.
 * @param listLineCount - How many of `lines` belong to the list.
 * @returns The end offset, or `-1` when the list holds no content there.
 */
function getListContentEnd(
  lineStarts: number[],
  firstLine: number,
  lines: string[],
  listLineCount: number
): number {
  for (let index = listLineCount - 1; index >= 0; index--) {
    const line = ensureNonNullable(lines[index]);
    const trimmedLength = line.trimEnd().length;
    if (trimmedLength > 0) {
      return ensureNonNullable(lineStarts[firstLine + index]) + trimmedLength;
    }
  }
  return -1;
}

/**
 * Computes the visual column where a list item's content starts, by CommonMark's rule: one to four columns of
 * whitespace after the marker belong to the marker, and anything wider leaves the content one column past it. Unlike
 * CommonMark, Obsidian applies that rule to an item with nothing after the marker too, rather than always putting its
 * content one column past the marker.
 *
 * @param markerEndColumn - The visual column just past the marker.
 * @param textAfterGap - The line's text after the single space the marker requires.
 * @returns The content column.
 */
function getListItemContentColumn(markerEndColumn: number, textAfterGap: string): number {
  const [extraWhitespace] = ensureNonNullable(/^[ \t]*/.exec(textAfterGap));
  let column = markerEndColumn + 1;
  for (const char of extraWhitespace) {
    column = advanceColumn(column, char);
  }
  return column - markerEndColumn > MAX_LIST_ITEM_CONTENT_GAP ? markerEndColumn + 1 : column;
}

/**
 * Computes a root list item's `parent`, or records a nested item in its parent's nested list, which decides the item's
 * `parent` when it closes (see {@link closeListItem}) or when a later block re-roots the list (see
 * {@link closeListItems}). A root item's parent is the negative of the first line of its list. A nested item of another
 * kind than the list before it starts a list of its own, which is another child of the parent item.
 *
 * @param params - The open item the new item is nested in, if any, the first line of the new item's list, the new item
 * and the kind of its marker.
 * @returns The parent, which is provisional for a nested item.
 */
function getListItemParent(params: GetListItemParentParams): number {
  const { item, kind, listFirstLine, parentItem } = params;
  if (!parentItem) {
    return getRootListParent(listFirstLine);
  }
  let nestedList = parentItem.nestedLists.at(-1);
  if (nestedList?.kind !== kind) {
    nestedList = { firstLine: item.position.start.line, items: [], kind };
    parentItem.nestedLists.push(nestedList);
    parentItem.childCount++;
  }
  nestedList.items.push(item);
  return getRootListParent(nestedList.firstLine);
}

/**
 * Computes what kind of list a marker belongs to: its bullet character, or its delimiter for an ordered marker.
 *
 * @param marker - The marker, such as `-` or `12.`.
 * @returns The kind.
 */
function getListMarkerKind(marker: string): string {
  return ensureNonNullable(marker.at(-1));
}

/**
 * Finds the list an item at a blockquote depth joins, opening one when that depth has none, and finishes every list
 * deeper than it, since the quote those lists sat in has ended.
 *
 * @param params - The note, the depth, the item's line and the lists open at each depth.
 * @returns The list.
 */
function getListState(params: GetListStateParams): ListState {
  const { content, depth, endLine, lineStarts, scan, sections, states } = params;
  for (const [stateDepth, deeperState] of states) {
    if (!(stateDepth > depth)) {
      continue;
    }

    finishList(content, lineStarts, deeperState, endLine, sections);
    states.delete(stateDepth);
  }
  let state = states.get(depth);
  if (!state) {
    state = { depth, firstLine: -1, groupEnd: -1, groupStart: -1, kind: '', openItems: [], previousLine: -1, scan };
    states.set(depth, state);
  }
  return state;
}

/**
 * Finds where each blockquote level of a line's quote prefix ends: a `>` with any indent before the first and up to
 * three spaces before each later one, each taking one optional space after it.
 *
 * @param line - The line.
 * @returns The offset just past each level, outermost first; empty for a line outside any blockquote.
 */
function getQuoteLevelEnds(line: string): number[] {
  const levelEnds: number[] = [];
  let position = 0;
  let match = FIRST_QUOTE_LEVEL_REGEX.exec(line);
  while (match) {
    position += match[0].length;
    levelEnds.push(position);
    match = NESTED_QUOTE_LEVEL_REGEX.exec(line.slice(position));
  }
  return levelEnds;
}

/**
 * Computes the `parent` Obsidian gives a root list item: the negative of its list's first line, except that a list
 * starting on line 0 is rooted at `-1`, since `-0` could not be told from a parent on line 0.
 *
 * @param listFirstLine - The first line of the item's list.
 * @returns The root parent.
 */
function getRootListParent(listFirstLine: number): number {
  return -Math.max(listFirstLine, 1);
}

/**
 * Computes the visual column at which each character of a line's leading whitespace starts, with tab stops every
 * {@link TAB_WIDTH} columns as in CommonMark.
 *
 * @param whitespace - The line's leading whitespace.
 * @returns One column per character, plus the column just past the whitespace, so the result is one longer than
 * `whitespace`.
 */
function getVisualColumns(whitespace: string): number[] {
  const columns = [0];
  let column = 0;
  for (const char of whitespace) {
    column = advanceColumn(column, char);
    columns.push(column);
  }
  return columns;
}

/**
 * Matches a line the leaf-block pre-pass found starting a list item against the list-item shape, past its quote prefix.
 *
 * @param line - The line.
 * @returns The match, the number of quote levels, and the length of the quote prefix.
 */
function matchListItemLine(line: string): ListItemLine {
  const levelEnds = getQuoteLevelEnds(line);
  const prefixLength = levelEnds.at(-1) ?? 0;
  const match = ensureNonNullable(LIST_ITEM_REGEX.exec(line.slice(prefixLength)));
  return { depth: levelEnds.length, match, prefixLength };
}

function parseListItems(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  sections: SectionCache[]
): ListItemCache[] {
  const items: ListItemCache[] = [];
  // The open list at each blockquote depth. An item at one depth closes every list deeper than it, since the quote
  // those lists sat in has ended.
  const states = new Map<number, ListState>();
  const bodyLine = offsetToLoc(lineStarts, bodyStart).line;
  // Which lines start an item, and which a code block, a comment or a math block hides, depends on the containers
  // around them, so the pre-pass decides both.
  const scan = scanLeafBlocks(getLines(content, lineStarts, 0, lineStarts.length), bodyLine);

  for (let currentLine = bodyLine; currentLine < lineStarts.length; currentLine++) {
    if (!scan.itemLines.has(currentLine)) {
      continue;
    }
    const lineStart = ensureNonNullable(lineStarts[currentLine]);
    const line = content.slice(lineStart, getLineEnd(content, lineStarts, currentLine));
    const itemLine = matchListItemLine(line);
    const { match, prefixLength } = itemLine;
    const state = getListState({ content, depth: itemLine.depth, endLine: currentLine, lineStarts, scan, sections, states });

    const indent = ensureNonNullable(match.groups?.['indent']);
    const marker = ensureNonNullable(match.groups?.['marker']);
    const taskChar = match.groups?.['task'];
    const rest = ensureNonNullable(match.groups?.['rest']);
    // Columns count from the end of the quote prefix, which is where the list's container starts.
    const indentColumns = getVisualColumns(indent);
    const markerColumn = ensureNonNullable(indentColumns.at(-1));
    const kind = getListMarkerKind(marker);

    // Blank lines alone never end a list in Obsidian; only content the list cannot hold does.
    let isNewList = state.openItems.length === 0 || doesListEndBefore(content, lineStarts, state, currentLine);
    if (isNewList) {
      closeOpenListItems(state.openItems, lineStarts);
    }

    // The parent is the nearest open item whose content column the marker reaches, as in CommonMark: an item stays
    // open for exactly the lines indented at least as far as its content. `openItems` is that stack of open items,
    // whose content columns strictly increase upwards, so popping the ones this marker falls short of keeps the lookup
    // amortized O(n) - a flat list, where nothing stays open, used to re-read every earlier item.
    const closedItems = popListItemsPastColumn(state.openItems, markerColumn);
    const parentItem = state.openItems.at(-1);

    // Obsidian starts an item where its container's content starts, not at the line start: `  - B` under `- A` starts
    // at column 2, a top-level item, whose container is the document, keeps its indent, and a top-level item in a
    // blockquote starts just past the quote prefix. A tab is never split, so the item starts at the first character at
    // or past that column.
    const containerColumn = parentItem?.contentColumn ?? 0;
    const startColumn = indentColumns.findIndex((column) => column >= containerColumn);
    const startOffset = lineStart + prefixLength + startColumn;
    const endOffset = lineStart + line.length;
    const pos = makePos(lineStarts, startOffset, endOffset);

    // A list holds items of one kind only: a top-level item with another bullet character, or another ordered
    // delimiter, starts a list of its own, gap or no gap. A nested item is free to differ from its siblings, since
    // only the top-level lists are sections.
    if (!parentItem && kind !== state.kind) {
      isNewList = true;
    }

    closeListItemsBeforeItem(closedItems, isNewList, lineStarts);
    recordListLine(state.openItems, endOffset);
    recordListLineIndent(state.openItems, markerColumn);

    if (isNewList) {
      pushListSection(lineStarts, state, sections);
      state.groupStart = lineStart;
      state.firstLine = currentLine;
      state.kind = kind;
    }
    state.groupEnd = endOffset;
    state.previousLine = currentLine;

    const item: ListItemCache = {
      parent: 0,
      position: pos,
      task: taskChar
    };
    item.parent = getListItemParent({ item, kind, listFirstLine: state.firstLine, parentItem });
    items.push(item);
    parentItem?.childLines.push({ cache: item, indentColumns, textStart: lineStart + prefixLength });
    // A task item with no text after its checkbox still counts as a parent, but holds no paragraph.
    const hasText = rest.trim() !== '';
    const afterMarker = line.slice(prefixLength + indent.length + marker.length);
    state.openItems.push({
      blankLineEnd: undefined,
      blockEnd: hasText ? endOffset : -1,
      cache: item,
      childCount: taskChar !== undefined || hasText ? 1 : 0,
      childLines: [],
      containerColumn,
      contentColumn: getListItemContentColumn(markerColumn + marker.length, taskChar === undefined ? rest : ''),
      isInHidingBlock: scan.hidingOpenerLines.has(currentLine),
      line: currentLine,
      nestedLists: [],
      removalColumn: markerColumn + getBulletWidth(indent.length - startColumn, marker, afterMarker),
      valueEnd: endOffset
    });
  }

  // Flush the open lists, each of which holds whatever content after its last item it does not end on
  for (const state of states.values()) {
    finishList(content, lineStarts, state, lineStarts.length, sections);
  }

  return items;
}

function parseParagraphSections(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  existingSections: SectionCache[],
  headings: HeadingCache[]
): void {
  // Find paragraph sections in gaps between existing sections
  const sortedSections = [...existingSections].sort((a, b) => a.position.start.offset - b.position.start.offset);

  let cursor = bodyStart;
  for (const section of sortedSections) {
    const gapStart = cursor;
    const gapEnd = section.position.start.offset;
    if (gapStart < gapEnd) {
      addGapSections(content, gapStart, gapEnd, lineStarts, existingSections, headings);
    }
    cursor = section.position.end.offset;
  }
  // Trailing gap
  if (cursor < content.length) {
    addGapSections(content, cursor, content.length, lineStarts, existingSections, headings);
  }
}

function parseTags(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  codeZones: [number, number][]
): TagCache[] {
  const tags: TagCache[] = [];
  const regex = /(?:^|\s)#(?<tag>[A-Za-z_][\w/-]*)/gm;
  regex.lastIndex = bodyStart;
  let match = regex.exec(content);
  while (match) {
    const fullMatch = match[0];
    const tagText = ensureNonNullable(match.groups?.['tag']);
    // The # character starts after any leading whitespace
    const hashOffset = match.index + fullMatch.indexOf('#');
    if (!isInCodeZone(codeZones, hashOffset)) {
      const tagLength = tagText.length + 1; // +1 for #
      tags.push({
        position: makePos(lineStarts, hashOffset, hashOffset + tagLength),
        tag: `#${tagText}`
      });
    }
    match = regex.exec(content);
  }
  return tags;
}

/**
 * Splits a wikilink's inner text into the target it resolves against and the text it shows, as Obsidian
 * does.
 *
 * The split is on the FIRST `|`, and only when one stands at a positive index — a leading `|` is part of
 * the target rather than an empty alias. Without an alias the display text is derived from the target
 * itself, each `#` in it becoming a ` > ` separator, which is why `[[Note#Section]]` shows as
 * `Note > Section`.
 *
 * @param inner - The text between `[[` and `]]`.
 * @returns The `href` to resolve and the `title` to show.
 */
function parseWikilinkTarget(inner: string): WikilinkTarget {
  const pipeIndex = inner.indexOf('|');
  const hasAlias = pipeIndex > 0;
  let href = (hasAlias ? inner.slice(0, pipeIndex) : inner).trim();
  const title = hasAlias ? inner.slice(pipeIndex + 1).trim() : href.split('#').filter(Boolean).join(' > ').trim();
  if (href.endsWith('\\')) {
    href = href.slice(0, -1);
  }
  return { href: normalizeLinkTarget(href), title };
}

/**
 * Pops the open items whose content column a marker falls short of, which the marker's item closes.
 *
 * @param openItems - The stack of open items, root first.
 * @param markerColumn - The visual column of the marker.
 * @returns The popped items, deepest first.
 */
function popListItemsPastColumn(openItems: OpenListItem[], markerColumn: number): OpenListItem[] {
  const closedItems: OpenListItem[] = [];
  while (openItems.length > 0 && ensureNonNullable(openItems.at(-1)).contentColumn > markerColumn) {
    closedItems.push(ensureNonNullable(openItems.pop()));
  }
  return closedItems;
}

function pushListSection(lineStarts: number[], state: ListState, sections: SectionCache[]): void {
  if (state.depth > 0 || state.groupStart < 0) {
    return;
  }
  sections.push({
    id: undefined,
    position: makePos(lineStarts, state.groupStart, state.groupEnd),
    type: 'list'
  });
}

/**
 * Records a blank line on the items open around it. It is a value line of each item it is indented at least as far as
 * the content of, and for every other item it is where that item's text would end, if a sibling followed it: the line's
 * start past the item's containers, whose prefix takes the line's whitespace up to the item's container column.
 *
 * @param params - The line's leading whitespace columns, its start and end, and the open items.
 */
function recordBlankListLine(params: RecordBlankListLineParams): void {
  const { indentColumns, lineEnd, lineStart, openItems } = params;
  const width = ensureNonNullable(indentColumns.at(-1));
  for (const item of openItems) {
    // The containers take whole characters, so a tab reaching past the container column is theirs, and measured from
    // there the line holds nothing.
    let prefixLength = indentColumns.findIndex((column) => column >= item.containerColumn);
    if (prefixLength === -1) {
      prefixLength = indentColumns.length - 1;
    }
    if (width - ensureNonNullable(indentColumns[prefixLength]) >= item.contentColumn - item.containerColumn) {
      item.valueEnd = lineEnd;
      item.blankLineEnd = undefined;
      continue;
    }
    item.blankLineEnd ??= lineStart + prefixLength;
  }
}

/**
 * Records a line holding content as a value line of every item open around it.
 *
 * @param openItems - The open items.
 * @param lineEnd - The offset just past the line.
 */
function recordListLine(openItems: OpenListItem[], lineEnd: number): void {
  for (const item of openItems) {
    item.valueEnd = lineEnd;
    item.blankLineEnd = undefined;
  }
}

/**
 * Records the indent of a line holding content on every item open around it, for the column Obsidian strips the item's
 * lines to. A line indented no further than an item's container is not indented within the item, and does not count.
 *
 * @param openItems - The open items.
 * @param column - The visual column of the line's content, past its quote prefix.
 */
function recordListLineIndent(openItems: OpenListItem[], column: number): void {
  for (const item of openItems) {
    if (column > item.containerColumn) {
      item.removalColumn = Math.min(item.removalColumn, column);
    }
  }
}

/**
 * Visits one key/value pair of a frontmatter object or array, reading a string as a link and recursing
 * into anything else.
 *
 * @param keyPrefix - The dotted path of the container, empty at the top level.
 * @param key - The property name, or the stringified index within an array.
 * @param value - The raw value.
 * @param links - The collection each find is pushed onto.
 */
function visitFrontmatterEntry(keyPrefix: string, key: string, value: unknown, links: FrontmatterLinkCache[]): void {
  const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;
  if (typeof value === 'string') {
    collectFrontmatterLink(fullKey, value, links);
    return;
  }
  visitFrontmatterValue(fullKey, value, links);
}

/**
 * Walks a frontmatter container — an array by index, an object by own key — to ANY depth, which is what
 * produces a key such as `meta.related.0`. Anything that is neither is left alone.
 *
 * @param keyPrefix - The dotted path of the container, empty at the top level.
 * @param value - The container.
 * @param links - The collection each find is pushed onto.
 */
function visitFrontmatterValue(keyPrefix: string, value: unknown, links: FrontmatterLinkCache[]): void {
  if (Array.isArray(value)) {
    const items: unknown[] = value;
    for (const [index, item] of items.entries()) {
      visitFrontmatterEntry(keyPrefix, String(index), item, links);
    }
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, item] of Object.entries(value)) {
      visitFrontmatterEntry(keyPrefix, key, item, links);
    }
  }
}
