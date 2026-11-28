import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { TreeSelectComponent, type TreeSelectGroup } from './tree-select.component';

type InputNode<T> = { applyValueToInputSignal(node: unknown, value: T): void };

function setInput<T>(input: InputSignal<T>, value: T): void {
  const node = (input as unknown as Record<symbol, InputNode<T>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

const GROUPS: readonly TreeSelectGroup[] = [
  {
    id: 'fruit',
    label: 'Fruit',
    hint: 'sweet',
    options: [
      { id: 'apple', label: 'Apple' },
      { id: 'pear', label: 'Pear', hint: 'green' },
    ],
  },
  {
    id: 'veg',
    label: 'Vegetables',
    options: [
      { id: 'leek', label: 'Leek' },
      { id: 'kale', label: 'Kale' },
      { id: 'beet', label: 'Beetroot' },
    ],
  },
];

class TreeProbe extends TreeSelectComponent {
  get visibleGroups() {
    return this.visible();
  }
  get count() {
    return this.selectedCount();
  }
  get countLabel() {
    return this.countText();
  }
  get isDisabled() {
    return this.disabled();
  }
  selectedFor(group: TreeSelectGroup) {
    return this.selectedIn(group);
  }
  stateOf(group: TreeSelectGroup) {
    return this.groupState(group);
  }
  has(id: string) {
    return this.isSelected(id);
  }
  open(id: string) {
    return this.isOpen(id);
  }
  flip(id: string) {
    this.toggleOpen(id);
  }
  search(text: string) {
    this.onQuery({ target: { value: text } } as unknown as Event);
  }
  toggleOption(id: string) {
    this.toggle(id);
  }
  toggleWholeGroup(group: TreeSelectGroup) {
    this.toggleGroup(group);
  }
  clearAll() {
    this.clear();
  }
}

function create(groups: readonly TreeSelectGroup[] = GROUPS): TreeProbe {
  const tree = runInInjectionContext(Injector.create({ providers: [] }), () => new TreeProbe());
  setInput(tree.groups, groups);
  return tree;
}

describe('TreeSelectComponent selection', () => {
  it('emits the selected ids and touches on each toggle', () => {
    const tree = create();
    const onChange = vi.fn();
    const onTouched = vi.fn();
    tree.registerOnChange(onChange);
    tree.registerOnTouched(onTouched);

    tree.toggleOption('apple');
    tree.toggleOption('leek');

    expect(onChange).toHaveBeenNthCalledWith(1, ['apple']);
    expect(onChange).toHaveBeenNthCalledWith(2, ['apple', 'leek']);
    expect(onTouched).toHaveBeenCalledTimes(2);
  });

  it('deselects an already selected option', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.toggleOption('apple');
    tree.toggleOption('apple');
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(tree.has('apple')).toBe(false);
  });

  it('writes a model value without emitting', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.writeValue(['pear', 'kale']);
    expect(tree.has('pear')).toBe(true);
    expect(tree.has('kale')).toBe(true);
    expect(tree.count).toBe(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('treats a null model value as empty and replaces the previous selection', () => {
    const tree = create();
    tree.writeValue(['pear']);
    tree.writeValue(null);
    expect(tree.count).toBe(0);
  });

  it('keeps ids that are not in any group', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.writeValue(['ghost']);
    tree.toggleOption('apple');
    expect(onChange).toHaveBeenLastCalledWith(['ghost', 'apple']);
  });

  it('clears everything and emits an empty list', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.writeValue(['apple', 'leek']);
    tree.clearAll();
    expect(onChange).toHaveBeenCalledExactlyOnceWith([]);
    expect(tree.count).toBe(0);
  });
});

describe('TreeSelectComponent group state', () => {
  const [fruit, veg] = GROUPS;

  it('reports none, some and all', () => {
    const tree = create();
    expect(tree.stateOf(fruit)).toBe('none');
    tree.toggleOption('apple');
    expect(tree.stateOf(fruit)).toBe('some');
    tree.toggleOption('pear');
    expect(tree.stateOf(fruit)).toBe('all');
    expect(tree.selectedFor(fruit)).toBe(2);
    expect(tree.selectedFor(veg)).toBe(0);
  });

  it('selects the whole group from none and from some, leaving other groups alone', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.writeValue(['leek']);

    tree.toggleOption('apple');
    tree.toggleWholeGroup(fruit);

    expect(tree.stateOf(fruit)).toBe('all');
    expect(onChange).toHaveBeenLastCalledWith(['leek', 'apple', 'pear']);
  });

  it('deselects the whole group when every option is selected', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.writeValue(['apple', 'pear', 'leek']);
    tree.toggleWholeGroup(fruit);
    expect(onChange).toHaveBeenLastCalledWith(['leek']);
    expect(tree.stateOf(fruit)).toBe('none');
  });
});

describe('TreeSelectComponent disabled', () => {
  it('ignores every mutation while disabled', () => {
    const tree = create();
    const onChange = vi.fn();
    tree.registerOnChange(onChange);
    tree.writeValue(['apple']);
    tree.setDisabledState(true);

    tree.toggleOption('pear');
    tree.toggleWholeGroup(GROUPS[1]);
    tree.clearAll();

    expect(onChange).not.toHaveBeenCalled();
    expect(tree.count).toBe(1);
    expect(tree.isDisabled).toBe(true);
  });

  it('accepts changes again once re-enabled', () => {
    const tree = create();
    tree.setDisabledState(true);
    tree.setDisabledState(false);
    tree.toggleOption('pear');
    expect(tree.has('pear')).toBe(true);
  });
});

describe('TreeSelectComponent filtering', () => {
  it('shows every group for a blank query', () => {
    const tree = create();
    tree.search('   ');
    expect(tree.visibleGroups).toBe(GROUPS);
  });

  it('filters options by label, case-insensitively, and drops groups without a match', () => {
    const tree = create();
    tree.search('  KALE ');
    expect(tree.visibleGroups.map((g) => g.id)).toEqual(['veg']);
    expect(tree.visibleGroups[0].options.map((o) => o.id)).toEqual(['kale']);
  });

  it('matches an option hint', () => {
    const tree = create();
    tree.search('green');
    expect(tree.visibleGroups[0].options.map((o) => o.id)).toEqual(['pear']);
  });

  it('keeps all options when the group label matches', () => {
    const tree = create();
    tree.search('veget');
    expect(tree.visibleGroups[0].options).toHaveLength(3);
  });

  it('keeps all options when the group hint matches', () => {
    const tree = create();
    tree.search('sweet');
    expect(tree.visibleGroups[0].id).toBe('fruit');
    expect(tree.visibleGroups[0].options).toHaveLength(2);
  });

  it('returns nothing when no group or option matches', () => {
    const tree = create();
    tree.search('zzz');
    expect(tree.visibleGroups).toEqual([]);
  });

  it('does not lose selections hidden by the filter', () => {
    const tree = create();
    tree.writeValue(['apple']);
    tree.search('kale');
    expect(tree.count).toBe(1);
  });
});

describe('TreeSelectComponent expansion', () => {
  it('starts collapsed and toggles open and closed', () => {
    const tree = create();
    expect(tree.open('fruit')).toBe(false);
    tree.flip('fruit');
    expect(tree.open('fruit')).toBe(true);
    expect(tree.open('veg')).toBe(false);
    tree.flip('fruit');
    expect(tree.open('fruit')).toBe(false);
  });

  it('inverts the toggle when startExpanded is set', () => {
    const tree = create();
    setInput(tree.startExpanded, true);
    expect(tree.open('fruit')).toBe(true);
    tree.flip('fruit');
    expect(tree.open('fruit')).toBe(false);
  });

  it('forces groups open while a query is active', () => {
    const tree = create();
    tree.search('apple');
    expect(tree.open('fruit')).toBe(true);
    tree.search('');
    expect(tree.open('fruit')).toBe(false);
  });
});

describe('TreeSelectComponent count text', () => {
  it('uses the default and a custom formatter', () => {
    const tree = create();
    tree.writeValue(['apple', 'pear']);
    expect(tree.countLabel).toBe('2 selected');
    setInput(tree.selectedText, (n) => `${n} gewählt`);
    expect(tree.countLabel).toBe('2 gewählt');
  });
});
