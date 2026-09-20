import assert from 'node:assert/strict';
import { simulate } from '../src/calc.js';
import { blankState } from '../src/state.js';

const plan = blankState();
plan.currentYear = 2026;
Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1971,
  healthCoveredAfterFi: true,
  // Isolate the no-surplus solver check using an after-tax return bucket.
  investmentDestination: 'brokerage',
  assets: { brokerage: 100000, brokerageCostBasis: 100000 },
  income: { grossMonthly: 0, netMonthly: 1000 } });
plan.household.spending.other = 1000;
Object.assign(plan.assumptions, { realReturn: .05, cashRealReturn: 0,
  pensionPolicy: 'ignore', portfolioEnd: 'drawdown', planToAge: 75,
  bufferYears: 0, spendingGrowth: 0 });

// Independent present-value test at integer retirement dates: withdrawals
// are at the start of each retirement year, savings/deficits at working year end.
const fundedAt = (year, deficit) => {
  const capital = 100000 * 1.05 ** year - deficit * (1.05 ** year - 1) / .05;
  const required = Array.from({ length: 20 - year }, (_, n) => 12000 / 1.05 ** n)
    .reduce((sum, value) => sum + value, 0);
  return capital >= required;
};
for (const income of [1000, 900]) {
  plan.persons[0].income.netMonthly = income;
  assert.equal(fundedAt(5, (1000 - income) * 12), false);
  assert.equal(fundedAt(6, (1000 - income) * 12), true);
  const result = simulate(plan);
  assert.ok(result.timeline.yearsToFi > 5 && result.timeline.yearsToFi < 6);
}
plan.persons[0].income.netMonthly = 0;
assert.equal(simulate(plan).timeline.yearsToFi, Infinity);
plan.persons[0].assets = { cash: 500000 };
assert.equal(simulate(plan).timeline.yearsToFi, 0);
plan.persons[0].assets = { cash: 0 };
assert.equal(simulate(plan).timeline.yearsToFi, Infinity);
console.log('funded FI: zero savings, funded deficits, zero income and unfunded plans passed');
