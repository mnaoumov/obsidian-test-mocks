import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class RegExpValue extends NotNullValue {
  public static create__(): RegExpValue {
    return strictMock(new RegExpValue());
  }

  public override asOriginalType__(): RegExpValueOriginal {
    return castTo<RegExpValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
