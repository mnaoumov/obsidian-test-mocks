import { castTo } from '../internal/Cast.ts';
import type { TagValue as RealTagValue } from 'obsidian';

import { StringValue } from './StringValue.ts';

export class TagValue extends StringValue {
  public constructor(value: string) {
    super(value);
  }

  public override asReal__(): RealTagValue {
    return castTo<RealTagValue>(this);
  }
}
