/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceSidedock`, the collapsible left or right sidebar split.
 */

import type {
  SplitDirection as SplitDirectionOriginal,
  WorkspaceSidedock as WorkspaceSidedockOriginal
} from 'obsidian';

import type { SerializedWorkspaceItem } from '../internal/types.ts';
import type { Workspace } from './Workspace.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceSplit } from './WorkspaceSplit.ts';

// Obsidian's starting width for a sidedock, in pixels.
const DEFAULT_SIDEDOCK_SIZE = 300;

/**
 * Mock of Obsidian's `WorkspaceSidedock`. Nothing is resized on screen: expanding and collapsing only update
 * {@link WorkspaceSidedock.collapsed}.
 */
export class WorkspaceSidedock extends WorkspaceSplit {
  /**
   * Whether the sidebar is collapsed. Starts `false` in the mock.
   */
  public collapsed = false;

  /**
   * Which side the sidedock is on, `left` or `right`, as given at construction.
   */
  public side: string;

  /**
   * The sidedock's width in pixels; Obsidian starts every sidedock at 300. The mock renders nothing, so it only keeps
   * the value, which {@link WorkspaceSidedock.serialize} records as `width`.
   */
  public size = DEFAULT_SIDEDOCK_SIZE;

  /**
   * Creates a sidebar split. Obsidian does not construct it publicly; use {@link WorkspaceSidedock.create3__}.
   *
   * @param workspace - The workspace the sidebar belongs to.
   * @param direction - The split direction.
   * @param side - The side of the window the sidebar is on.
   * @param id - The item id.
   */
  protected constructor(workspace: Workspace, direction: SplitDirectionOriginal, side: string, id?: string) {
    super(workspace, direction, id);
    this.side = side;
    const self = strictProxy(this);
    self.constructor5__(workspace, direction, side, id);
    return self;
  }

  /**
   * Mock-only factory: creates a sidebar split, spyable via `vi.spyOn(WorkspaceSidedock, 'create3__')`. The
   * numbered subclass variant of `create__`.
   *
   * @param workspace - The workspace the sidebar belongs to.
   * @param direction - The split direction.
   * @param side - The side of the window the sidebar is on.
   * @param id - The item id.
   * @returns The new sidebar split.
   */
  public static create3__(workspace: Workspace, direction: SplitDirectionOriginal, side: string, id?: string): WorkspaceSidedock {
    return new WorkspaceSidedock(workspace, direction, side, id);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceSidedock` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceSidedock`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType5__(value: WorkspaceSidedockOriginal): WorkspaceSidedock {
    return strictProxy(value, WorkspaceSidedock);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceSidedock` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceSidedock`.
   */
  public asOriginalType5__(): WorkspaceSidedockOriginal {
    return strictProxy<WorkspaceSidedockOriginal>(this);
  }

  /**
   * Collapses the sidebar. The mock sets {@link WorkspaceSidedock.collapsed} to `true`.
   */
  public collapse(): void {
    this.collapsed = true;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceSidedock.prototype, 'constructor5__')`.
   *
   * @param _workspace - The workspace the sidebar was created with.
   * @param _direction - The split direction the sidebar was created with.
   * @param _side - The side the sidebar was created with.
   * @param _id - The item id the sidebar was created with.
   */
  public constructor5__(_workspace: Workspace, _direction: SplitDirectionOriginal, _side: string, _id?: string): void {
    noop();
  }

  /**
   * Expands the sidebar. The mock sets {@link WorkspaceSidedock.collapsed} to `false`.
   */
  public expand(): void {
    this.collapsed = false;
  }

  /**
   * Serializes the sidedock, as Obsidian does: the split's keys, its width, and `collapsed` when it is collapsed.
   *
   * @returns The serialized sidedock.
   */
  public override serialize(): SerializedWorkspaceItem {
    return {
      ...super.serialize(),
      width: this.size,
      ...this.collapsed && { collapsed: true }
    };
  }

  /**
   * Sets the sidedock's width. Obsidian also writes it to the element's style; the mock only keeps the value.
   *
   * @param size - The width in pixels.
   */
  public setSize(size: number): void {
    this.size = size;
  }

  /**
   * Flips the sidebar between collapsed and expanded.
   */
  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
