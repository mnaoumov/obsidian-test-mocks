import type { QueryController as QueryControllerOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { Component } from './Component.ts';

export class QueryController extends Component {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asOriginalType__(): QueryControllerOriginal {
    return castTo<QueryControllerOriginal>(this);
  }
}
