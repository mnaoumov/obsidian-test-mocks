/**
 * @file
 *
 * Mock of Obsidian's `FileValue`, the Bases value wrapping a vault file.
 */

import type { FileValue as FileValueOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { DateValue } from './DateValue.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { StringValue } from './StringValue.ts';

/**
 * Mock of Obsidian's `FileValue`: a non-null value wrapping a file.
 */
export class FileValue extends NotNullValue {
  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-file';

  /**
   * Creates a file value.
   *
   * @param app - The app the file belongs to.
   * @param file - The wrapped file.
   */
  public constructor(public app: App, public file: TFile) {
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
   * Lists the property keys {@link FileValue.objectAccess} answers for.
   *
   * @returns The inherited keys followed by Obsidian's fifteen file keys, the five this mock does not back
   * included — the list is what the app advertises, not what the mock can answer.
   */
  public override keys(): string[] {
    return [
      ...super.keys(),
      'file',
      'name',
      'basename',
      'fullname',
      'path',
      'folder',
      'ext',
      'ctime',
      'mtime',
      'size',
      'links',
      'embeds',
      'backlinks',
      'tags',
      'properties'
    ];
  }

  /**
   * Reads a named property of the wrapped file.
   *
   * `links`, `embeds`, `backlinks`, `tags` and `properties` are NOT answered: each needs one of
   * `FileValue.getLinks`, `getEmbeds`, `getBacklinks`, `getTags` and `getProps`, which stay unmocked (L2),
   * so they fall through to the base and read as `null` rather than as a list.
   *
   * @param key - The property key, matched without regard to case.
   * @returns This value itself for `file`; the file's display name, basename, full name, path, folder path
   * or extension as a `StringValue`; its creation or modification time as a `DateValue`; its size as a
   * `NumberValue`; and otherwise whatever the base answers.
   * @throws {Error} For `folder` when the file has no parent folder, where Obsidian reads it unguarded.
   */
  public override objectAccess(key: string): null | Value {
    switch (key.toLowerCase()) {
      case 'basename': {
        return StringValue.create__(this.file.basename);
      }
      case 'ctime': {
        return DateValue.create__(new Date(this.file.stat.ctime));
      }
      case 'ext': {
        return StringValue.create__(this.file.extension);
      }
      case 'file': {
        return this;
      }
      case 'folder': {
        return StringValue.create__(ensureNonNullable(this.file.parent, 'The file has no parent folder.').path);
      }
      case 'fullname': {
        return StringValue.create__(this.file.name);
      }
      case 'mtime': {
        return DateValue.create__(new Date(this.file.stat.mtime));
      }
      case 'name': {
        return StringValue.create__(this.file.getShortName());
      }
      case 'path': {
        return StringValue.create__(this.file.path);
      }
      case 'size': {
        return NumberValue.create__(this.file.stat.size);
      }
      default: {
        return super.objectAccess(key);
      }
    }
  }

  /**
   * Renders the value as a string.
   *
   * @returns The wrapped file's vault path.
   */
  public toString(): string {
    return this.file.path;
  }
}
