import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  execFromRoot,
  getRootFolder
} from './helpers/exec.ts';

type CoverageSummary = Record<string, CoverageSummaryFile>;

interface CoverageSummaryEntry {
  covered: number;
  pct: number;
  skipped: number;
  total: number;
}

interface CoverageSummaryFile {
  branches: CoverageSummaryEntry;
  functions: CoverageSummaryEntry;
  lines: CoverageSummaryEntry;
  statements: CoverageSummaryEntry;
}

const FULL_COVERAGE = 100;
const COVERAGE_METRICS = ['lines', 'statements', 'functions', 'branches'] as const;

async function main(): Promise<void> {
  await execFromRoot('vitest run --coverage');

  const root = getRootFolder();
  if (!root) {
    throw new Error('Could not find root folder');
  }

  const summaryPath = resolve(root, 'coverage', 'coverage-summary.json');
  const summary = JSON.parse(readFileSync(summaryPath, 'utf-8')) as CoverageSummary;

  const failures: string[] = [];

  for (const [filePath, fileSummary] of Object.entries(summary)) {
    if (filePath === 'total') {
      continue;
    }

    for (const metric of COVERAGE_METRICS) {
      const entry = fileSummary[metric];
      if (entry.pct < FULL_COVERAGE) {
        failures.push(`${filePath}: ${metric} coverage is ${String(entry.pct)}% (${String(entry.covered)}/${String(entry.total)})`);
      }
    }
  }

  if (failures.length > 0) {
    console.error('\nCoverage is not 100% for the following files:\n');
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    console.error('');
    process.exit(1);
  }

  console.log('\nAll files have 100% coverage.');
}

await main();
