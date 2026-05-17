/**
 * @ferrlabs/ui — single React UI package for FerrLabs product apps.
 *
 * Three subpaths:
 *   - `@ferrlabs/ui/primitives` — generic primitives (Field, Input, Modal, …)
 *   - `@ferrlabs/ui/react`      — composed components (Shell, OrgDropdown, …)
 *   - `@ferrlabs/ui/auth`       — auth helpers (LoginForm)
 *
 * The top-level `.` export re-exports primitives flat, plus `ReactComposed`
 * and `Auth` namespaces for the other two layers (avoids name collisions
 * like `Spinner` / `Footer` that exist in both layers). Most consumers
 * should import directly from a subpath rather than the top-level.
 *
 * Tracked under UI#105 (8 → 3 packages consolidation).
 */
export * from './primitives.js';
export * as ReactComposed from './react.js';
export * as Auth from './auth.js';
