import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class LinkValue extends StringValue {
  public constructor(app: App, value: string, sourcePath: string, display?: null | string) {
    super(value);
    const self = strictMock(this);
    self.constructor5__(app, value, sourcePath, display);
    return self;
  }

  public static create2__(app: App, value: string, sourcePath: string, display?: null | string): LinkValue {
    return new LinkValue(app, value, sourcePath, display);
  }

  public static parseFromString(app: App, input: string, sourcePath: string): LinkValue | null {
    const match = /^\[\[(?<inner>[^\]]+)\]\]$/.exec(input);
    if (!match) {
      return null;
    }
    const inner = match.groups?.['inner'] ?? '';
    const pipeIndex = inner.indexOf('|');
    const linkValue = LinkValue.create2__(app, pipeIndex >= 0 ? inner.slice(0, pipeIndex) : inner, sourcePath);
    return linkValue;
  }

  public override asOriginalType__(): LinkValueOriginal {
    return castTo<LinkValueOriginal>(this);
  }

  public constructor5__(_app: App, _value: string, _sourcePath: string, _display?: null | string): void {
    noop();
  }
}
