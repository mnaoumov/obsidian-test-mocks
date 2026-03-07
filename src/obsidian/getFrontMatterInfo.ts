import type { FrontMatterInfo } from 'obsidian';

export function getFrontMatterInfo(content: string): FrontMatterInfo {
  const fmRegex = /^---(?<StartNewline>\r?\n)(?<FrontmatterBody>[\s\S]*?)\r?\n---(?<TrailingNewline>\r?\n|$)/;
  const match = fmRegex.exec(content);
  if (match) {
    const fullMatch = match[0];
    const startNewline = match.groups!['StartNewline']!;
    const frontmatterBody = match.groups!['FrontmatterBody']!;
    const from = 3 + startNewline.length;
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
