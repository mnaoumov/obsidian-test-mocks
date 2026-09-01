/**
 * Renders declarative setting definitions the way Obsidian 1.13 does.
 *
 * Mirrors the shipped renderer (Obsidian 1.13.x `app.js`), function for function:
 *
 * - `evaluatePredicate` — `z2`: absent yields the default, a non-function yields itself, a function is
 *   called inside a `try`/`catch` that logs and falls back to the default.
 * - `isRenderable` — `Y2`: an item with nothing to show is dropped before rendering.
 * - `renderSettingDefinitions` — `Q2`: empties the container and wraps every run of loose rows in an
 *   implicit headless group, so a row always lives inside a group.
 * - `renderGroup` / `renderRow` — `$2` / `Z2` / `n6`: the group owns a `SettingGroup`, each row a
 *   `Setting` created in the group's `listEl`.
 * - `applyDomState` — `U2` / `_2`: rows are ALWAYS rendered; `visible` toggles the rendered element and
 *   `disabled` is applied only when the definition declares it.
 *
 * Deliberately NOT modeled (a consumer that needs one of these gets a loud failure or a documented no-op,
 * never a silently wrong render):
 *
 * - `control` rows throw — neither the components nor the `getControlValue` / `setControlValue` binding
 *   is modeled.
 * - Keyed reconciliation (`Wy` diffing): every render rebuilds from scratch.
 * - Group search inputs, and the `list` add / delete / reorder affordances — a `list` renders as a group.
 * - Page navigation: a `page` renders as its own row, and its `items` render only when passed in explicitly.
 */
import type {
  SettingDefinitionGroup as SettingDefinitionGroupOriginal,
  SettingDefinitionItem as SettingDefinitionItemOriginal,
  SettingDefinitionPage as SettingDefinitionPageOriginal,
  SettingGroupItem as SettingGroupItemOriginal
} from 'obsidian';

import { Setting } from '../obsidian/Setting.ts';
import { SettingGroup } from '../obsidian/SettingGroup.ts';
import { castTo } from './castTo.ts';

export interface RenderedSettingGroup {
  children: RenderedSettingRow[];
  definition: SettingDefinitionGroupOriginal;
  groupEl: HTMLElement;
  settingGroup: SettingGroup;
}

export interface RenderedSettingRow {
  cleanup: (() => void) | null;
  definition: SettingGroupItemOriginal;
  isVisible: boolean;
  setting: Setting;
  settingEl: HTMLElement;
}

type SettingRowAction = (el: HTMLElement, index: number) => void;

interface SettingRowDisabled {
  disabled?: (() => boolean) | boolean;
}

/**
 * Re-evaluates every `visible` / `disabled` predicate and applies the result to the rendered DOM (`U2`).
 *
 * @param groups - The rendered groups.
 */
export function applyDomState(groups: RenderedSettingGroup[]): void {
  for (const group of groups) {
    let hasVisibleRow = false;
    for (const row of group.children) {
      applyRowDomState(row);
      if (row.isVisible) {
        hasVisibleRow = true;
      }
    }

    const isGroupVisible = evaluatePredicate(group.definition.visible, true)
      && (group.children.length === 0 || hasVisibleRow);
    group.groupEl.toggle(isGroupVisible);
  }
}

/**
 * Resolves a declarative predicate that may be a value, a function, or absent (`z2`).
 *
 * @param predicate - The predicate.
 * @param defaultValue - The value to use when the predicate is absent or throws.
 * @returns The resolved value.
 */
export function evaluatePredicate<T>(predicate: (() => T) | T | undefined, defaultValue: T): T {
  if (predicate === undefined) {
    return defaultValue;
  }

  if (typeof predicate !== 'function') {
    return predicate;
  }

  try {
    return castTo<() => T>(predicate)();
  } catch (error) {
    console.error(error);
    return defaultValue;
  }
}

/**
 * Renders the declarative setting definitions into the container and applies the initial DOM state,
 * exactly as Obsidian does when a settings tab is shown (`V2`).
 *
 * @param items - The setting definitions.
 * @param containerEl - The container to render into.
 * @returns The rendered groups.
 */
export function renderSettingDefinitions(items: SettingDefinitionItemOriginal[], containerEl: HTMLElement): RenderedSettingGroup[] {
  containerEl.empty();
  const groups = toGroupDefinitions(items).map((definition) => renderGroup(definition, containerEl));
  applyDomState(groups);
  return groups;
}

function applyRowDomState(row: RenderedSettingRow): void {
  row.isVisible = evaluatePredicate(row.definition.visible, true);
  row.settingEl.toggle(row.isVisible);

  const disabled = getDisabledPredicate(row.definition);
  if (disabled !== undefined) {
    row.setting.setDisabled(evaluatePredicate(disabled, false));
  }
}

function getDisabledPredicate(definition: SettingGroupItemOriginal): (() => boolean) | boolean | undefined {
  /*
   * Obsidian honors `disabled` on any definition it renders, but `obsidian.d.ts` declares it only on the
   * action and control variants, so it is read off the raw object. Obsidian also falls back to
   * `control.disabled`; that fallback belongs with `control` rows, which are not modeled here.
   */
  if (!('disabled' in definition)) {
    return undefined;
  }

  return castTo<SettingRowDisabled>(definition).disabled;
}

function isGroupDefinition(item: SettingDefinitionItemOriginal): item is SettingDefinitionGroupOriginal {
  return 'type' in item && (item.type === 'group' || item.type === 'list');
}

function isPageDefinition(item: SettingGroupItemOriginal): item is SettingDefinitionPageOriginal {
  // A page is the only member of `SettingGroupItem` that carries a `type` discriminator.
  return 'type' in item;
}

function isRenderable(item: SettingGroupItemOriginal): boolean {
  if (isPageDefinition(item)) {
    return Boolean(item.items) || Boolean(item.page);
  }

  return Boolean(item.name) || Boolean(item.render) || Boolean(item.control) || Boolean(item.action);
}

function renderGroup(definition: SettingDefinitionGroupOriginal, containerEl: HTMLElement): RenderedSettingGroup {
  const settingGroup = SettingGroup.create__(containerEl);
  if (definition.heading) {
    settingGroup.setHeading(definition.heading);
  }

  if (definition.cls) {
    settingGroup.addClass(...definition.cls.split(' ').filter(Boolean));
  }

  const children = (definition.items ?? [])
    .filter((item) => isRenderable(item))
    .map((item, index) => renderRow(item, settingGroup, index));

  return {
    children,
    definition,
    groupEl: settingGroup.groupEl,
    settingGroup
  };
}

function renderPageRow(definition: SettingDefinitionPageOriginal, setting: Setting): void {
  setting.setName(definition.name);
  setting.setDesc(definition.desc ?? '');

  const displayValue = typeof definition.displayValue === 'function' ? definition.displayValue() : definition.displayValue;
  const status = evaluatePredicate<'warning' | null>(definition.status, null);
  if (displayValue || status) {
    setting.addDisplayValue((component) => component.setValue(displayValue ?? null).setStatus(status));
  }
}

function renderRow(definition: SettingGroupItemOriginal, settingGroup: SettingGroup, index: number): RenderedSettingRow {
  const setting = Setting.create__(settingGroup.listEl);
  const row: RenderedSettingRow = {
    cleanup: null,
    definition,
    isVisible: true,
    setting,
    settingEl: setting.settingEl
  };

  if (isPageDefinition(definition)) {
    renderPageRow(definition, setting);
    return row;
  }

  setting.setName(definition.name);
  setting.setDesc(definition.desc ?? '');

  if (definition.action) {
    setAction(setting, definition.action, index);
  } else if (definition.render) {
    row.cleanup = definition.render(setting.asOriginalType__(), settingGroup.asOriginalType__()) ?? null;
  } else if (definition.control) {
    throw new Error(
      `The "control" setting definition "${definition.name}" is not modeled by obsidian-test-mocks. Render the row with "render" instead.`
    );
  }

  return row;
}

function setAction(setting: Setting, action: SettingRowAction, index: number): void {
  setting.settingEl.addClass('mod-action', 'tappable');
  setting.settingEl.addEventListener('click', (event) => {
    if (event.defaultPrevented) {
      return;
    }

    action(setting.settingEl, index);
  });
}

function toGroupDefinitions(items: SettingDefinitionItemOriginal[]): SettingDefinitionGroupOriginal[] {
  const groups: SettingDefinitionGroupOriginal[] = [];
  let looseItems: null | SettingGroupItemOriginal[] = null;

  for (const item of items) {
    if (isGroupDefinition(item)) {
      groups.push(item);
      looseItems = null;
      continue;
    }

    if (!looseItems) {
      looseItems = [];
      groups.push({
        items: looseItems,
        type: 'group'
      });
    }

    looseItems.push(item);
  }

  return groups;
}
