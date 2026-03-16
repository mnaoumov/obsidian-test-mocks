import type { FileValue as FileValueOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public constructor(app: App, file: TFile) {
    super();
    const self = createMockOf(this);
    self.constructor3__(app, file);
    return self;
  }

  public static create__(app: App, file: TFile): FileValue {
    return new FileValue(app, file);
  }

  public static fromOriginalType3__(value: FileValueOriginal): FileValue {
    return createMockOfUnsafe<FileValue>(value);
  }

  public asOriginalType3__(): FileValueOriginal {
    return createMockOfUnsafe<FileValueOriginal>(this);
  }

  public constructor3__(_app: App, _file: TFile): void {
    noop();
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
