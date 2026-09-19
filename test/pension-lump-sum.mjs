import assert from 'node:assert/strict';
import { simulate } from '../src/calc.js';
import { blankState, sanitise, encodeState, decodeState } from '../src/state.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < .02, `${a} vs ${b}`);
const plan = blankState();
plan.currentYear = 2026;
Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1960, healthCoveredAfterFi: true,
  assets: { cash: 500000, pillar2: 100000 }, income: { grossMonthly: 0, netMonthly: 0 } });
plan.household.spending.other = 1000;
Object.assign(plan.assumptions, { pensionPolicy: 'ownPots', pillarPayout: 'lumpSum',
  portfolioEnd: 'drawdown', planToAge: 75, realReturn: 0, cashRealReturn: 0,
  spendingGrowth: 0, bufferYears: 0, potsCountedShare: 1 });
let r = simulate(plan);
near(r.timeline.yearsToFi, 0);
near(r.fi.number, 18000); // Nine years × 12k expenses, minus 90k after-tax capital.
near(r.schedule[0].lumpGross, 100000);
near(r.schedule[0].lumpTax, 10000);
near(r.schedule[0].lumpNet, 90000);
near(r.schedule[0].closing, 578000);
near(r.schedule.reduce((s, y) => s + y.lumpNet, 0), 90000);
assert.ok(r.schedule.every((y) => y.fromPots === 0));
for (const row of r.schedule) near(row.closing,
  row.opening + row.lumpNet - row.fromPortfolio + row.cashGrowth + row.investmentGrowth);
plan.assumptions.pensionLumpSumInvestedShare = .6;
r = simulate(plan);
near(r.schedule[0].investments, 54000);
near(r.schedule[0].cash, 524000);
plan.assumptions.potsCountedShare = .5;
r = simulate(plan);
near(r.fi.number, 63000);
near(r.schedule[0].lumpNet, 45000);
plan.assumptions.potsCountedShare = 0;
const zero = simulate(plan);
plan.assumptions.pensionPolicy = 'ignore';
near(zero.fi.number, simulate(plan).fi.number);
plan.assumptions.pensionPolicy = 'ownPots';
plan.assumptions.potsCountedShare = 1;
plan.assumptions.pensionLumpSumInvestedShare = 0;
plan.persons[0].birthYear = 1971;
plan.assumptions.planToAge = 95;
r = simulate(plan);
const event = r.fi.lumpSums[0];
assert.ok(event.date > 2026);
assert.ok(r.schedule.filter((y) => y.year + 1 <= event.date).every((y) => y.lumpNet === 0));
near(r.fi.number, 480000 - 90000);
const positiveReturn = structuredClone(plan);
positiveReturn.assumptions.realReturn = .05;
positiveReturn.assumptions.potsCountedShare = 0;
const zeroTrust = simulate(positiveReturn);
positiveReturn.assumptions.pensionPolicy = 'ignore';
const ignored = simulate(positiveReturn);
near(zeroTrust.fi.number, ignored.fi.number);
assert.deepEqual(zeroTrust.schedule, ignored.schedule);
plan.persons[0].assets.cash = 0;
assert.equal(simulate(plan).timeline.yearsToFi, Infinity, 'locked money cannot bridge expenses before receipt');
plan.persons[0].assets.cash = 500000;
plan.persons[0].assets.pillar3 = 100000;
plan.persons[0].pillar3FirstContributionYear = null;
assert.ok(simulate(plan).fi.lumpSums.every((e) => e.kind !== 'pillar3'));
plan.persons[0].pillar3FirstContributionYear = 2020;
assert.equal(simulate(plan).fi.lumpSums.length, 2);
plan.assumptions.pensionLumpSumInvestedShare = .6;
for (const restored of [sanitise(plan), sanitise(decodeState(encodeState(plan)))]) {
  assert.equal(restored.assumptions.pillarPayout, 'lumpSum');
  near(restored.assumptions.pensionLumpSumInvestedShare, .6);
}
assert.equal(blankState().assumptions.pillarPayout, 'fundPension');
const owners = structuredClone(plan);
Object.assign(owners.persons[0], { birthYear: 1960, assets: { cash: 500000, pillar2: 100000 }, allocationShare: .5 });
owners.persons.push({ ...structuredClone(owners.persons[0]), name: 'Person2',
  assets: { cash: 0, pillar2: 200000 } });
owners.assumptions.pensionLumpSumInvestedShare = 1;
let owned = simulate(owners);
assert.deepEqual(owned.fi.lumpSums.map((e) => [e.owner, e.credited]), [[0, 90000], [1, 180000]]);
near(owned.schedule[0].investments, 270000);
const immediate = structuredClone(owners);
immediate.persons = [immediate.persons[0]];
immediate.persons[0].assets = { cash: 0, pillar2: 1000000 };
immediate.assumptions.retirementCashReserve = 20000;
owned = simulate(immediate);
near(owned.timeline.yearsToFi, 0);
near(owned.fi.number, 0);
near(owned.schedule[0].cash, 20000);
assert.ok(owned.schedule.every((row) => row.shortfall === 0));
console.log('Lump sums: tax, timing, allocation, trust, no double counting, eligibility and persistence reconcile');
