import type { TAbstractFile } from '../../obsidian/TAbstractFile.ts';
import type { TFile } from '../../obsidian/TFile.ts';

import {
  defineMissingProperty,
  deleteMissingProperty
} from '../../internal/define-missing-property.ts';
import { noopAsync } from '../../internal/noop.ts';
import { Vault } from '../../obsidian/Vault.ts';

const EXISTS_NAME = 'exists';
const GET_ABSTRACT_FILE_BY_PATH_INSENSITIVE_NAME = 'getAbstractFileByPathInsensitive';
const GET_AVAILABLE_PATH_NAME = 'getAvailablePath';
const GET_AVAILABLE_PATH_FOR_ATTACHMENTS_NAME = 'getAvailablePathForAttachments';
const GET_CONFIG_NAME = 'getConfig';
const SET_CONFIG_NAME = 'setConfig';

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
      return this.getAvailablePath__(basePath, extension);
    },
    writable: true
  });

  defineMissingProperty(Vault.prototype, GET_AVAILABLE_PATH_FOR_ATTACHMENTS_NAME, {
    async value(this: Vault, fileName: string, extension: string, file: null | TFile): Promise<string> {
      return await this.getAvailablePathForAttachments__(fileName, extension, file);
    },
    writable: true
  });

  defineMissingProperty(Vault.prototype, GET_CONFIG_NAME, {
    value(this: Vault, key: string): unknown {
      return this.getConfig__(key);
    },
    writable: true
  });

  defineMissingProperty(Vault.prototype, SET_CONFIG_NAME, {
    value(this: Vault, key: string, value: unknown): void {
      this.setConfig__(key, value);
    },
    writable: true
  });
}

export function unbridgeVault(): void {
  deleteMissingProperty(Vault.prototype, EXISTS_NAME);
  deleteMissingProperty(Vault.prototype, GET_ABSTRACT_FILE_BY_PATH_INSENSITIVE_NAME);
  deleteMissingProperty(Vault.prototype, GET_AVAILABLE_PATH_NAME);
  deleteMissingProperty(Vault.prototype, GET_AVAILABLE_PATH_FOR_ATTACHMENTS_NAME);
  deleteMissingProperty(Vault.prototype, GET_CONFIG_NAME);
  deleteMissingProperty(Vault.prototype, SET_CONFIG_NAME);
}
