// Invariant tests.
//
// The arithmetic suite asks "is this number right?". These ask "do these numbers
// agree with each other?" — which is where every real bug in this project has
// been. Each assertion below corresponds to a defect that actually shipped.
//
// Run across many generated households rather than one fixture, because the
// bugs appeared in combinations (two people, unequal cash, a house purchase)
// that a single example never exercised.

import { simulate, pillar1Monthly } from '../src/calc.js';
import { actionPlan } from '../src/rules.js';
import { RATES, DEFAULTS } from '../src/rates.js';

let checks = 0, failures = [];
const ok = (cond, label, detail = '') => {
  checks++;
  if (!cond) failures.push(`${label}${detail ? ' — ' + detail : ''}`);
};
const close = (a, b, tol, label, detail) =>
  ok(Math.abs(a - b) <= tol, label,
     detail ?? `${Math.round(a).toLocaleString()} vs ${Math.round(b).toLocaleString()}`);

// --- case generator ---------------------------------------------------------

const person = (o = {}) => ({
  name: o.name ?? 'Person1', birthYear: o.birthYear ?? 1985,
  income: { grossMonthly: o.gross ?? 3000, netMonthly: o.net ?? null, otherNetMonthly: o.other ?? 0 },
  assets: {
    cash: o.cash ?? 0, investmentAccount: o.ia ?? 0,
    pillar2: o.p2 ?? 0, pillar3: o.p3 ?? 0, crypto: o.crypto ?? 0,
  },
  pillar3Annual: o.p3a ?? 0, allocationShare: o.share ?? 1,
  pillar1Units: o.p1units ?? 20, yearsWorkedEstonia: o.service ?? 20,
  yearsWorkedEuEea: 0, nationalPensionEligible: false,
  pillar3FirstContributionYear: 2020,
  annuityMonthlyQuote: 500, fundPensionYears: 20,
  lifeInsurance: !!o.life, lifeInsuranceMonthly: o.life ?? 0,
  healthInsurance: !!o.health, healthInsuranceMonthly: o.health ?? 0,
});

// Spending levels, because a household that never reaches FI exercises none of
// the FI-dependent invariants. Every fixture used to be a deficit household, so
// the ownership, bridge, drawdown and schedule checks silently never ran.
const SPENDING = [
  { label: 'deficit', housing: 1200, childCosts: 300, other: 1500, buffer: 200 },
  { label: 'comfortable', housing: 500, childCosts: 100, other: 450, buffer: 100 },
];

const CASES = [];
for (const [pensionPolicy, pillarDrawAge, pillarPayout] of
     [['ignore', 'unlock', 'annuity'],
      ['ownPots', 'unlock', 'annuity'], ['ownPots', 'statePension', 'annuity'],
      ['ownPots', 'unlock', 'fundPension'], ['ownPots', 'statePension', 'fundPension'],
      ['all', 'unlock', 'annuity'], ['all', 'statePension', 'annuity'],
      ['all', 'unlock', 'fundPension']]) {
for (const people of [1, 2]) {
  for (const share of [0.5, 0.8, 1]) {
    for (const buying of [false, true]) {
      for (const spending of SPENDING) {
      for (const paidBy of buying ? ['proportional', 0, 1] : [null]) {
        for (const [p3a, life, health] of [[0, 0, 0], [6000, 0, 0], [0, 40, 0], [0, 40, 272]]) {
          if (people === 1 && share !== 1) continue;
          if (people === 1 && paidBy === 1) continue;
          CASES.push({
            label: `${people}p ${spending.label} ${pensionPolicy}/${pillarDrawAge}/${pillarPayout}` +
                   `${buying ? ` buying(${paidBy})` : ''}${p3a ? ' p3' : ''}${life ? ' life' : ''}` +
                   `${health ? ' health' : ''} share=${share}`,
            currentYear: 2026, excludeCrypto: true,
            household: {
              hasDependents: true,
              spending: { housing: spending.housing, childCosts: spending.childCosts,
                          other: spending.other, buffer: spending.buffer },
              rentalIncomeNetMonthly: 0,
              property: buying ? { purchase: {
                price: 300000, deposit: 60000, termYears: 30, rate: 0.04,
                runningCostsMonthly: 300, movingCosts: 10000, monthsAway: 12, paidBy,
              } } : null,
            },
            persons: people === 1
              ? [person({ cash: 80000, p2: 40000, p3a, life, health })]
              : [person({ name: 'Person1', cash: 80000, p2: 40000, share, p3a, life, health }),
                 person({ name: 'Person2', birthYear: 1990, gross: 0, cash: 20000, share: 1 - share, health })],
            assumptions: { realReturn: 0.05, swr: 0.035, pensionPolicy, pillarDrawAge, pillarPayout,
                           portfolioEnd: spending.label === 'deficit' ? 'perpetual' : 'drawdown',
                           planToAge: spending.label === 'deficit' ? 95 : 100,
                           spendingGrowth: spending.label === 'deficit' ? 0 : 0.005 },
          });
        }
      }
      }
    }
  }
}
}

// Independent re-simulation of the drawdown, written from the description of
// what the model claims rather than by calling into its solver. If the engine
// says a household can stop in year N, walking the money forward year by year
// must not run it dry before the plan ends.
function survivesIndependently(input, r) {
  const a = { ...DEFAULTS, ...input.assumptions };
  const y = r.timeline.yearsToFi;
  const cy = r.currentYear;
  const fiYear = cy + y;
  const end = cy + Math.max(...r.persons.map((p) => a.planToAge - p.ageNow));
  const fund = a.pillarPayout === 'fundPension';
  let pf = r.fi.number;
  for (let year = Math.floor(fiYear); year < end; year++) {
    const duration = year + 1 - Math.max(year, fiYear);
    let income = 0;
    for (const p of r.persons) {
      if (fund && p.payoutYears) {
        for (const [draw, pot] of [
          [p.pillar2DrawYear, p.pillar2AtDraw], [p.pillar3DrawYear, p.pillar3AtDraw],
        ]) {
          if (draw != null && year + 1 > draw && year < draw + p.payoutYears) {
            const active = Math.max(0, Math.min(year + 1, draw + p.payoutYears) -
              Math.max(year, fiYear, draw));
            income += (pot / p.payoutYears) * active *
              (1 + a.realReturn) ** Math.max(0, year - draw);
          }
        }
      } else if (!fund && year + 1 > p.pillarDrawYear && year < p.pillarIncomeEndYear) {
        const active = Math.max(0, year + 1 - Math.max(year, fiYear, p.pillarDrawYear));
        income += p.pensionIncome * active /
          (1 + a.inflation) ** Math.max(0, year - p.pillarDrawYear);
      }
      if (a.pensionPolicy === 'all' && year + 1 > p.statePensionYear) {
        const active = Math.max(0, year + 1 - Math.max(year, fiYear, p.statePensionYear));
        income += p.statePensionIncome * active;
      }
    }
    let health = 0;
    for (const p of r.persons) {
      if (!p.healthCoveredAfterFi && year < p.statePensionYear) {
        health += 12 * RATES.healthInsurance.voluntaryMonthly;
      }
    }
    const need = (r.spending.perpetual + health) * duration *
      (1 + (a.spendingGrowth || 0)) ** Math.max(0, year - fiYear);
    pf -= Math.max(0, need - income);
    if (pf < -1) return false;
    pf *= (1 + a.realReturn) ** duration;
  }
  return true;
}

// --- the invariants ---------------------------------------------------------

for (const [i, input] of CASES.entries()) {
  const tag = `case ${i} [${input.label}]`;
  const r = simulate(input);
  const P = r.persons;

  // 1. Ownership must add up. (Bug: the house money was counted twice, so the
  //    per-person figures exceeded the household portfolio by €281,739.)
  if (Number.isFinite(r.timeline.yearsToFi)) {
    const sum = r.fi.ownershipAtFi.reduce((x, o) => x + o.portfolio, 0);
    // Against what will actually be held, not the minimum required - the plan
    // is walked in whole years, so stopping lands a little above the bar.
    close(sum, r.fi.atFiDate, 1, `${tag}: per-person portfolios sum to the FI-date portfolio`);
    ok(r.fi.number <= r.fi.atFiDate + 1, `${tag}: the requirement is not above what is held`,
       `${Math.round(r.fi.number)} vs ${Math.round(r.fi.atFiDate)}`);
  }

  // 2. Starting balances must add up too.
  close(P.reduce((x, p) => x + p.startPortfolio, 0), r.portfolio.start, 0.01,
        `${tag}: per-person starting balances sum to the household portfolio`);

  // 3. House cash leaves on completion, not today, and the retained emergency
  //    reserve must still be present then.
  if (r.house) {
    const held = input.persons.reduce((x, p) => x + p.assets.cash + p.assets.investmentAccount, 0);
    close(r.portfolio.start, held, 1, `${tag}: planned house cost is not deducted today`);
    if (r.house.feasible) {
      ok(r.house.fundsAtCompletion - r.house.cashToComplete >= r.house.emergencyFund - 1,
         `${tag}: completion leaves the selected emergency reserve`);
    } else {
      ok(!Number.isFinite(r.timeline.yearsToFi),
         `${tag}: an unfunded purchase blocks the FI result`);
    }
  }

  // 4. Excluded assets must never reach the target.
  const excluded = input.persons.reduce(
    (x, p) => x + p.assets.pillar2 + p.assets.pillar3 + p.assets.crypto, 0);
  ok(excluded === 0 || r.portfolio.start < excluded + 1e9, `${tag}: excluded assets tracked`);
  close(r.portfolio.excluded, excluded, 0.01, `${tag}: excluded total matches the inputs`);

  // 5. Nothing to invest means no FI date. (Bug: reported "age at FI 122",
  //    reached by compounding alone.)
  if (!r.house && r.savings.surplusAfterMove <= 0 && r.fi.number > r.portfolio.start) {
    ok(!Number.isFinite(r.timeline.yearsToFi) || r.timeline.yearsToFi > 60,
       `${tag}: no FI date when there is no surplus`);
  }

  // 6. Every person carries their own age and pension unlock. (Bug: both were
  //    taken from person 1, so a younger partner's 16-year bridge read as 11.)
  ok(r.timeline.agesAtFi.length === input.persons.length, `${tag}: an age per person`);
  ok(r.timeline.pensionPerPerson.length === input.persons.length, `${tag}: an unlock per person`);
  for (const p of P) {
    ok(p.ageAtFi > p.ageNow || !Number.isFinite(r.timeline.yearsToFi),
       `${tag}: ${p.name} ages between now and FI`);
  }
  // The bridge is set by whoever waits longest, not by the first person listed.
  const latest = Math.max(...r.persons.map((x) => x.pillarDrawYear));
  if (Number.isFinite(r.timeline.yearsToFi)) {
    close(r.timeline.bridgeYears, Math.max(0, latest - (r.currentYear + r.timeline.yearsToFi)),
          0.01, `${tag}: bridge uses the longest wait`);
  }

  // 7. Pillar III must cost what it costs. (Bug: contributions produced a
  //    refund but never reduced the money available to invest.)
  const p3net = P.reduce((x, p) => x + Math.max(0, p.pillar3.contribution - p.pillar3.refund), 0);
  close(r.savings.pillar3NetCost, p3net, 0.01, `${tag}: Pillar III net cost is deducted`);

  // 7b. Insurance premiums are outgoings, never assets: they must reduce the
  //     surplus and must not appear in the portfolio.
  const prem = (flag, amount) => input.persons.reduce(
    (x, p) => x + (p[flag] ? p[amount] * 12 : 0), 0);
  const life = prem('lifeInsurance', 'lifeInsuranceMonthly');
  const health = prem('healthInsurance', 'healthInsuranceMonthly');
  close(r.savings.lifeInsuranceCost, life, 0.01, `${tag}: life premiums are deducted`);
  close(r.savings.healthInsuranceCost, health, 0.01, `${tag}: health contracts are deducted`);
  close(r.savings.surplusAfterMove,
        r.income.householdNetIncome - r.spending.afterMove - p3net - life - health, 0.01,
        `${tag}: surplus accounts for Pillar III and both premiums`);

  // Someone paying for cover must never be told they have none.
  const plan = actionPlan(r, input);
  if (input.persons.every((p) => p.lifeInsurance)) {
    ok(!plan.some((f) => f.id === 'no-life-cover'),
       `${tag}: no life-cover finding when everyone is covered`);
  }
  if (input.persons.every((p) => p.healthInsurance || p.income.grossMonthly > 0)) {
    ok(!plan.some((f) => f.id === 'health-insurance-gap'),
       `${tag}: no health-gap finding when everyone is covered or employed`);
  }
  // ...and someone with neither a job nor a contract must always be told, unless
  // RaKS 5(4)(4) covers them: within five years of pension age, through a
  // partner who is still working.
  const anyEmployed = input.persons.some((p) => p.income.grossMonthly > 0);
  for (const [i, p] of input.persons.entries()) {
    if (p.healthInsurance || p.income.grossMonthly) continue;
    const person = r.persons[i];
    const toPension = person.pension.statePensionAge - person.ageNow;
    const bySpouse = anyEmployed && toPension >= 0 &&
      toPension <= RATES.healthInsurance.dependentSpouseNearPensionYears;
    if (bySpouse) {
      ok(!plan.some((f) => f.id === 'health-insurance-gap'),
         `${tag}: ${p.name} not told to buy cover they already have`);
    } else {
      ok(plan.some((f) => f.id === 'health-insurance-gap'),
         `${tag}: ${p.name} flagged as uninsured`);
    }
  }

  // 8. A refund can never exceed the tax actually paid.
  for (const p of P) {
    ok(p.pillar3.refund <= p.tax.incomeTax + 0.01,
       `${tag}: ${p.name} refund within tax paid`,
       `${Math.round(p.pillar3.refund)} > ${Math.round(p.tax.incomeTax)}`);
  }

  // 9. Allocation shares are a partition.
  close(P.reduce((x, p) => x + p.share, 0), 1, 1e-9, `${tag}: shares sum to 1`);

  // 10. Findings must be about this household, and each must carry a figure.
  for (const f of actionPlan(r, input)) {
    ok(typeof f.value === 'string' && f.value.length > 0, `${tag}: finding "${f.id}" has a value`);
    ok(!/NaN|Infinity|undefined/.test(f.title + f.value + f.detail),
       `${tag}: finding "${f.id}" is free of NaN/undefined`);
  }

  // 12. The bridged plan must actually hold. This is the one that matters: the
  //     engine solves for the earliest stop date, so an off-by-one in the
  //     drawdown loop would quietly hand back a date that runs out of money.
  if (r.fi.bridging && Number.isFinite(r.timeline.yearsToFi)) {
    ok(survivesIndependently(input, r), `${tag}: bridged plan survives to the end`);
  }

  // 13. Leaning on the pension can only bring the date forward, never push it
  //     out - provided the portfolio actually outgrows the withdrawal rate.
  if (r.fi.bridging && r.assumptions.realReturn > r.assumptions.swr &&
      Number.isFinite(r.fi.yearsPerpetual)) {
    ok(r.fi.yearsBridged <= r.fi.yearsPerpetual + 0.01,
       `${tag}: bridging never delays FI`,
       `${r.fi.yearsBridged?.toFixed(1)} vs ${r.fi.yearsPerpetual.toFixed(1)}`);
  }

  // 14. Contributions stop when work stops. Retiring before the unlock date
  //     must therefore produce a smaller pot than working right up to it - the
  //     whole reason the FI date and the pension have to be solved together.
  for (const p of P) {
    const yrsToUnlock = p.pensionUnlockYear - r.currentYear;
    if (Number.isFinite(r.timeline.yearsToFi) && r.timeline.yearsToFi < yrsToUnlock - 1 &&
        p.grossAnnual > 0) {
      // Spending so high that FI never arrives, which pins contributions to the
      // unlock date and gives the largest pot the person could reach. Inflate
      // `other`, not `housing`: a house purchase replaces housing with the
      // mortgage, so housing has no effect on spending after the move.
      const workingOn = simulate({
        ...input,
        household: { ...input.household, spending: { ...input.household.spending, other: 1e6 } },
      });
      const same = workingOn.persons.find((q) => q.name === p.name);
      ok(p.pensionAtUnlock <= same.pensionAtUnlock + 1,
         `${tag}: ${p.name} stopping early cannot grow the pension pot`);
    }
  }

  // 16. Deferring the pots to state pension age leaves them invested for longer,
  //     so the pot must be bigger and the wait must be longer. Never the reverse.
  if (r.fi.bridging) {
    const deferred = simulate({
      ...input,
      assumptions: { ...input.assumptions, pillarDrawAge: 'statePension' },
    });
    for (const [i, p] of P.entries()) {
      const d = deferred.persons[i];
      ok(d.pensionAtUnlock >= p.pensionAtUnlock - 0.01,
         `${tag}: ${p.name} deferring cannot shrink the pot`,
         `${Math.round(p.pensionAtUnlock)} -> ${Math.round(d.pensionAtUnlock)}`);
      ok(d.pillarDrawYear >= p.pillarDrawYear,
         `${tag}: ${p.name} deferring cannot bring the pots forward`);
      ok(d.pillarDrawYear <= d.statePensionYear + 0.01,
         `${tag}: ${p.name} deferred draw never passes state pension age`);
    }
  }

  // 17. A fund pension must actually stop, and the plan must survive its
  //     stopping. This is the point of the option: from the day the pots run
  //     dry the portfolio is back to carrying the household, and the money has
  //     to still be there. Covered by check 12's independent walk, but assert
  //     the mechanism directly too.
  if (r.fi.bridging) {
    const fund = simulate({
      ...input,
      assumptions: { ...input.assumptions, pillarPayout: 'fundPension' },
    });
    const life = simulate({
      ...input,
      assumptions: { ...input.assumptions, pillarPayout: 'annuity' },
    });
    for (const p of fund.persons) {
      ok(Number.isFinite(p.pillarIncomeEndYear),
         `${tag}: ${p.name} fund pension has an end date`);
      ok(p.pillarIncomeEndYear > p.pillarDrawYear,
         `${tag}: ${p.name} fund pension ends after it starts`);
    }
    for (const p of life.persons) {
      ok(!Number.isFinite(p.pillarIncomeEndYear),
         `${tag}: ${p.name} lifetime annuity never ends`);
    }
    // A real annuity quote is an external price, so it cannot be ordered against
    // a fund pension derived from the pot. We only assert its nominal payment
    // does not gain real purchasing power.
    for (const l of life.persons) {
      ok(l.pensionIncomeFinal <= l.pensionIncome + 0.01,
         `${tag}: ${l.name} a quoted nominal annuity never gains real value`);
    }
    ok(survivesIndependently({ ...input, assumptions: { ...input.assumptions, pillarPayout: 'fundPension' } }, fund),
       `${tag}: the plan survives the fund pension running out`);
  }

  // 15. Pillar I accrues per year worked, so a shorter career must buy less.
  if (r.fi.policy === 'all') {
    for (const p of P) {
      // Only meaningful when FI actually comes first. A plan whose FI date falls
      // after state pension age involves MORE work than "working on", not less,
      // so the comparison inverts and asserting it would be asserting nonsense.
      const stopsEarly = r.currentYear + r.timeline.yearsToFi < p.statePensionYear;
      if (stopsEarly) {
        ok(p.statePensionIncome <= p.statePensionIfWorkedOn + 0.01,
           `${tag}: ${p.name} early stop cannot raise the state pension`);
      }
      ok(p.statePensionIncome >= 12 * RATES.pillar1.nationalPensionMonthly - 0.01,
         `${tag}: ${p.name} state pension is at least the national pension`);
    }
  }

  // 18. The published schedule must be the same walk the solver used. It is the
  //     one part of the output a reader can audit line by line, so if it and the
  //     FI date ever disagree, the page is lying in a way nobody can detect.
  if (r.schedule.length) {
    const asm = { ...DEFAULTS, ...input.assumptions };
    const first = r.schedule[0];
    const last = r.schedule[r.schedule.length - 1];
    close(first.opening, r.fi.atFiDate, 1, `${tag}: the schedule opens at the FI-date portfolio`);
    ok(first.year >= Math.floor(r.currentYear + r.timeline.yearsToFi),
       `${tag}: the schedule starts when work stops`);
    const planEnd = r.currentYear + Math.max(...r.persons.map((p) => asm.planToAge - p.ageNow));
    ok(last.year === Math.floor(planEnd) - 1 || last.year === Math.ceil(planEnd) - 1,
       `${tag}: the schedule runs to the end of the plan`,
       `${last.year} vs ${Math.round(planEnd) - 1}`);

    let balance = first.opening;
    for (const row of r.schedule) {
      // Sources must account for the whole requirement, with nothing invented.
      const covered = row.fromPortfolio + row.fromPots + row.fromState;
      ok(covered >= row.need - 0.01,
         `${tag}: ${row.year} sources cover the spending`,
         `${Math.round(covered)} vs ${Math.round(row.need)}`);
      ok(row.fromPortfolio >= -0.01, `${tag}: ${row.year} the portfolio never contributes negatively`);
      // The portfolio only makes up what the pensions do not.
      close(row.fromPortfolio, Math.max(0, row.need - row.fromPots - row.fromState), 0.01,
            `${tag}: ${row.year} the portfolio covers exactly the shortfall`);
      // And the balance must roll forward the way it claims to.
      close(row.opening, balance, 1, `${tag}: ${row.year} opening balance follows the previous close`);
      close(row.closing, (row.opening - row.fromPortfolio) *
            (1 + asm.realReturn) ** row.investedFor, 1,
            `${tag}: ${row.year} closing balance is the arithmetic it states`);
      ok(row.closing >= -1, `${tag}: ${row.year} the portfolio never goes negative`);
      balance = row.closing;
    }

    // Pension income may only appear inside its own window.
    for (const row of r.schedule) {
      if (row.fromPots > 0.5) {
        ok(r.persons.some((p) =>
          (row.year >= p.pillar2DrawYear && row.year < p.pillar2DrawYear + (p.payoutYears || Infinity)) ||
          (p.pillar3DrawYear != null && row.year >= p.pillar3DrawYear &&
            row.year < p.pillar3DrawYear + (p.payoutYears || Infinity))),
           `${tag}: ${row.year} pot income only inside its payout window`);
      }
      if (row.fromState > 0.5) {
        ok(r.fi.policy === 'all' && r.persons.some((p) => row.year >= p.statePensionYear),
           `${tag}: ${row.year} state pension only from state pension age`);
      }
    }
  } else {
    const planEnd = ({ ...DEFAULTS, ...input.assumptions }).planToAge -
      Math.min(...r.persons.map((p) => p.ageNow));
    ok(!Number.isFinite(r.timeline.yearsToFi) || r.timeline.yearsToFi >= planEnd,
       `${tag}: a schedule exists whenever FI arrives inside the plan`,
       `yearsToFi ${r.timeline.yearsToFi}`);
  }

  // 11. Nothing rendered anywhere may be NaN.
  const walk = (o, path = '') => {
    if (typeof o === 'number') ok(Number.isFinite(o) || o === Infinity, `${tag}: ${path} is a number`);
    else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => walk(v, `${path}.${k}`));
  };
  walk({ fi: r.fi, savings: r.savings, spending: r.spending, portfolio: r.portfolio });
}

// A suite that only ever exercises the "no FI date" path proves very little, so
// the split is reported rather than assumed.
const solvent = CASES.filter((c) => Number.isFinite(simulate(c).timeline.yearsToFi)).length;
console.log(`\n${CASES.length} households (${solvent} reaching FI), ${checks} invariant checks`);
if (solvent === 0 || solvent === CASES.length) {
  console.log('\nFAILED: the fixtures only cover one path — they must include both');
  process.exit(1);
}
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  [...new Set(failures)].slice(0, 40).forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('all invariants hold\n');
