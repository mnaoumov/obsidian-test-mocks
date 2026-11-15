/**
 * @file
 *
 * Cuts one version's section out of `CHANGELOG.md`, for the GitHub release body.
 *
 * Pure, and here rather than in `version.ts` for the same reason `npm-pack.ts` is: `version.ts` runs
 * `await main()` at top level, so nothing can import it to test it.
 */

/**
 * What `indexOf` and `findIndex` return when nothing matches.
 */
const NOT_FOUND_INDEX = -1;

/**
 * Extracts the body of one version's `CHANGELOG.md` section: everything between its `## <version>` heading
 * and whichever comes first, the next `## ` heading or the end of the file.
 *
 * Ending at the end of the file is the normal shape of a FIRST release, since sections are prepended.
 * Terminating on `'## '` WITH its trailing space keeps a grouped section's `### ` subheadings inside it,
 * where a `\n\n##` pattern stopped at the first of them and left only the summary line.
 *
 * @param changelogContent - The full contents of `CHANGELOG.md`.
 * @param version - The version whose section to extract.
 * @returns The section body, trimmed, or an empty string when the changelog has no section for that version.
 */
export function extractChangelogSection(changelogContent: string, version: string): string {
  const lines = changelogContent.split(/\r?\n/);
  const headingIndex = lines.indexOf(`## ${version}`);
  if (headingIndex === NOT_FOUND_INDEX) {
    return '';
  }

  const bodyStartIndex = headingIndex + 1;
  const nextHeadingOffset = lines.slice(bodyStartIndex).findIndex((line) => line.startsWith('## '));
  const bodyEndIndex = nextHeadingOffset === NOT_FOUND_INDEX ? lines.length : bodyStartIndex + nextHeadingOffset;
  return lines.slice(bodyStartIndex, bodyEndIndex).join('\n').trim();
}
