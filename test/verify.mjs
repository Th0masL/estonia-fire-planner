// Regression tests use fictional, synthetic households. They verify published
// calculations and relationships and do not represent any person's finances.

import { simulate, netFromGross, pillar3, pensionAges, mortgage } from '../src/calc.js';
import { actionPlan } from '../src/rules.js';

let pass = 0, fail = 0;
const fmt = (v) => (Math.abs(v) < 10 ? v.toFixed(3) : Math.round(v).toLocaleString());
const near = (got, want, tol, label) => {
  const ok = Math.abs(got - want) <= tol;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}: ${fmt(got)} (expected ~${fmt(want)})`);
  ok ? pass++ : fail++;
};
/** For claims that are an inequality rather than a target value. */
const holds = (cond, label, detail = '') => {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${label}${detail ? `: ${detail}` : ''}`);
  cond ? pass++ : fail++;
};

console.log('\n--- income tax -------------------------------------------------');
// A low salary is unusually efficient: the basic exemption is untouched.
near(netFromGross(12_000).net, 10_871, 30, 'net from EUR 12,000 gross');
near(netFromGross(12_000).incomeTax, 697, 20, 'income tax on EUR 12,000');
near(netFromGross(6_000).incomeTax, 0, 1, 'income tax on EUR 6,000 (under exemption)');

console.log('\n--- pillar III -------------------------------------------------');
near(pillar3(120_000).cap, 6_000, 1, 'cap at high income (absolute limit binds)');
near(pillar3(120_000).refund, 1_320, 1, 'refund at high income');
near(pillar3(12_000).cap, 1_800, 1, 'cap at EUR 12,000 (15% binds)');
near(pillar3(6_000).refund, 0, 1, 'refund with no income tax paid');

console.log('\n--- pension ages -----------------------------------------------');
const ages = pensionAges(1982);
near(ages.pillarUnlockAge, 62, 2.5, 'pillar unlock age for an illustrative 1982 cohort');
console.log(`        state pension age ~${ages.statePensionAge.toFixed(1)}, confirmed: ${ages.confirmed}`);

console.log('\n--- mortgage ---------------------------------------------------');
const m = mortgage({ price: 360_000, deposit: 90_000, termYears: 30, rate: 0.04 });
near(m.monthly, 1_289, 5, 'payment on EUR 270,000 / 30yr / 4%');
near(m.stressedMonthly, 1_619, 5, 'payment at the 6% stress test');
near(m.balanceAfter(11), 205_628, 500, 'balance after 11 years');
near(m.ltv, 0.75, 0.001, 'LTV');

console.log('\n--- full household --------------------------------------------');
const syntheticHousehold = {
  currentYear: 2026,
  excludeCrypto: true,
  household: {
    spending: { housing: 777, childCosts: 222, childCostsEndYear: 2040,
                other: 999, buffer: 111 },
    rentalIncomeNetMonthly: 123,
    hasDependents: true,
    property: {
      purchase: {
        price: 333_000, deposit: 66_600, termYears: 30, rate: 0.042,
        runningCostsMonthly: 333, movingCosts: 7_777, monthsAway: 9,
      },
    },
  },
  persons: [
    {
      name: 'Person1', birthYear: 1981,
      income: { grossMonthly: 6_123, netMonthly: 4_777 },
      assets: { cash: 111_111, investmentAccount: 22_222,
                investmentAccountContributions: 22_222,
                pillar2: 33_333, pillar3: 4_444, crypto: 5_555 },
      allocationShare: 0.55,
      pillar1Units: 18, yearsWorkedEstonia: 18, yearsWorkedEuEea: 0,
      pillar3FirstContributionYear: 2021, annuityMonthlyQuote: 444, fundPensionYears: 20,
    },
    {
      name: 'Person2', birthYear: 1989,
      income: { grossMonthly: 2_345, netMonthly: 1_876 },
      assets: { cash: 12_345, investmentAccount: 6_789,
                investmentAccountContributions: 6_789,
                pillar2: 9_876, pillar3: 1_111, crypto: 0 },
      allocationShare: 0.45,
      pillar1Units: 7, yearsWorkedEstonia: 7, yearsWorkedEuEea: 0,
      annuityMonthlyQuote: 0, fundPensionYears: 20,
    },
  ],
};

const r = simulate(syntheticHousehold);
near(r.income.householdNetIncome, 81_312, 100, 'household net income');
near(r.spending.now, 25_308, 100, 'spending now');
near(r.savings.surplusNow, 56_004, 100, 'surplus now');
near(r.savings.rateAfterMove, 0.562, 0.02, 'savings rate after the move');
// Perpetual spending is the *forever* part only. Health cover is finite - it
// stops at state pension age, when RaKS 5 insures a pension recipient
// automatically - so it is a draw during the gap rather than part of the number
// capitalised at the withdrawal rate.
near(r.spending.perpetual, 15_840, 200, 'perpetual FI spending');
near(r.spending.healthAtFi, 6_528, 10, 'health cover per year during the gap');

// The target no longer comes from a closed form. It is the smallest portfolio
// that survives the year-by-year walk without ever dropping below the capital
// needed to fund permanent spending at the withdrawal rate - so it must sit
// above that floor, and health cover is paid out of the growth above it rather
// than funded as a separate lump.
const floor = r.spending.perpetual / 0.035;
holds(r.fi.number >= floor - 1, 'FI number clears the perpetual floor',
   `${Math.round(r.fi.number).toLocaleString()} vs ${Math.round(floor).toLocaleString()}`);
holds(r.fi.number > floor,
   'dated mortgage, child and health liabilities raise the requirement above the baseline floor',
   `${Math.round(r.fi.number).toLocaleString()} vs ${Math.round(floor).toLocaleString()}`);
holds(r.timeline.mortgageBalanceAtFi > 0,
   'an outstanding mortgage remains visible at FI',
   `EUR ${Math.round(r.timeline.mortgageBalanceAtFi).toLocaleString()}`);
near(r.house.dsti, 0.236, 0.005, 'DSTI at the stress rate');
holds(Number.isFinite(r.timeline.fiAge) && r.timeline.fiAge > r.timeline.ageNow,
  'FI age is finite and later than the current age');

console.log('\n--- two-person split ------------------------------------------');
console.log(`        one household FI target: EUR ${Math.round(r.fi.number).toLocaleString()}, reached at age ${r.timeline.fiAge.toFixed(1)}`);
console.log('        the split decides who OWNS the pot at that point:');
r.fi.ownershipAtFi.forEach((o) => {
  console.log(`          ${o.name}: ${(o.share*100).toFixed(0)}% of new savings -> EUR ${Math.round(o.portfolio).toLocaleString()}`);
});

// --- action plan ---------------------------------------------------------
const plan = actionPlan(r, syntheticHousehold);
console.log('\n--- action plan ------------------------------------------------');
for (const f of plan) {
  console.log(`  [${f.severity.padEnd(11)}] ${f.title}  ->  ${f.value}`);
}
console.log(`\n  ${plan.length} findings\n`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
