import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export class ObjectValue extends NotNullValue {
  public override asOriginalType__(): ObjectValueOriginal {
    return castTo<ObjectValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }
}
