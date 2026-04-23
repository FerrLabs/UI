// Wrapper around `@zxcvbn-ts/core` that lazy-loads the dictionary bundles on
// first use. zxcvbn's common + English wordlist weighs ~80 KB parsed — we
// don't want to pay that on every route, only when a user actually types a
// password.
//
// The returned shape is intentionally small: a 0..4 score plus a short
// actionable feedback string. Everything else zxcvbn reports (crack-time
// estimates, match sequences) is swallowed — it's useful for debugging but
// clutters the UI.

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export interface StrengthResult {
  score: StrengthScore;
  feedback: string[];
}

type ZxcvbnFn = (password: string, userInputs?: string[]) => {
  score: number;
  feedback: { warning: string; suggestions: string[] };
};

let zxcvbnFn: ZxcvbnFn | null = null;
let loadPromise: Promise<ZxcvbnFn> | null = null;

async function loadZxcvbn(): Promise<ZxcvbnFn> {
  if (zxcvbnFn) return zxcvbnFn;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const [core, common, en] = await Promise.all([
      import('@zxcvbn-ts/core'),
      import('@zxcvbn-ts/language-common'),
      import('@zxcvbn-ts/language-en'),
    ]);
    core.zxcvbnOptions.setOptions({
      translations: en.translations,
      graphs: common.adjacencyGraphs,
      dictionary: {
        ...common.dictionary,
        ...en.dictionary,
      },
    });
    zxcvbnFn = ((password: string, userInputs?: string[]) =>
      core.zxcvbn(password, userInputs)) as ZxcvbnFn;
    return zxcvbnFn;
  })();
  return loadPromise;
}

export async function checkPasswordStrength(
  password: string,
  userInputs: string[] = [],
): Promise<StrengthResult> {
  if (!password) {
    return { score: 0, feedback: [] };
  }
  const fn = await loadZxcvbn();
  const result = fn(password, userInputs);
  const feedback: string[] = [];
  if (result.feedback.warning) feedback.push(result.feedback.warning);
  // Trim suggestions to one line — the UI only renders a single hint.
  if (result.feedback.suggestions.length > 0) {
    feedback.push(result.feedback.suggestions[0]);
  }
  const clamped = Math.max(0, Math.min(4, result.score)) as StrengthScore;
  return { score: clamped, feedback };
}

const LABELS: Record<StrengthScore, { label: string; color: string }> = {
  0: { label: 'Very weak', color: '#dc2626' }, // red-600
  1: { label: 'Weak', color: '#ea580c' }, // orange-600
  2: { label: 'Fair', color: '#ca8a04' }, // yellow-600
  3: { label: 'Strong', color: '#16a34a' }, // green-600
  4: { label: 'Very strong', color: '#15803d' }, // green-700
};

export function labelForScore(score: StrengthScore): { label: string; color: string } {
  return LABELS[score];
}
