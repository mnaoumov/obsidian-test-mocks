/**
 * @file
 *
 * Mock of Obsidian's `Platform`, describing the device and app the plugin runs in.
 */

/**
 * Flags describing the platform. The mock reports the desktop app on Windows, with a fixed desktop
 * `resourcePathPrefix`; tests can overwrite the flags to simulate another platform.
 *
 * `hasPhysicalKeyboard` is a real Obsidian internal the public typings omit, and is `true` here for the same
 * reason `isDesktopApp` is: the desktop app sets it during startup, the emulate-mobile path resets it to
 * `false`, and mobile detects it asynchronously. Set it to `false` to drive the affordances Obsidian gates on
 * a soft keyboard, such as `Setting.addText` blurring its input on `Enter`.
 */
export const Platform = {
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
  resourcePathPrefix: 'app://5462e3dafd259a13b0e6289fb8cc7d833b47/'
};
