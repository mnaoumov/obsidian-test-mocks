import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from '../obsidian/App.ts';

export function postSetup(): void {
  ensureGenericObject(globalThis)['app'] = App.createConfigured__();
}

export function postTeardown(): void {
  delete ensureGenericObject(globalThis)['app'];
}
