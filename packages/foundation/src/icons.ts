/**
 * FerrLabs icon set — Lucide-inspired stroke icons designed at 24×24 viewBox,
 * stroke-width 1.5, stroke="currentColor". Render at any size; the icon column
 * in `@ferrlabs/ui-primitives` Sidebar uses 16×16. Each entry is a raw SVG
 * string for portability across React + Astro.
 */

const stroke = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const SHIELD = `<path d="M12 21.5c4.8-1.9 8-5.4 8-10v-6l-8-3-8 3v6c0 4.6 3.2 8.1 8 10z"/>`;
const RING = `<circle cx="12" cy="12" r="8.5"/>`;
const PEOPLE = `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path class="fi-nx" d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path class="fi-nx" d="M18.5 14.5a6.5 6.5 0 0 1 3 5.5"/>`;
const ENVELOPE = `<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path pathLength="1" class="fi-draw" d="m3 7.5 9 6 9-6"/>`;
const FILE = `<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M13.5 3v5.5H19"/>`;
const LENS = `<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>`;
const ALERT = `<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path class="fi-blink" d="M12 9v4"/><path class="fi-blink" d="M12 17h.01"/>`;

export const icons = {
  ferrlabsLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7"/><circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1" fill="none" opacity="0.4"/></svg>`,

  // FerrLens — "loupe over pixel grid" mark (design bundle logos.html, option 03/Loupe).
  // currentColor on stroke + 25% opacity fill on the grid cells, so the icon
  // adapts to the surrounding text color when no accent is set.
  ferrlensLogo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#1e293b" opacity="0.35"><rect x="2" y="3" width="3" height="3"/><rect x="6" y="3" width="3" height="3"/><rect x="10" y="3" width="3" height="3"/><rect x="14" y="3" width="3" height="3"/><rect x="2" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="2" y="11" width="3" height="3"/><rect x="14" y="11" width="3" height="3"/><rect x="2" y="15" width="3" height="3"/><rect x="6" y="15" width="3" height="3"/><rect x="10" y="15" width="3" height="3"/><rect x="14" y="15" width="3" height="3"/></g><circle cx="19" cy="19" r="8" stroke="#14b8a6" stroke-width="2" fill="none"/><line x1="25" y1="25" x2="30" y2="30" stroke="#14b8a6" stroke-width="2" stroke-linecap="square"/></svg>`,

  // Layout & overview
  overview: stroke(
    `<rect x="3" y="3" width="7" height="10" rx="1.5"/><rect class="fi-pop" x="14" y="3" width="7" height="6" rx="1.5"/><rect x="14" y="13" width="7" height="8" rx="1.5"/><rect x="3" y="17" width="7" height="4" rx="1.5"/>`,
  ),
  products: stroke(
    `<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect class="fi-pop" x="13.5" y="13.5" width="7" height="7" rx="1.5"/>`,
  ),
  list: stroke(
    `<path d="M4.5 6h.01" stroke-width="2.5"/><path d="M4.5 12h.01" stroke-width="2.5"/><path d="M4.5 18h.01" stroke-width="2.5"/><path class="fi-nx" d="M9 6h11"/><path class="fi-nx fi-d2" d="M9 12h11"/><path class="fi-nx fi-d3" d="M9 18h11"/>`,
  ),
  usage: stroke(`<path pathLength="1" class="fi-draw" d="M2.5 12H6l3-8 6 16 3-8h3.5"/>`),
  home: stroke(
    `<path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path pathLength="1" class="fi-draw" d="M10 20.5v-6h4v6"/>`,
  ),

  // Org / people
  members: stroke(PEOPLE),
  teams: stroke(
    `<circle cx="8" cy="9" r="3"/><circle class="fi-nx" cx="16" cy="9" r="3"/><path d="M2.5 19a5.5 5.5 0 0 1 11 0"/><path class="fi-nx" d="M15 14.2a5.5 5.5 0 0 1 6.5 4.8"/>`,
  ),
  roles: stroke(`${SHIELD}<path pathLength="1" class="fi-draw" d="m8.5 11.5 2.5 2.5 4.5-4.5"/>`),
  profile: stroke(`<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>`),

  // Audit / activity
  auditLog: stroke(
    `<g class="fi-rewind"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/></g><path d="M12 7.5V12l3 2"/>`,
  ),

  // Billing / commerce
  billing: stroke(
    `<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path pathLength="1" class="fi-draw" d="M6.5 15h4"/>`,
  ),
  tax: stroke(
    `<path d="M19 5 5 19"/><circle class="fi-pop" cx="7" cy="7" r="2.5"/><circle class="fi-pop fi-d2" cx="17" cy="17" r="2.5"/>`,
  ),

  // Security
  sso: stroke(
    `<path d="M14 3.5h4.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H14"/><g class="fi-nx"><path d="M3.5 12h11"/><path d="m10.5 8 4 4-4 4"/></g>`,
  ),
  tokens: stroke(
    `<g class="fi-tilt"><circle cx="8" cy="15.5" r="4.5"/><path d="m11.2 12.3 8.3-8.3"/><path d="m16 7.5 3 3"/></g>`,
  ),
  sessions: stroke(
    `<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8.5 20.5h7"/><path d="M12 17v3.5"/>`,
  ),
  shield: stroke(SHIELD),

  // Vault
  secrets: stroke(
    `<rect x="2.5" y="6.5" width="19" height="11" rx="2.5"/><path class="fi-blink" d="M7.5 12h.01" stroke-width="2.5"/><path class="fi-blink fi-d2" d="M12 12h.01" stroke-width="2.5"/><path class="fi-blink fi-d3" d="M16.5 12h.01" stroke-width="2.5"/>`,
  ),
  environments: stroke(
    `<path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z"/><path class="fi-nd" d="m3.5 12.5 8.5 4.5 8.5-4.5"/><path class="fi-nd fi-d2" d="m3.5 17 8.5 4.5 8.5-4.5"/>`,
  ),
  rotations: stroke(
    `<g class="fi-spin"><path d="M20.5 12a8.5 8.5 0 0 0-14.7-5.8L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M3.5 12a8.5 8.5 0 0 0 14.7 5.8l2.3-2.3"/><path d="M20.5 20.5v-5h-5"/></g>`,
  ),
  kms: stroke(
    `<rect x="4" y="10.5" width="16" height="11" rx="2.5"/><path d="M8 10.5v-3a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>`,
  ),

  // Connect / DevOps
  cli: stroke(
    `<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path class="fi-nx" d="m7 9.5 3 2.5-3 2.5"/><path class="fi-blink" d="M13 15h4"/>`,
  ),
  k8s: stroke(
    `<g class="fi-turn"><path d="M12 2.5 20.5 7.25v9.5L12 21.5l-8.5-4.75v-9.5z"/><circle cx="12" cy="12" r="3"/></g>`,
  ),
  ci: stroke(
    `<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7"/><path pathLength="1" class="fi-draw" d="M18 10.5a6 6 0 0 1-6 6H8.5"/>`,
  ),
  runners: stroke(
    `<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path class="fi-blink" d="M7 7.5h.01" stroke-width="2.5"/><path class="fi-blink fi-d2" d="M7 16.5h.01" stroke-width="2.5"/>`,
  ),

  // Track / issues
  issues: stroke(`${RING}<circle class="fi-pop" cx="12" cy="12" r="2.5"/>`),
  cycles: stroke(
    `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17"/><path class="fi-ny" d="M8 3v4"/><path class="fi-ny" d="M16 3v4"/>`,
  ),
  roadmap: stroke(
    `<circle cx="6" cy="18.5" r="2.5"/><circle cx="18" cy="4.5" r="2.5"/><path pathLength="1" class="fi-draw" d="M8.5 18.5H14a3.5 3.5 0 0 0 0-7h-4a3.5 3.5 0 0 1 0-7h5.5"/>`,
  ),
  triage: stroke(
    `<path class="fi-squeeze" d="M4 6h16"/><path class="fi-squeeze fi-d2" d="M7 12h10"/><path class="fi-squeeze fi-d3" d="M10 18h4"/>`,
  ),
  templates: stroke(
    `<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17"/><path pathLength="1" class="fi-draw" d="M9.5 9.5v11"/>`,
  ),
  prefs: stroke(
    `<path d="M4 7h9"/><path d="M17 7h3"/><circle class="fi-nx" cx="15" cy="7" r="2"/><path d="M4 17h3"/><path d="M11 17h9"/><circle class="fi-nxb" cx="9" cy="17" r="2"/>`,
  ),
  settings: stroke(
    `<g class="fi-turn"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></g>`,
  ),
  search: stroke(`<g class="fi-pop">${LENS}</g>`),
  help: stroke(
    `${RING}<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path class="fi-blink" d="M12 17h.01"/>`,
  ),

  // Admin / staff
  dashboard: stroke(
    `<path d="M4.2 17a9 9 0 1 1 15.6 0"/><path class="fi-needle" d="m12 12.5 3.5-4"/>`,
  ),
  organizations: stroke(
    `<rect x="4" y="3.5" width="10" height="17" rx="1.5"/><path d="M14 10h4.5a1.5 1.5 0 0 1 1.5 1.5v9h-6"/><path d="M8 8h2"/><path d="M8 12h2"/><path d="M8 16h2"/>`,
  ),
  users: stroke(PEOPLE),
  installs: stroke(
    `<g class="fi-nd"><path d="M12 3.5v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/></g><path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>`,
  ),
  changelog: stroke(
    `<circle cx="6.5" cy="6" r="2.5"/><circle cx="6.5" cy="18" r="2.5"/><path d="M6.5 8.5v7"/><path pathLength="1" class="fi-draw" d="M12.5 6H20"/><path pathLength="1" class="fi-draw fi-d2" d="M12.5 18H18"/>`,
  ),

  workflows: stroke(
    `<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect class="fi-pop fi-d3" x="15" y="15" width="6" height="6" rx="1.5"/><path pathLength="1" class="fi-draw" d="M9 6h5a4 4 0 0 1 4 4v5"/>`,
  ),
  // Fleet / agents
  fleet: stroke(
    `<circle cx="12" cy="5.5" r="2.5"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path pathLength="1" class="fi-draw" d="M10.8 7.7 6.7 15.3"/><path pathLength="1" class="fi-draw" d="m13.2 7.7 4.1 7.6"/><path pathLength="1" class="fi-draw" d="M8 17.5h8"/>`,
  ),
  agents: stroke(
    `<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><path class="fi-wink" d="M9 13v2"/><path class="fi-wink" d="M15 13v2"/>`,
  ),
  queue: stroke(
    `<rect x="4" y="4" width="16" height="6" rx="1.5"/><path class="fi-ny" d="M4 14.5h16"/><path class="fi-ny fi-d2" d="M4 19.5h16"/>`,
  ),
  runs: stroke(`${RING}<path class="fi-nx" d="M10 8.5v7l5.5-3.5z"/>`),
  catalog: stroke(
    `<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  ),
  tools: stroke(
    `<path class="fi-tilt" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  ),
  datasets: stroke(
    `<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path pathLength="1" class="fi-draw" d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>`,
  ),
  spend: stroke(
    `${RING}<g class="fi-pop"><path d="M14.5 10a2 2 0 0 0-2-2h-1a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-1a2 2 0 0 1-2-2"/><path d="M12 6v2"/><path d="M12 16v2"/></g>`,
  ),
  incidents: stroke(ALERT),

  // Vault extras
  vault: stroke(
    `<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><g class="fi-rewind"><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5v2"/></g>`,
  ),
  access: stroke(
    `<rect x="4" y="10.5" width="16" height="11" rx="2.5"/><path class="fi-ny" d="M8 10.5v-3a4 4 0 0 1 7.7-1.5"/>`,
  ),

  // Track / inbox
  inbox: stroke(
    `<path d="M21.5 12H16l-2 3h-4l-2-3H2.5"/><path d="M5.5 5.1 2.5 12v6a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-6l-3-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z"/>`,
  ),
  myIssues: stroke(`${RING}<circle cx="12" cy="10" r="2.5"/><path d="M7.5 17.5a5 5 0 0 1 9 0"/>`),
  subscribed: stroke(
    `<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle class="fi-pop" cx="12" cy="12" r="2.5"/>`,
  ),
  bell: stroke(
    `<g class="fi-ring"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></g>`,
  ),
  docs: stroke(FILE),

  // Growth / sites
  pages: stroke(
    `<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18"/><path class="fi-blink" d="M6.5 6.5h.01" stroke-width="2.5"/>`,
  ),
  forms: stroke(
    `<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path pathLength="1" class="fi-draw" d="M7.5 9.5h9"/><path pathLength="1" class="fi-draw fi-d2" d="M7.5 14h5"/>`,
  ),
  abTest: stroke(
    `<path d="M3 12h5.5l4-5H21"/><path d="m8.5 12 4 5H21"/><path class="fi-nx" d="m18 4 3 3-3 3"/><path class="fi-nx fi-d2" d="m18 14 3 3-3 3"/>`,
  ),
  analytics: stroke(
    `<path d="M3.5 20.5h17"/><path class="fi-grow" d="M7 16.5v-4"/><path class="fi-grow fi-d2" d="M12 16.5V6"/><path class="fi-grow fi-d3" d="M17 16.5v-7"/>`,
  ),
  blog: stroke(
    `<g class="fi-tilt"><path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></g>`,
  ),
  seo: stroke(`${LENS}<path pathLength="1" class="fi-draw" d="m8.5 11.2 1.8 1.8 3.2-3.5"/>`),
  funnels: stroke(`<path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/>`),
  quotes: stroke(
    `${FILE}<path pathLength="1" class="fi-draw" d="M9 13h6"/><path pathLength="1" class="fi-draw fi-d2" d="M9 17h4"/>`,
  ),
  emails: stroke(ENVELOPE),
  domains: stroke(
    `${RING}<path d="M3.5 12h17"/><path d="M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z"/>`,
  ),
  integrations: stroke(
    `<g class="fi-ny"><path d="M9 8V2.5"/><path d="M15 8V2.5"/><path d="M6 8h12v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z"/></g><path d="M12 17v4.5"/>`,
  ),

  // FerrGames admin
  players: stroke(
    `<g class="fi-tilt"><rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 12.5h3"/><path d="M8.5 11v3"/><path d="M15.5 12.5h.01" stroke-width="2.5"/></g>`,
  ),
  rooms: stroke(
    `<path d="M6 20.5V5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 5v15.5"/><path d="M3.5 20.5h17"/><path class="fi-blink" d="M14.5 12h.01" stroke-width="2.5"/>`,
  ),
  shop: stroke(`<path d="M5.5 8h13l1 12.5h-15z"/><path class="fi-ny" d="M9 8V7a3 3 0 0 1 6 0v1"/>`),
  geo: stroke(
    `<g class="fi-ny"><path d="M19.5 10c0 5-7.5 11.5-7.5 11.5S4.5 15 4.5 10a7.5 7.5 0 0 1 15 0z"/><circle cx="12" cy="10" r="2.5"/></g>`,
  ),
  dictionaries: stroke(
    `<path d="M5 19.5V5a2 2 0 0 1 2-2h12v14H7a2 2 0 0 0 0 4h12"/><path pathLength="1" class="fi-draw" d="M9.5 7.5h5"/>`,
  ),

  // Generic toolkit
  zap: stroke(`<path class="fi-flash" d="M13 2.5 4.5 13.5H11l-1 8 9.5-11H13z"/>`),
  sparkles: stroke(
    `<path d="M10 4.5 11.8 9.7 17 11.5l-5.2 1.8L10 18.5l-1.8-5.2L3 11.5l5.2-1.8z"/><g class="fi-pop"><path d="M18.5 3v4"/><path d="M16.5 5h4"/></g>`,
  ),
  bookmark: stroke(`<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/>`),
  circleSlash: stroke(`${RING}<path d="m6 6 12 12"/>`),
  mail: stroke(ENVELOPE),
  dns: stroke(
    `<rect x="9" y="3" width="6" height="5" rx="1.5"/><rect x="3" y="16" width="6" height="5" rx="1.5"/><rect x="15" y="16" width="6" height="5" rx="1.5"/><path d="M12 8v4"/><path pathLength="1" class="fi-draw" d="M6 16v-2.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5V16"/>`,
  ),
  arrowRight: stroke(
    `<g class="fi-nx"><path d="M4.5 12h15"/><path d="m13 5.5 6.5 6.5-6.5 6.5"/></g>`,
  ),
} as const;

export type IconName = keyof typeof icons;
