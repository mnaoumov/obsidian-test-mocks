/**
 * @file
 *
 * Shared type declarations for shapes Obsidian declares inline or only in `obsidian-typings`.
 */

import type {
  Events,
  ViewStateResult as ViewStateResultOriginal
} from 'obsidian';

/**
 * Every file and folder path in an in-memory filesystem, as `InMemoryAdapter.listAll__` returns them.
 */
export interface AdapterListing {
  files: string[];
  folders: string[];
}

/* eslint-disable @typescript-eslint/method-signature-style -- A method shorthand cannot carry `readonly`, which `obsidian-dev-utils/readonly-params-options-result-members` requires on every member of an options bag. The two rules are unsatisfiable together here, and the readonly guarantee is the more valuable one. */
/**
 * The request options of Obsidian's global `ajax` and `ajaxPromise` helpers: URL, method, body, headers,
 * credentials mode, an optional existing request object, and the success and error callbacks.
 */
export interface AjaxOptions {
  readonly data?: ArrayBuffer | object | string;
  readonly error?: (error: unknown, request: XMLHttpRequest) => unknown;
  readonly headers?: Record<string, string>;
  readonly method?: 'GET' | 'POST';
  // eslint-disable-next-line unicorn/name-replacements -- `req` is Obsidian's own spelling; the mock has to answer to the name callers actually use.
  readonly req?: XMLHttpRequest;
  readonly success?: (response: unknown, request: XMLHttpRequest) => unknown;
  readonly url: string;
  readonly withCredentials?: boolean;
}
/* eslint-enable @typescript-eslint/method-signature-style -- Restores the rule for the rest of the file. */

/**
 * A scroll position, as `Editor.getScrollInfo` returns it.
 */
export interface CoordsLeftTop {
  left: number;
  top: number;
}

/**
 * A delegated listener registration, as Obsidian keeps it in an element's or document's `_EVENTS` record: the
 * selector and listener it was registered with, its options, and the wrapper actually added with
 * `addEventListener`.
 */
export interface EventListenerInfo {
  callback: EventListener;
  listener: unknown;
  options?: AddEventListenerOptions | boolean | undefined;
  selector: string;
}

/* eslint-disable unicorn/name-replacements -- `ctx` / `e` / `fn` are the member names on Obsidian's own `EventRef`, which `offref` and every consumer read by name. */
/**
 * A registered event handler as Obsidian stores it in `Events._`, and the shape of the `EventRef` returned for it:
 * the owning `Events`, the event name, the callback and its `this` context.
 */
export interface EventsEntry {
  ctx: unknown;
  e: Events;
  fn(...data: unknown[]): unknown;
  name: string;
  /* eslint-enable unicorn/name-replacements -- Restores the rule after the `EventRef` shape. */
}

/**
 * The per-file record `MetadataCache.fileCache` keeps: the content hash its metadata is stored under, and the
 * file's modification time and size when it was indexed.
 */
export interface FileCacheEntry {
  hash: string;
  mtime: number;
  size: number;
}

/**
 * A return type that may be `T` or nothing, as `obsidian.d.ts` writes `T | void` for callbacks.
 *
 * @typeParam T - The type returned when something is returned.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- Matches obsidian.d.ts return type pattern.
export type MaybeReturn<T> = T | void;

/**
 * The parts of a wikilink's link text, as `parseLinktext` returns them: the file path and the subpath, which is a
 * heading or block reference.
 */
export interface ParsedLinktext {
  path: string;
  subpath: string;
}

/**
 * The options Obsidian's `createSvg` helpers accept: classes, attributes, a parent to insert into, and whether to
 * prepend there.
 */
export interface SvgElementInfo {
  attr?: Record<string, boolean | null | number | string>;
  cls?: string | string[];
  parent?: Node;
  prepend?: boolean;
}

/**
 * The whole of the result object Obsidian passes to `View.setState`, which the view fills in to tell the leaf what
 * the state change implies.
 *
 * `obsidian.d.ts` declares only `history`; Obsidian's own `setViewState` reads three more off the same object, so
 * they are inlined here per L3 rather than claimed as mock-only members.
 *
 * `obsidian-typings` declares all three as well, in the same shapes, but that does not retire this interface: L3
 * keeps the package out of `src/`, which therefore type-checks against `obsidian.d.ts` alone.
 */
export interface ViewStateResultInternal extends ViewStateResultOriginal {
  /**
   * Set by a view that cannot show what it was given — a file view with no file — to make the leaf go back to its
   * empty view.
   */
  close?: boolean;
  /**
   * A callback the leaf runs once the state change has settled.
   */
  done?(): void;
  /**
   * Set by a view whose state change alters the layout, which makes the leaf ask the workspace to update it.
   */
  layout?: boolean;
}

/**
 * The options of `Workspace.ensureSideLeaf`: whether to activate, split and reveal the leaf, and the view state to
 * set on it.
 */
export interface WorkspaceEnsureSideLeafOptions {
  readonly active?: boolean;
  readonly reveal?: boolean;
  readonly split?: boolean;
  readonly state?: unknown;
}

/**
 * The options of `Workspace.setActiveLeaf`: whether to focus the leaf.
 */
export interface WorkspaceSetActiveLeafOptions {
  readonly focus?: boolean;
}
