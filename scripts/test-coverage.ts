import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import { resolveToolCommand } from './helpers/package-manager.ts';
import { execFromRoot } from './helpers/root.ts';

exitIfScriptDisabled();

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
