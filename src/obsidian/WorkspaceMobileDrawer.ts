/**
 * @file
 *
 * Mock of Obsidian's `WorkspaceMobileDrawer`, the collapsible side drawer of the mobile app.
 */

import type { WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

/**
 * Mock of Obsidian's `WorkspaceMobileDrawer`. Nothing slides on screen: expanding and collapsing only update
 * {@link WorkspaceMobileDrawer.collapsed}.
 */
export class WorkspaceMobileDrawer extends WorkspaceParent {
  /**
   * Whether the drawer may keep a single child; always `true`, as in Obsidian.
   */
  public override allowSingleChild = true;

  /**
   * Whether the drawer is collapsed. Starts `false` in the mock.
   */
  public collapsed = false;

  /**
   * Creates a drawer. Obsidian does not construct it publicly; use {@link WorkspaceMobileDrawer.create2__}.
   */
  protected constructor() {
    super();
    const self = strictProxy(this);
    self.constructor4__();
    return self;
  }

  /**
   * Mock-only factory: creates a drawer, spyable via `vi.spyOn(WorkspaceMobileDrawer, 'create2__')`. The numbered
   * subclass variant of `create__`.
   *
   * @returns The new drawer.
   */
  public static create2__(): WorkspaceMobileDrawer {
    return new WorkspaceMobileDrawer();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `WorkspaceMobileDrawer` as this mock. The numbered subclass
   * variant of `fromOriginalType__`.
   *
   * @param value - The value typed as the original `WorkspaceMobileDrawer`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: WorkspaceMobileDrawerOriginal): WorkspaceMobileDrawer {
    return strictProxy(value, WorkspaceMobileDrawer);
  }

  /**
   * Mock-only: views this mock as Obsidian's `WorkspaceMobileDrawer` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `WorkspaceMobileDrawer`.
   */
  public asOriginalType4__(): WorkspaceMobileDrawerOriginal {
    return strictProxy<WorkspaceMobileDrawerOriginal>(this);
  }

  /**
   * Collapses the drawer. The mock sets {@link WorkspaceMobileDrawer.collapsed} to `true`.
   */
  public collapse(): void {
    this.collapsed = true;
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(WorkspaceMobileDrawer.prototype, 'constructor4__')`.
   */
  public constructor4__(): void {
    noop();
  }

  /**
   * Expands the drawer. The mock sets {@link WorkspaceMobileDrawer.collapsed} to `false`.
   */
  public expand(): void {
    this.collapsed = false;
  }

  /**
   * Flips the drawer between collapsed and expanded.
   */
  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
