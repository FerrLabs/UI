/**
 * Password strength scoring — placeholder heuristic.
 *
 * This is intentionally a naive length + character-class check. When we wire
 * real UX, swap in `zxcvbn-ts` (lazy-loaded) and reuse the same public API.
 */

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface StrengthResult {
  score: StrengthScore;
  feedback: string[];
}

export async function checkPasswordStrength(
  password: string,
  _userInputs: string[] = [],
): Promise<StrengthResult> {
  if (!password) {
    return { score: 0, feedback: [] };
  }

  let score = 0;
  const feedback: string[] = [];

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (classes >= 3) score += 1;
  if (password.length >= 16 && classes >= 3) score += 1;

  if (password.length < 8) {
    feedback.push('Use at least 8 characters.');
  } else if (password.length < 12) {
    feedback.push('Longer passwords are stronger — aim for 12+ characters.');
  }
  if (classes < 3) {
    feedback.push('Mix upper, lower, digits, and symbols.');
  }

  return { score: clampScore(score), feedback };
}

export function labelForScore(score: StrengthScore): { label: string; color: string } {
  switch (score) {
    case 0:
      return { label: 'Too weak', color: '#ef4444' };
    case 1:
      return { label: 'Weak', color: '#f97316' };
    case 2:
      return { label: 'Fair', color: '#eab308' };
    case 3:
      return { label: 'Strong', color: '#22c55e' };
    case 4:
      return { label: 'Very strong', color: '#16a34a' };
  }
}

function clampScore(score: number): StrengthScore {
  if (score <= 0) return 0;
  if (score >= 4) return 4;
  return score as StrengthScore;
}
