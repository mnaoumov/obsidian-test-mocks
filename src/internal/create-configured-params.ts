import type { DataAdapter as DataAdapterOriginal } from 'obsidian';

export interface CreateConfiguredParams {
  adapter?: DataAdapterOriginal;
  appId?: string;
  /**
   * Map of file/folder paths to content.
   *
   * Paths ending with `/` are treated as folders (content must be empty).
   * Parent folders are created automatically.
   */
  files?: Record<string, string>;
}
