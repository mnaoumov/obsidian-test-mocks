import type { AppConstructor } from 'obsidian-typings';

import { castTo } from '../../internal/Cast.ts';
import { App } from '../../obsidian/App.ts';

export function getAppConstructor(): AppConstructor {
  return castTo<AppConstructor>(App);
}
