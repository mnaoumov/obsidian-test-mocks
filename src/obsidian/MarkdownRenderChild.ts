import type { MarkdownRenderChild as MarkdownRenderChildOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class MarkdownRenderChild extends Component {
  public containerEl: HTMLElement;

  public constructor(containerEl: HTMLElement) {
    super();
    this.containerEl = containerEl;
    const self = strictMock(this);
    self.constructor2__(containerEl);
    return self;
  }

  public static create2__(containerEl: HTMLElement): MarkdownRenderChild {
    return new MarkdownRenderChild(containerEl);
  }

  public static fromOriginalType2__(value: MarkdownRenderChildOriginal): MarkdownRenderChild {
    return createMockOfUnsafe<MarkdownRenderChild>(value);
  }

  public asOriginalType2__(): MarkdownRenderChildOriginal {
    return createMockOfUnsafe<MarkdownRenderChildOriginal>(this);
  }

  public constructor2__(_containerEl: HTMLElement): void {
    noop();
  }
}
