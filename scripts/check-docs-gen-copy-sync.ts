/**
 * @file
 *
 * Gate for the documentation pipeline this repo keeps in copy-sync with `obsidian-dev-utils`'.
 *
 * Everything under `scripts/docs-gen/` was copied from that repo and is supposed to be kept in step with
 * it by hand, because this package cannot depend on it (`obsidian-dev-utils` lists `obsidian-test-mocks`
 * in its own devDependencies, so the edge would be a cycle). Nothing kept the copy honest, and the one
 * time the question "did upstream change anything here that this copy has not taken?" was actually asked,
 * answering it meant hand-diffing 26 files and classifying every hunk.
 *
 * What this asserts is the SHAPE of each file's diff against upstream, recorded in
 * `docs-gen-copy-sync-baseline.json` - see `scripts/helpers/docs-gen-copy-sync.ts` for why shape rather
 * than identity, and for what the baseline holds. 15 of the 26 files are byte-identical after the one
 * recorded transform, and for those this is exactly as strong as `check:vendored-eslint-rules`.
 *
 * Two things it does the way its sibling does, for the same reasons:
 *
 * - **The upstream list comes from upstream.** A file added there is not invisible to this check. The
 *   listing is one `git/trees?recursive=1` call rather than a directory walk of the contents API, because
 *   this tree is two levels deep and the API is not recursive - and because the rate limit it shares with
 *   `check:vendored-eslint-rules` is 60 requests an hour per address unauthenticated. `GITHUB_TOKEN` is
 *   used when there is one.
 * - **The sources are read from `raw.githubusercontent.com`.** The published npm package ships `dist/`
 *   only, and reading a sibling checkout would make this pass only on a machine that happens to have one.
 *
 * Offline, or anywhere the fetch is unwelcome, this is turned off the way every script here is:
 * `CHECK_DOCS_GEN_COPY_SYNC=0`, via {@link exitIfScriptDisabled}. That is an explicit opt-out rather than a
 * silent skip, so a network failure is still reported as a failure.
 *
 * Re-recording the baseline is `npm run check:docs-gen-copy-sync -- --update`, which rewrites the shapes
 * and KEEPS the hand-written reasons. It is not a way to make this green: a file it records with no reason
 * still fails, so accepting a divergence remains an act of writing down what it is.
 */

import {
  mkdir,
  readdir,
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
  DiffHunk
} from './helpers/docs-gen-copy-sync.ts';

import {
  applyTransformArms,
  describeShapeChange,
  DIVERGENCE_REASONS,
  DOCS_GEN_TREE_PATH,
  getLocalTreeRelativePath,
  parseDiffShape,
  TRANSFORM_ARMS,
  validateBaselineEntry
} from './helpers/docs-gen-copy-sync.ts';
import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import {
  execFromRoot,
  getRootFolder,
  toPosixPath
} from './helpers/root.ts';

/**
 * The checked-in record this gate compares against.
 *
 * `localOnlyFiles` is empty today and is here so that the gate stays satisfiable: a `.ts` file this repo
 * genuinely adds to the tree has no upstream counterpart and no diff to shape, so the only honest thing to
 * record about it is that it is ours and why.
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

const BASELINE_FILE_NAME = 'docs-gen-copy-sync-baseline.json';

const HTTP_STATUS_NOT_FOUND = 404;

/*
 * `git diff --no-index` exits 1 when the files differ and 0 when they do not. Anything above that is the
 * command itself failing, which is reported rather than read as a diff.
 */
const GIT_DIFF_MAX_EXPECTED_EXIT_CODE = 1;

const JSON_INDENT = 2;

const SCRIPT_NAME = 'check:docs-gen-copy-sync';

const UPSTREAM_RAW_BASE_URL = 'https://raw.githubusercontent.com/mnaoumov/obsidian-dev-utils/main';

const UPSTREAM_TREE_URL = 'https://api.github.com/repos/mnaoumov/obsidian-dev-utils/git/trees/main?recursive=1';

const failures: string[] = [];

exitIfScriptDisabled();

/**
 * Every `.ts` file this repo keeps under the tree, relative to it.
 */
async function collectLocalTreeRelativePaths(treeDirectory: string): Promise<string[]> {
  const found: string[] = [];

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.name.endsWith('.ts')) {
        found.push(path.slice(treeDirectory.length + 1));
      }
    }
  }

  await walk(treeDirectory);
  return found.sort((left, right) => left.localeCompare(right));
}

async function fetchUpstreamText(treeRelativePath: string): Promise<null | string> {
  const response = await fetch(`${UPSTREAM_RAW_BASE_URL}/${DOCS_GEN_TREE_PATH}/${treeRelativePath}`);
  if (response.ok) {
    return await response.text();
  }

  if (response.status === HTTP_STATUS_NOT_FOUND) {
    return null;
  }

  throw new Error(`Could not read ${treeRelativePath} from ${UPSTREAM_RAW_BASE_URL}: HTTP ${String(response.status)} ${response.statusText}.`);
}

async function getUpstreamTreeRelativePaths(): Promise<string[]> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json' };
  const token = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
  if (token !== undefined) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(UPSTREAM_TREE_URL, { headers });
  if (!response.ok) {
    throw new Error(
      `Could not list the upstream tree at ${UPSTREAM_TREE_URL}: HTTP ${String(response.status)} ${response.statusText}. A 403 here is almost always GitHub's unauthenticated rate limit; set GITHUB_TOKEN, or turn this check off for the run with CHECK_DOCS_GEN_COPY_SYNC=0.`
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

  const prefix = `${DOCS_GEN_TREE_PATH}/`;
  const paths = listing.tree
    .filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix) && entry.path.endsWith('.ts'))
    .map((entry) => entry.path.slice(prefix.length))
    .sort((left, right) => left.localeCompare(right));

  if (paths.length === 0) {
    throw new Error(`${UPSTREAM_TREE_URL} listed no \`.ts\` files under ${DOCS_GEN_TREE_PATH}, so this check would have compared nothing.`);
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

  const upstreamTreeRelativePaths = await getUpstreamTreeRelativePaths();
  const localTreeRelativePaths = await collectLocalTreeRelativePaths(join(root, DOCS_GEN_TREE_PATH));

  const scratchDirectory = toPosixPath(join(tmpdir(), 'check-docs-gen-copy-sync', basename(root)));
  await mkdir(scratchDirectory, { recursive: true });

  const measured = new Map<string, DiffHunk[]>();
  for (const upstreamTreeRelativePath of upstreamTreeRelativePaths) {
    const hunks = await measureShape(upstreamTreeRelativePath, root, scratchDirectory);
    if (hunks) {
      measured.set(upstreamTreeRelativePath, hunks);
    }
  }

  reportUnpairedLocalFiles(upstreamTreeRelativePaths, localTreeRelativePaths, baseline);
  reportStaleBaselineEntries(upstreamTreeRelativePaths, baseline);

  /*
   * `--update` rebuilds `files` from what was measured, so a file that could not be compared at all would
   * be dropped from the baseline rather than recorded - losing the record of a divergence because of a
   * failed fetch. A run that could not read every file re-records nothing.
   */
  if (shouldUpdate && measured.size < upstreamTreeRelativePaths.length) {
    failures.push(
      `${BASELINE_FILE_NAME} was NOT rewritten: ${String(upstreamTreeRelativePaths.length - measured.size)} of ${String(upstreamTreeRelativePaths.length)} upstream file(s) could not be compared, and re-recording from a partial measurement would delete their entries. Fix the failures above and run \`--update\` again.`
    );
  } else if (shouldUpdate) {
    await writeBaseline(root, baseline, measured);
  }

  for (const [upstreamTreeRelativePath, hunks] of measured) {
    const entry = baseline.files[upstreamTreeRelativePath];
    if (!entry) {
      failures.push(
        `${upstreamTreeRelativePath} is not in ${BASELINE_FILE_NAME}, so nothing records what its ${hunks.length === 0 ? 'identity with upstream' : 'divergence from upstream'} is supposed to be. Re-record with \`--update\`, then name the reason.`
      );
      continue;
    }

    const reasonProblem = validateBaselineEntry(upstreamTreeRelativePath, entry);
    if (reasonProblem) {
      failures.push(reasonProblem);
    }

    const shapeChange = describeShapeChange(upstreamTreeRelativePath, entry.hunks, hunks);
    if (!shapeChange) {
      continue;
    }

    const localPath = `${DOCS_GEN_TREE_PATH}/${getLocalTreeRelativePath(upstreamTreeRelativePath)}`;
    const expectedPath = join(scratchDirectory, upstreamTreeRelativePath.replaceAll('/', '__'));
    failures.push(
      `${shapeChange} Read it with \`git diff --no-index ${expectedPath} ${localPath}\`; add \`--unified=0\` to see the hunks the numbers above count.`
    );
  }

  report(measured, shouldUpdate);
}

/**
 * Measures the shape of one upstream file's diff against this repo's copy.
 *
 * @returns The hunks, or `null` when the pair could not be compared at all - which is reported as its own
 * failure rather than recorded as a shape.
 */
async function measureShape(upstreamTreeRelativePath: string, root: string, scratchDirectory: string): Promise<DiffHunk[] | null> {
  const localTreeRelativePath = getLocalTreeRelativePath(upstreamTreeRelativePath);
  const localPath = `${DOCS_GEN_TREE_PATH}/${localTreeRelativePath}`;

  const upstreamText = await fetchUpstreamText(upstreamTreeRelativePath);
  if (upstreamText === null) {
    failures.push(
      `${upstreamTreeRelativePath} is in the upstream listing but ${UPSTREAM_RAW_BASE_URL} does not serve it, so nothing could be compared.`
    );
    return null;
  }

  let localText: string;
  try {
    localText = await readFile(join(root, localPath), 'utf-8');
  } catch {
    failures.push(
      `${upstreamTreeRelativePath} exists upstream and this repo has no ${localPath}. Take it, or - if this repo keeps it under another name - pair the two in \`UPSTREAM_TO_LOCAL_RENAMES\`.`
    );
    return null;
  }

  if (localText.includes('\r\n')) {
    failures.push(
      `${localPath} has CRLF line endings, and \`.gitattributes\` declares this repo LF-only. Nothing else catches it here - \`scripts/docs-gen\` is outside dprint's scope - and every line of it reads as changed against upstream.`
    );
    return null;
  }

  const expectedPath = join(scratchDirectory, upstreamTreeRelativePath.replaceAll('/', '__'));
  await writeFile(expectedPath, applyTransformArms(upstreamText, upstreamTreeRelativePath));

  return parseDiffShape(await runGitDiff(expectedPath, localPath, root));
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

function report(measured: ReadonlyMap<string, DiffHunk[]>, didUpdate: boolean): void {
  const comparedCount = measured.size;

  if (failures.length === 0) {
    const identicalCount = [...measured.values()].filter((hunks) => hunks.length === 0).length;
    console.log(
      `${SCRIPT_NAME} passed: ${String(comparedCount)} file(s) compared against upstream, ${String(identicalCount)} of them byte-identical after the recorded transform and the rest matching their recorded shape${didUpdate ? `, and ${BASELINE_FILE_NAME} rewritten` : ''}.`
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
  console.error('The vocabulary a recorded divergence must name itself with:');
  for (const [reason, description] of Object.entries(DIVERGENCE_REASONS)) {
    console.error(`  - ${reason}: ${description}`);
  }

  process.exitCode = 1;
}

function reportStaleBaselineEntries(upstreamTreeRelativePaths: readonly string[], baseline: Baseline): void {
  for (const recordedPath of Object.keys(baseline.files)) {
    if (upstreamTreeRelativePaths.includes(recordedPath)) {
      continue;
    }

    failures.push(
      `${BASELINE_FILE_NAME} records ${recordedPath}, which upstream no longer publishes. Delete the entry, and delete this repo's copy of the file unless it has become ours - in which case record it in \`localOnlyFiles\`.`
    );
  }
}

/**
 * Reports local `.ts` files that no upstream file pairs with.
 *
 * A file this repo added deliberately is recorded in the baseline's `localOnlyFiles`; anything else is
 * either a copy of an upstream file under a name nothing has paired, or a file that stopped existing
 * upstream - both of which this tree should not carry silently.
 */
function reportUnpairedLocalFiles(upstreamTreeRelativePaths: readonly string[], localTreeRelativePaths: readonly string[], baseline: Baseline): void {
  const pairedLocalPaths = new Set(upstreamTreeRelativePaths.map((path) => getLocalTreeRelativePath(path)));
  for (const localTreeRelativePath of localTreeRelativePaths) {
    if (pairedLocalPaths.has(localTreeRelativePath) || Object.hasOwn(baseline.localOnlyFiles, localTreeRelativePath)) {
      continue;
    }

    failures.push(
      `${DOCS_GEN_TREE_PATH}/${localTreeRelativePath} pairs with nothing upstream, so this gate says nothing about it. Pair it in \`UPSTREAM_TO_LOCAL_RENAMES\` if it is an upstream file under another name, or record it in ${BASELINE_FILE_NAME}'s \`localOnlyFiles\` with the reason it is ours.`
    );
  }

  for (const [localTreeRelativePath, reasons] of Object.entries(baseline.localOnlyFiles)) {
    if (!localTreeRelativePaths.includes(localTreeRelativePath)) {
      failures.push(`${BASELINE_FILE_NAME} records ${DOCS_GEN_TREE_PATH}/${localTreeRelativePath} as this repo's own, and no such file exists.`);
      continue;
    }

    if (reasons.length === 0) {
      failures.push(`${BASELINE_FILE_NAME} records ${DOCS_GEN_TREE_PATH}/${localTreeRelativePath} as this repo's own with no reason saying why.`);
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

async function writeBaseline(root: string, baseline: Baseline, measured: ReadonlyMap<string, DiffHunk[]>): Promise<void> {
  const files: Record<string, BaselineEntry> = {};
  for (const upstreamTreeRelativePath of [...measured.keys()].sort((left, right) => left.localeCompare(right))) {
    const hunks = measured.get(upstreamTreeRelativePath) ?? [];
    files[upstreamTreeRelativePath] = {
      hunks,
      // A file that has become byte-identical keeps no reason: there is no longer a divergence to explain.
      reasons: hunks.length === 0 ? [] : baseline.files[upstreamTreeRelativePath]?.reasons ?? []
    };
  }

  baseline.files = files;
  await writeFile(join(root, BASELINE_FILE_NAME), `${JSON.stringify(baseline, null, JSON_INDENT)}\n`);
}

await main();
