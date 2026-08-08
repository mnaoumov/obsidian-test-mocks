import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { FileSystemAdapter } from '../../obsidian/FileSystemAdapter.ts';

const PROPERTY_NAME = 'insensitive';

export function bridgeFileSystemAdapter(): void {
  defineMissingProperty(FileSystemAdapter.prototype, PROPERTY_NAME, {
    get(this: FileSystemAdapter): boolean {
      return this.insensitive__;
    },
    // eslint-disable-next-line unicorn/consistent-boolean-name -- `value` is Obsidian's own parameter name on the signature being mocked, so a boolean prefix would make the mock stop matching it.
    set(this: FileSystemAdapter, value: boolean) {
      this.insensitive__ = value;
    }
  });
}

export function unbridgeFileSystemAdapter(): void {
  deleteMissingProperty(FileSystemAdapter.prototype, PROPERTY_NAME);
}
