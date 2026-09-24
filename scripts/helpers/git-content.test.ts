/**
 * @file
 *
 * Tests for the index read this repo's byte-identity gates depend on.
 *
 * **This file is repo-neutral on purpose, and carried byte-identical by `obsidian-test-mocks` and
 * `typescript-template`.** Every fixture that could name one repo - its package name, a binary asset only it
 * tracks - is derived instead, so no copy needs a recorded divergence from another. Keep it that way: a
 * case that asserts something only true of one checkout belongs in that checkout's own suite, not here.
 *
 * The fixture for everything that can use it is **this repository's own index** rather than a scratch repo:
 * those properties are properties of how `git cat-file` hands bytes back, and a repo built for the test would
 * prove them about that repo rather than about the checkout the gates actually run in.
 *
 * The two that matter most are the two reasons `readIndexContent` does not go through `execFromRoot` - a
 * binary blob survives, and a trailing newline is not eaten. Both are silent failures waiting to happen: the
 * first would move the recorded digest of any binary a gate compares by hash, and the second would report
 * every compared text file as differing from upstream by its last line.
 *
 * **The binary property is asserted twice, and neither copy is redundant.** A repo that tracks no binary has
 * no fixture in its own index for it, so one case builds a scratch repo holding a blob of known bytes - the
 * one departure from the own-index rule, and a deliberate one: a primitive whose exactness depends on which
 * files a caller hands it is the wrong thing to build on. The other case asserts it over every blob git
 * itself classifies as binary in THIS index, which is the fixture rule applied as far as it reaches, and is
 * reported skipped rather than vacuously green where that set is empty.
 *
 * **A path git cannot find and a folder that is not a repository both exit 128**, and `isMissingPath` tells
 * them apart by the message alone: the first is reported as an absent blob, the second is thrown. The last
 * case pins that distinction, which the prose around `isMissingPath` is entirely about.
 */

import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import {
  dirname,
  join
} from 'node:path/posix';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it
} from 'vitest';

import { readIndexContent } from './git-content.ts';
import {
  getRootFolder,
  toPosixPath
} from './root.ts';

/**
 * The fields this reads out of the staged `package.json`, which is only enough to prove it is that file.
 */
interface PackageManifest {
  name: string;
}

const BINARY_FIXTURE_NAME = 'blob.bin';

/*
 * `00` and `01` are a NUL and a control byte; `fe ff` can appear in no valid UTF-8 sequence at all. Between
 * them they are precisely what a `data.toString('utf-8')` round trip does not survive, and the NUL is also
 * what makes git classify the blob as binary and leave it alone.
 */
const BINARY_FIXTURE_CONTENT = Buffer.from([0x41, 0x42, 0x00, 0x01, 0xFE, 0xFF, 0x43, 0x44]);

const GIT_EXIT_FATAL = 128;

/*
 * How `git ls-files --eol` reports a blob whose index content git classifies as binary - by the same NUL test
 * it uses to decide what to diff and what to convert.
 */
const INDEX_BINARY_MARKER = 'i/-text';

let scratchRepoFolder = '';
let nonRepoFolder = '';

/**
 * Asserts a folder is outside every git repository, which the non-repository case below assumes of `tmpdir()`.
 *
 * The walk is `getRootFolder`'s, looking for `.git` instead of `package.json` - i.e. the same search git
 * itself reports as "not a git repository (or any of the parent directories)". A temp folder inside a
 * repository would make that case assert the missing-path branch instead, and pass for the wrong reason, so
 * it is worth a sentence rather than a silent pass.
 *
 * @param folder - The folder to check.
 */
function assertOutsideRepo(folder: string): void {
  let currentFolder = folder;
  while (currentFolder !== '.' && currentFolder !== '/') {
    if (existsSync(join(currentFolder, '.git'))) {
      throw new Error(`${folder} is inside the repository at ${currentFolder}, so it cannot stand in for a folder that is not one. The non-repository case below assumes the platform temp folder is outside every repository.`);
    }

    const parentFolder = dirname(currentFolder);
    if (parentFolder === currentFolder) {
      return;
    }

    currentFolder = parentFolder;
  }
}

/**
 * Lists the paths whose index blob git classifies as binary.
 *
 * Git's own classification rather than a NUL scan of every tracked file here: it is one call, and it is the
 * definition every other part of git - `diff`, `text=auto` conversion - already answers to.
 *
 * @param root - The repository root.
 * @returns The posix-spelled, repo-relative paths, sorted by git.
 */
function listTrackedBinaries(root: string): string[] {
  const result = spawnSync('git', ['-C', root, 'ls-files', '--eol', '-z'], { windowsHide: true });
  if (result.error) {
    throw new Error(`Could not run \`git ls-files\` in ${root}.`, { cause: result.error });
  }

  if (result.status !== 0) {
    throw new Error(`\`git ls-files\` failed in ${root}:\n${result.stderr.toString('utf-8').trim()}`);
  }

  const paths: string[] = [];
  for (const entry of result.stdout.toString('utf-8').split('\0')) {
    // The path is everything after the first tab; `-z` means it is not quoted and may itself hold one.
    const tabIndex = entry.indexOf('\t');
    if (tabIndex !== -1 && entry.startsWith(INDEX_BINARY_MARKER)) {
      paths.push(entry.slice(tabIndex + 1));
    }
  }

  return paths;
}

/**
 * Makes a temp folder for a fixture, posix-spelled the way the rest of these helpers spell paths.
 *
 * @param prefix - The `mkdtemp` prefix, which names the fixture in whatever is left behind if a run dies.
 * @returns The folder's path.
 */
function makeTemporaryFolder(prefix: string): string {
  const folder = mkdtempSync(join(tmpdir(), prefix));
  return toPosixPath(folder);
}

/**
 * Reads a path the fixture asserts IS tracked, failing loudly rather than handing back a nullable.
 *
 * A `null` here is not the case under test - it is the repository not looking the way this file assumes -
 * so it is worth a sentence saying so.
 *
 * @param root - The directory the path is relative to.
 * @param path - The file's path relative to `root`, posix-spelled.
 * @returns The staged bytes.
 */
async function readTracked(root: string, path: string): Promise<Buffer> {
  const content = await readIndexContent(root, path);
  if (content === null) {
    throw new Error(`${path} has no entry in the index of ${root}, which the assertion reading it assumes.`);
  }

  return content;
}

/**
 * Runs git in a fixture folder, failing loudly on a non-zero exit.
 *
 * The fixtures are built with a real git rather than by writing index bytes by hand, because what is under
 * test is agreement with git and a hand-built index would only prove agreement with this file's idea of one.
 *
 * @param folder - The folder to run git in.
 * @param gitArguments - The arguments after `-C <folder>`.
 */
function runGit(folder: string, gitArguments: readonly string[]): void {
  const result = spawnSync('git', ['-C', folder, ...gitArguments], { windowsHide: true });
  if (result.error) {
    throw new Error(`Could not run \`git ${gitArguments.join(' ')}\` while building the fixture in ${folder}.`, { cause: result.error });
  }

  if (result.status === 0) {
    return;
  }

  const exitCode = result.status === null ? '(null)' : String(result.status);
  throw new Error(`\`git ${gitArguments.join(' ')}\` failed with exit code ${exitCode} while building the fixture in ${folder}:\n${result.stderr.toString('utf-8').trim()}`);
}

beforeAll(() => {
  scratchRepoFolder = makeTemporaryFolder('git-content-repo-');
  writeFileSync(join(scratchRepoFolder, BINARY_FIXTURE_NAME), BINARY_FIXTURE_CONTENT);
  runGit(scratchRepoFolder, ['init', '--quiet']);
  runGit(scratchRepoFolder, ['add', BINARY_FIXTURE_NAME]);

  nonRepoFolder = makeTemporaryFolder('git-content-bare-');
  assertOutsideRepo(nonRepoFolder);
});

afterAll(() => {
  for (const folder of [scratchRepoFolder, nonRepoFolder]) {
    if (folder !== '') {
      rmSync(folder, { force: true, recursive: true });
    }
  }
});

describe('readIndexContent', () => {
  const root = toPosixPath(getRootFolder() ?? '');
  const trackedBinaries = listTrackedBinaries(root);

  it('reads a tracked text file as the bytes a commit would write', async () => {
    const content = await readTracked(root, 'package.json');
    const parsed = JSON.parse(content.toString('utf-8')) as PackageManifest;

    /*
     * The working tree's manifest is the oracle rather than a literal, so the case names no repo. A package
     * is not renamed mid-edit, so the two agree whenever the staged file really is `package.json`.
     */
    const onDisk = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as PackageManifest;
    expect(parsed.name).not.toBe('');
    expect(parsed.name).toBe(onDisk.name);
  });

  it('keeps the trailing newline, which a stdout-trimming exec helper would eat', async () => {
    const content = await readTracked(root, 'package.json');
    expect(content.toString('utf-8').endsWith('}\n')).toBe(true);
  });

  it('returns a binary blob byte for byte', async () => {
    const staged = await readTracked(scratchRepoFolder, BINARY_FIXTURE_NAME);
    expect(staged.includes(0)).toBe(true);
    expect(staged.equals(BINARY_FIXTURE_CONTENT)).toBe(true);

    /*
     * Nothing rewrites the fixture between the `git add` above and here, so its staged bytes and its bytes on
     * disk are the same file - which makes the working tree a second oracle for "nothing was mangled on the
     * way through", independent of the literal this file declares.
     */
    const onDisk = readFileSync(join(scratchRepoFolder, BINARY_FIXTURE_NAME));
    expect(staged.equals(onDisk)).toBe(true);
  });

  it.skipIf(trackedBinaries.length === 0)('returns every binary this repository tracks byte for byte', async () => {
    for (const path of trackedBinaries) {
      const staged = await readTracked(root, path);

      /*
       * A tracked binary is an asset nothing edits, so its staged bytes and its bytes on disk are the same
       * file - the working tree is the oracle. The NUL check is what makes it a binary case at all: git's
       * classification is by the same test.
       */
      expect(staged.includes(0), path).toBe(true);
      expect(staged.equals(readFileSync(join(root, path))), path).toBe(true);
    }
  });

  it('answers null for a path with no index entry, rather than throwing', async () => {
    expect(await readIndexContent(root, 'scripts/helpers/no-such-file.ts')).toBeNull();
  });

  it('answers null for a file that exists on disk but is not tracked', async () => {
    // `node_modules` is ignored, so anything under it is on disk and in no index.
    expect(await readIndexContent(root, 'node_modules/.package-lock.json')).toBeNull();
  });

  it('throws for a folder that is not a repository, rather than reporting an absent blob', async () => {
    const readingOutsideARepo = readIndexContent(nonRepoFolder, 'package.json');

    await expect(readingOutsideARepo).rejects.toThrow(`failed with exit code ${String(GIT_EXIT_FATAL)}`);
    await expect(readingOutsideARepo).rejects.toThrow('not a git repository');
  });
});
