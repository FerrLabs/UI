export function markColorOnDark(accent: string): string {
  const hex = accent.trim().replace('#', '');
  if (hex.length !== 3 && hex.length !== 6) return accent;
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 70 ? accent : '#ffffff';
}
