import { InjectionToken, type Signal } from '@angular/core';

/**
 * `nav` for tabs that are links, one URL per view: the strip is a navigation
 * landmark and the active tab carries `aria-current="page"`.
 *
 * `panel` for tabs that swap a region of the same page: the strip becomes a
 * `tablist` with roving tabindex and arrow-key navigation.
 */
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
