import { InjectionToken, type Signal } from '@angular/core';

export type TabsMode = 'nav' | 'panel';

export interface TabsStripItem {
  readonly active: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  focus(): void;
}

export interface TabsStrip {
  readonly mode: Signal<TabsMode>;
  isFocusable(tab: TabsStripItem): boolean;
  handleKeydown(event: KeyboardEvent, tab: TabsStripItem): void;
}

export const TABS_STRIP = new InjectionToken<TabsStrip>('flr-tabs');
