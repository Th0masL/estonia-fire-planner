// Estonian FIRE Simulator - calculation engine.
//
// Pure functions only: no DOM, no storage, no side effects. Everything the site
// displays is derived here, so the numbers in the guide and the numbers in the
// calculator can never drift apart.
//
// Model: a household of one or two people. All income is pooled and all spending
// is shared, so there is one household FI target and one timeline. Income and
// wrappers are still tracked per person because almost every Estonian allowance
// is per person, and the household surplus is split between people by a
// configurable share - that share decides who *owns* the resulting portfolio,
// not who needs what. What would happen on separation is out of scope.

import { RATES, DEFAULTS } from './rates.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const annuityFactor = (r, n) => (r === 0 ? n : ((1 + r) ** n - 1) / r);
const overlapYears = (from, to, activeFrom = -Infinity, activeTo = Infinity) =>
  Math.max(0, Math.min(to, activeTo) - Math.max(from, activeFrom));

export const portfolioTotal = (balances) => balances.reduce((s, b) => s + b.cash + b.invested, 0);
const bucketTotal = (balances, key) => balances.reduce((s, b) => s + b[key], 0);
const takeBucket = (balances, key, amount) => {
  const total = bucketTotal(balances, key);
  const taken = Math.min(Math.max(0, amount), Math.max(0, total));
  if (total > 0) for (const b of balances) b[key] -= taken * b[key] / total;
  return taken;
};
// Reclassify only the shortage, without changing ownership or total assets.
const reserveCash = (balances, reserve) => {
  const missing = Math.max(0, reserve - bucketTotal(balances, 'cash'));
  const invested = bucketTotal(balances, 'invested');
  const transfer = Math.min(missing, Math.max(0, invested));
  if (invested > 0) for (const b of balances) {
    const share = transfer * b.invested / invested;
    b.invested -= share;
    b.cash += share;
  }
  return missing - transfer;
};
const spendPortfolio = (balances, amount, reserve = 0) => {
  const cash = Math.min(Math.max(0, amount), Math.max(0, bucketTotal(balances, 'cash') - reserve));
  takeBucket(balances, 'cash', cash);
  const invested = takeBucket(balances, 'invested', amount - cash);
  return { cash, invested, shortfall: Math.max(0, amount - cash - invested) };
};

/** One retirement period. Reserve is in real euros; negative cash returns
 * require replenishment from investments, never use of protected principal.
 * This remains an after-tax-reserve approximation, not transaction-level tax.
 */
export function retirementStep(opening, withdrawal, duration, cashReturn, investmentReturn, reserve = 0) {
  const balances = opening.map((b) => ({ ...b }));
  let shortfall = reserveCash(balances, reserve);
  const spent = spendPortfolio(balances, withdrawal, reserve);
  shortfall += spent.shortfall;
  const cashBeforeReturn = bucketTotal(balances, 'cash');
  const investedBeforeReturn = bucketTotal(balances, 'invested');
  for (const b of balances) {
    b.cash *= (1 + cashReturn) ** duration;
    b.invested *= (1 + investmentReturn) ** duration;
  }
  const cashGrowth = bucketTotal(balances, 'cash') - cashBeforeReturn;
  const investmentGrowth = bucketTotal(balances, 'invested') - investedBeforeReturn;
  shortfall += reserveCash(balances, reserve);
  return { balances, shortfall, fromCash: spent.cash, fromInvestments: spent.invested,
    cashGrowth, investmentGrowth };
}

// Accumulation deficits are funded at period end, cash first. Positive savings
// retain the existing annuity convention. No borrowing or later recovery from
// an unfunded expense is assumed. The retirement-only reserve is not active yet.
export function accumulationStep(opening, surplus, years, cashReturn, investmentReturn, shares) {
  const balances = opening.map((b) => ({ ...b }));
  let shortfall = opening.shortfall || 0;
  if (surplus >= 0 && !shortfall) {
    for (const [i, b] of balances.entries()) {
      b.cash *= (1 + cashReturn) ** years;
      b.invested = b.invested * (1 + investmentReturn) ** years +
        surplus * shares[i] * annuityFactor(investmentReturn, years);
    }
  } else if (!shortfall) {
    for (let elapsed = 0; elapsed < years; elapsed += 1) {
      const duration = Math.min(1, years - elapsed);
      for (const b of balances) {
        b.cash *= (1 + cashReturn) ** duration;
        b.invested *= (1 + investmentReturn) ** duration;
      }
      shortfall += spendPortfolio(balances, -surplus * duration).shortfall;
      if (shortfall > 1e-6) break;
    }
  }
  balances.shortfall = shortfall;
  return balances;
}

// ---------------------------------------------------------------- income tax

/** Estonian take-home from a gross annual salary. */
export function netFromGross(grossAnnual, { pillar2Rate = 0.02, pensionAge = false } = {}) {
  const ui = grossAnnual * RATES.unemploymentInsuranceEmployee;
  const p2 = grossAnnual * pillar2Rate;
  const exemption =
    12 * (pensionAge ? RATES.basicExemptionPensionAge : RATES.basicExemptionMonthly);
  const taxable = Math.max(0, grossAnnual - ui - p2 - exemption);
  const incomeTax = taxable * RATES.incomeTax;
  return {
    gross: grossAnnual,
    unemploymentInsurance: ui,
    pillar2Employee: p2,
    pillar2State: grossAnnual * RATES.pillar2.stateRate,
    taxable,
    incomeTax,
    net: grossAnnual - ui - p2 - incomeTax,
    effectiveRate: grossAnnual > 0 ? (ui + p2 + incomeTax) / grossAnnual : 0,
  };
}

/** Full Pillar III payment, deductible portion, and salary-only refund estimate. */
export function pillar3(grossAnnual, contributionAnnual = null, { pillar2Rate = 0.02 } = {}) {
  const cap = Math.min(RATES.pillar3.maxAnnual, grossAnnual * RATES.pillar3.maxShareOfGross);
  const contribution = contributionAnnual === null ? cap : Math.max(0, contributionAnnual);
  const deductible = Math.min(contribution, cap);
  const incomeTaxPaid = netFromGross(grossAnnual, { pillar2Rate }).incomeTax;
  // The refund is a deduction against your own tax: no tax, no refund, and it
  // cannot be transferred to a spouse.
  const refund = Math.min(deductible * RATES.pillar3.refundRate, incomeTaxPaid);
  // What the refund would be if the allowance were used in full - that is the
  // number a rule needs in order to say what is being left unclaimed.
  const maxRefund = Math.min(cap * RATES.pillar3.refundRate, incomeTaxPaid);
  return {
    cap, contribution, deductible, refund, maxRefund,
    unclaimed: Math.max(0, maxRefund - refund),
    wasted: contribution * RATES.pillar3.refundRate - refund,
  };
}

// ------------------------------------------------------------------ pensions

/** Projected state pension age for a birth year, and when the pillars unlock. */
export function pensionAges(birthYear) {
  const { knownByBirthYear, knownByCalendarYear, driftMonthsPerYearEstimate, pillarUnlockOffsetYears } =
    RATES.pensionAge;
  const yearTurning65 = birthYear + 65;
  const known = Object.keys(knownByCalendarYear).map(Number).sort();
  const lastKnownYear = known[known.length - 1];
  let stateAge;
  let confirmed = false;
  if (knownByBirthYear?.[birthYear] != null) {
    stateAge = knownByBirthYear[birthYear];
    confirmed = true;
  } else if (knownByCalendarYear[yearTurning65] != null) {
    stateAge = knownByCalendarYear[yearTurning65];
    confirmed = true;
  } else if (yearTurning65 > lastKnownYear) {
    stateAge = knownByCalendarYear[lastKnownYear];
    confirmed = false;
    stateAge += ((yearTurning65 - lastKnownYear) * driftMonthsPerYearEstimate) / 12;
  } else {
    // Only relevant to already-retired cohorts absent from the recent transition
    // table. Keep the date conservative and explicitly mark it unconfirmed.
    stateAge = 65;
  }
  return {
    statePensionAge: stateAge,
    pillarUnlockAge: stateAge + pillarUnlockOffsetYears,
    confirmed,
    estimateRange: confirmed ? null : {
      min: knownByCalendarYear[lastKnownYear],
      max: knownByCalendarYear[lastKnownYear] +
        ((yearTurning65 - lastKnownYear) * RATES.pensionAge.maxDriftMonthsPerYear) / 12,
    },
    note: confirmed ? null :
      'Scenario midpoint only; the official age has not been published. Use the displayed range.',
  };
}

/**
 * Monthly Pillar I entitlement for a career of `yearsWorked` at `grossAnnual`.
 *
 * The accrual is what makes this matter to a FIRE plan: stopping work stops the
 * coefficient accumulating, so retiring early cuts the state pension in direct
 * proportion to the years given up. Only the post-2021 ühendosa rule is
 * modelled - earlier years accrued on a slightly different basis, which moves
 * the answer by a few euros a month and cannot be reconstructed without a full
 * contribution history.
 */
/**
 * Income tax on a state pension. Pillar I *is* taxable, unlike a Pillar II
 * lifetime annuity, but pension age carries a larger basic exemption and there
 * is normally no other income left to use it against.
 */
export function statePensionNet(grossAnnual, { pensionAge = true } = {}) {
  const exemption = 12 * (pensionAge
    ? RATES.basicExemptionPensionAge : RATES.basicExemptionMonthly);
  const taxable = Math.max(0, grossAnnual - exemption);
  return { gross: grossAnnual, taxable, tax: taxable * RATES.incomeTax,
           net: grossAnnual - taxable * RATES.incomeTax };
}

/** Salary-based service estimate, not a reconstruction of social-tax records.
 * Assumes contributions on entered salary only; no employer minimum top-up,
 * state-paid contributions, or special qualifying periods are inferred.
 * Pillar II membership affects pension units, not qualifying service.
 */
export function pensionServicePerYear(grossAnnual) {
  return clamp(grossAnnual / RATES.minimumAnnualWageForPension, 0, 1);
}

/** Coefficient earned per year of work at a given wage, in or out of Pillar II. */
export function pillar1UnitsPerYear(grossAnnual, inPillar2 = true) {
  const p1 = RATES.pillar1;
  const averageAnnual = 12 * RATES.averageGrossWageMonthly;
  const wageRatio = averageAnnual > 0 ? grossAnnual / averageAnnual : 0;
  // Belonging to Pillar II costs 20% of the accrual, on both halves.
  const factor = inPillar2 ? p1.pillar2MemberFactor : 1;
  const minimumAnnual = RATES.minimumAnnualWageForPension;
  const solidarity = Math.min(p1.solidarityMax,
    minimumAnnual > 0 ? Math.max(0, grossAnnual) / minimumAnnual : 0) * factor;
  const insurance = wageRatio * factor;           // uncapped, then reduced
  return solidarity * p1.solidarityWeight + insurance * (1 - p1.solidarityWeight);
}

/**
 * Pillar I from coefficient units rather than from a career length.
 *
 * `unitsSoFar` is what has actually accrued — the figure Sotsiaalkindlustusamet
 * holds and shows in the self-service portal. It is the honest input: it already
 * accounts for years abroad, months out of work and a salary that changed, none
 * of which a "started working at age" guess can represent. Someone who moved to
 * Estonia mid-career is the case that guess gets badly wrong, and it gets it
 * wrong in the flattering direction.
 *
 * `serviceYears` is used only for the 15-year earned-pension threshold. This
 * standalone function returns zero below it; national-pension residence and
 * foreign-pension conditions must be established separately by the caller.
 */
export function pillar1Monthly({
  grossAnnual, unitsSoFar = 0, futureYears = 0, serviceYears = null, inPillar2 = true,
}) {
  const p1 = RATES.pillar1;
  const perYear = pillar1UnitsPerYear(grossAnnual, inPillar2);
  const future = Math.max(0, futureYears);
  const units = Math.max(0, unitsSoFar) + perYear * future;
  // Qualifying service and pension units are separate contribution measures.
  const service = serviceYears == null
    ? future * pensionServicePerYear(grossAnnual) : Math.max(0, serviceYears);
  if (service < p1.minServiceYears) return 0;
  return p1.baseMonthly + p1.yearRateMonthly * units;
}

/**
 * What the pension pillars turn a given salary into. Deliberately standalone:
 * it answers "is this job worth it for my pension?" without needing a whole
 * household plan.
 */
export function pillarProjection({
  birthYear, grossMonthly, pillar2Rate = 0.02, pillar3Annual = 0,
  workUntilAge = null, realReturn = 0.05, currentYear = RATES.year,
  startingPillar2 = 0, startingPillar3 = 0,
}) {
  const gross = (grossMonthly || 0) * 12;
  const ages = pensionAges(birthYear);
  const ageNow = currentYear - birthYear;
  const unlockAge = ages.pillarUnlockAge;
  const stopAge = Math.min(workUntilAge ?? unlockAge, unlockAge);
  const yearsWorking = Math.max(0, stopAge - ageNow);
  const yearsToUnlock = Math.max(0, unlockAge - ageNow);
  const idleYears = yearsToUnlock - yearsWorking;

  const tax = netFromGross(gross, { pillar2Rate });
  const p3 = pillar3(gross, pillar3Annual, { pillar2Rate });

  const ownAnnual = gross * pillar2Rate;
  const stateAnnual = gross * RATES.pillar2.stateRate;

  const af = annuityFactor(realReturn, yearsWorking);
  const idle = (1 + realReturn) ** idleYears;
  const grow = (v) => v * af * idle;

  const pot2 = startingPillar2 * (1 + realReturn) ** yearsToUnlock +
    grow(ownAnnual) + grow(stateAnnual);
  const pot3 = startingPillar3 * (1 + realReturn) ** yearsToUnlock +
    grow(p3.contribution);

  // A fund pension paced over the statistically recommended duration is taxed
  // at 0%. Remaining life expectancy at that age is roughly 20 years.
  const payoutYears = 20;
  const monthlyPension = (pot2 + pot3) / payoutYears / 12;

  return {
    ageNow, unlockAge, unlockYear: birthYear + unlockAge, yearsWorking, yearsToUnlock,
    pensionAgeConfirmed: ages.confirmed, pensionAgeRange: ages.estimateRange,
    tax, pillar3: p3,
    contributions: {
      ownAnnual, stateAnnual, totalAnnual: ownAnnual + stateAnnual,
      ownMonthly: ownAnnual / 12, stateMonthly: stateAnnual / 12,
      pillar3Annual: p3.contribution, refund: p3.refund,
    },
    // Out of pocket: your Pillar II slice plus Pillar III, less the refund.
    netCostAnnual: ownAnnual + p3.contribution - p3.refund,
    pot2, pot3, total: pot2 + pot3,
    monthlyPension, payoutYears,
  };
}

// ----------------------------------------------------------------- mortgage

export function mortgage({ price, deposit, termYears, rate, collateralValue = price }) {
  const loan = Math.max(0, price - Math.min(price, deposit));
  const ltv = collateralValue > 0 ? loan / collateralValue : Infinity;
  const pay = (r) => {
    const i = r / 12, n = termYears * 12;
    return i === 0 ? loan / n : (loan * i) / (1 - (1 + i) ** -n);
  };
  const monthly = pay(rate);
  const stressed = pay(Math.max(rate, RATES.mortgage.stressRate));
  return {
    loan, ltv, monthly, stressedMonthly: stressed,
    totalInterest: monthly * termYears * 12 - loan,
    withinLtvLimit: ltv <= RATES.mortgage.maxLtv,
    balanceAfter(years) {
      const i = rate / 12, n = termYears * 12, k = Math.min(years * 12, n);
      if (i === 0) return loan * (1 - k / n);
      return (loan * ((1 + i) ** n - (1 + i) ** k)) / ((1 + i) ** n - 1);
    },
  };
}

// --------------------------------------------------------------- the engine

/**
 * @param {object} input - see docs/DATA-MODEL.md
 * @returns a fully derived plan
 */
export function simulate(input) {
  const a = { ...DEFAULTS, ...(input.assumptions || {}) };
  const hh = input.household;
  const people = input.persons.map((p) => ({ ...p }));

  // ---- income -------------------------------------------------------------
  for (const p of people) {
    const gross = (p.income.grossMonthly || 0) * 12;
    const derived = netFromGross(gross, { pillar2Rate: p.pillar2Rate ?? 0.02 });
    p.grossAnnual = gross;
    p.estimatedServicePerYear = pensionServicePerYear(gross);
    // Trust an explicitly supplied net figure over the model.
    p.netAnnual = p.income.netMonthly != null ? p.income.netMonthly * 12 : derived.net;
    p.tax = derived;
    // Unspecified means "not contributing", not "assume the maximum" - otherwise
    // the unused-allowance finding would never surface for someone who hasn't started.
    p.pillar3 = pillar3(gross, p.pillar3Annual ?? 0, {
      pillar2Rate: p.pillar2Rate ?? 0.02,
    });
    p.employed = gross > 0;
    p.hasHealthInsurance = p.employed || !!p.healthInsurance;
  }

  // Non-salary income belongs to the person who owns the asset producing it,
  // which matters when working out what each of them would have alone.
  for (const p of people) p.otherNetAnnual = (p.income.otherNetMonthly || 0) * 12;
  // Legacy household-level rental is attributed to the first person.
  const legacyRental = (hh.rentalIncomeNetMonthly || 0) * 12;
  if (legacyRental) people[0].otherNetAnnual += legacyRental;

  const rentalNet = people.reduce((s, p) => s + p.otherNetAnnual, 0);
  const householdNetIncome = people.reduce((s, p) => s + p.netAnnual + p.otherNetAnnual, 0);

  // ---- pension dates ------------------------------------------------------
  // Needed this early because they decide when health cover stops being an
  // expense, which feeds the spending figures below.
  const currentYear = input.currentYear || RATES.year;
  const drawAtStatePensionAge = (a.pillarDrawAge || 'unlock') === 'statePension';

  // The state pension may be taken up to five years early, but each year of it
  // demands five more years of service - and a short career is precisely what
  // early retirement produces. So the request is capped by what the person has
  // actually accrued, and the cap is reported rather than silently applied.
  const earlyRequested = Math.max(0, Math.min(
    RATES.pillar1.maxEarlyYears, Math.round(a.statePensionEarlyYears || 0)));
  const earlyAllowedFor = (serviceYears) => {
    let allowed = 0;
    for (const [years, needed] of Object.entries(RATES.pillar1.earlyDrawingServiceYears)) {
      if (serviceYears >= needed) allowed = Math.max(allowed, Number(years));
    }
    return Math.min(allowed, earlyRequested);
  };
  const lumpSum = a.pillarPayout === 'lumpSum';
  a.pillarPayout = lumpSum ? 'lumpSum' : 'fundPension';
  const lumpInvestedShare = clamp(a.pensionLumpSumInvestedShare ?? 0, 0, 1);
  for (const p of people) {
    p.pension = pensionAges(p.birthYear);
    p.pensionUnlockYear = p.birthYear + p.pension.pillarUnlockAge;
    p.statePensionStandardYear = p.birthYear + p.pension.statePensionAge;
    p.statePensionYear = p.statePensionStandardYear;
    p.statePensionEarlyYears = 0;
    p.statePensionAdjustment = 0;
    // When the pots are actually taken, which need not be the first legal day.
    // Deferring leaves them invested, so the pot is larger when it does start.
    p.pillar2DrawYear = drawAtStatePensionAge ? p.statePensionYear : p.pensionUnlockYear;
    p.pillar2DrawAge = drawAtStatePensionAge
      ? p.pension.statePensionAge : p.pension.pillarUnlockAge;
    const hasPillar3 = (p.assets?.pillar3 || 0) > 0 || (p.pillar3Annual || 0) > 0;
    p.pillar3EligibilityKnown = !hasPillar3 || p.pillar3FirstContributionYear != null;
    if (hasPillar3 && p.pillar3EligibilityKnown) {
      const first = p.pillar3FirstContributionYear;
      const legalYear = first <= 2020
        ? Math.max(p.birthYear + 55, first + RATES.pillar3.minHoldYears)
        : Math.max(p.pensionUnlockYear, first + RATES.pillar3.minHoldYears);
      p.pillar3LegalYear = legalYear;
      p.pillar3DrawYear = drawAtStatePensionAge
        ? Math.max(legalYear, p.statePensionYear) : legalYear;
    } else {
      p.pillar3DrawYear = null;
    }
    // Compatibility headline: the date by which every countable pot has begun.
    p.pillarDrawYear = Math.max(p.pillar2DrawYear, p.pillar3DrawYear ?? p.pillar2DrawYear);
    p.pillarDrawAge = p.pillarDrawYear - p.birthYear;
    // Do not invent an insurer price or an official tax-free duration. Those
    // must come from a current quote / Pensionikeskus result supplied by the user.
    p.payoutYears = p.fundPensionYears != null
      ? Math.max(1, p.fundPensionYears) : null;
    p.pensionTermsKnown = lumpSum || p.payoutYears != null;
    p.pillarIncomeEndYear = p.payoutYears != null
      ? Math.max(p.pillar2DrawYear + p.payoutYears,
          (p.pillar3DrawYear ?? p.pillar2DrawYear) + p.payoutYears)
      : p.pillarDrawYear;
    p.pillarIncomeEndAge = p.payoutYears != null
      ? p.pillarDrawAge + p.payoutYears : p.pillarDrawAge;
    p.ageNow = currentYear - p.birthYear;
    // Pillar I accrual comes from the accrued coefficient and nothing else. No
    // estimate from a career length: it could only ever be worse than the figure
    // the state already holds, and it flattered anyone who worked outside
    // Estonia. Blank means nothing accrued yet, which is the honest default.
    p.pillar1UnitsSoFar = Math.max(0, p.pillar1Units ?? 0);
    p.pillar1UnitsKnown = p.pillar1Units != null;
    // Service years and coefficient units are legally different quantities.
    // Never infer one from the other: a high or low salary would move the
    // coefficient without changing the number of qualifying years.
    p.yearsWorkedSoFar = p.yearsWorkedEstonia == null
      ? null : Math.max(0, p.yearsWorkedEstonia);
    p.euEeaServiceYears = Math.max(0, p.yearsWorkedEuEea || 0);
    p.serviceYearsKnown = p.yearsWorkedSoFar != null;
  }
  // The binding date for the household is whoever's money arrives last, since
  // the portfolio has to carry until then.
  const lastToUnlock = people.reduce((x, y) =>
    y.pillarDrawYear > x.pillarDrawYear ? y : x);
  const ages = lastToUnlock.pension;

  // ---- spending, now and at FI -------------------------------------------
  const s = hh.spending;
  const spendNow =
    12 * ((s.housing || 0) + (s.childCosts || 0) + (s.other || 0) + (s.buffer || 0));

  const purchase = hh.property?.purchase || null;
  const mort = purchase ? mortgage(purchase) : null;
  const housingAfter = purchase ? 12 * (mort.monthly + (purchase.runningCostsMonthly || 0)) : 12 * (s.housing || 0);
  const spendAfterMove = spendNow - 12 * (s.housing || 0) + housingAfter;

  // Pillar III contributions leave the counted portfolio - the balance is
  // excluded from the plan - so they reduce what can be invested. The refund
  // comes back, so only the net cost bites.
  const pillar3NetCost = people.reduce(
    (x, p) => x + Math.max(0, p.pillar3.contribution - p.pillar3.refund), 0);

  // Life cover buys protection rather than assets, so the premium leaves the
  // surplus and never appears in the portfolio.
  const lifeInsuranceCost = people.reduce(
    (x, p) => x + (p.lifeInsurance ? (p.lifeInsuranceMonthly || 0) * 12 : 0), 0);

  // A voluntary health contract is a real outgoing today, and one worth seeing
  // separately: it buys cover rather than assets, so it never appears in the
  // portfolio. Only the years before FI - past FI nobody is employed, so every
  // adult needs one and it is already inside perpetual spending.
  const healthInsuranceCost = people.reduce(
    (x, p) => x + (p.healthInsurance ? (p.healthInsuranceMonthly ?? RATES.healthInsurance.voluntaryMonthly) * 12 : 0), 0);

  const fixedOutgoings = pillar3NetCost + lifeInsuranceCost + healthInsuranceCost;
  const surplusNow = householdNetIncome - spendNow - fixedOutgoings;
  const surplusAfterMove = householdNetIncome - spendAfterMove - fixedOutgoings;

  // Perpetual spending excludes the mortgage (a finite liability, handled as a
  // lump sum) and child costs (finite too), and nets off rental income.
  const housingRunningAnnual = purchase
    ? 12 * (purchase.runningCostsMonthly || 0)
    : 12 * (s.housing || 0);
  const discretionaryAnnual = 12 * ((s.other || 0) + (s.buffer || 0));

  // Pension age is not proof of receipt or health entitlement. Coverage dates
  // are explicit, independent of pension benefit policy/trust. With no confirmed
  // route, retain premiums throughout retirement (including the capital floor).
  const healthPerPerson = 12 * RATES.healthInsurance.voluntaryMonthly;
  const healthEndFor = (p) => p.healthCoveredAfterFi ? -Infinity
    : (Number.isFinite(p.healthCoverageFromYear) && p.healthCoverageFromYear >= 1900 &&
        p.healthCoverageFromYear <= 2200 ? p.healthCoverageFromYear : Infinity);
  const ongoingHealthAnnual = people.filter((p) => healthEndFor(p) === Infinity).length * healthPerPerson;
  const healthCostBetween = (from, to) => people.reduce((x, p) => {
    if (p.healthCoveredAfterFi) return x;
    return x + healthPerPerson * overlapYears(from, to, -Infinity, healthEndFor(p));
  }, 0);
  const healthCostIn = (year) => healthCostBetween(year, year + 1);

  // Spending is in today's money throughout, because the return is real. This
  // is growth ON TOP of inflation - the cost of the same life rising faster
  // than the general index - applied from the day work stops.
  const g = a.spendingGrowth || 0;
  const perpetual = discretionaryAnnual + housingRunningAnnual - rentalNet;

  // ---- allocation shares --------------------------------------------------
  // The split decides ownership of the pooled money, so it has to be known
  // before the starting balances are divided up.
  const rawShares = people.map((p) =>
    p.allocationShare != null ? p.allocationShare : 1 / people.length);
  const shareSum = rawShares.reduce((x, y) => x + y, 0) || 1;
  people.forEach((p, i) => { p.share = rawShares[i] / shareSum; });

  // ---- starting portfolios ------------------------------------------------
  // Assets stay with whoever holds them. The allocation share governs future
  // savings only; to change who owns existing money, move it in the inputs.
  const countCrypto = !(input.excludeCrypto ?? true);
  for (const p of people) {
    const as = p.assets || {};
    const iaBasis = Math.min(as.investmentAccount || 0,
      as.investmentAccountContributions || 0);
    p.investmentTaxReserve = Math.max(0, (as.investmentAccount || 0) - iaBasis) *
      RATES.incomeTax;
    const brokerageBasis = Math.min(as.brokerage || 0, as.brokerageCostBasis || 0);
    p.brokerageTaxReserve = Math.max(0, (as.brokerage || 0) - brokerageBasis) *
      RATES.incomeTax;
    const cryptoBasis = Math.min(as.crypto || 0, as.cryptoCostBasis || 0);
    p.cryptoTaxReserve = countCrypto
      ? Math.max(0, (as.crypto || 0) - cryptoBasis) * RATES.crypto.taxRate : 0;
    p.startPortfolio =
      (as.investmentAccount || 0) - p.investmentTaxReserve +
      (as.brokerage || 0) - p.brokerageTaxReserve +
      (as.cash || 0) + (countCrypto ? (as.crypto || 0) - p.cryptoTaxReserve : 0);
    p.excluded = (as.pillar2 || 0) + (as.pillar3 || 0) + (countCrypto ? 0 : as.crypto || 0);
  }

  // House cash leaves on the completion date, not today. The projection below
  // compounds and saves at the pre-move rate until that event, then deducts it.
  let cashForHouse = 0, reserve = 0, transactionCosts = 0, emergencyFund = 0;
  if (purchase) {
    const emergency = (spendAfterMove / 12) * a.emergencyFundMonths;
    transactionCosts = purchase.price * a.transactionCostRate;
    emergencyFund = emergency;
    cashForHouse = Math.min(purchase.price, purchase.deposit) +
      transactionCosts + (purchase.movingCosts || 0);
    reserve = cashForHouse + emergency;

  }

  const totalStart = people.reduce((sum, p) => sum + p.startPortfolio, 0);

  // ---- timeline -----------------------------------------------------------
  // A negative surplus means the household is drawing down, not saving nothing.
  // Clamping it to zero would let compounding alone "reach" the target, which is
  // arithmetically true and completely misleading.
  const surplusAfterLoan = surplusAfterMove + (mort ? 12 * mort.monthly : 0);
  const depleting = Math.max(surplusNow, surplusAfterMove, surplusAfterLoan) <= 0;
  const annualSaving = Math.max(0, surplusAfterMove);
  const houseYears = purchase ? Math.max(0, purchase.monthsAway || 0) / 12 : Infinity;
  const inflation = a.inflation ?? DEFAULTS.inflation;
  const purchaseYear = purchase ? currentYear + houseYears : -Infinity;
  const mortgageEndYear = purchase ? purchaseYear + purchase.termYears : -Infinity;
  // Inputs describe the purchase in today's purchasing power. Freeze the
  // nominal payment at completion; deflate thereafter. Use the calendar-year
  // opening (or completion if later) for every portion of the same year, so
  // changing the FI date cannot reprice an identical payment.
  const mortgageAnnualIn = (year) => purchase ? 12 * mort.monthly /
    (1 + inflation) ** Math.max(0, Math.floor(year) - purchaseYear) : 0;
  const mortgageCostBetween = (from, to) => {
    let cost = 0;
    for (let start = Math.max(from, purchaseYear); start < Math.min(to, mortgageEndYear);) {
      const end = Math.min(to, mortgageEndYear, Math.floor(start) + 1);
      cost += mortgageAnnualIn(start) * (end - start);
      start = end;
    }
    return cost;
  };
  const initialBalances = people.map((p) => ({ cash: p.assets?.cash || 0,
    invested: p.startPortfolio - (p.assets?.cash || 0) }));
  const advance = (balances, surplus, years) => accumulationStep(balances, surplus,
    years, a.cashRealReturn ?? 0, a.realReturn, people.map((p) => p.share));
  const beforeHouse = purchase ? advance(initialBalances, surplusNow, houseYears) : initialBalances;
  const projectedAtHouse = beforeHouse.shortfall > 1e-6 ? -Infinity : portfolioTotal(beforeHouse);
  const houseFundingShortfall = purchase
    ? Math.max(0, cashForHouse + emergencyFund - projectedAtHouse) : 0;
  const balancesAt = (years) => {
    const balances = advance(initialBalances, surplusNow, Math.min(years, houseYears));
    if (!purchase || years < houseYears || houseFundingShortfall > 0) return balances;
    let remaining = cashForHouse;
    const payer = purchase.paidBy;
    if (typeof payer === 'number' && people[payer]) {
      const order = [payer, ...people.map((_, i) => i).filter((i) => i !== payer)];
      for (const i of order) {
        const take = Math.min(portfolioTotal([balances[i]]), remaining);
        spendPortfolio([balances[i]], take);
        remaining -= take;
      }
    } else {
      const sum = portfolioTotal(balances) || 1;
      for (const b of balances) spendPortfolio([b], cashForHouse * portfolioTotal([b]) / sum);
    }
    reserveCash(balances, emergencyFund);
    const elapsed = years - houseYears;
    if (inflation !== 0) {
      let projected = balances;
      const end = Math.min(currentYear + years, mortgageEndYear);
      for (let start = purchaseYear; start < end;) {
        const next = Math.min(end, Math.floor(start) + 1);
        projected = advance(projected, surplusAfterLoan - mortgageAnnualIn(start), next - start);
        start = next;
      }
      return advance(projected, surplusAfterLoan, Math.max(0, elapsed - purchase.termYears));
    }
    const atPayoff = advance(balances, surplusAfterMove, Math.min(elapsed, purchase.termYears));
    return advance(atPayoff, surplusAfterLoan, Math.max(0, elapsed - purchase.termYears));
  };
  const project = (_start, _save, years) => purchase && years >= houseYears && houseFundingShortfall > 0
    ? -Infinity : (() => {
      const balances = balancesAt(years);
      return balances.shortfall > 1e-6 ? -Infinity : portfolioTotal(balances);
    })();
  const ownershipAt = (years) => balancesAt(years).map((b) => b.cash + b.invested);
  const retirementReserve = Math.max(0, Math.min(1e9, a.retirementCashReserve || 0));
  const retirementBalances = (capital, years) => {
    const projected = balancesAt(years);
    const total = portfolioTotal(projected);
    const balances = projected.map((b) => ({
      cash: total > 0 ? b.cash * capital / total : 0,
      invested: total > 0 ? b.invested * capital / total : 0,
    }));
    reserveCash(balances, retirementReserve);
    return balances;
  };

  // Present value at the FI date of the health premiums still owed, i.e. those
  // falling between stopping work and confirmed coverage, capped at the horizon.
  // Present value of a payment stream that itself grows at g, discounted at the
  // real return. Reduces to the flat annuity factor when g is zero.
  const pvAnnuity = (n) => {
    if (n <= 0) return 0;
    const r = a.realReturn;
    if (Math.abs(r - g) < 1e-9) return n / (1 + r);
    return (1 - ((1 + g) / (1 + r)) ** n) / (r - g);
  };
  const healthBridgeAt = (y) => people.reduce(
    (x, p) => x + (p.healthCoveredAfterFi ? 0 : healthPerPerson) * pvAnnuity(
      Math.max(0, Math.min(healthEndFor(p), planEndYear) - (currentYear + y))), 0);

  const primary = people[0];
  const ageNow = currentYear - primary.birthYear;

  // ---- pension income, if the plan is allowed to lean on it ---------------
  // Pension money is individual: own balance, own contributions while working,
  // own unlock date. Contributions stop at FI - that is the whole reason
  // retiring early costs pension, and why the FI date and the pension it
  // produces have to be solved together rather than one after the other.
  const potAtDraw = (p, yearsToFi, kind) => {
    const selected = kind === 'pillar2' ? p.pillar2DrawYear : p.pillar3DrawYear;
    if (selected == null) return 0;
    const drawYear = lumpSum ? Math.max(selected, currentYear + (Number.isFinite(yearsToFi) ? yearsToFi : 0)) : selected;
    const yrs = Math.max(0, drawYear - currentYear);
    const contributing = Math.min(yearsToFi, yrs);
    const idle = (v) => v * (1 + a.realReturn) ** Math.max(0, yrs - contributing);
    if (kind === 'pillar2') {
      const rate = (p.pillar2Rate ?? 0.02) + RATES.pillar2.stateRate;
      return (p.assets?.pillar2 || 0) * (1 + a.realReturn) ** yrs +
        idle(p.grossAnnual * rate * annuityFactor(a.realReturn, contributing));
    }
    return (p.assets?.pillar3 || 0) * (1 + a.realReturn) ** yrs +
      idle(p.pillar3.contribution * annuityFactor(a.realReturn, contributing));
  };
  const potAtUnlock = (p, yearsToFi) =>
    potAtDraw(p, yearsToFi, 'pillar2') + potAtDraw(p, yearsToFi, 'pillar3');

  const policy = a.pensionPolicy || 'ignore';
  const countPots = policy === 'ownPots' || policy === 'all';
  const countState = policy === 'all';

  // Pillar I can only be counted when the inputs establish entitlement. EU/EEA
  // aggregation can establish a right, but the cross-border pro-rata amount
  // cannot be reconstructed here, so such cases remain deliberately uncounted.
  const stateMonthlyFor = (p, futureYears) => {
    if (!p.pillar1UnitsKnown || !p.serviceYearsKnown) return 0;
    const estonianService = p.yearsWorkedSoFar +
      Math.max(0, futureYears) * p.estimatedServicePerYear;
    if (estonianService >= RATES.pillar1.minServiceYears) {
      return pillar1Monthly({
        grossAnnual: p.grossAnnual,
        unitsSoFar: p.pillar1UnitsSoFar,
        futureYears,
        serviceYears: estonianService,
        inPillar2: (p.pillar2Rate ?? 0.02) > 0,
      });
    }
    if (p.euEeaServiceYears > 0) return 0; // amount requires official pro-rata calculation
    return p.nationalPensionEligible ? RATES.pillar1.nationalPensionMonthly : 0;
  };

  // Fund withdrawals redeem fixed units over the entered duration. Remaining
  // units stay invested; payments follow returns and stop when units run out.
  // A haircut on what the pension is believed to deliver. Applied to the income,
  // not to the balance: the pot is still the pot, this is how much of it the
  // plan is willing to depend on.
  const potsShare = a.potsCountedShare ?? 1;
  const stateShare = a.stateCountedShare ?? 1;
  const potIncomeIn = (p, year, yearsToFi) => {
    if (lumpSum) return 0; // Capital transfers are not recurring income.
    if (!p.pensionTermsKnown) return 0;
    const from = Math.max(year, currentYear + yearsToFi);
    const to = year + 1;

    let income = 0;
    for (const kind of ['pillar2', 'pillar3']) {
      const draw = kind === 'pillar2' ? p.pillar2DrawYear : p.pillar3DrawYear;
      if (draw == null) continue;
      const active = overlapYears(from, to, draw, draw + p.payoutYears);
      if (!active) continue;
      const base = potAtDraw(p, yearsToFi, kind) / p.payoutYears * potsShare;
      income += base * active * (1 + a.realReturn) ** Math.max(0, from - draw);
    }
    return income;
  };

  const pensionBreakdownIn = (year, yearsToFi) => {
    let pots = 0, state = 0;
    for (const p of people) {
      // A fund pension stops. That is the whole point of offering the choice:
      // the portfolio has to be able to take over again afterwards.
      if (countPots && year + 1 > Math.min(p.pillar2DrawYear,
          p.pillar3DrawYear ?? Infinity) && year < p.pillarIncomeEndYear) {
        pots += potIncomeIn(p, year, yearsToFi);
      }
      if (countState && year + 1 > p.statePensionYear) {
        // Net, not gross: a qualifying fund pension is 0%-taxed but Pillar I is not,
        // and only what survives the tax can be spent.
        const gross = 12 * stateMonthlyFor(p, yearsToFi) *
          (1 + p.statePensionAdjustment);
        const active = overlapYears(Math.max(year, currentYear + yearsToFi), year + 1,
          p.statePensionYear, Infinity);
        state += statePensionNet(gross, {
          pensionAge: year >= p.statePensionStandardYear,
        }).net * stateShare * active;
      }
    }
    return { pots, state, total: pots + state };
  };
  const pensionIncomeIn = (year, yearsToFi) => pensionBreakdownIn(year, yearsToFi).total;

  const lumpEvents = (y, share = potsShare) => {
    if (!lumpSum || !countPots || share <= 0 || !Number.isFinite(y)) return [];
    return people.flatMap((p, owner) => ['pillar2', 'pillar3'].flatMap((kind) => {
      const selected = kind === 'pillar2' ? p.pillar2DrawYear : p.pillar3DrawYear;
      if (selected == null) return [];
      const gross = potAtDraw(p, y, kind);
      if (gross <= 0) return [];
      const tax = gross * RATES.pillar2.payout.lumpSum;
      return [{ owner, kind, date: Math.max(selected, currentYear + y), gross, tax,
        net: gross - tax, credited: (gross - tax) * share }];
    }));
  };
  const creditLump = (balances, event) => {
    balances[event.owner].cash += event.credited * (1 - lumpInvestedShare);
    balances[event.owner].invested += event.credited * lumpInvestedShare;
  };
  const openingWithLumps = (balances, y, share = potsShare) => {
    const result = balances.map((b) => ({ ...b }));
    for (const event of lumpEvents(y, share)) {
      if (event.date === currentYear + y) creditLump(result, event);
    }
    return result;
  };
  // Split at actual receipt dates: future proceeds cannot fund earlier spending.
  // The annual net spending estimate is spread uniformly within that year.
  const retirementYear = (opening, withdrawal, year, y, rate = a.realReturn, share = potsShare) => {
    const from = Math.max(year, currentYear + y), to = year + 1;
    const events = lumpEvents(y, share).filter((e) => e.date >= from && e.date < to)
      .sort((a, b) => a.date - b.date);
    if (!events.length) return { ...retirementStep(opening, withdrawal, to - from,
      a.cashRealReturn ?? 0, rate, retirementReserve), lumpGross: 0, lumpTax: 0, lumpNet: 0 };
    let balances = opening.map((b) => ({ ...b })), cursor = from;
    const totals = { shortfall: 0, fromCash: 0, fromInvestments: 0, cashGrowth: 0,
      investmentGrowth: 0, lumpGross: 0, lumpTax: 0, lumpNet: 0 };
    const advanceTo = (end) => {
      if (end <= cursor) return;
      const step = retirementStep(balances, withdrawal * (end - cursor) / (to - from),
        end - cursor, a.cashRealReturn ?? 0, rate, retirementReserve);
      balances = step.balances;
      for (const key of ['shortfall', 'fromCash', 'fromInvestments', 'cashGrowth', 'investmentGrowth']) totals[key] += step[key];
      cursor = end;
    };
    for (const event of events) {
      advanceTo(event.date);
      creditLump(balances, event);
      totals.lumpGross += event.gross;
      totals.lumpTax += event.tax;
      totals.lumpNet += event.credited;
    }
    advanceTo(to);
    return { balances, ...totals };
  };

  // The plan has to hold until the youngest person reaches the planning age.
  const planEndYear = currentYear +
    Math.max(...people.map((p) => a.planToAge - p.ageNow));

  // What a year costs, in today's money: the base plus health cover, grown by
  // however many years have passed since work stopped.
  // With no supplied end date, dependent costs continue for the whole plan. It
  // is safer to overfund an unknown liability than erase it on the FI date.
  const childCostsEndYear = s.childCostsEndYear ?? Infinity;
  const needIn = (year, fiYear) => {
    const from = Math.max(year, fiYear);
    const to = year + 1;
    if (from >= to) return 0;
    const duration = to - from;
    const housing = purchase
      ? 12 * (s.housing || 0) * overlapYears(from, to, -Infinity, purchaseYear) +
        12 * (purchase.runningCostsMonthly || 0) * overlapYears(from, to, purchaseYear, Infinity)
      : 12 * (s.housing || 0) * duration;
    const mortgageCost = mortgageCostBetween(from, to);
    const childCost = 12 * (s.childCosts || 0) *
      overlapYears(from, to, -Infinity, childCostsEndYear);
    const base = (discretionaryAnnual - rentalNet) * duration +
      housing + childCost + healthCostBetween(from, to);
    // Lifestyle growth does not reprice the contractual mortgage payment.
    return base * (1 + g) ** Math.max(0, from - fiYear) + mortgageCost;
  };

  // The floor the portfolio may never drop below.
  //
  //   drawdown  - zero. The money only has to reach planToAge.
  //   perpetual - the capital that funds permanent spending at the withdrawal
  //               rate indefinitely, less any income that is itself permanent.
  //               Only the state pension qualifies: it is indexed by law,
  //               whereas a fund
  //               pension stops outright. Counting those as permanent would be
  //               the optimistic error.
  //
  // It binds only once every permanent income has arrived. Before then the walk
  // already requires the money not to run out, and demanding perpetual capacity
  // from day one would make the state pension worthless to a perpetual plan -
  // the same conflation as tying the pension setting to the portfolio's job.
  // Keyed off whether permanent income actually arrives, not off which option is
  // selected: believing the state pension at 0% means none arrives, so the floor
  // binds from the start exactly as it does when the pension is not counted.
  const permanentIncomeFrom = () => countState && stateShare > 0
    ? Math.max(...people.map((p) => p.statePensionYear)) : -Infinity;
  const floorIn = (perpetualFloor, year, fiYear, y) => {
    if (!perpetualFloor) return 0;
    if (year < permanentIncomeFrom()) return 0;
    if (g >= a.swr) return Infinity;
    const spend = (perpetual + ongoingHealthAnnual) * (1 + g) ** Math.max(0, year - fiYear);
    const permanent = countState ? pensionBreakdownIn(year, y).state : 0;
    // Spending grows at g in real terms; the indexed pension is flat in real
    // terms. Capitalise the two streams separately instead of pretending the
    // pension grows at the household's lifestyle-growth rate.
    return Math.max(0, spend / (a.swr - g) - permanent / a.swr);
  };

  // One walk answers both questions. The pension settings feed it identically
  // either way, which is why counting no pension and believing a pension at 0%
  // now describe the same plan - they mean the same thing, so they must.
  const lastsFrom = (portfolioAtStop, y, perpetualFloor, suppliedBalances = null) => {
    if (!Number.isFinite(portfolioAtStop) || portfolioAtStop < 0) return false;
    let balances = suppliedBalances ? suppliedBalances.map((b) => ({ ...b }))
      : retirementBalances(portfolioAtStop, y);
    const fiYear = currentYear + y;
    if (balances.some((b) => b.cash < -1e-6 || b.invested < -1e-6)) return false;
    const opening = openingWithLumps(balances, y);
    if (fiYear >= planEndYear || reserveCash(opening, retirementReserve) > 1e-6) return false;
    // Checked on day one as well as every year after: a portfolio that only
    // clears the floor once it has grown was never perpetual-safe to begin with.
    if (portfolioTotal(opening) - retirementReserve < floorIn(perpetualFloor, Math.floor(fiYear), fiYear, y) - 1e-6) return false;
    for (let year = Math.floor(fiYear); year < planEndYear; year++) {
      const investedFor = year + 1 - Math.max(year, fiYear);
      const step = retirementYear(balances, Math.max(0, needIn(year, fiYear) - pensionIncomeIn(year, y)), year, y);
      if (step.shortfall > 1e-6) return false;
      balances = step.balances;
      if (portfolioTotal(balances) - retirementReserve < floorIn(perpetualFloor, year + 1, fiYear, y) - 1e-6) return false;
    }
    return true;
  };

  const solveFor = (perpetualFloor) => {
    const ok = (y) => (!purchase || y >= houseYears) &&
      houseFundingShortfall <= 0 &&
      lastsFrom(project(totalStart, annualSaving, y), y, perpetualFloor);
    if (ok(0)) return 0;
    const horizon = Math.min(100, planEndYear - currentYear - 1e-6);
    if (depleting || horizon <= 0 || !ok(horizon)) return Infinity;
    let lo = 0, hi = horizon;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (ok(mid)) hi = mid; else lo = mid;
    }
    return hi;
  };

  const perpetualMode = (a.portfolioEnd || 'perpetual') === 'perpetual';
  const lastsIfStoppingAt = (y) =>
    lastsFrom(project(totalStart, annualSaving, y), y, perpetualMode);

  const setEarlyPension = (p, earlyYears) => {
      p.statePensionEarlyYears = earlyYears;
      p.statePensionYear = p.statePensionStandardYear - p.statePensionEarlyYears;
      p.statePensionAdjustment =
        RATES.pillar1.flexibleAdjustment[String(-p.statePensionEarlyYears)] ?? 0;
      if (drawAtStatePensionAge) {
        p.pillar2DrawYear = p.statePensionYear;
        p.pillar2DrawAge = p.pillar2DrawYear - p.birthYear;
        if (p.pillar3LegalYear != null) {
          p.pillar3DrawYear = Math.max(p.pillar3LegalYear, p.statePensionYear);
        }
        p.pillarDrawYear = Math.max(
          p.pillar2DrawYear, p.pillar3DrawYear ?? p.pillar2DrawYear);
        p.pillarDrawAge = p.pillarDrawYear - p.birthYear;
        p.pillarIncomeEndYear = p.payoutYears != null
          ? Math.max(p.pillar2DrawYear + p.payoutYears,
              (p.pillar3DrawYear ?? p.pillar2DrawYear) + p.payoutYears)
          : p.pillarDrawYear;
        p.pillarIncomeEndAge = Number.isFinite(p.pillarIncomeEndYear)
          ? p.pillarIncomeEndYear - p.birthYear : Infinity;
      }
  };
  const earlyAllowedAt = (p, yearsToStop) => {
    if (!p.serviceYearsKnown) return 0;
    // Contributions after the proposed pension start cannot establish the
    // right to draw that pension earlier.
    for (let early = earlyRequested; early > 0; early--) {
      const workingYears = Math.max(0, Math.min(
        Number.isFinite(yearsToStop) ? yearsToStop : 0,
        p.statePensionStandardYear - early - currentYear));
      const service = p.yearsWorkedSoFar + workingYears * p.estimatedServicePerYear;
      if (earlyAllowedFor(service) >= early) return early;
    }
    return 0;
  };
  if (earlyRequested > 0) {
    const provisional = solveFor(perpetualMode);
    for (const p of people) setEarlyPension(p, earlyAllowedAt(p, provisional));
  }

  // A provisional date may permit an early pension that moves FI back across
  // its own service threshold. Re-solve after downgrading unsupported choices.
  // Never upgrade within this loop: discrete choices then strictly decrease,
  // so it terminates in at most five downgrades per person, without oscillation.
  // Both displayed horizons share these dates, so validate against the earlier
  // finite stop date. This is conservative, not a global pension-date optimizer.
  let yearsToFiPerpetual, yearsToFiBridged;
  while (true) {
    yearsToFiPerpetual = solveFor(true);
    yearsToFiBridged = solveFor(false);
    const earliest = Math.min(yearsToFiPerpetual, yearsToFiBridged);
    let changed = false;
    for (const p of people) {
      const allowed = earlyAllowedAt(p, earliest);
      if (allowed < p.statePensionEarlyYears) {
        setEarlyPension(p, allowed);
        changed = true;
      }
    }
    if (!changed) break;
  }
  const bridging = !perpetualMode;
  // Working past the earliest date buys margin, and buys more of it than the
  // extra savings alone suggest: the portfolio compounds for longer, one year of
  // withdrawals never happens, and pension contributions carry on.
  const bufferYears = Math.max(0, a.bufferYears || 0);
  const yearsToFiSolved = perpetualMode ? yearsToFiPerpetual : yearsToFiBridged;
  const bufferedDate = yearsToFiSolved + bufferYears;
  const yearsToFi = Number.isFinite(bufferedDate) && bufferedDate < planEndYear - currentYear &&
    (!bufferYears || lastsIfStoppingAt(bufferedDate)) ? bufferedDate : Infinity;

  // The smallest portfolio that survives from a given stop date. For a date the
  // solver had to search for, this is just what the portfolio will be worth then
  // - it was found by making that amount only barely enough. It differs when FI
  // is already reached, where projecting forward reports what you happen to hold
  // rather than what the plan needs, and those are not the same claim.
  const requiredAt = (y, perpetualFloor) => {
    if (!Number.isFinite(y)) return Infinity;
    const have = project(totalStart, annualSaving, y);
    if (!lastsFrom(have, y, perpetualFloor)) return Infinity;
    if (lastsFrom(0, y, perpetualFloor)) return 0;
    let lo = 0, hi = have;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (lastsFrom(mid, y, perpetualFloor)) hi = mid; else lo = mid;
    }
    return hi;
  };
  const fiNumber = requiredAt(yearsToFiPerpetual, true);
  // Under bridging the "number" is whatever the portfolio has to be on the day
  // work stops, which is not spending/SWR - it is smaller, because it is allowed
  // to run down.
  // Two different quantities, and they are not interchangeable:
  //   fiNumber  - the least the portfolio must be worth. What "you need this
  //               much" honestly means.
  //   fiTarget  - what it will actually be worth on that date. Slightly more,
  //               because the plan is walked in whole years and you cannot stop
  //               in the middle of one.
  // Ownership and the schedule follow the money you will really have; the
  // headline follows the requirement.
  const fiTarget = Number.isFinite(yearsToFi)
    ? project(totalStart, annualSaving, yearsToFi)
    : Infinity;

  const mortgageAtFi = mort && Number.isFinite(yearsToFi)
    ? mort.balanceAfter(Math.max(0, yearsToFi - houseYears)) /
      (1 + inflation) ** Math.max(0, yearsToFi - houseYears) : 0;

  // CoastFIRE: stop adding to the portfolio, keep working, and let compounding
  // finish the job by `targetAge`. Under bridging "finished" means the pot
  // survives to the end of the plan rather than reaching a fixed number.
  const coastAt = (targetAge) => {
    for (let y = 0; y <= 60; y += 0.25) {
      const age = ageNow + y;
      if (age >= targetAge) return null;
      if (purchase && y < houseYears) continue; // house funding is not yet complete
      const balances = balancesAt(y);
      if (balances.shortfall > 1e-6) continue;
      const pf = portfolioTotal(balances);
      for (const b of balances) {
        b.cash *= (1 + (a.cashRealReturn ?? 0)) ** (targetAge - age);
        b.invested *= (1 + a.realReturn) ** (targetAge - age);
      }
      const enough = lastsFrom(portfolioTotal(balances), targetAge - ageNow, perpetualMode, balances);
      if (enough) return { years: y, age, portfolio: pf };
    }
    return null;
  };

  // ---- how much shock this absorbs ----------------------------------------
  // A deterministic stress test, which is the whole point of it: no historical
  // series, no overlapping windows, no US-data-for-a-European compromise. Just
  // "how bad an opening can this plan take before it fails", which is arithmetic
  // and answerable exactly.
  //
  // The withdrawals are the ones the schedule already computed - spending and
  // pension income do not change because markets did - so only the returns move.
  const resilience = () => {
    if (!Number.isFinite(yearsToFi)) return null;
    const draws = [], durations = [];
    for (let year = Math.floor(currentYear + yearsToFi); year < planEndYear; year++) {
      draws.push(Math.max(0, needIn(year, currentYear + yearsToFi) -
        pensionIncomeIn(year, yearsToFi)));
      durations.push(year + 1 - Math.max(year, currentYear + yearsToFi));
    }
    if (!draws.length) return null;
    const survives = (badYears, badReturn, crash = 0) => {
      let balances = retirementBalances(fiTarget, yearsToFi);
      for (const b of balances) b.invested *= 1 - crash;
      const fiYear = currentYear + yearsToFi;
      if (portfolioTotal(openingWithLumps(balances, yearsToFi)) - retirementReserve < floorIn(perpetualMode, Math.floor(fiYear), fiYear, yearsToFi) - 1e-6) {
        return false;
      }
      for (let i = 0; i < draws.length; i++) {
        const step = retirementYear(balances, draws[i], Math.floor(fiYear) + i, yearsToFi,
          i < badYears ? badReturn : a.realReturn);
        if (step.shortfall > 1e-6) return false;
        balances = step.balances;
        const year = Math.floor(fiYear) + i + 1;
        if (portfolioTotal(balances) - retirementReserve < floorIn(perpetualMode, year, fiYear, yearsToFi) - 1e-6) return false;
      }
      return true;
    };
    // Saturation has to be reported as saturation. Counting up to the length of
    // the schedule and returning that number makes a plan that survives
    // everything look WORSE as it improves, because a later start date leaves
    // fewer years to count.
    const countBad = (rate) => {
      let n = 0;
      while (n <= draws.length && survives(n, rate)) n++;
      const years = n - 1;
      return { years: Math.min(years, draws.length), all: years >= draws.length };
    };
    // Largest immediate fall it still recovers from.
    let lo = 0, hi = 0.95;
    if (survives(0, a.realReturn, 0)) {
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (survives(0, a.realReturn, mid)) lo = mid; else hi = mid;
      }
    }
    const flat = countBad(0), bear = countBad(-0.10);
    return {
      flatYears: flat.years, flatAll: flat.all,
      bearYears: bear.years, bearAll: bear.all,
      crash: lo, horizonYears: draws.length,
    };
  };

  // ---- what the haircut buys ----------------------------------------------
  // Believing a pension at less than 100% forces a larger portfolio, and that
  // extra IS the safety margin. Replay the same plan with the pensions paying in
  // full: whatever is left at the end is what the caution cost, expressed as
  // what you would have if it turns out to have been unnecessary.
  let haircutBuffer = null;
  if (Number.isFinite(yearsToFi) && (countPots || countState) &&
      (potsShare < 1 || stateShare < 1)) {
    let balances = retirementBalances(fiTarget, yearsToFi);
    for (let year = Math.floor(currentYear + yearsToFi); year < planEndYear; year++) {
      let income = 0;
      for (const p of people) {
        if (countPots && year < p.pillarIncomeEndYear) {
          // The same income, un-haircut.
          income += potIncomeIn(p, year, yearsToFi) / (potsShare || 1);
        }
        if (countState && year >= p.statePensionYear) {
          // Computed here rather than read off the person: the per-person pass
          // has not run yet, and depending on that ordering is how a silent NaN
          // gets into a headline figure.
          const gross = 12 * stateMonthlyFor(p, yearsToFi) *
            (1 + p.statePensionAdjustment);
          income += statePensionNet(gross, {
            pensionAge: year >= p.statePensionStandardYear,
          }).net;
        }
      }
      const investedFor = year + 1 - Math.max(year, currentYear + yearsToFi);
      balances = retirementYear(balances, Math.max(0, needIn(year, currentYear + yearsToFi) - income),
        year, yearsToFi, a.realReturn, 1).balances;
    }
    haircutBuffer = Math.max(0, portfolioTotal(balances));
  }

  // ---- year-by-year drawdown ----------------------------------------------
  // The solver walks these years to find the FI date; this replays that walk and
  // keeps the working, so it can be read rather than trusted. Same arithmetic,
  // same order - if it ever disagrees with `lastsFrom` one of them is wrong.
  const schedule = [];
  if (Number.isFinite(yearsToFi)) {
    let balances = retirementBalances(fiTarget, yearsToFi);
    for (let year = Math.floor(currentYear + yearsToFi); year < planEndYear; year++) {
      const health = healthCostBetween(
        Math.max(year, currentYear + yearsToFi), year + 1);
      const need = needIn(year, currentYear + yearsToFi);
      const income = pensionBreakdownIn(year, yearsToFi);
      const fromPortfolio = Math.max(0, need - income.total);
      const opening = portfolioTotal(balances);
      const openingCash = bucketTotal(balances, 'cash');
      const openingInvestments = bucketTotal(balances, 'invested');
      const investedFor = year + 1 - Math.max(year, currentYear + yearsToFi);
      const step = retirementYear(balances, fromPortfolio, year, yearsToFi);
      balances = step.balances;
      schedule.push({
        year,
        ages: people.map((p) => p.ageNow + (year - currentYear)),
        need, health,
        lumpGross: step.lumpGross, lumpTax: step.lumpTax, lumpNet: step.lumpNet,
        fromPots: income.pots,
        fromState: income.state,
        fromPortfolio,
        // Pension income beyond what is needed is not reinvested - conservative,
        // and it keeps the portfolio line meaning "what the portfolio provides".
        unusedPension: Math.max(0, income.total - need),
        opening, closing: portfolioTotal(balances), investedFor,
        openingCash, openingInvestments, cash: bucketTotal(balances, 'cash'),
        investments: bucketTotal(balances, 'invested'), protectedReserve: retirementReserve,
        fromCash: step.fromCash, fromInvestments: step.fromInvestments,
        cashGrowth: step.cashGrowth, investmentGrowth: step.investmentGrowth,
        shortfall: step.shortfall,
      });
    }
  }

  // ---- per person (ownership of the shared pot) ---------------------------
  for (const p of people) {
    p.annualSaving = annualSaving * p.share;
    // What this person will own at the household FI date. The split decides
    // ownership of the pot, not who needs how much.
    p.portfolioAtFi = null;
    // There is one FI *date* for the household; people reach it at whatever
    // age they happen to be.
    p.ageAtFi = p.ageNow + yearsToFi;

    p.pensionAtUnlock = potAtUnlock(p, yearsToFi);
    p.pillar2AtDraw = potAtDraw(p, yearsToFi, 'pillar2');
    p.pillar3AtDraw = potAtDraw(p, yearsToFi, 'pillar3');
    // What the pots and the state pension are each worth as annual income, on
    // the assumptions above. Reported whatever the policy, so the cost of
    // ignoring them stays visible.
    // The first year's payment. It does not stay there: see potIncomeIn.
    p.pensionIncome = !lumpSum && p.pensionTermsKnown
      ? ((potAtDraw(p, yearsToFi, 'pillar2') + potAtDraw(p, yearsToFi, 'pillar3')) /
              p.payoutYears) * potsShare
      : 0;
    p.pensionIncomeFinal = Number.isFinite(yearsToFi)
      ? potIncomeIn(p, Math.min(planEndYear - 1,
          Number.isFinite(p.pillarIncomeEndYear) ? p.pillarIncomeEndYear - 1 : planEndYear - 1),
        yearsToFi)
      : p.pensionIncome;
    p.yearsWorkedAtFi = p.serviceYearsKnown
      ? p.yearsWorkedSoFar + (Number.isFinite(yearsToFi) ? yearsToFi : 0) * p.estimatedServicePerYear
      : null;
    p.statePensionGross = 12 * stateMonthlyFor(
      p, Number.isFinite(yearsToFi) ? yearsToFi : 0) *
      (1 + p.statePensionAdjustment);
    const stateNet = statePensionNet(p.statePensionGross, {
      pensionAge: p.statePensionYear >= p.statePensionStandardYear,
    });
    p.statePensionTax = stateNet.tax;
    p.statePensionIncome = stateNet.net * stateShare;
    // The same career run to the state pension age instead of stopping at FI -
    // the difference is what retiring early costs in state pension.
    p.statePensionIfWorkedOn = statePensionNet(12 * stateMonthlyFor(
      p, Math.max(0, p.statePensionYear - currentYear)), {
      pensionAge: p.statePensionYear >= p.statePensionStandardYear,
    }).net * stateShare;
  }
  if (Number.isFinite(yearsToFi)) {
    const owned = ownershipAt(yearsToFi);
    people.forEach((p, i) => { p.portfolioAtFi = owned[i]; });
  }
  const accumulation = [];
  if (Number.isFinite(yearsToFi)) {
    const lastMonth = Math.ceil(yearsToFi * 12);
    for (let month = 0; month <= lastMonth; month += 3) {
      const years = Math.min(yearsToFi, month / 12);
      const perPerson = ownershipAt(years);
      accumulation.push({
        years, perPerson, total: perPerson.reduce((x, v) => x + v, 0),
      });
    }
    if (!accumulation.length || accumulation[accumulation.length - 1].years < yearsToFi) {
      const perPerson = ownershipAt(yearsToFi);
      accumulation.push({ years: yearsToFi, perPerson,
        total: perPerson.reduce((x, v) => x + v, 0) });
    }
  }

  return {
    assumptions: a,
    currentYear,
    income: { householdNetIncome, rentalNet, perPerson: people.map((p) => p.netAnnual) },
    spending: {
      now: spendNow, afterMove: spendAfterMove, perpetual,
      // Separate the dated premium budget from permanently unconfirmed cover.
      ongoingHealthAnnual,
      healthAtFi: Number.isFinite(yearsToFi) ? people.filter((p) =>
        healthEndFor(p) > currentYear + yearsToFi).length * healthPerPerson : 0,
      healthUntilYear: Math.max(currentYear, ...people.map((p) =>
        Math.min(healthEndFor(p), planEndYear))),
      healthBridgeCost: Number.isFinite(yearsToFi) ? healthBridgeAt(yearsToFi) : 0,
      healthYears: Number.isFinite(yearsToFi)
        ? Math.max(0, Math.max(currentYear, ...people.map((p) =>
            Math.min(healthEndFor(p), planEndYear))) - (currentYear + yearsToFi))
        : 0,
    },
    savings: {
      surplusNow, surplusAfterMove,
      pillar3NetCost, lifeInsuranceCost, healthInsuranceCost,
      rateNow: householdNetIncome > 0 ? surplusNow / householdNetIncome : 0,
      rateAfterMove: householdNetIncome > 0 ? surplusAfterMove / householdNetIncome : 0,
    },
    fi: {
      retirementCashReserve: retirementReserve,
      perpetualSpending: perpetual + ongoingHealthAnnual,
      // Under bridging the number is what the portfolio must be on the day work
      // stops - smaller than spending/SWR, because it is allowed to run down
      // once the pensions arrive.
      number: requiredAt(yearsToFi, perpetualMode),
      atFiDate: fiTarget,
      perpetualNumber: fiNumber,
      spendingGrowth: g,
      numberAt4pct: (perpetual + ongoingHealthAnnual) / 0.04 + retirementReserve,
      // Two different questions that a single flag used to answer badly.
      // `bridging` is about the PORTFOLIO: is it allowed to run down. Whether
      // any pension is actually in play is separate, and is what every pension
      // display should be gated on.
      bridging,
      countsPots: countPots && potsShare > 0,
      countsState: countState && stateShare > 0,
      countsPension: (countPots && potsShare > 0) || (countState && stateShare > 0),
      policy,
      pillarDrawAge: a.pillarDrawAge || 'unlock',
      pillarPayout: a.pillarPayout,
      lumpSums: lumpEvents(yearsToFi),
      bufferYears,
      yearsSolved: yearsToFiSolved,
      resilience: resilience(),
      statePensionEarlyRequested: earlyRequested,
      statePensionEarlyAllowed: Math.max(0, ...people.map((x) => x.statePensionEarlyYears)),
      inflation, potsShare, stateShare, haircutBuffer,
      // When the pots stop paying, if they do. The years after this are back on
      // the portfolio alone, plus the state pension if it is being counted.
      pillarIncomeEndsYear: Math.max(...people.map((p) => p.pillarIncomeEndYear)),
      pillarIncomeEndsAge: Math.max(...people.map((p) => p.pillarIncomeEndAge)),
      // Both answers, always, so the cost of the choice is legible.
      yearsPerpetual: yearsToFiPerpetual,
      yearsBridged: yearsToFiBridged,
      pensionIncomeAtUnlock: people.reduce(
        (x, p) => x + (countPots ? p.pensionIncome : 0) +
                     (countState ? p.statePensionIncome : 0), 0),
      ownershipAtFi: people.map((p) => ({
        name: p.name, share: p.share, portfolio: p.portfolioAtFi, ageAtFi: p.ageAtFi,
      })),
    },
    portfolio: {
      start: totalStart,
      excluded: people.reduce((x, p) => x + p.excluded, 0),
      // Split out, because they are excluded for different reasons and belong
      // in different places: pension balances have a section of their own, and
      // crypto is simply left out of the plan.
      pensionBalances: people.reduce(
        (x, p) => x + (p.assets?.pillar2 || 0) + (p.assets?.pillar3 || 0), 0),
      cryptoExcluded: countCrypto ? 0 : people.reduce((x, p) => x + (p.assets?.crypto || 0), 0),
      investmentTaxReserve: people.reduce((x, p) => x + p.investmentTaxReserve, 0),
      brokerageTaxReserve: people.reduce((x, p) => x + p.brokerageTaxReserve, 0),
      cryptoTaxReserve: people.reduce((x, p) => x + p.cryptoTaxReserve, 0),
      // What the excluded pension money is likely to be worth once it unlocks.
      // Balances compound to each person's own unlock date; Pillar II keeps
      // receiving contributions (own rate plus the state's 4%) until FI, then
      // stops. Crypto is deliberately left flat - projecting it would be
      // inventing a return.
      pensionAtUnlock: people.reduce((x, p) => x + p.pensionAtUnlock, 0),
      perPerson: people.map((p) => ({
        name: p.name,
        pensionNow: (p.assets?.pillar2 || 0) + (p.assets?.pillar3 || 0),
        pensionAtUnlock: p.pensionAtUnlock,
        pensionIncome: p.pensionIncome,
        unlockAge: p.pension.pillarUnlockAge,
        unlockYear: p.pensionUnlockYear,
        pensionAgeConfirmed: p.pension.confirmed,
        pensionAgeRange: p.pension.estimateRange,
        drawAge: p.pillarDrawAge,
        statePensionEarlyYears: p.statePensionEarlyYears,
        pillar1UnitsSoFar: p.pillar1UnitsSoFar,
        pillar1UnitsKnown: p.pillar1UnitsKnown,
        statePensionAdjustment: p.statePensionAdjustment,
        drawYear: p.pillarDrawYear,
        pillar2DrawYear: p.pillar2DrawYear,
        pillar3DrawYear: p.pillar3DrawYear,
        pillar3EligibilityKnown: p.pillar3EligibilityKnown,
        deferred: drawAtStatePensionAge,
        payoutYears: p.payoutYears,
        pensionTermsKnown: p.pensionTermsKnown,
        incomeEndYear: p.pillarIncomeEndYear,
        incomeEndAge: p.pillarIncomeEndAge,
        crypto: p.assets?.crypto || 0,
      })),
    },
    schedule,
    house: purchase
      ? { ...mort,
          cashToComplete: cashForHouse, totalReserve: reserve,
          completionYear: purchaseYear,
          mortgageEndYear,
          fundsAtCompletion: projectedAtHouse,
          fundingShortfall: houseFundingShortfall,
          feasible: houseFundingShortfall <= 0,
          // The parts, so the total can be checked rather than trusted.
          deposit: Math.min(purchase.price, purchase.deposit),
          transactionCosts, emergencyFund,
          movingCosts: purchase.movingCosts || 0,
          transactionCostRate: a.transactionCostRate,
          emergencyFundMonths: a.emergencyFundMonths,
          // No income and a mortgage is not "unknown", it is unaffordable.
          // 0/0 would render as "DSTI NaN%" on a page someone is reading.
          dsti: householdNetIncome > 0
            ? (mort.stressedMonthly + (purchase.otherDebtMonthly || 0)) /
              (householdNetIncome / 12)
            : (mort.stressedMonthly > 0 ? Infinity : 0) }
      : null,
    timeline: {
      ageNow,
      yearsToFi, fiAge: ageNow + yearsToFi, fiYear: currentYear + yearsToFi,
      agesAtFi: people.map((p) => ({ name: p.name, age: p.ageNow + yearsToFi })),
      mortgageBalanceAtFi: mortgageAtFi,
      coastToPensionUnlock: depleting ? null : coastAt(ages.pillarUnlockAge),
      coastTo60: depleting ? null : coastAt(60),
      depleting,
      pension: ages,
      accumulation,
      bridgeYears: Math.max(0,
        Math.max(...people.map((p) => p.pillarDrawYear)) - (currentYear + yearsToFi)),
      pensionPerPerson: people.map((p) => ({
        name: p.name, unlockAge: p.pension.pillarUnlockAge, unlockYear: p.pensionUnlockYear,
      })),
    },
    persons: people,
  };
}
