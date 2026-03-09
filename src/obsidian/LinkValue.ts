import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { StringValue } from './StringValue.ts';

export class LinkValue extends StringValue {
  public static parseFromString(_app: App, input: string, _sourcePath: string): LinkValue | null {
    const match = /^\[\[(?<inner>[^\]]+)\]\]$/.exec(input);
    if (!match) {
      return null;
    }
    const inner = match.groups?.['inner'] ?? '';
    const pipeIndex = inner.indexOf('|');
    const linkValue = new LinkValue(pipeIndex >= 0 ? inner.slice(0, pipeIndex) : inner);
    return linkValue;
  }

  public override asOriginalType__(): LinkValueOriginal {
    return castTo<LinkValueOriginal>(this);
  }
}
