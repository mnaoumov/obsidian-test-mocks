import type { StringValue as RealStringValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
  }

  public override asReal__(): RealStringValue {
    return strictCastTo<RealStringValue>(this);
  }
}
