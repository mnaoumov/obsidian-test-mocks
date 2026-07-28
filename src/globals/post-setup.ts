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

export function postSetup(): void {
  ensureGenericObject(globalThis)['app'] = App.createConfigured__();
  setupHTMLElementPrototype();
  setupNodePrototype();
  setupUIEventPrototype();
}

export function postTeardown(): void {
  delete ensureGenericObject(globalThis)['app'];
  teardownHTMLElementPrototype();
  teardownNodePrototype();
  teardownUIEventPrototype();
}
