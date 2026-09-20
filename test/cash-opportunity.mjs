import assert from 'node:assert/strict';
import { simulate } from '../src/calc.js';
import { actionPlan } from '../src/rules.js';
import { exampleState } from '../src/state.js';
import { eur } from '../src/format.js';

const plan = exampleState();
plan.household.property = {};
plan.persons = [plan.persons[0]];
plan.persons[0].name = 'Person1';
plan.persons[0].assets.cash = 100000;
const base = simulate(plan);
function finding(inflation, cashRealReturn, reserve = 0, houseReserve = 0, cash = 100000) {
  const sim = structuredClone(base);
  Object.assign(sim.assumptions, { inflation, cashRealReturn, retirementCashReserve: reserve });
  sim.persons[0].assets.cash = cash;
  sim.house = { ...sim.house, totalReserve: houseReserve };
  return actionPlan(sim, plan).find(f => f.id === 'idle-cash');
}
assert.equal(finding(.025, 0), undefined, '2.2% nominal is below 0% real at 2.5% inflation');
assert.equal(finding(.022, 0), undefined, 'equal real returns do not suggest savings');
assert.equal(finding(0, .03), undefined, 'better cash return does not suggest savings');
assert.match(finding(0, 0).value, /€2,200/);
const expected = 100000 * ((1.022 / 1.025 - 1) - (-.02));
assert.ok(finding(.025, -.02).value.includes(eur(expected)), 'exact real conversion, not nominal subtraction');
assert.match(finding(.025, -.02).detail, /before personal tax/);
assert.match(finding(.025, -.02).detail, /unverified August 2026/);
assert.equal(finding(0, 0, 100000), undefined, 'protected cash is not investable surplus');
assert.equal(finding(0, 0, 75000), undefined, 'threshold applies after protection');
assert.match(finding(0, 0, 40000, 60000).value, /€880/, 'overlapping reserves use max, not sum');
assert.equal(finding(0, 0, 0, 0, 25000), undefined);
console.log('Cash opportunity: real units, negative/equal spreads, tax disclosure and reserves passed');
