import type { WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceMobileDrawer extends WorkspaceParent {
  public collapsed = false;

  protected constructor() {
    super();
    const self = strictProxy(this);
    self.constructor4__();
    return self;
  }

  public static create2__(): WorkspaceMobileDrawer {
    return new WorkspaceMobileDrawer();
  }

  public static fromOriginalType4__(value: WorkspaceMobileDrawerOriginal): WorkspaceMobileDrawer {
    return strictProxy(value, WorkspaceMobileDrawer);
  }

  public asOriginalType4__(): WorkspaceMobileDrawerOriginal {
    return strictProxy<WorkspaceMobileDrawerOriginal>(this);
  }

  public collapse(): void {
    this.collapsed = true;
  }

  public constructor4__(): void {
    noop();
  }

  public expand(): void {
    this.collapsed = false;
  }

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
