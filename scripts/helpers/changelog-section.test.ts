/**
 * @file
 *
 * Tests for `extractChangelogSection`.
 */

import dedent from 'dedent';
import {
  describe,
  expect,
  it
} from 'vitest';

import { extractChangelogSection } from './changelog-section.ts';

const CHANGELOG_WITH_PREVIOUS_RELEASE = dedent`
  # CHANGELOG

  ## 8.1.0

  One change since 8.0.0.

  ### New

  - Mock the new member

  ### Fixed

  - Stop throwing on a missing key

  ## 8.0.0

  - chore: the previous release\n
`;

const FIRST_RELEASE_CHANGELOG = dedent`
  # CHANGELOG

  ## 1.0.0

  - feat: the first release\n
`;

describe('extractChangelogSection', () => {
  it('keeps the subheadings of a grouped section, stopping at the previous release', () => {
    expect(extractChangelogSection(CHANGELOG_WITH_PREVIOUS_RELEASE, '8.1.0')).toBe(
      'One change since 8.0.0.\n\n### New\n\n- Mock the new member\n\n### Fixed\n\n- Stop throwing on a missing key'
    );
  });

  it('reads an older section too', () => {
    expect(extractChangelogSection(CHANGELOG_WITH_PREVIOUS_RELEASE, '8.0.0')).toBe('- chore: the previous release');
  });

  it('reads the only section of a first release', () => {
    expect(extractChangelogSection(FIRST_RELEASE_CHANGELOG, '1.0.0')).toBe('- feat: the first release');
  });

  it('does not match a version whose dots would match any character', () => {
    expect(extractChangelogSection('# CHANGELOG\n\n## 8x1x0\n\n- a\n', '8.1.0')).toBe('');
  });

  it('reads an empty section as empty', () => {
    expect(extractChangelogSection('# CHANGELOG\n\n## 1.0.0\n\n', '1.0.0')).toBe('');
  });

  it('reads a version the changelog does not carry as empty', () => {
    expect(extractChangelogSection(CHANGELOG_WITH_PREVIOUS_RELEASE, '99.0.0')).toBe('');
  });

  it('reads a CRLF changelog', () => {
    expect(extractChangelogSection(FIRST_RELEASE_CHANGELOG.replaceAll('\n', '\r\n'), '1.0.0')).toBe('- feat: the first release');
  });
});
