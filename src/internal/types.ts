import type { Events } from 'obsidian';

export interface AjaxOptions {
  readonly data?: ArrayBuffer | object | string;
  readonly error?: (error: unknown, req: XMLHttpRequest) => unknown;
  readonly headers?: Record<string, string>;
  readonly method?: 'GET' | 'POST';
  readonly req?: XMLHttpRequest;
  readonly success?: (response: unknown, req: XMLHttpRequest) => unknown;
  readonly url: string;
  readonly withCredentials?: boolean;
}

export interface CoordsLeftTop {
  left: number;
  top: number;
}

export interface EnsureSideLeafOptions {
  readonly active?: boolean;
  readonly reveal?: boolean;
  readonly split?: boolean;
  readonly state?: unknown;
}

export interface EventsEntry {
  ctx: unknown;
  e: Events;
  fn(...data: unknown[]): unknown;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- Matches obsidian.d.ts return type pattern.
export type MaybeReturn<T> = T | void;

export interface ObsidianGlobal {
  activeDocument: Document | undefined;
  activeWindow: typeof globalThis | Window;
  nextFrame: (callback: () => void) => void;
  sleep: (ms: number) => Promise<void>;
}

export interface ParsedLinktext {
  path: string;
  subpath: string;
}

export interface SetActiveLeafParams {
  readonly focus?: boolean;
}

export interface SvgElementInfo {
  attr?: Record<string, boolean | null | number | string>;
  cls?: string | string[];
  parent?: Node;
  prepend?: boolean;
}
