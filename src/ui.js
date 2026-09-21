// Form handling, persistence and rendering. All state lives in the browser:
// localStorage for convenience, a JSON file for portability. Nothing is sent
// anywhere, which is why the page can reasonably ask for real numbers.

import { simulate } from './calc.js';
import { actionPlan } from './rules.js';
import { RATES, DEFAULTS, ruleYearStatus } from './rates.js';
import {
  MAX_PERSONS, STORAGE_KEY, HASH_KEY, blankPerson, blankState, exampleState,
  encodeState, decodeState, sanitise,
} from './state.js';
import { eur, pct, pct1, escapeHtml } from './format.js';
import { infoBtn, infoRow, infoNote, bindExplain } from './explain.js';

const $ = (id) => document.getElementById(id);

/** "7 years 4 months" - how anyone waiting for a date actually measures it. */
function countdown(years) {
  if (!Number.isFinite(years)) return 'never';
  const months = Math.round(years * 12);
  if (months <= 0) return 'already there';
  const y = Math.floor(months / 12);
  const m = months % 12;
  const yPart = y ? `${y} year${y === 1 ? '' : 's'}` : '';
  const mPart = m ? `${m} month${m === 1 ? '' : 's'}` : '';
  return [yPart, mPart].filter(Boolean).join(' ');
}


// Each finding names the guide page that explains it.
const GUIDE = {
  'health-insurance': ['guide/health-insurance.html', 'Health insurance'],
  household:          ['guide/household.html', 'Household & children'],
  property:           ['guide/property.html', 'Buying a home'],
  pensions:           ['guide/pensions.html', 'Pension pillars'],
  portfolio:          ['guide/portfolio.html', 'Building the portfolio'],
  protection:         ['guide/protection.html', 'Account protection'],
  basics:             ['guide/fire-basics.html', 'FIRE basics'],
};

/** A plan handed over in the URL fragment. Sanitised like any other input:
 *  it is a string a stranger can edit. */
function fromHash() {
  const h = location.hash.slice(1);
  if (!h.startsWith(HASH_KEY)) return null;
  try {
    const next = sanitise(decodeState(h.slice(HASH_KEY.length)));
    if (next) return next;
  } catch { /* Report malformed payloads without replacing the current plan. */ }
  throw new Error('Could not read the shared plan. Your existing plan has been kept.');
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitise(JSON.parse(raw)) : null;
  } catch { return null; }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

let shared = null, sharedError = null;
try { shared = fromHash(); } catch (e) { sharedError = e.message; }
let state = shared || load() || blankState();

// ------------------------------------------------------------------ people UI

function renderPeople() {
  const wrap = $('people');
  wrap.innerHTML = '';
  state.persons.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'person';
    card.innerHTML = `
      <div class="person-head">
        <label class="pname-field">Name<input class="pname" data-i="${i}" data-k="name"></label>
        <label class="byear">Born<input type="number" min="1930" max="2015" step="1" data-i="${i}" data-k="birthYear" value="${p.birthYear}"></label>
        ${state.persons.length > 1 ? `<button class="btn btn-quiet rm" data-i="${i}">Remove</button>` : ''}
      </div>

      <p class="sub">Income</p>
      <div class="grid">
        <label>Gross salary <span class="u">€/mo</span><input type="number" min="0" step="100" data-i="${i}" data-k="income.grossMonthly" value="${p.income.grossMonthly}"></label>
        <label>Net salary <span class="u">€/mo, optional</span><input type="number" min="0" step="100" data-i="${i}" data-k="income.netMonthly" value="${p.income.netMonthly ?? ''}"></label>
      </div>
      <p class="hint" id="netHint${i}"></p>

      <p class="sub">Counted toward FI ${infoBtn('counted-in')}</p>
      ${infoNote('counted-in', `Money you could spend tomorrow, and the only money the FI target is
        built from. <strong>Cash</strong> means accounts outside the investment-account wrapper — note that deposit
        protection is ${eur(RATES.protection.depositGuarantee)} per person per bank, so a large
        balance in one place is uninsured above that. <strong>Investment account</strong> means an
        Estonian declared <em>investeerimiskonto</em>. Tax is deferred until withdrawals exceed
        the unused contribution allowance; the simulator tracks that allowance and reserves tax
        on taxable withdrawals. Include all wrapper value here, not again under Cash; this model
        treats wrapper holdings as invested at the entered return. Enter the remaining allowance after
        prior reportable withdrawals, not lifetime deposits. It can exceed current value after losses.
        Enter what each person holds in their own name — it decides who owns what at FI.`)}
      <div class="grid">
        <label>Cash <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.cash" value="${p.assets.cash}"></label>
        <label>Investment account <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.investmentAccount" value="${p.assets.investmentAccount}"></label>
        <label>Investment-account unused contribution allowance <span class="u">€ remaining after prior withdrawals</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.investmentAccountContributions" value="${p.assets.investmentAccountContributions ?? 0}"></label>
        <label>Future investments go to<select data-i="${i}" data-k="investmentDestination"><option value="investmentAccount" ${p.investmentDestination !== 'brokerage' ? 'selected' : ''}>Investment account</option><option value="brokerage" ${p.investmentDestination === 'brokerage' ? 'selected' : ''}>Ordinary brokerage</option></select></label>
        <label>Ordinary brokerage account <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.brokerage" value="${p.assets.brokerage ?? 0}"></label>
        <label>Brokerage cost basis <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.brokerageCostBasis" value="${p.assets.brokerageCostBasis ?? 0}"></label>
      </div>

      <p class="hint">Use the remaining contribution allowance from your records, not lifetime
        deposits. New investment-account savings increase that allowance; market gains do not.
        Future-investment destination does not move existing holdings.</p>

      <p class="sub">Not counted toward FI ${infoBtn('counted-out')}</p>
      ${infoNote('counted-out', `Shown so the total is visible, never added to the target. The
        pension pillars are locked until each person's own unlock date, which is state pension age
        minus five — no use to a plan that stops working before then. Crypto is left out by choice:
        untick <em>Exclude crypto</em> under Circumstances to count it, but a plan resting on it is
        a bet rather than a plan. Excluding both is what makes the answer robust to the two things
        most likely to disappoint.`)}
      <div class="grid">
        <label>Pillar II balance <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.pillar2" value="${p.assets.pillar2}"></label>
        <label>Pillar III balance <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.pillar3" value="${p.assets.pillar3}"></label>
        <label>Crypto <span class="u">€</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.crypto" value="${p.assets.crypto}"></label>
        <label>Crypto cost basis <span class="u">€; used if crypto is counted</span><input type="number" min="0" step="1000" data-i="${i}" data-k="assets.cryptoCostBasis" value="${p.assets.cryptoCostBasis ?? 0}"></label>
        <label><input type="checkbox" data-i="${i}" data-k="assets.cryptoMicaEligible" ${p.assets.cryptoMicaEligible ? 'checked' : ''}> MiCA-provider financial-asset treatment confirmed</label>
      </div>
      <p class="sub">Paying into pensions ${infoBtn('paying-in')}</p>
      ${infoNote('paying-in', `<strong>Pillar III contributions</strong> are money out, not income:
        they leave what you can invest and land in a pension locked until unlock age, in exchange
        for a possible income tax refund on the deductible portion. The full payment is invested;
        the salary-only refund estimate excludes other income and deductions. The allowance is
        the lower of ${pct(RATES.pillar3.maxShareOfGross)} of gross and
        ${eur(RATES.pillar3.maxAnnual)}, it is per earner, and it cannot be transferred to a
        spouse.${state.assumptions.pensionPolicy === 'all' ? ` <br><br><strong>Pension units
        earned</strong> is what Pillar I has actually accrued so far, and it is the figure to use if
        you can get it: Sotsiaalkindlustusamet holds it, and it appears in the pension calculator on
        their self-service portal. A year at the average Estonian wage earns roughly 1.0 unit, less
        if you are in Pillar II, more on a higher salary.<br><br>It beats any estimate because it
        already accounts for the things an estimate cannot — years worked <em>outside</em> Estonia,
        which build no Estonian pension at all, months between jobs, and a salary that changed.
        <strong>Qualifying service and pension units are separate inputs.</strong> If either is
        missing, state-pension income is excluded; the planner does not reconstruct past units
        from years worked or today's salary.` : ''}`)}
      <div class="grid">
        <label>Pillar III contributions <span class="u">€/yr</span><input type="number" min="0" step="500" data-i="${i}" data-k="pillar3Annual" value="${p.pillar3Annual}"></label>
        <label>First Pillar III contribution <span class="u">year; access and tax rules depend on it</span><input type="number" min="1998" max="${RATES.year}" step="1" data-i="${i}" data-k="pillar3FirstContributionYear" value="${p.pillar3FirstContributionYear ?? ''}"></label>
        <label ${state.assumptions.pensionPolicy === 'all' ? '' : 'hidden'}>Pension units earned ${infoBtn('pension-units')} <span class="u">from the state's own record</span><input type="number" min="0" max="60" step="0.1" data-i="${i}" data-k="pillar1Units" value="${p.pillar1Units ?? ''}"></label>
        <label ${state.assumptions.pensionPolicy === 'all' ? '' : 'hidden'}>Estonian pension service <span class="u">qualifying years already accrued, not calendar years worked</span><input type="number" min="0" max="80" step="0.1" data-i="${i}" data-k="yearsWorkedEstonia" value="${p.yearsWorkedEstonia ?? ''}"></label>
        <label ${state.assumptions.pensionPolicy === 'all' ? '' : 'hidden'}>Other EU/EEA service <span class="u">years; official pro-rata result still required</span><input type="number" min="0" max="80" step="0.1" data-i="${i}" data-k="yearsWorkedEuEea" value="${p.yearsWorkedEuEea ?? 0}"></label>
        <label ${state.assumptions.pensionPolicy === 'all' ? '' : 'hidden'}><input type="checkbox" data-i="${i}" data-k="nationalPensionEligible" ${p.nationalPensionEligible ? 'checked' : ''}> National-pension residence/foreign-pension conditions confirmed</label>
        <label ${state.assumptions.pensionPolicy === 'ignore' || state.assumptions.pillarPayout === 'lumpSum' ? 'hidden' : ''}>Official fund-pension duration <span class="u">years, from Pensionikeskus</span><input type="number" min="1" max="60" step="1" data-i="${i}" data-k="fundPensionYears" value="${p.fundPensionYears ?? ''}"></label>
      </div>
      ${infoNote('pension-units', `Your accrued Pillar I coefficient — what the state has actually
        recorded, rather than anything estimated from a career length.
        <br><br><strong>Future service is a salary-based estimate.</strong> A year below the
        annual minimum wage adds a proportional qualifying year; zero gross salary adds none,
        even with a net-income override. Employer minimum social-tax top-ups, state-paid
        contributions and special qualifying periods are not inferred. Check your official
        service record; this estimate is not an eligibility determination.
        <br><br><strong>Where to find it.</strong> Sign in to Sotsiaalkindlustusamet's self-service
        at <a href="https://iseteenindus.sotsiaalkindlustusamet.ee/" target="_blank"
        rel="noopener">iseteenindus.sotsiaalkindlustusamet.ee</a> with an ID-card, Mobile-ID or
        Smart-ID, and open the pension calculator there — it is pre-filled from your own record. It
        is also reachable through <a href="https://www.eesti.ee/et" target="_blank"
        rel="noopener">eesti.ee</a>.
        <br><br>It may be shown as three separate components — <em>staažiosak</em> for work before
        1999, <em>kindlustusosak</em> for 1999–2020, and <em>ühendosa</em> from 2021. They share one
        per-unit rate, so <strong>add the three together</strong> and enter the total.
        <br><br><strong>Mind the decimal.</strong> The law writes these coefficients to three
        decimal places — a year at the average wage is <em>1,000</em>, not one thousand — and the
        portal often shows them with the separator dropped. So a component displayed as
        <em>14620</em> means <strong>14.620</strong>. Divide by a thousand before entering, or the
        figure comes out a thousand times too large; a plausible total here is a couple of dozen,
        never tens of thousands.
        <br><br>For scale, a year at the average Estonian wage earns about 1.0 — less inside
        Pillar II, more on a higher salary. Leave it blank and nothing is counted as accrued
        yet — only the years you have still to work. There is deliberately no estimate from a
        career length: it would flatter anyone who worked outside Estonia, since only Estonian
        social tax builds an Estonian pension.`)}

      <p class="sub">Insurance ${infoBtn('insurance')}</p>
      ${infoNote('insurance', `Both are outgoings, so both come off what can be invested — leave
        them out of monthly spending or they count twice. Neither becomes an asset: they buy
        protection, not a balance.<br><br><strong>Term life cover</strong> should be on each adult
        whose income or unpaid work the household depends on, for at least the outstanding mortgage
        plus several years of spending. <strong>A voluntary health contract</strong> is what someone
        without employment needs, because Estonian cover follows social tax rather than residency —
        currently ${eur(RATES.healthInsurance.voluntaryMonthly)} a month, starting one month after
        signing, so a gap cannot be closed retroactively.`)}
      <div class="checks">
        <label><input type="checkbox" data-i="${i}" data-k="lifeInsurance" ${p.lifeInsurance ? 'checked' : ''}> Pays for term life cover</label>
        <label><input type="checkbox" data-i="${i}" data-k="healthInsurance" ${p.healthInsurance ? 'checked' : ''}> Pays for a voluntary health contract</label>
        <label><input type="checkbox" data-i="${i}" data-k="healthCoveredAfterFi" ${p.healthCoveredAfterFi ? 'checked' : ''}> Confirmed health cover throughout retirement, with no extra premium (for example S1)</label>
        <label class="coverage-date" ${p.healthCoveredAfterFi ? 'hidden' : ''}>Confirmed health-cover start year <span class="u">optional; no extra premium from this date</span><input type="number" min="1900" max="2200" step="1" data-i="${i}" data-k="healthCoverageFromYear" value="${p.healthCoverageFromYear ?? ''}"></label>
        <p class="hint">Leave the year blank unless an ongoing coverage route is confirmed.
          Pension age alone is not confirmation. Without a route, premiums continue through
          the planning horizon and remain in the perpetual-income target. Older plans now
          use this conservative assumption; confirm your coverage before changing it.</p>
      </div>
      <div class="grid" ${p.lifeInsurance || p.healthInsurance ? '' : 'hidden'}>
        <label ${p.lifeInsurance ? '' : 'hidden'}>Life cover <span class="u">€/mo</span><input type="number" min="0" step="5" data-i="${i}" data-k="lifeInsuranceMonthly" value="${p.lifeInsuranceMonthly ?? 0}"></label>
        <label ${p.healthInsurance ? '' : 'hidden'}>Health contract <span class="u">€/mo</span><input type="number" min="0" step="1" data-i="${i}" data-k="healthInsuranceMonthly" value="${p.healthInsuranceMonthly ?? RATES.healthInsurance.voluntaryMonthly}"></label>
      </div>
`;
    card.querySelector('.pname').value = p.name;
    wrap.appendChild(card);
  });

  updatePersonLabels();
  $('addPerson').hidden = state.persons.length > 1;
  $('allocWrap').hidden = state.persons.length < 2;
}

function updatePersonLabels() {

  // Who funds the house only needs asking when there is more than one person.
  const pb = $('paidByWrap'), sel = $('hPaidBy');
  pb.hidden = state.persons.length < 2;
  if (!pb.hidden) {
    const cur = state.household.property?.purchase?.paidBy ?? 'proportional';
    sel.replaceChildren(new Option('Both, in proportion to cash', 'proportional'),
      ...state.persons.map((p, i) => new Option(p.name, String(i))));
    sel.value = String(cur);
  }

  if (state.persons.length === 2) {
    const share = Math.round((state.persons[0].allocationShare ?? 0.5) * 100);
    $('alloc').value = share;
    $('allocOut').textContent =
      `${share}% ${state.persons[0].name} / ${100 - share}% ${state.persons[1].name}`;
  }
}

function setDeep(obj, path, value) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
  o[parts[parts.length - 1]] = value;
}

// -------------------------------------------------------------- form binding

const HOUSE = {
  hPrice: 'price', hDeposit: 'deposit', hTerm: 'termYears',
  hRate: 'rate', hRunning: 'runningCostsMonthly', hMonths: 'monthsAway',
  hMoving: 'movingCosts', hCollateral: 'collateralValue', hOtherDebt: 'otherDebtMonthly',
};

function formToState() {
  const h = state.household;
  h.spending.housing = +$('sHousing').value || 0;
  h.spending.childCosts = +$('sChild').value || 0;
  h.spending.childCostsEndYear = $('sChildEnd').value === '' ? null : +$('sChildEnd').value;
  h.spending.other = +$('sOther').value || 0;
  h.spending.buffer = +$('sBuffer').value || 0;
  h.rentalIncomeNetMonthly = +$('otherIncome').value || 0;
  h.hasDependents = $('hasDependents').checked;
  state.excludeCrypto = $('excludeCrypto').checked;
  // `+value || fallback` swallows a deliberate zero, and 0% real return is a
  // legitimate - and interesting - thing to model. Only an empty or unparseable
  // field falls back.
  const field = (id, fallback) => {
    const raw = $(id).value;
    if (raw === '' || raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  state.assumptions.realReturn = field('aReturn', DEFAULTS.realReturn * 100) / 100;
  state.assumptions.brokerageRealReturn = field('aBrokerageReturn', DEFAULTS.realReturn * 100) / 100;
  state.assumptions.cashRealReturn = field('aCashReturn', DEFAULTS.cashRealReturn * 100) / 100;
  state.assumptions.retirementCashReserve = Math.max(0, Math.min(1e9, field('aRetirementReserve', 0)));
  state.assumptions.swr = field('aSwr', DEFAULTS.swr * 100) / 100;
  state.assumptions.planToAge = field('aPlanToAge', DEFAULTS.planToAge);
  state.assumptions.spendingGrowth = field('aSpendGrowth', 0) / 100;
  state.assumptions.bufferYears = field('aBufferYears', 0);
  state.assumptions.inflation = field('aInflation', DEFAULTS.inflation * 100) / 100;
  state.assumptions.transactionCostRate = field('aTransactionCosts', DEFAULTS.transactionCostRate * 100) / 100;
  state.assumptions.emergencyFundMonths = field('aEmergencyMonths', DEFAULTS.emergencyFundMonths);
  // Counting Pillar I needs a career length, so that field comes and goes with
  // the policy. Safe to re-render here: focus is on the select, not on a card.
  const policyBefore = state.assumptions.pensionPolicy;
  state.assumptions.pensionPolicy = $('aPensionPolicy').value || 'ignore';
  state.assumptions.portfolioEnd = $('aPortfolioEnd').value || 'perpetual';
  if (policyBefore !== state.assumptions.pensionPolicy) renderPeople();
  state.assumptions.pillarDrawAge = $('aPillarDrawAge').value || 'unlock';
  const payoutBefore = state.assumptions.pillarPayout;
  state.assumptions.pillarPayout = $('aPillarPayout').value;
  state.assumptions.pensionLumpSumInvestedShare = field('aLumpInvestedShare', 0) / 100;
  if (payoutBefore !== state.assumptions.pillarPayout) renderPeople();
  state.assumptions.potsCountedShare = field('aPotsShare', 100) / 100;
  state.assumptions.stateCountedShare = field('aStateShare', 100) / 100;
  state.assumptions.statePensionEarlyYears = field('aStateEarly', 0);
  // Only meaningful once something is being counted.
  $('drawAgeWrap').hidden = state.assumptions.pensionPolicy === 'ignore';
  $('payoutWrap').hidden = state.assumptions.pensionPolicy === 'ignore';
  $('lumpShareWrap').hidden = state.assumptions.pensionPolicy === 'ignore' || state.assumptions.pillarPayout !== 'lumpSum';
  $('potsShareWrap').hidden = state.assumptions.pensionPolicy === 'ignore';
  $('stateShareWrap').hidden = state.assumptions.pensionPolicy !== 'all';
  $('earlyWrap').hidden = state.assumptions.pensionPolicy !== 'all';

  if ($('buying').checked) {
    const p = h.property?.purchase || {};
    for (const [id, key] of Object.entries(HOUSE)) {
      const v = +$(id).value || 0;
      p[key] = key === 'rate' ? v / 100 : v;
    }
    const pb = $('hPaidBy').value;
    p.paidBy = pb === 'proportional' || pb === '' ? 'proportional' : Number(pb);
    h.property = { purchase: p };
  } else {
    h.property = null;
  }
}

function stateToForm() {
  const h = state.household;
  $('sHousing').value = h.spending.housing;
  $('sChild').value = h.spending.childCosts;
  $('sChildEnd').value = h.spending.childCostsEndYear ?? '';
  $('sOther').value = h.spending.other;
  $('sBuffer').value = h.spending.buffer;
  $('otherIncome').value = h.rentalIncomeNetMonthly;
  $('hasDependents').checked = !!h.hasDependents;
  $('excludeCrypto').checked = state.excludeCrypto !== false;
  $('aReturn').value = (state.assumptions.realReturn * 100).toFixed(1);
  $('aBrokerageReturn').value = ((state.assumptions.brokerageRealReturn ?? DEFAULTS.realReturn) * 100).toFixed(1);
  $('aCashReturn').value = +((state.assumptions.cashRealReturn ?? DEFAULTS.cashRealReturn) * 100).toFixed(2);
  $('aRetirementReserve').value = state.assumptions.retirementCashReserve ?? 0;
  $('aSwr').value = (state.assumptions.swr * 100).toFixed(2);
  $('aPlanToAge').value = state.assumptions.planToAge ?? DEFAULTS.planToAge;
  $('aSpendGrowth').value = +((state.assumptions.spendingGrowth ?? 0) * 100).toFixed(2);
  $('aBufferYears').value = state.assumptions.bufferYears ?? 0;
  $('aInflation').value = +((state.assumptions.inflation ?? DEFAULTS.inflation) * 100).toFixed(2);
  $('aTransactionCosts').value = +((state.assumptions.transactionCostRate ?? DEFAULTS.transactionCostRate) * 100).toFixed(2);
  $('aEmergencyMonths').value = state.assumptions.emergencyFundMonths ?? DEFAULTS.emergencyFundMonths;
  $('aPensionPolicy').value = state.assumptions.pensionPolicy || 'ignore';
  $('aPortfolioEnd').value = state.assumptions.portfolioEnd || 'perpetual';
  $('aPillarDrawAge').value = state.assumptions.pillarDrawAge || 'unlock';
  $('aPotsShare').value = +((state.assumptions.potsCountedShare ?? 1) * 100).toFixed(0);
  $('aStateShare').value = +((state.assumptions.stateCountedShare ?? 1) * 100).toFixed(0);
  $('aStateEarly').value = state.assumptions.statePensionEarlyYears ?? 0;
  $('drawAgeWrap').hidden = (state.assumptions.pensionPolicy || 'ignore') === 'ignore';
  $('payoutWrap').hidden = (state.assumptions.pensionPolicy || 'ignore') === 'ignore';
  $('aPillarPayout').value = state.assumptions.pillarPayout || 'fundPension';
  $('aLumpInvestedShare').value = (state.assumptions.pensionLumpSumInvestedShare ?? 0) * 100;
  $('lumpShareWrap').hidden = state.assumptions.pensionPolicy === 'ignore' || state.assumptions.pillarPayout !== 'lumpSum';
  $('potsShareWrap').hidden = (state.assumptions.pensionPolicy || 'ignore') === 'ignore';
  $('stateShareWrap').hidden = (state.assumptions.pensionPolicy || 'ignore') !== 'all';
  $('earlyWrap').hidden = (state.assumptions.pensionPolicy || 'ignore') !== 'all';

  const buying = !!h.property?.purchase;
  $('buying').checked = buying;
  $('houseFields').hidden = !buying;
  const p = h.property?.purchase || {
    price: 300000, deposit: 60000, termYears: 30, rate: 0.04,
    runningCostsMonthly: 300, monthsAway: 12, movingCosts: 10000,
    collateralValue: 300000, otherDebtMonthly: 0,
  };
  for (const [id, key] of Object.entries(HOUSE)) {
    $(id).value = key === 'rate' ? (p[key] * 100).toFixed(1) : p[key];
  }
  renderPeople();
}

// --------------------------------------------------------------------- chart

/**
 * Portfolio trajectory against the FI target. Inline SVG so it inherits the
 * page's colours and works with no dependencies. When there are two people the
 * area is split to show who owns what.
 */
function chart(sim) {
  const t = sim.timeline;
  if (!Number.isFinite(t.yearsToFi)) return '';

  const W = 640, H = 260, PAD = { l: 56, r: 14, t: 14, b: 28 };
  const span = Math.max(6, Math.ceil(t.yearsToFi * 1.15));
  const samples = sim.timeline.accumulation || [];
  const sampleAt = (i, y) => {
    if (!samples.length) return 0;
    const hi = samples.findIndex((p) => p.years >= y);
    if (hi < 0) return samples[samples.length - 1].perPerson[i] || 0;
    if (hi === 0) return samples[0].perPerson[i] || 0;
    const a = samples[hi - 1], b = samples[hi];
    const f = b.years === a.years ? 0 : (y - a.years) / (b.years - a.years);
    return (a.perPerson[i] || 0) + ((b.perPerson[i] || 0) - (a.perPerson[i] || 0)) * f;
  };
  const series = sim.persons.map((p, i) => ({ name: p.name, at: (y) => sampleAt(i, y) }));
  const totalAt = (y) => series.reduce((acc, s) => acc + s.at(y), 0);

  const yMax = Math.max(sim.fi.number, totalAt(span)) * 1.08;
  const x = (y) => PAD.l + (y / span) * (W - PAD.l - PAD.r);
  const yy = (v) => H - PAD.b - (v / yMax) * (H - PAD.t - PAD.b);

  const steps = 60;
  const pts = (fn) => Array.from({ length: steps + 1 }, (_, i) => {
    const y = (i / steps) * span;
    return `${x(y).toFixed(1)},${yy(fn(y)).toFixed(1)}`;
  }).join(' ');

  // Stacked areas, cumulative from the first person.
  let cum = () => 0;
  const bands = series.map((s, i) => {
    const below = cum;
    const upTo = (y) => below(y) + s.at(y);
    cum = upTo;
    const top = pts(upTo).split(' ');
    const bottom = pts(below).split(' ').reverse();
    return `<polygon class="band b${i}" points="${top.concat(bottom).join(' ')}"/>`;
  }).join('');

  const gridVals = [0.25, 0.5, 0.75, 1].map((f) => yMax * f);
  const grid = gridVals.map((v) =>
    `<line class="grid" x1="${PAD.l}" x2="${W - PAD.r}" y1="${yy(v)}" y2="${yy(v)}"/>
     <text class="lbl" x="${PAD.l - 8}" y="${yy(v) + 4}" text-anchor="end">${
       v >= 1e6 ? '€' + (v / 1e6).toFixed(1) + 'M' : '€' + Math.round(v / 1000) + 'k'}</text>`
  ).join('');

  const ticks = [0, 0.5, 1].map((f) => {
    const y = span * f;
    return `<text class="lbl" x="${x(y)}" y="${H - 8}" text-anchor="middle">${Math.round(sim.currentYear + y)}</text>`;
  }).join('');

  const fiY = yy(sim.fi.number);
  const cx = x(t.yearsToFi);

  return `
    ${sim.schedule.length ? `
    <h3>Where the money comes from, year by year ${infoBtn('schedule')}</h3>
    ${infoNote('schedule', `Every year from the day you stop working to age ${sim.assumptions.planToAge},
      with recurring income and spending in euros per month. Lump-sum proceeds and their tax
      are annual totals, while cash and investment columns are balances. This is the actual drawdown the FI date was solved against, not an
      illustration — the portfolio column is what is being taken out, and the last column is what
      remains after that year's withdrawal and growth. Rows where the composition changes are
      marked; those are the dates the whole plan turns on. The columns are <em>sources</em> and
      <em>Spending</em> is what they have to cover, so they need not add up to it — in a year where
      the pension alone covers everything the portfolio contributes nothing, and anything beyond
      that shows as <em>Spare</em>. Cash and investments earn their separate returns.
      The cash column includes the protected reserve, which cannot fund ordinary spending.
      Balances are totals, not monthly amounts. The final balance includes any protected reserve:
      ${sim.fi.bridging
        ? 'a bridged plan is meant to be spent, not preserved.'
        : 'this plan is not meant to run down at all, so it should still be growing at the end.'}`)}
    ${(() => {
      // Once pension income exceeds spending the sources stop summing to it, so
      // the surplus gets a column of its own rather than vanishing.
      const spare = sim.schedule.some((r) => r.unusedPension > 0.5);
      return `
    <div class="schedule-wrap" tabindex="0" role="region" aria-label="Retirement cash-flow schedule">
    <table class="mini schedule">
      <thead>
        <tr>
          <th>Year</th><th>Age</th>
          <th>Portfolio</th>
          ${sim.fi.countsPots ? '<th>Pillars II &amp; III</th>' : ''}
          ${sim.fi.countsPots && sim.fi.pillarPayout === 'lumpSum' ? '<th>Counted net lump sum (annual)</th><th>Withdrawal tax (annual)</th>' : ''}
          ${sim.fi.policy === 'all' ? '<th>State pension</th>' : ''}
          <th>Spending</th>${spare ? '<th>Spare</th>' : ''}<th>Cash left</th><th>Investments left</th><th>Portfolio left</th>
          <th>Investment-account tax reserve (annual)</th>
        </tr>
      </thead>
      <tbody>
      ${sim.schedule.map((row, i) => {
        const prev = sim.schedule[i - 1];
        // A row is a milestone when the mix of sources changes.
        const shape = (r) => r && `${r.fromPots > 0.5}|${r.fromState > 0.5}|${r.health > 0.5}`;
        const turn = !prev || shape(row) !== shape(prev);
        const mo = (v) => (v > 0.5 ? eur(v / 12) : '—');
        return `<tr class="${turn ? 'turn' : ''}">
          <td>${row.year}</td>
          <td>${row.ages.map((a) => a.toFixed(0)).join(' · ')}</td>
          <td>${mo(row.fromPortfolio)}</td>
          ${sim.fi.countsPots ? `<td>${mo(row.fromPots)}</td>` : ''}
          ${sim.fi.countsPots && sim.fi.pillarPayout === 'lumpSum' ? `<td>${eur(row.lumpNet)}</td><td>${eur(row.lumpTax)}</td>` : ''}
          ${sim.fi.policy === 'all' ? `<td>${mo(row.fromState)}</td>` : ''}
          <td>${eur(row.need / 12)}</td>
          ${spare ? `<td class="${row.unusedPension > 0.5 ? 'spare' : ''}">${mo(row.unusedPension)}</td>` : ''}
          <td>${eur(row.cash)}</td><td>${eur(row.investments)}</td><td>${eur(row.closing)}</td>
          <td>${eur(row.investmentTax)}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    </div>`;
    })()}
    <p class="hint">${sim.fi.spendingGrowth
      ? `Spending starts at ${eur(sim.spending.perpetual / 12)}/month and rises
         ${pct1(sim.fi.spendingGrowth)} a year <em>above inflation</em>, which is why the total
         column climbs`
      : `Spending is ${eur(sim.spending.perpetual / 12)}/month throughout`}${sim.spending.healthYears > 0.5
      ? `, plus ${eur(sim.spending.healthAtFi / 12)}/month for health cover until a confirmed coverage start, or through the planning horizon` : ''}
      — <strong>in today's money</strong>. A flat column does not mean spending never rises: it
      means it rises <em>exactly</em> with prices, so it buys the same basket. In the euros of the
      day, that ${eur(sim.schedule[sim.schedule.length - 1].need / 12)} in
      ${sim.schedule[sim.schedule.length - 1].year} is about
      ${eur(sim.schedule[sim.schedule.length - 1].need / 12 *
            (1 + sim.fi.inflation) ** (sim.schedule[sim.schedule.length - 1].year - sim.currentYear))}
      at ${pct1(sim.fi.inflation)} inflation. Only <em>Spending growth</em>, currently
      ${pct1(sim.fi.spendingGrowth)}, makes this column move — that is the cost of the same life
      rising faster than everything else. The portfolio column falls as pension income arrives and
      rises again if it stops.${sim.schedule.some((r) => r.unusedPension > 0.5)
        ? ` <strong>Spare</strong> is pension income beyond what the plan needs that year. It is not
           reinvested here: assuming you would keep earning ${pct1(sim.assumptions.realReturn)} real
           on it into your eighties would flatter the plan, so it is left out. Read it as headroom.`
        : ''}</p>` : ''}

    <h3>Getting there</h3>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img"
         aria-label="Portfolio growth reaching the FI target in ${Math.round(t.fiYear)}">
      ${grid}
      ${bands}
      <polyline class="total" points="${pts(totalAt)}"/>
      <line class="target" x1="${PAD.l}" x2="${W - PAD.r}" y1="${fiY}" y2="${fiY}"/>
      <text class="lbl target-lbl" x="${W - PAD.r}" y="${fiY - 6}" text-anchor="end">FI target</text>
      <line class="marker" x1="${cx}" x2="${cx}" y1="${fiY}" y2="${H - PAD.b}"/>
      <circle class="dot" cx="${cx}" cy="${fiY}" r="4.5"/>
      <text class="lbl" x="${cx}" y="${fiY - 12}" text-anchor="middle">${Math.round(t.fiYear)}</text>
      ${ticks}
    </svg>
    ${series.length > 1 ? `<p class="legend">${series.map((s, i) =>
      `<span class="key k${i}"></span>${escapeHtml(s.name)}`).join(' ')}</p>` : ''}
  `;
}

// ------------------------------------------------------------------ rendering

function render() {
  const ruleStatus = ruleYearStatus(new Date().getFullYear());
  $('ruleYearStatus').textContent = ruleStatus.message;
  $('ruleYearStatus').className = ruleStatus.mismatch ? 'alert' : 'hint';
  let sim, noPensionSim, plan;
  try {
    const currentYear = new Date().getFullYear();
    sim = simulate({ ...state, currentYear });
    // When pensions are active, keep a zero-benefit stress case beside the
    // selected result. Contributions and their effect on take-home stay exactly
    // as entered: only the benefits are switched off. That makes this a clean
    // answer to "what if no pension ever pays?", not a different tax/employment
    // history in which the pension system never existed.
    if (sim.fi.policy !== 'ignore') {
      noPensionSim = simulate({
        ...state,
        assumptions: { ...state.assumptions, pensionPolicy: 'ignore' },
        currentYear,
      });
    }
    plan = actionPlan(sim, state);
  } catch (e) {
    $('headline').innerHTML = `<p class="empty">Add your income and spending to see a plan.</p>`;
    $('chart').innerHTML = ''; $('plan').innerHTML = '';
    $('pensionEffectHint').textContent = '';
    return;
  }

  // Show the take-home the model is actually using. Everything downstream -
  // savings rate, surplus, the FI date - is built on it, and leaving it unstated
  // means nobody can check it against a payslip or tell when to override it.
  sim.persons.forEach((p, i) => {
    const el = $(`netHint${i}`);
    if (!el) return;
    if (!p.grossAnnual) { el.textContent = ''; return; }
    el.innerHTML = p.income.netMonthly != null
      ? `Using your figure of <strong>${eur(p.income.netMonthly)}</strong>/mo instead of the
         ${eur(p.tax.net / 12)}/mo the tax rules give. Clear the field to go back to the model.`
      : `Left blank, so it is worked out from gross: <strong>${eur(p.tax.net / 12)}</strong>/mo
         after ${eur(p.tax.incomeTax / 12)} income tax and
         ${eur((p.tax.unemploymentInsurance + p.tax.pillar2Employee) / 12)} unemployment insurance
         and Pillar II. Enter your payslip figure if it differs — it may include deductions the
         model cannot know about.`;
  });

  // The real/nominal pair has to track the two fields it describes. Stating a
  // fixed example beside inputs the reader can change is how prose goes stale.
  {
    const r = sim.assumptions.realReturn, i = sim.fi.inflation;
    const nominal = (1 + r) * (1 + i) - 1;
    const el = $('returnHint');
    if (el) {
      el.innerHTML =
        `<strong>Real return</strong> is growth after inflation has been taken out. Part of what
         shares return is only compensation for prices rising — that part is not wealth, it just
         keeps you level. At ${pct1(r)} real and ${pct1(i)} inflation you are assuming
         <strong>${pct1(nominal)} nominal</strong>, since the two multiply rather than add.
         ${r === 0 ? 'At 0% real the portfolio buys exactly what was put into it, however large the number gets.' : ''}
         <strong>Inflation is therefore already handled</strong>, and every figure on this page is
         in today's money: €1,000 of spending in 2050 means what €1,000 buys now, not the larger
         number you would actually hand over. <strong>Enter this after ongoing fund/broker fees and
         <em>before</em> investment-account withdrawal tax.</strong> This return also applies to pension funds.
         Investment-account withdrawals use each person's remaining nominal contribution allowance;
         excess withdrawals fund a ${pct(RATES.incomeTax)} tax reserve immediately. This is a planning
         reserve, not the statutory payment date; personal exemptions and credits are not modeled.
         Brokerage/crypto use the separate <strong>after-tax real return</strong> and an opening gains-tax
         reserve, not transaction-level taxation. Cash means money outside the investment account.
         New savings and reinvested pension lump sums follow each person's selected destination.
         Withdrawals use external cash first, then each owner's ordinary investments before their
         investment account. Tax allowances are never pooled between people.`;
    }
  }

  // Pension controls have prerequisites elsewhere in the form, and the
  // capital-floor portfolio mode intentionally treats temporary pot income
  // differently from an indexed state pension. Explain immediately when a
  // changed setting therefore cannot move the headline result.
  {
    const el = $('pensionEffectHint');
    const messages = [];
    if (sim.fi.policy === 'ignore') {
      messages.push('<strong>Pensions are currently ignored.</strong> Select a pension option to let them affect the plan.');
    } else {
      if (!sim.fi.countsPots) {
        messages.push('Pillars II and III are set to 0%, so their income is not counted.');
      } else {
        const missingTerms = sim.portfolio.perPerson.some((p) =>
          p.pensionAtUnlock > 1 && !p.pensionTermsKnown);
        if (missingTerms) {
          messages.push(`Pillars II and III cannot affect the result for one or more people yet. Enter the official fund-pension duration under <strong>Paying into pensions</strong>.`);
        }
      }

      if (sim.fi.policy === 'all') {
        if (!sim.fi.countsState) {
          messages.push('The state pension is set to 0%, so it is not counted.');
        } else if (sim.persons.some((p) => !p.pillar1UnitsKnown || !p.serviceYearsKnown)) {
          messages.push('State-pension income is excluded for one or more people. Enter pension units and Estonian service years under <strong>Paying into pensions</strong>.');
        }
      }

      if (!sim.fi.bridging && sim.fi.pillarPayout === 'lumpSum') {
        messages.push('<strong>Capital-floor mode is selected.</strong> A counted net lump sum adds accessible capital when received; it is not permanent income and does not reduce the spending-based capital floor. Future receipts cannot satisfy that floor before they arrive.');
      } else if (!sim.fi.bridging) {
        messages.push('<strong>Capital-floor mode is selected.</strong> Pillars II and III are not permanent indexed income, so they cannot by themselves lower the headline FI number or date. Only a countable indexed state pension can lower that floor. Choose <strong>Last until the planning age</strong> if the portfolio may be spent down as pensions take over.');
      } else if (!messages.length) {
        messages.push('<strong>Pension settings are active.</strong> They are included in both the amount needed when work stops and the calculated FI date.');
      }
    }
    el.innerHTML = messages.join(' ');
  }

  // Everything on the page is in today's money. For a figure that lands decades
  // out, the euros of that day are a different number, and saying so once per
  // figure beats one disclaimer nobody reads.
  const yearsOut = Number.isFinite(sim.timeline.yearsToFi) ? sim.timeline.yearsToFi : 0;
  const inCashOfFiYear = (real) => real * (1 + sim.fi.inflation) ** yearsOut;
  const cashNote = (real, when = Math.round(sim.timeline.fiYear)) =>
    sim.fi.inflation > 0 && yearsOut > 1
      ? ` In the euros of ${when}, that is about <strong>${eur(inCashOfFiYear(real))}</strong> at
         ${pct1(sim.fi.inflation)} inflation — the same basket, a bigger number.`
      : '';

  const ready = sim.spending.now > 0;
  if (!ready) {
    $('headline').innerHTML = `<p class="empty">Add your spending to see a plan.</p>`;
    $('chart').innerHTML = ''; $('plan').innerHTML = '';
    return;
  }

  const t = sim.timeline;
  // Surplus describes current cash flow, not retirement feasibility. Existing
  // assets may fund a valid plan even with no income or new savings.
  const onTrack = sim.savings.surplusAfterMove > 0;
  // A shortfall worth a fifth of a percent of income is a rounding error, not a
  // crisis. Say so proportionately rather than sounding the same alarm.
  const gapShare = sim.income.householdNetIncome > 0
    ? -sim.savings.surplusAfterMove / sim.income.householdNetIncome : 1;
  const marginal = !onTrack && gapShare < 0.02;
  const reachable = Number.isFinite(t.yearsToFi);

  const scenarioDate = (scenario) => {
    const reached = Number.isFinite(scenario.timeline.yearsToFi);
    if (!reached) return 'No FI date on these inputs';
    const ages = scenario.timeline.agesAtFi
      .map((x) => `${escapeHtml(x.name)} age ${x.age.toFixed(0)}`).join(' · ');
    return `FI ${Math.round(scenario.timeline.fiYear)} · ${ages}`;
  };
  const pensionTrust = sim.fi.policy === 'all'
    ? `Pillars II & III at ${pct(sim.fi.potsShare)} · Pillar I at ${pct(sim.fi.stateShare)}`
    : `Pillars II & III at ${pct(sim.fi.potsShare)}`;
  const pensionComparison = noPensionSim ? `
    <h3 class="scenario-title">The same plan, with and without pension benefits</h3>
    <div class="scenario-compare" aria-label="FIRE comparison with and without pension benefits">
      <article class="scenario-card">
        <h4>Without pension benefits</h4>
        <b>${eur(noPensionSim.fi.number)}</b>
        <span>accessible portfolio needed</span>
        <p>${scenarioDate(noPensionSim)}</p>
        <small>Benefits assumed to pay zero. Salary deductions and contributions stay unchanged.</small>
      </article>
      <article class="scenario-card selected">
        <h4>Including pension benefits</h4>
        <b>${eur(sim.fi.number)}</b>
        <span>accessible portfolio needed</span>
        <p>${scenarioDate(sim)}</p>
        <small>${pensionTrust}. Only benefits supported by the required pension inputs are included.</small>
      </article>
    </div>` : '';

  $('headline').innerHTML = `
    ${pensionComparison}
    <div class="stat-row">
      <div class="stat"><b>${eur(sim.fi.number)}</b><span>${sim.fi.bridging
        ? 'needed when you stop' : `FI number at ${pct1(sim.assumptions.swr)}`} ${infoBtn('stat-number')}</span></div>
      <div class="stat ${reachable ? '' : 'stat-warn'}">${reachable
        ? (t.agesAtFi.length > 1
            ? `<b>${Math.round(t.fiYear)}</b><span>FI year · ${t.agesAtFi.map((a) => `${escapeHtml(a.name)} ${a.age.toFixed(0)}`).join(', ')}</span><span class="stat-sub">${countdown(t.yearsToFi)} to go</span>`
            : `<b>${t.fiAge.toFixed(0)}</b><span>age at FI · ${Math.round(t.fiYear)}</span><span class="stat-sub">${countdown(t.yearsToFi)} to go</span>`)
        : `<b>—</b><span>${onTrack ? 'not reached' : marginal ? 'break-even' : 'spending exceeds income'}</span>`}</div>
      <div class="stat"><b>${pct(sim.savings.rateAfterMove)}</b><span>savings rate ${infoBtn('stat-rate')}</span></div>
      <div class="stat ${onTrack || marginal ? '' : 'stat-warn'}"><b>${eur(sim.savings.surplusAfterMove)}</b><span>${onTrack ? 'saved per year' : 'short each year'}</span></div>
    </div>

    <p class="hint" id="fiEstimateHint">FI timing is an estimate under your assumptions, not a
      market forecast. Displayed years and ages are rounded summaries, not instructions to retire
      at the start of that year. The search checks quarterly dates and major events; narrow
      feasible windows can be missed. A funded result is not proof of the earliest possible date.</p>

    ${onTrack ? '' : marginal
      ? `<p class="alert alert-soft">Income and spending are within ${pct(gapShare)} of each other —
         ${eur(-sim.savings.surplusAfterMove)} a year short. Essentially break-even, so nothing is
         being invested yet. The projection still includes existing assets and any actual
         shortfall; it does not assume extra income.</p>`
      : `<p class="alert">Spending is ${eur(-sim.savings.surplusAfterMove)} a year more than income
         ${sim.income.householdNetIncome > 0 ? `— ${pct(gapShare)} of it` : '(no current income)'}. Existing cash and investments must fund the gap.
         ${reachable ? 'The modeled assets still support the displayed FI date.' : 'No funded FI date was found within the planning horizon.'}
         The projection does not assume that the gap is closed.</p>`}

    ${infoNote('stat-number', `${sim.fi.bridging
      ? `What the portfolio has to be worth on your last working day. It is <em>not</em> spending
         divided by the withdrawal rate — it is allowed to run down, because the pension takes over
         partway through.`
      : `The recurring baseline implies a ${pct1(sim.assumptions.swr)} capital floor. Mortgage,
         dependent and health costs are then walked on their dated schedules; they are not blindly
         added as lump sums. The result is a planning heuristic, not a survival guarantee.`}`)}
    ${infoNote('stat-rate', `The share of net household income left over after everything — living
      costs, Pillar III net of its refund, and any insurance premiums. It is measured against
      <strong>net</strong> pay, not gross, so it is not comparable to figures quoted elsewhere that
      use gross. This single number moves the FI date more than the return assumption does.`)}

    <h3>The plan</h3>
    <table class="mini">
      <tr class="thead"><th>Every year, once you stop</th><td></td></tr>
      <tr><th>Protected emergency cash after FIRE <span class="muted">included in the total target, unavailable for ordinary spending</span></th><td>${eur(sim.fi.retirementCashReserve)}</td></tr>
      <tr><th>Unprotected portion of the FIRE target <span class="muted">total target minus protected cash; also funds withdrawal tax</span></th><td>${eur(Math.max(0, sim.fi.number - sim.fi.retirementCashReserve))}</td></tr>
      <tr><th>Spending the plan must cover, permanently ${infoBtn('perp-spend')}${sim.fi.spendingGrowth ? ` <span class="muted">rising ${pct1(sim.fi.spendingGrowth)}/yr in real terms</span>` : ''}</th><td>${eur(sim.fi.perpetualSpending)}/yr</td></tr>
      ${infoRow('perp-spend', `The recurring baseline after dated liabilities have ended: the
        mortgage paid off and dependent costs ended. Health premiums remain in this baseline
        unless a continuing coverage route is confirmed. Dated costs remain in the cash-flow
        schedule until their entered end.
        <br><br><strong>On inflation.</strong> This is in <em>today's money</em>, like every figure
        here. It does not need inflating, because the return you set is already net of inflation —
        the two cancel. So a flat figure means spending that keeps pace with prices exactly, buying
        the same basket every year.${cashNote(sim.fi.perpetualSpending)}
        ${sim.fi.spendingGrowth
          ? ` On top of that you have set spending to grow ${pct1(sim.fi.spendingGrowth)} a year
             <em>above</em> inflation, so it buys progressively more than this basket.`
          : ` The one thing that would make it rise in real terms is <em>Spending growth</em>,
             currently 0% — that is the cost of the same life outrunning the general index.`}`)}
      ${sim.spending.healthYears > 0.5 ? `
      <tr><th>Health-cover budget ${infoBtn('health')} <span class="muted">${sim.spending.healthYears.toFixed(0)} years within the horizon${sim.spending.ongoingHealthAnnual ? '; no confirmed end for some premiums' : ''}</span></th><td>${eur(sim.spending.healthAtFi)}/yr initially · ${eur(sim.spending.healthBridgeCost)} within-horizon funding</td></tr>
      ${infoRow('health', `Pension-based coverage depends on receiving a state pension, not simply
        reaching an estimated age. The planner budgets ${eur(RATES.healthInsurance.voluntaryMonthly)}/month
        per uncovered person until the entered confirmed coverage date. With no date it continues
        through the horizon and remains in the perpetual target. Pension income policy and trust
        do not change health eligibility. Confirm the route with Tervisekassa; co-payments and
        other medical costs are still part of your spending budget.`)}` : ''}
      ${sim.fi.countsPension ? `
      <tr><th>Recurring pension income once it all unlocks ${infoBtn('pens-income')}</th><td>${eur(sim.fi.pensionIncomeAtUnlock)}/yr</td></tr>
      ${infoRow('pens-income', `What the pillars pay once every one of them has started: the pots
        using the entered official fund-pension duration${sim.fi.policy === 'all' ? ', plus the state pension' : ''}. Lump sums are capital transfers, not recurring income, and are listed separately below.
        Pillar II generally opens five years before state pension; Pillar III follows its own
        first-contribution and five-year holding rules. Contributions stop the day you stop working, so this already
        reflects the shorter career the plan implies.`)}
      <tr class="thead"><th>The bar to clear</th><td></td></tr>
      <tr><th>Needed on the day you stop ${infoBtn('stop-number')}</th><td>${eur(sim.fi.number)}</td></tr>
      ${infoRow('stop-number', `Not spending divided by the withdrawal rate — that would be the
        capital-floor target. This is what the portfolio has to be worth on your last working day for the
        money to <strong>last</strong>, given that the pension takes over partway through. It is
        smaller precisely because it is allowed to run down.
        <br><br>Stated in <em>today's money</em>, so it is comparable with the balances you hold
        now.${cashNote(sim.fi.number)} You do not have to save that larger number: the portfolio is
        growing in the same euros, which is exactly what the real return already accounts for.`)}` : ''}
      <tr class="thead"><th>What you hold now</th><td></td></tr>
      <tr><th>Portfolio counted today ${infoBtn('counted')}</th><td>${eur(sim.portfolio.start)}</td></tr>
      ${infoRow('counted', `Cash, declared investment accounts and ordinary brokerage accounts${state.excludeCrypto ? '' : ' plus crypto'} —
        investment accounts are shown before future withdrawal tax; brokerage/crypto are net of their
        approximate opening tax reserves. The FI target preserves the projected asset mix and recorded
        contribution allowance when testing a smaller portfolio.${sim.house ? ` House cash is not removed today; it leaves on the entered completion date.` : ''} Pension balances are
        inaccessible today and appear separately at their legal draw dates.`)}
      ${sim.portfolio.investmentTaxReserve > 0 ? `<tr><th>Latent investment-account tax reserved</th><td>−${eur(sim.portfolio.investmentTaxReserve)}</td></tr>` : ''}
      ${sim.portfolio.investmentTaxBeforeFi > 0 ? `<tr><th>Investment-account tax reserved before FI (includes home funding)</th><td>${eur(sim.portfolio.investmentTaxBeforeFi)}</td></tr>` : ''}
      ${sim.portfolio.brokerageTaxReserve > 0 ? `<tr><th>Latent brokerage gains tax reserved</th><td>−${eur(sim.portfolio.brokerageTaxReserve)}</td></tr>` : ''}
      ${sim.portfolio.cryptoTaxReserve > 0 ? `<tr><th>Latent crypto gains tax reserved</th><td>−${eur(sim.portfolio.cryptoTaxReserve)}</td></tr>` : ''}
      ${sim.portfolio.cryptoExcluded > 0 ? `
      <tr><th>Crypto — left out of the plan ${infoBtn('excluded')}</th><td>${eur(sim.portfolio.cryptoExcluded)}</td></tr>
      ${infoRow('excluded', `Held out of the target by choice, because a plan resting on it is a
        bet rather than a plan — the balance in five years is unknowable in a way a bond fund's is
        not. It is shown so the total is visible, and unticking <em>Exclude crypto</em> under
        Circumstances will count it as spendable, which will move the FI date a long way.
        <br><br>Pension balances are not listed here at all: they have their own section below,
        where the question is what income they produce rather than what they are worth today.`)}` : ''}
      ${t.coastToPensionUnlock ? `<tr class="thead"><th>Milestone on the way</th><td></td></tr>
      <tr><th>CoastFIRE ${infoBtn('coast')}</th><td>age ${t.coastToPensionUnlock.age.toFixed(0)}</td></tr>
      ${infoRow('coast', `The age from which you could stop <em>adding</em> to the portfolio and
        still fund retirement at pension access. Configured earnings and pension contributions
        continue; positive savings no longer enter the accessible portfolio, but any spending
        deficit still comes out of it. A pay cut or career break needs a separate scenario.
        This milestone is searched in three-month steps.`)}` : ''}
      ${sim.savings.pillar3NetCost || sim.savings.lifeInsuranceCost || sim.savings.healthInsuranceCost ? `
      <tr class="thead"><th>Out of income before investing</th><td></td></tr>
      ${sim.savings.pillar3NetCost ? `<tr><th>Into Pillar III <span class="muted">net of refund</span></th><td>−${eur(sim.savings.pillar3NetCost)}/yr</td></tr>` : ''}
      ${sim.savings.lifeInsuranceCost ? `<tr><th>Life cover <span class="muted">protection, not savings</span></th><td>−${eur(sim.savings.lifeInsuranceCost)}/yr</td></tr>` : ''}
      ${sim.savings.healthInsuranceCost ? `<tr><th>Health contracts <span class="muted">only until FI; the ${eur(sim.spending.healthAtFi)}/yr above covers everyone after that</span></th><td>−${eur(sim.savings.healthInsuranceCost)}/yr</td></tr>` : ''}` : ''}
      ${sim.house ? `
      <tr class="thead"><th>Buying the home <span class="muted">${eur(state.household.property.purchase.price)}, in ${state.household.property.purchase.monthsAway} months</span></th><td></td></tr>
      <tr><th>Mortgage ${infoBtn('ltv')}</th><td>${eur(sim.house.loan)} · ${eur(sim.house.monthly)}/mo · LTV ${pct(sim.house.ltv)}</td></tr>
      ${infoRow('ltv', `LTV is loan-to-value: what you borrow as a share of the price. The Bank of
        Estonia caps it at ${pct(RATES.mortgage.maxLtv)} — ${pct(RATES.mortgage.maxLtvWithKredEx)}
        with a KredEx guarantee — so the deposit has to cover at least the rest, on top of the
        transaction costs.`)}
      <tr><th>Affordability (stressed) ${infoBtn('dsti')}</th><td>DSTI ${pct(sim.house.dsti)} of a ${pct(RATES.mortgage.maxDsti)} limit</td></tr>
      ${infoRow('dsti', `DSTI is debt service to income: the monthly payment as a share of net
        monthly income, including the other loans and leases entered above. The regulatory baseline is
        ${pct(RATES.mortgage.maxDsti)}, tested
        at ${pct(RATES.mortgage.stressRate)} rather than the rate you are actually offered — so this
        figure is deliberately worse than your real payment. Banks have a limited exception quota,
        so this is a baseline rather than an approval promise.`)}
      ${sim.house.fundingShortfall > 0 ? `<tr class="bad"><th>Funding shortfall at completion</th><td><strong>${eur(sim.house.fundingShortfall)}</strong></td></tr>` : ''}
      <tr><th>Projected accessible funds at completion</th><td>${eur(sim.house.fundsAtCompletion)}</td></tr>
      <tr><th>Cash needed on completion day ${infoBtn('complete')}</th><td><strong>${eur(sim.house.totalReserve)}</strong></td></tr>
      <tr class="breakdown"><th>Deposit</th><td>${eur(sim.house.deposit)}</td></tr>
      <tr class="breakdown"><th>Notary, state fee, valuation, bank <span class="muted">${pct(sim.house.transactionCostRate)} of the price</span></th><td>${eur(sim.house.transactionCosts)}</td></tr>
      ${sim.house.movingCosts ? `<tr class="breakdown"><th>Moving &amp; furnishing</th><td>${eur(sim.house.movingCosts)}</td></tr>` : ''}
      <tr class="breakdown"><th>Emergency fund <span class="muted">${sim.house.emergencyFundMonths} months of spending after the move</span></th><td>${eur(sim.house.emergencyFund)}</td></tr>
      ${infoRow('complete', `Deposit, plus ${pct(DEFAULTS.transactionCostRate)} of the price in
        notary, state fee, valuation and bank charges, plus moving and furnishing — and on top of
        all that an emergency fund of ${DEFAULTS.emergencyFundMonths} months' spending, because
        completing with nothing left is how a good purchase becomes a bad one.`)}` : ''}
</table>

    ${sim.portfolio.pensionAtUnlock > 1 ? `
    ${(() => {
      const f = sim.fi;
      const yp = f.yearsPerpetual, yb = f.yearsBridged;
      if (!Number.isFinite(yp) && !Number.isFinite(yb)) return '';
      const yrs = (y) => Number.isFinite(y) ? y.toFixed(1) + ' years' : 'never';
      const saved = Number.isFinite(yp) && Number.isFinite(yb) ? yp - yb : null;
      return `
    ${sim.fi.resilience ? `
    <h3>How much shock this absorbs ${infoBtn('resilience')}</h3>
    ${infoNote('resilience', `Not a forecast, and deliberately not built on historical returns —
      no data series, no overlapping windows, no American history borrowed for a European
      portfolio. Just arithmetic: <em>how bad an opening can this plan take before the money runs
      out anyway?</em> Spending and the modeled state pension stay unchanged. Accessible investments
      and Pillar II/III funds share the same shock: fund payments and future lump sums are recalculated.
      Cash retains its configured return. This assumes the same market exposure for all modeled
      investments, not each fund's actual allocation. The first stressed year may be partial.
      <br><br><strong>An estimate, not a guaranteed retirement date.</strong> The search checks
      quarterly dates and major events, then refines a funded interval. It can miss narrow
      windows; it does not prove the globally earliest date or a four-month error bound.
      An unbuffered plan may have little margin, but that depends on its cash flows.
      Try <em>Work on past the FI date</em> under Assumptions to compare a later plan;
      that date is checked again for funding. Extra work can build margin when it adds savings,
      but its benefit is not fixed. Opening losses matter, and later losses can matter too.`)}
    <table class="mini">
      <tr><th>Years of zero investment real return it survives <span class="muted">right at the start</span></th><td><strong>${sim.fi.resilience.flatAll ? 'the whole plan' : sim.fi.resilience.flatYears}</strong></td></tr>
      <tr><th>Years of −10% investment return it survives</th><td><strong>${sim.fi.resilience.bearAll ? 'the whole plan' : sim.fi.resilience.bearYears}</strong></td></tr>
      <tr><th>Single investment crash on day one it recovers from</th><td><strong>${pct(sim.fi.resilience.crash)}</strong></td></tr>
      ${sim.fi.bufferYears ? `<tr><th>With additional work <span class="muted">past the estimated FI year of ${(sim.currentYear + sim.fi.yearsSolved).toFixed(0)}</span></th><td>${sim.fi.bufferYears} ${sim.fi.bufferYears === 1 ? 'year' : 'years'} · ${eur(sim.fi.atFiDate - (sim.fi.number))} above the bar</td></tr>` : ''}
    </table>
    <p class="hint">${sim.fi.resilience.flatYears === 0 && !sim.fi.bufferYears
      ? `<strong>No full opening year of zero real investment return passed this test.</strong>
         This does not mean every smaller shock would fail. Compare additional work, lower spending
         or different return assumptions, then review the recalculated funding and stress results.
         These are deterministic scenarios, not probabilities of success.`
      : `The rows test different shocks: a period of reduced returns versus a one-off loss.
         Their results need not improve proportionally when you change the retirement date.
         <br><br>These shocks apply to accessible investments and pension funds until withdrawal.
         Cash keeps its configured return; the modeled state pension is unchanged. The protected reserve is not
         available for ordinary withdrawals, even in these scenarios. Results are deterministic
         scenarios, not probabilities of success.`}</p>` : ''}

    ${sim.fi.haircutBuffer != null ? `
    <h3>What the caution buys ${infoBtn('buffer')}</h3>
    ${infoNote('buffer', `Believing a pension at less than 100% does not put money aside anywhere
      special — it forces the <em>portfolio</em> to be bigger, and that extra is the margin. The
      figure below replays this exact plan with the pensions paying in full, and shows what would
      be left at ${sim.assumptions.planToAge}. It is what the caution costs if it turns out to have
      been unnecessary, and what protects you if it was not.`)}
    <table class="mini">
      <tr><th>Counting Pillars II &amp; III at</th><td>${pct(sim.fi.potsShare)}${sim.fi.policy === 'all' ? `, the state pension at ${pct(sim.fi.stateShare)}` : ''}</td></tr>
      <tr><th>Left at ${sim.assumptions.planToAge} if they pay in full</th><td><strong>${eur(sim.fi.haircutBuffer)}</strong></td></tr>
    </table>` : ''}

    <h3>What the portfolio has to do ${infoBtn('two-ways')}</h3>
    ${infoNote('two-ways', `Two answers for the <em>same</em> pension settings — this compares only
      the job the portfolio is given, nothing else. Whether pensions count, and how much of them,
      is a separate question set just below it; changing that moves both rows together. The
      highlighted row is the one in force.`)}
    <table class="mini">
      <tr class="${f.bridging ? '' : 'here'}"><th>Maintain the withdrawal-rate capital floor ${infoBtn('perpetual')}</th><td>${yrs(yp)}</td></tr>
      ${infoRow('perpetual', `A planning heuristic: the portfolio must remain above the capital
        floor implied by the selected ${pct1(sim.assumptions.swr)} withdrawal rate through the
        modeled horizon. It is <strong>not</strong> a guarantee of lasting forever. Actual success
        depends on return sequence, fees, taxes and future spending; use historical or stochastic
        analysis before relying on it.`)}
      <tr class="${f.bridging ? 'here' : ''}"><th>Last until ${sim.assumptions.planToAge}, spent down to nothing ${infoBtn('bridged')}</th><td>${yrs(yb)}</td></tr>
      ${infoRow('bridged', `The portfolio carries you from the day you stop until the pillars
        unlock, and after that tops up whatever the pension does not cover — so it is deliberately
        <strong>spent down</strong> rather than held intact. It has to last to age
        ${sim.assumptions.planToAge}, not forever, which is a much smaller job even before any
        pension is counted. Fewer years of work; but the money is drawn on from day one, so a bad
        first decade cannot be made up.
        ${f.potsShare < 1 || f.stateShare < 1
          ? `<br><br>Pension income here is haircut to ${pct(f.potsShare)}${f.policy === 'all' ? ` of the pots and ${pct(f.stateShare)} of the state pension` : ''}, so the portfolio is carrying more of the load than the pillars would in full.`
          : ''}`)}
    </table>
    <p class="hint">${saved != null && saved > 0.1
      ? `Allowing the money to run out by ${sim.assumptions.planToAge} brings the date forward by
         <strong>${saved.toFixed(1)} years</strong>. What you give up is the margin: a portfolio
         required to maintain the selected capital floor leaves more modeled margin, while one spent
         to zero on schedule has no terminal reserve. Neither result predicts a real bad decade.
         ${f.policy === 'ignore'
           ? ' Neither row counts any pension — that is set separately below.'
           : ` Both rows count the same pension income, ${f.potsShare < 1 || f.stateShare < 1
               ? `haircut to ${pct(f.potsShare)}${f.policy === 'all' ? `/${pct(f.stateShare)}` : ''}` : 'in full'}.`}`
      : `The two requirements come out at about the same date here, so the choice between them
         costs little either way.`}</p>`;
    })()}

    <h3>Pensions — ${sim.fi.countsPension ? 'what takes over' : 'not counted in the plan'} ${infoBtn('draw-age')}</h3>
    ${infoNote('draw-age', `${sim.fi.pillarDrawAge === 'statePension'
      ? `You have chosen to leave both pots invested until at least <strong>state pension age</strong>
         rather than taking each at its first legal opportunity. They keep
         compounding in the meantime, so the pot is larger when it does start and everything —
         pots, state pension and free health cover — begins together. The price is a longer stretch
         on the portfolio alone. Payments depend on the projected fund balance and entered duration.`
      : `Pillar II is drawn at state pension age minus five. Pillar III is drawn at its separately
         calculated legal date, which depends on the first contribution and holding period. Leaving either invested until state pension age grows the pot and
         starts everything at once — set <em>Start drawing Pillars II &amp; III</em> under
         Assumptions to compare.`}`)}
    <table class="mini">
      ${sim.portfolio.perPerson.filter((p) => p.pensionNow > 0 || p.pensionAtUnlock > 1).map((p) => `
        <tr><th>${escapeHtml(p.name)} <span class="muted">${p.deferred
          ? `unlocks ${Math.round(p.unlockYear)} at ${p.unlockAge.toFixed(0)}, taken ${Math.round(p.drawYear)} at ${p.drawAge.toFixed(0)}`
          : `unlocks ${Math.round(p.unlockYear)}, age ${p.unlockAge.toFixed(0)}`}${!p.pensionAgeConfirmed && p.pensionAgeRange
            ? ` — unconfirmed scenario; official state-pension age range ${p.pensionAgeRange.min.toFixed(1)}–${p.pensionAgeRange.max.toFixed(1)}` : ''}${!p.pillar3EligibilityKnown
            ? ' — Pillar III excluded: first-contribution year missing' : p.pillar3DrawYear != null && p.pillar3DrawYear !== p.pillar2DrawYear
              ? ` — Pillar II starts ${Math.round(p.pillar2DrawYear)}, Pillar III ${Math.round(p.pillar3DrawYear)}` : ''}</span></th>
        <td>${eur(p.pensionNow)} today → <strong>${eur(p.pensionAtUnlock)}</strong>${sim.fi.countsPension && sim.fi.pillarPayout === 'fundPension'
          ? ` · ${eur(p.pensionIncome)}/yr${Number.isFinite(p.incomeEndAge) ? ` until ${Math.floor(p.incomeEndYear)}` : ''}` : ''}</td></tr>`).join('')}
      ${sim.fi.countsPots ? sim.persons.filter((p) => p.pensionIncome > 1).map((p) => `
        <tr><th>${escapeHtml(p.name)}: what that is worth by the end ${infoBtn('erosion')} <span class="muted">payments follow the fund's returns</span></th>
        <td><strong>${eur(p.pensionIncomeFinal / 12)}</strong>/mo <span class="muted">vs ${eur(p.pensionIncome / 12)} at the start</span></td></tr>`).join('') : ''}
      ${sim.fi.countsPots && sim.fi.pillarPayout === 'lumpSum' ? sim.fi.lumpSums.map((e) => `<tr><th>${escapeHtml(sim.persons[e.owner].name)}: ${e.kind === 'pillar2' ? 'Pillar II' : 'Pillar III'} lump sum <span class="muted">${e.date.toFixed(1)}</span></th><td>${eur(e.gross)} gross − ${eur(e.tax)} tax = ${eur(e.net)} net; <strong>${eur(e.credited)} counted</strong></td></tr>`).join('') : ''}
      ${sim.fi.countsPots && sim.fi.pillarPayout === 'fundPension' ? `
      <tr><th>Taken as ${infoBtn('payout')}</th><td><strong>a fund pension</strong> · 0% tax · ${sim.persons[0].payoutYears ?? 'official duration not supplied'} years</td></tr>
      ${sim.persons.some((p) => !p.pensionTermsKnown) ? `<tr class="bad"><th>Pension income excluded</th><td>Enter the Pensionikeskus duration for each person</td></tr>` : ''}
      ${sim.fi.pillarPayout === 'fundPension' && sim.fi.countsPots && sim.persons.every((p) => p.payoutYears != null) ? (() => {
        const last = sim.persons.reduce((a, b) => (b.pillarIncomeEndYear > a.pillarIncomeEndYear ? b : a));
        const years = sim.assumptions.planToAge - last.pillarIncomeEndAge;
        return `<tr><th>Portfolio carries it again <span class="muted">once ${escapeHtml(last.name)}'s pot runs dry</span></th>
          <td>from ${Math.floor(last.pillarIncomeEndYear)} · ${years.toFixed(0)} years${sim.fi.countsState ? ', with the state pension' : ' alone'}</td></tr>`;
      })() : ''}
      ${infoNote('erosion', `Fund payments follow the market value of the units redeemed. Returns can increase or decrease payments; there is no guaranteed income floor.`)}
      ${infoRow('payout', `A <em>fondipension</em> is paid out of your own pension fund with no insurer involved,
           and is taxed at <strong>0%</strong> so long as it is paced over the statutory recommended
           duration — remaining life expectancy at the age you start. The entered official result is
           ${sim.persons[0].payoutYears?.toFixed(0) ?? 'not supplied'} years. Paced faster it is taxed at
           ${pct(RATES.pillar2.payout.lumpSum)}. Statistics Estonia publishes that figure by age
           <em>and sex</em>, and the gap is wide: at ${RATES.pillar2.payoutYearsAtAge} it is about
           16 years for men and 21 for women. Pensionikeskus's calculator gives the figure that
           actually applies; the simulator no longer invents it.
           <br><br>Its weakness is the thing the row above prices: it <strong>stops</strong>. From
           age ${sim.fi.pillarIncomeEndsAge.toFixed(0)} the pots pay nothing and the portfolio has
           to carry the household again for the last
           ${(sim.assumptions.planToAge - sim.fi.pillarIncomeEndsAge).toFixed(0)} years. Its
           strength is that it depends on nobody: no insurance contract, no company that might stop
           selling one.
        <br><br>This applies to Pillars II and III. The state pension is different: it <em>is</em> taxable,
        so it is shown net of income tax after the larger
        ${eur(12 * RATES.basicExemptionPensionAge)} pension-age exemption.`)}` : ''}
      ${sim.fi.policy === 'all' ? sim.persons.map((p) => `
        <tr><th>${escapeHtml(p.name)}: state pension <span class="muted">from ${Math.round(p.statePensionYear)}, ${p.yearsWorkedAtFi == null ? 'service years not supplied — income excluded' : `after ${p.yearsWorkedAtFi.toFixed(0)} Estonian service years`}, net of tax${p.statePensionEarlyYears ? `, drawn ${p.statePensionEarlyYears} ${p.statePensionEarlyYears === 1 ? 'year' : 'years'} early using the 2026 average forecast reduction of ${pct(-p.statePensionAdjustment)} for life` : ''}</span></th>
        <td><strong>${eur(p.statePensionIncome / 12)}</strong>/mo${p.statePensionIfWorkedOn - p.statePensionIncome > 12
          ? ` <span class="muted">vs ${eur(p.statePensionIfWorkedOn / 12)} working to ${p.pension.statePensionAge.toFixed(0)}</span>` : ''}</td></tr>`).join('') : ''}
    </table>
    <p class="hint">${sim.fi.countsPension
      ? `Individual by law and locked until each person's own unlock date, and projected at the same
         real return as the rest of the plan — including Pillar II contributions, yours plus the
         state's ${pct(RATES.pillar2.stateRate)}, until the day work stops. How the pots are taken
         is set under Assumptions and explained above.`
      : `Individual by law and locked until each person's own unlock date, so none of
         it counts toward the target above. Projected at the same real return, including Pillar II
         contributions (yours plus the state's 4%) until FI.`}</p>` : ''}

    ${sim.fi.ownershipAtFi.length > 1 && reachable ? `
    <h3>Who owns what at FI ${infoBtn('ownership')}</h3>
    ${infoNote('ownership', `One household, one FI date — but the money has owners. This splits the
      portfolio by the share set above, which governs <em>future</em> savings only: existing
      balances stay with whoever holds them. It matters for anything decided per person rather than
      per household, and it is deliberately not a separation model.`)}
    <table class="mini">
      ${sim.fi.ownershipAtFi.map((o) => `<tr><th>${escapeHtml(o.name)} <span class="muted">age ${o.ageAtFi.toFixed(0)}</span></th><td>${pct(o.share)} of new savings${o.portfolio == null ? '' : ` → ${eur(o.portfolio)}`}</td></tr>`).join('')}
    </table>
    <p class="hint">The split governs <em>future savings</em>. Existing assets stay with whoever
      holds them and keep compounding there, so the balances will not match the slider unless the
      starting amounts already do — move them between the two people above if you want that.</p>` : ''}
  `;

  // Echo the computed payment next to the inputs so it can be checked against
  // a bank quote without scrolling to the results.
  const echo = $('mortgageEcho');
  if (sim.house) {
    const p = state.household.property.purchase;
    echo.hidden = false;
    echo.innerHTML =
      `Repayment works out at <strong>${eur(sim.house.monthly)}/month</strong> ` +
      `on ${eur(sim.house.loan)} over ${p.termYears} years at ${pct1(p.rate)} — ` +
      `${eur(sim.house.stressedMonthly)} at the ${pct(RATES.mortgage.stressRate)} stress rate. ` +
      `Assumes a standard annuity schedule, and excludes home insurance, which Estonian ` +
      `lenders require.`;
  } else {
    echo.hidden = true;
  }

  $('chart').innerHTML = chart(sim);

  $('plan').innerHTML = `<h3>What to do</h3>` + (plan.length
    ? plan.map((f) => {
        const g = GUIDE[f.link];
        return `
        <article class="finding ${f.severity}">
          <header><h4>${escapeHtml(f.title)}</h4><span class="val">${escapeHtml(f.value)}</span></header>
          <p>${f.detail}${g ? ` <a class="more" href="${g[0]}">${g[1]} →</a>` : ''}</p>
        </article>`;
      }).join('')
    : `<p class="empty">Nothing flagged.</p>`);
}

// -------------------------------------------------------------------- events

function onChange() { formToState(); save(); render(); }

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.i !== undefined && el.dataset.k) {
    const p = state.persons[+el.dataset.i];
    const raw = el.type === 'checkbox' ? el.checked
      : el.type === 'number' ? (el.value === '' ? null : +el.value)
      : el.value;
    setDeep(p, el.dataset.k, raw);
    if (el.dataset.k === 'name') updatePersonLabels();
    if (['lifeInsurance', 'healthInsurance', 'healthCoveredAfterFi'].includes(el.dataset.k)) renderPeople();
    save(); render();
    return;
  }
  if (el.id === 'alloc') {
    const s = +el.value / 100;
    state.persons[0].allocationShare = s;
    state.persons[1].allocationShare = 1 - s;
    $('allocOut').textContent =
      `${el.value}% ${state.persons[0].name} / ${100 - +el.value}% ${state.persons[1].name}`;
    save(); render();
    return;
  }
  onChange();
});

document.addEventListener('change', async (e) => {
  if (e.target.id === 'buying') { $('houseFields').hidden = !e.target.checked; onChange(); }
  if (e.target.id === 'importFile') {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsed = sanitise(JSON.parse(await file.text()));
      if (!parsed) throw new Error('not a simulator file');
      state = parsed;
      save(); stateToForm(); render();
      flash(`Loaded ${file.name} — ${parsed.persons.length} ` +
            `${parsed.persons.length === 1 ? 'person' : 'people'}.`);
    } catch (err) {
      flash(`Could not read ${file.name}: ${err.message}`, false);
    } finally {
      // Reset so selecting the same file again still fires a change event.
      e.target.value = '';
    }
  }
});

function flash(msg, ok = true) {
  const el = $('status');
  el.textContent = msg;
  el.className = 'status ' + (ok ? 'ok' : 'bad');
  el.hidden = false;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { el.hidden = true; }, 4000);
}

bindExplain(() => render());

document.addEventListener('click', (e) => {
  if (e.target.id === 'import') $('importFile').click();
  if (e.target.id === 'addPerson') {
    // The model, the allocation slider and the ownership table are all built
    // for one or two people. Hiding the button is not enough - guard the action.
    if (state.persons.length >= MAX_PERSONS) return;
    state.persons.push(blankPerson('Partner'));
    state.persons[0].allocationShare = 0.5;
    state.persons[1].allocationShare = 0.5;
    save(); renderPeople(); render();
  }
  if (e.target.classList.contains('rm')) {
    state.persons.splice(+e.target.dataset.i, 1);
    state.persons[0].allocationShare = 1;
    save(); renderPeople(); render();
  }
  if (e.target.id === 'reset') {
    if (confirm('Clear every field and start from an empty form?')) {
      state = blankState(); save(); stateToForm(); render();
      flash('Cleared. Every field is now empty.');
    }
  }
  if (e.target.id === 'example') {
    if (!confirm('Replace what is here with an example household?')) return;
    state = exampleState(); save(); stateToForm(); render();
    flash('Loaded an example household — edit any field to make it yours.');
  }
  if (e.target.id === 'shareClose') $('shareBox').hidden = true;
  if (e.target.id === 'share') {
    const url = location.origin === 'null'
      ? location.href.split('#')[0] + '#' + HASH_KEY + encodeState(state)
      : location.origin + location.pathname + '#' + HASH_KEY + encodeState(state);
    $('shareBox').hidden = false;
    $('shareUrl').value = url;
    $('shareUrl').select();
    navigator.clipboard?.writeText(url).then(
      () => flash('Link copied — it carries your figures, so share it carefully.'),
      () => flash('Link ready below — select and copy it.'));
  }
  if (e.target.id === 'export') {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'estonian-fire-plan.json';
    a.click();
    URL.revokeObjectURL(a.href);
    flash('Exported estonian-fire-plan.json');
  }
});

/** Adopt a plan that arrived in the URL, then clear it from the address bar. */
function adoptShared(next, announce) {
  state = next;
  save();                                    // persist before dropping the hash
  history.replaceState(null, '', location.pathname + location.search);
  stateToForm();
  render();
  if (announce) flash('Loaded a shared plan from the link.');
}

stateToForm();
render();
if (shared) adoptShared(shared, true);
else if (sharedError) flash(sharedError, false);

// A link pasted into an already-open tab changes only the fragment, which does
// not reload the page - so listen for it explicitly.
addEventListener('hashchange', () => {
  try {
    const next = fromHash();
    if (next) adoptShared(next, true);
  } catch (e) { flash(e.message, false); }
});
