import assert from 'node:assert/strict';
import { simulate, accumulationStep, retirementStep } from '../src/calc.js';
import { blankState, sanitise, encodeState, decodeState } from '../src/state.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < .02, `${a} vs ${b}`);
const plan = blankState();
plan.currentYear = 2026;
Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1960,
  healthCoveredAfterFi: true, assets: { investmentAccount: 200000, investmentAccountContributions: 60000 },
  income: { grossMonthly: 0, netMonthly: 0 } });
plan.household.spending.other = 1000;
Object.assign(plan.assumptions, { realReturn: 0, brokerageRealReturn: 0, cashRealReturn: 0,
  inflation: 0, pensionPolicy: 'ignore', portfolioEnd: 'drawdown', planToAge: 75,
  bufferYears: 0, spendingGrowth: 0 });
let r = simulate(plan);
near(r.portfolio.start, 200000);
near(r.fi.number, 60000 + 48000 / .78); // 9 × 12k net, first 60k untaxed.
near(r.timeline.yearsToFi, 0);
near(r.schedule[0].investmentTax, 0);
near(r.schedule[4].contributionAllowanceNominal, 0);
near(r.schedule[5].investmentTax, 12000 / .78 - 12000);
near(r.schedule.at(-1).closing, 200000 - 60000 - 48000 / .78);
for (const row of r.schedule) near(row.closing,
  row.opening + row.lumpNet - row.fromPortfolio - row.investmentTax + row.cashGrowth + row.investmentGrowth);
plan.assumptions.retirementCashReserve = 10000;
r = simulate(plan);
near(r.fi.number, 60000 + 58000 / .78);
assert.ok(r.schedule.every((row) => row.cash >= 10000 - .01));

plan.assumptions.retirementCashReserve = 0;
plan.assumptions.transactionCostRate = 0;
plan.assumptions.emergencyFundMonths = 0;
plan.persons[0].assets = { investmentAccount: 300000, investmentAccountContributions: 20000 };
plan.household.property = { purchase: { price: 60000, deposit: 60000, termYears: 20,
  rate: 0, monthsAway: 0, paidBy: 0, runningCostsMonthly: 0 } };
r = simulate(plan);
near(r.portfolio.investmentTaxBeforeFi, 40000 / .78 - 40000);
near(r.schedule[0].opening, 300000 - 20000 - 40000 / .78);
plan.persons[0].assets.investmentAccount = 65000;
assert.equal(simulate(plan).house.feasible, false, 'gross house funds do not imply net affordability');
plan.persons[0].assets = { investmentAccount: 50000, investmentAccountContributions: 0 };
plan.persons.push({ ...structuredClone(plan.persons[0]), name: 'Person2',
  assets: { investmentAccount: 300000, investmentAccountContributions: 300000 } });
r = simulate(plan);
// Selected payer supplies 39k net from 50k gross; the other supplies 21k tax-free.
near(r.portfolio.investmentTaxBeforeFi, 11000);
near(r.schedule[0].opening, 279000);
near(r.schedule[0].accounts[0].investmentAccount, 0);
near(r.schedule[0].accounts[1].allowanceNominal, 267000);

const bucket = (over = {}) => ({ cash: 0, invested: 100000, ia: 100000,
  allowanceNominal: 100000, inflation: 0, elapsed: 0, taxPaid: 0,
  destination: 'investmentAccount', brokerageReturn: 0, ...over });
// Annual-end deposits and deficits use the event's price level, not year zero.
let b = accumulationStep([bucket({ invested: 0, ia: 0, allowanceNominal: 0, inflation: .1 })],
  10000, 2, 0, 0, [1])[0];
near(b.ia, 20000); near(b.allowanceNominal, 11000 + 12100);
b = accumulationStep([bucket({ invested: 0, ia: 0, allowanceNominal: 0,
  destination: 'brokerage' })], 10000, 2, 0, 0, [1])[0];
near(b.invested, 20000); near(b.ia, 0); near(b.allowanceNominal, 0);
b = accumulationStep([bucket({ allowanceNominal: 0 })], -7800, 1, 0, 0, [1])[0];
near(b.invested, 90000); near(b.taxPaid, 2200);
const two = retirementStep([bucket({ allowanceNominal: 200000 }), bucket({ allowanceNominal: 0 })],
  17800, 1, 0, 0);
near(two.investmentTax, 2200); // net-available proportional funding: 10k + 7.8k.
near(two.balances[0].allowanceNominal, 190000);
near(two.balances[1].allowanceNominal, 0);
const fractional = retirementStep([bucket({ allowanceNominal: 0, inflation: .21, elapsed: .5 })],
  7800, .5, 0, 0);
near(fractional.investmentTax, 2200);
near(fractional.balances[0].elapsed, 1);
const reserve = retirementStep([bucket({ allowanceNominal: 0 })], 0, 1, 0, 0, 7800);
near(reserve.balances[0].cash, 7800); near(reserve.investmentTax, 2200);
const mixed = retirementStep([bucket({ invested: 20000, ia: 10000, brokerageReturn: .02 })],
  0, 1, 0, .05);
near(mixed.investmentGrowth, 700); // 500 pre-withdrawal-tax IA + 200 after-tax ordinary.
const shocked = retirementStep([bucket({ invested: 20000, ia: 10000,
  brokerageReturn: .02, stressReturn: -.1 })], 0, 1, 0, -.1);
near(shocked.investmentGrowth, -2000);

plan.persons[0].investmentDestination = 'brokerage';
plan.assumptions.brokerageRealReturn = .03;
const restored = sanitise(decodeState(encodeState(plan)));
assert.equal(restored.persons[0].investmentDestination, 'brokerage');
assert.equal(restored.assumptions.brokerageRealReturn, .03);
console.log('Live investment-account tax: FI target, schedule, home funding, reserves, owners, dated savings and persistence passed');
