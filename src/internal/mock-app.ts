import type { DataAdapter as DataAdapterOriginal } from 'obsidian';

export interface CreateConfiguredParams {
  adapter?: DataAdapterOriginal;
  appId?: string;
  files?: Record<string, string>;
}
