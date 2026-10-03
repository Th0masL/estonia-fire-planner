// Regression checks for defects found in the September 2026 repo review.
// Each assertion should fail if the old behaviour returns.

import { simulate, pensionAges, accumulationStep, netFromGross, pillarProjection } from '../src/calc.js';
import { blankState, exampleState } from '../src/state.js';
import { RATES } from '../src/rates.js';
import { actionPlan } from '../src/rules.js';
import { eur } from '../src/format.js';

let checks = 0;
const failures = [];
const ok = (condition, label) => {
  checks++;
  if (!condition) failures.push(label);
};
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;

// Example records must demonstrate pensions without weakening blank-plan
// safeguards or presenting synthetic inputs as real entitlements.
{
  for (const policy of ['ownPots', 'all']) {
    const plan = exampleState();
    plan.assumptions.pensionPolicy = policy;
    const result = simulate(plan);
    const person = result.persons[0];
    ok(person.pensionTermsKnown, `${policy}: example fund duration is supplied`);
    ok(person.pillar3EligibilityKnown, `${policy}: example Pillar III history is supplied`);
    ok(person.pensionIncome > 0, `${policy}: example fund payments are positive`);
    if (policy === 'all') ok(person.statePensionIncome > 0, 'example state pension is positive');
    ok(Number.isFinite(result.timeline.yearsToFi), `${policy}: example has a FIRE result`);
  }
  const blank = blankState().persons[0];
  ok(blank.fundPensionYears === null && blank.pillar1Units === null &&
    blank.yearsWorkedEstonia === null && blank.pillar3FirstContributionYear === null,
  'blank plans still require the user’s own pension records');
}

// ---- child costs stop on their end date during the working years ----------
{
  const plan = blankState();
  plan.currentYear = 2026;
  Object.assign(plan.persons[0], { name: 'Person1', birthYear: 1990,
    healthCoveredAfterFi: true, assets: { cash: 0 },
    income: { grossMonthly: 0, netMonthly: 4000 } });
  plan.household.spending = { housing: 0, other: 1000, buffer: 0, childCosts: 1000,
    childCostsEndYear: 2027 };
  Object.assign(plan.assumptions, { realReturn: 0, cashRealReturn: 0, inflation: 0,
    pensionPolicy: 'ignore', portfolioEnd: 'drawdown', bufferYears: 0,
    spendingGrowth: 0, planToAge: 80 });
  // Zero returns: one year saving 24k, then 36k a year once the costs end.
  const sim = simulate(plan);
  const at = (years) => sim.timeline.accumulation.find((r) => near(r.years, years))?.total;
  ok(near(at(1), 24000), `child costs charged in their last year (${at(1)})`);
  ok(near(at(3), 24000 + 2 * 36000), `child costs charged after their end date (${at(3)})`);

  // An earlier end can only ever bring FI forward.
  const fiFor = (end) => {
    plan.household.spending.childCostsEndYear = end;
    return simulate(plan).timeline.yearsToFi;
  };
  const never = fiFor(null);
  let previous = -Infinity;
  for (const end of [2026, 2027, 2028.5, 2030, 2035, 2040, 2050, 2070, null]) {
    const years = fiFor(end);
    ok(years >= previous - 1e-9, `child costs ending ${end} delayed FI (${years} < ${previous})`);
    previous = years;
  }
  ok(fiFor(2027) < never - 1, 'an early end date does not bring FI forward');
}

// ---- CoastFIRE works with a target date, not a mixed-up age -----------------
{
  const plan = exampleState();
  plan.currentYear = 2026;
  plan.household.property = null;
  plan.household.spending = { housing: 0, other: 2500, buffer: 0, childCosts: 0 };
  Object.assign(plan.assumptions, { realReturn: .05, cashRealReturn: 0,
    pensionPolicy: 'ignore', portfolioEnd: 'drawdown', bufferYears: 0,
    spendingGrowth: 0, planToAge: 90 });
  const older = { ...structuredClone(plan.persons[0]), name: 'Older', birthYear: 1966,
    healthCoveredAfterFi: true, allocationShare: 0.5, pillar3Annual: 0,
    assets: { cash: 0, brokerage: 20000, brokerageCostBasis: 20000 },
    income: { grossMonthly: 0, netMonthly: 2000 } };
  const younger = { ...structuredClone(older), name: 'Younger', birthYear: 1996 };
  plan.persons = [older, younger];
  const a = simulate(plan);
  plan.persons = [structuredClone(younger), structuredClone(older)];
  const b = simulate(plan);
  const unlock = Math.max(...a.persons.map((p) => p.pensionUnlockYear));
  const ca = a.timeline.coastToPensionUnlock, cb = b.timeline.coastToPensionUnlock;
  ok(ca && cb, 'coast to pension unlock not found for a couple with a wide age gap');
  ok(cb && cb.years > 0, 'coast date is not sensitive to the target in this plan');
  // The headline age is the first person's, so compare the calendar date.
  ok(ca && cb && near(ca.years, cb.years, 1e-9),
    `person order moves the CoastFIRE date (${ca?.years} vs ${cb?.years} years)`);
  ok(ca && a.currentYear + ca.years < unlock, 'coast date is not before the last unlock');
  ok(ca && near(ca.age, a.timeline.ageNow + ca.years, 1e-9), 'coast age is not the first person\'s');
}

// ---- the haircut replay: continuous at share 0, equal to schedule at 1 -------
const pensionPlan = (policy, other = 2500, birthYear = 1975) => {
  const plan = exampleState();
  plan.currentYear = 2026;
  plan.household.property = null;
  plan.household.spending = { housing: 0, other, buffer: 0, childCosts: 0 };
  Object.assign(plan.assumptions, { realReturn: .04, cashRealReturn: 0, pensionPolicy: policy,
    portfolioEnd: 'drawdown', bufferYears: 0, spendingGrowth: 0, planToAge: 90,
    pillarPayout: 'fundPension' });
  plan.persons = [plan.persons[0]];
  Object.assign(plan.persons[0], { name: 'Person1', birthYear,
    healthCoveredAfterFi: true, fundPensionYears: 20, pillar3Annual: 0,
    pillar1Units: 20, yearsWorkedEstonia: 25, yearsWorkedEuEea: 0,
    assets: { cash: 0, brokerage: 300000, brokerageCostBasis: 300000, pillar2: 120000, pillar3: 0 },
    income: { grossMonthly: 5000, netMonthly: null } });
  return plan;
};
{
  const plan = pensionPlan('ownPots');
  plan.assumptions.potsCountedShare = 0;
  const zero = simulate(plan);
  plan.assumptions.potsCountedShare = 1e-9;
  const tiny = simulate(plan);
  ok(Number.isFinite(zero.timeline.yearsToFi), 'haircut plan never reaches FI');
  ok(near(zero.timeline.yearsToFi, tiny.timeline.yearsToFi, 1e-6), 'FI jumps at share 0');
  ok(zero.fi.haircutBuffer != null && near(zero.fi.haircutBuffer, tiny.fi.haircutBuffer, 1),
    `haircut buffer at share 0 (${zero.fi.haircutBuffer}) vs 1e-9 (${tiny.fi.haircutBuffer})`);
  ok(zero.fi.haircutBuffer > 0, 'full pots bought nothing at share 0');
}
for (const bufferYears of [0, 0.5]) {
  // Just below full trust the replay at 100% must be the schedule itself,
  // including the part-year at FI and the first state-pension year (the 1970
  // cohort starts in 2036.125). FI is already reached, so money is left over.
  const plan = pensionPlan('all', 2000, 1970);
  Object.assign(plan.assumptions, { bufferYears,
    potsCountedShare: 1 - 1e-12, stateCountedShare: 1 - 1e-12 });
  const sim = simulate(plan);
  ok(near(sim.timeline.yearsToFi, bufferYears, 1e-9), `buffer ${bufferYears}: FI is not the buffer date`);
  ok(!Number.isInteger(sim.persons[0].statePensionYear), 'state pension does not start mid-year');
  const last = sim.schedule[sim.schedule.length - 1];
  ok(last.closing > 1000, `buffer ${bufferYears}: nothing left to compare`);
  ok(sim.fi.haircutBuffer != null && near(sim.fi.haircutBuffer, Math.max(0, last.closing), 1),
    `buffer ${bufferYears}: replay at 100% (${sim.fi.haircutBuffer}) differs from the schedule (${last.closing})`);
}

// ---- a part-year deposit is worth at least what was paid in -----------------
for (const r of [0, .03, .07]) {
  for (const years of [.25, .5, .75, 1, 1.5, 2.25]) {
    const opening = [{ cash: 0, invested: 0 }];
    opening.shortfall = 0;
    const out = accumulationStep(opening, 12000, years, 0, r, [1]);
    ok(out[0].invested >= 12000 * years - 1e-6,
      `r=${r}, ${years}y: ${out[0].invested} below principal ${12000 * years}`);
  }
}
{
  const base = { birthYear: 1990, grossMonthly: 3000, currentYear: 2026, realReturn: .05 };
  const unlock = pillarProjection(base).unlockAge;
  const short = pillarProjection({ ...base, workUntilAge: 36.5 });
  const paid = 0.5 * short.contributions.totalAnnual;
  ok(short.pot2 >= paid * 1.05 ** (unlock - 36.5) - 1e-6,
    'a half-year of Pillar II contributions is worth less than it cost');
}

// ---- pension-age range is never inverted -------------------------------------
for (let birthYear = 1900; birthYear <= 2010; birthYear++) {
  const r = pensionAges(birthYear).estimateRange;
  ok(r === null || r.min <= r.max, `${birthYear}: inverted range ${r?.min}-${r?.max}`);
}
ok(pensionAges(1950).estimateRange === null, 'pre-table cohort still has a range');
ok(pensionAges(2000).estimateRange !== null, 'future cohort lost its range');

// ---- action-plan text follows the plan and the rates -------------------------
{
  const plan = pensionPlan('ownPots');
  plan.persons.push({ ...structuredClone(plan.persons[0]), name: 'Person2', birthYear: 1985,
    fundPensionYears: 10, income: { grossMonthly: 0, netMonthly: 0 } });
  plan.assumptions.portfolioEnd = 'drawdown';
  const sim = simulate(plan);
  const findings = actionPlan(sim, plan);
  const byId = (id) => findings.find((f) => f.id === id);

  const runsOut = byId('payout-runs-out');
  const last = sim.persons.reduce((x, y) => y.pillarIncomeEndYear > x.pillarIncomeEndYear ? y : x);
  ok(runsOut, 'payout-runs-out did not fire');
  ok(runsOut && runsOut.title.endsWith(`at ${last.pillarIncomeEndAge.toFixed(0)}`),
    `payout-runs-out age is not the last person's: ${runsOut?.title}`);
  ok(runsOut && runsOut.value ===
    `${Math.max(0, sim.timeline.planEndYear - last.pillarIncomeEndYear).toFixed(0)} years to cover after`,
    `payout-runs-out mixes people: ${runsOut?.value}`);

  const bridge = byId('bridge');
  ok(bridge && !bridge.detail.includes('excludes pension balances entirely'),
    'bridge text claims pots are excluded while they are counted');
  plan.assumptions.pensionPolicy = 'ignore';
  const ignored = actionPlan(simulate(plan), plan).find((f) => f.id === 'bridge');
  ok(ignored && ignored.detail.includes('excludes pension balances entirely'),
    'bridge text lost the exclusion note when pots are ignored');

  const partner = byId('partner-could-work');
  ok(partner && partner.value ===
    '~' + eur(netFromGross(12000).net + 12 * RATES.healthInsurance.voluntaryMonthly) + '/year',
    `partner value is not the engine's: ${partner?.value}`);

  // Numbers in the text move with the rates rather than being typed in.
  const saved = { tax: RATES.incomeTax, share: RATES.pillar3.maxShareOfGross, crypto: RATES.crypto.taxRate };
  try {
    RATES.incomeTax = 0.3; RATES.pillar3.maxShareOfGross = 0.2; RATES.crypto.taxRate = 0.3;
    plan.persons[1].assets = { crypto: 10000, cryptoCostBasis: 0 };
    plan.persons[0].pillar3Annual = 0;
    plan.excludeCrypto = false;
    const text = actionPlan(simulate(plan), plan);
    const p3 = text.find((f) => f.id === 'pillar3-unused');
    ok(p3 && p3.detail.includes('20% of gross') && p3.detail.includes('full 30%'),
      'Pillar III text ignores RATES');
    const crypto = text.find((f) => f.id.startsWith('crypto-tax-'));
    ok(crypto && crypto.detail.includes('reserves 30% of gains'), 'crypto text ignores RATES');
    const worker = text.find((f) => f.id === 'partner-could-work');
    ok(worker && !worker.detail.includes('~75%'), 'partner marginal rate is hard-coded');
  } finally {
    RATES.incomeTax = saved.tax; RATES.pillar3.maxShareOfGross = saved.share;
    RATES.crypto.taxRate = saved.crypto;
  }
}

console.log(`\n${checks} review-regression checks`);
if (failures.length) {
  for (const f of failures) console.log('  FAIL', f);
  process.exit(1);
}
console.log('all reviewed defects stay fixed\n');
