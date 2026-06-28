import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from '../obsidian/App.ts';
import {
  setupUIEventPrototype,
  teardownUIEventPrototype
} from './ui-event-setup.ts';

export function postSetup(): void {
  ensureGenericObject(globalThis)['app'] = App.createConfigured__();
  setupUIEventPrototype();
}

export function postTeardown(): void {
  delete ensureGenericObject(globalThis)['app'];
  teardownUIEventPrototype();
}
