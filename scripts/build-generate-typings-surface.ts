/**
 * @file
 *
 * Regenerates the checked-in inventory of `obsidian-typings` members the mocks do not implement.
 *
 * Run this after upgrading `obsidian-typings`, or after implementing one of the listed members. The
 * matching test (`src/obsidian/obsidian-typings-conformance.test.ts`) fails whenever the checked-in
 * file and the installed typings disagree, so the regenerated diff is the review: every added line is
 * a new member somebody has to decide about, and every removed line is one the mocks now implement.
 */

import {
  readFile,
  writeFile
} from 'node:fs/promises';
import { join } from 'node:path';

import { exitIfScriptDisabled } from './helpers/env-toggle.ts';
import {
  GENERATED_BEGIN_MARKER,
  GENERATED_END_MARKER,
  getUnimplementedAugmentedMembers,
  GUIDE_PATH,
  renderImplementedTable,
  UNIMPLEMENTED_MEMBERS_FILE_NAME
} from './helpers/obsidian-typings-surface.ts';

const JSON_INDENT = 2;

exitIfScriptDisabled();

const members = getUnimplementedAugmentedMembers();
const inventoryPath = join('scripts', UNIMPLEMENTED_MEMBERS_FILE_NAME);
await writeFile(inventoryPath, `${JSON.stringify(members, null, JSON_INDENT)}\n`, 'utf-8');

const guide = await readFile(GUIDE_PATH, 'utf-8');
const begin = guide.indexOf(GENERATED_BEGIN_MARKER);
const end = guide.indexOf(GENERATED_END_MARKER);
if (begin === -1 || end === -1) {
  throw new Error(`Could not find the generated-region markers in ${GUIDE_PATH}.`);
}

const updated = [
  guide.slice(0, begin + GENERATED_BEGIN_MARKER.length),
  '\n',
  renderImplementedTable(),
  '\n',
  guide.slice(end)
].join('');
await writeFile(GUIDE_PATH, updated, 'utf-8');

console.log(`Wrote ${String(members.length)} unimplemented obsidian-typings members to ${inventoryPath}.`);
console.log(`Regenerated the implemented-internals table in ${GUIDE_PATH}.`);
