import assert from 'node:assert/strict';
import { simulate, pensionStressFactor } from '../src/calc.js';
import { blankState } from '../src/state.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} vs ${b}`);
const stress = { badYears: 1, badReturn: -.1, crash: .2 };
near(pensionStressFactor(2026.5, 2026.5, .05, stress), .8);
near(pensionStressFactor(2026.5, 2026.75, .05, stress), .8 * (.9 / 1.05) ** .25);
near(pensionStressFactor(2026.5, 2030, .05, stress), .8 * (.9 / 1.05) ** .5);
near(pensionStressFactor(2026.5, 2026, .05, stress), 1);
near(pensionStressFactor(2026, 2030, .05), 1);

const plan = blankState();
plan.currentYear = 2026;
Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1960,
  healthCoveredAfterFi: true, assets: { cash: 81000, pillar2: 120000 },
  income: { grossMonthly: 0, netMonthly: 0 }, fundPensionYears: 20 });
plan.household.spending.other = 1000;
Object.assign(plan.assumptions, { realReturn: 0, cashRealReturn: 0,
  pensionPolicy: 'ownPots', portfolioEnd: 'drawdown', planToAge: 75,
  bufferYears: 0, spendingGrowth: 0, potsCountedShare: 1 });
let result = simulate(plan);
near(result.timeline.yearsToFi, 0);
// Nine years × (12k spending - 6k × (1-crash)) = 81k at a 50% crash.
near(result.fi.resilience.crash, .5);
assert.equal(result.fi.resilience.flatAll, true);
const survivesBear = (n) => {
  let cash = 81000;
  for (let year = 0; year < 9; year++) {
    cash -= 12000 - 6000 * .9 ** Math.min(year, n);
    if (cash < -1e-6) return false;
  }
  return true;
};
let tolerated = 0;
while (tolerated < 9 && survivesBear(tolerated + 1)) tolerated++;
assert.equal(result.fi.resilience.bearYears, tolerated);
near(result.schedule[0].fromPots, 6000); // Stress never alters the base schedule.

plan.assumptions.pillarPayout = 'lumpSum';
plan.persons[0].assets = { cash: 0, pillar2: 200000 };
for (const investedShare of [0, .5, 1]) {
  plan.assumptions.pensionLumpSumInvestedShare = investedShare;
  result = simulate(plan);
  // 180k net × (1-crash) = 108k spending. Shock happens before receipt,
  // even when proceeds then become cash; invested proceeds are not hit twice.
  near(result.fi.resilience.crash, .4);
  near(result.schedule[0].lumpNet, 180000);
}
plan.persons[0].birthYear = 1971;
plan.persons[0].assets.cash = 140000;
plan.assumptions.pensionLumpSumInvestedShare = 0;
result = simulate(plan);
assert.ok(result.fi.lumpSums[0].date > 2026);
near(result.fi.resilience.crash, (140000 + 180000 - 240000) / 180000);
const untilReceipt = result.fi.lumpSums[0].date - 2026;
let futureBearYears = 0;
while (futureBearYears < 20 &&
  140000 + 180000 * .9 ** Math.min(untilReceipt, futureBearYears + 1) >= 240000) futureBearYears++;
assert.equal(result.fi.resilience.bearYears, futureBearYears);
// Pension money cannot be protected from pre-receipt market losses merely by
// choosing to hold cash after receipt. Ordinary cash remains outside the shock.
plan.persons[0].assets = { cash: 400000, pillar2: 0 };
result = simulate(plan);
near(result.fi.resilience.crash, .95);
assert.equal(result.fi.resilience.bearAll, true);
console.log('Shared pension stress reconciles fund payments, future/immediate lump sums and cash isolation');
