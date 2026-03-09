import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export class RegExpValue extends NotNullValue {
  public override asOriginalType__(): RegExpValueOriginal {
    return castTo<RegExpValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }
}
