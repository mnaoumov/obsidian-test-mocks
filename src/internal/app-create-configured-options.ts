/**
 * @file
 *
 * Options for `App.createConfigured__`, the mock-only factory that builds an `App` with a pre-populated vault.
 */

import type { DataAdapter as DataAdapterOriginal } from 'obsidian';

/**
 * Options for `App.createConfigured__`: the adapter or its case sensitivity, the app id, and the files and folders
 * to seed the vault with.
 */
export interface AppCreateConfiguredOptions {
  readonly adapter?: DataAdapterOriginal;
  readonly appId?: string;
  /**
   * Map of file/folder paths to content.
   *
   * Paths ending with `/` are treated as folders (content must be empty).
   * Parent folders are created automatically.
   */
  readonly files?: Record<string, string>;
  readonly isAdapterCaseInsensitive?: boolean;
}
