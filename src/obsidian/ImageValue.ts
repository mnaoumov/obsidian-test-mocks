import { castTo } from '../internal/Cast.ts';
import type { ImageValue as RealImageValue } from 'obsidian';

import { StringValue } from './StringValue.ts';

export class ImageValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealImageValue {
    return castTo<RealImageValue>(this);
  }
}
