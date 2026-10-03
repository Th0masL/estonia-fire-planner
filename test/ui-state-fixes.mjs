// The form and the loader must agree on what a plan may contain.
//
// The engine runs on a sanitised copy of the live plan, and `sanitise` clamps
// to BOUNDS - so a bound in BOUNDS that sanitise does not apply, or a form
// field whose min/max are typed by hand instead of taken from BOUNDS, brings
// back the old bug: a result that changes after a reload.

import { readFileSync } from 'node:fs';
import {
  sanitise, exampleState, encodeState, decodeState, BOUNDS, MAX_NAME_LENGTH,
} from '../src/state.js';
import { simulate } from '../src/calc.js';

let checks = 0;
const failures = [];
const ok = (cond, label, detail = '') => {
  checks++;
  if (!cond) failures.push(`${label}${detail ? ' — ' + detail : ''}`);
};

// Where each bound lives in a plan. A new BOUNDS key without an entry here
// fails the first check below, so this list cannot silently fall behind.
const buy = (s) => {
  s.household.property ??= { purchase: { price: 300000, deposit: 60000, termYears: 30, rate: 0.04 } };
  return s.household.property.purchase;
};
const PATHS = {
  childCostsEndYear: [(s) => s.household.spending, 'childCostsEndYear'],
  termYears: [buy, 'termYears'],
  mortgageRate: [buy, 'rate'],
  monthsAway: [buy, 'monthsAway'],
  birthYear: [(s) => s.persons[0], 'birthYear'],
  pillar1Units: [(s) => s.persons[0], 'pillar1Units'],
  serviceYears: [(s) => s.persons[0], 'yearsWorkedEstonia'],
  pillar3FirstContributionYear: [(s) => s.persons[0], 'pillar3FirstContributionYear'],
  fundPensionYears: [(s) => s.persons[0], 'fundPensionYears'],
  healthCoverageFromYear: [(s) => s.persons[0], 'healthCoverageFromYear'],
};
const at = (key) => PATHS[key] || [(s) => s.assumptions, key];
const IGNORED_OUTSIDE = new Set(['healthCoverageFromYear']); // dropped to null, not clamped

for (const [key, [lo, hi]] of Object.entries(BOUNDS)) {
  ok(lo < hi, `${key}: bound is a real range`);
  const [where, field] = at(key);
  for (const [label, value, expected] of [
    ['above', hi + Math.max(1, Math.abs(hi)), hi],
    ['below', lo - Math.max(1, Math.abs(lo)), lo],
    ['inside', (lo + hi) / 2, (lo + hi) / 2],
  ]) {
    const s = exampleState();
    where(s)[field] = value;
    const clean = sanitise(s);
    const got = where(clean)[field];
    const want = IGNORED_OUTSIDE.has(key) && label !== 'inside' ? null
      : key === 'statePensionEarlyYears' ? Math.round(expected) : expected;
    ok(got === want, `${key}: a value ${label} the range is loaded as ${want}`, String(got));
  }
}

// The form takes its limits from BOUNDS. A hand-typed min/max on a field that
// ui.js binds to BOUNDS would be overwritten at startup - but it would also be
// a second copy to drift, so none may exist.
{
  const ui = readFileSync(new URL('../src/ui.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../src/simulator.template.html', import.meta.url), 'utf8');
  const table = ui.match(/const FIELD_BOUNDS = \{([\s\S]*?)\n\};/);
  ok(!!table, 'ui.js has a FIELD_BOUNDS table');
  const ids = [...(table?.[1] ?? '').matchAll(/(\w+): \['(\w+)'/g)];
  ok(ids.length >= 15, 'FIELD_BOUNDS covers the assumption fields', String(ids.length));
  for (const [, id, key] of ids) {
    ok(key in BOUNDS, `${id} is bound to a real BOUNDS key`, key);
    const tag = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`));
    ok(!!tag, `${id} exists in the template`);
    ok(tag && !/\b(min|max)=/.test(tag[0]), `${id} has no hand-typed min/max`, tag?.[0]);
  }
  // Person-card fields use fieldRange(); none may carry a literal year or cap.
  ok(!/type="number" min="\d+" max="\d+"/.test(ui), 'person-card fields take min/max from BOUNDS');
}

// The engine sees the reloaded plan, so running it on a raw out-of-range plan
// and on the reloaded one must agree once the raw one is sanitised.
{
  const raw = exampleState();
  raw.assumptions.realReturn = 0.5;
  raw.assumptions.swr = 0;
  raw.persons[0].income.grossMonthly = -3000;
  const live = simulate(sanitise(JSON.parse(JSON.stringify(raw))));
  const reloaded = simulate(sanitise(decodeState(encodeState(raw))));
  ok(live.timeline.yearsToFi === reloaded.timeline.yearsToFi,
     'a live out-of-range plan gives the same FI date as after a reload');
  ok(Object.is(live.fi.number, reloaded.fi.number), 'and the same FI number');
  ok(sanitise(JSON.parse(JSON.stringify(raw))).assumptions.swr === BOUNDS.swr[0],
     'a zero withdrawal rate reaches the engine clamped, not as zero');
}

// Import limits: names are capped and unknown keys never survive a load.
{
  const s = exampleState();
  s.persons[0].name = '😀'.repeat(MAX_NAME_LENGTH + 40);
  s.persons[0].secret = 'x';
  s.persons[0].income.bonus = 1;
  s.persons[0].assets.gold = 5;
  s.household.pets = 3;
  s.household.spending.holidays = 9;
  s.household.property = { purchase: { price: 1, extra: true } };
  s.assumptions.magic = true;
  s.__proto__polluted = 1;
  s.junk = 'y'.repeat(1000);
  const clean = sanitise(s);
  ok(Array.from(clean.persons[0].name).length === MAX_NAME_LENGTH,
     `names are capped at ${MAX_NAME_LENGTH} characters`, String(Array.from(clean.persons[0].name).length));
  ok(clean.persons[0].name === '😀'.repeat(MAX_NAME_LENGTH), 'the cap never splits a character');
  const json = JSON.stringify(clean);
  for (const k of ['secret', 'bonus', 'gold', 'pets', 'holidays', 'extra', 'magic', 'junk', 'polluted']) {
    ok(!json.includes(`"${k}`), `unknown key "${k}" is dropped`);
  }
  // Everything the plan itself defines is still there.
  const full = sanitise(exampleState());
  const again = sanitise(JSON.parse(JSON.stringify(full)));
  ok(JSON.stringify(full) === JSON.stringify(again), 'rebuilding from known keys is idempotent');
  for (const k of Object.keys(exampleState().persons[0])) {
    ok(k in full.persons[0], `known person key "${k}" survives`);
  }
  for (const k of Object.keys(exampleState().assumptions)) {
    ok(k in full.assumptions, `known assumption "${k}" survives`);
  }
}

console.log(`\n${checks} bounds and import-limit checks`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  [...new Set(failures)].slice(0, 20).forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('the form, the loader and the engine agree on every bound\n');
