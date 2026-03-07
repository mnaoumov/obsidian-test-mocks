import { strictMock } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class MarkdownRenderChild extends Component {
  public containerEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
    const mock = strictMock(this);
    MarkdownRenderChild.__constructor(mock, containerEl);
    return mock;
  }

  public static override __constructor(_instance: MarkdownRenderChild, _containerEl: HTMLElement): void {
    // Spy hook.
  }
}
