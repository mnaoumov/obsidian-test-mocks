import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import { castTo } from '../internal/Cast.ts';
import { strictMock } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class MarkdownRenderChild extends Component {
  public containerEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
    return strictMock(this);
  }

  public override asOriginalType__(): MarkdownRenderChildOriginal {
    return castTo<MarkdownRenderChildOriginal>(this);
  }
}
