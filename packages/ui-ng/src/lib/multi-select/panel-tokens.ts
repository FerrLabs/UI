const INHERITED_TOKENS = [
  '--flr-bg',
  '--flr-rule',
  '--flr-accent',
  '--flr-accent-ink',
  '--flr-font-sans',
  '--font-sans',
  '--color-card',
  '--color-ink',
  '--color-ink-3',
  '--color-accent',
  '--color-on-accent',
  '--color-rule-strong',
] as const;

export function inheritedTokens(element: HTMLElement): Record<string, string> {
  const style = getComputedStyle(element);
  const tokens: Record<string, string> = { color: style.color };
  for (const name of INHERITED_TOKENS) {
    const value = style.getPropertyValue(name).trim();
    if (value) tokens[name] = value;
  }
  return tokens;
}
