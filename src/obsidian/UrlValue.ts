import type { UrlValue as UrlValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { StringValue } from './StringValue.ts';

export class UrlValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): UrlValueOriginal {
    return castTo<UrlValueOriginal>(this);
  }
}
