import { StateField } from '@codemirror/state';
import { ViewPlugin } from '@codemirror/view';
import {
  describe,
  expect,
  it
} from 'vitest';

import { apiVersion } from '../../../src/obsidian/vars/apiVersion.ts';
import { editorEditorField } from '../../../src/obsidian/vars/editorEditorField.ts';
import { editorInfoField } from '../../../src/obsidian/vars/editorInfoField.ts';
import { editorLivePreviewField } from '../../../src/obsidian/vars/editorLivePreviewField.ts';
import { editorViewField } from '../../../src/obsidian/vars/editorViewField.ts';
import { livePreviewState } from '../../../src/obsidian/vars/livePreviewState.ts';
import { moment } from '../../../src/obsidian/vars/moment.ts';
import { Platform } from '../../../src/obsidian/vars/Platform.ts';

describe('apiVersion', () => {
  it('should be a valid version string', () => {
    expect(apiVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('Platform', () => {
  it('should have isDesktop set to true', () => {
    expect(Platform.isDesktop).toBe(true);
  });

  it('should have isMobile set to false', () => {
    expect(Platform.isMobile).toBe(false);
  });

  it('should have resourcePathPrefix as a string', () => {
    expect(typeof Platform.resourcePathPrefix).toBe('string');
  });
});

describe('moment', () => {
  it('should be a function', () => {
    expect(typeof moment).toBe('function');
  });
});

describe('editorEditorField', () => {
  it('should be a StateField instance', () => {
    expect(editorEditorField).toBeInstanceOf(StateField);
  });
});

describe('editorInfoField', () => {
  it('should be a StateField instance', () => {
    expect(editorInfoField).toBeInstanceOf(StateField);
  });
});

describe('editorLivePreviewField', () => {
  it('should be a StateField instance', () => {
    expect(editorLivePreviewField).toBeInstanceOf(StateField);
  });
});

describe('editorViewField', () => {
  it('should be a StateField instance', () => {
    expect(editorViewField).toBeInstanceOf(StateField);
  });
});

describe('livePreviewState', () => {
  it('should be a ViewPlugin instance', () => {
    expect(livePreviewState).toBeInstanceOf(ViewPlugin);
  });
});
