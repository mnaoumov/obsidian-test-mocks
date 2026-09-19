/**
 * @file
 *
 * The parts of the `scripts/docs-gen/` copy-sync gate that need no network and no disk, so they can be
 * tested directly.
 *
 * The gate itself lives in `scripts/check-docs-gen-copy-sync.ts`; everything here is what it decides WITH.
 *
 * ## Why this gate is weaker than `check:vendored-eslint-rules`, and what it can still assert
 *
 * `scripts/helpers/eslint-rules/` is byte-identical to `obsidian-dev-utils`' after two mechanical
 * transforms, so that gate asserts identity and reports every difference. `scripts/docs-gen/` cannot be
 * held to that: its divergences are semantic - barrel entry points, `-mock` route slugs,
 * `EXCLUDED_DIR_SEGMENTS`, the Sätteri port - and no transform expresses them. Answering "did upstream
 * change anything here that this copy has not taken?" therefore meant hand-diffing all 26 files and
 * classifying every hunk, which is what it cost the last time it was asked.
 *
 * So this records the **shape** of each file's diff against upstream instead of its content: the hunk
 * count, and each hunk's added/removed line counts plus a digest of its changed lines. A file upstream
 * edits gains, loses or alters a hunk; a file this repo edits does too. Either is a prompt to look, which
 * is all a copy-sync tree needs.
 *
 * Three things make it more than a number:
 *
 * 1. **One transform IS mechanical, and is applied rather than recorded.** The whole of divergence 1 in
 *    `AGENTS.md` is the package name, so {@link TRANSFORM_ARMS} applies it and 15 of the 26 files are then
 *    byte-identical. For those, this gate is exactly as strong as the rule-source one: the baseline says
 *    "no hunks", so any drift at all is reported. The weaker half is only the remainder.
 * 2. **Every differing file carries a REASON from a closed vocabulary** ({@link DIVERGENCE_REASONS}),
 *    keyed to the divergence list in `AGENTS.md`. A baseline of bare counts degrades into a number nobody
 *    can check; a file whose hunks are recorded with no reason fails this gate rather than passing it.
 * 3. **The rename is a pair, not two one-sided files.** This repo's
 *    `helpers/satteri-plugins/satteri-relative-links.{ts,test.ts}` IS upstream's
 *    `helpers/remark-plugins/remark-relative-links.{ts,test.ts}`, ported to Sätteri. Left unpaired, an
 *    upstream fix to that plugin's slug handling would be invisible here forever, so
 *    {@link UPSTREAM_TO_LOCAL_RENAMES} pairs them and the port's shape is recorded like any other.
 */

import { createHash } from 'node:crypto';

/**
 * A recorded baseline for one upstream file: the shape of its diff against this repo's copy, and why that
 * diff exists at all.
 *
 * An entry with no hunks is a file that is byte-identical after {@link TRANSFORM_ARMS}, and carries no
 * reasons - there is nothing to explain.
 */
export interface BaselineEntry {
  readonly hunks: readonly DiffHunk[];
  readonly reasons: readonly string[];
}

/**
 * One hunk of a `--unified=0` diff, reduced to what survives an unrelated edit elsewhere in the file.
 *
 * Line numbers are deliberately NOT part of this. Every hunk below the first change shifts when that
 * change resizes, so recording positions would report one real edit as a dozen, and a hunk that merely
 * moves is not drift worth a failure. What the digest covers is the changed lines themselves, markers
 * included, so swapping an addition for a removal is a different shape.
 */
export interface DiffHunk {
  readonly added: number;
  readonly digest: string;
  readonly removed: number;
}

/**
 * A deliberate difference that is mechanical enough to be REPRODUCED rather than merely recorded, applied
 * to upstream's text before the diff is taken.
 *
 * An empty `paths` means the arm applies to every file in the tree.
 */
export interface TransformArm {
  readonly apply: TransformApply;
  readonly paths: readonly string[];
  readonly reason: string;
}

/**
 * What an arm does to upstream's text.
 *
 * Held as an alias rather than written inline for the same reason the sibling gate does it: a member typed
 * by an alias is neither a function property signature nor a method shorthand, so it lints clean under
 * either `@typescript-eslint/method-signature-style` setting.
 */
type TransformApply = (text: string) => string;

/**
 * The closed vocabulary of reasons a file under `scripts/docs-gen/` may differ from upstream, keyed to the
 * divergence list in `AGENTS.md` ("The pipeline is a COPY of `obsidian-dev-utils`'").
 *
 * A reason outside this map fails the gate, so the baseline cannot drift into free text. Divergence 1 (the
 * package name) is absent on purpose - it is a transform arm, not a reason - and so is the favicon, which
 * is not a `.ts` file and so is not in this tree.
 */
export const DIVERGENCE_REASONS: Readonly<Record<string, string>> = {
  'api-surface-tables': 'The per-package data tables in `api-doc-constants.ts`: `GENERIC_TYPE_PARAMS` and `TS_GLOBAL_TYPES` list the identifiers and external types THIS package\'s API surface actually uses, so they differ by construction.',
  'barrel-entry-points': 'Divergence 2. This package publishes barrel entry points, so a namespace does not map onto an import subpath the way `obsidian-dev-utils`\' does.',
  'excluded-dir-segments': 'Divergence 4. `EXCLUDED_DIR_SEGMENTS` names this package\'s own private trees.',
  'helpers-re-pointed': 'Anything the copy needed from upstream\'s `src/script-utils/*` was re-pointed at this repo\'s `scripts/helpers/*` (`execFromRoot`, `assertNever`).',
  'local-strictness-rewrites': 'Divergence 7. Rules this repo enables that `obsidian-dev-utils` turns off force local rewrites, so a byte-identical copy would be lint-red here.',
  'mock-only-suffix': 'Divergence 3. The `__` suffix that marks a mock-only member has to survive slug generation as `-mock`, or two members collapse onto one route and one page overwrites the other.',
  'satteri-processor': 'Divergence 6. The absolute-to-relative link rewrite is expressed against Sätteri\'s mdast visitor rather than as a remark plugin. This is the one divergence where THIS repo is ahead.',
  'vendored-og-assets': 'This repo vendors the Inter TTFs under `scripts/docs-gen/assets/fonts` and has a favicon to rasterize into every OG card, where upstream has neither, so the asset-loading prose differs.'
};

/**
 * The tree this gate compares, relative to each repo's root.
 *
 * One constant rather than two: the path happens to be the same on both sides, and pretending otherwise
 * would suggest it could be configured when nothing configures it.
 */
export const DOCS_GEN_TREE_PATH = 'scripts/docs-gen';

/**
 * The recorded mechanical divergences, in the order they are applied to upstream's text.
 *
 * Only ONE arm belongs here, and it is here because it is the whole of divergence 1: applying it moves
 * four more files into the byte-identical half, where this gate reports any drift at all rather than only
 * a change of shape. Everything else in the divergence list is semantic - resist adding an arm that
 * merely makes a diff smaller, because an arm that rewrites meaning hides the drift it was meant to
 * expose.
 */
export const TRANSFORM_ARMS: readonly TransformArm[] = [
  {
    apply: (text) => text.replaceAll('obsidian-dev-utils', 'obsidian-test-mocks'),
    paths: [],
    reason: 'Divergence 1 in `AGENTS.md`, in full: the package name, which carries the site title, `BASE_PATH`, every repo and docs URL built from it, and the OG card\'s brand text with it.'
  }
];

/**
 * The upstream files this repo keeps under a different name, as `upstream path` to `local path`.
 *
 * Both sides are relative to {@link DOCS_GEN_TREE_PATH}. Pairing them is what makes divergence 6 checkable
 * rather than merely documented - see the file header.
 */
export const UPSTREAM_TO_LOCAL_RENAMES: Readonly<Record<string, string>> = {
  'helpers/remark-plugins/remark-relative-links.test.ts': 'helpers/satteri-plugins/satteri-relative-links.test.ts',
  'helpers/remark-plugins/remark-relative-links.ts': 'helpers/satteri-plugins/satteri-relative-links.ts'
};

/*
 * How much of the sha-256 of a hunk's changed lines is kept. Twelve hex characters is 48 bits, which is
 * far past what a file of a few dozen hunks needs, and short enough to read in a baseline diff.
 */
const DIGEST_LENGTH = 12;

/**
 * Applies every {@link TRANSFORM_ARMS} arm that covers this file to upstream's text.
 *
 * @param upstreamText - Upstream's file, verbatim.
 * @param treeRelativePath - The file's path relative to {@link DOCS_GEN_TREE_PATH}, upstream's spelling.
 * @returns The text this repo's copy is expected to be diffed against.
 */
export function applyTransformArms(upstreamText: string, treeRelativePath: string): string {
  let text = upstreamText;
  for (const arm of TRANSFORM_ARMS) {
    if (arm.paths.length === 0 || arm.paths.includes(treeRelativePath)) {
      text = arm.apply(text);
    }
  }

  return text;
}

/**
 * Describes how a file's diff shape has moved away from the recorded one.
 *
 * @param treeRelativePath - The file being reported, in upstream's spelling.
 * @param recorded - The shape the baseline holds.
 * @param actual - The shape measured now.
 * @returns A sentence naming what changed, or `null` when the two shapes agree.
 */
export function describeShapeChange(treeRelativePath: string, recorded: readonly DiffHunk[], actual: readonly DiffHunk[]): null | string {
  if (recorded.length === 0 && actual.length > 0) {
    return `${treeRelativePath} was byte-identical to upstream after the recorded transform and now differs, in ${formatHunkCount(actual.length)}.`;
  }

  if (recorded.length > 0 && actual.length === 0) {
    return `${treeRelativePath} differed from upstream in ${formatHunkCount(recorded.length)} and is now byte-identical - upstream has taken this repo's change, or the local divergence was dropped.`;
  }

  if (recorded.length !== actual.length) {
    return `${treeRelativePath} differs from upstream in ${formatHunkCount(actual.length)}, where the baseline records ${formatHunkCount(recorded.length)}.`;
  }

  for (const [index, recordedHunk] of recorded.entries()) {
    const actualHunk = actual[index];
    if (!actualHunk) {
      continue;
    }

    if (actualHunk.digest !== recordedHunk.digest || actualHunk.added !== recordedHunk.added || actualHunk.removed !== recordedHunk.removed) {
      return `${treeRelativePath} still differs from upstream in ${formatHunkCount(actual.length)}, but hunk ${String(index + 1)} has changed: ${formatHunk(recordedHunk)} recorded, ${formatHunk(actualHunk)} now.`;
    }
  }

  return null;
}

/**
 * Renders one hunk the way the failure messages quote it.
 *
 * @param hunk - The hunk to render.
 * @returns A `+added/-removed @digest` string.
 */
export function formatHunk(hunk: DiffHunk): string {
  return `+${String(hunk.added)}/-${String(hunk.removed)} @${hunk.digest}`;
}

/**
 * Resolves where an upstream file lives in this repo.
 *
 * @param upstreamTreeRelativePath - The file's path relative to {@link DOCS_GEN_TREE_PATH} upstream.
 * @returns The matching path in this repo, which differs only for {@link UPSTREAM_TO_LOCAL_RENAMES}.
 */
export function getLocalTreeRelativePath(upstreamTreeRelativePath: string): string {
  return UPSTREAM_TO_LOCAL_RENAMES[upstreamTreeRelativePath] ?? upstreamTreeRelativePath;
}

/**
 * Reduces a `git diff --unified=0` body to the shape this gate baselines.
 *
 * Only what follows the first `@@` is read, which is what keeps the `---` / `+++` file headers from being
 * counted as a removed and an added line. At zero context every line of a hunk body carries a `+`, `-` or
 * `\` marker, so there is no context to strip; a `\ No newline at end of file` marker is real and is kept
 * in the digest without counting towards either side.
 *
 * @param unifiedDiff - The raw output of the diff, headers and all. An empty string means the two files
 * are identical.
 * @returns One entry per hunk, in file order.
 */
export function parseDiffShape(unifiedDiff: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  let currentLines: null | string[] = null;

  for (const line of unifiedDiff.split('\n')) {
    if (line.startsWith('@@')) {
      if (currentLines) {
        hunks.push(toDiffHunk(currentLines));
      }

      currentLines = [];
      continue;
    }

    if (currentLines && (line.startsWith('+') || line.startsWith('-') || line.startsWith('\\'))) {
      currentLines.push(line);
    }
  }

  if (currentLines) {
    hunks.push(toDiffHunk(currentLines));
  }

  return hunks;
}

/**
 * Checks that a baseline entry explains itself.
 *
 * This is the half that keeps the baseline from degrading into counts nobody can check: hunks with no
 * reason are a divergence somebody accepted without saying what it was, and a reason on a file with no
 * hunks is a divergence that has quietly gone away.
 *
 * @param treeRelativePath - The file being reported, in upstream's spelling.
 * @param entry - Its baseline entry.
 * @returns A sentence naming the problem, or `null` when the entry is well-formed.
 */
export function validateBaselineEntry(treeRelativePath: string, entry: BaselineEntry): null | string {
  const unknownReasons = entry.reasons.filter((reason) => !Object.hasOwn(DIVERGENCE_REASONS, reason));
  if (unknownReasons.length > 0) {
    return `${treeRelativePath} is recorded with ${unknownReasons.length === 1 ? 'a reason' : 'reasons'} outside the vocabulary: ${unknownReasons.join(', ')}. The vocabulary is ${Object.keys(DIVERGENCE_REASONS).join(', ')}.`;
  }

  if (entry.hunks.length > 0 && entry.reasons.length === 0) {
    return `${treeRelativePath} records ${formatHunkCount(entry.hunks.length)} with no reason, so nothing says whether that divergence is deliberate.`;
  }

  return entry.hunks.length === 0 && entry.reasons.length > 0
    ? `${treeRelativePath} is byte-identical to upstream yet records ${entry.reasons.join(', ')}, so a divergence that no longer exists is still being claimed.`
    : null;
}

function formatHunkCount(count: number): string {
  return `${String(count)} hunk${count === 1 ? '' : 's'}`;
}

function toDiffHunk(lines: readonly string[]): DiffHunk {
  return {
    added: lines.filter((line) => line.startsWith('+')).length,
    digest: createHash('sha256').update(lines.join('\n'), 'utf-8').digest('hex').slice(0, DIGEST_LENGTH),
    removed: lines.filter((line) => line.startsWith('-')).length
  };
}
