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

import { getFrontMatterInfo } from '../obsidian/functions/getFrontMatterInfo.ts';
import { parseYaml } from '../obsidian/functions/parseYaml.ts';
import {
  decodeUriSafely,
  isInternalLinkTarget,
  normalizeLinkTarget
} from './link-target.ts';
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
const FRONTMATTER_MARKDOWN_LINK_REGEX = /^(?<open>!?\[)(?<displayText>.*?)(?<separator>]\(\s*)(?<targetAndTitle>(?<target><[^>]*?>|[^ "]+?)(?<spacedTitle>\s+(?<title>[^ ]+|"[^"]+"|'[^']+'|\([^']+\)))?)?(?<close>\s*\))$/;

/**
 * A non-breaking space, which Obsidian folds into an ordinary one before it resolves a link target.
 */

const WIKILINK_CLOSE = ']]';

const WIKILINK_OPEN = '[[';

/**
 * Parses markdown content into a `CachedMetadata` object.
 *
 * This approximates Obsidian's parser rather than reproducing it: tags, links and embeds are found by regular
 * expressions outside fenced code blocks and inline code spans, and blocks between the recognized sections become
 * paragraph, blockquote, code or thematic-break sections.
 *
 * @param content - The note's full text, frontmatter included.
 * @returns The metadata, with each collection present only when it is non-empty.
 */
export function parseMarkdownContent(content: string): CachedMetadata {
  const cache: CachedMetadata = {};
  const lineStarts = buildLineStarts(content);
  const sections: SectionCache[] = [];
  const codeZones = buildCodeZones(content);

  const bodyStart = parseFrontmatter(content, lineStarts, cache, sections);

  const headings = parseHeadings(content, bodyStart, lineStarts, codeZones, sections);
  if (headings.length > 0) {
    cache.headings = headings;
  }

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

  const listItems = parseListItems(content, bodyStart, lineStarts, codeZones, sections);
  if (listItems.length > 0) {
    cache.listItems = listItems;
  }

  parseParagraphSections(content, bodyStart, lineStarts, sections, codeZones);

  if (sections.length > 0) {
    cache.sections = sections.sort((a, b) => a.position.start.offset - b.position.start.offset);
  }

  return cache;
}

function addGapSections(
  content: string,
  gapStart: number,
  gapEnd: number,
  lineStarts: number[],
  _codeZones: [number, number][],
  sections: SectionCache[]
): void {
  const gapContent = content.slice(gapStart, gapEnd);
  // Split by blank lines into paragraphs, CAPTURING the separators. Every part's own length then
  // advances the running offset, so each block's position is the one it actually occupies rather than
  // one reconstructed from the block length plus a guessed single separator character. That
  // reconstruction both double-counted the block (the offset had already advanced to its end) and
  // assumed a one-character separator, while a blank line is at least two — so from the second block
  // of a gap onwards the lookup ran past the block and failed. A `%%` comment on its own line after a
  // blank line is the everyday shape that hit it.
  const parts = gapContent.split(/(?<blankLine>\n\s*\n)/);
  let offset = gapStart;
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      const blockStart = offset + part.indexOf(trimmed);
      const blockEnd = blockStart + trimmed.length;
      let type = 'paragraph';
      if (trimmed.startsWith('>')) {
        type = 'blockquote';
      } else if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        type = 'code';
      } else if (/^(?:---|\*\*\*|___)\s*$/.test(trimmed)) {
        type = 'thematicBreak';
      }
      sections.push({
        id: undefined,
        position: makePos(lineStarts, blockStart, blockEnd),
        type
      });
    }
    offset += part.length;
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

  // Fenced code blocks: ``` or ~~~
  const fencedRegex = /^(?<fence>`{3,}|~{3,}).*\n[\s\S]*?^\k<fence>\s*$/gm;
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

  // A block that does not parse to a plain object leaves NO `frontmatter` and NO `frontmatterPosition`
  // behind - not an empty record, which is what a consumer branching on `cache.frontmatter` would read as
  // a note that HAS frontmatter. Obsidian writes both keys behind the same guard, so a scalar block,
  // invalid YAML and an empty one all read exactly like a note with no frontmatter at all. The `yaml`
  // SECTION below is pushed regardless, as Obsidian's own sections loop does.
  if (parsed && typeof parsed === 'object') {
    cache.frontmatter = parsed;
    cache.frontmatterPosition = makePos(lineStarts, 0, info.contentStart);
    const frontmatterLinks = extractFrontmatterLinks(parsed);
    if (frontmatterLinks.length > 0) {
      cache.frontmatterLinks = frontmatterLinks;
    }
  }

  sections.push({
    id: undefined,
    position: makePos(lineStarts, 0, info.contentStart),
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
  const regex = /^(?<hashes>#{1,6})\s+(?<text>.+)$/gm;
  regex.lastIndex = bodyStart;
  let match = regex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const hashes = ensureNonNullable(match.groups?.['hashes']);
      const text = ensureNonNullable(match.groups?.['text']);
      const startOffset = match.index;
      const endOffset = match.index + match[0].length;
      headings.push({
        heading: text.trim(),
        level: hashes.length,
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

function parseListItems(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  codeZones: [number, number][],
  sections: SectionCache[]
): ListItemCache[] {
  const items: ListItemCache[] = [];
  const regex = /^(?<indent>[ \t]*)(?<marker>[-*+]|\d+[.)]) (?:\[(?<task>.)\] )?(?<rest>.*)$/gm;
  regex.lastIndex = bodyStart;

  // Track list groups for sections: contiguous list items
  let listGroupStart = -1;
  let listGroupEnd = -1;
  let listGroupFirstLine = -1;
  const PREV_LINE_INITIAL = -2;
  let previousLine = PREV_LINE_INITIAL;

  let match = regex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const indent = ensureNonNullable(match.groups?.['indent']);
      const taskChar = match.groups?.['task'];
      const startOffset = match.index;
      const endOffset = match.index + match[0].length;
      const pos = makePos(lineStarts, startOffset, endOffset);
      const currentLine = pos.start.line;

      // Track list groups for section generation
      if (previousLine < 0 || currentLine > previousLine + 1) {
        // Start a new list group (flush previous if exists)
        if (listGroupStart >= 0) {
          sections.push({
            id: undefined,
            position: makePos(lineStarts, listGroupStart, listGroupEnd),
            type: 'list'
          });
        }
        listGroupStart = startOffset;
        listGroupFirstLine = currentLine;
      }
      listGroupEnd = endOffset;
      previousLine = currentLine;

      // Determine parent: find previous item with strictly less indent
      let parent = -listGroupFirstLine; // Default: negative of first item's line in group
      const indentLength = indent.length;

      // Walk backwards through items to find parent with strictly less indent
      for (let index = items.length - 1; index >= 0; index--) {
        const previousItem = ensureNonNullable(items[index]);
        const previousIndent = previousItem.position.start.col;
        if (previousIndent < indentLength) {
          parent = previousItem.position.start.line;
          break;
        }
      }

      const item: ListItemCache = {
        parent,
        position: pos,
        task: taskChar
      };
      items.push(item);
    }
    match = regex.exec(content);
  }

  // Flush last list group
  if (listGroupStart >= 0) {
    sections.push({
      id: undefined,
      position: makePos(lineStarts, listGroupStart, listGroupEnd),
      type: 'list'
    });
  }

  return items;
}

function parseParagraphSections(
  content: string,
  bodyStart: number,
  lineStarts: number[],
  existingSections: SectionCache[],
  codeZones: [number, number][]
): void {
  // Find paragraph sections in gaps between existing sections
  const sortedSections = [...existingSections].sort((a, b) => a.position.start.offset - b.position.start.offset);

  let cursor = bodyStart;
  for (const section of sortedSections) {
    const gapStart = cursor;
    const gapEnd = section.position.start.offset;
    if (gapStart < gapEnd) {
      addGapSections(content, gapStart, gapEnd, lineStarts, codeZones, existingSections);
    }
    cursor = section.position.end.offset;
  }
  // Trailing gap
  if (cursor < content.length) {
    addGapSections(content, cursor, content.length, lineStarts, codeZones, existingSections);
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
