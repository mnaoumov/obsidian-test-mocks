import type { BasesView as BasesViewOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export abstract class BasesView extends Component {
  public constructor() {
    super();
    noop();
    const self = strictMock(this);
    self.constructor2__();
    return self;
  }

  public override asOriginalType__(): BasesViewOriginal {
    return castTo<BasesViewOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }
}
