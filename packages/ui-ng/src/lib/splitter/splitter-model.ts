import { numberAttribute } from '@angular/core';

const DEFAULT_STEP = 10;

export type SplitterOrientation = 'horizontal' | 'vertical';

export type SplitterSize = number | `${number}%`;

export interface PaneBounds {
  readonly min: number;
  readonly max: number;
}

export interface PaneLimits {
  readonly minSize: SplitterSize | undefined;
  readonly maxSize: SplitterSize | undefined;
  readonly collapsed: boolean;
}

export type KeyIntent = number | 'min' | 'max';

const EPSILON = 0.001;

export function coerceSize(value: number | string | null | undefined): SplitterSize | undefined {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  if (/^\d+(\.\d+)?%$/.test(trimmed)) return trimmed as SplitterSize;
  if (/^\d+(\.\d+)?(px)?$/.test(trimmed)) return parsed;
  return undefined;
}

export function coerceStackBelow(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = numberAttribute(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

export function coerceStep(value: number | string | null | undefined): number {
  const parsed = numberAttribute(value, Number.NaN);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STEP;
}

export function resolveSize(size: SplitterSize, total: number): number {
  const resolved = typeof size === 'number' ? size : (Number.parseFloat(size) / 100) * total;
  return Number.isFinite(resolved) ? resolved : 0;
}

export function resolveBounds(limits: PaneLimits, total: number): PaneBounds {
  if (limits.collapsed) return { min: 0, max: 0 };
  const min = limits.minSize === undefined ? 0 : resolveSize(limits.minSize, total);
  const max = limits.maxSize === undefined ? Infinity : resolveSize(limits.maxSize, total);
  return { min: Math.max(0, min), max: Math.max(min, max) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function sum(values: readonly number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export function defaultRatios(
  defaults: readonly (SplitterSize | undefined)[],
  total: number,
): number[] {
  if (defaults.length === 0) return [];
  const explicit = defaults.map((size) =>
    size === undefined || total <= 0 ? undefined : resolveSize(size, total) / total,
  );
  const claimed = sum(explicit.map((ratio) => ratio ?? 0));
  const unset = explicit.filter((ratio) => ratio === undefined).length;
  const share = unset === 0 ? 0 : Math.max(0, 1 - claimed) / unset;
  return explicit.map((ratio) => ratio ?? share);
}

export function fitSizes(
  sizes: readonly number[],
  bounds: readonly PaneBounds[],
  total: number,
): number[] {
  const result = sizes.map((size, i) => clamp(size, bounds[i].min, bounds[i].max));
  for (let pass = 0; pass <= result.length; pass++) {
    const diff = total - sum(result);
    if (Math.abs(diff) < EPSILON) break;
    const free = Array.from(result.keys()).filter((i) =>
      diff > 0 ? result[i] < bounds[i].max - EPSILON : result[i] > bounds[i].min + EPSILON,
    );
    if (free.length === 0) break;
    const weight = sum(free.map((i) => result[i]));
    for (const i of free) {
      const share = weight > 0 ? result[i] / weight : 1 / free.length;
      result[i] = clamp(result[i] + diff * share, bounds[i].min, bounds[i].max);
    }
  }
  return result;
}

export function layoutSizes(
  ratios: readonly number[],
  collapsed: readonly boolean[],
  bounds: readonly PaneBounds[],
  total: number,
): number[] {
  const wanted = ratios.map((ratio, i) => (collapsed[i] ? 0 : ratio * total));
  return fitSizes(wanted, bounds, total);
}

export function resizePair(
  sizes: readonly number[],
  index: number,
  delta: number,
  bounds: readonly PaneBounds[],
): number[] {
  const before = sizes[index];
  const after = sizes[index + 1];
  if (before === undefined || after === undefined) return [...sizes];
  const shrinkable = Math.max(
    0,
    Math.min(before - bounds[index].min, bounds[index + 1].max - after),
  );
  const growable = Math.max(0, Math.min(bounds[index].max - before, after - bounds[index + 1].min));
  const applied = clamp(delta, -shrinkable, growable);
  const result = [...sizes];
  result[index] = before + applied;
  result[index + 1] = after - applied;
  return result;
}

export function ratiosAfterResize(
  previous: readonly number[],
  sizes: readonly number[],
  collapsed: readonly boolean[],
  total: number,
): number[] {
  if (total <= 0) return [...previous];
  return sizes.map((size, i) => (collapsed[i] ? previous[i] : size / total));
}

export function toRatios(sizes: readonly number[], total: number): number[] {
  return total > 0 ? sizes.map((size) => size / total) : sizes.map(() => 0);
}

export function isRtl(direction: string): boolean {
  return direction === 'rtl';
}

export function dragSign(orientation: SplitterOrientation, rtl: boolean): 1 | -1 {
  return orientation === 'horizontal' && rtl ? -1 : 1;
}

export function pointerDelta(
  orientation: SplitterOrientation,
  rtl: boolean,
  start: number,
  current: number,
): number {
  return (current - start) * dragSign(orientation, rtl);
}

export function keyIntent(
  key: string,
  orientation: SplitterOrientation,
  rtl: boolean,
  step: number,
): KeyIntent | null {
  if (key === 'Home') return 'min';
  if (key === 'End') return 'max';
  const forward = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
  const backward = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
  if (key !== forward && key !== backward) return null;
  const direction = key === forward ? 1 : -1;
  return direction * dragSign(orientation, rtl) * step;
}

export function intentDelta(intent: KeyIntent): number {
  if (intent === 'min') return -Infinity;
  if (intent === 'max') return Infinity;
  return intent;
}

export function toggleTarget(
  index: number,
  collapsible: readonly boolean[],
  collapsed: readonly boolean[],
): number | null {
  const neighbours = [index, index + 1].filter((i) => collapsible[i]);
  return neighbours.find((i) => collapsed[i]) ?? neighbours[0] ?? null;
}

export function toPercent(size: number, total: number): number {
  return total > 0 ? Math.round((size / total) * 100) : 0;
}

export type SizeAnnouncer = (label: string, percent: number, collapsed: boolean) => string;
export type PaneLabeller = (position: number) => string;
export type HandleLabeller = (paneLabel: string) => string;

export const DEFAULT_RESET_ANNOUNCEMENT = 'Panes reset to default sizes';

export const describeSize: SizeAnnouncer = (label, percent, collapsed) =>
  collapsed ? `${label} collapsed` : `${label} ${percent} percent`;

export const describePane: PaneLabeller = (position) => `Pane ${position}`;

export const describeHandle: HandleLabeller = (paneLabel) => `Resize ${paneLabel}`;

export function resolvePaneLabel(
  label: string | undefined,
  index: number,
  labeller: PaneLabeller,
): string {
  return label ?? labeller(index + 1);
}

export function resolveHandleLabel(
  override: string | null,
  paneLabel: string,
  labeller: HandleLabeller,
): string {
  return override ?? labeller(paneLabel);
}
