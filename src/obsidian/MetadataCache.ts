import type {
  CachedMetadata as CachedMetadataOriginal,
  MetadataCache as MetadataCacheOriginal
} from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Vault } from './Vault.ts';

import { parseMarkdownContent } from '../internal/markdown-parser.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
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
    const self = strictProxy(this);
    self.constructor2__(app, vault);
    return self;
  }

  public static create2__(app: App, vault: Vault): MetadataCache {
    return new MetadataCache(app, vault);
  }

  public static fromOriginalType2__(value: MetadataCacheOriginal): MetadataCache {
    return strictProxy(value, MetadataCache);
  }

  public asOriginalType2__(): MetadataCacheOriginal {
    return strictProxy<MetadataCacheOriginal>(this);
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
    let content: string;
    try {
      content = this.app__.vault.readSync__(file);
    } catch {
      // The file was removed before indexing; leave the cache untouched.
      return;
    }
    const cache = parseMarkdownContent(content);
    this.cache__.set(file.path, cache);
    this.updateLinks(file.path, cache);
    this.trigger('changed', file, content, cache);
  }

  private updateLinks(sourcePath: string, cache: CachedMetadataOriginal): void {
    const resolved: Record<string, number> = {};
    const unresolved: Record<string, number> = {};
    const references = [...cache.links ?? [], ...cache.embeds ?? [], ...cache.frontmatterLinks ?? []];
    for (const reference of references) {
      const linkpath = reference.link.split('#')[0] ?? '';
      if (linkpath === '') {
        continue;
      }
      const dest = this.getFirstLinkpathDest(linkpath, sourcePath);
      if (dest) {
        resolved[dest.path] = (resolved[dest.path] ?? 0) + 1;
      } else {
        unresolved[linkpath] = (unresolved[linkpath] ?? 0) + 1;
      }
    }
    this.resolvedLinks[sourcePath] = resolved;
    this.unresolvedLinks[sourcePath] = unresolved;
  }
}
