/**
 * @file
 *
 * Tests for the pure half of the copy-sync gate.
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

import type {
  DiffHunk,
  FileShape
} from './copy-sync.ts';

import {
  applyTransformArms,
  COPY_SYNC_PATHS,
  describeShapeChange,
  DIVERGENCE_REASONS,
  formatHunk,
  getContentDigest,
  getLocalPath,
  isBinaryContent,
  isBinaryShape,
  isComparedPath,
  isIdenticalShape,
  isNeverComparedPath,
  NEVER_COMPARED_PATHS,
  parseDiffShape,
  validateBaselineEntry
} from './copy-sync.ts';

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

function toTextShape(hunks: readonly DiffHunk[]): FileShape {
  return { hunks };
}

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
    expect(describeShapeChange('x.ts', toTextShape(recorded), toTextShape([...recorded]))).toBeNull();
  });

  it('says nothing when both sides are byte-identical', () => {
    expect(describeShapeChange('x.ts', toTextShape([]), toTextShape([]))).toBeNull();
  });

  it('reports a file that was identical and now differs', () => {
    expect(describeShapeChange('x.ts', toTextShape([]), toTextShape(recorded))).toBe(
      'x.ts was byte-identical to upstream after the recorded transforms and now differs, in 2 hunks.'
    );
  });

  it('reports a file that differed and is now identical', () => {
    expect(describeShapeChange('x.ts', toTextShape(recorded), toTextShape([]))).toContain('is now byte-identical');
  });

  it('reports a changed hunk count, which is what an upstream edit to a diverged file looks like', () => {
    expect(describeShapeChange('x.ts', toTextShape(recorded), toTextShape([...recorded, { added: 1, digest: 'cccccccccccc', removed: 0 }]))).toBe(
      'x.ts differs from upstream in 3 hunks, where the baseline records 2 hunks.'
    );
  });

  it('names which hunk changed, and quotes both shapes, when the count is unchanged', () => {
    const actual: DiffHunk[] = [FIRST, { added: 3, digest: 'dddddddddddd', removed: 1 }];
    expect(describeShapeChange('x.ts', toTextShape(recorded), toTextShape(actual))).toBe(
      'x.ts still differs from upstream in 2 hunks, but hunk 2 has changed: +2/-0 @bbbbbbbbbbbb recorded, +3/-1 @dddddddddddd now.'
    );
  });

  it('counts one hunk in the singular', () => {
    expect(describeShapeChange('x.ts', toTextShape([]), toTextShape([FIRST]))).toContain('in 1 hunk.');
  });

  it('says nothing when two binary digests are both unchanged', () => {
    expect(
      describeShapeChange(
        'font.ttf',
        { digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' } },
        { digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' } }
      )
    ).toBeNull();
  });

  it('names upstream as the side that moved, and that the pair no longer matches', () => {
    expect(
      describeShapeChange(
        'font.ttf',
        { digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' } },
        { digests: { local: 'aaaaaaaaaaaa', upstream: 'bbbbbbbbbbbb' } }
      )
    ).toBe('font.ttf is binary and compared by hash: upstream\'s is @bbbbbbbbbbbb where the baseline records @aaaaaaaaaaaa, and the two hold different bytes.');
  });

  it('names both sides when both moved, and says when they have converged', () => {
    const change = describeShapeChange(
      'font.ttf',
      { digests: { local: 'aaaaaaaaaaaa', upstream: 'bbbbbbbbbbbb' } },
      { digests: { local: 'cccccccccccc', upstream: 'cccccccccccc' } }
    );
    expect(change).toContain('upstream\'s is @cccccccccccc');
    expect(change).toContain('this repo\'s is @cccccccccccc');
    expect(change).toContain('the two now hold the same bytes');
  });

  it('reports a file that changes which way it is compared, in either direction', () => {
    const binary: FileShape = { digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' } };
    expect(describeShapeChange('x.svg', binary, toTextShape([]))).toContain('recorded as a binary comparison and now reads as text');
    expect(describeShapeChange('x.svg', toTextShape([]), binary)).toContain('recorded as a text comparison and now reads as binary');
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

  it('accepts a binary file whose two digests agree and claims nothing', () => {
    expect(validateBaselineEntry('font.ttf', { digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' }, reasons: [] })).toBeNull();
  });

  it('rejects two differing digests with no reason, and quotes both', () => {
    const problem = validateBaselineEntry('font.ttf', { digests: { local: 'aaaaaaaaaaaa', upstream: 'bbbbbbbbbbbb' }, reasons: [] });
    expect(problem).toContain('a different hash');
    expect(problem).toContain('@aaaaaaaaaaaa');
    expect(problem).toContain('@bbbbbbbbbbbb');
  });

  it('rejects a reason on a binary file whose digests agree', () => {
    expect(validateBaselineEntry('font.ttf', { digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' }, reasons: ['vendored-og-assets'] })).toContain('no longer exists');
  });
});

describe('applyTransformArms', () => {
  it('renames the package everywhere it appears, which is half of divergence 1', () => {
    expect(applyTransformArms('import \'obsidian-dev-utils/string\'; // https://mnaoumov.dev/obsidian-dev-utils/', 'scripts/docs-gen/helpers/x.ts')).toBe(
      'import \'obsidian-test-mocks/string\'; // https://mnaoumov.dev/obsidian-test-mocks/'
    );
  });

  it('renames the display title too, which is the other half and is how the site is named', () => {
    expect(applyTransformArms('title: \'Obsidian Dev Utils\'', 'astro.config.ts')).toBe('title: \'Obsidian Test Mocks\'');
  });

  it('leaves text that never names the package alone', () => {
    expect(applyTransformArms('const A = 1;\n', 'scripts/docs-gen/helpers/x.ts')).toBe('const A = 1;\n');
  });
});

describe('getLocalPath', () => {
  it('pairs the Sätteri port with the remark plugin it was ported from', () => {
    expect(getLocalPath('scripts/docs-gen/helpers/remark-plugins/remark-relative-links.ts')).toBe('scripts/docs-gen/helpers/satteri-plugins/satteri-relative-links.ts');
    expect(getLocalPath('scripts/docs-gen/helpers/remark-plugins/remark-relative-links.test.ts')).toBe(
      'scripts/docs-gen/helpers/satteri-plugins/satteri-relative-links.test.ts'
    );
  });

  it('leaves every other path where it is', () => {
    expect(getLocalPath('scripts/docs-gen/helpers/remark-plugins/util.ts')).toBe('scripts/docs-gen/helpers/remark-plugins/util.ts');
  });
});

describe('isComparedPath', () => {
  it('covers a single-file area by its exact path', () => {
    expect(isComparedPath('astro.config.ts')).toBe(true);
    expect(isComparedPath('docs/tsconfig.json')).toBe(true);
    expect(isComparedPath('.github/workflows/build-pages.yml')).toBe(true);
  });

  it('covers a tree area at any depth, whatever the extension', () => {
    expect(isComparedPath('scripts/docs-gen/helpers/og-image.ts')).toBe(true);
    expect(isComparedPath('scripts/docs-gen/tsconfig.json')).toBe(true);
    expect(isComparedPath('scripts/docs-gen/assets/fonts/inter-latin-400-normal.ttf')).toBe(true);
    expect(isComparedPath('docs/src/components/api/MethodTable.astro')).toBe(true);
    expect(isComparedPath('docs/src/styles/global.css')).toBe(true);
  });

  it('covers nothing outside an area, including a sibling whose name merely starts the same', () => {
    expect(isComparedPath('src/index.ts')).toBe(false);
    expect(isComparedPath('docs/public/favicon.svg')).toBe(false);
    expect(isComparedPath('.github/workflows/publish-npm.yml')).toBe(false);
    expect(isComparedPath('astro.config.mts')).toBe(false);
    expect(isComparedPath('scripts/docs-generate.ts')).toBe(false);
  });

  it('excludes the never-compared paths, so the favicon is not drift and the content tree is not a copy', () => {
    expect(isComparedPath('docs/src/assets/favicon.svg')).toBe(false);
    expect(isComparedPath('docs/src/content/docs/index.mdx')).toBe(false);
  });

  it('draws the content exclusion at the path boundary, so `content.config.ts` is still compared', () => {
    expect(isNeverComparedPath('docs/src/content.config.ts')).toBe(false);
    expect(isComparedPath('docs/src/content.config.ts')).toBe(true);
  });
});

describe('isBinaryContent', () => {
  it('reads a NUL byte as binary, which is what a font has and no source file does', () => {
    expect(isBinaryContent(new Uint8Array([0x00, 0x01, 0x00, 0x00]))).toBe(true);
  });

  it('reads text as text, including the UTF-8 it is decoded from', () => {
    expect(isBinaryContent(new TextEncoder().encode('const A = 1;\n// Sätteri\n'))).toBe(false);
  });

  it('reads an empty file as text, since there is no NUL to find', () => {
    expect(isBinaryContent(new Uint8Array())).toBe(false);
  });
});

describe('getContentDigest', () => {
  it('digests the bytes, and differs on a one-byte change', () => {
    const digest = getContentDigest(new Uint8Array([1, 2, 3]));
    expect(digest).toHaveLength(12);
    expect(digest).not.toBe(getContentDigest(new Uint8Array([1, 2, 4])));
  });

  it('is stable for the same bytes', () => {
    expect(getContentDigest(new Uint8Array([1, 2, 3]))).toBe(getContentDigest(new Uint8Array([1, 2, 3])));
  });
});

describe('isBinaryShape', () => {
  it('tells the two kinds of comparison apart', () => {
    expect(isBinaryShape({ digests: { local: 'a', upstream: 'a' } })).toBe(true);
    expect(isBinaryShape(toTextShape([]))).toBe(false);
  });
});

describe('isIdenticalShape', () => {
  it('reads no hunks, and two agreeing digests, as identical', () => {
    expect(isIdenticalShape(toTextShape([]))).toBe(true);
    expect(isIdenticalShape({ digests: { local: 'aaaaaaaaaaaa', upstream: 'aaaaaaaaaaaa' } })).toBe(true);
  });

  it('reads a hunk, and two differing digests, as a divergence', () => {
    expect(isIdenticalShape(toTextShape([{ added: 1, digest: 'aaaaaaaaaaaa', removed: 0 }]))).toBe(false);
    expect(isIdenticalShape({ digests: { local: 'aaaaaaaaaaaa', upstream: 'bbbbbbbbbbbb' } })).toBe(false);
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

describe('NEVER_COMPARED_PATHS', () => {
  it('excludes only paths that sit inside an area, since anything else is excluded already', () => {
    for (const path of Object.keys(NEVER_COMPARED_PATHS)) {
      expect(COPY_SYNC_PATHS.some((copySyncPath) => path === copySyncPath || path.startsWith(`${copySyncPath}/`)), `${path} is not inside a copy-sync area`).toBe(true);
    }
  });

  it('says why for each one, since a silent exclusion is a hole nobody can see', () => {
    for (const [path, reason] of Object.entries(NEVER_COMPARED_PATHS)) {
      expect(reason.length, `${path} has an empty reason`).toBeGreaterThan(0);
    }
  });
});

describe('formatHunk', () => {
  it('renders the counts and the digest', () => {
    expect(formatHunk({ added: 4, digest: 'f762b6aaa8d6', removed: 3 })).toBe('+4/-3 @f762b6aaa8d6');
  });
});
