import type {
  CachedMetadata,
  MetadataCache as MetadataCacheOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Vault } from './Vault.ts';

import { castTo } from '../internal/cast.ts';
import { parseMarkdownContent } from '../internal/markdown-parser.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Events } from './Events.ts';
import { TFile as TFileClass } from './TFile.ts';

export class MetadataCache extends Events {
  public app__: App;
  public cache__ = new Map<string, CachedMetadata>();
  public resolvedLinks: Record<string, Record<string, number>> = {};
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  protected constructor(app: App, vault: Vault) {
    super();
    this.app__ = app;
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
    return this.cache__.get(path) ?? null;
  }

  public getFileCache(file: TFile): CachedMetadata | null {
    return this.cache__.get(file.path) ?? null;
  }

  public getFirstLinkpathDest(linkpath: string, _sourcePath: string): null | TFile {
    const found = this.app__.vault.getFileByPath(linkpath);
    if (found) {
      return found;
    }
    const withMd = this.app__.vault.getFileByPath(`${linkpath}.md`);
    if (withMd) {
      return withMd;
    }
    for (const f of this.app__.vault.getFiles()) {
      if (f.basename === linkpath || f.name === linkpath) {
        return f;
      }
    }
    return null;
  }

  public setCache__(path: string, cache: CachedMetadata): void {
    this.cache__.set(path, cache);
    this.trigger('changed');
  }

  private _parseFileMetadata(file: unknown): void {
    if (!(file instanceof TFileClass) || file.extension !== 'md') {
      return;
    }
    const vaultFile = file;
    this.app__.vault.cachedRead(vaultFile).then((content: string) => {
      const cache = parseMarkdownContent(content);
      this.cache__.set(vaultFile.path, cache);
      this.trigger('changed', vaultFile, content, cache);
    }).catch(() => {
      // Silently ignore read errors during metadata parsing.
    });
  }
}
