/**
 * @file
 *
 * Tests for the pure half of the `scripts/docs-gen/` copy-sync gate.
 *
 * The diff bodies below are real `git diff --no-index --unified=0` output, trimmed to the lines the parser
 * reads. Two of them are the shapes that motivate the whole gate, so they are pinned rather than invented:
 * the `link-check.ts` import re-point, and the four-hunk `generate-og-images.ts` rewrite that this repo's
 * stricter `unicorn/no-declarations-before-early-exit` forces.
 */

import {
  describe,
  expect,
  it
} from 'vitest';

import type { DiffHunk } from './docs-gen-copy-sync.ts';

import {
  applyTransformArms,
  describeShapeChange,
  DIVERGENCE_REASONS,
  formatHunk,
  getLocalTreeRelativePath,
  parseDiffShape,
  validateBaselineEntry
} from './docs-gen-copy-sync.ts';

const HELPER_IMPORT_DIFF = [
  'diff --git a/helpers__link-check.ts b/scripts/docs-gen/helpers/link-check.ts',
  'index 1111111..2222222 100644',
  '--- a/helpers__link-check.ts',
  '+++ b/scripts/docs-gen/helpers/link-check.ts',
  '@@ -18 +18 @@ import { normalize } from \'node:path/posix\';',
  '-import { assertNever } from \'../../../src/type-guards.ts\';',
  '+import { assertNever } from \'../../helpers/type-guards.ts\';'
].join('\n');

const NO_TRAILING_NEWLINE_DIFF = [
  '@@ -10 +10 @@',
  '-const LAST = 1;',
  '+const LAST = 2;',
  String.raw`\ No newline at end of file`
].join('\n');

/*
 * Two hunks of the real `generate-og-images.ts` diff. The template placeholders below are upstream's
 * source, not this file's, which is what `no-template-curly-in-string` cannot tell - and altering them to
 * satisfy it would make the fixture a paraphrase of the shape it is here to pin.
 */
/* eslint-disable no-template-curly-in-string -- See above. */
const TWO_HUNK_DIFF = [
  '@@ -101,4 +101,0 @@ async function main(): Promise<void> {',
  '-  const outputDirectory = `${docsDirectory}/public/og`;',
  '-  const manifestPath = `${outputDirectory}/.cache-manifest.json`;',
  '@@ -112,0 +109 @@',
  '+  const fontsDirectory = `${scriptDirectory}/assets/fonts`;'
].join('\n');
/* eslint-enable no-template-curly-in-string -- See above. */

describe('parseDiffShape', () => {
  it('reads nothing out of an empty diff, which is what identical files produce', () => {
    expect(parseDiffShape('')).toEqual([]);
  });

  it('does not count the `---` / `+++` file headers as changed lines', () => {
    const [hunk] = parseDiffShape(HELPER_IMPORT_DIFF);
    expect(parseDiffShape(HELPER_IMPORT_DIFF)).toHaveLength(1);
    expect(hunk?.added).toBe(1);
    expect(hunk?.removed).toBe(1);
  });

  it('splits on `@@` and counts each side per hunk', () => {
    expect(parseDiffShape(TWO_HUNK_DIFF).map((hunk) => ({ added: hunk.added, removed: hunk.removed }))).toEqual([
      { added: 0, removed: 2 },
      { added: 1, removed: 0 }
    ]);
  });

  it('keeps a no-trailing-newline marker in the digest without counting it on either side', () => {
    const [withMarker] = parseDiffShape(NO_TRAILING_NEWLINE_DIFF);
    const [withoutMarker] = parseDiffShape(NO_TRAILING_NEWLINE_DIFF.split('\n').slice(0, -1).join('\n'));
    expect(withMarker?.added).toBe(1);
    expect(withMarker?.removed).toBe(1);
    expect(withMarker?.digest).not.toBe(withoutMarker?.digest);
  });

  it('digests the markers, so an addition and a removal of the same line are different shapes', () => {
    const [added] = parseDiffShape('@@ -1 +1 @@\n+const A = 1;');
    const [removed] = parseDiffShape('@@ -1 +1 @@\n-const A = 1;');
    expect(added?.digest).not.toBe(removed?.digest);
  });

  it('is blind to where a hunk sits, so an unrelated edit above it is not reported as drift', () => {
    const atTop = parseDiffShape('@@ -3 +3 @@\n-const A = 1;\n+const A = 2;');
    const movedDown = parseDiffShape('@@ -41 +57 @@ function f(): void {\n-const A = 1;\n+const A = 2;');
    expect(atTop).toEqual(movedDown);
  });
});

describe('describeShapeChange', () => {
  const FIRST: DiffHunk = { added: 1, digest: 'aaaaaaaaaaaa', removed: 1 };
  const SECOND: DiffHunk = { added: 2, digest: 'bbbbbbbbbbbb', removed: 0 };
  const recorded: DiffHunk[] = [FIRST, SECOND];

  it('says nothing when the shape is unchanged', () => {
    expect(describeShapeChange('x.ts', recorded, [...recorded])).toBeNull();
  });

  it('says nothing when both sides are byte-identical', () => {
    expect(describeShapeChange('x.ts', [], [])).toBeNull();
  });

  it('reports a file that was identical and now differs', () => {
    expect(describeShapeChange('x.ts', [], recorded)).toBe('x.ts was byte-identical to upstream after the recorded transform and now differs, in 2 hunks.');
  });

  it('reports a file that differed and is now identical', () => {
    expect(describeShapeChange('x.ts', recorded, [])).toContain('is now byte-identical');
  });

  it('reports a changed hunk count, which is what an upstream edit to a diverged file looks like', () => {
    expect(describeShapeChange('x.ts', recorded, [...recorded, { added: 1, digest: 'cccccccccccc', removed: 0 }])).toBe(
      'x.ts differs from upstream in 3 hunks, where the baseline records 2 hunks.'
    );
  });

  it('names which hunk changed, and quotes both shapes, when the count is unchanged', () => {
    const actual: DiffHunk[] = [FIRST, { added: 3, digest: 'dddddddddddd', removed: 1 }];
    expect(describeShapeChange('x.ts', recorded, actual)).toBe(
      'x.ts still differs from upstream in 2 hunks, but hunk 2 has changed: +2/-0 @bbbbbbbbbbbb recorded, +3/-1 @dddddddddddd now.'
    );
  });

  it('counts one hunk in the singular', () => {
    expect(describeShapeChange('x.ts', [], [FIRST])).toContain('in 1 hunk.');
  });
});

describe('validateBaselineEntry', () => {
  it('accepts a divergence that names a reason from the vocabulary', () => {
    expect(validateBaselineEntry('x.ts', { hunks: [{ added: 1, digest: 'aaaaaaaaaaaa', removed: 0 }], reasons: ['satteri-processor'] })).toBeNull();
  });

  it('accepts a byte-identical file with no reasons', () => {
    expect(validateBaselineEntry('x.ts', { hunks: [], reasons: [] })).toBeNull();
  });

  it('rejects hunks recorded with no reason', () => {
    expect(validateBaselineEntry('x.ts', { hunks: [{ added: 1, digest: 'aaaaaaaaaaaa', removed: 0 }], reasons: [] })).toContain('with no reason');
  });

  it('rejects a reason outside the vocabulary, and lists the vocabulary', () => {
    const problem = validateBaselineEntry('x.ts', { hunks: [{ added: 1, digest: 'aaaaaaaaaaaa', removed: 0 }], reasons: ['because-i-said-so'] });
    expect(problem).toContain('because-i-said-so');
    expect(problem).toContain('satteri-processor');
  });

  it('rejects a reason claimed by a file that no longer diverges', () => {
    expect(validateBaselineEntry('x.ts', { hunks: [], reasons: ['satteri-processor'] })).toContain('no longer exists');
  });
});

describe('applyTransformArms', () => {
  it('renames the package everywhere it appears, which is the whole of divergence 1', () => {
    expect(applyTransformArms('import \'obsidian-dev-utils/string\'; // https://mnaoumov.dev/obsidian-dev-utils/', 'helpers/x.ts')).toBe(
      'import \'obsidian-test-mocks/string\'; // https://mnaoumov.dev/obsidian-test-mocks/'
    );
  });

  it('leaves text that never names the package alone', () => {
    expect(applyTransformArms('const A = 1;\n', 'helpers/x.ts')).toBe('const A = 1;\n');
  });
});

describe('getLocalTreeRelativePath', () => {
  it('pairs the Sätteri port with the remark plugin it was ported from', () => {
    expect(getLocalTreeRelativePath('helpers/remark-plugins/remark-relative-links.ts')).toBe('helpers/satteri-plugins/satteri-relative-links.ts');
    expect(getLocalTreeRelativePath('helpers/remark-plugins/remark-relative-links.test.ts')).toBe('helpers/satteri-plugins/satteri-relative-links.test.ts');
  });

  it('leaves every other path where it is', () => {
    expect(getLocalTreeRelativePath('helpers/remark-plugins/util.ts')).toBe('helpers/remark-plugins/util.ts');
  });
});

describe('formatHunk', () => {
  it('renders the counts and the digest', () => {
    expect(formatHunk({ added: 4, digest: 'f762b6aaa8d6', removed: 3 })).toBe('+4/-3 @f762b6aaa8d6');
  });
});

describe('DIVERGENCE_REASONS', () => {
  it('describes every reason it admits, since the descriptions are what a failure prints', () => {
    for (const [reason, description] of Object.entries(DIVERGENCE_REASONS)) {
      expect(reason, `${reason} has an empty description`).toBeTruthy();
      expect(description.length, `${reason} has an empty description`).toBeGreaterThan(0);
    }
  });
});
