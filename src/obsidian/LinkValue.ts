import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class LinkValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value);
    return self;
  }

  public static override create__(value = ''): LinkValue {
    return new LinkValue(value);
  }

  public static parseFromString(_app: App, input: string, _sourcePath: string): LinkValue | null {
    const match = /^\[\[(?<inner>[^\]]+)\]\]$/.exec(input);
    if (!match) {
      return null;
    }
    const inner = match.groups?.['inner'] ?? '';
    const pipeIndex = inner.indexOf('|');
    const linkValue = LinkValue.create__(pipeIndex >= 0 ? inner.slice(0, pipeIndex) : inner);
    return linkValue;
  }

  public override asOriginalType__(): LinkValueOriginal {
    return castTo<LinkValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}
