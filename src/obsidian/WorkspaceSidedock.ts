import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceSidedock {
  public collapsed = false;

  protected constructor() {
    const mock = strictMock(this);
    WorkspaceSidedock.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceSidedock {
    return new WorkspaceSidedock();
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
