import assert from 'node:assert/strict';
import { pensionServicePerYear, pillar1Monthly, simulate } from '../src/calc.js';
import { exampleState } from '../src/state.js';
import { RATES } from '../src/rates.js';
import { actionPlan } from '../src/rules.js';

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
  const warnings = actionPlan(result, plan).filter((f) => f.id.startsWith('pension-contributions-unverified-'));
  assert.equal(warnings.length, gross < minimum ? 1 : 0);
  if (warnings.length) assert.ok(warnings[0].detail.includes('not inferred'));
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
// Previously the provisional date granted four early years, then the final
// date left only 34.85 years of service (less than the required 35).
const boundary = exampleState();
Object.assign(boundary.assumptions, {
  pensionPolicy: 'all', portfolioEnd: 'drawdown', statePensionEarlyYears: 5,
});
Object.assign(boundary.persons[0], {
  yearsWorkedEstonia: 12.5, pillar1Units: 20, healthCoveredAfterFi: false,
});
// Unconfirmed healthcare now delays FI, so the formerly invalid four-year
// choice may become valid. Assert the entitlement, not the old exact date.
const boundaryPerson = simulate(boundary).persons[0];
assert.ok(boundaryPerson.yearsWorkedAtFi >= 15 + 5 * boundaryPerson.statePensionEarlyYears);

for (const mode of ['perpetual', 'drawdown']) {
  for (const count of [1, 2]) {
    for (const service of [0, 12.5, 19.99, 20, 24.99, 25, 29.99, 30, 34.99, 35, 39.99, 40]) {
      const plan = structuredClone(boundary);
      plan.assumptions.portfolioEnd = mode;
      plan.persons[0].yearsWorkedEstonia = service;
      if (count === 2) {
        const second = structuredClone(plan.persons[0]);
        second.name = 'Person2';
        second.birthYear -= 5;
        second.income.grossMonthly = minimum / 24;
        plan.persons.push(second);
      }
      const result = simulate(plan);
      for (const p of result.persons) {
        if (!p.statePensionEarlyYears) continue;
        const years = Math.max(0, Math.min(result.timeline.yearsToFi,
          p.statePensionYear - (plan.currentYear || RATES.year)));
        const available = p.yearsWorkedSoFar + years * p.estimatedServicePerYear;
        assert.ok(available >= 15 + 5 * p.statePensionEarlyYears,
          `${mode}, ${count} people, ${service} accrued: final early pension must be eligible`);
        assert.equal(p.statePensionYear, p.statePensionStandardYear - p.statePensionEarlyYears);
      }
    }
  }
}
console.log('Pension service and final early-pension boundary checks passed');
