import type { LinkValue as LinkValueOriginal } from 'obsidian';

import type { App } from './App.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { StringValue } from './StringValue.ts';

export class LinkValue extends StringValue {
  public constructor(app: App, value: string, sourcePath: string, display?: null | string) {
    super(value);
    const self = strictProxy(this);
    self.constructor5__(app, value, sourcePath, display);
    return self;
  }

  public static create2__(app: App, value: string, sourcePath: string, display?: null | string): LinkValue {
    return new LinkValue(app, value, sourcePath, display);
  }

  public static fromOriginalType5__(value: LinkValueOriginal): LinkValue {
    return strictProxy(value, LinkValue);
  }

  public static parseFromString(app: App, input: string, sourcePath: string): LinkValue | null {
    const match = /^\[\[(?<inner>[^\]]+)\]\]$/.exec(input);
    if (!match) {
      return null;
    }
    const inner = ensureNonNullable(match.groups?.['inner']);
    const pipeIndex = inner.indexOf('|');
    const linkValue = LinkValue.create2__(app, pipeIndex >= 0 ? inner.slice(0, pipeIndex) : inner, sourcePath);
    return linkValue;
  }

  public asOriginalType5__(): LinkValueOriginal {
    return strictProxy<LinkValueOriginal>(this);
  }

  public constructor5__(_app: App, _value: string, _sourcePath: string, _display?: null | string): void {
    noop();
  }
}
