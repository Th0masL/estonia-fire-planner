import assert from 'node:assert/strict';
import { blankState } from '../src/state.js';
import { simulate } from '../src/calc.js';

const plan = blankState();
plan.currentYear = 2026;
Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1971,
  healthCoveredAfterFi: true,
  investmentDestination: 'brokerage',
  assets: { brokerage: 120000, brokerageCostBasis: 120000 },
  income: { grossMonthly: 0, netMonthly: 1000 } });
plan.household.spending.other = 1000;
Object.assign(plan.assumptions, { realReturn: .05, cashRealReturn: 0,
  pensionPolicy: 'ignore', portfolioEnd: 'drawdown', planToAge: 75,
  bufferYears: 0, spendingGrowth: 0 });
const coast = () => simulate(plan).timeline.coastTo60;
// Independent PV: 15 annual start-of-year withdrawals after five working years.
const required = Array.from({ length: 15 }, (_, n) => 12000 / 1.05 ** n)
  .reduce((sum, value) => sum + value, 0);
for (const income of [1000, 900]) {
  plan.persons[0].income.netMonthly = income;
  const at60 = 120000 * 1.05 ** 5 - (1000 - income) * 12 * (1.05 ** 5 - 1) / .05;
  assert.ok(at60 > required);
  assert.equal(coast().years, 0);
}
plan.persons[0].income.netMonthly = 0;
assert.equal(coast(), null); // Compounding must not hide five years of expenses.

// Cash-only boundary: 5 × 1,200 deficit + 15 × 12,000 retirement = 186,000.
plan.persons[0].income.netMonthly = 900;
plan.persons[0].assets = { cash: 186000 };
assert.equal(coast().years, 0);
plan.persons[0].assets.cash = 185999;
assert.equal(coast(), null);
plan.assumptions.retirementCashReserve = 10000;
plan.persons[0].assets.cash = 196000;
assert.equal(coast().years, 0);
plan.persons[0].assets.cash = 195999;
assert.equal(coast(), null);
plan.persons[0].assets.cash = 500000;
plan.assumptions.planToAge = 60;
assert.equal(coast(), null); // Not a milestone beyond the modeled lifetime.

// Isolate coasting from house completion costs. With a zero-interest 50k loan
// over 2.5 years, the real payments are 20k, 20k/1.02, and 10k/1.02².
// A 1,200 annual lifestyle deficit continues for all five working years.
plan.assumptions.planToAge = 75;
plan.assumptions.retirementCashReserve = 0;
plan.assumptions.inflation = .02;
plan.household.property = { purchase: { price: 60000, deposit: 10000,
  collateralValue: 60000, termYears: 2.5, rate: 0, monthsAway: 0,
  runningCostsMonthly: 0, movingCosts: 0, otherDebtMonthly: 0, paidBy: 0 } };
const completion = simulate(plan).house.cashToComplete;
const boundary = completion + 186000 + 20000 + 20000 / 1.02 + 10000 / 1.02 ** 2;
plan.persons[0].assets.cash = boundary + .01;
assert.equal(coast().years, 0);
plan.persons[0].assets.cash = boundary - 1;
assert.equal(coast(), null);
plan.persons[0].assets.cash = 0;
assert.equal(coast(), null); // An unfunded purchase cannot become CoastFIRE.
console.log('CoastFIRE: zero saving, funded deficits, cash boundary, reserve and horizon passed');
