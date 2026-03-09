import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class MarkdownRenderChild extends Component {
  public containerEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
  }

  public static create2__(containerEl: HTMLElement): MarkdownRenderChild {
    return strictMock(new MarkdownRenderChild(containerEl));
  }

  public override asOriginalType__(): MarkdownRenderChildOriginal {
    return castTo<MarkdownRenderChildOriginal>(this);
  }
}
