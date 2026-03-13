import { execFromRoot } from './helpers/exec.ts';

async function main(): Promise<void> {
  const [, , ...paths] = process.argv;
  await spellcheck(paths);
}

async function spellcheck(paths: string[] = []): Promise<void> {
  if (paths.length === 0) {
    paths = ['.'];
  }

  await execFromRoot(['npx', 'cspell', ...paths, '--no-progress', '--no-must-find-files']);
}

await main();
