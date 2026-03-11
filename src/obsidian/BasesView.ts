import type { BasesView as BasesViewOriginal } from 'obsidian';

import type { QueryController } from './QueryController.ts';

import { castTo } from '../internal/cast.ts';
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

  public override asOriginalType__(): BasesViewOriginal {
    return castTo<BasesViewOriginal>(this);
  }

  public constructor2__(_controller: QueryController): void {
    noop();
  }
}
