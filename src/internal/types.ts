import type { Events } from 'obsidian';

export interface AdapterListing {
  files: string[];
  folders: string[];
}

/* eslint-disable @typescript-eslint/method-signature-style -- A method shorthand cannot carry `readonly`, which `obsidian-dev-utils/readonly-params-options-result-members` requires on every member of an options bag. The two rules are unsatisfiable together here, and the readonly guarantee is the more valuable one. */
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

export interface CoordsLeftTop {
  left: number;
  top: number;
}

/* eslint-disable unicorn/name-replacements -- `ctx` / `e` / `fn` are the member names on Obsidian's own `EventRef`, which `offref` and every consumer read by name. */
export interface EventsEntry {
  ctx: unknown;
  e: Events;
  fn(...data: unknown[]): unknown;
  name: string;
  /* eslint-enable unicorn/name-replacements -- Restores the rule after the `EventRef` shape. */
}

export interface FileCacheEntry {
  hash: string;
  mtime: number;
  size: number;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- Matches obsidian.d.ts return type pattern.
export type MaybeReturn<T> = T | void;

export interface ObsidianGlobal {
  activeDocument: Document | undefined;
  activeWindow: typeof globalThis | Window;
  nextFrame(callback: () => void): void;
  sleep(ms: number): Promise<void>;
}

export interface ParsedLinktext {
  path: string;
  subpath: string;
}

export interface SvgElementInfo {
  attr?: Record<string, boolean | null | number | string>;
  cls?: string | string[];
  parent?: Node;
  prepend?: boolean;
}

export interface WorkspaceEnsureSideLeafOptions {
  readonly active?: boolean;
  readonly reveal?: boolean;
  readonly split?: boolean;
  readonly state?: unknown;
}

export interface WorkspaceSetActiveLeafOptions {
  readonly focus?: boolean;
}
