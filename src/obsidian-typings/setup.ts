/**
 * @file
 *
 * Retained no-op entry point.
 *
 * This module used to install a bridge layer: it defined `obsidian-typings`' internal names on the mock
 * prototypes and delegated each to the mock's own `__`-suffixed member (`Menu.items` → `items__`). That
 * indirection is gone. A mock member that implements a real Obsidian internal now simply carries that
 * internal's name, so there is nothing left to bridge — `Menu.items` IS the mock's member, with or
 * without this setup.
 *
 * The entry point stays, doing nothing, because roughly thirty repositories name it in a Vitest or Jest
 * config. Removing the module outright would fail those runners at startup with a module-resolution
 * error, which is a far worse failure than a call that no longer needs to happen. It will be removed in
 * the next major release.
 *
 * Members `obsidian-typings` declares that the mocks do NOT implement still throw through the strict
 * proxy, exactly as before — that is the guarantee, not a gap this setup used to paper over.
 *
 * @deprecated Bridging is no longer required; the mocks carry the real names themselves. Drop this
 * setup file from your test configuration.
 */

import { noop } from '../internal/noop.ts';

/**
 * Does nothing.
 *
 * @deprecated Bridging is no longer required. Drop this setup file from your test configuration.
 */
export function setup(): void {
  noop();
}

/**
 * Does nothing.
 *
 * @deprecated Bridging is no longer required. Drop this setup file from your test configuration.
 */
export function teardown(): void {
  noop();
}
