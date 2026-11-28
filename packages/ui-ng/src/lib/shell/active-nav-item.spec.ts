import { describe, expect, it } from 'vitest';
import { activeNavItemId } from './active-nav-item';
import type { ShellNavGroup } from './shell.component';

const groups: ShellNavGroup[] = [
  {
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'issues', label: 'Issues', href: '/issues' },
      { id: 'mine', label: 'Mine', href: '/issues?scope=mine' },
      { id: 'mine-open', label: 'Mine open', href: '/issues?scope=mine&state=open' },
      { id: 'nohref', label: 'No href' },
    ],
  },
  { title: 'Other', items: [{ id: 'settings', label: 'Settings', href: '/settings/profile' }] },
];

describe('activeNavItemId', () => {
  it('matches the root item only on exactly "/"', () => {
    expect(activeNavItemId(groups, '/')).toBe('home');
    expect(activeNavItemId(groups, '/unknown')).toBeNull();
  });

  it('matches nested paths by segment prefix', () => {
    expect(activeNavItemId(groups, '/issues/42')).toBe('issues');
  });

  it('does not match a path that only shares a string prefix', () => {
    expect(activeNavItemId(groups, '/issues-archive')).toBeNull();
  });

  it('ignores the fragment', () => {
    expect(activeNavItemId(groups, '/issues#top')).toBe('issues');
  });

  it('requires the target query parameters to be present', () => {
    expect(activeNavItemId(groups, '/issues?scope=other')).toBe('issues');
    expect(activeNavItemId(groups, '/issues?scope=mine')).toBe('mine');
  });

  it('prefers the item with more matching query parameters on the same path', () => {
    expect(activeNavItemId(groups, '/issues?scope=mine&state=open')).toBe('mine-open');
    expect(activeNavItemId(groups, '/issues?state=open&scope=mine&x=1')).toBe('mine-open');
  });

  it('prefers the longest matching path across groups', () => {
    const nested: ShellNavGroup[] = [
      { items: [{ id: 'settings', label: 'S', href: '/settings' }] },
      { items: [{ id: 'profile', label: 'P', href: '/settings/profile' }] },
    ];
    expect(activeNavItemId(nested, '/settings/profile/avatar')).toBe('profile');
    expect(activeNavItemId(nested, '/settings/billing')).toBe('settings');
  });

  it('returns null for empty groups', () => {
    expect(activeNavItemId([], '/issues')).toBeNull();
  });
});
