import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceWindow {
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceWindow.__constructor(mock);
    return mock;
  }

  public static __create(): WorkspaceWindow {
    return Reflect.construct(WorkspaceWindow as unknown as new () => WorkspaceWindow, []) as WorkspaceWindow;
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
