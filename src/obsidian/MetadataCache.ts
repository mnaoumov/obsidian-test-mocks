/**
 * @file
 *
 * Mock of Obsidian's `MetadataCache`, which indexes each note's links, headings, tags and frontmatter.
 */

import type {
  CachedMetadata as CachedMetadataOriginal,
  MetadataCache as MetadataCacheOriginal,
  Reference as ReferenceOriginal
} from 'obsidian';

import type {
  FileCacheEntry,
  MaybeReturn
} from '../internal/types.ts';
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
import { iterateRefs } from './functions/iterateRefs.ts';
import { TFile as TFileClass } from './TFile.ts';

/**
 * Mock of Obsidian's `MetadataCache`.
 *
 * It indexes Markdown files synchronously whenever the vault fires `create` or `modify`: the content is parsed by
 * the mock's own Markdown parser, the link graph is rebuilt for that file and `changed` is triggered. It fires no
 * `deleted`, `resolve` or `resolved` events, and does not react to renames or deletions.
 */
export class MetadataCache extends Events {
  /**
   * The app the cache belongs to.
   */
  public app: App;

  /**
   * Mock-only: the parsed metadata of each indexed file, keyed by file path; what {@link MetadataCache.getCache}
   * and {@link MetadataCache.getFileCache} read.
   */
  public cache__ = new Map<string, CachedMetadataOriginal>();

  /**
   * The content hash, modification time and size recorded for each indexed file, keyed by file path.
   */
  public fileCache: Record<string, FileCacheEntry> = {};

  /**
   * The parsed metadata keyed by content hash, so files with identical content share one entry.
   */
  public metadataCache: Record<string, CachedMetadataOriginal> = {};

  /**
   * The resolved links: maps each source file path to the destination file paths it links to, with link counts.
   */
  public resolvedLinks: Record<string, Record<string, number>> = {};

  /**
   * The unresolved links: maps each source file path to the link paths that match no file, with link counts.
   */
  public unresolvedLinks: Record<string, Record<string, number>> = {};

  /**
   * Creates a metadata cache that indexes a vault's files as they are created or modified. Use
   * {@link MetadataCache.create2__} from tests.
   *
   * @param app - The app the cache belongs to.
   * @param vault - The vault whose `create` and `modify` events trigger indexing.
   */
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

  /**
   * Mock-only factory: creates a metadata cache, spyable via `vi.spyOn(MetadataCache, 'create2__')`. The subclass
   * variant of {@link Events.create__}.
   *
   * @param app - The app the cache belongs to.
   * @param vault - The vault to index.
   * @returns The new metadata cache.
   */
  public static create2__(app: App, vault: Vault): MetadataCache {
    return new MetadataCache(app, vault);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `MetadataCache` as this mock.
   *
   * @param value - The value typed as the original `MetadataCache`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: MetadataCacheOriginal): MetadataCache {
    return strictProxy(value, MetadataCache);
  }

  /**
   * Mock-only: views this mock as Obsidian's `MetadataCache` type.
   *
   * @returns The same object, typed as the original `MetadataCache`.
   */
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

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(MetadataCache.prototype, 'constructor2__')`.
   *
   * @param _app - The app the cache was created with.
   * @param _vault - The vault the cache was created with.
   */
  public constructor2__(_app: App, _vault: Vault): void {
    noop();
  }

  /**
   * Generates the linktext for a file, following the vault's `newLinkFormat` setting as Obsidian does: the full path
   * for `absolute`, a path relative to the source note's folder for `relative`, and otherwise (Obsidian's default,
   * shortest) the file name when a link by that name resolves to exactly this file, or the full path when it does
   * not.
   *
   * @param file - The file to link to.
   * @param sourcePath - The path of the note the link is in.
   * @param omitMdExtension - Whether to drop the `.md` extension from a Markdown file's name or path; `true` by
   * default, as in Obsidian.
   * @returns The linktext.
   */
  public fileToLinktext(file: TFile, sourcePath: string, omitMdExtension = true): string {
    const shouldOmitExtension = omitMdExtension && file.extension === 'md';
    const path = shouldOmitExtension ? file.path.slice(0, -MD_EXTENSION_SUFFIX.length) : file.path;
    const newLinkFormat = this.app.vault.getConfig('newLinkFormat');

    if (newLinkFormat === 'absolute') {
      return path;
    }

    if (newLinkFormat === 'relative') {
      let prefix = '';
      let folder = getParentPath(sourcePath);
      while (folder !== '' && folder !== '/' && !path.startsWith(`${folder}/`)) {
        prefix = `../${prefix}`;
        folder = getParentPath(folder);
      }
      return prefix + (path.startsWith(`${folder}/`) ? path.slice(folder.length + 1) : path);
    }

    const name = shouldOmitExtension ? file.basename : file.name;
    const destinations = this.getNameDestinations(stripSubpath(name));
    return destinations.length === 1 && destinations[0] === file ? name : path;
  }

  /**
   * Gets the cached metadata of a file by path.
   *
   * @param path - The file's vault path.
   * @returns The file's metadata, or `null` when it has not been indexed.
   */
  public getCache(path: string): CachedMetadataOriginal | null {
    return this.cache__.get(path) ?? null;
  }

  /**
   * Gets the cached metadata of a file.
   *
   * @param file - The file to look up.
   * @returns The file's metadata, or `null` when it has not been indexed.
   */
  public getFileCache(file: TFile): CachedMetadataOriginal | null {
    return this.cache__.get(file.path) ?? null;
  }

  /**
   * Gets the best-matching file for a linkpath.
   *
   * The mock tries, in order: a file at exactly `linkpath`, a file at `linkpath` plus `.md`, then the first vault
   * file whose basename or name equals `linkpath`. It does not prefer files near the source path.
   *
   * @param linkpath - The path part of a link, without any `#` subpath.
   * @param _sourcePath - The path of the note the link is in; ignored by the mock.
   * @returns The matching file, or `null` when none matches.
   */
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

  /**
   * Checks whether a file can be a link target at all — the per-file test Obsidian's own `getLinkSuggestions` walk
   * applies.
   *
   * As in Obsidian, it is a view-registry question rather than an extension list: a file is supported when the vault's
   * `showUnsupportedFiles` setting is on, or when its extension opens in a registered view type. The mock's registry
   * starts with only Obsidian's Markdown view, so out of the box only `md` answers `true`; register a view for an
   * extension (`Plugin.registerExtensions`, or `app.viewRegistry` directly) to make it supported, the way Obsidian's
   * canvas, image, PDF and media views do in the app.
   *
   * @param file - The file to check.
   * @returns Whether the file is supported.
   */
  public isSupportedFile(file: TFile): boolean {
    return Boolean(this.app.vault.getConfig('showUnsupportedFiles')) || this.app.viewRegistry.isExtensionRegistered(file.extension);
  }

  /**
   * Iterates the file's own outgoing references, stopping as soon as the callback answers `true`.
   *
   * Obsidian looks the file's extension up in `MetadataCache.linkUpdaters` first and hands the whole walk to that
   * updater when one is registered, reading the metadata cache only as a fallback. **The mock always takes that
   * fallback branch** — nothing here registers a link updater, and there is no registry to register one in — so a
   * `.canvas` file is walked through its cached metadata like any other. That is the only behavior available here,
   * not an omission waiting to be rediscovered.
   *
   * @param file - The file whose references to walk. An unindexed one yields nothing.
   * @param callback - Called with each reference — the file's frontmatter links first, then its body links, then
   * its embeds. Returning exactly `true` stops the walk, as {@link iterateRefs} does; any other value,
   * `undefined` included, continues it.
   */
  public iterateRefsForFile(file: TFile, callback: (reference: ReferenceOriginal) => MaybeReturn<boolean>): void {
    const cache = this.getFileCache(file);
    if (!cache) {
      return;
    }
    for (const references of [cache.frontmatterLinks, cache.links, cache.embeds]) {
      if (iterateRefs(references ?? [], callback)) {
        return;
      }
    }
  }

  /**
   * Indexes a caller-supplied metadata cache for `path` as though Obsidian had just parsed the file,
   * overriding whatever the automatic parse produced.
   *
   * This runs the SAME bookkeeping the automatic index does — it writes `cache__`, refreshes
   * `fileCache` / `metadataCache` and the `resolvedLinks` / `unresolvedLinks` graph, and fires
   * `changed` as `(file, content, cache)`, the shape real Obsidian emits — so a consumer's handler
   * and a later `getCacheSafe` both see the override rather than a stale parse.
   *
   * The file's own content is read from the vault and passed as the event's `data`; only the metadata
   * is overridden, never the bytes.
   *
   * @param path - The path of an EXISTING file to override the metadata of.
   * @param cache - The metadata to index for it.
   * @throws A `TypeError` if no file exists at `path` — there is no `file` to put on the event, and a
   * `changed` event without one is a shape no real Obsidian consumer is written against.
   */
  public setCache__(path: string, cache: CachedMetadataOriginal): void {
    const file = this.app.vault.getFileByPath(path);
    if (!file) {
      throw new TypeError(`setCache__ requires a file in the vault at "${path}"`);
    }
    this.applyCache(file, this.app.vault.readSync__(file), cache);
  }

  /**
   * Records `cache` as `file`'s metadata and brings every derived structure with it, the way Obsidian
   * does when it finishes indexing a file. The single owner of that bookkeeping — both the automatic
   * parse and the manual `setCache__` override go through here, so neither can drift from the other.
   *
   * @param file - The file being indexed.
   * @param content - The file's content, passed on as the `changed` event's `data`.
   * @param cache - The metadata to record.
   */
  private applyCache(file: TFile, content: string, cache: CachedMetadataOriginal): void {
    this.cache__.set(file.path, cache);
    const hash = hashContent(content);
    this.fileCache[file.path] = { hash, mtime: file.stat.mtime, size: file.stat.size };
    this.metadataCache[hash] = cache;
    this.updateLinks(file.path, cache);
    this.trigger('changed', file, content, cache);
  }

  private getFilesNamed(lowerCaseName: string): TFile[] {
    return this.app.vault.getFiles().filter((candidate) => candidate.name.toLowerCase() === lowerCaseName);
  }

  /**
   * Resolves a bare link name the way Obsidian's `getLinkpathDest` does: by case-insensitive file name, trying the
   * name itself when it has an extension and the name plus `.md` otherwise, and preferring a root-level file of that
   * name when several match.
   *
   * @param linkName - The link name, without a folder or subpath.
   * @returns The files the name resolves to.
   */
  private getNameDestinations(linkName: string): TFile[] {
    let key = linkName.toLowerCase();
    let candidates = key.includes('.') ? this.getFilesNamed(key) : [];
    if (candidates.length === 0) {
      key += '.md';
      candidates = this.getFilesNamed(key);
    }

    if (candidates.length <= 1) {
      return candidates;
    }

    const rootFile = candidates.find((candidate) => candidate.path.toLowerCase() === key);
    return rootFile ? [rootFile] : candidates;
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
    this.applyCache(file, content, parseMarkdownContent(content));
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
const MD_EXTENSION_SUFFIX = '.md';

// The folder part of a path, `''` for a root-level path.
function getParentPath(path: string): string {
  const index = path.lastIndexOf('/');
  return index === -1 ? '' : path.slice(0, index);
}

/**
 * Deterministic djb2-style hash of file content, used to key `metadataCache`.
 * Uses modular arithmetic (no bitwise ops) to stay within a safe integer.
 *
 * @param content - The file content to hash.
 * @returns The hash, as a hexadecimal string.
 */
function hashContent(content: string): string {
  let hash = HASH_INITIAL;
  for (let index = 0; index < content.length; index++) {
    // eslint-disable-next-line unicorn/prefer-code-point -- This hash has to stay stable and defined over UTF-16 code UNITS; `codePointAt` would both change every hash and return `undefined` mid-surrogate.
    hash = (hash * HASH_MULTIPLIER + content.charCodeAt(index)) % HASH_MODULUS;
  }
  return hash.toString(HEX_RADIX);
}

// A linkpath without its `#` subpath.
function stripSubpath(linkpath: string): string {
  const index = linkpath.indexOf('#');
  return index === -1 ? linkpath : linkpath.slice(0, index);
}
