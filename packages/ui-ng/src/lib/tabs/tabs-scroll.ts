export interface TabsFade {
  readonly start: boolean;
  readonly end: boolean;
}

export interface Box {
  readonly left: number;
  readonly width: number;
}

const EDGE_TOLERANCE_PX = 1;

export function fadeEdges(scrollLeft: number, clientWidth: number, scrollWidth: number): TabsFade {
  const overflow = scrollWidth - clientWidth;
  if (overflow <= EDGE_TOLERANCE_PX) return { start: false, end: false };
  const offset = Math.abs(scrollLeft);
  return {
    start: offset > EDGE_TOLERANCE_PX,
    end: offset < overflow - EDGE_TOLERANCE_PX,
  };
}

export function centeredScrollLeft(scrollLeft: number, tab: Box, strip: Box): number {
  const tabCenter = tab.left - strip.left + tab.width / 2;
  return scrollLeft + tabCenter - strip.width / 2;
}

export function scrollBehavior(prefersReducedMotion: boolean, animate: boolean): ScrollBehavior {
  return animate && !prefersReducedMotion ? 'smooth' : 'auto';
}

export interface StripGeometry {
  readonly clientWidth: number;
  readonly scrollWidth: number;
}

export const FADE_WIDTH_PX = 24;

export function shouldReveal(
  previous: StripGeometry | null,
  next: StripGeometry,
  userScrolled: boolean,
): boolean {
  if (userScrolled) return false;
  if (previous === null) return true;
  return previous.clientWidth !== next.clientWidth || previous.scrollWidth !== next.scrollWidth;
}

export function focusScrollLeft(scrollLeft: number, tab: Box, strip: Box): number | null {
  const visibleStart = strip.left + FADE_WIDTH_PX;
  const visibleEnd = strip.left + strip.width - FADE_WIDTH_PX;
  if (tab.left < visibleStart) return scrollLeft + tab.left - visibleStart;
  const tabEnd = tab.left + tab.width;
  if (tabEnd > visibleEnd) return scrollLeft + tabEnd - visibleEnd;
  return null;
}
