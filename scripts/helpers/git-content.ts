/**
 * @file
 *
 * Reading a tracked file as it is about to be COMMITTED, rather than as it sits in the working tree.
 *
 * Both copy-sync gates - `check:copy-sync` and `check:vendored-eslint-rules` - assert something about the
 * bytes of a file that is going to be committed, and both run from `nano-staged` alongside `lint:fix` and
 * `format`, which rewrite staged files in place. **nano-staged builds one task group per pattern and runs
 * the groups with `Promise.all`** (measured against nano-staged 1.0.2, 2026-09-19), so no arrangement of
 * keys makes a gate follow the fixer: sequencing exists within a single key's command list and nowhere
 * else. A gate reading the working tree therefore races the fixer, and which bytes it sees is a coin toss.
 *
 * Reading the index instead makes the ordering irrelevant rather than enforced. It also makes the gates
 * answer the question they are actually asked when a developer runs one by hand mid-edit: the subject is
 * what will be committed, not whatever the editor happens to be holding.
 *
 * On a clean checkout - CI, or a fresh clone - the index and the working tree hold the same bytes, so this
 * changes nothing there.
 *
 * ## Why this does not go through `execFromRoot`
 *
 * Two reasons, and either alone would be enough:
 *
 * - **It decodes stdout as UTF-8.** The copy-sync roster carries binary files (the Inter TTFs under
 *   `scripts/docs-gen/assets/fonts`), which are compared by hash, and a round trip through a JavaScript
 *   string does not preserve their bytes.
 * - **It strips one trailing newline.** Every text file here ends with one, so every file would read as
 *   differing from upstream by its last line.
 *
 * So this spawns `git` directly and concatenates Buffers.
 */

import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';

/**
 * Reads one tracked file's content out of the git index - stage 0, the bytes `git commit` would write.
 *
 * The path is passed in the `:./<path>` form, which git resolves against the process's directory prefix
 * rather than against the top of the working tree. That is what keeps this correct when the package root this
 * is called with is not itself the repository root - a self-contained subpackage, for instance.
 *
 * No smudge filter or line-ending conversion is applied: `git cat-file blob` hands back the blob verbatim,
 * which for this repo means the LF-normalized bytes `.gitattributes` declares.
 *
 * @param root - The directory the path is relative to, which is also the directory git is run from.
 * @param repoRelativePath - The file's path relative to `root`, posix-spelled.
 * @returns The staged bytes, or `null` when the path has no stage-0 index entry - it is untracked, staged
 * for deletion, or unmerged.
 */
export function readIndexContent(root: string, repoRelativePath: string): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    /*
     * No shell: a path is passed as an argv entry rather than as text something has to quote, and the
     * leading `:` is a git revision sigil that a shell would be free to read as its own.
     */
    const child = spawn('git', ['-C', root, 'cat-file', 'blob', `:./${repoRelativePath}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    });

    const chunks: Buffer[] = [];
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });

    child.on('error', (error: Error) => {
      reject(new Error(`Could not run \`git cat-file\` for ${repoRelativePath}.`, { cause: error }));
    });

    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve(Buffer.concat(chunks));
        return;
      }

      /*
       * Git answers a path it cannot find in the index with exit 128 and a `fatal:` line, and there is no
       * exit code that distinguishes "no such index entry" from "this is not a repository". Both are
       * reported as the absence of a staged blob, and the caller decides what that means for it: the
       * copy-sync gate lists its files with `git ls-files` so it cannot legitimately reach one, while the
       * vendored-rules gate finds its files by walking and can.
       */
      if (isMissingPath(stderr)) {
        resolve(null);
        return;
      }

      reject(new Error(`\`git cat-file blob :./${repoRelativePath}\` failed with exit code ${exitCode === null ? '(null)' : String(exitCode)}:\n${stderr.trim()}`));
    });
  });
}

function isMissingPath(stderr: string): boolean {
  return stderr.includes('does not exist') || stderr.includes('not in the index') || stderr.includes('Not a valid object name');
}
