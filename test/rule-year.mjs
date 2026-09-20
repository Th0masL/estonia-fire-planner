import assert from 'node:assert/strict';
import { RATES, ruleYearStatus } from '../src/rates.js';
const before = JSON.stringify(RATES);
for (const year of [RATES.year - 1, RATES.year, RATES.year + 1, RATES.year + 20]) {
  const status = ruleYearStatus(year);
  assert.equal(status.mismatch, year !== RATES.year);
  assert.equal(status.ruleYear, RATES.year);
  assert.equal(status.baselineReview, RATES.lastVerified);
  assert.ok(status.message.includes(`Projection starts in ${year}.`));
  assert.ok(status.message.includes(`Loaded rule set: ${RATES.year}.`));
  assert.equal(status.message.includes('not been established here'), year !== RATES.year);
}
assert.equal(JSON.stringify(RATES), before);
for (const year of [NaN, Infinity, 2026.5, '2026']) assert.throws(() => ruleYearStatus(year), RangeError);
console.log('Rule-year disclosure: past/current/future dates never mutate or re-verify loaded rules');
