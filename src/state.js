// The saved plan: its shape, its defaults, and how it survives a round trip
// through localStorage, an exported file, or a share link.
//
// Split out of ui.js so it can be tested without a DOM. Everything here is pure
// and browser-independent - `btoa`/`atob` and `TextEncoder` exist in Node too.
//
// This is the trust boundary. Anything arriving from a URL fragment or a file
// the user picked is hostile until `sanitise` has been through it: the engine
// assumes numbers are numbers, and a share link is just a string someone can
// edit.

import { RATES, DEFAULTS } from './rates.js';

export const MAX_PERSONS = 2;
export const STORAGE_KEY = 'estonian-fire-simulator/v1';
export const HASH_KEY = 'd=';
export const VERSION = 2;

export const blankPerson = (name) => ({
  name, birthYear: 1990,
  income: { grossMonthly: 0, netMonthly: null, otherNetMonthly: 0 },
  assets: {
    cash: 0, investmentAccount: 0, investmentAccountContributions: 0,
    brokerage: 0, brokerageCostBasis: 0,
    pillar2: 0, pillar3: 0, crypto: 0, cryptoCostBasis: 0,
  },
  pillar3Annual: 0, allocationShare: 1,
  pillar1Units: null,
  yearsWorkedEstonia: null,
  yearsWorkedEuEea: 0,
  nationalPensionEligible: false,
  pillar3FirstContributionYear: null,
  annuityMonthlyQuote: null,
  fundPensionYears: null,
  lifeInsurance: false, lifeInsuranceMonthly: 0,
  healthInsurance: false, healthInsuranceMonthly: RATES.healthInsurance.voluntaryMonthly,
  healthCoveredAfterFi: false,
});

const baseState = (over = {}) => ({
  version: VERSION,
  excludeCrypto: true,
  household: {
    hasDependents: false,
    spending: { housing: 0, childCosts: 0, other: 0, buffer: 0 },
    rentalIncomeNetMonthly: 0,
    property: null,
  },
  persons: [blankPerson('You')],
  assumptions: {
    realReturn: DEFAULTS.realReturn,
    cashRealReturn: DEFAULTS.cashRealReturn,
    swr: DEFAULTS.swr,
    spendingGrowth: DEFAULTS.spendingGrowth,
    inflation: DEFAULTS.inflation,
    potsCountedShare: DEFAULTS.potsCountedShare,
    stateCountedShare: DEFAULTS.stateCountedShare,
    statePensionEarlyYears: DEFAULTS.statePensionEarlyYears,
    bufferYears: DEFAULTS.bufferYears,
    portfolioEnd: DEFAULTS.portfolioEnd,
    pensionPolicy: DEFAULTS.pensionPolicy,
    pillarDrawAge: DEFAULTS.pillarDrawAge,
    pillarPayout: DEFAULTS.pillarPayout,
    planToAge: DEFAULTS.planToAge,
  },
  ...over,
});

export const blankState = () => baseState();

/** A fictional Estonian example, so the tool can be seen working before any
 *  figures are entered. Values are synthetic and do not represent a person. */
export const exampleState = () => baseState({
  household: {
    hasDependents: true,
    spending: { housing: 600, childCosts: 180, other: 900, buffer: 120 },
    rentalIncomeNetMonthly: 0,
    property: null,
  },
  persons: [{
    ...blankPerson('You'),
    income: { grossMonthly: 3000, netMonthly: null, otherNetMonthly: 0 },
    assets: {
      cash: 10000, investmentAccount: 6000, investmentAccountContributions: 6000,
      brokerage: 0, brokerageCostBasis: 0,
      pillar2: 12000, pillar3: 0, crypto: 0, cryptoCostBasis: 0,
    },
  }],
});

// ------------------------------------------------------------- share links

// The payload rides in the URL fragment rather than a query string: fragments
// are never transmitted to the server, so a shared plan stays between the
// people holding the link even on hosted deployments.

export function encodeState(s) {
  const bytes = new TextEncoder().encode(JSON.stringify(s));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeState(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

// ---------------------------------------------------------------- sanitise

/** A finite number, or the fallback. Rejects null, NaN and Infinity alike - the
 *  engine multiplies these, and one bad value turns every derived figure into
 *  NaN with no clue where it came from.
 *
 *  A numeric *string* is accepted and converted: hand-edited files and older
 *  exports both contain them, and silently reading "500000" as zero would be a
 *  worse failure than refusing the file outright. */
const num = (v, fallback = 0) => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : fallback;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};
const bool = (v, fallback = false) => {
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1' || v === 'true') return true;
  if (v === 0 || v === '0' || v === 'false' || v == null) return false;
  return fallback;
};
const bounded = (v, lo, hi, fallback) => Math.min(hi, Math.max(lo, num(v, fallback)));

const NUMERIC_ASSETS = [
  'cash', 'investmentAccount', 'investmentAccountContributions',
  'brokerage', 'brokerageCostBasis',
  'pillar2', 'pillar3', 'crypto',
  'cryptoCostBasis',
];
const SPEND_KEYS = ['housing', 'childCosts', 'other', 'buffer'];
const POLICIES = ['ignore', 'ownPots', 'all'];
const PORTFOLIO_ENDS = ['perpetual', 'drawdown'];
const DRAW_AGES = ['unlock', 'statePension'];
const PAYOUTS = ['annuity', 'fundPension'];
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Accept only a shape the engine can actually handle.
 *
 * Returns null for anything unrecoverable, and a repaired object otherwise.
 * Mutates and returns the input, so callers should not keep the original.
 */
export function sanitise(s) {
  if (!isRecord(s)) return null;
  if (!Array.isArray(s.persons) || !s.persons.length) return null;
  if (!s.persons.every(isRecord) || !isRecord(s.household)) return null;

  if (s.persons.length > MAX_PERSONS) s.persons = s.persons.slice(0, MAX_PERSONS);
  const incomingVersion = num(s.version, 1);
  if (incomingVersion > VERSION) return null;
  s.version = VERSION;
  s.excludeCrypto = s.excludeCrypto === undefined ? true : bool(s.excludeCrypto);
  if (s.currentYear !== undefined) s.currentYear = bounded(s.currentYear, 1900, 2200, RATES.year);

  const h = s.household;
  h.hasDependents = bool(h.hasDependents);
  h.lifeInsurance = bool(h.lifeInsurance);
  h.spending = isRecord(h.spending) ? h.spending : {};
  for (const k of SPEND_KEYS) h.spending[k] = Math.max(0, num(h.spending[k]));
  h.spending.childCostsEndYear = h.spending.childCostsEndYear == null ? null
    : bounded(h.spending.childCostsEndYear, RATES.year, 2200, RATES.year + 18);
  h.rentalIncomeNetMonthly = num(h.rentalIncomeNetMonthly);

  const buy = h.property?.purchase;
  if (isRecord(buy)) {
    buy.price = Math.max(0, num(buy.price));
    buy.deposit = Math.max(0, num(buy.deposit));
    buy.deposit = Math.min(buy.deposit, buy.price);
    buy.termYears = bounded(buy.termYears, 1, RATES.mortgage.maxTermYears, RATES.mortgage.maxTermYears);
    buy.rate = bounded(buy.rate, 0, 1, 0.04);
    buy.runningCostsMonthly = Math.max(0, num(buy.runningCostsMonthly));
    buy.movingCosts = Math.max(0, num(buy.movingCosts));
    buy.monthsAway = Math.max(0, num(buy.monthsAway));
    buy.otherDebtMonthly = Math.max(0, num(buy.otherDebtMonthly));
    buy.collateralValue = Math.max(0, num(buy.collateralValue, buy.price));
    // Anything that is not a valid person index means "split it between them".
    if (typeof buy.paidBy !== 'number' || !s.persons[buy.paidBy]) buy.paidBy = 'proportional';
    h.property = { purchase: buy };
  } else {
    h.property = null;
  }

  s.persons.forEach((p, i) => {
    p.name = typeof p.name === 'string' && p.name.trim() ? p.name : (i ? 'Partner' : 'You');
    p.birthYear = bounded(p.birthYear, 1900, RATES.year, 1990);
    p.income = isRecord(p.income) ? p.income : {};
    p.income.grossMonthly = Math.max(0, num(p.income.grossMonthly));
    p.income.netMonthly = p.income.netMonthly == null ? null
      : Math.max(0, num(p.income.netMonthly));
    p.income.otherNetMonthly = num(p.income.otherNetMonthly);
    p.assets = isRecord(p.assets) ? p.assets : {};
    for (const k of NUMERIC_ASSETS) p.assets[k] = Math.max(0, num(p.assets[k]));
    p.assets.investmentAccountContributions = Math.min(
      p.assets.investmentAccount, p.assets.investmentAccountContributions);
    p.assets.cryptoCostBasis = Math.min(p.assets.crypto, p.assets.cryptoCostBasis);
    p.assets.brokerageCostBasis = Math.min(p.assets.brokerage, p.assets.brokerageCostBasis);
    p.assets.cryptoMicaEligible = bool(p.assets.cryptoMicaEligible);
    // Only the three statutory rates exist; anything else would be rejected by
    // the pension registry, so it cannot be modelled honestly.
    p.pillar2Rate = RATES.pillar2.employeeRates.includes(p.pillar2Rate)
      ? p.pillar2Rate : RATES.pillar2.employeeRates[0];
    p.pillar3Annual = Math.max(0, num(p.pillar3Annual));
    // A career-start age is too vague. Service years, unlike pension coefficient
    // units, are retained because they answer the statutory 15-year eligibility test.
    delete p.careerStartAge;
    // Accrued coefficient units, from the SKA portal. null means "not known".
    p.pillar1Units = p.pillar1Units == null ? null
      : Math.max(0, num(p.pillar1Units, 0));
    p.yearsWorkedEstonia = p.yearsWorkedEstonia == null ? null
      : bounded(p.yearsWorkedEstonia, 0, 80, 0);
    p.yearsWorkedEuEea = bounded(p.yearsWorkedEuEea, 0, 80, 0);
    p.nationalPensionEligible = bool(p.nationalPensionEligible);
    p.pillar3FirstContributionYear = p.pillar3FirstContributionYear == null ? null
      : bounded(p.pillar3FirstContributionYear, 1998, RATES.year, RATES.year);
    p.annuityMonthlyQuote = p.annuityMonthlyQuote == null ? null
      : Math.max(0, num(p.annuityMonthlyQuote));
    p.fundPensionYears = p.fundPensionYears == null ? null
      : bounded(p.fundPensionYears, 1, 60, 20);
    p.lifeInsurance = bool(p.lifeInsurance);
    p.lifeInsuranceMonthly = Math.max(0, num(p.lifeInsuranceMonthly));
    p.healthInsurance = bool(p.healthInsurance);
    p.healthCoveredAfterFi = bool(p.healthCoveredAfterFi);
    p.healthInsuranceMonthly = Math.max(0,
      num(p.healthInsuranceMonthly, RATES.healthInsurance.voluntaryMonthly));
    p.allocationShare = bounded(p.allocationShare, 0, 1, 1 / s.persons.length);
  });

  // Shares must be a partition, or the per-person figures stop adding up to the
  // household. A single person always owns all of it.
  if (s.persons.length === 1) {
    s.persons[0].allocationShare = 1;
  } else {
    const sum = s.persons.reduce((x, p) => x + p.allocationShare, 0);
    s.persons.forEach((p) => { p.allocationShare = sum > 0 ? p.allocationShare / sum : 0.5; });
  }

  const a = isRecord(s.assumptions) ? s.assumptions : {};
  a.realReturn = bounded(a.realReturn, 0, 0.20, DEFAULTS.realReturn);
  a.cashRealReturn = bounded(a.cashRealReturn, -0.20, 0.20, DEFAULTS.cashRealReturn);
  a.swr = bounded(a.swr, 0.005, 0.10, DEFAULTS.swr);
  a.spendingGrowth = bounded(a.spendingGrowth, 0, 0.05, DEFAULTS.spendingGrowth);
  a.inflation = bounded(a.inflation, 0, 0.15, DEFAULTS.inflation);
  a.potsCountedShare = bounded(a.potsCountedShare, 0, 1, DEFAULTS.potsCountedShare);
  a.stateCountedShare = bounded(a.stateCountedShare, 0, 1, DEFAULTS.stateCountedShare);
  a.statePensionEarlyYears = Math.round(
    bounded(a.statePensionEarlyYears, 0, 5, DEFAULTS.statePensionEarlyYears));
  a.bufferYears = bounded(a.bufferYears, 0, 10, DEFAULTS.bufferYears);
  a.pensionPolicy = POLICIES.includes(a.pensionPolicy) ? a.pensionPolicy : DEFAULTS.pensionPolicy;
  a.portfolioEnd = PORTFOLIO_ENDS.includes(a.portfolioEnd) ? a.portfolioEnd : DEFAULTS.portfolioEnd;
  a.pillarDrawAge = DRAW_AGES.includes(a.pillarDrawAge) ? a.pillarDrawAge : DEFAULTS.pillarDrawAge;
  a.pillarPayout = PAYOUTS.includes(a.pillarPayout) ? a.pillarPayout : DEFAULTS.pillarPayout;
  a.planToAge = bounded(a.planToAge, 75, 110, DEFAULTS.planToAge);
  a.emergencyFundMonths = bounded(a.emergencyFundMonths, 0, 36, DEFAULTS.emergencyFundMonths);
  a.transactionCostRate = bounded(a.transactionCostRate, 0, 0.20, DEFAULTS.transactionCostRate);
  s.assumptions = a;

  return s;
}
