import type { FileValue as FileValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor3__();
    return self;
  }

  public static create__(): FileValue {
    return new FileValue();
  }

  public override asOriginalType__(): FileValueOriginal {
    return castTo<FileValueOriginal>(this);
  }

  public constructor3__(): void {
    noop();
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
