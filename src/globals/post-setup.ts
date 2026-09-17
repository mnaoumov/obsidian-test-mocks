/**
 * @file
 *
 * The setup steps that run after the global helpers are installed: the global `app` and the prototype getters.
 */

import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from '../obsidian/App.ts';
import {
  setupHTMLElementPrototype,
  teardownHTMLElementPrototype
} from './html-element-setup.ts';
import {
  setupNodePrototype,
  teardownNodePrototype
} from './node-setup.ts';
import {
  setupUIEventPrototype,
  teardownUIEventPrototype
} from './ui-event-setup.ts';

/**
 * Sets the global `app` to a configured {@link App} mock and defines the `HTMLElement`, `Node` and `UIEvent` prototype
 * members Obsidian adds.
 */
export function postSetup(): void {
  ensureGenericObject(globalThis)['app'] = App.createConfigured__();
  setupHTMLElementPrototype();
  setupNodePrototype();
  setupUIEventPrototype();
}

/**
 * Undoes {@link postSetup}: deletes the global `app` and the prototype members it defined.
 */
export function postTeardown(): void {
  delete ensureGenericObject(globalThis)['app'];
  teardownHTMLElementPrototype();
  teardownNodePrototype();
  teardownUIEventPrototype();
}
