import type { WorkspaceMobileDrawer as RealWorkspaceMobileDrawer } from 'obsidian';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceMobileDrawer extends WorkspaceParent {
  public collapsed = false;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceMobileDrawer.constructor__(mock);
    return mock;
  }

  public static create__(): WorkspaceMobileDrawer {
    return new WorkspaceMobileDrawer();
  }

  public static override constructor__(_instance: WorkspaceMobileDrawer, ..._args: unknown[]): void {
    // Spy hook.
  }

  public override asReal__(): RealWorkspaceMobileDrawer {
    return strictCastTo<RealWorkspaceMobileDrawer>(this);
  }

  public collapse(): void {
    this.collapsed = true;
  }

  public expand(): void {
    this.collapsed = false;
  }

  public toggle(): void {
    this.collapsed = !this.collapsed;
  }
}
