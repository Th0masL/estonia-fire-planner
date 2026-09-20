import assert from 'node:assert/strict';
import { accumulationStep, retirementStep, portfolioTotal, simulate } from '../src/calc.js';
import { exampleState, sanitise, encodeState, decodeState } from '../src/state.js';
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} vs ${expected}`);

const cashDeficit = accumulationStep([{ cash: 20000, invested: 100000 }], -12000, 1, 0, .05, [1]);
near(cashDeficit[0].cash, 8000);
near(cashDeficit[0].invested, 105000);
near(cashDeficit.shortfall, 0);
const mixedDeficit = accumulationStep([{ cash: 6000, invested: 10000 }], -12000, 1.5, 0, 0, [1]);
near(portfolioTotal(mixedDeficit), 0);
near(mixedDeficit.shortfall, 2000);
const noRecovery = accumulationStep(mixedDeficit, 100000, 10, 0, .05, [1]);
near(noRecovery.shortfall, 2000);
near(portfolioTotal(noRecovery), 0);
const sharedDeficit = accumulationStep([{ cash: 9000, invested: 20000 }, { cash: 3000, invested: 60000 }],
  -20000, 1, 0, 0, [.5, .5]);
near(sharedDeficit[0].cash, 0);
near(sharedDeficit[1].cash, 0);
near(sharedDeficit[0].invested, 18000);
near(sharedDeficit[1].invested, 54000);
const partialDeficit = accumulationStep([{ cash: 20000, invested: 0 }], -12000, .5, 0, .05, [1]);
near(partialDeficit[0].cash, 14000);
near(partialDeficit[0].invested, 0);

for (const [cash, invested, reserve, expectedCash, expectedInvested] of [
  [800000, 0, 0, 776000, 0], [40000, 760000, 0, 16000, 798000],
  [10000, 790000, 0, 0, 814800], [40000, 760000, 20000, 20000, 793800],
]) {
  const r = retirementStep([{ cash, invested }], 24000, 1, 0, .05, reserve);
  near(r.balances[0].cash, expectedCash);
  near(r.balances[0].invested, expectedInvested);
  near(r.shortfall, 0);
  near(portfolioTotal(r.balances), cash + invested - 24000 + r.cashGrowth + r.investmentGrowth);
}
const protectedOnly = retirementStep([{ cash: 20000, invested: 0 }], 1000, 1, 0, .05, 20000);
near(protectedOnly.shortfall, 1000);
near(protectedOnly.balances[0].cash, 20000);
const erosion = retirementStep([{ cash: 20000, invested: 100000 }], 0, 1, -.02, 0, 20000);
near(erosion.balances[0].cash, 20000);
near(erosion.balances[0].invested, 99600);
const partial = retirementStep([{ cash: 40000, invested: 100000 }], 12000, .5, 0, .05, 20000);
near(partial.balances[0].cash, 28000);
near(partial.balances[0].invested, 100000 * Math.sqrt(1.05));
const owners = retirementStep([{ cash: 30000, invested: 100000 }, { cash: 10000, invested: 300000 }],
  24000, 1, 0, 0, 20000);
near(owners.balances[0].cash, 15000);
near(owners.balances[1].cash, 5000);
near(owners.balances[0].invested, 99000);
near(owners.balances[1].invested, 297000);

const plan = exampleState();
plan.currentYear = 2026;
plan.household.property = null;
plan.household.spending = { housing: 0, childCosts: 0, other: 2000, buffer: 0 };
Object.assign(plan.assumptions, { pensionPolicy: 'ignore', portfolioEnd: 'drawdown',
  planToAge: 60, bufferYears: 0, realReturn: .05, cashRealReturn: 0, retirementCashReserve: 20000 });
Object.assign(plan.persons[0], { birthYear: 1986, healthCoveredAfterFi: true,
  assets: { cash: 800000 }, income: { grossMonthly: 4000, netMonthly: 3000 } });
const r = simulate(plan);
near(r.timeline.yearsToFi, 0);
near(r.schedule[0].closing, 776000);
near(r.fi.number, 500000); // 20 × 24,000 spendable + 20,000 protected.
near(r.fi.numberAt4pct, 620000); // The separate perpetual heuristic also excludes protected cash.
assert.ok(r.schedule.every((row) => row.cash >= 20000 && row.investments === 0 && row.shortfall === 0));
assert.equal(r.fi.resilience.bearAll, true, 'market losses cannot shrink cash');
near(r.fi.resilience.crash, .95);
const without = structuredClone(plan);
without.assumptions.retirementCashReserve = 0;
near(simulate(without).fi.number, 480000);
plan.persons[0].assets.cash = 20000;
plan.persons[0].income.netMonthly = 0;
assert.equal(simulate(plan).timeline.yearsToFi, Infinity, 'protected cash alone cannot fund retirement');

plan.persons[0].income.netMonthly = 3000;
plan.persons[0].assets = { cash: 100000, investmentAccount: 200000, investmentAccountContributions: 200000 };
plan.household.property = { purchase: { price: 60000, deposit: 60000, collateralValue: 60000,
  termYears: 20, rate: 0, monthsAway: 0, runningCostsMonthly: 0, movingCosts: 0, paidBy: 0 } };
plan.assumptions.transactionCostRate = 0;
plan.assumptions.emergencyFundMonths = 10;
plan.assumptions.planToAge = 50;
const house = simulate(plan);
near(house.schedule[0].openingCash, 40000);
near(house.schedule[0].openingInvestments, 200000);
near(house.schedule[0].opening, 240000); // House reserve and FIRE reserve are the same cash.
near(house.schedule[0].cash, 20000);
for (const restored of [sanitise(plan), sanitise(JSON.parse(JSON.stringify(plan))),
  sanitise(decodeState(encodeState(plan)))]) assert.equal(restored.assumptions.retirementCashReserve, 20000);
delete plan.assumptions.retirementCashReserve;
assert.equal(sanitise(plan).assumptions.retirementCashReserve, 0);
for (const cashReturn of [-.02, 0, .01]) {
  const mixed = structuredClone(plan);
  mixed.persons.push({ ...structuredClone(mixed.persons[0]), name: 'Person2' });
  mixed.assumptions.cashRealReturn = cashReturn;
  mixed.assumptions.retirementCashReserve = 50000;
  const result = simulate(mixed);
  assert.ok(result.schedule.length > 0);
  for (const row of result.schedule) {
    assert.ok(row.cash >= 50000 - 1e-6);
    near(row.shortfall, 0);
    near(row.closing, row.opening - row.fromPortfolio - row.investmentTax + row.cashGrowth + row.investmentGrowth);
  }
}
const expired = structuredClone(plan);
expired.assumptions.planToAge = 30;
assert.equal(simulate(expired).timeline.yearsToFi, Infinity);
const lateBuffer = structuredClone(plan);
lateBuffer.assumptions.bufferYears = 100;
assert.equal(simulate(lateBuffer).timeline.yearsToFi, Infinity);
console.log('Cash buckets, protected reserve, ownership, purchase and round-trip checks passed');
