import type { WorkspaceMobileDrawer as WorkspaceMobileDrawerOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceMobileDrawer extends WorkspaceParent {
  public collapsed = false;

  protected constructor() {
    super();
    const self = strictMock(this);
    self.constructor4__();
    return self;
  }

  public static create2__(): WorkspaceMobileDrawer {
    return new WorkspaceMobileDrawer();
  }

  public static override fromOriginalType__(value: WorkspaceMobileDrawerOriginal): WorkspaceMobileDrawer {
    return castTo<WorkspaceMobileDrawer>(value);
  }

  public override asOriginalType__(): WorkspaceMobileDrawerOriginal {
    return castTo<WorkspaceMobileDrawerOriginal>(this);
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
