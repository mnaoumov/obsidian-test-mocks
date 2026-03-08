import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceSidedock {
  public collapsed = false;

  protected constructor() {
    const mock = strictMock(this);
    WorkspaceSidedock.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: WorkspaceSidedock): void {
    // Spy hook.
  }

  public static create__(_workspace?: unknown, _direction?: string, _side?: string, _id?: string): WorkspaceSidedock {
    return new WorkspaceSidedock();
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
