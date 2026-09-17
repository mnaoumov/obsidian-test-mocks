/**
 * @file
 *
 * Mock of Obsidian's `getFrontMatterInfo`.
 */

import type { FrontMatterInfo as FrontMatterInfoOriginal } from 'obsidian';

import { ensureNonNullable } from '../../internal/type-guards.ts';

const FRONTMATTER_DELIMITER_LENGTH = 3;

/**
 * Locates the frontmatter block at the start of a file's contents: whether it exists, its text, the offsets where
 * that text starts and ends, and the offset where the body after the closing `---` begins.
 *
 * @param content - The file contents.
 * @returns The frontmatter info; when there is no frontmatter, `exists` is `false` and every offset is `0`.
 */
export function getFrontMatterInfo(content: string): FrontMatterInfoOriginal {
  const fmRegex = /^---(?<StartNewline>\r?\n)(?<FrontmatterBody>[\s\S]*?)\r?\n---(?<TrailingNewline>\r?\n|$)/;
  const match = fmRegex.exec(content);
  if (match) {
    const fullMatch = match[0];
    const groups = ensureNonNullable(match.groups);
    const startNewline = ensureNonNullable(groups['StartNewline']);
    const frontmatterBody = ensureNonNullable(groups['FrontmatterBody']);
    const from = FRONTMATTER_DELIMITER_LENGTH + startNewline.length;
    const to = from + frontmatterBody.length;
    return {
      contentStart: fullMatch.length,
      exists: true,
      from,
      frontmatter: frontmatterBody,
      to
    };
  }
  return {
    contentStart: 0,
    exists: false,
    from: 0,
    frontmatter: '',
    to: 0
  };
}
