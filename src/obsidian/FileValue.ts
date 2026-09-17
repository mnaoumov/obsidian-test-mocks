/**
 * @file
 *
 * Mock of Obsidian's `FileValue`, the Bases value wrapping a vault file.
 */

import type { FileValue as FileValueOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

/**
 * Mock of Obsidian's `FileValue`: a non-null value wrapping a file.
 *
 * The mock does not keep the file: it is always truthy and renders as an empty string.
 */
export class FileValue extends NotNullValue {
  /**
   * Creates a file value.
   *
   * @param app - The app the file belongs to.
   * @param file - The wrapped file; not stored by the mock.
   */
  public constructor(app: App, file: TFile) {
    super();
    const self = strictProxy(this);
    self.constructor3__(app, file);
    return self;
  }

  /**
   * Mock-only factory: creates a file value, spyable via `vi.spyOn(FileValue, 'create__')`.
   *
   * @param app - The app the file belongs to.
   * @param file - The wrapped file.
   * @returns The new file value.
   */
  public static create__(app: App, file: TFile): FileValue {
    return new FileValue(app, file);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `FileValue` as this mock.
   *
   * @param value - The value typed as the original `FileValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: FileValueOriginal): FileValue {
    return strictProxy(value, FileValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `FileValue` type.
   *
   * @returns The same object, typed as the original `FileValue`.
   */
  public asOriginalType3__(): FileValueOriginal {
    return strictProxy<FileValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(FileValue.prototype, 'constructor3__')`.
   *
   * @param _app - The app the value was created with.
   * @param _file - The file the value was created with.
   */
  public constructor3__(_app: App, _file: TFile): void {
    noop();
  }

  /**
   * Tells whether the value counts as true in a Bases formula.
   *
   * @returns Always `true`: a file value is never empty.
   */
  public isTruthy(): boolean {
    return true;
  }

  /**
   * Renders the value as a string.
   *
   * @returns An empty string in the mock, since the file is not stored.
   */
  public toString(): string {
    return '';
  }
}
