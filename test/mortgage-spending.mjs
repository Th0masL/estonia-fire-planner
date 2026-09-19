import assert from 'node:assert/strict';
import { simulate } from '../src/calc.js';
import { exampleState } from '../src/state.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} vs ${b}`);

// Zero inflation isolates real lifestyle growth from nominal conversion.
// A zero-interest €120,000 loan over ten years pays €12,000 annually.
const plan = exampleState();
plan.currentYear = 2026;
plan.household.spending = { housing: 0, other: 0, childCosts: 0, buffer: 0 };
plan.household.property = { purchase: { price: 120000, deposit: 0, collateralValue: 120000,
  rate: 0, termYears: 10, monthsAway: 0, runningCostsMonthly: 0, movingCosts: 0, paidBy: 0 } };
Object.assign(plan.persons[0], { birthYear: 1971, healthCoveredAfterFi: true,
  assets: { cash: 1000000 }, income: { grossMonthly: 4000, netMonthly: 4000 } });
Object.assign(plan.assumptions, { inflation: 0, spendingGrowth: .02, realReturn: 0,
  cashRealReturn: 0, bufferYears: 0, retirementCashReserve: 0, planToAge: 75,
  pensionPolicy: 'ignore', portfolioEnd: 'drawdown', transactionCostRate: 0, emergencyFundMonths: 0 });
const mortgageOnly = simulate(plan);
near(mortgageOnly.timeline.yearsToFi, 0);
near(mortgageOnly.fi.number, 120000);
for (const row of mortgageOnly.schedule) near(row.need, row.year < 2036 ? 12000 : 0);

plan.household.spending.other = 1000;
const mixed = simulate(plan);
for (const row of mixed.schedule) {
  const year = row.year - 2026;
  near(row.need, 12000 * 1.02 ** year + (year < 10 ? 12000 : 0));
}
plan.household.property.purchase.monthsAway = 6;
const midyear = simulate(plan);
near(midyear.timeline.yearsToFi, .5);
near(midyear.schedule[0].need, 12000); // half-year living costs + half-year mortgage
const finalLoanYear = midyear.schedule.find((r) => r.year === 2036);
near(finalLoanYear.need, 12000 * 1.02 ** 9.5 + 6000);
plan.assumptions.spendingGrowth = 0;
const flat = simulate(plan);
near(flat.schedule.find((r) => r.year === 2030).need, 24000);
console.log('Mortgage payments stay fixed while living costs grow; partial and final loan years reconcile');
