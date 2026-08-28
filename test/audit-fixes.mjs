// Regression checks for defects found in the August 2026 external audit.
// These focus on previously ignored dates, liabilities, tax bases and legal
// eligibility inputs. Each assertion should fail if the old behaviour returns.

import { simulate, pensionAges, pillar1UnitsPerYear, pillar3, netFromGross } from '../src/calc.js';
import { sanitise } from '../src/state.js';

let checks = 0;
const failures = [];
const ok = (condition, label) => {
  checks++;
  if (!condition) failures.push(label);
};

const plan = (monthsAway = 12) => sanitise({
  version: 2, currentYear: 2026, excludeCrypto: true,
  household: {
    hasDependents: true,
    spending: {
      housing: 1000, childCosts: 500, childCostsEndYear: 2040,
      other: 1000, buffer: 0,
    },
    rentalIncomeNetMonthly: 0,
    property: { purchase: {
      price: 300000, collateralValue: 300000, deposit: 60000,
      termYears: 30, rate: 0.04, runningCostsMonthly: 300,
      movingCosts: 10000, monthsAway, otherDebtMonthly: 250,
      paidBy: 'proportional',
    } },
  },
  persons: [{
    name: 'Person1', birthYear: 1990,
    income: { grossMonthly: 6000, netMonthly: 4500, otherNetMonthly: 0 },
    assets: {
      cash: 100000, investmentAccount: 100000,
      investmentAccountContributions: 60000,
      pillar2: 20000, pillar3: 5000, crypto: 0,
    },
    pillar2Rate: 0.06, pillar3Annual: 1500,
    pillar1Units: 15, yearsWorkedEstonia: 20, yearsWorkedEuEea: 0,
    pillar3FirstContributionYear: 2020,
    annuityMonthlyQuote: 500, fundPensionYears: 20,
    allocationShare: 1,
  }],
  assumptions: {
    realReturn: 0.05, cashRealReturn: 0, swr: 0.035,
    spendingGrowth: 0, inflation: 0.025, planToAge: 100,
    portfolioEnd: 'drawdown', pensionPolicy: 'ignore',
    pillarDrawAge: 'unlock', pillarPayout: 'fundPension',
    emergencyFundMonths: 6, transactionCostRate: 0.02,
  },
});

// Completion timing must change both the funds available and the debt remaining at FI.
{
  const now = simulate(plan(0));
  const later = simulate(plan(60));
  ok(later.house.fundsAtCompletion > now.house.fundsAtCompletion,
    'monthsAway affects compounding and saving before completion');
  ok(Math.abs(later.timeline.mortgageBalanceAtFi - now.timeline.mortgageBalanceAtFi) > 100,
    'monthsAway affects the mortgage amortisation timeline');
}

// Mortgage and dependent costs stay in the retirement schedule until dated ends.
{
  const r = simulate(plan(12));
  const beforeChildEnd = r.schedule.find((row) =>
    row.year >= Math.ceil(r.timeline.fiYear) && row.year < 2040);
  ok(r.timeline.mortgageBalanceAtFi > 0, 'outstanding mortgage remains visible at FI');
  ok(beforeChildEnd && beforeChildEnd.need >= r.spending.perpetual + 6000,
    'child costs remain in post-FI need before their end year');
}

// Legal/tax corrections.
ok(pillar1UnitsPerYear(0, true) === 0,
  'zero qualifying earnings accrue zero Pillar I units');
ok(pensionAges(1961).statePensionAge === 65,
  '1961 cohort uses the confirmed 2026 pension age');
ok(Math.abs(pensionAges(1962).statePensionAge - (65 + 1 / 12)) < 1e-12,
  '1962 cohort uses the confirmed 2027 pension age');
{
  const tax = netFromGross(10000, { pillar2Rate: 0.06 }).incomeTax;
  ok(pillar3(10000, 1500, { pillar2Rate: 0.06 }).refund === tax,
    'Pillar III refund is capped by tax after the actual 6% Pillar II deduction');
}

// The investment-account gain is not all spendable.
{
  const r = simulate(plan(12));
  ok(Math.abs(r.portfolio.investmentTaxReserve - 8800) < 0.01,
    '22% latent tax is reserved on investment-account gains');
}

// An unfunded purchase must block the result instead of creating money.
{
  const x = plan(0);
  x.persons[0].assets.cash = 1000;
  x.persons[0].assets.investmentAccount = 0;
  x.persons[0].assets.investmentAccountContributions = 0;
  const r = simulate(x);
  ok(r.house.fundingShortfall > 0, 'property funding shortfall is reported');
  ok(!Number.isFinite(r.timeline.yearsToFi), 'unfunded purchase has no FI date');
}

// Pension amounts are not invented when required evidence is missing.
{
  const x = plan(12);
  x.assumptions.pensionPolicy = 'all';
  x.persons[0].yearsWorkedEstonia = null;
  const r = simulate(x);
  ok(r.persons[0].statePensionIncome === 0,
    'Pillar I is excluded when service years are unknown');
}
{
  const x = plan(12);
  x.assumptions.pensionPolicy = 'ownPots';
  x.assumptions.pillarPayout = 'annuity';
  x.persons[0].annuityMonthlyQuote = null;
  const r = simulate(x);
  ok(r.persons[0].pensionIncome === 0,
    'annuity income is excluded without an insurer quote');
}
{
  const x = plan(12);
  x.assumptions.pensionPolicy = 'ownPots';
  x.persons[0].pillar3FirstContributionYear = null;
  const r = simulate(x);
  ok(!r.persons[0].pillar3EligibilityKnown && r.persons[0].pillar3AtDraw === 0,
    'Pillar III is excluded when its legally decisive first-contribution year is missing');
}

// A finite fund pension is only the middle leg of the plan. The accessible
// portfolio must bridge to it and, if the household outlives it, take over
// again. The later years must also be priced into the FI number rather than
// disappearing merely because a pension once existed.
{
  const x = plan(12);
  x.household.property.purchase = null;
  x.household.hasDependents = false;
  x.household.spending.childCosts = 0;
  x.household.spending.childCostsEndYear = null;
  x.assumptions.portfolioEnd = 'drawdown';
  x.assumptions.pensionPolicy = 'ownPots';
  x.assumptions.pillarPayout = 'fundPension';
  x.assumptions.planToAge = 100;
  x.persons[0].fundPensionYears = 10;

  const full = simulate(x);
  const pensionStart = Math.min(
    full.persons[0].pillar2DrawYear,
    full.persons[0].pillar3DrawYear ?? Infinity,
  );
  const pensionEnd = full.persons[0].pillarIncomeEndYear;
  const before = full.schedule.find((row) => row.year + 1 <= pensionStart);
  const during = full.schedule.find((row) =>
    row.year >= Math.ceil(pensionStart) && row.year + 1 <= pensionEnd &&
    row.fromPots > 0 && row.fromPots >= row.need);
  const after = full.schedule.find((row) => row.year >= Math.ceil(pensionEnd));

  ok(before?.fromPortfolio > 0 && before.fromPots === 0,
    'accessible portfolio funds the bridge before pension access');
  ok(during?.fromPots > 0 && during.fromPortfolio === 0,
    'fund pension can take over from the accessible portfolio while it lasts');
  ok(after?.fromPots === 0 && after.fromPortfolio > 0,
    'accessible portfolio takes over again after the fund pension is exhausted');

  const onlyUntilPensionEnds = structuredClone(x);
  onlyUntilPensionEnds.assumptions.planToAge =
    pensionEnd - full.persons[0].birthYear;
  const shorter = simulate(onlyUntilPensionEnds);
  ok(full.fi.number > shorter.fi.number + 1,
    'years after the pension ends are included in the required FIRE capital');
}
{
  const r = simulate(plan(12));
  ok(r.persons[0].pillar3DrawYear < r.persons[0].pillar2DrawYear,
    'a pre-2021 Pillar III holding uses its grandfathered date separately from Pillar II');
  const expectedDsti = (r.house.stressedMonthly + 250) / (r.income.householdNetIncome / 12);
  ok(Math.abs(r.house.dsti - expectedDsti) < 1e-12,
    'mortgage DSTI includes other loan and lease payments');
}

// Strict booleans and property constraints at the import boundary.
{
  const x = plan(12);
  x.excludeCrypto = 'false';
  x.household.hasDependents = 'false';
  x.household.property.purchase.deposit = 999999;
  const s = sanitise(x);
  ok(s.excludeCrypto === false && s.household.hasDependents === false,
    'string false imports as false');
  ok(s.household.property.purchase.deposit === s.household.property.purchase.price,
    'deposit cannot exceed purchase price');
}

console.log(`\n${checks} audit-regression checks`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  failures.forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('all audited defects stay fixed\n');
