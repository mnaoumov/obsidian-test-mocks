import type { UrlValue as RealUrlValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { StringValue } from './StringValue.ts';

export class UrlValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealUrlValue {
    return strictCastTo<RealUrlValue>(this);
  }
}
