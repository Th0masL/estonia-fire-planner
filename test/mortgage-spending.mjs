import assert from 'node:assert/strict';
import { simulate } from '../src/calc.js';
import { exampleState } from '../src/state.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} vs ${b}`);

// Zero inflation isolates real lifestyle growth from nominal conversion.
// A zero-interest €120,000 loan over ten years pays €12,000 annually.
const plan = exampleState();
plan.currentYear = 2026;
plan.household.spending = { housing: 0, other: 0, childCosts: 0, buffer: 0 };
plan.household.property = { purchase: { price: 120000, deposit: 0, collateralValue: 120000,
  rate: 0, termYears: 10, monthsAway: 0, runningCostsMonthly: 0, movingCosts: 0, paidBy: 0 } };
Object.assign(plan.persons[0], { birthYear: 1971, healthCoveredAfterFi: true,
  assets: { cash: 1000000 }, income: { grossMonthly: 4000, netMonthly: 4000 } });
Object.assign(plan.assumptions, { inflation: 0, spendingGrowth: .02, realReturn: 0,
  cashRealReturn: 0, bufferYears: 0, retirementCashReserve: 0, planToAge: 75,
  pensionPolicy: 'ignore', portfolioEnd: 'drawdown', transactionCostRate: 0, emergencyFundMonths: 0 });
const mortgageOnly = simulate(plan);
near(mortgageOnly.timeline.yearsToFi, 0);
near(mortgageOnly.fi.number, 120000);
for (const row of mortgageOnly.schedule) near(row.need, row.year < 2036 ? 12000 : 0);

plan.household.spending.other = 1000;
const mixed = simulate(plan);
for (const row of mixed.schedule) {
  const year = row.year - 2026;
  near(row.need, 12000 * 1.02 ** year + (year < 10 ? 12000 : 0));
}
plan.household.property.purchase.monthsAway = 6;
const midyear = simulate(plan);
near(midyear.timeline.yearsToFi, .5);
near(midyear.schedule[0].need, 12000); // half-year living costs + half-year mortgage
const finalLoanYear = midyear.schedule.find((r) => r.year === 2036);
near(finalLoanYear.need, 12000 * 1.02 ** 9.5 + 6000);
plan.assumptions.spendingGrowth = 0;
const flat = simulate(plan);
near(flat.schedule.find((r) => r.year === 2030).need, 24000);
console.log('Mortgage payments stay fixed while living costs grow; partial and final loan years reconcile');

// Work beyond payoff: the former payment is saved, not charged forever.
// Buffer years choose an exact stop date independently of the FI search.
for (const monthsAway of [0, 6]) {
  for (const rate of [0, .04]) {
    plan.household.property.purchase.monthsAway = monthsAway;
    plan.assumptions.realReturn = rate;
    for (const buffer of [9, 10, 10.5, 12]) {
      plan.assumptions.bufferYears = buffer;
      const result = simulate(plan);
      const before = monthsAway / 12;
      near(result.timeline.yearsToFi, before + buffer);
      const grow = (capital, saving, years) => capital * (1 + rate) ** years + saving *
        (rate === 0 ? years : ((1 + rate) ** years - 1) / rate);
      const atPurchase = grow(0, result.savings.surplusNow, before);
      const atLoanEnd = grow(atPurchase, result.savings.surplusAfterMove, Math.min(buffer, 10));
      const expected = 1000000 + grow(atLoanEnd, result.savings.surplusAfterMove + 12000,
        Math.max(0, buffer - 10));
      near(result.fi.atFiDate, expected);
      near(result.fi.ownershipAtFi[0].portfolio, expected);
      near(result.schedule[0].opening, expected);
    }
  }
}
console.log('Accumulation stops charging paid-off loans at exact and partial-year boundaries');

// Savings are negative now and during the mortgage, but positive after payoff.
// With zero returns: assets at t = 200000 - 6000t, retirement need before
// payoff = 12000(20-t) + 12000(10-t). Equality gives t = 160000/18000.
plan.household.property.purchase.monthsAway = 0;
plan.household.spending.housing = 2000;
Object.assign(plan.persons[0], { pillar3Annual: 0, assets: { cash: 200000 },
  income: { grossMonthly: 2000, netMonthly: 1500 } });
Object.assign(plan.assumptions, { realReturn: 0, bufferYears: 0 });
const deficitPlan = simulate(plan);
near(deficitPlan.timeline.yearsToFi, 160000 / 18000);
near(deficitPlan.fi.atFiDate, 200000 - 6000 * 160000 / 18000);
near(deficitPlan.schedule[0].openingInvestments, 0);
plan.persons[0].assets.cash = 10000;
assert.equal(simulate(plan).timeline.yearsToFi, Infinity,
  'later post-payoff savings cannot repair an unfunded working-year expense');

// Nonzero inflation: independently sum calendar-year real payments. A future
// purchase keeps its entered real price; erosion starts at completion, not now.
plan.persons[0].assets.cash = 1000000;
plan.persons[0].income.netMonthly = 4000;
plan.household.spending = { housing: 0, other: 0, childCosts: 0, buffer: 0 };
plan.assumptions.inflation = .025;
for (const monthsAway of [0, 6, 24]) {
  plan.household.property.purchase.monthsAway = monthsAway;
  const start = 2026 + monthsAway / 12;
  const costIn = (year, from, to) => 12000 * Math.max(0, Math.min(to, start + 10) - Math.max(from, start)) /
    1.025 ** Math.max(0, year - start);
  for (const buffer of [0, 3.5, 12]) {
    plan.assumptions.bufferYears = buffer;
    const r = simulate(plan);
    const stop = start + buffer;
    near(r.timeline.yearsToFi, stop - 2026);
    let paid = 0;
    for (let year = 2026; year < stop; year++) paid += costIn(year, year, Math.min(year + 1, stop));
    const savingWithoutLoan = r.savings.surplusAfterMove + 12000;
    const expectedAssets = 1000000 + r.savings.surplusNow * (start - 2026) + savingWithoutLoan * buffer - paid;
    near(r.fi.atFiDate, expectedAssets);
    let futurePayments = 0;
    for (const row of r.schedule) {
      const expected = costIn(row.year, Math.max(row.year, stop), row.year + 1);
      near(row.need, expected);
      futurePayments += expected;
    }
    near(r.fi.number, futurePayments);
    near(r.timeline.mortgageBalanceAtFi, Math.max(0, 120000 - buffer * 12000) / 1.025 ** buffer);
  }
}
console.log('Mortgage inflation reconciles accumulation, retirement, delayed purchase and real loan balance');
plan.household.property.purchase.monthsAway = 0;
Object.assign(plan.assumptions, { bufferYears: 2, realReturn: .04, cashRealReturn: .01 });
const growthWithInflation = simulate(plan);
const savingBeforeMortgage = growthWithInflation.savings.surplusAfterMove + 12000;
const expectedInvestments = (savingBeforeMortgage - 12000) * 1.04 +
  savingBeforeMortgage - 12000 / 1.025;
near(growthWithInflation.schedule[0].openingCash, 1000000 * 1.01 ** 2);
near(growthWithInflation.schedule[0].openingInvestments, expectedInvestments);
