import type { TFolderConstructor } from 'obsidian-typings';

import { castTo } from '../../internal/Cast.ts';
import { TFolder } from '../../obsidian/TFolder.ts';

export function getTFolderConstructor(): TFolderConstructor {
  return castTo<TFolderConstructor>(TFolder);
}
