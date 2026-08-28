// The trust boundary: saved plans, exported files and share links.
//
// A share link is a string a stranger can edit, and an exported file is a file
// anyone can hand-edit. Both land straight in the engine, which multiplies
// whatever it is given - so one bad field becomes NaN in thirty rendered
// figures with nothing pointing at the cause. Plans from older versions are in
// the wild the moment anyone uses the tool, and must keep loading.
//
// None of this was testable until the state layer left ui.js.

import {
  sanitise, encodeState, decodeState, blankState, exampleState, MAX_PERSONS,
} from '../src/state.js';
import { simulate } from '../src/calc.js';
import { actionPlan } from '../src/rules.js';
import { RATES, DEFAULTS } from '../src/rates.js';

let checks = 0;
const failures = [];
const ok = (cond, label, detail = '') => {
  checks++;
  if (!cond) failures.push(`${label}${detail ? ' — ' + detail : ''}`);
};

/** Every number reachable in an object, so a whole result can be swept. */
function* numbers(o, path = '') {
  if (typeof o === 'number') yield [path, o];
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) yield* numbers(v, `${path}.${k}`);
  }
}

const runsClean = (state, label) => {
  let r;
  try {
    r = simulate(state);
  } catch (e) {
    ok(false, `${label}: simulate threw`, e.message);
    return;
  }
  for (const [path, v] of numbers(r)) {
    if (Number.isNaN(v)) { ok(false, `${label}: NaN at ${path}`); return; }
  }
  try {
    for (const f of actionPlan(r, state)) {
      if (/NaN|undefined|Infinity/.test(f.title + f.value + f.detail)) {
        ok(false, `${label}: finding "${f.id}" renders a non-number`);
        return;
      }
    }
  } catch (e) {
    ok(false, `${label}: actionPlan threw`, e.message);
    return;
  }
  ok(true, `${label}: produces a clean plan`);
};

// --- share links round-trip exactly ------------------------------------------

for (const [label, make] of [['blank', blankState], ['example', exampleState]]) {
  const original = make();
  const back = decodeState(encodeState(original));
  ok(JSON.stringify(back) === JSON.stringify(original),
     `${label} state survives encode/decode unchanged`);
  // base64url: the whole point is that it is safe in a URL fragment.
  ok(!/[+/=]/.test(encodeState(original)),
     `${label} share payload is URL-fragment safe`);
}

// A plan with two people, a house and every optional field populated - the
// shape most likely to lose something in transit.
const full = sanitise({
  version: 1, currentYear: 2026, excludeCrypto: false,
  household: {
    hasDependents: true, lifeInsurance: true,
    spending: { housing: 1200, childCosts: 400, other: 1500, buffer: 300 },
    rentalIncomeNetMonthly: 450,
    property: { purchase: {
      price: 420000, deposit: 90000, termYears: 25, rate: 0.039,
      runningCostsMonthly: 350, movingCosts: 12000, monthsAway: 18, paidBy: 1,
    } },
  },
  persons: [
    { name: 'Person1', birthYear: 1984,
      income: { grossMonthly: 4100, netMonthly: 3050, otherNetMonthly: 120 },
      assets: { cash: 55000, investmentAccount: 30000, pillar2: 41000, pillar3: 9000, crypto: 12000 },
      pillar2Rate: 0.06, pillar3Annual: 6000, allocationShare: 0.65,
      lifeInsurance: true, lifeInsuranceMonthly: 38,
      healthInsurance: false, healthInsuranceMonthly: 272 },
    { name: 'Person2', birthYear: 1991,
      income: { grossMonthly: 0, netMonthly: null, otherNetMonthly: 0 },
      assets: { cash: 8000, investmentAccount: 0, pillar2: 6000, pillar3: 0, crypto: 0 },
      pillar2Rate: 0.02, pillar3Annual: 0, allocationShare: 0.35,
      lifeInsurance: false, lifeInsuranceMonthly: 0,
      healthInsurance: true, healthInsuranceMonthly: 272 },
  ],
  assumptions: { realReturn: 0.045, swr: 0.032, pensionPolicy: 'all',
                 pillarDrawAge: 'statePension', planToAge: 100, spendingGrowth: 0.0075, inflation: 0.03,
                 potsCountedShare: 0.8, stateCountedShare: 0.5 },
});
ok(JSON.stringify(decodeState(encodeState(full))) === JSON.stringify(full),
   'a fully populated two-person plan round-trips unchanged');

// The recipient of a link sees the same plan the sender saw. This is the whole
// promise of the feature.
{
  const sender = simulate(full);
  const recipient = simulate(sanitise(decodeState(encodeState(full))));
  const same = (x, y) => (x === y) || Math.abs(x - y) < 1e-6;
  ok(same(sender.timeline.yearsToFi, recipient.timeline.yearsToFi) &&
     same(sender.fi.number, recipient.fi.number),
     'a shared link reproduces the sender\'s plan exactly',
     `${sender.timeline.yearsToFi} vs ${recipient.timeline.yearsToFi}`);
}

// --- sanitise rejects what it cannot repair ----------------------------------

for (const [label, bad] of [
  ['null', null],
  ['a string', 'hello'],
  ['a number', 42],
  ['an array', []],
  ['no persons key', { household: {} }],
  ['an empty persons array', { household: {}, persons: [] }],
  ['persons not an array', { household: {}, persons: {} }],
  ['no household', { persons: [{}] }],
]) {
  ok(sanitise(bad) === null, `sanitise rejects ${label}`);
}

// --- sanitise repairs what it can --------------------------------------------

// Every field wrong in a different way, which is what a hand-edited link looks
// like. Nothing here may reach the engine as a string, a NaN or a null.
const hostile = sanitise({
  version: 'one', excludeCrypto: 'yes', currentYear: '2026',
  household: {
    hasDependents: 'true',
    spending: { housing: '700', childCosts: null, other: NaN, buffer: undefined },
    rentalIncomeNetMonthly: 'lots',
    property: { purchase: {
      price: '500000', deposit: -1000, termYears: 999, rate: 45,
      runningCostsMonthly: null, movingCosts: NaN, monthsAway: -6, paidBy: 7,
    } },
  },
  persons: [
    { name: '', birthYear: 3000, income: { grossMonthly: '4000', netMonthly: 'x' },
      assets: { cash: '10000', investmentAccount: null, pillar2: NaN, crypto: -5 },
      pillar2Rate: 0.05, pillar3Annual: -100, allocationShare: 5, lifeInsuranceMonthly: 'free', healthInsuranceMonthly: null },
    { name: 42, birthYear: null, income: null, assets: null,
      allocationShare: 'half' },
    { name: 'third person who should not exist' },
    { name: 'fourth' },
  ],
  assumptions: { realReturn: 99, swr: -1, pensionPolicy: 'wishful',
                 pillarDrawAge: 'whenever', planToAge: 500, spendingGrowth: 'lots', inflation: -4,
                 potsCountedShare: 9, stateCountedShare: -1 },
});

ok(hostile !== null, 'a thoroughly corrupted plan is repaired rather than rejected');
ok(hostile.persons.length === MAX_PERSONS,
   `extra people are dropped at ${MAX_PERSONS}`, `got ${hostile?.persons.length}`);
for (const [path, v] of numbers(hostile)) {
  ok(Number.isFinite(v), `repaired plan has a finite number at ${path}`, String(v));
}
ok(hostile.persons.every((p) => typeof p.name === 'string' && p.name.length > 0),
   'every person ends up with a name');
ok(Math.abs(hostile.persons.reduce((x, p) => x + p.allocationShare, 0) - 1) < 1e-9,
   'allocation shares are renormalised to a partition');
ok(RATES.pillar2.employeeRates.includes(hostile.persons[0].pillar2Rate),
   'an invalid Pillar II rate falls back to a statutory one');
ok(hostile.assumptions.pensionPolicy === DEFAULTS.pensionPolicy,
   'an unknown pension policy falls back to the default');
ok(hostile.assumptions.pillarDrawAge === DEFAULTS.pillarDrawAge,
   'an unknown pillar draw age falls back to the default');
ok(hostile.assumptions.planToAge <= 110,
   'an absurd planning age is clamped', String(hostile.assumptions.planToAge));
ok(hostile.assumptions.spendingGrowth === DEFAULTS.spendingGrowth,
   'non-numeric spending growth falls back to the default');
ok(hostile.assumptions.inflation >= 0, 'negative inflation is clamped to zero');
ok(hostile.assumptions.potsCountedShare <= 1 && hostile.assumptions.stateCountedShare >= 0,
   'pension haircuts are held inside 0-100%');
ok(hostile.assumptions.swr > 0, 'a negative withdrawal rate is clamped above zero');
ok(hostile.household.property.purchase.paidBy === 'proportional',
   'a payer index with nobody behind it becomes a proportional split');
ok(hostile.household.property.purchase.termYears <= RATES.mortgage.maxTermYears,
   'the mortgage term is held to the legal maximum');
runsClean(hostile, 'the repaired hostile plan');

// Idempotence: sanitising twice must not keep changing the answer, or the same
// plan would drift every time it is loaded and re-saved.
{
  const once = sanitise(JSON.parse(JSON.stringify(full)));
  const twice = sanitise(JSON.parse(JSON.stringify(once)));
  ok(JSON.stringify(once) === JSON.stringify(twice), 'sanitise is idempotent');
}

// --- plans written by older versions still load ------------------------------

const legacy = [
  ['the first release', {
    version: 1, excludeCrypto: true,
    household: {
      hasDependents: true, lifeInsurance: false,
      spending: { housing: 730, childCosts: 260, other: 1110, buffer: 310 },
      rentalIncomeNetMonthly: 240, property: null,
    },
    persons: [{
      name: 'Person1', birthYear: 1984,
      income: { grossMonthly: 6000, netMonthly: null, otherNetMonthly: 0 },
      assets: { cash: 90000, investmentAccount: 0, pillar2: 40000, pillar3: 0, crypto: 30000 },
      pillar3Annual: 0, allocationShare: 1,
    }],
    assumptions: { realReturn: 0.05, swr: 0.035 },
  }],
  ['before insurance existed', {
    ...blankState(),
    persons: [{
      name: 'Person1', birthYear: 1990,
      income: { grossMonthly: 2500, netMonthly: null, otherNetMonthly: 0 },
      assets: { cash: 5000, investmentAccount: 0, pillar2: 0, pillar3: 0, crypto: 0 },
      pillar3Annual: 0, allocationShare: 1,
    }],
  }],
  ['no assumptions block at all', {
    excludeCrypto: true,
    household: { spending: { housing: 500, other: 700 } },
    persons: [{ name: 'Person1', birthYear: 1988, income: { grossMonthly: 2000 }, assets: { cash: 1000 } }],
  }],
];

for (const [label, old] of legacy) {
  const s = sanitise(JSON.parse(JSON.stringify(old)));
  ok(s !== null, `a plan from ${label} still loads`);
  if (!s) continue;
  ok(s.assumptions.pensionPolicy === DEFAULTS.pensionPolicy,
     `a plan from ${label} gets the current default pension policy`);
  ok(s.persons.every((p) => p.pillar1Units === null || p.pillar1Units >= 0),
     `a plan from ${label} has a usable pension coefficient`);
  runsClean(s, `a plan from ${label}`);
  // And it must survive a share link, since that is how it gets passed on.
  ok(JSON.stringify(decodeState(encodeState(s))) === JSON.stringify(s),
     `a plan from ${label} round-trips through a link`);
}

// --- degenerate but legal inputs ---------------------------------------------

const degenerate = [
  ['nobody earning anything', (s) => { s.persons[0].income.grossMonthly = 0; }],
  ['spending nothing', (s) => { s.household.spending = { housing: 0, childCosts: 0, other: 0, buffer: 0 }; }],
  ['no assets at all', (s) => { s.persons[0].assets = { cash: 0, investmentAccount: 0, pillar2: 0, pillar3: 0, crypto: 0 }; }],
  ['spending far beyond income', (s) => { s.household.spending.other = 50000; }],
  ['already past state pension age', (s) => { s.persons[0].birthYear = 1950; }],
  ['born this year', (s) => { s.persons[0].birthYear = RATES.year; }],
  ['a zero real return', (s) => { s.assumptions.realReturn = 0; }],
  ['an enormous salary', (s) => { s.persons[0].income.grossMonthly = 500000; }],
  ['every pension policy at once', (s) => { s.assumptions.pensionPolicy = 'all'; }],
];

for (const [label, mutate] of degenerate) {
  const s = exampleState();
  mutate(s);
  runsClean(sanitise(s), label);
}

console.log(`\n${checks} state and round-trip checks`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  [...new Set(failures)].slice(0, 15).forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('plans survive storage, files and links intact\n');
