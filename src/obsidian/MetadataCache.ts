import type {
  CachedMetadata as CachedMetadataOriginal,
  MetadataCache as MetadataCacheOriginal
} from 'obsidian';

import type { FileCacheEntry } from '../internal/types.ts';
import type { App } from './App.ts';
import type { TFile } from './TFile.ts';
import type { Vault } from './Vault.ts';

import { parseMarkdownContent } from '../internal/markdown-parser.ts';
import {
  noop,
  noopAsync
} from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Events } from './Events.ts';
import { TFile as TFileClass } from './TFile.ts';

export class MetadataCache extends Events {
  public app: App;
  public cache__ = new Map<string, CachedMetadataOriginal>();
  public fileCache: Record<string, FileCacheEntry> = {};
  public metadataCache: Record<string, CachedMetadataOriginal> = {};
  public resolvedLinks: Record<string, Record<string, number>> = {};
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  protected constructor(app: App, vault: Vault) {
    super();
    this.app = app;
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

  /**
   * Parses a file's raw bytes into metadata, the way Obsidian does when it indexes a file.
   *
   * @param arrayBuffer - The file's raw content.
   * @returns The parsed metadata.
   */
  public async computeMetadataAsync(arrayBuffer: ArrayBuffer): Promise<CachedMetadataOriginal> {
    await noopAsync();
    const content = new TextDecoder().decode(arrayBuffer);
    return parseMarkdownContent(content);
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

  // eslint-disable-next-line unicorn/name-replacements -- `getFirstLinkpathDest` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  public getFirstLinkpathDest(linkpath: string, _sourcePath: string): null | TFile {
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
      content = this.app.vault.readSync__(file);
    } catch {
      // The file was removed before indexing; leave the cache untouched.
      return;
    }
    const cache = parseMarkdownContent(content);
    this.cache__.set(file.path, cache);
    const hash = hashContent(content);
    this.fileCache[file.path] = { hash, mtime: file.stat.mtime, size: file.stat.size };
    this.metadataCache[hash] = cache;
    this.updateLinks(file.path, cache);
    this.trigger('changed', file, content, cache);
  }

  private updateLinks(sourcePath: string, cache: CachedMetadataOriginal): void {
    const resolved: Record<string, number> = {};
    const unresolved: Record<string, number> = {};
    const references = [...cache.links ?? [], ...cache.embeds ?? [], ...cache.frontmatterLinks ?? []];
    for (const reference of references) {
      const hashIndex = reference.link.indexOf('#');
      const linkpath = hashIndex === -1 ? reference.link : reference.link.slice(0, hashIndex);
      if (linkpath === '') {
        continue;
      }
      const destination = this.getFirstLinkpathDest(linkpath, sourcePath);
      if (destination) {
        resolved[destination.path] = (resolved[destination.path] ?? 0) + 1;
      } else {
        unresolved[linkpath] = (unresolved[linkpath] ?? 0) + 1;
      }
    }
    this.resolvedLinks[sourcePath] = resolved;
    this.unresolvedLinks[sourcePath] = unresolved;
  }
}

const HASH_INITIAL = 5381;
const HASH_MULTIPLIER = 33;
const HASH_MODULUS = 2_147_483_647;
const HEX_RADIX = 16;

/**
 * Deterministic djb2-style hash of file content, used to key `metadataCache`.
 * Uses modular arithmetic (no bitwise ops) to stay within a safe integer.
 */
function hashContent(content: string): string {
  let hash = HASH_INITIAL;
  for (let index = 0; index < content.length; index++) {
    // eslint-disable-next-line unicorn/prefer-code-point -- This hash has to stay stable and defined over UTF-16 code UNITS; `codePointAt` would both change every hash and return `undefined` mid-surrogate.
    hash = (hash * HASH_MULTIPLIER + content.charCodeAt(index)) % HASH_MODULUS;
  }
  return hash.toString(HEX_RADIX);
}
