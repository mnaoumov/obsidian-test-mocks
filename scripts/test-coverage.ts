import { wrapCliTask } from '@mnaoumov/typescript-dev-toolkit/cli-utils';
import { resolveToolCommand } from '@mnaoumov/typescript-dev-toolkit/package-manager';
import { execFromRoot } from '@mnaoumov/typescript-dev-toolkit/root';

await wrapCliTask(async () => {
  const FULL_COVERAGE = 100;

  await execFromRoot([
    ...resolveToolCommand({ tool: 'vitest' }),
    'run',
    '--coverage',
    `--coverage.thresholds.lines=${String(FULL_COVERAGE)}`,
    `--coverage.thresholds.functions=${String(FULL_COVERAGE)}`,
    `--coverage.thresholds.branches=${String(FULL_COVERAGE)}`,
    `--coverage.thresholds.statements=${String(FULL_COVERAGE)}`
  ]);
});
