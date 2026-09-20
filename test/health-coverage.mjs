import assert from 'node:assert/strict';
import { simulate } from '../src/calc.js';
import { exampleState, sanitise, encodeState, decodeState } from '../src/state.js';
import { RATES } from '../src/rates.js';
import { actionPlan } from '../src/rules.js';

const plan = exampleState();
plan.currentYear = 2026;
plan.household.property = null;
plan.household.spending = { housing: 0, childCosts: 0, other: 1000, buffer: 0 };
Object.assign(plan.assumptions, { pensionPolicy: 'ignore', bufferYears: 0,
  spendingGrowth: 0, realReturn: 0, cashRealReturn: 0, planToAge: 90 });
Object.assign(plan.persons[0], { birthYear: 1960, healthCoveredAfterFi: false,
  healthCoverageFromYear: null, yearsWorkedEstonia: null, pillar1Units: null,
  assets: { cash: 2000000 }, income: { grossMonthly: 0, netMonthly: 4000 } });
const premium = 12 * RATES.healthInsurance.voluntaryMonthly;
const unknown = simulate(plan);
assert.equal(unknown.timeline.yearsToFi, 0);
assert.equal(unknown.spending.ongoingHealthAnnual, premium);
assert.equal(unknown.fi.perpetualSpending, 12000 + premium);
assert.ok(unknown.schedule.every((row) => row.health === premium), 'age alone never ends premiums');
assert.equal(unknown.spending.healthBridgeCost, unknown.schedule.length * premium);

plan.persons[0].healthCoverageFromYear = 2028.5;
const dated = simulate(plan);
assert.equal(dated.schedule.find((r) => r.year === 2028).health, premium / 2);
assert.ok(dated.schedule.filter((r) => r.year >= 2029).every((r) => r.health === 0));
assert.equal(dated.spending.healthBridgeCost, 2.5 * premium);
assert.equal(dated.spending.ongoingHealthAnnual, 0);
assert.equal(sanitise(decodeState(encodeState(plan))).persons[0].healthCoverageFromYear, 2028.5);
for (const policy of ['ignore', 'ownPots', 'all']) {
  plan.assumptions.pensionPolicy = policy;
  const r = simulate(plan);
  assert.deepEqual(r.schedule.map((row) => row.health), dated.schedule.map((row) => row.health));
}
plan.assumptions.stateCountedShare = 0;
assert.deepEqual(simulate(plan).schedule.map((row) => row.health), dated.schedule.map((row) => row.health));
const pair = structuredClone(plan);
pair.persons.push({ ...structuredClone(pair.persons[0]), name: 'Person2', healthCoverageFromYear: null });
const two = simulate(pair);
assert.equal(two.schedule.find((r) => r.year === 2028).health, 1.5 * premium);
assert.equal(two.schedule.find((r) => r.year === 2029).health, premium);
assert.equal(two.spending.ongoingHealthAnnual, premium);
plan.persons[0].healthCoveredAfterFi = true;
assert.ok(simulate(plan).schedule.every((r) => r.health === 0));
plan.persons[0].healthCoveredAfterFi = false;
plan.persons[0].healthCoverageFromYear = 2020;
assert.equal(simulate(plan).spending.healthAtFi, 0);
delete plan.persons[0].healthCoverageFromYear;
assert.equal(sanitise(plan).persons[0].healthCoverageFromYear, null, 'legacy missing date remains unknown');
for (const invalid of ['', 'invalid', 0, 1800, 2300]) {
  plan.persons[0].healthCoverageFromYear = invalid;
  assert.equal(sanitise(plan).persons[0].healthCoverageFromYear, null);
}
const adviceInput = structuredClone(pair);
Object.assign(adviceInput.persons[0], { birthYear: 1963, healthInsurance: false,
  income: { grossMonthly: 0, netMonthly: null } });
Object.assign(adviceInput.persons[1], { birthYear: 1970, healthInsurance: false,
  income: { grossMonthly: 3000, netMonthly: null } });
const advice = actionPlan(simulate(adviceInput), adviceInput);
const possible = advice.find(f => f.id === 'dependent-spouse-cover');
assert.ok(possible, 'near-pension-age partner route is offered for investigation');
assert.equal(possible.value, 'Eligibility not confirmed');
assert.ok(!possible.title.includes('is covered'));
const gap = advice.find(f => f.id === 'health-insurance-gap');
assert.ok(gap, 'possible partner route never hides unconfirmed coverage');
assert.ok(gap.detail.includes('without receiving unemployment benefit'));
assert.ok(!gap.detail.includes('Registration alone is not enough'));
adviceInput.persons[0].healthInsurance = true;
assert.ok(!actionPlan(simulate(adviceInput), adviceInput).some(f => f.id === 'health-insurance-gap'),
  'confirmed current coverage suppresses the current-gap warning');
console.log('Healthcare: coverage timing, policy independence and unconfirmed-partner advice checks passed');
