import { WorkspaceParent } from './WorkspaceParent.ts';

export class WorkspaceMobileDrawer extends WorkspaceParent {
  public collapsed = false;

  protected constructor() {
    super();
    WorkspaceMobileDrawer.__constructor(this);
  }

  public static __create(): WorkspaceMobileDrawer {
    return Reflect.construct(WorkspaceMobileDrawer, []) as WorkspaceMobileDrawer;
  }

  public static override __constructor(_instance: WorkspaceMobileDrawer, ..._args: unknown[]): void {
    // Spy hook.
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
