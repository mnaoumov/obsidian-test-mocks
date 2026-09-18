import {
  hostname,
  release,
  version
} from 'node:os';
import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { apiVersion } from './apiVersion.ts';
import { Platform } from './Platform.ts';

describe('Platform', () => {
  afterEach(() => {
    Platform.isMobile = false;
    Platform.isPhone = false;
  });

  it('should have isDesktop set to true', () => {
    expect(Platform.isDesktop).toBe(true);
  });

  it('should have isMobile set to false', () => {
    expect(Platform.isMobile).toBe(false);
  });

  it('should have hasPhysicalKeyboard set to true, as the desktop app does', () => {
    expect(Platform.hasPhysicalKeyboard).toBe(true);
  });

  it('should have resourcePathPrefix as a string', () => {
    expect(typeof Platform.resourcePathPrefix).toBe('string');
  });

  it('should leave the mobile-only device identity empty, as the desktop bundle does', () => {
    expect(Platform.manufacturer).toBe('');
    expect(Platform.model).toBe('');
    expect(Platform.mobileSoftKeyboardVisible).toBe(false);
  });

  it('should leave build empty, having no honest answer for the installer version', () => {
    expect(Platform.build).toBe('');
  });

  it('should report the host machine, as the desktop bootstrap does', () => {
    expect(Platform.deviceName).toBe(hostname());
    expect(Platform.osName).toBe(version());
    expect(Platform.osVersion).toBe(release());
  });

  it('should derive version from apiVersion, so the two cannot drift', () => {
    expect(Platform.version).toBe(apiVersion);
  });

  it('should report supportsIndexedDb from the test environment', () => {
    expect(Platform.supportsIndexedDb).toBe(!!window.indexedDB);
  });

  describe('canPinSidebar', () => {
    it('should be false on the desktop defaults', () => {
      expect(Platform.canPinSidebar).toBe(false);
    });

    it('should be true on a tablet', () => {
      Platform.isMobile = true;
      expect(Platform.canPinSidebar).toBe(true);
    });

    it('should be false on a phone', () => {
      Platform.isMobile = true;
      Platform.isPhone = true;
      expect(Platform.canPinSidebar).toBe(false);
    });
  });
});
