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
 * `git push --follow-tags` had all already landed on the remote -- measured on npm 12.0.2 / Node 26.5.0,
 * and fixed in lockstep in the sibling copies in `obsidian-integration-testing` and `obsidian-dev-utils`.
 * So this module validates instead of asserting, and every failure names the raw output it could not read.
 *
 * The JSON is not always the whole of stdout. `execFromRoot` returns the child's `stdout` alone, and npm
 * writes its own `npm notice run ... prepare` lines to `stderr`, but `npm pack` runs the `prepare` script
 * first and that script's output lands in the same `stdout`: on 2026-10-17 the 7.2.3 release died here,
 * after the tag was pushed, because a `typescript-lib:Exec Executing command: .../husky.cmd` line sat
 * above the JSON. So when the whole output does not parse, the JSON is read from the first line that
 * opens with `{` or `[`.
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
  const parsed = parseJsonSkippingLeadingNoise(rawOutput);
  if (parsed === undefined) {
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

function parseJsonSkippingLeadingNoise(rawOutput: string): unknown {
  const lines = rawOutput.split(/\r?\n/);
  const candidates = [rawOutput];
  const jsonStartIndex = lines.findIndex((line) => line.startsWith('{') || line.startsWith('['));
  if (jsonStartIndex > 0) {
    candidates.push(lines.slice(jsonStartIndex).join('\n'));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  return undefined;
}
