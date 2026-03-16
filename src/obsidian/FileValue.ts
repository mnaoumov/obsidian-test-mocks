import type { FileValue as FileValueOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

export class FileValue extends NotNullValue {
  public constructor(app: App, file: TFile) {
    super();
    const self = strictProxy(this);
    self.constructor3__(app, file);
    return self;
  }

  public static create__(app: App, file: TFile): FileValue {
    return new FileValue(app, file);
  }

  public static fromOriginalType3__(value: FileValueOriginal): FileValue {
    return bridgeType<FileValue>(value);
  }

  public asOriginalType3__(): FileValueOriginal {
    return bridgeType<FileValueOriginal>(this);
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
