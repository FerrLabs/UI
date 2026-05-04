/**
 * FerrLabs icon set — Lucide-inspired stroke icons designed at 24×24 viewBox,
 * stroke-width 1.5, stroke="currentColor". Render at any size; the icon column
 * in `@ferrlabs/ui-primitives` Sidebar uses 16×16. Each entry is a raw SVG
 * string for portability across React + Astro.
 */

const stroke = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const icons = {
  ferrlabsLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7"/><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/></svg>`,

  // Layout & overview
  overview: stroke(
    `<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>`,
  ),
  products: stroke(
    `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>`,
  ),
  usage: stroke(`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`),
  home: stroke(`<path d="M3 9 12 2l9 7v11a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2z"/>`),

  // Org / people
  members: stroke(
    `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  ),
  teams: stroke(
    `<path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="17" cy="7" r="3"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/>`,
  ),
  roles: stroke(`<path d="M9 12l2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`),
  profile: stroke(
    `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  ),

  // Audit / activity
  auditLog: stroke(
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>`,
  ),

  // Billing / commerce
  billing: stroke(
    `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`,
  ),
  tax: stroke(
    `<line x1="12" y1="3" x2="12" y2="21"/><path d="M5 7l7-4 7 4"/><path d="M5 7l-2 6h4z"/><path d="M19 7l2 6h-4z"/><path d="M3 13a2 2 0 0 0 4 0"/><path d="M17 13a2 2 0 0 0 4 0"/>`,
  ),

  // Security
  sso: stroke(
    `<circle cx="12" cy="11" r="9"/><path d="M3.6 9h16.8"/><path d="M3.6 14h16.8"/><path d="M12 2a13 13 0 0 1 0 18M12 2a13 13 0 0 0 0 18"/>`,
  ),
  tokens: stroke(
    `<circle cx="7.5" cy="15.5" r="4.5"/><line x1="10.5" y1="12.5" x2="20" y2="3"/><line x1="16" y1="7" x2="20" y2="11"/><line x1="13" y1="10" x2="17" y2="14"/>`,
  ),
  sessions: stroke(
    `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
  ),
  shield: stroke(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`),

  // Vault
  secrets: stroke(
    `<circle cx="7.5" cy="15.5" r="4.5"/><line x1="10.5" y1="12.5" x2="20" y2="3"/><line x1="16" y1="7" x2="20" y2="11"/>`,
  ),
  environments: stroke(
    `<rect x="2" y="3" width="20" height="6" rx="1"/><rect x="2" y="13" width="20" height="6" rx="1"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="16" x2="6.01" y2="16"/>`,
  ),
  rotations: stroke(
    `<polyline points="21 12 21 6 15 6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 6"/><polyline points="3 12 3 18 9 18"/><path d="M21 12a9 9 0 0 1-15 6.7L3 18"/>`,
  ),
  kms: stroke(
    `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  ),

  // Connect / DevOps
  cli: stroke(`<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>`),
  k8s: stroke(`<polygon points="12 2 22 7 22 17 12 22 2 17 2 7"/><circle cx="12" cy="12" r="3"/>`),
  ci: stroke(
    `<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>`,
  ),

  // Track / issues
  issues: stroke(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>`),
  cycles: stroke(
    `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  ),
  roadmap: stroke(
    `<polygon points="1 6 7 3 17 6 23 3 23 18 17 21 7 18 1 21"/><line x1="7" y1="3" x2="7" y2="18"/><line x1="17" y1="6" x2="17" y2="21"/>`,
  ),
  triage: stroke(
    `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  ),
  templates: stroke(
    `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>`,
  ),
  prefs: stroke(
    `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  ),
} as const;

export type IconName = keyof typeof icons;
