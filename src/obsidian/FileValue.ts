import type { FileValue as FileValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public static create__(): FileValue {
    return strictMock(new FileValue());
  }

  public override asOriginalType__(): FileValueOriginal {
    return castTo<FileValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
