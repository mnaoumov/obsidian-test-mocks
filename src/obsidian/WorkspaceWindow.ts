import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceWindow {
  protected constructor() {
    WorkspaceWindow.__constructor(this);
    return strictMock(this);
  }

  public static __create(): WorkspaceWindow {
    return Reflect.construct(WorkspaceWindow, []) as WorkspaceWindow;
  }

  public static __constructor(_instance: WorkspaceWindow, ..._args: unknown[]): void {
    // Spy hook.
  }

  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }
}
