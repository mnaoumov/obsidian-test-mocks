import type { App } from 'obsidian';
import type { InternalPluginsConstructor } from 'obsidian-typings';

export function getInternalPluginsConstructor(_app: App): InternalPluginsConstructor {
  throw new Error('getInternalPluginsConstructor is not supported in test mocks');
}
