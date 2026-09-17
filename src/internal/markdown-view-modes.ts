/**
 * @file
 *
 * The modes a `MarkdownView` registers, as `obsidian-typings` declares them. They live here rather than beside
 * the mocks because `MarkdownViewModes` has no `obsidian.d.ts` counterpart, and L1 keeps such a type out of the
 * package's public surface.
 */

import type { MarkdownEditView } from '../obsidian/MarkdownEditView.ts';
import type { MarkdownPreviewView } from '../obsidian/MarkdownPreviewView.ts';

/**
 * A mode a `MarkdownView` can be showing: its edit mode or its reading mode.
 */
export type MarkdownViewMode = MarkdownEditView | MarkdownPreviewView;

/**
 * The modes a `MarkdownView` has registered, keyed by each mode's `type`.
 */
export interface MarkdownViewModes {
  preview: MarkdownPreviewView;
  source: MarkdownEditView;
}
