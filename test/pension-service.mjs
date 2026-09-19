import assert from 'node:assert/strict';
import { pensionServicePerYear, pillar1Monthly, simulate } from '../src/calc.js';
import { exampleState } from '../src/state.js';
import { RATES } from '../src/rates.js';

const minimum = RATES.minimumAnnualWageForPension;
for (const [gross, expected] of [[0, 0], [minimum / 2, 0.5], [minimum, 1], [minimum * 3, 1]]) {
  assert.equal(pensionServicePerYear(gross), expected);
}
assert.equal(pillar1Monthly({ grossAnnual: 0, futureYears: 40 }), 0);
assert.equal(pillar1Monthly({ grossAnnual: minimum / 2, futureYears: 29 }), 0);
assert.ok(pillar1Monthly({ grossAnnual: minimum / 2, futureYears: 30 }) > 0);

for (const gross of [0, minimum / 2, minimum, minimum * 3]) {
  const plan = exampleState();
  plan.assumptions.pensionPolicy = 'all';
  plan.assumptions.statePensionEarlyYears = 5;
  const p = plan.persons[0];
  p.income.grossMonthly = gross / 12;
  p.income.netMonthly = 4000; // A net override is cash flow, not contribution evidence.
  p.yearsWorkedEstonia = 0;
  p.pillar1Units = 0;
  p.nationalPensionEligible = false;
  p.healthCoveredAfterFi = true;
  const result = simulate(plan);
  const person = result.persons[0];
  const elapsed = result.timeline.yearsToFi;
  assert.ok(Number.isFinite(elapsed) && elapsed > 0, 'scenario needs future working years');
  assert.ok(Math.abs(person.yearsWorkedAtFi - elapsed * Math.min(1, gross / minimum)) < 1e-8);
  assert.ok(Number.isFinite(person.yearsWorkedAtFi));
  assert.equal(person.estimatedServicePerYear, pensionServicePerYear(gross));
  if (gross === 0) {
    assert.equal(person.yearsWorkedAtFi, 0);
    assert.equal(person.statePensionGross, 0);
    assert.equal(person.statePensionEarlyYears, 0);
  }
  p.yearsWorkedEstonia = 10;
  const accrued = simulate(plan);
  assert.ok(Math.abs(accrued.persons[0].yearsWorkedAtFi -
    (10 + accrued.timeline.yearsToFi * Math.min(1, gross / minimum))) < 1e-8);
  p.yearsWorkedEstonia = null;
  const unknown = simulate(plan).persons[0];
  assert.equal(unknown.yearsWorkedAtFi, null);
  assert.equal(unknown.statePensionGross, 0);
}
console.log('Pension service: zero/partial/full salary, eligibility and net-only income checks passed');
