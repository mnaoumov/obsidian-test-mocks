import type { CachedMetadata } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { Events } from './Events.ts';

export class MetadataCache extends Events {
  public _cache: Map<string, CachedMetadata> = new Map();
  public app: App | null = null;
  public resolvedLinks: Record<string, Record<string, number>> = {};
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  public fileToLinktext(file: TFile, _sourcePath: string, omitMdExtension?: boolean): string {
    if (omitMdExtension && file.extension === 'md') {
      return file.basename;
    }
    return file.name;
  }

  public getCache(path: string): CachedMetadata | null {
    return this._cache.get(path) ?? null;
  }

  public getFileCache(file: TFile): CachedMetadata | null {
    return this._cache.get(file.path) ?? null;
  }

  public getFirstLinkpathDest(linkpath: string, _sourcePath: string): null | TFile {
    if (!this.app) {
      return null;
    }
    const found = this.app.vault.getFileByPath(linkpath);
    if (found) {
      return found;
    }
    const withMd = this.app.vault.getFileByPath(`${linkpath}.md`);
    if (withMd) {
      return withMd;
    }
    for (const f of this.app.vault.getFiles()) {
      if (f.basename === linkpath || f.name === linkpath) {
        return f;
      }
    }
    return null;
  }

  public setCache(path: string, cache: CachedMetadata): void {
    this._cache.set(path, cache);
    this.trigger('changed');
  }
}
