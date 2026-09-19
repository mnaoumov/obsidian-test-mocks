/**
 * @file
 *
 * Gate for everything this repo keeps in copy-sync with `obsidian-dev-utils`.
 *
 * `scripts/docs-gen/`, `docs/src/`, `astro.config.ts`, `docs/tsconfig.json` and
 * `.github/workflows/build-pages.yml` were copied from that repo and are supposed to be kept in step with
 * it by hand, because this package cannot depend on it (`obsidian-dev-utils` lists `obsidian-test-mocks` in
 * its own devDependencies, so the edge would be a cycle). Nothing kept the copy honest, and the one time the
 * question "did upstream change anything here that this copy has not taken?" was actually asked, answering
 * it meant hand-diffing the tree and classifying every hunk.
 *
 * What this asserts is the SHAPE of each file's diff against upstream, recorded in
 * `copy-sync-baseline.json` - see `scripts/helpers/copy-sync.ts` for why shape rather than identity, for
 * what the baseline holds, and for how a binary file is compared instead. Most of the roster is
 * byte-identical after the recorded transforms, and for those files this is exactly as strong as
 * `check:vendored-eslint-rules`.
 *
 * Three things it does the way its sibling does, for the same reasons:
 *
 * - **The upstream list comes from upstream.** A file added there is not invisible to this check. The
 *   listing is one `git/trees?recursive=1` call rather than a directory walk of the contents API, because
 *   the API is not recursive and this roster spans five areas - and because the rate limit it shares with
 *   `check:vendored-eslint-rules` is 60 requests an hour per address unauthenticated. One call covers every
 *   area. `GITHUB_TOKEN` is used when there is one.
 * - **The sources are read from `raw.githubusercontent.com`.** The published npm package ships `dist/`
 *   only, and reading a sibling checkout would make this pass only on a machine that happens to have one.
 * - **This repo's side is listed with `git ls-files`, not a directory walk.** `docs/src` holds generated,
 *   gitignored output - `generated-sidebar.json` and `content/docs/api/` - which a walk reports as files
 *   paired with nothing upstream. Reading the index also means a pre-commit run sees what is staged, which
 *   is what `nano-staged` is about to commit.
 *
 * Offline, or anywhere the fetch is unwelcome, this is turned off the way every script here is:
 * `CHECK_COPY_SYNC=0`, via {@link exitIfScriptDisabled}. That is an explicit opt-out rather than a silent
 * skip, so a network failure is still reported as a failure.
 *
 * Re-recording the baseline is `npm run check:copy-sync -- --update`, which rewrites the shapes and KEEPS
 * the hand-written reasons. It is not a way to make this green: a file it records with no reason still
 * fails, so accepting a divergence remains an act of writing down what it is.
 */

import { Buffer } from 'node:buffer';
import {
  mkdir,
  readFile,
  writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import {
  basename,
  join
} from 'node:path/posix';
import process from 'node:process';

import type {
  BaselineEntry,
  BinaryBaselineEntry,
  FileShape,
  TextBaselineEntry
} from './helpers/copy-sync.ts';

import {
  applyTransformArms,
  COPY_SYNC_PATHS,
  describeShapeChange,
  DIVERGENCE_REASONS,
  getContentDigest,
  getLocalPath,
  isBinaryContent,
  isBinaryShape,
  isComparedPath,
  isIdenticalShape,
  NEVER_COMPARED_PATHS,
  parseDiffShape,
  TRANSFORM_ARMS,
  validateBaselineEntry
} from './helpers/copy-sync.ts';
import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import {
  execFromRoot,
  getRootFolder,
  toPosixPath
} from './helpers/root.ts';

/**
 * The checked-in record this gate compares against.
 *
 * `localOnlyFiles` is empty today and is here so that the gate stays satisfiable: a file this repo
 * genuinely adds to a copy-sync area has no upstream counterpart and nothing to compare, so the only honest
 * thing to record about it is that it is ours and why.
 */
interface Baseline {
  files: Record<string, BaselineEntry>;
  localOnlyFiles: Record<string, string[]>;
}

/**
 * One blob of GitHub's recursive tree listing, narrowed to the fields this reads.
 */
interface UpstreamTreeEntry {
  path: string;
  type: string;
}

/**
 * The tree listing itself, which GitHub truncates rather than paginating.
 */
interface UpstreamTreeResponse {
  tree: UpstreamTreeEntry[];
  truncated: boolean;
}

const BASELINE_FILE_NAME = 'copy-sync-baseline.json';

const HTTP_STATUS_NOT_FOUND = 404;

/*
 * `git diff --no-index` exits 1 when the files differ and 0 when they do not. Anything above that is the
 * command itself failing, which is reported rather than read as a diff.
 */
const GIT_DIFF_MAX_EXPECTED_EXIT_CODE = 1;

const JSON_INDENT = 2;

const SCRIPT_NAME = 'check:copy-sync';

const UPSTREAM_RAW_BASE_URL = 'https://raw.githubusercontent.com/mnaoumov/obsidian-dev-utils/main';

const UPSTREAM_TREE_URL = 'https://api.github.com/repos/mnaoumov/obsidian-dev-utils/git/trees/main?recursive=1';

const failures: string[] = [];

exitIfScriptDisabled();

/**
 * Every file this repo tracks in a copy-sync area, repo-relative.
 *
 * `git ls-files` rather than a walk - see the file header - and the paths it prints are already posix and
 * already relative to the root.
 */
async function collectLocalPaths(): Promise<string[]> {
  const stdout = await execFromRoot(['git', 'ls-files', '-z', '--', ...COPY_SYNC_PATHS], { isQuiet: true });
  return stdout
    .split('\0')
    .filter((path) => path !== '' && isComparedPath(path))
    .sort((left, right) => left.localeCompare(right));
}

/**
 * Names the command that shows a reader what the numbers above are counting.
 *
 * A binary pair has no diff to read, so it is pointed at the two files instead.
 */
function describeHowToRead(upstreamPath: string, shape: FileShape, scratchDirectory: string): string {
  const localPath = getLocalPath(upstreamPath);
  return isBinaryShape(shape)
    ? `It is binary, so there are no hunks to read: compare ${UPSTREAM_RAW_BASE_URL}/${upstreamPath} with ${localPath} byte for byte.`
    : `Read it with \`git diff --no-index ${getScratchPath(upstreamPath, scratchDirectory)} ${localPath}\`; add \`--unified=0\` to see the hunks the numbers above count.`;
}

async function fetchUpstreamContent(path: string): Promise<Buffer | null> {
  const response = await fetch(`${UPSTREAM_RAW_BASE_URL}/${path}`);
  if (response.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  if (response.status === HTTP_STATUS_NOT_FOUND) {
    return null;
  }

  throw new Error(`Could not read ${path} from ${UPSTREAM_RAW_BASE_URL}: HTTP ${String(response.status)} ${response.statusText}.`);
}

/**
 * Where upstream's transformed text is parked for one file.
 *
 * The path is flattened rather than nested so the scratch directory needs no subdirectories - and so that
 * two areas holding the same relative path cannot collide.
 */
function getScratchPath(upstreamPath: string, scratchDirectory: string): string {
  return join(scratchDirectory, upstreamPath.replaceAll('/', '__'));
}

async function getUpstreamPaths(): Promise<string[]> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json' };
  const token = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
  if (token !== undefined) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(UPSTREAM_TREE_URL, { headers });
  if (!response.ok) {
    throw new Error(
      `Could not list the upstream tree at ${UPSTREAM_TREE_URL}: HTTP ${String(response.status)} ${response.statusText}. A 403 here is almost always GitHub's unauthenticated rate limit; set GITHUB_TOKEN, or turn this check off for the run with CHECK_COPY_SYNC=0.`
    );
  }

  const listing = await response.json() as UpstreamTreeResponse;

  /*
   * GitHub truncates a large tree rather than paginating it, and a truncated listing would silently hide
   * whichever files fell off the end - the one failure mode this listing exists to prevent.
   */
  if (listing.truncated) {
    throw new Error(`${UPSTREAM_TREE_URL} returned a truncated tree, so the upstream file list cannot be trusted.`);
  }

  const paths = listing.tree
    .filter((entry) => entry.type === 'blob' && isComparedPath(entry.path))
    .map((entry) => entry.path)
    .sort((left, right) => left.localeCompare(right));

  if (paths.length === 0) {
    throw new Error(`${UPSTREAM_TREE_URL} listed no files in ${COPY_SYNC_PATHS.join(', ')}, so this check would have compared nothing.`);
  }

  return paths;
}

async function main(): Promise<void> {
  const rootFolder = getRootFolder();
  if (rootFolder === null) {
    console.error(`${SCRIPT_NAME} could not find the repository root.`);
    process.exitCode = 1;
    return;
  }

  const root = toPosixPath(rootFolder);
  const shouldUpdate = process.argv.includes('--update');
  const baseline = await readBaseline(root);

  const upstreamPaths = await getUpstreamPaths();
  const localPaths = await collectLocalPaths();

  const scratchDirectory = toPosixPath(join(tmpdir(), 'check-copy-sync', basename(root)));
  await mkdir(scratchDirectory, { recursive: true });

  const measured = new Map<string, FileShape>();
  for (const upstreamPath of upstreamPaths) {
    const shape = await measureShape(upstreamPath, root, scratchDirectory);
    if (shape) {
      measured.set(upstreamPath, shape);
    }
  }

  reportUnpairedLocalFiles(upstreamPaths, localPaths, baseline);
  reportStaleBaselineEntries(upstreamPaths, baseline);

  /*
   * `--update` rebuilds `files` from what was measured, so a file that could not be compared at all would
   * be dropped from the baseline rather than recorded - losing the record of a divergence because of a
   * failed fetch. A run that could not read every file re-records nothing.
   */
  if (shouldUpdate && measured.size < upstreamPaths.length) {
    failures.push(
      `${BASELINE_FILE_NAME} was NOT rewritten: ${String(upstreamPaths.length - measured.size)} of ${String(upstreamPaths.length)} upstream file(s) could not be compared, and re-recording from a partial measurement would delete their entries. Fix the failures above and run \`--update\` again.`
    );
  } else if (shouldUpdate) {
    await writeBaseline(root, baseline, measured);
  }

  for (const [upstreamPath, shape] of measured) {
    const recorded = baseline.files[upstreamPath];
    if (!recorded) {
      failures.push(
        `${upstreamPath} is not in ${BASELINE_FILE_NAME}, so nothing records what its ${isIdenticalShape(shape) ? 'identity with upstream' : 'divergence from upstream'} is supposed to be. Re-record with \`--update\`, then name the reason.`
      );
      continue;
    }

    const reasonProblem = validateBaselineEntry(upstreamPath, recorded);
    if (reasonProblem) {
      failures.push(reasonProblem);
    }

    const shapeChange = describeShapeChange(upstreamPath, recorded, shape);
    if (!shapeChange) {
      continue;
    }

    failures.push(`${shapeChange} ${describeHowToRead(upstreamPath, shape, scratchDirectory)}`);
  }

  report(measured, shouldUpdate);
}

/**
 * Measures one upstream file against this repo's copy.
 *
 * @returns The shape, or `null` when the pair could not be compared at all - which is reported as its own
 * failure rather than recorded as a shape.
 */
async function measureShape(upstreamPath: string, root: string, scratchDirectory: string): Promise<FileShape | null> {
  const localPath = getLocalPath(upstreamPath);

  const upstreamContent = await fetchUpstreamContent(upstreamPath);
  if (upstreamContent === null) {
    failures.push(
      `${upstreamPath} is in the upstream listing but ${UPSTREAM_RAW_BASE_URL} does not serve it, so nothing could be compared.`
    );
    return null;
  }

  let localContent: Buffer;
  try {
    localContent = await readFile(join(root, localPath));
  } catch {
    failures.push(
      `${upstreamPath} exists upstream and this repo has no ${localPath}. Take it, or - if this repo keeps it under another name - pair the two in \`UPSTREAM_TO_LOCAL_RENAMES\`.`
    );
    return null;
  }

  /*
   * Either side being binary settles it for both: there are no hunks to shape, and `git diff` answers a
   * binary pair with no `@@` at all, which a hunk parser would read as "identical".
   */
  if (isBinaryContent(upstreamContent) || isBinaryContent(localContent)) {
    return { digests: { local: getContentDigest(localContent), upstream: getContentDigest(upstreamContent) } };
  }

  const localText = localContent.toString('utf-8');
  if (localText.includes('\r\n')) {
    failures.push(
      `${localPath} has CRLF line endings, and \`.gitattributes\` declares this repo LF-only. Nothing else catches it in \`scripts/docs-gen\` - that tree is outside dprint's scope - and every line of it reads as changed against upstream.`
    );
    return null;
  }

  const expectedPath = getScratchPath(upstreamPath, scratchDirectory);
  await writeFile(expectedPath, applyTransformArms(upstreamContent.toString('utf-8'), upstreamPath));

  return { hunks: parseDiffShape(await runGitDiff(expectedPath, localPath, root)) };
}

/**
 * Reads the checked-in baseline, treating a missing file as a first run and an unreadable one as a failure.
 *
 * The two are worth telling apart: an empty baseline reports every file as unrecorded, which is the right
 * answer before the first `--update` and a badly misleading one when the file is merely malformed.
 */
async function readBaseline(root: string): Promise<Baseline> {
  let raw: string;
  try {
    raw = await readFile(join(root, BASELINE_FILE_NAME), 'utf-8');
  } catch {
    return { files: {}, localOnlyFiles: {} };
  }

  let parsed: Partial<Baseline>;
  try {
    parsed = JSON.parse(raw) as Partial<Baseline>;
  } catch (error) {
    throw new Error(`${BASELINE_FILE_NAME} is not readable as JSON, so this gate has nothing to compare against.`, { cause: error });
  }

  return {
    files: parsed.files ?? {},
    localOnlyFiles: parsed.localOnlyFiles ?? {}
  };
}

function report(measured: ReadonlyMap<string, FileShape>, didUpdate: boolean): void {
  const comparedCount = measured.size;

  if (failures.length === 0) {
    const shapes = [...measured.values()];
    const identicalCount = shapes.filter((shape) => isIdenticalShape(shape)).length;
    const binaryCount = shapes.filter((shape) => isBinaryShape(shape)).length;
    console.log(
      `${SCRIPT_NAME} passed: ${String(comparedCount)} file(s) compared against upstream across ${String(COPY_SYNC_PATHS.length)} area(s), ${String(identicalCount)} of them identical after the recorded transforms (${String(binaryCount)} compared by hash) and the rest matching their recorded shape${didUpdate ? `, and ${BASELINE_FILE_NAME} rewritten` : ''}.`
    );
    return;
  }

  console.error(`${SCRIPT_NAME} found ${String(failures.length)} problem(s) across ${String(comparedCount)} compared file(s):`);
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }

  console.error('');
  console.error(
    `Each of these is the copy and its source having moved apart. Read the diff, decide which side is right, and then either take upstream's change or record the new shape with \`npm run ${SCRIPT_NAME} -- --update\` and a reason saying what the divergence is.`
  );
  console.error('');
  console.error(`The ${String(TRANSFORM_ARMS.length)} mechanical divergence(s) applied to upstream before the diff is taken, so they are never reported above:`);
  for (const arm of TRANSFORM_ARMS) {
    console.error(`  - ${arm.paths.length === 0 ? 'every file' : arm.paths.join(', ')}: ${arm.reason}`);
  }

  console.error('');
  console.error('Never compared at all, on either side:');
  for (const [path, reason] of Object.entries(NEVER_COMPARED_PATHS)) {
    console.error(`  - ${path}: ${reason}`);
  }

  console.error('');
  console.error('The vocabulary a recorded divergence must name itself with:');
  for (const [reason, description] of Object.entries(DIVERGENCE_REASONS)) {
    console.error(`  - ${reason}: ${description}`);
  }

  process.exitCode = 1;
}

function reportStaleBaselineEntries(upstreamPaths: readonly string[], baseline: Baseline): void {
  for (const recordedPath of Object.keys(baseline.files)) {
    if (upstreamPaths.includes(recordedPath)) {
      continue;
    }

    failures.push(
      `${BASELINE_FILE_NAME} records ${recordedPath}, which upstream no longer publishes. Delete the entry, and delete this repo's copy of the file unless it has become ours - in which case record it in \`localOnlyFiles\`.`
    );
  }
}

/**
 * Reports tracked files in a copy-sync area that no upstream file pairs with.
 *
 * A file this repo added deliberately is recorded in the baseline's `localOnlyFiles`; anything else is
 * either a copy of an upstream file under a name nothing has paired, or a file that stopped existing
 * upstream - both of which these areas should not carry silently.
 */
function reportUnpairedLocalFiles(upstreamPaths: readonly string[], localPaths: readonly string[], baseline: Baseline): void {
  const pairedLocalPaths = new Set(upstreamPaths.map((path) => getLocalPath(path)));
  for (const localPath of localPaths) {
    if (pairedLocalPaths.has(localPath) || Object.hasOwn(baseline.localOnlyFiles, localPath)) {
      continue;
    }

    failures.push(
      `${localPath} pairs with nothing upstream, so this gate says nothing about it. Pair it in \`UPSTREAM_TO_LOCAL_RENAMES\` if it is an upstream file under another name, or record it in ${BASELINE_FILE_NAME}'s \`localOnlyFiles\` with the reason it is ours.`
    );
  }

  for (const [localPath, reasons] of Object.entries(baseline.localOnlyFiles)) {
    if (!localPaths.includes(localPath)) {
      failures.push(`${BASELINE_FILE_NAME} records ${localPath} as this repo's own, and no such tracked file exists in a copy-sync area.`);
      continue;
    }

    if (reasons.length === 0) {
      failures.push(`${BASELINE_FILE_NAME} records ${localPath} as this repo's own with no reason saying why.`);
    }
  }
}

async function runGitDiff(expectedPath: string, localPath: string, root: string): Promise<string> {
  /*
   * Every `-c` here pins a setting that would otherwise change where git puts the hunk boundaries, and so
   * change the recorded shape on a machine whose git config differs. `--no-ext-diff` keeps a configured
   * external differ from answering instead of git.
   */
  const result = await execFromRoot(
    [
      'git',
      '-c',
      'diff.algorithm=myers',
      '-c',
      'diff.indentHeuristic=true',
      'diff',
      '--no-index',
      '--no-ext-diff',
      '--no-color',
      '--unified=0',
      '--',
      expectedPath,
      join(root, localPath)
    ],
    { isQuiet: true, shouldIgnoreExitCode: true, shouldIncludeDetails: true }
  );

  if (result.exitCode === null || result.exitCode > GIT_DIFF_MAX_EXPECTED_EXIT_CODE) {
    throw new Error(`\`git diff --no-index\` failed on ${localPath} with exit code ${result.exitCode === null ? '(null)' : String(result.exitCode)}:\n${result.stderr}`);
  }

  return result.stdout;
}

function toBaselineEntry(shape: FileShape, reasons: readonly string[]): BaselineEntry {
  return isBinaryShape(shape)
    ? { digests: shape.digests, reasons } satisfies BinaryBaselineEntry
    : { hunks: shape.hunks, reasons } satisfies TextBaselineEntry;
}

async function writeBaseline(root: string, baseline: Baseline, measured: ReadonlyMap<string, FileShape>): Promise<void> {
  const files: Record<string, BaselineEntry> = {};
  for (const upstreamPath of [...measured.keys()].sort((left, right) => left.localeCompare(right))) {
    const shape = measured.get(upstreamPath);
    if (!shape) {
      continue;
    }

    // A file that has become identical keeps no reason: there is no longer a divergence to explain.
    const reasons = isIdenticalShape(shape) ? [] : baseline.files[upstreamPath]?.reasons ?? [];
    files[upstreamPath] = toBaselineEntry(shape, reasons);
  }

  baseline.files = files;
  await writeFile(join(root, BASELINE_FILE_NAME), `${JSON.stringify(baseline, null, JSON_INDENT)}\n`);
}

await main();
