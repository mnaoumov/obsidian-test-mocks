import type { FileValue as RealFileValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealFileValue {
    return strictCastTo<RealFileValue>(this);
  }
}
