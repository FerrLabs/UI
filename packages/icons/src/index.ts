/**
 * FerrLabs icon set.
 *
 * Each icon is exported as a raw SVG string for flexibility across React
 * and Astro. Consumers wrap in their own component (or use the SVG path
 * directly as a sprite).
 */

export const icons = {
  // Product logos
  ferrlabsLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7"/><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/></svg>`,

  // TODO: arrow-right, check, close, user, org, key, shield, rotate, audit, etc.
} as const;

export type IconName = keyof typeof icons;
