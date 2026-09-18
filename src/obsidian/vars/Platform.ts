/**
 * @file
 *
 * Mock of Obsidian's `Platform`, describing the device and app the plugin runs in.
 *
 * This is the one file in the published library that imports a Node builtin. `deviceName`, `osName` and
 * `osVersion` are the host machine's, exactly as the desktop bootstrap reads them, and nothing but `node:os`
 * can answer them. The ban the waiver below lifts exists so the published library stays runnable anywhere;
 * the trade is taken here because this package is test mocks — every documented consumer runs it under
 * Vitest or Jest in Node, and it is a devDependency that never reaches a plugin's bundle, which is the same
 * argument `scripts/eslint-config.ts` already accepts for test files. A browser-based runner would now need
 * `node:os` shimmed.
 */

// eslint-disable-next-line import-x/no-nodejs-modules -- The three OS reads below have no other source, and this package is test mocks that only ever run under Vitest or Jest in Node; see the file note above.
import {
  hostname,
  release,
  version
} from 'node:os';

import { apiVersion } from './apiVersion.ts';

/**
 * Flags describing the platform. The mock reports the desktop app on Windows, with a fixed desktop
 * `resourcePathPrefix`; tests can overwrite the flags to simulate another platform.
 *
 * Beyond the thirteen members `obsidian.d.ts` declares, the mock carries eighteen more that Obsidian's own
 * `Platform` literal has and `obsidian-typings` declares as `PlatformEx`. Each takes its real name with no
 * `__` suffix (L4), and each is answered the way the desktop app answers it:
 *
 * - `hasPhysicalKeyboard` is `true` for the same reason `isDesktopApp` is: the desktop app sets it during
 *   startup, the emulate-mobile path resets it to `false`, and mobile detects it asynchronously. Set it to
 *   `false` to drive the affordances Obsidian gates on a soft keyboard, such as `Setting.addText` blurring
 *   its input on `Enter`.
 * - All six `can*` members are **getters**, each re-evaluating Obsidian's own derivation on every read, so a
 *   test that flips `isMobile`, `isPhone`, `isDesktop` or `isDesktopApp` gets a consistent answer rather
 *   than one frozen when this module was first imported: `canPinSidebar` is `isMobile && !isPhone`,
 *   `canExportPdf` is `isDesktopApp`, `canPopoutWindow` is `isDesktopApp && isDesktop`, and
 *   `canDisplayRibbon`, `canSplit` and `canStackTabs` are each `!isPhone`.
 * - `supportsIndexedDb` is a **getter** over `window.indexedDB`, so it reports whatever the test environment
 *   actually has. Obsidian evaluates it once at startup; reading it lazily is the one departure, and it is
 *   what lets a suite stub or remove `indexedDB` and be believed.
 * - `version` is a **getter** returning {@link apiVersion}, rather than a second copy of it that could drift.
 * - `deviceName`, `osName` and `osVersion` are `hostname()`, `version()` and `release()` from `node:os` — the
 *   same three calls the desktop bootstrap makes, in that order. Note `osName` is the DESCRIPTIVE version
 *   string (`Windows 11 Pro`), not the plain OS name it sounds like, and `osVersion` is the kernel release
 *   (`10.0.26200`); the pairing looks transposed and is not.
 * - `mobileSoftKeyboardVisible` is `false`, `manufacturer` and `model` are `''` — the values the desktop
 *   bundle leaves them at, since nothing outside the mobile app ever assigns them.
 * - `mobileDeviceHeight` is a **getter** over `window.innerHeight` — the only screen measurement a test
 *   environment actually has, `window.screen.height` being `0` in jsdom — so a suite that resizes the window
 *   is believed rather than answered from a frozen constant. It is a browser VIEWPORT rather than a device
 *   screen, which on a real phone differ by the status and navigation bars. `mobileKeyboardHeight` is `0` as
 *   a derivation from `mobileSoftKeyboardVisible: false` — a keyboard that is not visible has no height —
 *   rather than as a placeholder; assign a real height to either to simulate mobile.
 * - `build` is `''`. Obsidian fills it with the INSTALLER version, which moves independently of `version`;
 *   the mock has no honest answer for it, so it asserts the empty string the literal starts from rather
 *   than inventing one.
 */
export const Platform = {
  build: '',
  get canDisplayRibbon(): boolean {
    return !Platform.isPhone;
  },
  get canExportPdf(): boolean {
    return Platform.isDesktopApp;
  },
  get canPinSidebar(): boolean {
    return Platform.isMobile && !Platform.isPhone;
  },
  get canPopoutWindow(): boolean {
    return Platform.isDesktopApp && Platform.isDesktop;
  },
  get canSplit(): boolean {
    return !Platform.isPhone;
  },
  get canStackTabs(): boolean {
    return !Platform.isPhone;
  },
  deviceName: hostname(),
  hasPhysicalKeyboard: true,
  isAndroidApp: false,
  isDesktop: true,
  isDesktopApp: true,
  isIosApp: false,
  isLinux: false,
  isMacOS: false,
  isMobile: false,
  isMobileApp: false,
  isPhone: false,
  isSafari: false,
  isTablet: false,
  isWin: true,
  manufacturer: '',
  get mobileDeviceHeight(): number {
    return window.innerHeight;
  },
  mobileKeyboardHeight: 0,
  mobileSoftKeyboardVisible: false,
  model: '',
  osName: version(),
  osVersion: release(),
  resourcePathPrefix: 'app://5462e3dafd259a13b0e6289fb8cc7d833b47/',
  // eslint-disable-next-line unicorn/name-replacements -- `supportsIndexedDb` is Obsidian's own spelling, which L4 requires the mock to keep.
  get supportsIndexedDb(): boolean {
    return !!window.indexedDB;
  },
  get version(): string {
    return apiVersion;
  }
};
