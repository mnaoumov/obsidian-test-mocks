/**
 * @file
 *
 * Tests for the batched `exec` path -- the one a command takes when its argument list is too long for the
 * platform's command line, and the one `lint:fix` takes under nano-staged with a long staged file list.
 *
 * The aggregate that path returns used to be a hard-coded `exitCode: 0` with an empty `stderr`, so a caller
 * that asked for details was told every batch had succeeded however they ended. Nothing caught it because
 * nothing read the code back: with `shouldIgnoreExitCode` left false the run still rejects on the first
 * failing batch, which is what every caller relied on. These tests pin the other half.
 *
 * The last case pins the other end of that path -- where the batches are SIZED. On Windows the command is
 * escaped on the way to cmd.exe, a `^` per cmd meta character, and that used to happen after the length
 * budget had been spent, so a batch that fitted at 8152 characters reached cmd at 8192 and was refused.
 *
 * The quoting cases pin what the child RECEIVES. Batched arguments used to be joined into the command line
 * raw, and static ones were quoted by the Windows rules on every platform, so on the Linux CI runner `sh`
 * read a batched `(` as syntax and the sizing case above died there with `Syntax error: "(" unexpected`.
 *
 * The child is a REAL `node` process over a real temp script rather than a mocked `spawn`. What is under
 * test is how several children's endings are folded into one answer, and a mock only ever proves the fold
 * was fed whatever the test decided to feed it.
 */

import {
  mkdtempSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path/posix';
import process from 'node:process';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it
} from 'vitest';

import { exec } from './exec.ts';

/**
 * Mirrors `getMaxCommandLength()`, which is module-private -- including the cmd.exe wrapper it subtracts on
 * Windows. Nothing is asserted on the number itself: every test below also asserts how many batches there
 * were, so a drift between this and the real ceiling fails loudly here instead of quietly testing the
 * unbatched path.
 */
const MAX_COMMAND_LENGTH = process.platform === 'win32'
  ? 8191 - (process.env['ComSpec'] ?? String.raw`C:\Windows\system32\cmd.exe`).length - ' /d /s /c ""'.length
  : 131_072;

/**
 * How far past the ceiling the argument list is built, which decides how many batches there are. A little
 * over one ceiling means two batches -- enough to prove the fold, and two child processes rather than
 * twenty.
 */
const OVERSHOOT_FACTOR = 1.4;

const ARGUMENT_LENGTH = 120;

/**
 * The characters `commandEscapeCommandLine` puts a `^` in front of, minus the double quote: `argvQuote`
 * reaches that one first and quotes the whole argument, which measures differently and is a different test.
 */
const META_CHARACTERS = '()%!^<>&|';

/**
 * How often a meta character is planted. Every third is enough to inflate a full-sized batch well past the
 * ceiling rather than marginally, so the case fails on the defect rather than on an off-by-one.
 */
const META_PERIOD = 3;

/**
 * What the temp script writes to each stream, so the aggregate can be asked whether it kept them.
 */
const STDOUT_MARKER = 'probe-stdout';

const STDERR_MARKER = 'probe-stderr';

/**
 * The exit code the failing script uses. Anything but `0` and `1` would do; this one is distinctive enough
 * to be recognized in a failure message.
 */
const PROBE_EXIT_CODE = 7;

const EXPECTED_BATCH_COUNT = 2;

const TEST_TIMEOUT_IN_MILLISECONDS = 60_000;

let temporaryFolder = '';
let failingScriptPath = '';
let succeedingScriptPath = '';
let argvEchoScriptPath = '';

/**
 * Arguments each of which a shell reads as something other than one literal word unless it is quoted for
 * that shell: `sh` syntax, `sh` expansions, cmd meta characters, whitespace, both quote characters, and the
 * empty string, which unquoted is no argument at all.
 *
 * A `%name%` pair is left out on purpose: cmd.exe expands it before it reads any escape, so no quoting of an
 * argument can carry one through, and that is a limit of cmd rather than of this module.
 */
const HOSTILE_ARGUMENTS = [
  'plain',
  'two words',
  '(parenthesized)',
  'semi;colon',
  '$HOME',
  '`backtick`',
  '*',
  'glob?[ab]',
  '~',
  'a=b',
  'single \' quote',
  'double " quote',
  String.raw`back\slash`,
  'trailing backslash\\',
  'percent 50%',
  'bang!',
  'caret^',
  '<redirect>',
  'pipe|and&',
  ''
];

/**
 * Counts how many children contributed to a stream, which is how many batches there were.
 *
 * @param text - The aggregated stream.
 * @param marker - What each child wrote to it exactly once.
 * @returns The number of children that wrote.
 */
function countMarkers(text: string, marker: string): number {
  return text.split(marker).length - 1;
}

/**
 * Builds an argument list long enough that the command line has to be split.
 *
 * @returns The arguments, which the probe script ignores.
 */
function makeOverlongArguments(): string[] {
  const count = Math.ceil((MAX_COMMAND_LENGTH * OVERSHOOT_FACTOR) / (ARGUMENT_LENGTH + 1));
  return Array.from({ length: count }, (_, index) => `${'a'.repeat(ARGUMENT_LENGTH - String(index).length)}${String(index)}`);
}

/**
 * The same list, with every {@link META_PERIOD}th character replaced by a cmd meta one, so cmd.exe is handed
 * a command line a third longer again than the one the budget was spent on.
 *
 * The arguments are otherwise unchanged and the probe script ignores all of them: what is under test is how
 * the batches were SIZED, not what any child made of them.
 *
 * @returns The arguments, meta-heavy and still overlong.
 */
function makeOverlongMetaArguments(): string[] {
  return makeOverlongArguments().map((argument) =>
    Array.from(
      { length: argument.length },
      (_, index) => index % META_PERIOD === 0 ? META_CHARACTERS.charAt((index / META_PERIOD) % META_CHARACTERS.length) : argument.charAt(index)
    ).join('')
  );
}

beforeAll(() => {
  temporaryFolder = mkdtempSync(join(tmpdir(), 'exec-batches-'));

  failingScriptPath = join(temporaryFolder, 'failing-probe.cjs');
  writeFileSync(
    failingScriptPath,
    `process.stdout.write('${STDOUT_MARKER}\\n');\nprocess.stderr.write('${STDERR_MARKER}\\n');\nprocess.exit(${String(PROBE_EXIT_CODE)});\n`
  );

  succeedingScriptPath = join(temporaryFolder, 'succeeding-probe.cjs');
  writeFileSync(succeedingScriptPath, `process.stdout.write('${STDOUT_MARKER}\\n');\n`);

  argvEchoScriptPath = join(temporaryFolder, 'argv-echo-probe.cjs');
  writeFileSync(argvEchoScriptPath, 'process.stdout.write(JSON.stringify(process.argv.slice(2)));\n');
});

afterAll(() => {
  rmSync(temporaryFolder, { force: true, recursive: true });
});

describe('exec over a batched command', () => {
  it('carries the first failing batch out of the aggregate instead of reporting a hard-coded success', async () => {
    const result = await exec(['node', failingScriptPath, { batchedArguments: makeOverlongArguments() }], {
      isQuiet: true,
      shouldIgnoreExitCode: true,
      shouldIncludeDetails: true
    });

    expect(countMarkers(result.stdout, STDOUT_MARKER)).toBe(EXPECTED_BATCH_COUNT);
    expect(result.exitCode).toBe(PROBE_EXIT_CODE);
    expect(result.exitSignal).toBeNull();
    expect(countMarkers(result.stderr, STDERR_MARKER)).toBe(EXPECTED_BATCH_COUNT);
  }, TEST_TIMEOUT_IN_MILLISECONDS);

  it('reports a batched run whose batches all succeeded as a success', async () => {
    const result = await exec(['node', succeedingScriptPath, { batchedArguments: makeOverlongArguments() }], {
      isQuiet: true,
      shouldIgnoreExitCode: true,
      shouldIncludeDetails: true
    });

    expect(countMarkers(result.stdout, STDOUT_MARKER)).toBe(EXPECTED_BATCH_COUNT);
    expect(result.exitCode).toBe(0);
    expect(result.exitSignal).toBeNull();
    expect(result.stderr).toBe('');
  }, TEST_TIMEOUT_IN_MILLISECONDS);

  it('still rejects on the first failing batch when exit codes are not being ignored', async () => {
    await expect(exec(['node', failingScriptPath, { batchedArguments: makeOverlongArguments() }], { isQuiet: true }))
      .rejects
      .toThrow(`Command failed with exit code ${String(PROBE_EXIT_CODE)}`);
  }, TEST_TIMEOUT_IN_MILLISECONDS);

  it('still returns the concatenated stdout when no details were asked for', async () => {
    const stdout = await exec(['node', succeedingScriptPath, { batchedArguments: makeOverlongArguments() }], { isQuiet: true });

    expect(countMarkers(stdout, STDOUT_MARKER)).toBe(EXPECTED_BATCH_COUNT);
  }, TEST_TIMEOUT_IN_MILLISECONDS);

  // Falsified on Windows against the code before the budget counted the escaping: cmd.exe answers the
  // inflated batch with `The command line is too long.` on stderr and exit 1, and that batch's stdout is
  // missing from the aggregate. Off Windows there is no cmd escaping to budget for, and the case pins that
  // the same arguments reach `sh` quoted: joined raw, `sh` refused every batch with `Syntax error: "("
  // unexpected`, which is how this case first failed on the Linux CI runner.
  it('sizes the batches by the escaped length, so a meta-heavy list still fits cmd.exe', async () => {
    const result = await exec(['node', succeedingScriptPath, { batchedArguments: makeOverlongMetaArguments() }], {
      isQuiet: true,
      shouldIgnoreExitCode: true,
      shouldIncludeDetails: true
    });

    expect(result.stderr).toBe('');
    expect(result.exitCode).toBe(0);
    expect(countMarkers(result.stdout, STDOUT_MARKER)).toBeGreaterThanOrEqual(EXPECTED_BATCH_COUNT);
  }, TEST_TIMEOUT_IN_MILLISECONDS);
});

describe('exec over an argument array', () => {
  it('hands every static argument to the child as exactly the string it was given', async () => {
    const stdout = await exec(['node', argvEchoScriptPath, ...HOSTILE_ARGUMENTS], { isQuiet: true });

    expect(JSON.parse(stdout)).toEqual(HOSTILE_ARGUMENTS);
  }, TEST_TIMEOUT_IN_MILLISECONDS);

  it('hands every batched argument to the child as exactly the string it was given', async () => {
    const stdout = await exec(['node', argvEchoScriptPath, 'static (part)', { batchedArguments: HOSTILE_ARGUMENTS }], { isQuiet: true });

    expect(JSON.parse(stdout)).toEqual(['static (part)', ...HOSTILE_ARGUMENTS]);
  }, TEST_TIMEOUT_IN_MILLISECONDS);
});
