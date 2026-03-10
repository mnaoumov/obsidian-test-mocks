import type { QueryController as QueryControllerOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class QueryController extends Component {
  public constructor() {
    super();
    const self = strictMock(this);
    self.constructor2__();
    return self;
  }

  public static override create__(): QueryController {
    return new QueryController();
  }

  public override asOriginalType__(): QueryControllerOriginal {
    return castTo<QueryControllerOriginal>(this);
  }

  public constructor2__(): void {
    noop();
  }
}
