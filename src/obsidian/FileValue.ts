import { castTo } from '../internal/Cast.ts';
import type { FileValue as RealFileValue } from 'obsidian';

import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return '';
  }

  public override asReal__(): RealFileValue {
    return castTo<RealFileValue>(this);
  }
}
