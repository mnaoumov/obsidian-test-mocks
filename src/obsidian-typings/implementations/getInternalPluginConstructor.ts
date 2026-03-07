import type { App } from 'obsidian';
import type { InternalPluginConstructor } from 'obsidian-typings';

export function getInternalPluginConstructor<Instance>(_app: App): InternalPluginConstructor<Instance> {
  throw new Error('getInternalPluginConstructor is not supported in test mocks');
}
