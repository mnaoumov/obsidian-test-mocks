import type {
  SettingDefinitionItem as SettingDefinitionItemOriginal,
  SettingGroup as SettingGroupOriginal,
  Setting as SettingOriginal
} from 'obsidian';

import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { castTo } from './castTo.ts';
import {
  applyDomState,
  evaluatePredicate,
  renderSettingDefinitions
} from './setting-definition-renderer.ts';

const HIDDEN_DISPLAY = 'none';
const VISIBLE_DISPLAY = '';

interface RenderResult {
  readonly containerEl: HTMLDivElement;
  readonly groups: ReturnType<typeof renderSettingDefinitions>;
  readonly rows: ReturnType<typeof renderSettingDefinitions>[number]['children'];
}

function render(items: SettingDefinitionItemOriginal[]): RenderResult {
  const containerEl = createDiv();
  const groups = renderSettingDefinitions(items, containerEl);
  return {
    containerEl,
    groups,
    rows: groups.flatMap((group) => group.children)
  };
}

describe('evaluatePredicate', () => {
  it('should return the default value when the predicate is absent', () => {
    expect(evaluatePredicate(undefined, true)).toBe(true);
    expect(evaluatePredicate(undefined, false)).toBe(false);
  });

  it('should return the value itself when the predicate is not a function', () => {
    expect(evaluatePredicate(false, true)).toBe(false);
    expect(evaluatePredicate(true, false)).toBe(true);
  });

  it('should call a function predicate', () => {
    expect(evaluatePredicate(() => false, true)).toBe(false);
  });

  it('should fall back to the default value and log when the predicate throws', () => {
    const error = new Error('predicate failed');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(evaluatePredicate(() => {
        throw error;
      }, true)).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

describe('renderSettingDefinitions', () => {
  it('should empty the container before rendering', () => {
    const containerEl = createDiv();
    containerEl.createDiv().textContent = 'stale';
    renderSettingDefinitions([{ name: 'Row', render: (): void => undefined }], containerEl);
    expect(containerEl.textContent).not.toContain('stale');
  });

  it('should wrap runs of loose rows in implicit groups split by the explicit ones', () => {
    const { groups } = render([
      { name: 'Loose 1', render: (): void => undefined },
      { name: 'Loose 2', render: (): void => undefined },
      { heading: 'Explicit', items: [{ name: 'Grouped', render: (): void => undefined }], type: 'group' },
      { name: 'Loose 3', render: (): void => undefined }
    ]);

    expect(groups).toHaveLength(3);
    expect(groups[0]?.children.map((row) => row.setting.nameEl.textContent)).toEqual(['Loose 1', 'Loose 2']);
    expect(groups[1]?.definition.heading).toBe('Explicit');
    expect(groups[2]?.children.map((row) => row.setting.nameEl.textContent)).toEqual(['Loose 3']);
  });

  it('should render the group heading and classes', () => {
    const { groups } = render([{
      cls: 'mod-first  mod-second',
      heading: 'Heading',
      items: [{ name: 'Row', render: (): void => undefined }],
      type: 'group'
    }]);

    const group = groups[0];
    expect(group?.groupEl.textContent).toContain('Heading');
    expect(group?.settingGroup.listEl.classList.contains('mod-first')).toBe(true);
    expect(group?.settingGroup.listEl.classList.contains('mod-second')).toBe(true);
  });

  it('should render a list definition as a group', () => {
    const { groups } = render([{ items: [{ name: 'Entry', render: (): void => undefined }], type: 'list' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.children).toHaveLength(1);
  });

  it('should render a group that declares no items', () => {
    const { groups } = render([{ heading: 'Empty', type: 'group' }]);
    expect(groups[0]?.children).toEqual([]);
  });

  it('should drop definitions with nothing to render', () => {
    const { rows } = render([{ name: '' }, { name: 'Kept', render: (): void => undefined }]);
    expect(rows.map((row) => row.setting.nameEl.textContent)).toEqual(['Kept']);
  });

  it('should render a definition that declares only a name', () => {
    const { rows } = render([{ name: 'Name only' }]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.setting.nameEl.textContent).toBe('Name only');
    expect(rows[0]?.setting.components).toEqual([]);
  });

  it('should set the name and an empty description when none is declared', () => {
    const { rows } = render([{ name: 'Row', render: (): void => undefined }]);
    expect(rows[0]?.setting.nameEl.textContent).toBe('Row');
    expect(rows[0]?.setting.descEl.textContent).toBe('');
  });

  it('should set the declared description', () => {
    const { rows } = render([{ desc: 'Description', name: 'Row', render: (): void => undefined }]);
    expect(rows[0]?.setting.descEl.textContent).toBe('Description');
  });

  it('should pass the row setting and the owning group to the render callback', () => {
    let receivedSetting: null | SettingOriginal = null;
    let receivedGroup: null | SettingGroupOriginal = null;
    const { groups } = render([{
      name: 'Row',
      render: (setting, group): void => {
        receivedSetting = setting;
        receivedGroup = group;
      }
    }]);

    expect(receivedSetting).toBe(groups[0]?.children[0]?.setting);
    expect(receivedGroup).toBe(groups[0]?.settingGroup);
  });

  it('should capture the cleanup function returned by render', () => {
    const cleanup = vi.fn();
    const { rows } = render([
      { name: 'With cleanup', render: (): () => void => cleanup },
      { name: 'Without cleanup', render: (): void => undefined }
    ]);

    expect(rows[0]?.cleanup).toBe(cleanup);
    expect(rows[1]?.cleanup).toBeNull();
  });

  it('should throw for a control definition', () => {
    expect(() =>
      render([{
        control: {
          key: 'someKey',
          type: 'toggle'
        },
        name: 'Control row'
      }])
    ).toThrow('is not modeled by obsidian-test-mocks');
  });

  describe('action rows', () => {
    it('should invoke the action on click with the row element and its index', () => {
      const action = vi.fn();
      const { rows } = render([
        { name: 'First', render: (): void => undefined },
        { action, name: 'Second' }
      ]);

      const row = rows[1];
      expect(row?.settingEl.classList.contains('mod-action')).toBe(true);
      expect(row?.settingEl.classList.contains('tappable')).toBe(true);

      row?.settingEl.dispatchEvent(new MouseEvent('click', { cancelable: true }));
      expect(action).toHaveBeenCalledWith(row?.settingEl, 1);
    });

    it('should ignore a click whose default was prevented', () => {
      const action = vi.fn();
      const { containerEl, rows } = render([{ action, name: 'Row' }]);
      /*
       * A capturing listener on an ancestor runs before the row's own listener, the way a component that
       * handles the click itself does.
       */
      containerEl.addEventListener('click', (event) => {
        event.preventDefault();
      }, { capture: true });

      rows[0]?.settingEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('page rows', () => {
    it('should render the name and description', () => {
      const { rows } = render([{ desc: 'Page description', items: [], name: 'Page', type: 'page' }]);
      expect(rows[0]?.setting.nameEl.textContent).toBe('Page');
      expect(rows[0]?.setting.descEl.textContent).toBe('Page description');
    });

    it('should render an empty description and no display value when neither is declared', () => {
      const { rows } = render([{ items: [], name: 'Page', type: 'page' }]);
      expect(rows[0]?.setting.descEl.textContent).toBe('');
      expect(rows[0]?.setting.controlEl.textContent).toBe('');
    });

    it('should render a static display value', () => {
      const { rows } = render([{ displayValue: 'Value', items: [], name: 'Page', type: 'page' }]);
      expect(rows[0]?.setting.controlEl.textContent).toBe('Value');
    });

    it('should render a computed display value', () => {
      const { rows } = render([{ displayValue: (): string => 'Computed', items: [], name: 'Page', type: 'page' }]);
      expect(rows[0]?.setting.controlEl.textContent).toBe('Computed');
    });

    it('should render a warning status without a display value', () => {
      const { rows } = render([{ items: [], name: 'Page', status: (): 'warning' => 'warning', type: 'page' }]);
      expect(rows[0]?.setting.controlEl.querySelector('.mod-warning')).not.toBeNull();
    });

    it('should render a page declared with a page factory', () => {
      const { rows } = render([{
        name: 'Page',
        page: (): never => {
          throw new Error('never called');
        },
        type: 'page'
      }]);
      expect(rows[0]?.setting.nameEl.textContent).toBe('Page');
    });

    it('should drop a page that declares neither items nor a page factory', () => {
      const { rows } = render([{ name: 'Page', type: 'page' }]);
      expect(rows).toEqual([]);
    });
  });

  describe('predicates', () => {
    it('should render a hidden row and toggle it off rather than skipping it', () => {
      const renderCallback = vi.fn();
      const { rows } = render([{ name: 'Hidden', render: renderCallback, visible: false }]);

      expect(renderCallback).toHaveBeenCalledTimes(1);
      expect(rows[0]?.isVisible).toBe(false);
      expect(rows[0]?.settingEl.style.display).toBe(HIDDEN_DISPLAY);
    });

    it('should keep a visible row shown', () => {
      const { rows } = render([{ name: 'Shown', render: (): void => undefined, visible: (): boolean => true }]);
      expect(rows[0]?.isVisible).toBe(true);
      expect(rows[0]?.settingEl.style.display).toBe(VISIBLE_DISPLAY);
    });

    it('should apply a declared disabled predicate', () => {
      /*
       * Obsidian honors `disabled` on every definition kind it renders, but `obsidian.d.ts` declares it only
       * on the action and control variants, so a render row declares it through a cast.
       */
      const { rows } = render([
        castTo<SettingDefinitionItemOriginal>({ disabled: true, name: 'Disabled', render: (): void => undefined }),
        { action: (): void => undefined, disabled: (): boolean => false, name: 'Enabled' }
      ]);

      expect(rows[0]?.settingEl.classList.contains('is-disabled')).toBe(true);
      expect(rows[1]?.settingEl.classList.contains('is-disabled')).toBe(false);
    });

    it('should leave the disabled state untouched when the definition declares none', () => {
      const { rows } = render([{
        name: 'Row',
        render: (setting): void => {
          setting.setDisabled(true);
        }
      }]);

      expect(rows[0]?.settingEl.classList.contains('is-disabled')).toBe(true);
    });

    it('should hide a group whose own predicate is false', () => {
      const { groups } = render([{
        items: [{ name: 'Row', render: (): void => undefined }],
        type: 'group',
        visible: false
      }]);

      expect(groups[0]?.groupEl.style.display).toBe(HIDDEN_DISPLAY);
    });

    it('should hide a group whose rows are all hidden', () => {
      const { groups } = render([{
        items: [{ name: 'Row', render: (): void => undefined, visible: false }],
        type: 'group'
      }]);

      expect(groups[0]?.groupEl.style.display).toBe(HIDDEN_DISPLAY);
    });

    it('should show a group that declares no rows', () => {
      const { groups } = render([{ heading: 'Empty', type: 'group' }]);
      expect(groups[0]?.groupEl.style.display).toBe(VISIBLE_DISPLAY);
    });
  });
});

describe('applyDomState', () => {
  it('should re-evaluate the predicates without re-rendering', () => {
    let isVisible = true;
    const renderCallback = vi.fn();
    const { groups, rows } = render([{
      items: [{ name: 'Row', render: renderCallback, visible: (): boolean => isVisible }],
      type: 'group'
    }]);

    expect(rows[0]?.settingEl.style.display).toBe(VISIBLE_DISPLAY);

    isVisible = false;
    applyDomState(groups);

    expect(renderCallback).toHaveBeenCalledTimes(1);
    expect(rows[0]?.isVisible).toBe(false);
    expect(rows[0]?.settingEl.style.display).toBe(HIDDEN_DISPLAY);
    expect(groups[0]?.groupEl.style.display).toBe(HIDDEN_DISPLAY);
  });
});
