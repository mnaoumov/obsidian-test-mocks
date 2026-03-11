import type {
  BlockSubpathResult as BlockSubpathResultOriginal,
  CachedMetadata as CachedMetadataOriginal,
  FootnoteSubpathResult as FootnoteSubpathResultOriginal,
  HeadingSubpathResult as HeadingSubpathResultOriginal
} from 'obsidian';

export function resolveSubpath(
  _cache: CachedMetadataOriginal,
  _subpath: string
): BlockSubpathResultOriginal | FootnoteSubpathResultOriginal | HeadingSubpathResultOriginal | null {
  return null;
}
