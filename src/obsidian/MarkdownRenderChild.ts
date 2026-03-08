import type { MarkdownRenderChild as RealMarkdownRenderChild } from 'obsidian';

import {
  strictCastTo,
  strictMock
} from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class MarkdownRenderChild extends Component {
  public containerEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
    const mock = strictMock(this);
    MarkdownRenderChild.constructor__(mock, containerEl);
    return mock;
  }

  public static override constructor__(_instance: MarkdownRenderChild, _containerEl: HTMLElement): void {
    // Spy hook.
  }

  public override asReal__(): RealMarkdownRenderChild {
    return strictCastTo<RealMarkdownRenderChild>(this);
  }
}
