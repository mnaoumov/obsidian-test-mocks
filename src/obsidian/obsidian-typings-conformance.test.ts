/**
 * @file
 *
 * Conformance test for the `obsidian-typings` surface.
 *
 * `obsidian-typings` augments `declare module 'obsidian'` with roughly a thousand internal members the
 * public `obsidian.d.ts` does not declare. The mocks implement the ones they can back with real
 * behavior; the rest deliberately stay unmocked, so reading them throws through the strict proxy
 * instead of quietly answering `undefined`.
 *
 * That "deliberately" is what this test enforces. Without it, "unmocked" and "nobody has looked at it"
 * are indistinguishable, and an `obsidian-typings` upgrade adds members that nobody ever decides about
 * — the drift this package's bridge layer suffered for its whole life. Here, every augmented member is
 * either implemented by a mock or named in the checked-in inventory, and any change to that split
 * fails until someone regenerates the file and reviews the diff.
 *
 * It does NOT assert that the unimplemented ones stay unimplemented — implementing one is the good
 * outcome. It asserts only that the split is recorded.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import {
  describe,
  expect,
  it
} from 'vitest';

import {
  GENERATED_BEGIN_MARKER,
  GENERATED_END_MARKER,
  getUnimplementedAugmentedMembers,
  GUIDE_PATH,
  renderImplementedTable,
  UNIMPLEMENTED_MEMBERS_FILE_NAME
} from '../../scripts/helpers/obsidian-typings-surface.ts';

const REGENERATE_COMMAND = 'npm run build:generate:typings-surface';
const INVENTORY_PATH = join(process.cwd(), 'scripts', UNIMPLEMENTED_MEMBERS_FILE_NAME);

describe('obsidian-typings conformance', () => {
  it('should account for every augmented member as implemented or deliberately unmocked', () => {
    const recorded = JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8')) as string[];
    const actual = getUnimplementedAugmentedMembers();

    const recordedSet = new Set(recorded);
    const actualSet = new Set(actual);
    const nowImplemented = recorded.filter((member) => !actualSet.has(member));
    const newlyUnmocked = actual.filter((member) => !recordedSet.has(member));

    const message = [
      'The obsidian-typings surface no longer matches the checked-in inventory.',
      nowImplemented.length > 0 ? `Now implemented by a mock (remove from the inventory): ${nowImplemented.join(', ')}` : '',
      newlyUnmocked.length > 0 ? `Declared by obsidian-typings but unmocked (decide, then record): ${newlyUnmocked.join(', ')}` : '',
      `Run \`${REGENERATE_COMMAND}\` and review the diff.`
    ].filter(Boolean).join('\n');

    expect(actual, message).toEqual(recorded);
  });

  it('should keep the guide\'s implemented-internals table in sync', () => {
    const guide = readFileSync(join(process.cwd(), GUIDE_PATH), 'utf-8');
    const begin = guide.indexOf(GENERATED_BEGIN_MARKER);
    const end = guide.indexOf(GENERATED_END_MARKER);

    expect(begin, `Missing "${GENERATED_BEGIN_MARKER}" in ${GUIDE_PATH}.`).not.toBe(-1);
    expect(end, `Missing "${GENERATED_END_MARKER}" in ${GUIDE_PATH}.`).not.toBe(-1);

    const rendered = guide.slice(begin + GENERATED_BEGIN_MARKER.length, end).trim();

    expect(rendered, `The guide's table is stale. Run \`${REGENERATE_COMMAND}\`.`).toBe(renderImplementedTable());
  });
});
