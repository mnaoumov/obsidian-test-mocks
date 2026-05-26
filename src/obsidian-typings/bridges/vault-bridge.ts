import type { TAbstractFile } from '../../obsidian/TAbstractFile.ts';

import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { noopAsync } from '../../internal/noop.ts';
import { Vault } from '../../obsidian/Vault.ts';

const EXISTS_NAME = 'exists';
const GET_ABSTRACT_FILE_BY_PATH_INSENSITIVE_NAME = 'getAbstractFileByPathInsensitive';
const GET_AVAILABLE_PATH_NAME = 'getAvailablePath';

export function bridgeVault(): void {
  defineMissingProperty(Vault.prototype, EXISTS_NAME, {
    async value(this: Vault, path: string, isCaseSensitive?: boolean): Promise<boolean> {
      await noopAsync();
      if (isCaseSensitive) {
        return this.getAbstractFileByPath(path) !== null;
      }
      return this.getAbstractFileByPathInsensitive__(path) !== null;
    },
    writable: true
  });

  defineMissingProperty(Vault.prototype, GET_ABSTRACT_FILE_BY_PATH_INSENSITIVE_NAME, {
    value(this: Vault, path: string): null | TAbstractFile {
      return this.getAbstractFileByPathInsensitive__(path);
    },
    writable: true
  });

  defineMissingProperty(Vault.prototype, GET_AVAILABLE_PATH_NAME, {
    value(this: Vault, basePath: string, extension: string): string {
      if (extension) {
        return `${basePath}.${extension}`;
      }
      return basePath;
    },
    writable: true
  });
}

export function unbridgeVault(): void {
  deleteMissingProperty(Vault.prototype, EXISTS_NAME);
  deleteMissingProperty(Vault.prototype, GET_ABSTRACT_FILE_BY_PATH_INSENSITIVE_NAME);
  deleteMissingProperty(Vault.prototype, GET_AVAILABLE_PATH_NAME);
}
