import type { FrontMatterInfo } from 'obsidian';

import { ensureNonNullable } from '../internal/TypeGuards.ts';

const FRONTMATTER_DELIMITER_LENGTH = 3;

export function getFrontMatterInfo(content: string): FrontMatterInfo {
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
