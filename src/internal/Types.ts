import type { Events } from 'obsidian';

export interface CoordsLeftTop {
  left: number;
  top: number;
}

export interface EnsureSideLeafOptions {
  active?: boolean;
  reveal?: boolean;
  split?: boolean;
  state?: unknown;
}

export interface EventsEntry {
  ctx: unknown;
  e: Events;
  fn(...data: unknown[]): unknown;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
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
  focus?: boolean;
}
