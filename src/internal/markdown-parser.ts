import type {
  CachedMetadata,
  EmbedCache,
  FrontMatterCache,
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

/**
 * Parses markdown content into a `CachedMetadata` object.
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
  // Split by blank lines into paragraphs
  const blocks = gapContent.split(/\n\s*\n/);
  let offset = gapStart;
  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.length > 0) {
      const blockStart = content.indexOf(trimmed, offset);
      if (blockStart >= 0) {
        const blockEnd = blockStart + trimmed.length - 1;
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
        offset = blockEnd + 1;
      }
    }
    offset += block.length + 1; // +1 for the split separator
  }
}

/**
 * Builds an array of [start, end] offset ranges that represent code zones
 * (fenced code blocks and inline code spans) where tags/links should not be parsed.
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
 */
function buildLineStarts(content: string): number[] {
  const starts: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
      starts.push(i + 1);
    }
  }
  return starts;
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
  const lineStart = lineStarts[low] ?? 0;
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
      const link = match.groups?.['link'] ?? '';
      const display = match.groups?.['display'];
      embeds.push({
        displayText: display ?? link,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length - 1)
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
      const displayText = match.groups?.['alt'] ?? '';
      const link = match.groups?.['url'] ?? '';
      embeds.push({
        displayText,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length - 1)
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

  const parsed = info.frontmatter.trim() ? parseYaml(info.frontmatter) : null;
  if (parsed && typeof parsed === 'object') {
    cache.frontmatter = parsed as FrontMatterCache;
  } else {
    cache.frontmatter = {} as FrontMatterCache;
  }

  cache.frontmatterPosition = makePos(lineStarts, 0, info.contentStart - 1);

  sections.push({
    id: undefined,
    position: makePos(lineStarts, 0, info.contentStart - 1),
    type: 'yaml'
  });

  return info.contentStart;
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
      const hashes = match.groups?.['hashes'] ?? '';
      const text = match.groups?.['text'] ?? '';
      const startOffset = match.index;
      const endOffset = match.index + match[0].length - 1;
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
      const link = match.groups?.['link'] ?? '';
      const display = match.groups?.['display'];
      const entry: LinkCache = {
        displayText: display ?? link,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length - 1)
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
      const displayText = match.groups?.['text'] ?? '';
      const link = match.groups?.['url'] ?? '';
      links.push({
        displayText,
        link,
        original: match[0],
        position: makePos(lineStarts, match.index, match.index + match[0].length - 1)
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
  let prevLine = PREV_LINE_INITIAL;

  let match = regex.exec(content);
  while (match) {
    if (!isInCodeZone(codeZones, match.index)) {
      const indent = match.groups?.['indent'] ?? '';
      const taskChar = match.groups?.['task'];
      const startOffset = match.index;
      const endOffset = match.index + match[0].length - 1;
      const pos = makePos(lineStarts, startOffset, endOffset);
      const currentLine = pos.start.line;

      // Track list groups for section generation
      if (prevLine < 0 || currentLine > prevLine + 1) {
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
      prevLine = currentLine;

      // Determine parent: find previous item with strictly less indent
      let parent = -listGroupFirstLine; // Default: negative of first item's line in group
      const indentLen = indent.length;

      // Walk backwards through items to find parent with strictly less indent
      for (let i = items.length - 1; i >= 0; i--) {
        const prevItem = items[i];
        if (prevItem) {
          const prevIndent = prevItem.position.start.col;
          if (prevIndent < indentLen) {
            parent = prevItem.position.start.line;
            break;
          }
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
    cursor = section.position.end.offset + 1;
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
    const tagText = match.groups?.['tag'] ?? '';
    // The # character starts after any leading whitespace
    const hashOffset = match.index + fullMatch.indexOf('#');
    if (!isInCodeZone(codeZones, hashOffset)) {
      const tagLen = tagText.length + 1; // +1 for #
      tags.push({
        position: makePos(lineStarts, hashOffset, hashOffset + tagLen - 1),
        tag: `#${tagText}`
      });
    }
    match = regex.exec(content);
  }
  return tags;
}
