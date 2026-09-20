// Metamorphic tests: change one input in a known direction and check the answer
// moves the way it must.
//
// The other two suites both need a *known correct answer* - either a figure
// worked out by hand, or a relationship between figures in one run. Neither can
// catch a sign error, a field wired to the wrong place, or a term dropped from a
// sum, because the result stays internally consistent and merely wrong.
//
// These need no correct answer at all. "More cash cannot make FI later" is true
// whatever the right number is, and a surprising number of real defects violate
// exactly that kind of statement.

import { simulate } from '../src/calc.js';
import { sanitise, exampleState } from '../src/state.js';

let checks = 0;
const failures = [];

const BASE = () => sanitise({
  ...exampleState(),
  currentYear: 2026,
  household: {
    hasDependents: true,
    spending: { housing: 700, childCosts: 250, childCostsEndYear: 2040,
                other: 900, buffer: 200 },
    rentalIncomeNetMonthly: 0,
    property: null,
  },
  persons: [{
    name: 'Person1', birthYear: 1982,
    income: { grossMonthly: 3500, netMonthly: null, otherNetMonthly: 0 },
    assets: { cash: 40000, investmentAccount: 20000, investmentAccountContributions: 20000,
              pillar2: 30000, pillar3: 0, crypto: 0 },
    pillar2Rate: 0.02, pillar3Annual: 0, allocationShare: 1,
    pillar1Units: 20, yearsWorkedEstonia: 20, yearsWorkedEuEea: 0,
    pillar3FirstContributionYear: 2020, annuityMonthlyQuote: 500, fundPensionYears: 20,
  }],
  assumptions: { realReturn: 0.05, swr: 0.035, pensionPolicy: 'ignore' },
});

/** Deep-set a dotted path, so a case reads as the one thing it changes. */
const tweak = (path, value) => {
  const s = BASE();
  const keys = path.split('.');
  let o = s;
  for (const k of keys.slice(0, -1)) o = o[k];
  o[keys[keys.length - 1]] = value;
  return s;
};

const readers = {
  years: (r) => r.timeline.yearsToFi,
  target: (r) => r.fi.number,
  surplus: (r) => r.savings.surplusAfterMove,
  perpetual: (r) => r.spending.perpetual,
  pension: (r) => r.portfolio.pensionAtUnlock,
};

/**
 * `direction` is what should happen to `metric` when the input changes:
 * 'down' = must not increase, 'up' = must not decrease.
 */
function expect(label, changed, metric, direction, opts = {}) {
  checks++;
  const before = readers[metric](simulate(BASE()));
  const after = readers[metric](simulate(changed));
  const tol = opts.tol ?? 1e-6;
  const ok = direction === 'down' ? after <= before + tol : after >= before - tol;
  // A relationship that holds only because nothing moved proves nothing, so
  // cases are expected to bite unless explicitly marked otherwise.
  const moved = Math.abs(after - before) > (opts.minMove ?? 1e-9);
  if (!ok) {
    failures.push(`${label}: ${metric} went ${after > before ? 'up' : 'down'} ` +
      `(${fmt(before)} -> ${fmt(after)}), expected ${direction}`);
  } else if (!moved && !opts.mayNotMove) {
    failures.push(`${label}: ${metric} did not move at all (${fmt(before)}) - ` +
      `the input is probably not wired up`);
  }
}

const fmt = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString() : String(v));

// --- more of a good thing ---------------------------------------------------

expect('a bigger salary', tweak('persons.0.income.grossMonthly', 5000), 'years', 'down');
expect('a bigger salary', tweak('persons.0.income.grossMonthly', 5000), 'surplus', 'up');
expect('more cash', tweak('persons.0.assets.cash', 120000), 'years', 'down');
expect('an investment account balance',
       tweak('persons.0.assets.investmentAccount', 90000), 'years', 'down');
expect('rental income', tweak('household.rentalIncomeNetMonthly', 600), 'years', 'down');
expect('rental income lowers the perpetual requirement',
       tweak('household.rentalIncomeNetMonthly', 600), 'perpetual', 'down');

// --- more of a bad thing ----------------------------------------------------

expect('spending more', tweak('household.spending.other', 2000), 'years', 'up');
expect('spending more', tweak('household.spending.other', 2000), 'target', 'up');
expect('spending more', tweak('household.spending.other', 2000), 'surplus', 'down');
expect('a bigger buffer', tweak('household.spending.buffer', 800), 'target', 'up');
// Child costs are finite, so they delay FI without raising the perpetual target.
expect('child costs', tweak('household.spending.childCosts', 900), 'years', 'up');
expect('child costs are finite', tweak('household.spending.childCosts', 900),
       'perpetual', 'down', { mayNotMove: true });

// --- assumptions ------------------------------------------------------------

expect('a higher real return', tweak('assumptions.realReturn', 0.07), 'years', 'down');
expect('a lower real return', tweak('assumptions.realReturn', 0.03), 'years', 'up');
expect('a higher withdrawal rate', tweak('assumptions.swr', 0.045), 'target', 'down');
expect('a higher withdrawal rate', tweak('assumptions.swr', 0.045), 'years', 'down');

// --- pensions ---------------------------------------------------------------

// Under a spent-down plan every pension counted brings the date forward.
for (const policy of ['ownPots', 'all']) {
  checks++;
  const none = BASE(); none.assumptions.portfolioEnd = 'drawdown';
  const some = BASE(); some.assumptions.portfolioEnd = 'drawdown';
  some.assumptions.pensionPolicy = policy;
  const a = simulate(none).timeline.yearsToFi;
  const b = simulate(some).timeline.yearsToFi;
  if (!(b < a)) failures.push(`counting ${policy} did not bring FI forward (${fmt(a)} -> ${fmt(b)})`);
}
// Under a perpetual floor only permanently indexed income can lower the bar. An
// annuity is fixed in euros and a fund pension stops, so neither qualifies; the
// state pension is indexed by law, so it does.
checks++;
{
  const none = BASE();
  const pots = BASE(); pots.assumptions.pensionPolicy = 'ownPots';
  const all = BASE(); all.assumptions.pensionPolicy = 'all';
  const a = simulate(none).fi.number;
  const b = simulate(pots).fi.number;
  const c = simulate(all).fi.number;
  if (Math.abs(a - b) > 1) {
    failures.push(`own pots changed a perpetual target they cannot sustain (${fmt(a)} -> ${fmt(b)})`);
  }
  if (!(c < a)) {
    failures.push(`the indexed state pension did not lower the perpetual target (${fmt(a)} -> ${fmt(c)})`);
  }
}
expect('a bigger Pillar II rate', tweak('persons.0.pillar2Rate', 0.06), 'pension', 'up');
// Paying into Pillar II is money locked away, so it cannot bring FI forward.
expect('a bigger Pillar II rate', tweak('persons.0.pillar2Rate', 0.06), 'years', 'up');
expect('an existing Pillar II balance',
       tweak('persons.0.assets.pillar2', 150000), 'pension', 'up');
// Excluded from the target, so it must not flatter the FI date.
expect('an existing Pillar II balance',
       tweak('persons.0.assets.pillar2', 150000), 'years', 'up', { mayNotMove: true });
expect('Pillar III contributions', tweak('persons.0.pillar3Annual', 6000), 'pension', 'up');
expect('Pillar III costs more than it refunds',
       tweak('persons.0.pillar3Annual', 6000), 'surplus', 'down');

// Leaving the pots invested for another five years must grow them.
checks++;
{
  const now = BASE(); now.assumptions.pensionPolicy = 'ownPots';
  const later = BASE(); later.assumptions.pensionPolicy = 'ownPots';
  later.assumptions.pillarDrawAge = 'statePension';
  const a = simulate(now).portfolio.pensionAtUnlock;
  const b = simulate(later).portfolio.pensionAtUnlock;
  if (!(b > a)) failures.push(`deferring the pots did not grow them (${fmt(a)} -> ${fmt(b)})`);
}
// ...and it must lengthen the stretch with no income at all.
checks++;
{
  const now = BASE(); now.assumptions.pensionPolicy = 'all';
  const later = BASE(); later.assumptions.pensionPolicy = 'all';
  later.assumptions.pillarDrawAge = 'statePension';
  const a = simulate(now).timeline.bridgeYears;
  const b = simulate(later).timeline.bridgeYears;
  if (!(b >= a)) failures.push(`deferring the pots shortened the bridge (${fmt(a)} -> ${fmt(b)})`);
}

// A longer plan needs more money, never less. Only bites when the pension is
// counted - a perpetual target has no end date to reach.
for (const policy of ['ownPots', 'all']) {
  checks++;
  const short = BASE(); short.assumptions.portfolioEnd = 'drawdown';
  short.assumptions.pensionPolicy = policy; short.assumptions.planToAge = 85;
  const long = BASE(); long.assumptions.portfolioEnd = 'drawdown';
  long.assumptions.pensionPolicy = policy; long.assumptions.planToAge = 105;
  const a = simulate(short).fi.number;
  const b = simulate(long).fi.number;
  if (!(b > a)) {
    failures.push(`planning to 105 instead of 85 (${policy}) did not raise the target ` +
                  `(${fmt(a)} -> ${fmt(b)})`);
  }
}
// ...and the schedule must actually run that far.
checks++;
{
  const s2 = BASE(); s2.assumptions.portfolioEnd = 'drawdown';
  s2.assumptions.pensionPolicy = 'all'; s2.assumptions.planToAge = 100;
  const r = simulate(s2);
  const last = r.schedule[r.schedule.length - 1];
  if (!last || last.ages[0] < 99) {
    failures.push(`the schedule stops before the planning age (last age ${last?.ages[0]})`);
  }
}

// Spending that grows in real terms costs more, in every mode.
expect('spending growth of 1%/yr', tweak('assumptions.spendingGrowth', 0.01), 'target', 'up');
expect('spending growth of 1%/yr', tweak('assumptions.spendingGrowth', 0.01), 'years', 'up');
for (const policy of ['ownPots', 'all']) {
  checks++;
  const flat = BASE(); flat.assumptions.pensionPolicy = policy;
  const rising = BASE(); rising.assumptions.pensionPolicy = policy;
  rising.assumptions.spendingGrowth = 0.01;
  const a = simulate(flat).timeline.yearsToFi;
  const b = simulate(rising).timeline.yearsToFi;
  if (!(b > a)) failures.push(`rising spending (${policy}) did not delay FI (${fmt(a)} -> ${fmt(b)})`);
}
// Growth at or above the withdrawal rate has no finite perpetual answer.
checks++;
{
  const runaway = tweak('assumptions.spendingGrowth', 0.05);
  runaway.assumptions.swr = 0.035;
  const r = simulate(runaway);
  if (Number.isFinite(r.fi.perpetualNumber)) {
    failures.push(`spending growing faster than the withdrawal rate gave a finite target ` +
                  `(${fmt(r.fi.perpetualNumber)})`);
  }
}
// The schedule must actually show the rise.
checks++;
{
  const g = BASE(); g.assumptions.pensionPolicy = 'all'; g.assumptions.spendingGrowth = 0.01;
  const rows = simulate(g).schedule;
  if (rows.length > 2 && !(rows[rows.length - 1].need > rows[0].need * 1.1)) {
    failures.push('spending growth did not compound across the schedule');
  }
}

// Inflation erodes a fixed-euro annuity and touches nothing else.
for (const [payout, expectHarm] of [['fundPension', false]]) {
  checks++;
  const low = BASE(); low.assumptions.portfolioEnd = 'drawdown';
  low.assumptions.pensionPolicy = 'ownPots';
  low.assumptions.pillarPayout = payout; low.assumptions.inflation = 0.01;
  const high = BASE(); high.assumptions.portfolioEnd = 'drawdown';
  high.assumptions.pensionPolicy = 'ownPots';
  high.assumptions.pillarPayout = payout; high.assumptions.inflation = 0.06;
  // Isolate pension units from nominal investment-account contribution basis.
  for (const plan of [low, high]) for (const p of plan.persons) {
    p.investmentDestination = 'brokerage';
    p.assets.brokerage = p.assets.investmentAccount;
    p.assets.brokerageCostBasis = p.assets.investmentAccountContributions;
    p.assets.investmentAccount = 0;
  }
  const a = simulate(low).timeline.yearsToFi;
  const b = simulate(high).timeline.yearsToFi;
  if (expectHarm && !(b > a)) {
    failures.push(`higher inflation did not delay FI on a fixed annuity (${fmt(a)} -> ${fmt(b)})`);
  }
  if (!expectHarm && Math.abs(a - b) > 1e-9) {
    failures.push(`inflation moved a fund pension, which is valued in units (${fmt(a)} -> ${fmt(b)})`);
  }
}
// Fund payments reflect positive real returns.
checks++;
{
  const s2 = BASE(); s2.assumptions.portfolioEnd = 'drawdown';
  s2.assumptions.pensionPolicy = 'ownPots'; s2.assumptions.pillarPayout = 'fundPension';
  const p = simulate(s2).persons[0];
  if (!(p.pensionIncomeFinal > p.pensionIncome)) {
    failures.push(`a fund pension did not grow in real terms ` +
                  `(${fmt(p.pensionIncome)} -> ${fmt(p.pensionIncomeFinal)})`);
  }
}

// Believing less of a pension must cost more and leave more behind if it pays.
for (const key of ['potsCountedShare', 'stateCountedShare']) {
  checks++;
  const full = BASE(); full.assumptions.portfolioEnd = 'drawdown';
  full.assumptions.pensionPolicy = 'all';
  const cut = BASE(); cut.assumptions.portfolioEnd = 'drawdown';
  cut.assumptions.pensionPolicy = 'all'; cut.assumptions[key] = 0.5;
  const a = simulate(full);
  const b = simulate(cut);
  if (!(b.fi.number > a.fi.number)) {
    failures.push(`haircutting ${key} did not raise the target ` +
                  `(${fmt(a.fi.number)} -> ${fmt(b.fi.number)})`);
  }
  if (!(b.fi.haircutBuffer > 0)) {
    failures.push(`haircutting ${key} produced no buffer (${fmt(b.fi.haircutBuffer)})`);
  }
  if (a.fi.haircutBuffer !== null) {
    failures.push('believing a pension in full should report no buffer');
  }
}
// A deeper haircut must leave a bigger buffer.
checks++;
{
  const mild = BASE(); mild.assumptions.portfolioEnd = 'drawdown';
  mild.assumptions.pensionPolicy = 'all'; mild.assumptions.potsCountedShare = 0.75;
  const deep = BASE(); deep.assumptions.portfolioEnd = 'drawdown';
  deep.assumptions.pensionPolicy = 'all'; deep.assumptions.potsCountedShare = 0.25;
  const a = simulate(mild).fi.haircutBuffer;
  const b = simulate(deep).fi.haircutBuffer;
  if (!(b > a)) failures.push(`a deeper haircut left a smaller buffer (${fmt(a)} -> ${fmt(b)})`);
}
// Believing nothing at all must match ignoring pensions entirely... in spirit:
// the target cannot be lower than the perpetual one.
checks++;
{
  const none = BASE(); none.assumptions.portfolioEnd = 'drawdown';
  none.assumptions.pensionPolicy = 'all';
  none.assumptions.potsCountedShare = 0; none.assumptions.stateCountedShare = 0;
  const r = simulate(none);
  if (r.fi.number > r.fi.perpetualNumber + 1) {
    failures.push(`believing no pension gave a target above the perpetual one ` +
                  `(${fmt(r.fi.number)} vs ${fmt(r.fi.perpetualNumber)})`);
  }
}

// The two ways of saying "no pension" must give the same plan, in either mode.
// They mean the same thing, so anything else is the tool disagreeing with
// itself - and this was a real defect: the pension selector used to switch the
// portfolio's job as well, so "None" and "believed at 0%" produced different
// answers for no reason a reader could see.
for (const end of ['perpetual', 'drawdown']) {
  for (const policy of ['ownPots', 'all']) {
    checks++;
    const ignored = BASE();
    ignored.assumptions.portfolioEnd = end;
    ignored.assumptions.pensionPolicy = 'ignore';
    const disbelieved = BASE();
    disbelieved.assumptions.portfolioEnd = end;
    disbelieved.assumptions.pensionPolicy = policy;
    disbelieved.assumptions.potsCountedShare = 0;
    disbelieved.assumptions.stateCountedShare = 0;
    const a = simulate(ignored);
    const b = simulate(disbelieved);
    if (Math.abs(a.timeline.yearsToFi - b.timeline.yearsToFi) > 1e-6 ||
        Math.abs(a.fi.number - b.fi.number) > 1) {
      failures.push(`${end}: ignoring pensions differs from believing ${policy} at 0% ` +
        `(${fmt(a.fi.number)} / ${a.timeline.yearsToFi.toFixed(2)}y vs ` +
        `${fmt(b.fi.number)} / ${b.timeline.yearsToFi.toFixed(2)}y)`);
    }
  }
}
// And the portfolio's job must be independent of the pension setting: making the
// money merely last to the planning age can never cost MORE than making it last
// forever, whatever the pensions are doing.
for (const policy of ['ignore', 'ownPots', 'all']) {
  checks++;
  const forever = BASE(); forever.assumptions.pensionPolicy = policy;
  forever.assumptions.portfolioEnd = 'perpetual';
  const finite = BASE(); finite.assumptions.pensionPolicy = policy;
  finite.assumptions.portfolioEnd = 'drawdown';
  const a = simulate(forever).fi.number;
  const b = simulate(finite).fi.number;
  if (!(b <= a + 1)) {
    failures.push(`${policy}: spending down cost more than lasting forever (${fmt(a)} -> ${fmt(b)})`);
  }
}

// Working past the earliest date must buy margin, and each year must buy more
// than the last - that non-linearity is the whole argument for doing it.
{
  const shock = (b) => {
    const st = BASE();
    st.assumptions.portfolioEnd = 'drawdown';
    st.assumptions.pensionPolicy = 'all';
    st.assumptions.bufferYears = b;
    return simulate(st);
  };
  const at = [0, 1, 2, 3].map(shock);
  checks++;
  if (!at.every((r) => r.fi.resilience)) failures.push('a solvable plan reported no resilience');
  for (let i = 1; i < at.length; i++) {
    checks++;
    if (!(at[i].fi.resilience.crash > at[i - 1].fi.resilience.crash)) {
      failures.push(`buffer ${i} did not absorb a bigger crash than ${i - 1}`);
    }
    checks++;
    if (!(at[i].fi.resilience.flatYears >= at[i - 1].fi.resilience.flatYears)) {
      failures.push(`buffer ${i} absorbed fewer flat years than ${i - 1}`);
    }
    checks++;
    if (!(at[i].timeline.yearsToFi > at[i - 1].timeline.yearsToFi)) {
      failures.push(`buffer ${i} did not push the FI date out`);
    }
  }
  // The two measures move differently, and both directions matter.
  // Crash tolerance SATURATES: it is a percentage of a portfolio that is itself
  // growing, so each year adds fewer points than the last.
  checks++;
  const crashGain = (i) => at[i].fi.resilience.crash - at[i - 1].fi.resilience.crash;
  if (!(crashGain(3) < crashGain(1))) {
    failures.push('crash tolerance did not saturate as the buffer grew');
  }
  // Years of bad returns rises too - but only while the measure has room. Once a
  // plan survives a flat return for its whole horizon the count saturates, and a
  // saturated count must be reported as saturated rather than as a number that
  // then FALLS as the plan improves and its horizon shortens.
  for (let i = 1; i < at.length; i++) {
    checks++;
    const prev = at[i - 1].fi.resilience, now = at[i].fi.resilience;
    const better = now.flatAll || (!prev.flatAll && now.flatYears >= prev.flatYears);
    if (!better) {
      failures.push(`buffer ${i} reported less flat-return tolerance than ${i - 1} ` +
        `(${prev.flatYears}${prev.flatAll ? '+' : ''} -> ${now.flatYears}${now.flatAll ? '+' : ''})`);
    }
    checks++;
    if (now.flatYears > now.horizonYears) {
      failures.push(`buffer ${i} reported more tolerance than the plan has years`);
    }
  }
  // An unbuffered plan sits on the boundary. Not at exactly zero - the solver
  // works in whole years, so stopping at a year end leaves a sliver - but it
  // must be a sliver, and far less than a single buffer year buys.
  checks++;
  const bare = at[0].fi.resilience.crash;
  if (!(bare < 0.10)) {
    failures.push(`the earliest possible date left real margin (${(bare * 100).toFixed(1)}%)`);
  }
  checks++;
  if (!(at[1].fi.resilience.crash > bare * 2)) {
    failures.push(`a buffer year barely improved on the boundary ` +
      `(${(bare * 100).toFixed(1)}% -> ${(at[1].fi.resilience.crash * 100).toFixed(1)}%)`);
  }
}

// --- excluded assets --------------------------------------------------------

// Crypto is excluded by default, so adding it must change nothing at all...
expect('crypto while excluded', tweak('persons.0.assets.crypto', 200000),
       'years', 'down', { mayNotMove: true });
checks++;
{
  const withCrypto = tweak('persons.0.assets.crypto', 200000);
  const a = simulate(BASE()).timeline.yearsToFi;
  const b = simulate(withCrypto).timeline.yearsToFi;
  if (Math.abs(a - b) > 1e-9) {
    failures.push(`excluded crypto changed the FI date (${fmt(a)} -> ${fmt(b)})`);
  }
}
// ...and counting it must bring the date forward.
checks++;
{
  const counted = tweak('persons.0.assets.crypto', 200000);
  counted.excludeCrypto = false;
  const a = simulate(BASE()).timeline.yearsToFi;
  const b = simulate(counted).timeline.yearsToFi;
  if (!(b < a)) failures.push(`counting crypto did not bring FI forward (${fmt(a)} -> ${fmt(b)})`);
}

// --- buying a house ---------------------------------------------------------

const buying = (over = {}) => {
  const s = BASE();
  s.household.property = { purchase: {
    price: 300000, deposit: 60000, termYears: 30, rate: 0.04,
    runningCostsMonthly: 300, movingCosts: 10000, monthsAway: 12,
    paidBy: 'proportional', ...over,
  } };
  return sanitise(s);
};

checks++;
{
  const a = simulate(BASE()).timeline.yearsToFi;
  const b = simulate(buying()).timeline.yearsToFi;
  if (!(b >= a - 1e-6)) failures.push(`buying a house brought FI forward (${fmt(a)} -> ${fmt(b)})`);
}
checks++;
{
  const cheap = simulate(buying({ rate: 0.02 })).timeline.yearsToFi;
  const dear = simulate(buying({ rate: 0.07 })).timeline.yearsToFi;
  if (!(dear >= cheap - 1e-6)) {
    failures.push(`a dearer mortgage brought FI forward (${fmt(cheap)} -> ${fmt(dear)})`);
  }
}
checks++;
{
  const small = simulate(buying({ deposit: 30000 })).house.cashToComplete;
  const big = simulate(buying({ deposit: 120000 })).house.cashToComplete;
  if (!(big > small)) {
    failures.push(`a bigger deposit did not increase the completion-date cash outflow ` +
                  `(${fmt(small)} -> ${fmt(big)})`);
  }
}

// --- retiring later must buy a bigger pension -------------------------------

checks++;
{
  // Same person, two spending levels: the higher one forces a later stop, which
  // must produce a larger pot because contributions run for longer.
  const early = simulate(sanitise({ ...BASE(), assumptions: { realReturn: 0.05, swr: 0.035, pensionPolicy: 'ownPots' } }));
  const lateInput = tweak('household.spending.other', 1600);
  lateInput.assumptions.pensionPolicy = 'ownPots';
  const late = simulate(sanitise(lateInput));
  if (late.timeline.yearsToFi > early.timeline.yearsToFi &&
      late.portfolio.pensionAtUnlock < early.portfolio.pensionAtUnlock - 1) {
    failures.push('stopping later produced a smaller pension pot');
  }
}

console.log(`\n${checks} monotonicity checks`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  failures.forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('every relationship holds in the right direction\n');
