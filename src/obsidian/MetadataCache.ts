import type {
  CachedMetadata,
  MetadataCache as MetadataCacheOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Vault } from './Vault.ts';

import { castTo } from '../internal/Cast.ts';
import { parseMarkdownContent } from '../internal/markdown-parser.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Events } from './Events.ts';
import { TFile as TFileClass } from './TFile.ts';

export class MetadataCache extends Events {
  public _app: App;
  public _cache = new Map<string, CachedMetadata>();
  public resolvedLinks: Record<string, Record<string, number>> = {};
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  protected constructor(app: App, vault: Vault) {
    super();
    this._app = app;
    vault.on('create', (...data: unknown[]) => {
      this._parseFileMetadata(data[0]);
    });
    vault.on('modify', (...data: unknown[]) => {
      this._parseFileMetadata(data[0]);
    });
  }

  public static create__(app: App, vault: Vault): MetadataCache {
    return strictMock(new MetadataCache(app, vault));
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

  private _parseFileMetadata(file: unknown): void {
    if (!(file instanceof TFileClass) || file.extension !== 'md') {
      return;
    }
    const vaultFile = file;
    this._app.vault.cachedRead(vaultFile).then((content: string) => {
      const cache = parseMarkdownContent(content);
      this._cache.set(vaultFile.path, cache);
      this.trigger('changed', vaultFile, content, cache);
    }).catch(() => {
      // Silently ignore read errors during metadata parsing.
    });
  }
}
