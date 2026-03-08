import type {
  CachedMetadata,
  MetadataCache as MetadataCacheOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Vault } from './Vault.ts';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Events } from './Events.ts';

export class MetadataCache extends Events {
  public _app: App;
  public _cache = new Map<string, CachedMetadata>();
  public resolvedLinks: Record<string, Record<string, number>> = {};
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  protected constructor(app: App, _vault: Vault) {
    super();
    this._app = app;
    const mock = strictMock(this);
    MetadataCache.constructor__(mock, app, _vault);
    return mock;
  }

  public static override constructor__(_instance: MetadataCache, _app: App, _vault: Vault): void {
    // Spy hook.
  }

  public static create__(app: App, _vault: Vault): MetadataCache {
    return new MetadataCache(app, _vault);
  }

  public _setCache(path: string, cache: CachedMetadata): void {
    this._cache.set(path, cache);
    this.trigger('changed');
  }

  public override asOriginalType__(): MetadataCacheOriginal {
    return castTo<MetadataCacheOriginal>(this);
  }

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
    const found = this._app.vault.getFileByPath(linkpath);
    if (found) {
      return found;
    }
    const withMd = this._app.vault.getFileByPath(`${linkpath}.md`);
    if (withMd) {
      return withMd;
    }
    for (const f of this._app.vault.getFiles()) {
      if (f.basename === linkpath || f.name === linkpath) {
        return f;
      }
    }
    return null;
  }
}
