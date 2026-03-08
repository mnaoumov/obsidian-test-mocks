import type { HTMLValue as RealHTMLValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealHTMLValue {
    return strictCastTo<RealHTMLValue>(this);
  }
}
