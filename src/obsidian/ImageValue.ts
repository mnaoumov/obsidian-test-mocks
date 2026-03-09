import type { ImageValue as ImageValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class ImageValue extends StringValue {
  public static override create__(value = ''): ImageValue {
    return strictMock(new ImageValue(value));
  }

  public override asOriginalType__(): ImageValueOriginal {
    return castTo<ImageValueOriginal>(this);
  }
}
