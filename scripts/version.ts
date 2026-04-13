import type { ReleaseType } from 'semver';
import type {
  PackageJson,
  Promisable,
  UndefinedOnPartialDeep
} from 'type-fest';

import { existsSync } from 'node:fs';
import {
  readFile,
  writeFile
} from 'node:fs/promises';
import {
  join,
  resolve as resolvePosix
} from 'node:path/posix';
import process, { loadEnvFile } from 'node:process';
import { createInterface } from 'node:readline/promises';
import {
  inc,
  prerelease
} from 'semver';

import {
  assertNonNullable,
  ensureNonNullable
} from '../src/internal/type-guards.ts';
import {
  execFromRoot,
  getRootFolder,
  toPosixPath
} from './helpers/root.ts';

interface NpmPackResult {
  filename: string;
}

const DEFAULT_PREID = 'beta';

enum VersionUpdateType {
  Invalid = 'invalid',
  Major = 'major',
  Manual = 'manual',
  Minor = 'minor',
  Patch = 'patch',
  PreMajor = 'premajor',
  PreMinor = 'preminor',
  PrePatch = 'prepatch',
  PreRelease = 'prerelease'
}

async function addGitTag(newVersion: string): Promise<void> {
  await execFromRoot(`git tag -a ${newVersion} -m ${newVersion} --force`, { isQuiet: true });
}

async function addUpdatedFilesToGit(newVersion: string): Promise<void> {
  await execFromRoot(['git', 'add', '--all'], { isQuiet: true });
  await execFromRoot(['git', 'commit', '-m', `chore: release ${newVersion}`, '--allow-empty'], { isQuiet: true });
}

async function checkGitHubCliInstalled(): Promise<void> {
  try {
    await execFromRoot('gh --version', { isQuiet: true });
  } catch {
    throw new Error('GitHub CLI is not installed. Please install it from https://cli.github.com/');
  }
}

async function checkGitInstalled(): Promise<void> {
  try {
    await execFromRoot('git --version', { isQuiet: true });
  } catch {
    throw new Error('Git is not installed. Please install it from https://git-scm.com/');
  }
}

async function checkGitRepoClean(): Promise<void> {
  try {
    const stdout = await execFromRoot('git status --porcelain --untracked-files=all', { isQuiet: true });
    if (stdout) {
      throw new Error();
    }
  } catch {
    throw new Error('Git repository is not clean. Please commit or stash your changes before releasing a new version.');
  }
}

async function getNewVersion(versionUpdateType: string): Promise<string> {
  const versionType = getVersionUpdateType(versionUpdateType);
  if (versionType === VersionUpdateType.Manual) {
    return versionUpdateType;
  }

  const packageJson = await readPackageJson();
  const currentVersion = packageJson.version ?? '';

  const releaseType = versionType as ReleaseType;
  const isPreReleaseType = releaseType.startsWith('pre');
  const newVersion = isPreReleaseType
    ? inc(currentVersion, releaseType, DEFAULT_PREID)
    : inc(currentVersion, releaseType);
  assertNonNullable(newVersion, `Failed to increment version from '${currentVersion}' with type '${versionType}'`);

  return newVersion;
}

async function getReleaseNotes(newVersion: string): Promise<string> {
  const changelogPath = resolvePathFromRootSafe('CHANGELOG.md');
  const content = await readFile(changelogPath, 'utf-8');
  const newVersionEscaped = newVersion.replace('.', '\\.');
  const match = new RegExp(`\n## ${newVersionEscaped}\n\n((.|\n)+?)\n\n##`).exec(content);
  let releaseNotes = match?.[1] ? `${match[1]}\n\n` : '';

  const tags = (await execFromRoot('git tag --sort=-creatordate', { isQuiet: true })).split(/\r?\n/);
  const previousVersion = tags[1];
  let changesUrl: string;

  const repoUrl = await execFromRoot('gh repo view --json url -q .url', { isQuiet: true });

  if (previousVersion) {
    changesUrl = `${repoUrl}/compare/${previousVersion}...${newVersion}`;
  } else {
    changesUrl = `${repoUrl}/commits/${newVersion}`;
  }

  releaseNotes += `**Full Changelog**: ${changesUrl}`;
  return releaseNotes;
}

function getVersionUpdateType(versionUpdateType: string): VersionUpdateType {
  const versionUpdateTypeEnum = versionUpdateType as VersionUpdateType;
  switch (versionUpdateTypeEnum) {
    case VersionUpdateType.Major:
    case VersionUpdateType.Minor:
    case VersionUpdateType.Patch:
    case VersionUpdateType.PreMajor:
    case VersionUpdateType.PreMinor:
    case VersionUpdateType.PrePatch:
    case VersionUpdateType.PreRelease:
      return versionUpdateTypeEnum;

    default:
      if (/^\d+\.\d+\.\d+(?:-[\w\d.-]+)?$/.test(versionUpdateType)) {
        return VersionUpdateType.Manual;
      }

      return VersionUpdateType.Invalid;
  }
}

async function gitPush(): Promise<void> {
  await execFromRoot('git push --follow-tags --force', { isQuiet: true });
}

function isPreRelease(version: string): boolean {
  return prerelease(version) !== null;
}

async function main(): Promise<void> {
  const [, , versionUpdateType] = process.argv;
  await updateVersion(versionUpdateType);
}

async function publishGitHubRelease(newVersion: string): Promise<void> {
  const resultOutput = await execFromRoot(['npm', 'pack', '--pack-destination', 'dist', '--json'], { isQuiet: true });
  const result = JSON.parse(resultOutput) as [NpmPackResult];
  let filePaths = [
    join('dist', result[0].filename)
  ];

  filePaths = filePaths.filter((filePath) => existsSync(resolvePathFromRootSafe(filePath)));

  await execFromRoot([
    'gh',
    'release',
    'create',
    newVersion,
    ...filePaths,
    '--title',
    `v${newVersion}`,
    ...(isPreRelease(newVersion) ? ['--prerelease'] : []),
    '--notes-file',
    '-'
  ], {
    isQuiet: true,
    stdin: await getReleaseNotes(newVersion)
  });
}

function toSingleLine(str: string): string {
  const lines = str.split(/\r?\n/).filter(Boolean);
  return lines.join(' ');
}

async function updateChangelog(newVersion: string): Promise<void> {
  const HEADER_LINES_COUNT = 2;
  const changelogPath = resolvePathFromRootSafe('CHANGELOG.md');
  let previousChangelogLines: string[];
  if (existsSync(changelogPath)) {
    const content = await readFile(changelogPath, 'utf-8');
    previousChangelogLines = content.split('\n').slice(HEADER_LINES_COUNT);
    if (previousChangelogLines.at(-1) === '') {
      previousChangelogLines.pop();
    }
  } else {
    previousChangelogLines = [];
  }

  const lastTag = (previousChangelogLines[0] ?? '').replaceAll('## ', '');
  const commitRange = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const commitMessagesStr = await execFromRoot(`git log ${commitRange} --format=%B --first-parent -z`, { isQuiet: true });
  const commitMessages = commitMessagesStr.split('\0').filter(Boolean).map(toSingleLine);

  let newChangeLog = `# CHANGELOG\n\n## ${newVersion}\n\n`;

  for (const message of commitMessages) {
    newChangeLog += `- ${message}\n`;
  }

  if (previousChangelogLines.length > 0) {
    newChangeLog += '\n';
    for (const line of previousChangelogLines) {
      newChangeLog += `${line}\n`;
    }
  }

  await writeFile(changelogPath, newChangeLog, 'utf-8');

  const codeVersion = await execFromRoot('code --version', {
    isQuiet: true,
    shouldIgnoreExitCode: true
  });

  if (codeVersion) {
    console.log('Please update the CHANGELOG.md file. Close Visual Studio Code when you are done...');
    await execFromRoot(['code', '-w', changelogPath], {
      isQuiet: true,
      shouldIgnoreExitCode: true
    });
  } else {
    console.log('Could not find Visual Studio Code in your PATH. Using console mode instead.');
    await createInterface(process.stdin, process.stdout).question(
      'Please update the CHANGELOG.md file. Press Enter when you are done...'
    );
  }
}

async function updateVersion(versionUpdateType?: string): Promise<void> {
  if (!versionUpdateType) {
    const npmOldVersion = process.env['npm_old_version'];
    const npmNewVersion = process.env['npm_new_version'];

    if (npmOldVersion && npmNewVersion) {
      await updateVersionInFiles(npmOldVersion);
      await updateVersion(npmNewVersion);
      return;
    }

    throw new Error('No version update type provided');
  }

  validate(versionUpdateType);
  await checkGitInstalled();
  await checkGitRepoClean();
  await checkGitHubCliInstalled();
  await npmRun('format:check');
  await npmRun('spellcheck');
  await npmRun('lint:md');
  await npmRun('build');
  await npmRun('lint');
  await npmRun('test:coverage');

  const newVersion = await getNewVersion(versionUpdateType);
  await updateVersionInFiles(newVersion);
  await updateChangelog(newVersion);
  await addUpdatedFilesToGit(newVersion);
  await addGitTag(newVersion);
  await gitPush();
  await publishGitHubRelease(newVersion);
  const envPath = resolvePathFromRoot('.env');
  if (envPath && existsSync(envPath)) {
    loadEnvFile(envPath);
  }
  const npmEnv = process.env as Partial<NpmEnv>;
  await execFromRoot(['npm', 'config', 'set', `//registry.npmjs.org/:_authToken=${npmEnv.NPM_TOKEN ?? ''}`]);

  const tag = isPreRelease(newVersion) ? 'beta' : 'latest';
  await execFromRoot(['npm', 'publish', '--tag', tag]);
}

async function updateVersionInFiles(newVersion: string): Promise<void> {
  await editPackageJson((packageJson) => {
    packageJson.version = newVersion;
  });

  await editPackageLockJson(update, { shouldSkipIfMissing: true });
  await editNpmShrinkWrapJson(update, { shouldSkipIfMissing: true });

  function update(packageLockJson: PackageLockJson): void {
    packageLockJson.version = newVersion;
    const defaultPackage = packageLockJson.packages?.[''];
    if (defaultPackage) {
      defaultPackage.version = newVersion;
    }
  }
}

function validate(versionUpdateType: string): void {
  if (getVersionUpdateType(versionUpdateType) === VersionUpdateType.Invalid) {
    throw new Error(
      'Invalid version update type. Please use \'major\', \'minor\', \'patch\', \'premajor\', \'preminor\', \'prepatch\', \'prerelease\', or \'x.y.z[-suffix]\' format.'
    );
  }
}

await main();

interface EditJsonOptions {
  readonly shouldSkipIfMissing?: boolean;
}

interface EditPackageJsonOptions {
  readonly cwd?: string;
  readonly shouldSkipIfMissing?: boolean;
}

interface NpmEnv {
  NPM_TOKEN: string;
}

interface PackageLockJson extends Partial<PackageJson> {
  packages?: Record<string, PackageJson>;
}

export function resolve(...pathSegments: string[]): string {
  const WINDOWS_POSIX_LIKE_PATH_REG_EXP = /[a-zA-Z]:\/[^:]*$/;
  let path = resolvePosix(...pathSegments);
  path = toPosixPath(path);
  const match = WINDOWS_POSIX_LIKE_PATH_REG_EXP.exec(path);
  return match?.[0] ?? path;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- It makes `editFn` strongly typed.
async function editJson<T>(
  path: string,
  editFn: (data: T) => Promisable<void>,
  options: EditJsonOptions = {}
): Promise<void> {
  const {
    shouldSkipIfMissing
  } = options;
  if (shouldSkipIfMissing && !existsSync(path)) {
    return;
  }
  const data = await readJson<T>(path);
  await editFn(data);
  await writeJson(path, data);
}

async function editNpmShrinkWrapJson(
  editFn: (packageLockJson: PackageLockJson) => Promisable<void>,
  options: EditPackageJsonOptions = {}
): Promise<void> {
  const {
    cwd,
    shouldSkipIfMissing
  } = options;
  await editJson<PackageJson>(getNpmShrinkWrapJsonPath(cwd), editFn, normalizeOptionalProperties<EditJsonOptions>({ shouldSkipIfMissing }));
}

async function editPackageJson(
  editFn: (packageJson: PackageJson) => Promisable<void>,
  options: EditPackageJsonOptions = {}
): Promise<void> {
  const {
    cwd,
    shouldSkipIfMissing
  } = options;
  await editJson<PackageJson>(getPackageJsonPath(cwd), editFn, normalizeOptionalProperties<EditJsonOptions>({ shouldSkipIfMissing }));
}

async function editPackageLockJson(
  editFn: (packageLockJson: PackageLockJson) => Promisable<void>,
  options: EditPackageJsonOptions = {}
): Promise<void> {
  const {
    cwd,
    shouldSkipIfMissing
  } = options;
  await editJson<PackageJson>(getPackageLockJsonPath(cwd), editFn, normalizeOptionalProperties<EditJsonOptions>({ shouldSkipIfMissing }));
}

function getNpmShrinkWrapJsonPath(cwd?: string): string {
  return ensureNonNullable(resolvePathFromRoot('npm-shrinkwrap.json', cwd), 'Could not determine the npm-shrinkwrap.json path');
}

function getPackageJsonPath(cwd?: string): string {
  return ensureNonNullable(resolvePathFromRoot('package.json', cwd), 'Could not determine the package.json path');
}

function getPackageLockJsonPath(cwd?: string): string {
  return ensureNonNullable(resolvePathFromRoot('package-lock.json', cwd), 'Could not determine the package-lock.json path');
}

function normalizeOptionalProperties<T>(obj: UndefinedOnPartialDeep<T>): T {
  return obj as T;
}

async function npmRun(command: string): Promise<void> {
  await execFromRoot(['npm', 'run', command]);
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf-8')) as T;
}

async function readPackageJson(cwd?: string): Promise<PackageJson> {
  return await readJson<PackageJson>(getPackageJsonPath(cwd));
}

function resolvePathFromRoot(path: string, cwd?: string): null | string {
  const rootFolder = getRootFolder(cwd);
  if (!rootFolder) {
    return null;
  }

  return resolve(rootFolder, path);
}

function resolvePathFromRootSafe(path: string, cwd?: string): string {
  return resolvePathFromRoot(path, cwd) ?? path;
}

async function writeJson(path: string, data: unknown): Promise<void> {
  const JSON_INDENT = 2;
  await writeFile(path, `${ensureNonNullable(JSON.stringify(data, null, JSON_INDENT))}\n`);
}
