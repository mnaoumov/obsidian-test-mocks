import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceRoot {
  protected constructor() {
    WorkspaceRoot.__constructor(this);
    return strictMock(this);
  }

  public static __create(): WorkspaceRoot {
    return Reflect.construct(WorkspaceRoot, []) as WorkspaceRoot;
  }

  public static __constructor(_instance: WorkspaceRoot, ..._args: unknown[]): void {
    // Spy hook.
  }

  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }
}
