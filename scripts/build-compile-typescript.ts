import { join } from 'node:path/posix';

import {
  checkProjectTypes,
  parseTsConfig,
  toCanonical
} from './helpers/check-project-types.ts';
import {
  execFromRoot,
  getRootFolder
} from './helpers/root.ts';

const NODE_MODULES_SEGMENT = '/node_modules/';

await main();

async function main(): Promise<void> {
  await execFromRoot('tsc --build --force');

  if (!validateProjectTypes()) {
    throw new Error('TypeScript declaration validation failed.');
  }
}

function shouldKeepProjectFile(fileName: string, rootCanonical: string): boolean {
  return fileName.startsWith(`${rootCanonical}/`) && !fileName.includes(NODE_MODULES_SEGMENT);
}

function validateProjectTypes(): boolean {
  const root = getRootFolder();

  if (!root) {
    throw new Error('Could not find root folder');
  }

  const rootCanonical = toCanonical(root);
  const { fileNames, options } = parseTsConfig(join(root, 'tsconfig.json'));

  if (!options.skipLibCheck) {
    return true;
  }

  return checkProjectTypes({
    options,
    rootNames: fileNames,
    shouldKeepFile: (fileName) => shouldKeepProjectFile(fileName, rootCanonical)
  });
}
