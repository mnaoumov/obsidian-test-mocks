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
    Platform.isDesktop = true;
    Platform.isDesktopApp = true;
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

  describe('mobileDeviceHeight', () => {
    it('should report the viewport height the test environment actually has', () => {
      expect(Platform.mobileDeviceHeight).toBe(window.innerHeight);
    });

    it('should move with the window, rather than freeze at import time', () => {
      const originalInnerHeight = window.innerHeight;

      try {
        window.innerHeight = originalInnerHeight + 100;
        expect(Platform.mobileDeviceHeight).toBe(originalInnerHeight + 100);
      } finally {
        window.innerHeight = originalInnerHeight;
      }
    });
  });

  it('should have mobileKeyboardHeight at 0, coherently with mobileSoftKeyboardVisible being false', () => {
    expect(Platform.mobileSoftKeyboardVisible).toBe(false);
    expect(Platform.mobileKeyboardHeight).toBe(0);
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

  describe('canExportPdf', () => {
    it('should be true in the desktop app', () => {
      expect(Platform.canExportPdf).toBe(true);
    });

    it('should follow isDesktopApp', () => {
      Platform.isDesktopApp = false;
      expect(Platform.canExportPdf).toBe(false);
    });
  });

  describe('canPopoutWindow', () => {
    it('should be true in the desktop app with a desktop UI', () => {
      expect(Platform.canPopoutWindow).toBe(true);
    });

    it('should be false in the desktop app emulating mobile', () => {
      Platform.isDesktop = false;
      expect(Platform.canPopoutWindow).toBe(false);
    });

    it('should be false in the mobile app', () => {
      Platform.isDesktopApp = false;
      expect(Platform.canPopoutWindow).toBe(false);
    });
  });

  describe.each(['canDisplayRibbon', 'canSplit', 'canStackTabs'] as const)('%s', (member) => {
    it('should be true off a phone', () => {
      expect(Platform[member]).toBe(true);
    });

    it('should be false on a phone', () => {
      Platform.isPhone = true;
      expect(Platform[member]).toBe(false);
    });
  });
});
