import type { TFileConstructor } from 'obsidian-typings';

import { castTo } from '../../internal/Cast.ts';
import { TFile } from '../../obsidian/TFile.ts';

export function getTFileConstructor(): TFileConstructor {
  return castTo<TFileConstructor>(TFile);
}
