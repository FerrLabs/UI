import { useEffect, useState } from 'react';
import {
  checkPasswordStrength,
  labelForScore,
  type StrengthResult,
  type StrengthScore,
} from '../lib/passwordStrength.js';

interface Props {
  password: string;
  /// Extra strings the strength meter should penalise — the user's email
  /// local-part, display name, etc. Using any of them as the password tanks
  /// the score.
  userInputs?: string[];
}

/// 4-segment strength bar + one-line hint. Lazy-loads zxcvbn on first render
/// with a password. Scored 0..4 where 3+ is considered acceptable — callers
/// typically gate their submit button on the returned score via
/// `onScoreChange`. Kept presentational: this component doesn't own state
/// beyond the async score lookup.
export default function PasswordStrengthBar({
  password,
  userInputs = [],
  onScoreChange,
}: Props & { onScoreChange?: (score: StrengthScore) => void }) {
  const [result, setResult] = useState<StrengthResult>({ score: 0, feedback: [] });

  useEffect(() => {
    let cancelled = false;
    if (!password) {
      setResult({ score: 0, feedback: [] });
      onScoreChange?.(0);
      return;
    }
    checkPasswordStrength(password, userInputs).then((r) => {
      if (cancelled) return;
      setResult(r);
      onScoreChange?.(r.score);
    });
    return () => {
      cancelled = true;
    };
    // userInputs is an array — join it for dependency comparison so parents
    // don't have to memoise it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, userInputs.join('|')]);

  const { label, color } = labelForScore(result.score);
  const hint = result.feedback[0] ?? '';

  return (
    <div aria-live="polite" className="mt-2">
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={result.score}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded"
            style={{
              backgroundColor: password && i < Math.max(result.score, 1) ? color : '#e5e7eb',
            }}
          />
        ))}
      </div>
      {password && (
        <p className="mt-1 text-xs" style={{ color }}>
          {label}
          {hint ? <span className="text-gray-500"> — {hint}</span> : null}
        </p>
      )}
    </div>
  );
}
