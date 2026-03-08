import { castTo } from '../internal/Cast.ts';
import type { NotNullValue as RealNotNullValue } from 'obsidian';

import { Value } from './Value.ts';

export abstract class NotNullValue extends Value {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealNotNullValue {
    return castTo<RealNotNullValue>(this);
  }
}
