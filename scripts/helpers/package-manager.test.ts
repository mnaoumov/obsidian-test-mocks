/**
 * @file
 *
 * Tests for the package-manager detection the script hops run through.
 *
 * Every sibling repo is npm-only today -- a lone `package-lock.json` and no `packageManager` field -- so
 * the tree itself can only ever exercise the npm path. Everything else this module resolves (bun, pnpm,
 * yarn, a corepack declaration, two managers claiming the same tree) is unreachable in-repo, which is
 * exactly why it is pinned here.
 *
 * The trees are REAL folders under the OS temp directory rather than a mocked `node:fs`. `obsidian-test-mocks`
 * runs its `scripts/**` tests inside the `jsdom` project, and there a `vi.mock('node:fs')` reaches the test
 * file and nothing it imports -- the module under test keeps the real `existsSync`, so detection falls
 * through to its npm default while every npm expectation still passes. A suite that stays green for the
 * wrong reason is worse than no suite, and the per-file environment docblock tag cannot rescue it either:
 * the project's setup file needs a DOM, so pinning `node` per file trades the silent pass for
 * `document is not defined`. Real folders sidestep the whole question and work identically in the `node`
 * project `obsidian-integration-testing` runs this same file under.
 */

import type { MockInstance } from 'vitest';

import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path/posix';
import process from 'node:process';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  getPackageManager,
  getPackageManagerRunCommand,
  PackageManager
} from './package-manager.ts';
import { toPosixPath } from './root.ts';

/**
 * The shape of a temporary project tree to lay down.
 */
interface CreateProjectParams {
  /**
   * The lockfile names to create at the project root.
   */
  readonly lockfileNames?: readonly string[];

  /**
   * The `package.json` contents. Defaults to an empty object, which declares no package manager.
   */
  readonly packageJsonText?: string;
}

const ORIGINAL_USER_AGENT = process.env['npm_config_user_agent'];

let consoleWarnSpy: MockInstance<typeof console.warn>;
let projectCount = 0;
let temporaryRoot: string;

/**
 * Lays down a temporary project tree and returns its root.
 *
 * Each tree gets its own folder, because the module reports a lockfile disagreement once per root and a
 * shared folder would make one test's warning invisible to the next.
 *
 * @param params - The tree to create.
 * @returns The absolute posix path of the project root.
 */
function createProject(params: CreateProjectParams = {}): string {
  const {
    lockfileNames = [],
    packageJsonText = '{}'
  } = params;

  projectCount++;
  const root = join(temporaryRoot, `project-${String(projectCount)}`);
  mkdirSync(root);
  writeFileSync(join(root, 'package.json'), packageJsonText);

  for (const lockfileName of lockfileNames) {
    writeFileSync(join(root, lockfileName), '');
  }

  return root;
}

beforeAll(() => {
  const temporaryRootPrefix = join(toPosixPath(tmpdir()), 'package-manager-');
  temporaryRoot = toPosixPath(mkdtempSync(temporaryRootPrefix));
});

afterAll(() => {
  rmSync(temporaryRoot, { force: true, recursive: true });
});

beforeEach(() => {
  delete process.env['npm_config_user_agent'];
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleWarnSpy.mockRestore();
  if (ORIGINAL_USER_AGENT === undefined) {
    delete process.env['npm_config_user_agent'];
  } else {
    process.env['npm_config_user_agent'] = ORIGINAL_USER_AGENT;
  }
});

describe('getPackageManager', () => {
  it('should detect bun from bun.lock', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['bun.lock'] }))).toBe(PackageManager.Bun);
  });

  it('should detect bun from bun.lockb', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['bun.lockb'] }))).toBe(PackageManager.Bun);
  });

  it('should detect pnpm from pnpm-lock.yaml', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['pnpm-lock.yaml'] }))).toBe(PackageManager.Pnpm);
  });

  it('should detect yarn from yarn.lock', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['yarn.lock'] }))).toBe(PackageManager.Yarn);
  });

  it('should detect npm from package-lock.json', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['package-lock.json'] }))).toBe(PackageManager.Npm);
  });

  it('should resolve from the project root rather than the folder it is called with', () => {
    const root = createProject({ lockfileNames: ['bun.lock'] });
    const nestedFolder = join(root, 'scripts', 'helpers');
    mkdirSync(nestedFolder, { recursive: true });
    expect(getPackageManager(nestedFolder)).toBe(PackageManager.Bun);
  });

  it('should fall back to the user agent when no lockfile exists', () => {
    process.env['npm_config_user_agent'] = 'bun/1.4.0 npm/? node/v26.5.0 win32 x64';
    expect(getPackageManager(createProject())).toBe(PackageManager.Bun);
  });

  it('should read npm from the user agent when no lockfile exists', () => {
    process.env['npm_config_user_agent'] = 'npm/12.0.2 node/v26.5.0 win32 x64 workspaces/false';
    expect(getPackageManager(createProject())).toBe(PackageManager.Npm);
  });

  it('should read pnpm from the user agent when no lockfile exists', () => {
    process.env['npm_config_user_agent'] = 'pnpm/11.24.0 npm/? node/v26.5.0 win32 x64';
    expect(getPackageManager(createProject())).toBe(PackageManager.Pnpm);
  });

  it('should read yarn from the user agent when no lockfile exists', () => {
    process.env['npm_config_user_agent'] = 'yarn/1.22.22 npm/? node/v26.5.0 win32 x64';
    expect(getPackageManager(createProject())).toBe(PackageManager.Yarn);
  });

  it('should ignore an unrecognized user agent', () => {
    process.env['npm_config_user_agent'] = 'deno/2.0.0 node/v26.5.0';
    expect(getPackageManager(createProject())).toBe(PackageManager.Npm);
  });

  it('should ignore a malformed user agent', () => {
    process.env['npm_config_user_agent'] = 'nonsense';
    expect(getPackageManager(createProject())).toBe(PackageManager.Npm);
  });

  it('should default to npm when there is no lockfile and no user agent', () => {
    expect(getPackageManager(createProject())).toBe(PackageManager.Npm);
  });

  it('should resolve this repo as npm-owned when no folder is given', () => {
    expect(getPackageManager()).toBe(PackageManager.Npm);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should treat both bun lockfiles as a single claim', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['bun.lock', 'bun.lockb'] }))).toBe(PackageManager.Bun);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
});

describe('getPackageManager with several lockfiles', () => {
  it('should prefer the manager that launched us when it owns one of the lockfiles', () => {
    process.env['npm_config_user_agent'] = 'npm/12.0.2 node/v26.5.0 win32 x64 workspaces/false';
    expect(getPackageManager(createProject({ lockfileNames: ['pnpm-lock.yaml', 'package-lock.json'] }))).toBe(PackageManager.Npm);
  });

  it('should fall back to the documented order when no user agent is set', () => {
    expect(getPackageManager(createProject({ lockfileNames: ['pnpm-lock.yaml', 'package-lock.json'] }))).toBe(PackageManager.Pnpm);
  });

  it('should ignore a user agent that owns none of the lockfiles', () => {
    process.env['npm_config_user_agent'] = 'yarn/1.22.22 npm/? node/v26.5.0 win32 x64';
    expect(getPackageManager(createProject({ lockfileNames: ['pnpm-lock.yaml', 'package-lock.json'] }))).toBe(PackageManager.Pnpm);
  });

  it('should name every lockfile, the declaration and the winner in the warning', () => {
    const root = createProject({ lockfileNames: ['pnpm-lock.yaml', 'package-lock.json'] });
    getPackageManager(root);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    const message = consoleWarnSpy.mock.calls[0]?.[0] as string;
    expect(message).toContain(root);
    expect(message).toContain('pnpm-lock.yaml, package-lock.json');
    expect(message).toContain('not set');
    expect(message).toContain('Using pnpm');
  });

  it('should warn once per project however often it is called', () => {
    const root = createProject({ lockfileNames: ['pnpm-lock.yaml', 'package-lock.json'] });
    getPackageManager(root);
    getPackageManager(root);
    getPackageManager(root);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('getPackageManager with a packageManager declaration', () => {
  it('should prefer the declaration over a contradicting lockfile', () => {
    const root = createProject({
      lockfileNames: ['package-lock.json'],
      packageJsonText: '{ "packageManager": "pnpm@11.24.0" }'
    });
    expect(getPackageManager(root)).toBe(PackageManager.Pnpm);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should read the declaration when there is no lockfile at all', () => {
    const root = createProject({ packageJsonText: '{ "packageManager": "yarn@4.2.2" }' });
    expect(getPackageManager(root)).toBe(PackageManager.Yarn);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should stay silent when the declaration agrees with the lockfile', () => {
    const root = createProject({
      lockfileNames: ['pnpm-lock.yaml'],
      packageJsonText: '{ "packageManager": "pnpm@11.24.0" }'
    });
    expect(getPackageManager(root)).toBe(PackageManager.Pnpm);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should ignore a declaration naming a manager we do not handle', () => {
    const root = createProject({
      lockfileNames: ['package-lock.json'],
      packageJsonText: '{ "packageManager": "deno@2.0.0" }'
    });
    expect(getPackageManager(root)).toBe(PackageManager.Npm);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should ignore a declaration that omits the version', () => {
    const root = createProject({
      lockfileNames: ['package-lock.json'],
      packageJsonText: '{ "packageManager": "pnpm" }'
    });
    expect(getPackageManager(root)).toBe(PackageManager.Npm);
  });

  it('should ignore an empty declaration', () => {
    const root = createProject({
      lockfileNames: ['package-lock.json'],
      packageJsonText: '{ "packageManager": "" }'
    });
    expect(getPackageManager(root)).toBe(PackageManager.Npm);
  });

  it('should ignore an unparsable package.json', () => {
    const root = createProject({
      lockfileNames: ['package-lock.json'],
      packageJsonText: 'not json at all'
    });
    expect(getPackageManager(root)).toBe(PackageManager.Npm);
  });
});

describe('getPackageManagerRunCommand', () => {
  it('should run scripts through npm', () => {
    expect(getPackageManagerRunCommand(createProject({ lockfileNames: ['package-lock.json'] }))).toEqual(['npm', 'run']);
  });

  it('should run scripts through bun', () => {
    expect(getPackageManagerRunCommand(createProject({ lockfileNames: ['bun.lock'] }))).toEqual(['bun', 'run']);
  });

  it('should run scripts through pnpm', () => {
    expect(getPackageManagerRunCommand(createProject({ lockfileNames: ['pnpm-lock.yaml'] }))).toEqual(['pnpm', 'run']);
  });

  it('should run scripts through yarn', () => {
    expect(getPackageManagerRunCommand(createProject({ lockfileNames: ['yarn.lock'] }))).toEqual(['yarn', 'run']);
  });
});
