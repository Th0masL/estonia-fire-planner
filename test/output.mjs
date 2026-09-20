// Checks on what actually ships: the built HTML, and the agreement between the
// two calculators that model the same thing by different routes.
//
// The retrospective's first lesson was that the tests looked at the wrong layer.
// Three real defects were invisible to Node entirely - ES modules being dead on
// file://, a label that could not open its own file input, a rate label rounding
// 3.5% to 4% - because nothing ever looked at the output. These do.
//
// Run after build.py.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pillarProjection, netFromGross, pillar1Monthly, simulate, pensionAges } from '../src/calc.js';
import { RATES } from '../src/rates.js';
import { sanitise, exampleState } from '../src/state.js';

const ROOT = new URL('..', import.meta.url).pathname;
let checks = 0;
const failures = [];
const ok = (cond, label, detail = '') => {
  checks++;
  if (!cond) failures.push(`${label}${detail ? ' — ' + detail : ''}`);
};

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// Repayment compensation needs contract-specific verification; do not ship the
// former unused universal cap as if it were a supported calculation parameter.
ok(!Object.hasOwn(RATES.mortgage, 'earlyRepaymentCapMonthsInterest'), 'rates expose no universal early-repayment cap');
for (const page of ['simulator.html', 'pension.html']) {
  ok(!read(page).includes('earlyRepaymentCapMonthsInterest'), `${page} omits the unused repayment cap`);
}

// --- the two calculators must agree ------------------------------------------
//
// pension.html projects Pillar II through pillarProjection(); simulator.html
// does it again inside simulate(). Two code paths, one set of rules - so they
// can drift, and a user comparing the pages would be the one to find out.

for (const gross of [1200, 2500, 4000, 8000]) {
  for (const rate of RATES.pillar2.employeeRates) {
    const birthYear = 1982;
    const standalone = pillarProjection({
      birthYear, grossMonthly: gross, pillar2Rate: rate,
      realReturn: 0.05, currentYear: RATES.year, startingPillar2: 20000,
    });

    // The simulator's equivalent: the same person, working right up to unlock.
    const ages = pensionAges(birthYear);
    const yearsToUnlock = ages.pillarUnlockAge - (RATES.year - birthYear);
    const plan = simulate(sanitise({
      ...exampleState(),
      currentYear: RATES.year,
      household: {
        hasDependents: false,
        // Spending set so high that FI never arrives, which pins the stop date
        // at the unlock date and makes the two projections comparable.
        spending: { housing: 0, childCosts: 0, other: gross * 5, buffer: 0 },
        rentalIncomeNetMonthly: 0, property: null,
      },
      persons: [{
        name: 'Person1', birthYear,
        income: { grossMonthly: gross, netMonthly: null, otherNetMonthly: 0 },
        assets: { cash: 0, investmentAccount: 0, pillar2: 20000, pillar3: 0, crypto: 0 },
        pillar2Rate: rate, pillar3Annual: 0, allocationShare: 1,
      }],
      assumptions: { realReturn: 0.05, swr: 0.035, pensionPolicy: 'ignore' },
    }));

    const a = standalone.pot2;
    const b = plan.persons[0].pensionAtUnlock;
    ok(Math.abs(a - b) < Math.max(50, a * 0.001),
       `pension pot agrees between the two pages at €${gross}/mo, ${rate * 100}%`,
       `${Math.round(a).toLocaleString()} vs ${Math.round(b).toLocaleString()}`);

    // And the tax model behind both must be one model.
    const t1 = standalone.tax;
    const t2 = netFromGross(gross * 12, { pillar2Rate: rate });
    ok(Math.abs(t1.net - t2.net) < 0.01,
       `net pay agrees at €${gross}/mo, ${rate * 100}%`);
  }
}

// --- Pillar I must reproduce the published benchmark -------------------------
//
// The one figure in the formula that can be checked against a government
// publication: a 44-year career at the average wage. If a rate is mistyped this
// is what catches it.

{
  // Outside Pillar II: the published benchmark describes people already drawing
  // a pension, who accrued their 44 years before Pillar II existed. Someone
  // retiring today from a full career inside it accrues 20% less.
  const benchmark = pillar1Monthly({
    grossAnnual: 12 * RATES.averageGrossWageMonthly, futureYears: 44, serviceYears: 44, inPillar2: false,
  });
  ok(Math.abs(benchmark - RATES.pillar1.averagePensionMonthly) < 0.5,
     'the Pillar I formula reproduces the published 44-year average',
     `${benchmark.toFixed(2)} vs ${RATES.pillar1.averagePensionMonthly}`);
}

// --- the built pages ---------------------------------------------------------

const PAGES = ['index.html', 'simulator.html', 'pension.html',
  ...readdirSync(join(ROOT, 'guide')).filter((f) => f.endsWith('.html')).map((f) => `guide/${f}`)];

ok(PAGES.length > 15, 'the build produced the expected set of pages', `${PAGES.length} found`);

// Everything outside <script> and <style>: the markup a reader actually sees.
// The inlined bundle legitimately contains the words "undefined" and "NaN", and
// template literals inside it look like href="${...}" to a regex.
const markupOf = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '');

for (const page of PAGES) {
  const html = read(page);
  const markup = markupOf(html);

  // A figure that failed to substitute, or a template hole that never filled.
  ok(!markup.includes('{{'), `${page} has no unsubstituted placeholder`);
  ok(!/\bNaN\b|\bundefined\b/.test(markup), `${page} ships no NaN or undefined`);
  ok(!html.includes('<!--BUNDLE-->') && !html.includes('<!--SIDEBAR-->'),
     `${page} had every template marker replaced`);

  // Every page must be reachable and must carry the shared nav.
  ok(markup.includes('id="sidebar"'), `${page} has the shared navigation`);
  ok(/<title>[^<]+<\/title>/.test(markup), `${page} has a title`);

  // Nordic Utility tokens must load locally and before component CSS on every
  // generated page. A missing ../ on a guide page would otherwise look fine at
  // repository root and silently lose its theme after deployment.
  const tokenLink = markup.indexOf('tokens.css');
  const styleLink = markup.indexOf('styles.css');
  ok(tokenLink >= 0 && tokenLink < styleLink,
    `${page} loads local design tokens before component styles`);
  const themeInit = html.indexOf('localStorage.getItem("fa-theme")');
  const rawTokenLink = html.indexOf('tokens.css');
  ok(themeInit >= 0 && themeInit < rawTokenLink,
    `${page} resolves a saved theme before styles load`);
  ok(markup.includes('name="theme-color"'), `${page} declares a browser theme colour`);
  for (const choice of ['light', 'system', 'dark']) {
    ok(markup.includes(`data-theme-choice="${choice}"`),
      `${page} offers the ${choice} theme choice`);
  }

  // Internal links must point at files that exist. A finding linking to a
  // missing guide page is a dead end at exactly the moment someone wants more.
  const base = page.includes('/') ? 'guide' : '';
  for (const m of markup.matchAll(/href="(?!https?:|mailto:|data:|#)([^"#]+)/g)) {
    const target = m[1].startsWith('../')
      ? m[1].slice(3)
      : (base ? `${base}/${m[1]}` : m[1]);
    ok(existsSync(join(ROOT, target)), `${page} links to a real file`, m[1]);
  }
}

// Component CSS consumes semantic tokens; raw palette values belong only in
// the copied canonical token file. Domain visualization colors are also token-
// based, so an accidental literal here is interface drift rather than data.
{
  const css = read('styles.css');
  ok(!/#[0-9a-f]{3,8}\b|rgba?\s*\(/i.test(css),
    'component CSS contains no raw palette colors');
  const workflow = read('.github/workflows/deploy.yml');
  ok(workflow.includes('tokens.css'), 'Pages artifact includes local design tokens');
  const nav = read('src/nav.js');
  ok(nav.includes("removeAttribute('data-theme')"),
    'System theme leaves preference resolution to the operating system');
  ok(nav.includes("localStorage.setItem('fa-theme', choice)"),
    'explicit theme choices persist locally');
  ok(nav.includes("addEventListener('change', systemChanged)"),
    'System theme responds to operating-system changes');
  ok(nav.includes("meta.content = dark ? '#0f1320' : '#f6f8fb'"),
    'browser theme colour follows the resolved palette');
}

// --- the calculators must be self-contained ----------------------------------
//
// ES module imports are blocked on file:// URLs, which is why the bundle is
// inlined. A stray <script src> or an unresolved import would work over HTTP
// and fail silently for anyone opening the file from disk.

for (const page of ['simulator.html', 'pension.html']) {
  const html = read(page);
  ok(!/<script[^>]+\bsrc=/.test(html), `${page} loads no external script`);
  ok(!/^\s*import\s.*from\s/m.test(html), `${page} has no surviving import statement`);
  ok(!/^\s*export\s/m.test(html), `${page} has no surviving export statement`);
  ok(/<script(\s[^>]*)?>[\s\S]*simulate/.test(html), `${page} carries its bundle inline`);
  // Every module in the bundle should be present exactly once.
  const marker = 'Estonian tax, social and pension rates';
  ok(html.split(marker).length === 2, `${page} includes the rates module exactly once`);
}

// The main simulator carries both sides of the pension comparison. "Without"
// means zero benefits, not a rewritten employment history without contributions.
{
  const html = read('simulator.html');
  ok(html.includes('Without pension benefits') && html.includes('Including pension benefits'),
    'simulator ships the side-by-side pension comparison');
  ok(html.includes('Salary deductions and contributions stay unchanged'),
    'zero-pension scenario keeps the entered contribution history explicit');
}

// --- every (i) must open something -------------------------------------------
//
// A button whose key has no matching explanation is a dead control: it toggles
// aria-expanded and nothing appears. Checked against the source rather than the
// DOM, because the panels only exist once a plan has been rendered.

for (const mod of ['src/ui.js', 'src/pension-ui.js']) {
  const src = read(mod);
  const buttons = [...src.matchAll(/infoBtn\('([^']+)'\)/g)].map((m) => m[1]);
  const bodies = new Set([...src.matchAll(/info(?:Row|Note)\('([^']+)'/g)].map((m) => m[1]));
  ok(buttons.length > 0, `${mod} has explanation buttons`);
  ok(new Set(buttons).size === buttons.length, `${mod} has no duplicated explanation key`);
  for (const key of buttons) {
    ok(bodies.has(key), `${mod}: the (i) for "${key}" opens an explanation`);
  }
  for (const key of bodies) {
    ok(buttons.includes(key), `${mod}: the explanation for "${key}" is reachable`);
  }
}

// The form side pairs buttons with static bodies by key, in the template rather
// than in JS. Same failure if they drift: an (i) that opens nothing.
for (const tpl of ['src/simulator.template.html', 'src/pension.template.html']) {
  const html = read(tpl);
  const buttons = [...html.matchAll(/data-info="([^"]+)"/g)].map((m) => m[1]);
  const bodies = new Set([...html.matchAll(/data-info-body="([^"]+)"/g)].map((m) => m[1]));
  ok(new Set(buttons).size === buttons.length, `${tpl} has no duplicated explanation key`);
  for (const key of buttons) ok(bodies.has(key), `${tpl}: the (i) for "${key}" opens something`);
  for (const key of bodies) ok(buttons.includes(key), `${tpl}: "${key}" is reachable`);
}

// Keys must be unique across the whole page: the open set is shared, so a
// template key colliding with a rendered one would toggle both at once.
{
  const tplKeys = [...read('src/simulator.template.html').matchAll(/data-info="([^"]+)"/g)]
    .map((m) => m[1]);
  const jsKeys = [...read('src/ui.js').matchAll(/infoBtn\('([^']+)'\)/g)].map((m) => m[1]);
  for (const k of tplKeys) {
    ok(!jsKeys.includes(k), `explanation key "${k}" is not used by both the form and the results`);
  }
}

// Figures that live in rates.js must not be retyped into the prose. A literal
// is invisible once rendered - a substituted €100,000 and a hard-coded one look
// identical on the page - so the check has to run against the source, and it has
// to be a budget rather than a ban, because a few literals are legitimate:
// historical facts that must NOT move when the law does, and unrelated uses of
// the same round number.
{
  const ALLOWED = {
    // Cyprus 2013: the EU limit at the time. History, not current law.
    'docs/guide/account-protection.md': 3,
    // A FatFIRE spending tier, nothing to do with deposit protection.
    'docs/guide/fatfire.md': 5,
    // Synthetic company comparison amounts, not protection thresholds.
    'docs/guide/company.md': 5,
  };
  const files = readdirSync(join(ROOT, 'docs')).filter((f) => f.endsWith('.md'))
    .map((f) => `docs/${f}`)
    .concat(readdirSync(join(ROOT, 'docs/guide')).filter((f) => f.endsWith('.md'))
      .map((f) => `docs/guide/${f}`));
  for (const f of files) {
    const literals = (read(f).match(/€100,000/g) || []).length;
    const budget = ALLOWED[f] || 0;
    ok(literals <= budget,
       `${f} does not retype the deposit guarantee or custody threshold`,
       `${literals} literal "€100,000", budget ${budget} — use ` +
       `{{protection.depositGuarantee|money}} or {{brokers.custodyFreeThreshold|money}}`);
  }
}

// The published guide must never assert facts about a reader's finances or
// household. Second person is useful for instructions; asserting holdings is not.
{
  const ASSERTS_HOLDINGS = [
    /right now (?:the|your) (?:portfolio|position|salary|cash|holdings)/i,
    /\byou hold\b(?! ?ing)/i,
    // Narrow on purpose: "either way you own the same net amount" is a general
    // statement about arithmetic and must stay readable. Naming an asset is what
    // turns it into a claim about this particular reader.
    /\byou own (?:a|an|the|your|some)?\s*(?:rental|apartment|flat|property|house|crypto|shares)\b/i,
    /\byou currently\b/i,
    // "you already have" was too narrow: "you already hold some" shipped anyway.
    // Any verb of possession after "you already" makes the same claim.
    /\byou already (?:have|hold|own|bought|built|keep|carry)\b/i,
    // Guard against prose that assumes a reader's holdings, household structure
    // or future plans.
    /\byour existing (?:stack|holdings?|coins|portfolio|position)\b/i,
    /\byou have a mortgage application\b/i,
    /\bthe house (?:should be|is being|will be) bought\b/i,
    /\bafter the house is bought\b/i,
    /\bboth pillar iii allowances (?:are|running)\b/i,
    /\byou'?re doing it for other reasons\b/i,
    /\byour (?:crypto|tuleva|apartment|flat|rental|portfolio is|holdings)\b/i,
    /\bin your case\b/i,
    // Household composition must also remain conditional.
    // Deliberately only the POSSESSIVE forms. "a parent aged 35 with a child
    // under 16" describes the KredEx rule, and a guide covering family benefits
    // has to be able to say that; "your child" is the one that assumes.
    /\byour (?:child|kids|children|partner|spouse|wife|husband)\b/i,
    /\byou almost certainly (?:do|don't|do not)\b/i,
    /is not a risk for you\b/i,
    /specifically right for you\b/i,
  ];
  const files = readdirSync(join(ROOT, 'docs')).filter((f) => f.endsWith('.md'))
    .map((f) => `docs/${f}`)
    .concat(readdirSync(join(ROOT, 'docs/guide')).filter((f) => f.endsWith('.md'))
      .map((f) => `docs/guide/${f}`));
  for (const f of files) {
    const text = read(f);
    for (const pattern of ASSERTS_HOLDINGS) {
      const hit = text.match(pattern);
      ok(!hit, `${f} does not assert what the reader owns`,
         hit ? `"${hit[0]}" — write it conditionally ("if you hold…", "where the balance is…")` : '');
    }
  }
}

// The severity class and the explanation class must stay distinct - `.info`
// would match `.finding.info` and collapse every info-severity finding.
{
  const css = read('styles.css');
  ok(!/^\.info[\s{:,\[]/m.test(css),
     'no bare .info rule in the stylesheet (it would match .finding.info)');
  ok(css.includes('.explain'), 'the explanation styling is present');
}

// --- rates quoted in prose must match rates.js -------------------------------
//
// The build fails loudly on an unknown {{placeholder}}, but says nothing about a
// figure typed in by hand next to one that is substituted. This catches the case
// where rates.js moves and a hard-coded twin does not.

{
  const guide = readdirSync(join(ROOT, 'guide'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => read(`guide/${f}`)).join('\n');

  // Figures that changed for 2026 and whose old values must not survive anywhere.
  const stale = [
    ['€654', 'the pre-2026 basic exemption'],
    ['€500 a month', 'the old basic exemption phrasing'],
    ['20%', 'the pre-2025 income tax rate'],
  ];
  for (const [needle, what] of stale) {
    if (needle === '20%') continue;   // legitimately appears as the rental deduction
    ok(!guide.includes(needle), `no page still quotes ${what}`, needle);
  }

  // The current figures should appear at least once, or the prose has silently
  // stopped mentioning something the engine relies on.
  const expected = [
    [`€${RATES.pillar3.maxAnnual.toLocaleString('en-IE')}`, 'the Pillar III cap'],
    [`€${RATES.healthInsurance.voluntaryMonthly}`, 'the voluntary health premium'],
  ];
  for (const [needle, what] of expected) {
    ok(guide.includes(needle), `the guide still states ${what}`, needle);
  }
}

// Public evidence must distinguish checked claims from incomplete research.
{
  const brokers = read('guide/brokers.html');
  ok(brokers.includes('2.5%') && brokers.includes(RATES.marketRates.ecbEffectiveDate), 'cash guide renders benchmark and effective date');
  ok(brokers.includes(RATES.marketRates.ecbCheckedDate), 'benchmark has an independent checked date');
  ok(brokers.includes('USD equivalent'), 'IBKR NAV is not labelled EUR');
  ok(!brokers.includes('Pays now'), 'cash table does not label stale retail estimates as current');
  ok(!('ibkrFullRateNav' in RATES.marketRates), 'incorrect unqualified NAV constant removed');
}

{
  const pensions = read('guide/pensions.html');
  for (const required of ['before\n1 January 2021', 'at least five years', 'after fund payments end', 'No insurer annuity is modeled', 'confirmed coverage date', 'wording\ndiscrepancy']) {
    ok(pensions.replace(/\s+/g, ' ').includes(required.replace(/\s+/g, ' ')), `pension guidance retains ${required}`);
  }
  for (const obsolete of ['until 63–65', 'only one insurer', 'unconditionally', 'no scenario short of expropriation']) {
    ok(!pensions.includes(obsolete), `pension guidance removes ${obsolete}`);
  }
  ok(!read('guide/levers.html').includes('guaranteed 22% back'), 'strategy does not guarantee a pension refund');
  ok(!read('guide/risks.html').includes('unlock at 63–65 and 60'), 'risk guide does not use universal pension access ages');
}

{
  const crypto = read('guide/crypto.html');
  const account = read('guide/investment-account.html');
  for (const [label, html] of [['crypto', crypto], ['investment account', account]]) {
    ok(html.includes('1 January 2025'), `${label} uses the crypto eligibility effective date`);
  }
  for (const table of ['6.1 / 8.2', '6.3 / 8.3']) {
    ok(crypto.includes(table), `crypto distinguishes reporting tables ${table}`);
  }
  ok(crypto.includes('not a completed tax return'), 'crypto guidance limits its scope');
  ok(crypto.includes('does not classify lots'), 'crypto guidance discloses model limits');
  ok(!read('guide/property.html').includes('Losses cannot offset gains'), 'house guide does not assert universal no-loss-offset');
  const property = read('guide/property.html');
  const proceeds = 60000, basis = 20000, assumedRate = 0.22;
  const reserve = (proceeds - basis) * assumedRate;
  for (const amount of [reserve, proceeds - reserve]) {
    ok(property.includes(`€${amount.toLocaleString('en-IE')}`), 'house crypto illustration reconciles tax and net proceeds');
  }
  ok(property.includes('no fees, deductible losses or other relief'), 'house crypto example keeps its tax assumptions explicit');
}

{
  const company = read('guide/company.html');
  const principal = 50000, assets = 100000, rate = 0.22;
  const netProfit = (assets - principal) * (1 - rate);
  const tax = netProfit * rate / (1 - rate);
  ok(Math.abs(principal + netProfit + tax - assets) < 1e-8, 'company extraction reconciles principal, owner profit and tax');
  for (const amount of [principal + netProfit, tax, assets * (1 - rate)]) {
    ok(company.includes(`€${amount.toLocaleString('en-IE', { maximumFractionDigits: 0 })}`), 'company guide includes independently reconciled net/tax amount');
  }
  ok(company.includes('personal basis'), 'company example distinguishes owner basis');
  ok(company.includes('lawful') && company.includes('open review'), 'company comparison retains conditions and unresolved scope');
  for (const obsolete of ['22% of everything', 'no version of this', 'wins decisively', '€163,493', '€149,590']) {
    ok(!company.includes(obsolete), `company guide removes unsupported claim ${obsolete}`);
  }
}

{
  const evidence = read('guide/sources.html');
  for (const heading of ['Checked rules', 'Model assumptions and known limits', 'Open review', 'Maintaining this register']) {
    ok(evidence.includes(heading), `evidence register includes ${heading}`);
  }
  ok(evidence.includes('https://www.emta.ee/en/private-client/taxes-and-payment/declaration-income/tax-rates'), 'evidence register links primary tax source');
  ok(evidence.includes('not a certification of the entire planner'), 'evidence register limits its assurance');
  ok(!/Round [234]|Copy-pasteable research prompts/.test(evidence), 'public evidence page has no research-round completion claims');
  ok(existsSync(join(ROOT, 'docs/contributing/research-questions.md')), 'contributor research questions retained');
}

{
  const brokers = read('guide/brokers.html');
  for (const phrase of ['Broker fee snapshot', 'not an all-in cost cap', 'not unattended filing', 'Still unverified']) {
    ok(brokers.includes(phrase), `broker guide discloses ${phrase}`);
  }
  for (const obsolete of ["don't have to keep the records", 'You cannot buy Baltic shares', 'and it never', 'LHV does not publish whether']) {
    ok(!brokers.includes(obsolete), `broker guide removes unsupported claim ${obsolete}`);
  }
}

{
  const portfolio = read('guide/portfolio.html');
  for (const required of ['IE00BK5BQT80', 'IE0003XJA0J9', '0.07 percentage points', 'not an all-in cost comparison', 'trading in EUR does not remove underlying currency risk', 'account-specific questions remain open']) {
    ok(portfolio.includes(required), `fund comparison retains ${required}`);
  }
  const feeDifference = 500000 * (0.0014 - 0.0007);
  ok(portfolio.includes(`€${feeDifference} per year`), 'fund charge illustration reconciles independently');
  for (const obsolete of ['all-cap-ish', 'Recommendation: VWCE', 'splitting halves it', '3,757', '~25×']) {
    ok(!portfolio.includes(obsolete), `fund comparison removes unsupported ${obsolete}`);
  }
  ok(!read('guide/levers.html').includes('3,757'), 'strategy does not repeat undated holdings count');
}

{
  const brokers = read('guide/brokers.html');
  const property = read('guide/property.html');
  const portfolio = read('guide/portfolio.html');
  const contribution = 50000, fullWithdrawal = 51000;
  const taxable = Math.max(0, fullWithdrawal - contribution);
  ok(brokers.includes(`€${taxable.toLocaleString('en-IE')}`) && brokers.includes('not zero'), 'cash example retains the independently computed taxable excess');
  for (const phrase of ['Settlement is not the same as spendable', 'not a tax exemption', 'authorized designation', 'counterparty failure']) {
    ok(brokers.includes(phrase), `cash guide retains ${phrase}`);
  }
  for (const [label, html] of [['brokers', brokers], ['property', property], ['portfolio', portfolio]]) {
    for (const stale of ['no tax at all', 'Any of them is fine', 'Worst realistic year', "isn't an investment in any meaningful sense"]) {
      ok(!html.includes(stale), `${label} removes cash assurance ${stale}`);
    }
  }
  ok(property.includes('Tax deferral is not tax-free interest'), 'purchase guide does not promise tax-free fund earnings');
  ok(!read('guide/protection.html').includes('A few weeks is fine'), 'protection guide does not endorse short uninsured exposure as safe');
}

{
  const protection = read('guide/protection.html');
  for (const phrase of ['in date order', 'ordinary market losses', 'fund units held through an', 'Still unverified', 'annual declaration before the first trade']) {
    ok(protection.includes(phrase), `protection guide preserves distinction: ${phrase}`);
  }
  const uncovered = Math.max(0, 175000 - RATES.protection.depositGuarantee);
  ok(protection.includes(`€${uncovered.toLocaleString('en-IE')} above the ordinary cover`), 'ordinary uncovered-balance example reconciles');
  for (const obsolete of ['Every sale immediately taxable', 'natural hedge', 'lowest public debt', '47.5%', 'Transfers are free']) {
    ok(!protection.includes(obsolete), `protection guide removes unsupported assurance: ${obsolete}`);
  }
}

{
  const portfolio = read('guide/portfolio.html');
  for (const obsolete of ['functionally the same broker', 'confirmed IK-eligible', 'Do declare it before trading', 'Recommendation: start at LHV', 'no extra tax admin whatsoever']) {
    ok(!portfolio.includes(obsolete), `provider guidance removes ${obsolete}`);
  }
  for (const required of ['eligibility is not a brand attribute', 'not a verified break-even calculation', 'Upvest Securities GmbH', 'historic filing corrections']) {
    ok(portfolio.includes(required), `provider guidance retains ${required}`);
  }
  ok(!read('guide/investment-account.html').includes('cheapest at scale'), 'account guide no longer repeats broker ranking');
  const brokers = read('guide/brokers.html');
  ok(brokers.includes('Information exchange is not a completed tax return'), 'foreign reporting is not confused with filing');
  ok(!brokers.includes('funded by\nthat state'), 'foreign guarantee section removes blanket state-funding claim');
}

{
  const account = read('guide/investment-account.html');
  for (const obsolete of ['no paperwork', 'Roth conversion ladder', 'no tax event at all', '6.5/7.2', 'pure, permanent return', 'Never US-domiciled', 'Neither is private company equity']) {
    ok(!account.includes(obsolete), `account guide removes unsupported claim: ${obsolete}`);
  }
  for (const required of ['in date order', 'table 6.5', 'Accumulating does not mean tax-exempt', '$60,000 filing threshold', 'Still unverified', 'Losing Estonian tax residence', 'not by annual netting']) {
    ok(account.includes(required), `account guide preserves qualification: ${required}`);
  }
  const allowance = 400000, annualWithdrawal = 40000;
  ok(allowance / annualWithdrawal === 10 && account.includes('Ten annual'), 'conditional allowance example arithmetic');
}

{
  const property = read('guide/property.html');
  for (const obsolete of ['unchanged since 1 March 2015', 'Invest everything', 'investing wins clearly', 'take the longest term available', 'VÕS §403', 'available at every major Estonian bank', 'never taxed at all']) {
    ok(!property.includes(obsolete), `home guide removes unsupported claim: ${obsolete}`);
  }
  for (const required of ['1 April 2024', 'Higher of the contract rate and 6%', '15% of quarterly', 'Residence-sale relief is conditional', 'one-month-interest', 'Still unverified', 'not actual first-year amortising interest']) {
    ok(property.includes(required), `home guide preserves qualification: ${required}`);
  }
  // Independently sum discounted monthly payments to recover the payment, then
  // reconcile the displayed rounded totals without using the mortgage engine.
  for (const [years, rate] of [[15, .04], [20, .04], [25, .04], [30, .04], [30, .05], [30, .06], [30, .07]]) {
    let factor = 0;
    for (let month = 1; month <= years * 12; month++) factor += (1 + rate / 12) ** -month;
    const payment = 300000 / factor;
    for (const value of [payment, payment * years * 12 - 300000]) {
      ok(property.includes(`€${Math.round(value).toLocaleString('en-IE')}`), `home guide annuity example: ${years} years at ${rate}`);
    }
  }
  ok(property.includes(`€${Math.round(400 * 12 / .035).toLocaleString('en-IE')}`), 'home running-cost illustration reconciles');
  ok((306000 * .04 - 270000 * .037) / 36000 === .0625 && property.includes('6.25%'), 'hypothetical starting-balance comparison reconciles');
}

{
  const rental = read('guide/real-estate.html');
  for (const phrase of ['accommodation services and subletting', 'taxable gains are not the entire sale price', 'Source caveat', 'Still unverified', 'provider location alone does not measure correlation']) {
    ok(rental.includes(phrase), `rental guide preserves qualification: ${phrase}`);
  }
  for (const phrase of ['fully taxable at 22%', 'one bet, repeated four times', 'Very favourable']) {
    ok(!rental.includes(phrase), `rental guide removes blanket claim: ${phrase}`);
  }
  const gross = 12000, taxable = gross * .8, tax = taxable * .22;
  for (const amount of [taxable, tax, gross - tax]) {
    ok(rental.includes(`€${amount.toLocaleString('en-IE')}`), 'rental example reconciles taxable income, tax and cash');
  }
}

{
  const risks = read('guide/risks.html').replace(/\s+/g, ' ');
  for (const phrase of ['Cheap insurance', 'one bet placed five times', 'all more likely', 'use 2.5–3%']) {
    ok(!risks.includes(phrase), `risk checklist removes unsupported assurance: ${phrase}`);
  }
  for (const phrase of ['Crisis access remains unverified', 'requires closure', 'not a retirement success-rate estimate', 'not a ranking of failure probabilities']) {
    ok(risks.includes(phrase), `risk checklist retains qualification: ${phrase}`);
  }
  const balance = returns => returns.reduce((pot, rate) => pot * (1 + rate) - 10, 100);
  ok(balance([-.2, .25]) === 77.5 && risks.includes('€77.50'), 'bad-first sequence example reconciles');
  ok(balance([.25, -.2]) === 82 && risks.includes('€82'), 'good-first sequence example reconciles');
  const anchor = 'estonian-inflation--eurozone-inflation';
  ok(risks.includes(`id="${anchor}"`) && read('guide/fire-basics.html').includes(`risks.html#${anchor}`), 'inflation cross-reference resolves');
}

{
  const basics = read('guide/fire-basics.html').replace(/\s+/g, ' ');
  for (const phrase of ['nearly harmless', 'first ~10 years determine', 'roughly in order of effectiveness', '~100% equities', 'most rigorous work']) {
    ok(!basics.includes(phrase), `withdrawal guide removes unsupported claim: ${phrase}`);
  }
  for (const phrase of ['Limited review', 'Still unverified', 'not a calibrated probability', 'not fixed ages of 60 or 65', 'initial portfolio']) {
    ok(basics.includes(phrase), `withdrawal guide retains qualification: ${phrase}`);
  }
  const first = 500000 * .04, second = first * 1.02;
  for (const amount of [first, second]) ok(basics.includes(`€${amount.toLocaleString('en-IE')}`), 'inflation-adjusted withdrawal example reconciles');
}

{
  const source = read('docs/guide/fire-basics.md');
  for (const percent of [10, 20, 30, 40, 50, 60, 70, 80]) {
    const s = percent / 100, target = (1 - s) / .04;
    let pot = 0, years = 0;
    while (pot < target) { pot = pot * 1.05 + s; years++; }
    const formula = Math.log1p(.05 * target / s) / Math.log1p(.05);
    ok(source.includes(`| ${percent}% | ${formula.toFixed(1)} | ${years} |`), `savings table reconciles formula and annual crossing: ${percent}%`);
  }
  let coast = 200000;
  for (let year = 0; year < 30; year++) coast *= 1.05;
  ok(source.includes(`€${Math.round(coast).toLocaleString('en-IE')}`), 'Coast example reconciles independent annual compounding');
  for (const phrase of ['{{pillar3.maxAnnual|money}}', 'does maybe a third', 'Especially strong in Estonia', '~€1,200–1,800/mo']) {
    ok(!source.includes(phrase), `basics removes unsupported or unrelated assumption: ${phrase}`);
  }
  ok(read('guide/levers.html').includes('fire-basics.html#savings-rate-in-a-simplified-model'), 'savings cross-reference uses current heading');
}

{
  const levers = read('guide/levers.html').replace(/\s+/g, ' ');
  for (const phrase of ['ranked by impact', 'There is no downside', 'top three are worth more', 'abolished on 1 January 2026', 'negative expected value', 'Pillar III maxed']) {
    ok(!levers.includes(phrase), `strategy removes unsupported prescription: ${phrase}`);
  }
  for (const phrase of ['not priority or expected return', 'remaining contribution allowance', 'not automatically permitted or tax-neutral', 'still under review', 'Finite fund payouts can run out', 'transaction-specific review']) {
    ok(levers.includes(phrase), `strategy retains qualification: ${phrase}`);
  }
  ok(levers.includes('id="9-geographic-arbitrage"'), 'strategy preserves existing geographic cross-reference');
}

{
  const health = read('guide/health-insurance.html').replace(/\s+/g, ' ');
  for (const phrase of ['Registration confers nothing', 'permanent residence in Estonia. Terms', '€187,000', '−22.98%', 'Simplest route by far', 'refunded pro-rata if you leave early']) {
    ok(!health.includes(phrase), `health guide removes unsupported assurance: ${phrase}`);
  }
  for (const phrase of ['Unemployment registration can provide coverage', 'who do not qualify for unemployment insurance benefit', 'monthly cancellable contract', 'additional fees and co-payments remain', 'user-confirmed ongoing coverage start', 'exact waiting period', 'not a perpetual expense', 'S1 certificate']) {
    ok(health.includes(phrase), `health guide retains distinction: ${phrase}`);
  }
  ok(health.includes(`€${(RATES.healthInsurance.voluntaryMonthly * 12).toLocaleString('en-IE')}/year`), 'health guide annual premium reconciles monthly rate');
  const household = read('guide/household.html');
  ok(household.includes('Limited review') && !household.includes('covered unconditionally'), 'household does not certify all benefits or unconditional coverage');
  const anchor = 'health-insurance--check-each-persons-route';
  ok(health.includes(`household.html#${anchor}`) && household.includes(`id="${anchor}"`), 'healthcare household cross-reference resolves');
}

{
  const household = read('guide/household.html').replace(/\s+/g, ' ');
  for (const phrase of ['Children are genuinely cheap', 'unlimited and unconditional', 'statistically more likely', 'much better KredEx terms', 'prior calendar year\'s income']) {
    ok(!household.includes(phrase), `household removes unsupported claim: ${phrase}`);
  }
  for (const phrase of ['€3,806.10', '€5,265.09', 'Source caveat', 'not automatically modeled', 'does not infer when children become independent', 'does not calculate family-benefit entitlement']) {
    ok(household.includes(phrase), `household retains scope: ${phrase}`);
  }
  // Enumerate backward from the birth month rather than repeat a date formula.
  const excluded = [], reference = [];
  const month = new Date(Date.UTC(2026, 6, 1));
  for (let i = 0; i < 21; i++) {
    month.setUTCMonth(month.getUTCMonth() - 1);
    (i < 9 ? excluded : reference).unshift(month.toISOString().slice(0, 7));
  }
  ok(excluded.length === 9 && excluded[0] === '2025-10' && excluded.at(-1) === '2026-06' && household.includes('October 2025–June 2026'), 'shared-benefit example excludes nine full months');
  ok(reference.length === 12 && reference[0] === '2024-10' && reference.at(-1) === '2025-09' && household.includes('October 2024–September 2025'), 'shared-benefit example uses preceding twelve months');
}

{
  const source = read('docs/guide/fatfire.md');
  const built = read('guide/fatfire.html').replace(/\s+/g, ' ');
  const euro = n => `€${Math.round(n).toLocaleString('en-IE')}`;
  for (const spending of [30000, 50000, 100000, 150000]) {
    const target = spending / .035;
    ok(source.includes(`| ${euro(spending)} | ${euro(target)} | ${euro(spending / .04)} |`), 'FatFIRE target row reconciles both rates');
    let pot = 0, years = 0;
    while (pot < target) { pot = pot * 1.05 + 60000; years++; }
    const n = Math.log1p(target * .05 / 60000) / Math.log1p(.05);
    ok(source.includes(`| ${euro(spending)} | ${n.toFixed(2)} | ${years} |`), 'FatFIRE formula and independent annual crossing reconcile');
  }
  for (const extra of [1000, 2000, 4000]) {
    ok(source.includes(`| ${euro(4000 + extra)} | ${euro(extra)} | ${euro(extra * 12 / .035)} | ${euro(extra * 12)} |`), 'FatFIRE permanent-spending increment reconciles');
  }
  ok(built.includes(euro(100000 / .035 - 100000 / .04)), 'FatFIRE withdrawal-rate capital difference reconciles');
  for (const phrase of ['it more than doubles it', 'the biggest single lever', 'about four years of work', '€208,000 vs €162,000']) {
    ok(!built.includes(phrase), `FatFIRE removes unsupported assertion: ${phrase}`);
  }
  for (const phrase of ['less than double', 'remaining declared allowance', 'not forecasts', 'year-end contribution', 'no corporate-account mode']) {
    ok(built.includes(phrase), `FatFIRE retains qualification: ${phrase}`);
  }
}

console.log(`\n${checks} output and cross-engine checks`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  [...new Set(failures)].slice(0, 15).forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('the built site is consistent with the engine\n');
