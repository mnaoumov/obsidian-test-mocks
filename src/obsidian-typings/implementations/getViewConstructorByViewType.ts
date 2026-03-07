import type { App } from 'obsidian';
import type {
  ViewTypeType,
  ViewTypeViewConstructorMapping
} from 'obsidian-typings';

export function getViewConstructorByViewType<TViewType extends ViewTypeType>(_app: App, _viewType: TViewType): ViewTypeViewConstructorMapping[TViewType] {
  throw new Error('getViewConstructorByViewType is not supported in test mocks');
}
