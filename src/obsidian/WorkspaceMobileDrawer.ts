import type { WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceMobileDrawer extends WorkspaceParent {
  public collapsed = false;

  protected constructor() {
    super();
    const mock = strictMock(this);
    WorkspaceMobileDrawer.constructor__(mock);
    return mock;
  }

  public static override constructor__(_instance: WorkspaceMobileDrawer, ..._args: unknown[]): void {
    // Spy hook.
  }

  public static create__(): WorkspaceMobileDrawer {
    return new WorkspaceMobileDrawer();
  }

  public override asOriginalType__(): WorkspaceMobileDrawerOriginal {
    return castTo<WorkspaceMobileDrawerOriginal>(this);
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
