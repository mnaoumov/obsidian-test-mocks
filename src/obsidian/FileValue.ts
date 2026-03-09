import type { FileValue as FileValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public override asOriginalType__(): FileValueOriginal {
    return castTo<FileValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }
}
