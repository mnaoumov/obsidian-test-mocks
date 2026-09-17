/**
 * @file
 *
 * Bookkeeping the workspace layout tree needs across its classes without importing them into each other.
 *
 * `WorkspaceItem` walks up through `parent` for `getRoot()` and `getContainer()`, which means it has to tell a real
 * parent from the placeholder an unattached item starts with, and a `WorkspaceContainer` from any other item. Both
 * classes sit below `WorkspaceItem` in the inheritance chain, so an `instanceof` would be an import cycle that fails
 * at module evaluation. Registering them here instead keeps the check in one place.
 *
 * The view type a leaf showing nothing reports lives here for the same reason: `WorkspaceLeaf` answers with it and
 * `Workspace` compares against it, and neither may import the other.
 */

import {
  bypassStrictProxy,
  strictProxy
} from './strict-proxy.ts';

/**
 * The view type Obsidian reports for a leaf showing its empty view — the "New tab" page. A mock leaf holds `null`
 * where Obsidian holds `WorkspaceLeaf._empty`, so this is what such a leaf's view type reads as.
 */
export const EMPTY_VIEW_TYPE = 'empty';

const containers = new WeakSet();
const parentPlaceholders = new WeakSet();

/**
 * Creates the parent an unattached workspace item starts with: an empty strict proxy, which throws on any member
 * access, and which {@link isParentPlaceholder} recognizes.
 *
 * @typeParam T - The parent type the placeholder stands in for.
 * @returns The placeholder.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T provides return type inference at call sites.
export function createParentPlaceholder<T>(): T {
  const placeholder = strictProxy<T>({});
  parentPlaceholders.add(bypassStrictProxy(placeholder as object));
  return placeholder;
}

/**
 * Checks whether a workspace item was registered as a container by {@link markContainer}.
 *
 * @param item - The item to check.
 * @returns Whether the item is a `WorkspaceContainer`.
 */
export function isContainer(item: object): boolean {
  return containers.has(bypassStrictProxy(item));
}

/**
 * Checks whether a parent is the placeholder created by {@link createParentPlaceholder}, meaning the item has no
 * parent.
 *
 * @param parent - The parent to check.
 * @returns Whether the parent is a placeholder.
 */
export function isParentPlaceholder(parent: object): boolean {
  return parentPlaceholders.has(bypassStrictProxy(parent));
}

/**
 * Registers a workspace item as a `WorkspaceContainer`, for {@link isContainer}.
 *
 * @param item - The container.
 */
export function markContainer(item: object): void {
  containers.add(bypassStrictProxy(item));
}
