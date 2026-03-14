import { execFromRoot } from './helpers/exec.ts';

const FULL_COVERAGE = 100;

await execFromRoot(
  `vitest run --coverage --coverage.thresholds.lines=${String(FULL_COVERAGE)} --coverage.thresholds.functions=${
    String(FULL_COVERAGE)
  } --coverage.thresholds.branches=${String(FULL_COVERAGE)} --coverage.thresholds.statements=${String(FULL_COVERAGE)}`
);
