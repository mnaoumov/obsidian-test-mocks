/**
 * @file
 *
 * Reads the packed tarball's file name out of `npm pack --json`, across both npm output generations.
 *
 * The shape changed in npm 12. npm <= 11 emitted an ARRAY of results:
 *
 * ```json
 * [{ "id": "pkg@1.0.0", "filename": "pkg-1.0.0.tgz", "files": [] }]
 * ```
 *
 * npm 12 emits an OBJECT keyed by package name:
 *
 * ```json
 * { "pkg": { "id": "pkg@1.0.0", "filename": "pkg-1.0.0.tgz", "files": [] } }
 * ```
 *
 * Both are valid JSON, which is exactly what made the old `JSON.parse(output) as [NpmPackResult]` so
 * expensive: the parse succeeded, the cast asserted a shape nothing had checked, `result[0]` was
 * `undefined`, and `publishGitHubRelease` died with `Cannot read properties of undefined (reading
 * 'filename')` at the SECOND-TO-LAST step of a release -- after the bump, changelog, commit, tag and
 * `git push --follow-tags` had all already landed on the remote (T824-P35, the sibling of T813-P2 in
 * `obsidian-integration-testing` and T806-P1 in `obsidian-dev-utils`). So this module validates instead
 * of asserting, and every failure names the raw output it could not read.
 *
 * No noise-stripping is needed here, unlike the sibling copy in `obsidian-dev-utils`: `execFromRoot`
 * accumulates the child's `stdout` and `stderr` separately and returns `stdout` alone, and npm writes its
 * `npm notice run ... prepare` lines to `stderr` -- so the string reaching this module is pure JSON.
 */

import { castTo } from '../../src/internal/castTo.ts';

interface NpmPackResult {
  readonly filename: string;
}

/**
 * Extracts the packed tarball's file name from the raw stdout of `npm pack --json`.
 *
 * @param rawOutput - The command's stdout, in either the npm <= 11 array shape or the npm 12
 * package-name-keyed object shape.
 * @returns The tarball's file name, e.g. `pkg-1.0.0.tgz`.
 * @throws If the output is not JSON, or carries no entry with a non-empty string `filename`. The error
 * message includes `rawOutput`, so a future npm shape change is diagnosable from the failed release log
 * alone.
 */
export function parseNpmPackFilename(rawOutput: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    throw new Error(`Could not parse 'npm pack --json' output as JSON:\n${rawOutput}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`Expected 'npm pack --json' output to be an array or an object:\n${rawOutput}`);
  }

  const [result] = Array.isArray(parsed) ? castTo<unknown[]>(parsed) : Object.values(castTo<Record<string, unknown>>(parsed));

  const filename = typeof result === 'object' && result !== null ? castTo<Partial<NpmPackResult>>(result).filename : undefined;

  if (typeof filename !== 'string' || !filename) {
    throw new Error(`Could not read the packed tarball name from 'npm pack --json' output:\n${rawOutput}`);
  }

  return filename;
}
