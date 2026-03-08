import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { Value } from './Value.ts';

export abstract class NotNullValue extends Value {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): NotNullValueOriginal {
    return castTo<NotNullValueOriginal>(this);
  }
}
