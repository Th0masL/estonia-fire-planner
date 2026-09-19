import assert from 'node:assert/strict';
import { blankState } from '../src/state.js';
import { simulate } from '../src/calc.js';

const plan = blankState();
plan.currentYear = 2026;
Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1971,
  healthCoveredAfterFi: true, assets: { cash: 50000, pillar2: 400000 },
  income: { grossMonthly: 0, netMonthly: 500 }, fundPensionYears: 30 });
plan.household.spending.other = 1000;
Object.assign(plan.assumptions, { realReturn: 0, cashRealReturn: 0,
  pensionPolicy: 'ownPots', portfolioEnd: 'drawdown', planToAge: 80,
  bufferYears: 0, spendingGrowth: 0, potsCountedShare: 1 });
// The working path exhausts 50k cash after 50/6 years, before the 25-year
// horizon. Nevertheless retiring at year 4 works: 26k remains, funding two
// full years at 12k plus 2k in the first pension year. That year pays
// 400k / 30 × .75 = 10k; subsequent pension years cover all 12k spending.
let result = simulate(plan);
assert.ok(Math.abs(result.timeline.yearsToFi - 4) < 1e-6);
assert.ok(result.schedule.every((row) => row.shortfall <= 1e-6));
assert.equal(result.schedule.find((row) => row.year === 2032).fromPots, 10000);
// A fractional boundary: an extra 1,500 cash advances retirement by 0.25
// years because each working year costs 6k instead of retirement's 12k.
plan.persons[0].assets.cash = 51500;
assert.ok(Math.abs(simulate(plan).timeline.yearsToFi - 3.75) < 1e-6);
plan.assumptions.bufferYears = 1;
assert.ok(Math.abs(simulate(plan).timeline.yearsToFi - 4.75) < 1e-6);
plan.assumptions.bufferYears = 10;
assert.equal(simulate(plan).timeline.yearsToFi, Infinity); // Later is not always safer.
plan.assumptions.bufferYears = 0;
plan.assumptions.pensionPolicy = 'ignore';
assert.equal(simulate(plan).timeline.yearsToFi, Infinity);
console.log('Solver fallback: funded pension window, fractional date, buffer and zero benefits passed');
