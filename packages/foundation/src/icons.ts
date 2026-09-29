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

  // FerrLens — "loupe over pixel grid" mark (design bundle logos.html, option 03/Loupe).
  // currentColor on stroke + 25% opacity fill on the grid cells, so the icon
  // adapts to the surrounding text color when no accent is set.
  ferrlensLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#1e293b" opacity="0.35"><rect x="2" y="3" width="3" height="3"/><rect x="6" y="3" width="3" height="3"/><rect x="10" y="3" width="3" height="3"/><rect x="14" y="3" width="3" height="3"/><rect x="2" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="2" y="11" width="3" height="3"/><rect x="14" y="11" width="3" height="3"/><rect x="2" y="15" width="3" height="3"/><rect x="6" y="15" width="3" height="3"/><rect x="10" y="15" width="3" height="3"/><rect x="14" y="15" width="3" height="3"/></g><circle cx="19" cy="19" r="8" stroke="#14b8a6" stroke-width="2" fill="none"/><line x1="25" y1="25" x2="30" y2="30" stroke="#14b8a6" stroke-width="2" stroke-linecap="square"/></svg>`,

  // Layout & overview
  overview: stroke(
    `<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>`,
  ),
  products: stroke(
    `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>`,
  ),
  list: stroke(
    `<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>`,
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
  settings: stroke(
    `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  ),
  search: stroke(`<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`),
  help: stroke(
    `<circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  ),

  // Admin / staff
  dashboard: stroke(
    `<line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="6"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="12" x2="16" y2="8"/>`,
  ),
  organizations: stroke(
    `<rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="9" width="8" height="12" rx="1"/><line x1="6" y1="7" x2="8" y2="7"/><line x1="6" y1="11" x2="8" y2="11"/><line x1="6" y1="15" x2="8" y2="15"/><line x1="16" y1="13" x2="18" y2="13"/><line x1="16" y1="17" x2="18" y2="17"/>`,
  ),
  users: stroke(
    `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  ),
  installs: stroke(
    `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
  ),
  changelog: stroke(
    `<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
  ),

  // Fleet / agents
  fleet: stroke(
    `<circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><line x1="7" y1="7" x2="10" y2="10"/><line x1="17" y1="7" x2="14" y2="10"/><line x1="7" y1="17" x2="10" y2="14"/><line x1="17" y1="17" x2="14" y2="14"/>`,
  ),
  agents: stroke(
    `<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/><circle cx="9" cy="8" r="0.6" fill="currentColor"/><circle cx="15" cy="8" r="0.6" fill="currentColor"/>`,
  ),
  queue: stroke(
    `<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="14" y2="18"/>`,
  ),
  runs: stroke(`<polygon points="6 4 20 12 6 20 6 4"/>`),
  catalog: stroke(
    `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  ),
  tools: stroke(
    `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  ),
  datasets: stroke(
    `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>`,
  ),
  spend: stroke(
    `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  ),
  incidents: stroke(
    `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  ),

  // Vault extras
  vault: stroke(
    `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/>`,
  ),
  access: stroke(
    `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>`,
  ),

  // Track / inbox
  inbox: stroke(
    `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`,
  ),
  myIssues: stroke(
    `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/>`,
  ),
  subscribed: stroke(`<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>`),
  bell: stroke(
    `<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>`,
  ),
  docs: stroke(
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
  ),

  // Growth / sites
  pages: stroke(
    `<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="4" y1="8" x2="20" y2="8"/><line x1="8" y1="3" x2="8" y2="8"/>`,
  ),
  forms: stroke(
    `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/><line x1="7" y1="17" x2="11" y2="17"/>`,
  ),
  abTest: stroke(
    `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M7 9l-2 3 2 3"/><path d="M17 9l2 3-2 3"/>`,
  ),
  analytics: stroke(
    `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>`,
  ),
  blog: stroke(
    `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
  ),
  seo: stroke(
    `<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><polyline points="8 11 10.5 13.5 14 9.5"/>`,
  ),
  funnels: stroke(`<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`),
  quotes: stroke(
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/><line x1="9" y1="9" x2="11" y2="9"/>`,
  ),
  emails: stroke(
    `<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/>`,
  ),
  domains: stroke(
    `<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/>`,
  ),
  integrations: stroke(
    `<path d="M9 11V7a3 3 0 0 1 6 0v4"/><rect x="5" y="11" width="14" height="10" rx="2"/><line x1="9" y1="15" x2="9" y2="17"/><line x1="15" y1="15" x2="15" y2="17"/>`,
  ),

  // FerrGames admin
  players: stroke(
    `<circle cx="12" cy="8" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/><circle cx="9" cy="7" r="0.6" fill="currentColor"/><circle cx="15" cy="7" r="0.6" fill="currentColor"/>`,
  ),
  rooms: stroke(
    `<rect x="4" y="3" width="16" height="18" rx="1"/><circle cx="15" cy="12" r="1" fill="currentColor"/><line x1="4" y1="21" x2="20" y2="21"/>`,
  ),
  shop: stroke(
    `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  ),
  geo: stroke(
    `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`,
  ),
  dictionaries: stroke(
    `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/>`,
  ),

  // Generic toolkit
  zap: stroke(`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`),
  sparkles: stroke(
    `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.288 1.288L3 12l5.812 1.9a2 2 0 0 1 1.288 1.288L12 21l1.9-5.812a2 2 0 0 1 1.288-1.288L21 12l-5.812-1.9a2 2 0 0 1-1.288-1.288z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>`,
  ),
  bookmark: stroke(`<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>`),
  circleSlash: stroke(
    `<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>`,
  ),
  mail: stroke(
    `<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/>`,
  ),
  dns: stroke(
    `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
  ),
  arrowRight: stroke(`<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`),
} as const;

export type IconName = keyof typeof icons;
