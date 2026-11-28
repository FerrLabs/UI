import '@angular/compiler';
import {
  Injector,
  runInInjectionContext,
  signal,
  type InputSignal,
  type WritableSignal,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { SPLITTER_HOST, type SplitterHost } from './splitter-host';
import { SplitterPaneComponent } from './splitter-pane.component';
import type { SplitterOrientation } from './splitter-model';

type InputNode<T> = { applyValueToInputSignal(node: unknown, value: T): void };

function setInput<T>(input: InputSignal<T>, value: T): void {
  const node = (input as unknown as Record<symbol, InputNode<T>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

class PaneProbe extends SplitterPaneComponent {
  get label_() {
    return this.displayLabel();
  }
  get flexValue() {
    return this.flex();
  }
  get handle() {
    return this.handleState();
  }
  get handleVisible() {
    return this.showHandle();
  }
  get handleAxis() {
    return this.handleOrientation();
  }
  get handleName() {
    return this.handleAriaLabel();
  }
  get position() {
    return this.index();
  }
  get id() {
    return this.paneId;
  }
}

interface HostRig {
  host: SplitterHost;
  panes: unknown[];
  orientation: WritableSignal<SplitterOrientation>;
  stacked: WritableSignal<boolean>;
}

function rig(): HostRig {
  const orientation = signal<SplitterOrientation>('horizontal');
  const stacked = signal(false);
  const panes: unknown[] = [];
  const host: SplitterHost = {
    orientation,
    isStacked: stacked,
    dragging: signal(false),
    paneLabel: signal((position: number) => `Panel ${position}`),
    resizeLabel: signal((label: string) => `Drag ${label}`),
    indexOf: (pane) => panes.indexOf(pane),
    isLast: (pane) => panes.indexOf(pane) === panes.length - 1,
    flexFor: (pane) => `0 0 ${panes.indexOf(pane) * 100}px`,
    handleState: (pane) => ({ valueNow: panes.indexOf(pane), valueMin: 0, valueMax: 100 }),
    startDrag: () => {},
    moveDrag: () => {},
    endDrag: () => {},
    handleKeydown: () => {},
    reset: () => {},
  };
  return { host, panes, orientation, stacked };
}

function pane(host: HostRig): PaneProbe {
  const injector = Injector.create({
    providers: [{ provide: SPLITTER_HOST, useValue: host.host }],
  });
  const created = runInInjectionContext(injector, () => new PaneProbe());
  host.panes.push(created);
  return created;
}

describe('SplitterPaneComponent', () => {
  it('only collapses when it is collapsible', () => {
    const h = rig();
    const p = pane(h);
    p.collapsed.set(true);
    expect(p.isCollapsed()).toBe(false);
    setInput(p.collapsible, true);
    expect(p.isCollapsed()).toBe(true);
    p.collapsed.set(false);
    expect(p.isCollapsed()).toBe(false);
  });

  it('labels itself by position unless a label is given', () => {
    const h = rig();
    pane(h);
    const second = pane(h);
    expect(second.label_).toBe('Panel 2');
    setInput(second.label, 'Sidebar');
    expect(second.label_).toBe('Sidebar');
  });

  it('delegates index, flex and handle state to the host', () => {
    const h = rig();
    pane(h);
    const second = pane(h);
    expect(second.position).toBe(1);
    expect(second.flexValue).toBe('0 0 100px');
    expect(second.handle).toEqual({ valueNow: 1, valueMin: 0, valueMax: 100 });
  });

  it('shows a handle on every pane but the last, and never when stacked', () => {
    const h = rig();
    const first = pane(h);
    const last = pane(h);
    expect(first.handleVisible).toBe(true);
    expect(last.handleVisible).toBe(false);
    h.stacked.set(true);
    expect(first.handleVisible).toBe(false);
  });

  it('orients the handle across the splitter axis', () => {
    const h = rig();
    const p = pane(h);
    expect(p.handleAxis).toBe('vertical');
    h.orientation.set('vertical');
    expect(p.handleAxis).toBe('horizontal');
  });

  it('names the handle from the pane label, with an override', () => {
    const h = rig();
    const p = pane(h);
    expect(p.handleName).toBe('Drag Panel 1');
    setInput(p.label, 'Editor');
    expect(p.handleName).toBe('Drag Editor');
    setInput(p.handleLabel, 'Resize editor');
    expect(p.handleName).toBe('Resize editor');
  });

  it('gives each pane a unique id', () => {
    const h = rig();
    expect(pane(h).id).not.toBe(pane(h).id);
  });
});
