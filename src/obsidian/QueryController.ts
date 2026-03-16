import type { QueryController as QueryControllerOriginal } from 'obsidian';

import type { App } from './App.ts';
import type { TFile } from './TFile.ts';

import { noop } from '../internal/noop.ts';
import {
  bridgeType,
  strictProxy
} from '../internal/strict-proxy.ts';
import { Component } from './Component.ts';

export class QueryController extends Component {
  public constructor(app: App, plugin: unknown, viewHeaderEl: HTMLElement, currentFile?: null | TFile) {
    super();
    const self = strictProxy(this);
    self.constructor2__(app, plugin, viewHeaderEl, currentFile);
    return self;
  }

  public static create2__(app: App, plugin: unknown, viewHeaderEl: HTMLElement, currentFile?: null | TFile): QueryController {
    return new QueryController(app, plugin, viewHeaderEl, currentFile);
  }

  public static fromOriginalType2__(value: QueryControllerOriginal): QueryController {
    return bridgeType<QueryController>(value);
  }

  public asOriginalType2__(): QueryControllerOriginal {
    return bridgeType<QueryControllerOriginal>(this);
  }

  public constructor2__(_app: App, _plugin: unknown, _viewHeaderEl: HTMLElement, _currentFile?: null | TFile): void {
    noop();
  }
}
