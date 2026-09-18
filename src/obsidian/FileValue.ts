/**
 * @file
 *
 * Mock of Obsidian's `FileValue`, the Bases value wrapping a vault file.
 */

import type { FileValue as FileValueOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { ObjectValue } from './ObjectValue.ts';
import type { TFile } from './TFile.ts';
import type { Value } from './Value.ts';

import { markFileValue } from '../internal/file-value-registry.ts';
import { createFrontMatterObjectValue } from '../internal/front-matter-object-value.ts';
import { linkValueFromReference } from '../internal/link-value-from-reference.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { TagsListValue } from '../internal/tags-list-value.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { DateValue } from './DateValue.ts';
import { parseFrontMatterTags } from './functions/parseFrontMatterTags.ts';
import { LinkValue } from './LinkValue.ts';
import { ListValue } from './ListValue.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { StringValue } from './StringValue.ts';

const MD_EXTENSION = 'md';

/**
 * Mock of Obsidian's `FileValue`: a non-null value wrapping a file.
 */
export class FileValue extends NotNullValue {
  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-file';

  /**
   * The five accessors' memos, each filled by its accessor's first call and never invalidated, exactly as
   * Obsidian's `_cachedLinks` and its four siblings are. They keep their unprefixed names because they are
   * private implementation detail rather than mocked members (L8), and the staleness is the point: a value
   * read before the vault changed goes on answering what it answered then, in the mock as in the app.
   */
  private cachedBacklinks: ListValue | null = null;

  private cachedEmbeds: ListValue | null = null;

  private cachedLinks: ListValue | null = null;

  private cachedProps: null | ObjectValue = null;

  private cachedTags: ListValue | null = null;

  /**
   * Creates a file value.
   *
   * @param app - The app the file belongs to.
   * @param file - The wrapped file.
   */
  public constructor(public app: App, public file: TFile) {
    super();
    markFileValue(this);
    const self = strictProxy(this);
    self.constructor3__(app, file);
    return self;
  }

  /**
   * Mock-only factory: creates a file value, spyable via `vi.spyOn(FileValue, 'create__')`.
   *
   * @param app - The app the file belongs to.
   * @param file - The wrapped file.
   * @returns The new file value.
   */
  public static create__(app: App, file: TFile): FileValue {
    return new FileValue(app, file);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `FileValue` as this mock.
   *
   * @param value - The value typed as the original `FileValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: FileValueOriginal): FileValue {
    return strictProxy(value, FileValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `FileValue` type.
   *
   * @returns The same object, typed as the original `FileValue`.
   */
  public asOriginalType3__(): FileValueOriginal {
    return strictProxy<FileValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(FileValue.prototype, 'constructor3__')`.
   *
   * @param _app - The app the value was created with.
   * @param _file - The file the value was created with.
   */
  public constructor3__(_app: App, _file: TFile): void {
    noop();
  }

  /**
   * Compares this file with another, as Obsidian does: by `TFile` IDENTITY, not by path.
   *
   * Two `FileValue`s built from the same path therefore compare unequal unless the vault handed both the
   * same `TFile` — which it does, since a vault keeps one `TFile` per path, but a hand-built `TFile` in a
   * test does not.
   *
   * @param other - The file value to compare with.
   * @returns Whether both wrap the same `TFile` object.
   */
  public override equals(other: this): boolean {
    return this.file === other.file;
  }

  /**
   * Gets the links pointing AT the wrapped file.
   *
   * Obsidian walks the metadata cache's whole `resolvedLinks` graph on every call that is not answered
   * from the memo, so a backlink appears as soon as the source note is indexed — no separate backlink
   * index is consulted. Only RESOLVED links count: a link that matches no file is not a backlink to
   * anything.
   *
   * @returns A list of `LinkValue`s, one per source note that links here, in the graph's own insertion
   * order. Each targets the SOURCE note's path, carries an empty source path — so resolving it is
   * resolving an absolute path — and shows the source note's short name. A note linking here twice
   * appears once. Memoized: the first call's list is returned forever after, as Obsidian's is.
   */
  public getBacklinks(): ListValue {
    if (this.cachedBacklinks) {
      return this.cachedBacklinks;
    }
    const backlinks = Object.entries(this.app.metadataCache.resolvedLinks)
      .filter(([, destinations]) => Object.hasOwn(destinations, this.file.path))
      .map(([sourcePath]) => LinkValue.create2__(this.app, sourcePath, '', StringValue.create__(getShortName(sourcePath))));
    this.cachedBacklinks = ListValue.create__(backlinks);
    return this.cachedBacklinks;
  }

  /**
   * Gets the file's embeds.
   *
   * @returns A list of `LinkValue`s, one per embed in the file's cached metadata, in the order the
   * parser found them. An unindexed file gives an empty list. Memoized, as {@link FileValue.getBacklinks}
   * is.
   */
  public getEmbeds(): ListValue {
    if (this.cachedEmbeds) {
      return this.cachedEmbeds;
    }
    const embeds = this.app.metadataCache.getFileCache(this.file)?.embeds ?? [];
    this.cachedEmbeds = ListValue.create__(embeds.map((embed) => linkValueFromReference(this.app, this.file.path, embed)));
    return this.cachedEmbeds;
  }

  /**
   * Gets the links going OUT of the file.
   *
   * A one-line walk over {@link MetadataCache.iterateRefsForFile}, exactly as Obsidian writes it, so the
   * order is that method's own — frontmatter links, then body links, then embeds. An embed therefore
   * counts as an outgoing link and appears in both this list and {@link FileValue.getEmbeds}. Unlike
   * {@link FileValue.getBacklinks} this reads the file's own cache rather than the link graph, so a link
   * that resolves to nothing is still listed.
   *
   * @returns A list of `LinkValue`s. An unindexed file gives an empty list. Memoized, as
   * {@link FileValue.getBacklinks} is.
   */
  public getLinks(): ListValue {
    if (this.cachedLinks) {
      return this.cachedLinks;
    }
    const links: LinkValue[] = [];
    this.app.metadataCache.iterateRefsForFile(this.file, (reference) => {
      links.push(linkValueFromReference(this.app, this.file.path, reference));
    });
    this.cachedLinks = ListValue.create__(links);
    return this.cachedLinks;
  }

  /**
   * Gets the file's frontmatter properties.
   *
   * @returns An `ObjectValue` over a shallow copy of the frontmatter, carrying the frontmatter evaluator
   * that reads a string property as a wikilink, a URL or a date and a `tags` property as a list of tags.
   * An unindexed file, or one with no frontmatter, gives an empty object value. Memoized, as
   * {@link FileValue.getBacklinks} is.
   */
  public getProps(): ObjectValue {
    if (this.cachedProps) {
      return this.cachedProps;
    }
    const frontMatter = this.app.metadataCache.getFileCache(this.file)?.frontmatter ?? {};
    this.cachedProps = createFrontMatterObjectValue(this.app, this.file, frontMatter);
    return this.cachedProps;
  }

  /**
   * Gets the file's tags.
   *
   * @returns A {@link TagsListValue} — declared `ListValue` because that is what `obsidian.d.ts` declares,
   * and Obsidian answers the same subclass here — holding the file's body tags followed by its frontmatter
   * tags, each `#`-prefixed and duplicates dropped. An unindexed file gives an empty list. Memoized, as
   * {@link FileValue.getBacklinks} is.
   */
  public getTags(): ListValue {
    if (this.cachedTags) {
      return this.cachedTags;
    }
    const cache = this.app.metadataCache.getFileCache(this.file);
    const bodyTags = (cache?.tags ?? []).map((tag) => tag.tag);
    const frontMatterTags = parseFrontMatterTags(cache?.frontmatter ?? null) ?? [];
    const tags = [...new Set([...bodyTags, ...frontMatterTags])];
    this.cachedTags = TagsListValue.create2__(tags);
    return this.cachedTags;
  }

  /**
   * Tells whether the value counts as true in a Bases formula.
   *
   * @returns Always `true`: a file value is never empty.
   */
  public isTruthy(): boolean {
    return true;
  }

  /**
   * Lists the property keys {@link FileValue.objectAccess} answers for.
   *
   * @returns The inherited keys followed by Obsidian's fifteen file keys, every one of which
   * {@link FileValue.objectAccess} answers.
   */
  public override keys(): string[] {
    return [
      ...super.keys(),
      'file',
      'name',
      'basename',
      'fullname',
      'path',
      'folder',
      'ext',
      'ctime',
      'mtime',
      'size',
      'links',
      'embeds',
      'backlinks',
      'tags',
      'properties'
    ];
  }

  /**
   * Loosely compares this file with a value of any type, as Obsidian does: against a `StringValue` holding
   * this file's path.
   *
   * Nothing else loosely equals a file from THIS side - not another `FileValue`, which is why two values
   * wrapping different `TFile`s of one path stay unequal. A `LinkValue` resolving here does match, but
   * through its own override, which {@link Value.looseEquals} reaches by trying both directions.
   *
   * @param other - The value to compare with.
   * @returns Whether `other` is a `StringValue` holding this file's full path.
   */
  public override looseEquals(other: Value): boolean {
    return other instanceof StringValue && this.file.path === other.data;
  }

  /**
   * Reads a named property of the wrapped file.
   *
   * @param key - The property key, matched without regard to case.
   * @returns This value itself for `file`; the file's display name, basename, full name, path, folder path
   * or extension as a `StringValue`; its creation or modification time as a `DateValue`; its size as a
   * `NumberValue`; the lists {@link FileValue.getLinks}, {@link FileValue.getEmbeds},
   * {@link FileValue.getBacklinks} and {@link FileValue.getTags} build for `links`, `embeds`, `backlinks`
   * and `tags`; the object {@link FileValue.getProps} builds for `properties`; and otherwise whatever the
   * base answers.
   * @throws {Error} For `folder` when the file has no parent folder, where Obsidian reads it unguarded.
   */
  public override objectAccess(key: string): null | Value {
    switch (key.toLowerCase()) {
      case 'backlinks': {
        return this.getBacklinks();
      }
      case 'basename': {
        return StringValue.create__(this.file.basename);
      }
      case 'ctime': {
        return DateValue.create__(new Date(this.file.stat.ctime));
      }
      case 'embeds': {
        return this.getEmbeds();
      }
      case 'ext': {
        return StringValue.create__(this.file.extension);
      }
      case 'file': {
        return this;
      }
      case 'folder': {
        return StringValue.create__(ensureNonNullable(this.file.parent, 'The file has no parent folder.').path);
      }
      case 'fullname': {
        return StringValue.create__(this.file.name);
      }
      case 'links': {
        return this.getLinks();
      }
      case 'mtime': {
        return DateValue.create__(new Date(this.file.stat.mtime));
      }
      case 'name': {
        return StringValue.create__(this.file.getShortName());
      }
      case 'path': {
        return StringValue.create__(this.file.path);
      }
      case 'properties': {
        return this.getProps();
      }
      case 'size': {
        return NumberValue.create__(this.file.stat.size);
      }
      case 'tags': {
        return this.getTags();
      }
      default: {
        return super.objectAccess(key);
      }
    }
  }

  /**
   * Renders the value as a string.
   *
   * @returns The wrapped file's vault path.
   */
  public toString(): string {
    return this.file.path;
  }
}

/**
 * The display name Obsidian gives a backlink, computed from a PATH rather than from a `TFile` because the
 * link graph holds nothing else. It is `TFile.getShortName` spelled over a string: the name after the last
 * `/`, with a `.md` extension dropped and any other extension kept.
 *
 * @param path - The vault path of the note the backlink comes from.
 * @returns Its short name.
 */
function getShortName(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dotIndex = name.lastIndexOf('.');
  const hasExtension = dotIndex > 0 && dotIndex < name.length - 1;
  return hasExtension && name.slice(dotIndex + 1).toLowerCase() === MD_EXTENSION ? name.slice(0, dotIndex) : name;
}
