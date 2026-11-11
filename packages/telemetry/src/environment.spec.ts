import { describe, expect, it } from 'vitest';
import { environmentFromHostname } from './environment.js';

describe('environmentFromHostname', () => {
  it('maps dev, interne, home and prod hostnames', () => {
    expect(environmentFromHostname('ferrfleet.dev.ferrlabs')).toBe('dev');
    expect(environmentFromHostname('ferrfleet.ferrlabs')).toBe('interne');
    expect(environmentFromHostname('nas.home')).toBe('home');
    expect(environmentFromHostname('app.ferrfleet.com')).toBe('prod');
  });

  it('handles subdomains', () => {
    expect(environmentFromHostname('app.ferrfleet.dev.ferrlabs')).toBe('dev');
    expect(environmentFromHostname('app.ferrfleet.ferrlabs')).toBe('interne');
    expect(environmentFromHostname('grafana.lab.home')).toBe('home');
  });

  it('does not match lookalike suffixes', () => {
    expect(environmentFromHostname('evilferrlabs')).toBe('prod');
    expect(environmentFromHostname('ferrlabs.com')).toBe('prod');
    expect(environmentFromHostname('myhome')).toBe('prod');
  });
});
