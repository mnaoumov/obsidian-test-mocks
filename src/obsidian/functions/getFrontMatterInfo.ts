/**
 * @file
 *
 * Mock of Obsidian's `getFrontMatterInfo`.
 *
 * A port of Obsidian's own implementation (1.14.x `app.js`, `hg`), not an approximation of it. Two of its habits
 * are easy to get wrong:
 *
 * - `frontmatter` INCLUDES the newline that ends the last property line, and `to` is the index of the closing
 *   `---` itself. So `[from, to)` is exactly the region a caller replaces, and splicing in text that ends in a
 *   newline - which `stringifyYaml` always does - leaves no blank line before the closing delimiter.
 * - The closing `---` is searched for from the start of the line after the opening one, so an EMPTY block
 *   (`---\n---\n`) exists, with `frontmatter` the empty string.
 */

import type { FrontMatterInfo as FrontMatterInfoOriginal } from 'obsidian';

/**
 * Locates the frontmatter block at the start of a file's contents: whether it exists, its text, the offsets where
 * that text starts and ends, and the offset where the body after the closing `---` begins.
 *
 * @param content - The file contents.
 * @returns The frontmatter info; when there is no frontmatter, `exists` is `false` and every offset is `0`.
 */
export function getFrontMatterInfo(content: string): FrontMatterInfoOriginal {
  const openingMatch = /^---\r?\n/.exec(content);
  if (!openingMatch) {
    return createMissingInfo();
  }

  const from = openingMatch[0].length;
  const closingRegex = /---(?:\r?\n|$)/g;
  closingRegex.lastIndex = from;
  let closingMatch = closingRegex.exec(content);
  // A `---` counts as the closing delimiter only at the start of a line, so one inside a value is skipped.
  while (closingMatch && content.charAt(closingMatch.index - 1) !== '\n') {
    closingMatch = closingRegex.exec(content);
  }
  return closingMatch
    ? {
      contentStart: closingRegex.lastIndex,
      exists: true,
      from,
      frontmatter: content.slice(from, closingMatch.index),
      to: closingMatch.index
    }
    : createMissingInfo();
}

function createMissingInfo(): FrontMatterInfoOriginal {
  return {
    contentStart: 0,
    exists: false,
    from: 0,
    frontmatter: '',
    to: 0
  };
}
