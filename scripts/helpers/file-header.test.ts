/**
 * @file
 *
 * Tests for the `@file` block split that `check:helpers-sync` compares around.
 *
 * The suite is mostly about the cases where the answer has to be `null`, because those are the ones with
 * teeth. A splitter that is too eager does not fail loudly - it silently hands the gate a shorter body, and
 * every line it cut stops being compared. So the two recognition guards get a case each: a leading block
 * that is an ordinary comment, and a leading block that merely MENTIONS `@file` in its prose.
 *
 * The last case is the property the gate actually depends on, stated directly rather than left to be
 * inferred from the ones above it: two copies of a file whose headers are worded differently have the same
 * body, and two copies whose CODE differs do not.
 */

import {
  describe,
  expect,
  it
} from 'vitest';

import { splitFileHeader } from './file-header.ts';

const BODY = `

import process from 'node:process';

export const answer = 42;
`;

const HEADER = `/**
 * @file
 *
 * What this file is for.
 */`;

describe('splitFileHeader', () => {
  it('splits the canonical multi-line header from the body', () => {
    const split = splitFileHeader(HEADER + BODY);

    expect(split.header).toBe(HEADER);
    expect(split.body).toBe(BODY);
  });

  it('splits a single-line header, where the tag is on the opening line', () => {
    const header = '/** @file What this file is for. */';

    const split = splitFileHeader(header + BODY);

    expect(split.header).toBe(header);
    expect(split.body).toBe(BODY);
  });

  it('reports no header when the file opens with code', () => {
    const text = BODY.trimStart();

    const split = splitFileHeader(text);

    expect(split.header).toBeNull();
    expect(split.body).toBe(text);
  });

  it('reports no header when the leading block is an ordinary comment', () => {
    const text = `/**
 * Something this file wanted said first.
 */${BODY}`;

    const split = splitFileHeader(text);

    expect(split.header).toBeNull();
    expect(split.body).toBe(text);
  });

  it('reports no header when the leading block only mentions @file in its prose', () => {
    const text = `/**
 * Why the @file convention exists at all.
 */${BODY}`;

    const split = splitFileHeader(text);

    expect(split.header).toBeNull();
    expect(split.body).toBe(text);
  });

  it('reports no header when the leading block is never closed', () => {
    const text = `/**
 * @file
 *
 * Somebody deleted the terminator.
`;

    const split = splitFileHeader(text);

    expect(split.header).toBeNull();
    expect(split.body).toBe(text);
  });

  it('gives two copies worded differently the same body, and two copies coded differently different bodies', () => {
    const otherHeader = `/**
 * @file
 *
 * The same file, described by the repo that took it.
 */`;

    expect(splitFileHeader(otherHeader + BODY).body).toBe(splitFileHeader(HEADER + BODY).body);
    expect(splitFileHeader(otherHeader + BODY.replace('42', '43')).body).not.toBe(splitFileHeader(HEADER + BODY).body);
  });
});
