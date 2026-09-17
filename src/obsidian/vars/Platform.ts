/**
 * @file
 *
 * Mock of Obsidian's `Platform`, describing the device and app the plugin runs in.
 */

/**
 * Flags describing the platform. The mock reports the desktop app on Windows, with a fixed desktop
 * `resourcePathPrefix`; tests can overwrite the flags to simulate another platform.
 */
export const Platform = {
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
