import type { QueryController as RealQueryController } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { Component } from './Component.ts';

export class QueryController extends Component {
  // Intentionally empty, obsidian.d.ts doesn't have any members to mock.

  public override asReal__(): RealQueryController {
    return strictCastTo<RealQueryController>(this);
  }
}
