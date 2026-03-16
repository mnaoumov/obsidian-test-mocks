import type {
  CachedMetadata as CachedMetadataOriginal,
  MetadataCache as MetadataCacheOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Vault } from './Vault.ts';

import {
  createMockOf,
  createMockOfUnsafe
} from '../internal/create-mock-of.ts';
import { parseMarkdownContent } from '../internal/markdown-parser.ts';
import { noop } from '../internal/noop.ts';
import { Events } from './Events.ts';
import { TFile as TFileClass } from './TFile.ts';

export class MetadataCache extends Events {
  public app__: App;
  public cache__ = new Map<string, CachedMetadataOriginal>();
  public resolvedLinks: Record<string, Record<string, number>> = {};
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  protected constructor(app: App, vault: Vault) {
    super();
    this.app__ = app;
    vault.on('create', (...data: unknown[]) => {
      this.parseFileMetadata(data[0]);
    });
    vault.on('modify', (...data: unknown[]) => {
      this.parseFileMetadata(data[0]);
    });
    const self = createMockOf(this);
    self.constructor2__(app, vault);
    return self;
  }

  public static create2__(app: App, vault: Vault): MetadataCache {
    return new MetadataCache(app, vault);
  }

  public static fromOriginalType2__(value: MetadataCacheOriginal): MetadataCache {
    return createMockOfUnsafe<MetadataCache>(value);
  }

  public asOriginalType2__(): MetadataCacheOriginal {
    return createMockOfUnsafe<MetadataCacheOriginal>(this);
  }

  public constructor2__(_app: App, _vault: Vault): void {
    noop();
  }

  public fileToLinktext(file: TFile, _sourcePath: string, omitMdExtension?: boolean): string {
    if (omitMdExtension && file.extension === 'md') {
      return file.basename;
    }
    return file.name;
  }

  public getCache(path: string): CachedMetadataOriginal | null {
    return this.cache__.get(path) ?? null;
  }

  public getFileCache(file: TFile): CachedMetadataOriginal | null {
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

  public setCache__(path: string, cache: CachedMetadataOriginal): void {
    this.cache__.set(path, cache);
    this.trigger('changed');
  }

  private parseFileMetadata(file: unknown): void {
    if (!(file instanceof TFileClass) || file.extension !== 'md') {
      return;
    }
    const vaultFile = file;
    this.app__.vault.cachedRead(vaultFile).then((content: string) => {
      const cache = parseMarkdownContent(content);
      this.cache__.set(vaultFile.path, cache);
      this.trigger('changed', vaultFile, content, cache);
    }).catch(console.error);
  }
}
