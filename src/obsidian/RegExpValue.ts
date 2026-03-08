import { castTo } from '../internal/Cast.ts';
import type { RegExpValue as RealRegExpValue } from 'obsidian';

import { NotNullValue } from './NotNullValue.ts';

export class RegExpValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealRegExpValue {
    return castTo<RealRegExpValue>(this);
  }
}
