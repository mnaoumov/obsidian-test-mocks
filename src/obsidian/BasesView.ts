import type { BasesView as BasesViewOriginal } from 'obsidian';

import type { QueryController } from './QueryController.ts';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public constructor(controller: QueryController) {
    super();
    const self = strictMock(this);
    self.constructor2__(controller);
    return self;
  }

  public static fromOriginalType2__(value: BasesViewOriginal): BasesView {
    return createMockOfUnsafe<BasesView>(value);
  }

  public asOriginalType2__(): BasesViewOriginal {
    return createMockOfUnsafe<BasesViewOriginal>(this);
  }

  public constructor2__(_controller: QueryController): void {
    noop();
  }
}
