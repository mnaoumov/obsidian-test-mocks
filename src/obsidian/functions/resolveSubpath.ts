/**
 * @file
 *
 * Mock of Obsidian's `resolveSubpath`.
 */

import type {
  BlockSubpathResult as BlockSubpathResultOriginal,
  CachedMetadata as CachedMetadataOriginal,
  FootnoteSubpathResult as FootnoteSubpathResultOriginal,
  HeadingSubpathResult as HeadingSubpathResultOriginal
} from 'obsidian';

/**
 * Resolves a link subpath, such as `#Heading` or `#^block`, to the heading, block or footnote it refers to in a
 * note's cached metadata. The mock resolves nothing.
 *
 * @param _cache - The note's cached metadata.
 * @param _subpath - The subpath to resolve.
 * @returns `null`.
 */
export function resolveSubpath(
  _cache: CachedMetadataOriginal,
  _subpath: string
): BlockSubpathResultOriginal | FootnoteSubpathResultOriginal | HeadingSubpathResultOriginal | null {
  return null;
}
