/// <reference types="node" />
import { assert } from 'vitest';
import { redactText } from './redact-text.js';

const SHRINK = 8;
const MIN_RUNS = 3;
const MAX_RUNS = 12;
const RUN_BUDGET_MILLIS = 40;
const MIN_SAMPLE_MILLIS = 2;
const MAX_SLOWDOWN = 3;
const MAX_COST_MILLIS = 2000;

export type InputBuilder = (count: number) => string;

function cpuMillis(): number {
  const { user, system } = process.cpuUsage();
  return (user + system) / 1000;
}

function sample(input: string, calls: number): number {
  const start = cpuMillis();
  for (let call = 0; call < calls; call++) redactText(input);
  return cpuMillis() - start;
}

function cpuCost(input: string): number {
  let calls = 1;
  let elapsed = sample(input, calls);
  while (elapsed < MIN_SAMPLE_MILLIS) {
    calls *= 2;
    elapsed = sample(input, calls);
  }
  let fastest = elapsed;
  let spent = elapsed;
  for (let run = 1; run < MAX_RUNS && (run < MIN_RUNS || spent < RUN_BUDGET_MILLIS); run++) {
    elapsed = sample(input, calls);
    fastest = Math.min(fastest, elapsed);
    spent += elapsed;
  }
  return fastest / calls;
}

export function assertNearLinear(build: InputBuilder, count: number, shrink = SHRINK): void {
  const large = build(count);
  const small = build(Math.ceil(count / shrink));
  const cost = cpuCost(large);
  const lengthRatio = large.length / small.length;
  assert.isBelow(cost, MAX_COST_MILLIS, 'CPU milliseconds for the large input');
  assert.isBelow(
    cost / cpuCost(small),
    MAX_SLOWDOWN * lengthRatio,
    `cost growth for an input ${lengthRatio.toFixed(1)} times longer`,
  );
}
