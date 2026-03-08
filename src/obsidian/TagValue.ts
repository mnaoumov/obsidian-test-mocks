import type { TagValue as RealTagValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
  }

  public override asReal__(): RealTagValue {
    return strictCastTo<RealTagValue>(this);
  }
}
