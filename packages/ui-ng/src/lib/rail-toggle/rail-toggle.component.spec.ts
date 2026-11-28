import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { RailToggleComponent } from './rail-toggle.component';

class Probe extends RailToggleComponent {
  get text(): string {
    return this.label();
  }
  flip(): void {
    this.toggle();
  }
}

const create = () => createHarness().create(() => new Probe());

describe('RailToggleComponent', () => {
  it('starts expanded and offers to collapse', () => {
    const toggle = create();
    expect(toggle.collapsed()).toBe(false);
    expect(toggle.text).toBe('Collapse sidebar');
  });

  it('offers to expand once collapsed', () => {
    const toggle = create();
    toggle.collapsed.set(true);
    expect(toggle.text).toBe('Expand sidebar');
  });

  it('flips the collapsed model on each toggle', () => {
    const toggle = create();
    toggle.flip();
    expect(toggle.collapsed()).toBe(true);
    toggle.flip();
    expect(toggle.collapsed()).toBe(false);
  });

  it('uses custom labels', () => {
    const toggle = create();
    setInput(toggle.collapseLabel, 'Réduire');
    setInput(toggle.expandLabel, 'Développer');
    expect(toggle.text).toBe('Réduire');
    toggle.flip();
    expect(toggle.text).toBe('Développer');
  });
});
