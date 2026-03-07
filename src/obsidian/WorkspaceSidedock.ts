import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceSidedock {
  public collapsed = false;

  protected constructor() {
    WorkspaceSidedock.__constructor(this);
    return strictMock(this);
  }

  public static __create(): WorkspaceSidedock {
    return Reflect.construct(WorkspaceSidedock as unknown as new () => WorkspaceSidedock, []) as WorkspaceSidedock;
  }

  public static __constructor(_instance: WorkspaceSidedock, ..._args: unknown[]): void {
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
