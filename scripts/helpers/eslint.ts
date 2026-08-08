import { execFromRoot } from './root.ts';

interface LintOptions {
  readonly paths?: string[] | undefined;
  readonly shouldFix?: boolean | undefined;
}

export async function lint(options: LintOptions = {}): Promise<void> {
  const targets = options.paths?.length ? options.paths : ['.'];
  await execFromRoot(['npx', 'eslint', ...(options.shouldFix ? ['--fix'] : []), { batchedArguments: targets }]);
}
