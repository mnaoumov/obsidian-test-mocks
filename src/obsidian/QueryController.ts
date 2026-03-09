import type { QueryController as QueryControllerOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { Component } from './Component.ts';

export class QueryController extends Component {
  public static override create__(): QueryController {
    return strictMock(new QueryController());
  }

  public override asOriginalType__(): QueryControllerOriginal {
    return castTo<QueryControllerOriginal>(this);
  }
}
