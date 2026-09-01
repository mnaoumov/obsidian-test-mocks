/**
 * @file
 *
 * Retained no-op Jest setup entry point. See `./setup.ts` for why it still exists.
 *
 * @deprecated Bridging is no longer required; the mocks carry Obsidian's real internal names
 * themselves. Remove this file from your Jest `setupFiles`.
 */

/* eslint-disable @typescript-eslint/no-deprecated, import-x/no-deprecated -- This file IS the deprecated entry point, so calling its own deprecated export is the whole of its remaining job. Consumers get the warning; the shim that exists to keep their config resolving cannot also refuse to use it. */
import { setup } from './setup.ts';

setup();

/* eslint-enable @typescript-eslint/no-deprecated, import-x/no-deprecated -- Restores the rules disabled for this whole file. */
