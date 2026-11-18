import { redactText } from './redact-text.js';

const SHRINK = 4;
const MIN_RUNS = 3;
const MAX_RUNS = 12;
const RUN_BUDGET_MILLIS = 40;
const MIN_SAMPLE_MILLIS = 2;
const MAX_SLOWDOWN = 3;

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

export function assertNearLinear(build: InputBuilder, count: number): void {
  const large = build(count);
  const small = build(Math.ceil(count / SHRINK));
  const growth = cpuCost(large) / cpuCost(small);
  const limit = MAX_SLOWDOWN * (large.length / small.length);
  if (growth >= limit) {
    throw new Error(
      `cost grew ${growth.toFixed(1)} times for an input ${(large.length / small.length).toFixed(1)} times longer, limit ${limit.toFixed(1)}`,
    );
  }
}
