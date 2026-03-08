import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRoot {
  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }

  protected constructor() {
    const mock = strictMock(this);
    WorkspaceRoot.constructor__(mock);
    return mock;
  }

  public static constructor__(_instance: WorkspaceRoot): void {
    // Spy hook.
  }

  public static create__(_workspace?: unknown, _direction?: string, _id?: string): WorkspaceRoot {
    return new WorkspaceRoot();
  }
}
