import { strictMock } from '../internal/StrictMock.ts';

export class WorkspaceWindow {
  protected constructor() {
    const mock = strictMock(this);
    WorkspaceWindow.constructor__(mock);
    return mock;
  }

  public static create__(): WorkspaceWindow {
    return new WorkspaceWindow();
  }

  public static constructor__(_instance: WorkspaceWindow, ..._args: unknown[]): void {
    // Spy hook.
  }

  public get doc(): Document {
    return document;
  }

  public get win(): Window {
    return window;
  }
}
