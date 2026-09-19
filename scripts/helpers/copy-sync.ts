/**
 * @file
 *
 * The parts of the copy-sync gate that need no network and no disk, so they can be tested directly.
 *
 * The gate itself lives in `scripts/check-copy-sync.ts`; everything here is what it decides WITH.
 *
 * ## Why this gate is weaker than `check:vendored-eslint-rules`, and what it can still assert
 *
 * `scripts/helpers/eslint-rules/` is byte-identical to `obsidian-dev-utils`' after two mechanical
 * transforms, so that gate asserts identity and reports every difference. The copy-sync areas cannot be
 * held to that: their divergences are semantic - barrel entry points, `-mock` route slugs,
 * `EXCLUDED_DIR_SEGMENTS`, the Sätteri port - and no transform expresses them. Answering "did upstream
 * change anything here that this copy has not taken?" therefore meant hand-diffing every file and
 * classifying every hunk, which is what it cost the last time it was asked.
 *
 * So this records the **shape** of each file's diff against upstream instead of its content: the hunk
 * count, and each hunk's added/removed line counts plus a digest of its changed lines. A file upstream
 * edits gains, loses or alters a hunk; a file this repo edits does too. Either is a prompt to look, which
 * is all a copy-sync area needs.
 *
 * Five things make it more than a number:
 *
 * 1. **The areas are paths, not one tree.** {@link COPY_SYNC_PATHS} holds two trees and three single files,
 *    because `astro.config.ts`, `docs/tsconfig.json` and `build-pages.yml` are as much a copy as
 *    `scripts/docs-gen/` is. A path covers itself or anything under it, so a file needs no separate kind from
 *    a tree, and both sides keep the same spelling - a local/upstream prefix pair would suggest configuration
 *    where there is none.
 * 2. **Two transforms ARE mechanical, and are applied rather than recorded.** The whole of divergence 1 in
 *    `AGENTS.md` is the name - the package name and the display title built from it - so
 *    {@link TRANSFORM_ARMS} applies both and most files are then byte-identical. For those, this gate is
 *    exactly as strong as the rule-source one: the baseline says "no hunks", so any drift at all is
 *    reported. The weaker half is only the remainder.
 * 3. **Every differing file carries a REASON from a closed vocabulary** ({@link DIVERGENCE_REASONS}),
 *    keyed to the divergence list in `AGENTS.md`. A baseline of bare counts degrades into a number nobody
 *    can check; a file whose divergence is recorded with no reason fails this gate rather than passing it.
 * 4. **The rename is a pair, not two one-sided files.** This repo's
 *    `helpers/satteri-plugins/satteri-relative-links.{ts,test.ts}` IS upstream's
 *    `helpers/remark-plugins/remark-relative-links.{ts,test.ts}`, ported to Sätteri. Left unpaired, an
 *    upstream fix to that plugin's slug handling would be invisible here forever, so
 *    {@link UPSTREAM_TO_LOCAL_RENAMES} pairs them and the port's shape is recorded like any other.
 * 5. **A binary file is compared by hash, and knows it is one.** The Inter TTFs under
 *    `scripts/docs-gen/assets/fonts` have no hunks to shape, and `git diff` answers "Binary files differ"
 *    with no `@@` at all - which a hunk parser reads as "identical", the one wrong answer. So a file whose
 *    bytes contain a NUL ({@link isBinaryContent}) records a digest PAIR instead, and a change to either
 *    side moves it. The sniff is content, not an extension list, so a new binary cannot arrive unnoticed.
 *
 * `docs/src/assets/favicon.svg` is the one file in an area that is never compared at all - see
 * {@link NEVER_COMPARED_PATHS}.
 */

import { createHash } from 'node:crypto';

/**
 * A recorded baseline for one upstream file: the shape of its diff against this repo's copy, and why that
 * diff exists at all.
 *
 * An entry with no divergence - no hunks, or two equal digests - is a file that matches upstream after
 * {@link TRANSFORM_ARMS}, and carries no reasons: there is nothing to explain.
 */
export type BaselineEntry = BinaryBaselineEntry | TextBaselineEntry;

/**
 * A binary file's baseline entry.
 */
export interface BinaryBaselineEntry extends BinaryShape {
  readonly reasons: readonly string[];
}

/**
 * The two digests a binary comparison comes down to.
 *
 * Both sides are recorded rather than a single "same or not" flag: a font upstream re-encodes while this
 * repo keeps its own copy would leave a flag reading `false` before and after, which is the drift this gate
 * exists to report.
 */
export interface BinaryDigests {
  readonly local: string;
  readonly upstream: string;
}

/**
 * A binary file's comparison: its bytes on each side, digested.
 */
export interface BinaryShape {
  readonly digests: BinaryDigests;
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
 * What a file's comparison against upstream amounts to, with no judgement about whether it is deliberate.
 */
export type FileShape = BinaryShape | TextShape;

/**
 * A text file's baseline entry.
 */
export interface TextBaselineEntry extends TextShape {
  readonly reasons: readonly string[];
}

/**
 * A text file's comparison: the shape of its diff against upstream.
 */
export interface TextShape {
  readonly hunks: readonly DiffHunk[];
}

/**
 * A deliberate difference that is mechanical enough to be REPRODUCED rather than merely recorded, applied
 * to upstream's text before the diff is taken.
 *
 * An empty `paths` means the arm applies to every file in every area.
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
 * Everything this repo keeps in copy-sync with `obsidian-dev-utils`, as repo-relative paths that are the
 * same on both sides.
 *
 * A path covers itself or anything under it, so the three single files sit here beside the two trees. This
 * is the machine-readable half of the copy-sync list in `AGENTS.md` ("The pipeline is a COPY of
 * `obsidian-dev-utils`'"); the prose half is that list, and the two are meant to say the same thing.
 */
export const COPY_SYNC_PATHS: readonly string[] = [
  '.github/workflows/build-pages.yml',
  'astro.config.ts',
  'docs/src',
  'docs/tsconfig.json',
  'scripts/docs-gen'
];

/**
 * The closed vocabulary of reasons a copied file may differ from upstream, keyed to the divergence list in
 * `AGENTS.md` ("The pipeline is a COPY of `obsidian-dev-utils`'").
 *
 * A reason outside this map fails the gate, so the baseline cannot drift into free text. Divergence 1 (the
 * name) is absent on purpose - it is two transform arms, not a reason.
 */
export const DIVERGENCE_REASONS: Readonly<Record<string, string>> = {
  'api-surface-tables': 'The per-package data tables in `api-doc-constants.ts`: `GENERIC_TYPE_PARAMS` and `TS_GLOBAL_TYPES` list the identifiers and external types THIS package\'s API surface actually uses, so they differ by construction.',
  'barrel-entry-points': 'Divergence 2. This package publishes barrel entry points, so a namespace does not map onto an import subpath the way `obsidian-dev-utils`\' does.',
  'excluded-dir-segments': 'Divergence 4. `EXCLUDED_DIR_SEGMENTS` names this package\'s own private trees.',
  'helpers-re-pointed': 'Anything the copy needed from upstream\'s `src/script-utils/*` was re-pointed at this repo\'s `scripts/helpers/*` (`execFromRoot`, `assertNever`).',
  'local-strictness-rewrites': 'Divergence 7. Rules this repo enables that `obsidian-dev-utils` turns off force local rewrites, so a byte-identical copy would be lint-red here.',
  'mock-only-suffix': 'Divergence 3. The `__` suffix that marks a mock-only member has to survive slug generation as `-mock`, or two members collapse onto one route and one page overwrites the other.',
  'own-favicon-mark': 'Divergence 5. This package has a favicon of its own where `obsidian-dev-utils` has no mark and no logo asset, so prose about what the site renders beside a title differs.',
  'satteri-processor': 'Divergence 6. The absolute-to-relative link rewrite is expressed against Sätteri\'s mdast visitor rather than as a remark plugin. This is the one divergence where THIS repo is ahead.',
  'vendored-og-assets': 'Both repos vendor the Inter TTFs under `scripts/docs-gen/assets/fonts`, but upstream\'s prose still says it does not and has no favicon to rasterize into an OG card, so the asset-loading and footer-branding comments differ.'
};

/**
 * Paths inside a copy-sync area that are NEVER compared, as path to the reason why.
 *
 * A path here is filtered out of BOTH listings, upstream's and this repo's, so an excluded file is not
 * reported as unpaired either. That matters more than it sounds: a gate that reports this repo's own mark
 * as drift on every run is a gate people learn to ignore.
 *
 * Like {@link COPY_SYNC_PATHS}, an entry covers itself or anything under it.
 */
export const NEVER_COMPARED_PATHS: Readonly<Record<string, string>> = {
  'docs/src/assets/favicon.svg': 'Divergence 5. This package\'s own mark - the Obsidian gem with a dashed copy behind it and a green check - not `obsidian-dev-utils`\' laptop-and-Matrix-rain one. It must never be re-synced, so it must never be compared.',
  'docs/src/content': 'Not a copy at all: the guides and `index.mdx` are this package\'s own prose, and `content/docs/api` is generated by `scripts/docs-gen`. Both sides have a tree here and neither takes the other\'s.'
};

/**
 * The recorded mechanical divergences, in the order they are applied to upstream's text.
 *
 * Only the two halves of divergence 1 belong here, and they are here because applying them moves most of
 * the roster into the byte-identical half, where this gate reports any drift at all rather than only a
 * change of shape. Everything else in the divergence list is semantic - resist adding an arm that merely
 * makes a diff smaller, because an arm that rewrites meaning hides the drift it was meant to expose.
 */
export const TRANSFORM_ARMS: readonly TransformArm[] = [
  {
    apply: (text) => text.replaceAll('obsidian-dev-utils', 'obsidian-test-mocks'),
    paths: [],
    reason: 'Divergence 1 in `AGENTS.md`, first half: the package name, which carries `BASE_PATH`, every repo and docs URL built from it, and the OG card\'s brand text with it.'
  },
  {
    apply: (text) => text.replaceAll('Obsidian Dev Utils', 'Obsidian Test Mocks'),
    paths: [],
    reason: 'Divergence 1, second half: the display title the same rename produces, which is how `astro.config.ts` names the site. It appears in no file under `scripts/docs-gen`, so it moves no shape there.'
  }
];

/**
 * The upstream files this repo keeps under a different name, as `upstream path` to `local path`.
 *
 * Both sides are repo-relative. Pairing them is what makes divergence 6 checkable rather than merely
 * documented - see the file header.
 */
export const UPSTREAM_TO_LOCAL_RENAMES: Readonly<Record<string, string>> = {
  'scripts/docs-gen/helpers/remark-plugins/remark-relative-links.test.ts': 'scripts/docs-gen/helpers/satteri-plugins/satteri-relative-links.test.ts',
  'scripts/docs-gen/helpers/remark-plugins/remark-relative-links.ts': 'scripts/docs-gen/helpers/satteri-plugins/satteri-relative-links.ts'
};

/*
 * How much of the sha-256 of a hunk's changed lines, or of a binary file's bytes, is kept. Twelve hex
 * characters is 48 bits, which is far past what a file of a few dozen hunks needs, and short enough to
 * read in a baseline diff.
 */
const DIGEST_LENGTH = 12;

/**
 * Applies every {@link TRANSFORM_ARMS} arm that covers this file to upstream's text.
 *
 * @param upstreamText - Upstream's file, verbatim.
 * @param path - The file's repo-relative path, upstream's spelling.
 * @returns The text this repo's copy is expected to be diffed against.
 */
export function applyTransformArms(upstreamText: string, path: string): string {
  let text = upstreamText;
  for (const arm of TRANSFORM_ARMS) {
    if (arm.paths.length === 0 || arm.paths.includes(path)) {
      text = arm.apply(text);
    }
  }

  return text;
}

/**
 * Describes how a file's comparison against upstream has moved away from the recorded one.
 *
 * @param path - The file being reported, in upstream's spelling.
 * @param recorded - The shape the baseline holds.
 * @param actual - The shape measured now.
 * @returns A sentence naming what changed, or `null` when the two shapes agree.
 */
export function describeShapeChange(path: string, recorded: FileShape, actual: FileShape): null | string {
  if (isBinaryShape(recorded)) {
    return isBinaryShape(actual)
      ? describeBinaryChange(path, recorded.digests, actual.digests)
      : `${path} is recorded as a binary comparison and now reads as text, so the recorded hash says nothing about it.`;
  }

  return isBinaryShape(actual)
    ? `${path} is recorded as a text comparison and now reads as binary, so the recorded hunks say nothing about it.`
    : describeTextChange(path, recorded.hunks, actual.hunks);
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
 * Digests a file's bytes the way a binary comparison records them.
 *
 * @param content - The file's bytes.
 * @returns The truncated sha-256.
 */
export function getContentDigest(content: Uint8Array): string {
  return createHash('sha256').update(content).digest('hex').slice(0, DIGEST_LENGTH);
}

/**
 * Resolves where an upstream file lives in this repo.
 *
 * @param upstreamPath - The file's repo-relative path upstream.
 * @returns The matching path in this repo, which differs only for {@link UPSTREAM_TO_LOCAL_RENAMES}.
 */
export function getLocalPath(upstreamPath: string): string {
  return UPSTREAM_TO_LOCAL_RENAMES[upstreamPath] ?? upstreamPath;
}

/**
 * Decides whether a file is binary, by content rather than by extension.
 *
 * A NUL byte is what no text file this repo ships has and what every font, image and archive has in its
 * first few bytes. Deciding by content is what keeps a new binary from being diffed as text - a diff which
 * `git` answers with "Binary files differ" and no hunks, which a hunk parser reads as identical.
 *
 * @param content - The file's bytes.
 * @returns `true` when the bytes contain a NUL.
 */
export function isBinaryContent(content: Uint8Array): boolean {
  return content.includes(0);
}

/**
 * Decides whether a shape is a binary comparison rather than a diff shape.
 *
 * @param shape - The shape to classify.
 * @returns `true` when the shape holds digests.
 */
export function isBinaryShape(shape: FileShape): shape is BinaryShape {
  return 'digests' in shape;
}

/**
 * Decides whether a path is one this gate compares.
 *
 * @param path - A repo-relative path, upstream's spelling.
 * @returns `true` when the path sits in a {@link COPY_SYNC_PATHS} area and is not in
 * {@link NEVER_COMPARED_PATHS}.
 */
export function isComparedPath(path: string): boolean {
  return COPY_SYNC_PATHS.some((copySyncPath) => isAtOrUnder(path, copySyncPath)) && !isNeverComparedPath(path);
}

/**
 * Decides whether a shape says the two copies match.
 *
 * @param shape - The shape to read.
 * @returns `true` for a text shape with no hunks, and for a binary shape whose two digests agree.
 */
export function isIdenticalShape(shape: FileShape): boolean {
  return isBinaryShape(shape) ? shape.digests.local === shape.digests.upstream : shape.hunks.length === 0;
}

/**
 * Decides whether a path is excluded from comparison outright.
 *
 * @param path - A repo-relative path.
 * @returns `true` when the path is a {@link NEVER_COMPARED_PATHS} entry or sits under one.
 */
export function isNeverComparedPath(path: string): boolean {
  return Object.keys(NEVER_COMPARED_PATHS).some((neverComparedPath) => isAtOrUnder(path, neverComparedPath));
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
 * This is the half that keeps the baseline from degrading into counts nobody can check: a divergence with
 * no reason is one somebody accepted without saying what it was, and a reason on a file that matches
 * upstream is a divergence that has quietly gone away.
 *
 * @param path - The file being reported, in upstream's spelling.
 * @param entry - Its baseline entry.
 * @returns A sentence naming the problem, or `null` when the entry is well-formed.
 */
export function validateBaselineEntry(path: string, entry: BaselineEntry): null | string {
  const unknownReasons = entry.reasons.filter((reason) => !Object.hasOwn(DIVERGENCE_REASONS, reason));
  if (unknownReasons.length > 0) {
    return `${path} is recorded with ${unknownReasons.length === 1 ? 'a reason' : 'reasons'} outside the vocabulary: ${unknownReasons.join(', ')}. The vocabulary is ${Object.keys(DIVERGENCE_REASONS).join(', ')}.`;
  }

  const divergence = describeRecordedDivergence(entry);
  if (divergence !== null && entry.reasons.length === 0) {
    return `${path} records ${divergence} with no reason, so nothing says whether that divergence is deliberate.`;
  }

  return divergence === null && entry.reasons.length > 0
    ? `${path} is byte-identical to upstream yet records ${entry.reasons.join(', ')}, so a divergence that no longer exists is still being claimed.`
    : null;
}

function describeBinaryChange(path: string, recorded: BinaryDigests, actual: BinaryDigests): null | string {
  const sides = [
    recorded.upstream === actual.upstream ? null : `upstream's is @${actual.upstream} where the baseline records @${recorded.upstream}`,
    recorded.local === actual.local ? null : `this repo's is @${actual.local} where the baseline records @${recorded.local}`
  ].filter((side) => side !== null);

  if (sides.length === 0) {
    return null;
  }

  const verdict = actual.local === actual.upstream ? 'and the two now hold the same bytes' : 'and the two hold different bytes';
  return `${path} is binary and compared by hash: ${sides.join(', and ')}, ${verdict}.`;
}

/**
 * Names the divergence a baseline entry records, if it records one.
 *
 * @returns A noun phrase a message can quote, or `null` when the entry says the file matches upstream.
 */
function describeRecordedDivergence(entry: BaselineEntry): null | string {
  if (isIdenticalShape(entry)) {
    return null;
  }

  return isBinaryShape(entry)
    ? `a different hash from upstream's (@${entry.digests.local} against @${entry.digests.upstream})`
    : formatHunkCount(entry.hunks.length);
}

function describeTextChange(path: string, recorded: readonly DiffHunk[], actual: readonly DiffHunk[]): null | string {
  if (recorded.length === 0 && actual.length > 0) {
    return `${path} was byte-identical to upstream after the recorded transforms and now differs, in ${formatHunkCount(actual.length)}.`;
  }

  if (recorded.length > 0 && actual.length === 0) {
    return `${path} differed from upstream in ${formatHunkCount(recorded.length)} and is now byte-identical - upstream has taken this repo's change, or the local divergence was dropped.`;
  }

  if (recorded.length !== actual.length) {
    return `${path} differs from upstream in ${formatHunkCount(actual.length)}, where the baseline records ${formatHunkCount(recorded.length)}.`;
  }

  for (const [index, recordedHunk] of recorded.entries()) {
    const actualHunk = actual[index];
    if (!actualHunk) {
      continue;
    }

    if (actualHunk.digest !== recordedHunk.digest || actualHunk.added !== recordedHunk.added || actualHunk.removed !== recordedHunk.removed) {
      return `${path} still differs from upstream in ${formatHunkCount(actual.length)}, but hunk ${String(index + 1)} has changed: ${formatHunk(recordedHunk)} recorded, ${formatHunk(actualHunk)} now.`;
    }
  }

  return null;
}

function formatHunkCount(count: number): string {
  return `${String(count)} hunk${count === 1 ? '' : 's'}`;
}

function isAtOrUnder(path: string, ancestorPath: string): boolean {
  return path === ancestorPath || path.startsWith(`${ancestorPath}/`);
}

function toDiffHunk(lines: readonly string[]): DiffHunk {
  return {
    added: lines.filter((line) => line.startsWith('+')).length,
    digest: createHash('sha256').update(lines.join('\n'), 'utf-8').digest('hex').slice(0, DIGEST_LENGTH),
    removed: lines.filter((line) => line.startsWith('-')).length
  };
}
