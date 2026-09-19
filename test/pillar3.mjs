import assert from 'node:assert/strict';
import { pillar3, pillarProjection, simulate } from '../src/calc.js';
import { exampleState, sanitise, encodeState, decodeState } from '../src/state.js';

for (const [salary, paid, deduction, refund] of [
  [36000, 5400, 5400, 1188], [36000, 12000, 5400, 1188],
  [60000, 12000, 6000, 1320], [6000, 12000, 900, 0],
  [0, 12000, 0, 0], [36000, 0, 0, 0],
]) {
  const p = pillar3(salary, paid);
  assert.equal(p.contribution, paid);
  assert.equal(p.deductible, deduction);
  assert.equal(p.refund, refund);
}
assert.equal(pillar3(36000).contribution, 5400, 'omitted payment still models the allowance');

const projection = (paid, salary = 3000) => pillarProjection({
  birthYear: 1986, currentYear: 2026, workUntilAge: 50,
  grossMonthly: salary, realReturn: 0, pillar3Annual: paid,
});
assert.equal(projection(12000).pot3, 120000);
assert.equal(projection(12000).pot3 - projection(5400).pot3, 66000);
assert.equal(projection(12000, 0).pot3, 120000, 'payments without salary are still invested');
assert.equal(projection(12000).netCostAnnual - projection(5400).netCostAnnual, 6600);

const plan = exampleState();
plan.persons[0].income.grossMonthly = 3000;
plan.persons[0].pillar3Annual = 5400;
const low = simulate(plan);
plan.persons[0].pillar3Annual = 12000;
const high = simulate(plan);
assert.equal(high.savings.pillar3NetCost - low.savings.pillar3NetCost, 6600);
assert.ok(Math.abs(low.savings.surplusNow - high.savings.surplusNow - 6600) < 1e-8);
assert.ok(Math.abs(low.savings.surplusAfterMove - high.savings.surplusAfterMove - 6600) < 1e-8);
assert.equal(sanitise(JSON.parse(JSON.stringify(plan))).persons[0].pillar3Annual, 12000);
assert.equal(sanitise(decodeState(encodeState(plan))).persons[0].pillar3Annual, 12000);
console.log('Pillar III payment, deduction, projection, cash-flow and round-trip checks passed');
