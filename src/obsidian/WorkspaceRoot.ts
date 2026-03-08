import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRoot {
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceRoot.constructor__(mock);
    return mock;
  }

  public static create__(): WorkspaceRoot {
    return new WorkspaceRoot();
  }

  public static constructor__(_instance: WorkspaceRoot, ..._args: unknown[]): void {
    // Spy hook.
  }

  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }
}
