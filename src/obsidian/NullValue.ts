import type { NullValue as NullValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { Value } from './Value.ts';

export class NullValue extends Value {
  public override asOriginalType__(): NullValueOriginal {
    return castTo<NullValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return false;
  }

  public toString__(): string {
    return '';
  }
}
