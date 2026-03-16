import { ensureGenericObject } from '../internal/type-guards.ts';
import { App } from '../obsidian/App.ts';

export function postSetup(): void {
  ensureGenericObject(globalThis)['app'] = App.createConfigured__();
}
