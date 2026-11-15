import { InjectionToken, type Signal } from '@angular/core';
import type { SplitterOrientation } from './splitter-model';

export interface SplitterHandleState {
  readonly valueNow: number;
  readonly valueMin: number;
  readonly valueMax: number;
}

export interface SplitterHost {
  readonly orientation: Signal<SplitterOrientation>;
  readonly isStacked: Signal<boolean>;
  readonly dragging: Signal<boolean>;
  indexOf(pane: unknown): number;
  isLast(pane: unknown): boolean;
  flexFor(pane: unknown): string;
  handleState(pane: unknown): SplitterHandleState;
  startDrag(index: number, event: PointerEvent): void;
  moveDrag(event: PointerEvent): void;
  endDrag(event: PointerEvent): void;
  handleKeydown(index: number, event: KeyboardEvent): void;
  reset(): void;
}

export const SPLITTER_HOST = new InjectionToken<SplitterHost>('SPLITTER_HOST');
