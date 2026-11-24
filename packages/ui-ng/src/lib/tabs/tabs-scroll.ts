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
