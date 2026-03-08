import type { ImageValue as ImageValueOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { StringValue } from './StringValue.ts';

export class ImageValue extends StringValue {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): ImageValueOriginal {
    return castTo<ImageValueOriginal>(this);
  }
}
