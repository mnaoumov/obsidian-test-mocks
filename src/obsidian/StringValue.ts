import type { StringValue as StringValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
  }

  public override asOriginalType__(): StringValueOriginal {
    return castTo<StringValueOriginal>(this);
  }
}
