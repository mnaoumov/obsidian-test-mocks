/**
 * @file
 *
 * The two media facts Obsidian's renderers share: which extensions count as an image, and how a desktop
 * `file:///` source is turned into a path the renderer can load.
 */

import { Platform } from '../obsidian/vars/Platform.ts';

/**
 * The scheme prefix a desktop source carries before it is re-prefixed.
 */
const FILE_URL_PREFIX = 'file:///';

/**
 * The extensions Obsidian treats as an image, its own `IMAGE_EXTENSIONS` list.
 */
export const IMAGE_EXTENSIONS = ['bmp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'];

/**
 * Rewrites a desktop `file:///` source onto Obsidian's resource-path prefix, as the app does before handing
 * it to an `img`, an `audio` or a `video`.
 *
 * Every other source - and every source at all on mobile, where Obsidian does not apply this - is returned
 * unchanged, so the caller can pass any source through.
 *
 * @param source - The source to rewrite.
 * @returns The rewritten source, or `source` itself when it is not a desktop file URL.
 */
export function toDesktopResourcePath(source: string): string {
  return Platform.isDesktopApp && source.startsWith(FILE_URL_PREFIX)
    ? Platform.resourcePathPrefix + source.slice(FILE_URL_PREFIX.length)
    : source;
}
