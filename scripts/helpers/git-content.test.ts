/**
 * @file
 *
 * Tests for the index read both copy-sync gates depend on.
 *
 * The fixture is this repository's own index rather than a scratch repo: every property worth asserting
 * here is a property of how `git cat-file` hands bytes back, and a repo built for the test would prove it
 * about that repo rather than about the checkout the gates actually run in.
 *
 * The two that matter are the two reasons this does not go through `execFromRoot` - a binary file survives,
 * and a trailing newline is not eaten. Both were silent failures waiting to happen: the first would have
 * moved the recorded digest of the Inter TTFs on every run, and the second would have reported all 45
 * copy-sync files as differing from upstream by their last line.
 */

import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path/posix';
import {
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

const FONT_PATH = 'scripts/docs-gen/assets/fonts/inter-latin-400-normal.ttf';

/*
 * `00 01 00 00` - the version marker of a TrueType outline font, and the first four bytes of both vendored
 * Inter files. Two of them are NUL, which is precisely what a UTF-8 round trip does not survive.
 */
const TRUE_TYPE_MAGIC = Buffer.from([0x00, 0x01, 0x00, 0x00]);

/**
 * Reads a path the fixture asserts IS tracked, failing loudly rather than handing back a nullable.
 *
 * A `null` here is not the case under test - it is the repository not looking the way this file assumes -
 * so it is worth a sentence saying so.
 */
async function readTracked(root: string, path: string): Promise<Buffer> {
  const content = await readIndexContent(root, path);
  if (content === null) {
    throw new Error(`${path} has no entry in this repository's index, which every assertion below assumes.`);
  }

  return content;
}

describe('readIndexContent', () => {
  const root = toPosixPath(getRootFolder() ?? '');

  it('reads a tracked text file as the bytes a commit would write', async () => {
    const content = await readTracked(root, 'package.json');
    const parsed = JSON.parse(content.toString('utf-8')) as PackageManifest;
    expect(parsed.name).toBe('obsidian-test-mocks');
  });

  it('keeps the trailing newline, which a stdout-trimming exec helper would eat', async () => {
    const content = await readTracked(root, 'package.json');
    expect(content.toString('utf-8').endsWith('}\n')).toBe(true);
  });

  it('returns a binary file byte for byte', async () => {
    const staged = await readTracked(root, FONT_PATH);
    expect(staged.subarray(0, TRUE_TYPE_MAGIC.length).equals(TRUE_TYPE_MAGIC)).toBe(true);
    expect(staged.includes(0)).toBe(true);

    /*
     * The font is a checked-in asset nothing edits, so its staged bytes and its bytes on disk are the same
     * file - which makes the working tree a usable oracle for "nothing was mangled on the way through".
     */
    expect(staged.equals(await readFile(join(root, FONT_PATH)))).toBe(true);
  });

  it('answers null for a path with no index entry, rather than throwing', async () => {
    expect(await readIndexContent(root, 'scripts/helpers/no-such-file.ts')).toBeNull();
  });

  it('answers null for a file that exists on disk but is not tracked', async () => {
    // `node_modules` is ignored, so anything under it is on disk and in no index.
    expect(await readIndexContent(root, 'node_modules/.package-lock.json')).toBeNull();
  });
});
