// Cross-checks against arithmetic computed OUTSIDE the engine.
//
// Every other suite compares the model to itself: invariants check that its
// figures agree with each other, monotonicity that they move the right way,
// round-trips that they survive storage. All of them would pass on a model that
// is consistently and confidently wrong.
//
// These do not. Each case sets up a scenario simple enough to have a textbook
// closed-form answer, computes that answer here with a formula written from
// scratch, and compares. The engine reaches its numbers by walking year by year
// and bisecting; the formulas below are algebra. Two different routes to the
// same figure is the only evidence that either is right.
//
// Where a case has no closed form, it is traced by hand instead - literal
// numbers, one line per year, as you would check it on paper.

import { simulate, netFromGross, mortgage, pillar1Monthly, pillarProjection } from '../src/calc.js';
import { sanitise } from '../src/state.js';
import { RATES } from '../src/rates.js';

let checks = 0;
const failures = [];
const fmt = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : String(v));
const near = (got, want, tol, label) => {
  checks++;
  if (!(Math.abs(got - want) <= tol)) {
    failures.push(`${label}: engine ${fmt(got).toLocaleString()} vs independent ` +
                  `${fmt(want).toLocaleString()} (tolerance ${tol})`);
  }
};

// --- a household with every complication switched off ------------------------
//
// Confirmed health cover, so no health contract is charged.
// No children, no house, no pensions counted, no spending growth.
// What is left is the bare FIRE arithmetic, which has exact answers.

const PLAIN = (over = {}, assumptions = {}) => sanitise({
  version: 1, currentYear: 2026, excludeCrypto: true,
  household: {
    hasDependents: false,
    spending: { housing: 500, childCosts: 0, other: 1500, buffer: 0 },
    rentalIncomeNetMonthly: 0, property: null,
    ...over,
  },
  persons: [{
    name: 'Person1', birthYear: 1990, healthCoveredAfterFi: true,
    income: { grossMonthly: 5000, netMonthly: 4000, otherNetMonthly: 0 },
    // Textbook return formulas use the after-tax ordinary bucket; explicit
    // investment-account taxes are reconciled in tax-integration.mjs.
    investmentDestination: 'brokerage',
    assets: { cash: 0, brokerage: 100000, brokerageCostBasis: 100000,
              pillar2: 0, pillar3: 0, crypto: 0 },
    pillar2Rate: 0.02, pillar3Annual: 0, allocationShare: 1,
    pillar1Units: 20, yearsWorkedEstonia: 20, yearsWorkedEuEea: 0,
    pillar3FirstContributionYear: 2020, annuityMonthlyQuote: 500, fundPensionYears: 20,
  }],
  assumptions: {
    realReturn: 0.05, swr: 0.035, pensionPolicy: 'ignore', portfolioEnd: 'perpetual',
    spendingGrowth: 0, inflation: 0.025, planToAge: 100,
    ...assumptions,
  },
});

// 1. The perpetual number is spending divided by the withdrawal rate. This is
//    the oldest result in the field - the "25x your spending" rule is the same
//    statement at 4%.
{
  const r = simulate(PLAIN());
  const annualSpend = 12 * (500 + 1500);          // housing + other, by hand
  near(r.spending.perpetual, annualSpend, 0.01, 'perpetual spending is the sum of its parts');
  near(r.fi.number, annualSpend / 0.035, 1, 'perpetual target is spending / SWR');
  // And the familiar form of the same thing.
  const at4 = simulate(PLAIN({}, { swr: 0.04 }));
  near(at4.fi.number, annualSpend * 25, 1, 'at 4% the target is 25x spending');
}

// 2. Time to reach a target, from the future value of an annuity.
//
//      T = S(1+r)^n + A((1+r)^n - 1)/r
//    solved for n:
//      n = ln((T + A/r) / (S + A/r)) / ln(1+r)
//
//    The engine gets there by bisecting a year-by-year walk instead.
{
  const r = simulate(PLAIN());
  const S = r.portfolio.start;                    // starting portfolio
  const A = r.savings.surplusAfterMove;           // saved per year
  const T = r.fi.number;
  const rate = 0.05;
  const n = Math.log((T + A / rate) / (S + A / rate)) / Math.log(1 + rate);
  near(r.timeline.yearsToFi, n, 0.02, 'years to FI matches the annuity formula');
}

// 3. How long a pot lasts while being drawn down, in reverse.
//
//    The engine draws at the start of each year and grows what is left:
//      P(k+1) = (P(k) - W)(1+r)
//    After N years that is
//      P(N) = P(1+r)^N - W(1+r)((1+r)^N - 1)/r
//    Setting P(N) = 0 gives the smallest pot that lasts exactly N years:
//      P = W(1+r)((1+r)^N - 1) / (r (1+r)^N)
//
//    In drawdown mode with no pension, that is precisely what is solved for.
{
  const r = simulate(PLAIN({}, { portfolioEnd: 'drawdown' }));
  const W = r.spending.perpetual;
  const rate = 0.05;
  const N = Math.round(100 - r.persons[0].ageNow - r.timeline.yearsToFi);
  const growth = (1 + rate) ** N;
  const P = (W * (1 + rate) * (growth - 1)) / (rate * growth);
  near(r.fi.number, P, Math.max(500, P * 0.01),
       'drawdown requirement matches the annuity-exhaustion formula');
  checks++;
  if (!(r.fi.atFiDate >= r.fi.number - 1)) {
    failures.push('what is held on the day fell below what the plan requires');
  }
  // A pot drawn down must be smaller than one that has to last forever.
  const forever = simulate(PLAIN()).fi.number;
  checks++;
  if (!(r.fi.number < forever)) {
    failures.push('a pot that may run out was not cheaper than one that may not');
  }
}

// 4. A drawdown traced by hand. Five years, literal arithmetic, no formula -
//    the arithmetic anyone would do on paper to check the schedule.
{
  const r = simulate(PLAIN({}, { portfolioEnd: 'drawdown' }));
  const rows = r.schedule;
  const W = 24000;                                // 12 x (500 + 1500)
  let pf = r.fi.atFiDate;
  for (let i = 0; i < 5 && i < rows.length; i++) {
    const draw = W * rows[i].investedFor;
    near(rows[i].need, draw, 0.01, `year ${i + 1} prorates the annual draw`);
    near(rows[i].fromPortfolio, draw, 0.01, `year ${i + 1} takes the prorated draw from the portfolio`);
    near(rows[i].opening, pf, 1, `year ${i + 1} opens where the previous year closed`);
    pf = (pf - draw) * 1.05 ** rows[i].investedFor; // by hand
    near(rows[i].closing, pf, 1, `year ${i + 1} closes after the matching year fraction`);
  }
}

// 5. Spending that grows in real terms turns the perpetuity into a growing one,
//    worth spending / (swr - g) rather than spending / swr. Gordon's formula.
//
//    Found by mutation: flipping that minus to a plus survived the whole suite,
//    because every case above happened to run at zero growth.
for (const g of [0.005, 0.01, 0.02]) {
  const r = simulate(PLAIN({}, { spendingGrowth: g }));
  const annualSpend = 24_000;
  near(r.fi.number, annualSpend / (0.035 - g), 1,
       `perpetual target at ${g * 100}% real spending growth is spending / (swr - g)`);
}
// And growth at or above the withdrawal rate has no finite answer at all.
{
  const r = simulate(PLAIN({}, { spendingGrowth: 0.035 }));
  checks++;
  if (Number.isFinite(r.fi.number)) {
    failures.push('spending growing as fast as the withdrawal rate gave a finite target');
  }
}

// 6. The simulator's own pension projection, longhand.
//
//    Also found by mutation: the Pillar II check further down exercises
//    pillarProjection(), which is a different code path from the one simulate()
//    uses - so dropping the state's 4% inside simulate() went unnoticed.
{
  const plan = sanitise({
    version: 1, currentYear: 2026, excludeCrypto: true,
    household: {
      hasDependents: false,
      spending: { housing: 600, childCosts: 0, other: 900, buffer: 0 },
      rentalIncomeNetMonthly: 0, property: null,
    },
    persons: [{
      name: 'Person1', birthYear: 1982,
      income: { grossMonthly: 3000, netMonthly: 2400, otherNetMonthly: 0 },
      assets: { cash: 50000, investmentAccount: 0, pillar2: 20000, pillar3: 5000, crypto: 0 },
      pillar2Rate: 0.04, pillar3Annual: 0, allocationShare: 1,
      pillar1Units: 20, yearsWorkedEstonia: 20, pillar3FirstContributionYear: 2020,
      annuityMonthlyQuote: 500, fundPensionYears: 20,
    }],
    assumptions: {
      realReturn: 0.05, swr: 0.035, pensionPolicy: 'ownPots', portfolioEnd: 'drawdown',
      spendingGrowth: 0, inflation: 0.025, planToAge: 100, pillarDrawAge: 'unlock',
    },
  });
  const res = simulate(plan);
  const p = res.persons[0];
  const rate = 0.05;
  const yrs = p.pillar2DrawYear - 2026;                // Pillar II draw date
  const contributing = Math.min(res.timeline.yearsToFi, yrs);
  const idleYears = yrs - contributing;
  const share = 0.04 + 0.04;                            // own 4% + the state's fixed 4%
  const annual = 36_000 * share;
  // Existing balances compound the whole way; contributions run only while
  // working, then sit idle until the pot is taken.
  const p2Balance = 20_000 * (1 + rate) ** yrs;
  const p3Years = p.pillar3DrawYear - 2026;
  const p3Balance = 5_000 * (1 + rate) ** p3Years;
  const fv = annual * (((1 + rate) ** contributing - 1) / rate);
  const fromContributions = fv * (1 + rate) ** idleYears;
  near(p.pensionAtUnlock, p2Balance + p3Balance + fromContributions, 2,
       'the simulator\'s pot matches compound interest computed longhand');
  // The state's half of it, isolated - so omitting it cannot pass unnoticed.
  const ownOnly = 36_000 * 0.04 * (((1 + rate) ** contributing - 1) / rate) *
    (1 + rate) ** idleYears;
  near(fromContributions - ownOnly, ownOnly, 2,
       'the state contributes exactly as much as a 4% own rate does');
}

// 7. Income that arrives whether or not you work reduces what the portfolio has
//    to fund, euro for euro.
//
//    Found by mutation: dropping the rental term entirely survived everything
//    above, because every case ran with none.
for (const rentMonthly of [200, 750]) {
  const r = simulate(PLAIN({ rentalIncomeNetMonthly: rentMonthly }));
  const netOfRent = 24_000 - 12 * rentMonthly;
  near(r.spending.perpetual, netOfRent, 0.01,
       `${rentMonthly}/mo of rent comes off the permanent requirement`);
  near(r.fi.number, netOfRent / 0.035, 1,
       `and the target falls to (spending - rent) / SWR`);
}
// Rent that covers everything leaves nothing for the portfolio to fund.
{
  const r = simulate(PLAIN({ rentalIncomeNetMonthly: 2500 }));
  near(r.fi.number, 0, 1, 'rent above spending leaves a target of zero');
  near(r.timeline.yearsToFi, 0, 1e-9, 'and FI is reached immediately');
}

// 8. Cash needed on completion day, added up by hand from its parts.
{
  const price = 400_000, deposit = 90_000, moving = 12_000;
  const r = simulate(sanitise({
    version: 1, currentYear: 2026, excludeCrypto: true,
    household: {
      hasDependents: false,
      spending: { housing: 900, childCosts: 0, other: 1100, buffer: 200 },
      rentalIncomeNetMonthly: 0,
      property: { purchase: {
        price, deposit, termYears: 30, rate: 0.04,
        runningCostsMonthly: 300, movingCosts: moving, monthsAway: 12,
        paidBy: 'proportional',
      } },
    },
    persons: [{
      name: 'Person1', birthYear: 1985,
      income: { grossMonthly: 6000, netMonthly: 4600, otherNetMonthly: 0 },
      assets: { cash: 200000, investmentAccount: 0, pillar2: 0, pillar3: 0, crypto: 0 },
      pillar2Rate: 0.02, pillar3Annual: 0, allocationShare: 1,
    }],
    assumptions: { realReturn: 0.05, swr: 0.035, pensionPolicy: 'ignore', planToAge: 100 },
  }));
  const h = r.house;
  const fees = price * 0.02;                       // notary, state fee, valuation, bank
  const monthlySpendAfterMove = r.spending.afterMove / 12;
  const emergency = monthlySpendAfterMove * 6;
  near(h.transactionCosts, fees, 0.01, 'transaction costs are 2% of the price');
  near(h.emergencyFund, emergency, 0.01, 'the emergency fund is 6 months of post-move spending');
  near(h.cashToComplete, deposit + fees + moving, 0.01, 'cash to complete is deposit + fees + moving');
  near(h.totalReserve, deposit + fees + moving + emergency, 0.01,
       'and the reserve adds the emergency fund on top');
  // The parts shown on the page must add up to the total shown above them.
  near(h.deposit + h.transactionCosts + h.movingCosts + h.emergencyFund, h.totalReserve, 0.01,
       'the breakdown sums to the figure it sits under');
}

// 9. Against a published table nobody here wrote.
//
//    "The Shockingly Simple Math Behind Early Retirement" (Mr Money Mustache,
//    2012) is the most-cited table in the field: savings rate against working
//    years, assuming a 5% real return, a 4% withdrawal rate, starting from zero,
//    and the same spending before and after. None of that is country-specific -
//    it is the same arithmetic in Tallinn as in Colorado - so the engine has to
//    reproduce it. Half a year of tolerance because the table is rounded.
{
  const PUBLISHED = [
    [0.05, 66], [0.10, 51], [0.15, 43], [0.20, 37], [0.25, 32], [0.30, 28],
    [0.35, 25], [0.40, 22], [0.45, 19], [0.50, 17], [0.55, 14.5], [0.60, 12.5],
    [0.65, 10.5], [0.70, 8.5], [0.75, 7], [0.80, 5.5], [0.85, 4],
  ];
  const NET = 60_000;                              // any figure; only the ratio matters
  for (const [rate, publishedYears] of PUBLISHED) {
    const spendMonthly = (NET * (1 - rate)) / 12;
    const r = simulate(sanitise({
      version: 1, currentYear: 2026, excludeCrypto: true,
      household: {
        hasDependents: false,
        // Split arbitrarily across two lines; both are permanent.
        spending: { housing: spendMonthly / 2, childCosts: 0, other: spendMonthly / 2, buffer: 0 },
        rentalIncomeNetMonthly: 0, property: null,
      },
      persons: [{
        name: 'Person1', birthYear: 2000, healthCoveredAfterFi: true, // horizon includes the 66-year analytical case
        income: { grossMonthly: 20_000, netMonthly: NET / 12, otherNetMonthly: 0 },
        investmentDestination: 'brokerage',
        assets: { cash: 0, investmentAccount: 0, pillar2: 0, pillar3: 0, crypto: 0 },
        pillar2Rate: 0.02, pillar3Annual: 0, allocationShare: 1,
      }],
      assumptions: {
        realReturn: 0.05, swr: 0.04, pensionPolicy: 'ignore', portfolioEnd: 'perpetual',
        spendingGrowth: 0, inflation: 0.025, planToAge: 100,
      },
    }));
    near(r.timeline.yearsToFi, publishedYears, 0.6,
         `a ${rate * 100}% savings rate takes the published ${publishedYears} years`);
    // And the target is the published 25x, since the table assumes 4%.
    near(r.fi.number, NET * (1 - rate) * 25, 1,
         `and the target at a ${rate * 100}% savings rate is 25x spending`);
  }
}

// --- Estonian tax, from the statute rather than the model --------------------
//
// TuMS: taxable = gross - unemployment insurance - Pillar II - basic exemption,
// then 22% of what is left. Written out longhand here.

for (const gross of [9_600, 24_000, 60_000, 120_000]) {
  for (const p2 of [0.02, 0.06]) {
    const ui = gross * 0.016;
    const pillar2 = gross * p2;
    const exemption = 12 * 700;
    const taxable = Math.max(0, gross - ui - pillar2 - exemption);
    const tax = taxable * 0.22;
    const net = gross - ui - pillar2 - tax;
    const got = netFromGross(gross, { pillar2Rate: p2 });
    near(got.incomeTax, tax, 0.01, `income tax on ${gross} at ${p2 * 100}%`);
    near(got.net, net, 0.01, `net pay on ${gross} at ${p2 * 100}%`);
  }
}

// The exemption makes a low salary untaxed outright - a boundary worth pinning.
near(netFromGross(8_400).incomeTax, 0, 0.01, 'no tax at exactly the exemption');
near(netFromGross(8_400).net, 8_400 * (1 - 0.016 - 0.02), 0.01, 'and only the two deductions');

// --- confirmed against emta.ee / kalkulaator.ee ------------------------------
//
// Not derived here: these are the figures Estonia's own salary calculators
// return, checked by hand in August 2026. The block above proves the model
// follows the statute as written; this proves the statute was read correctly,
// which is a different claim and the one no amount of internal testing can make.
//
// If these ever fail, the tax model has drifted from the official answer and
// every figure on the site is wrong by the same proportion.
for (const [grossMonthly, pillar2Rate, netMonthly] of [
  [1500, 0.02, 1281.88],
  [1500, 0.06, 1235.08],
  [2500, 0.02, 2033.80],
  [2500, 0.06, 1955.80],
  [4000, 0.02, 3161.68],
  [4000, 0.06, 3036.88],
]) {
  const got = netFromGross(grossMonthly * 12, { pillar2Rate }).net / 12;
  near(got, netMonthly, 0.01,
       `net on ${grossMonthly}/mo at ${pillar2Rate * 100}% matches the official calculator`);
}

// --- the mortgage, from the standard amortisation formula --------------------

for (const [price, deposit, years, rate] of [
  [300_000, 60_000, 30, 0.04],
  [500_000, 125_000, 25, 0.035],
  [180_000, 30_000, 15, 0.05],
]) {
  const loan = price - deposit;
  const i = rate / 12, n = years * 12;
  // M = L i / (1 - (1+i)^-n)
  const monthly = (loan * i) / (1 - (1 + i) ** -n);
  const m = mortgage({ price, deposit, termYears: years, rate });
  near(m.monthly, monthly, 0.01, `monthly payment on ${loan} over ${years}y at ${rate * 100}%`);
  near(m.ltv, loan / price, 1e-9, `LTV on ${price}/${deposit}`);
  near(m.totalInterest, monthly * n - loan, 0.5, `total interest on ${loan}`);

  // Remaining balance after k payments, from the retrospective formula:
  //   B = L(1+i)^k - M((1+i)^k - 1)/i
  for (const after of [1, 5, years]) {
    const k = after * 12;
    const balance = loan * (1 + i) ** k - monthly * (((1 + i) ** k - 1) / i);
    near(m.balanceAfter(after), Math.max(0, balance), 1,
         `balance after ${after}y on ${loan}`);
  }
}

// --- Pillar I, against the published benchmark ------------------------------
//
// The government publishes one figure that pins the whole formula: the average
// old-age pension for a 44-year career. If any rate here is mistyped this fails.

const AVG = 12 * RATES.averageGrossWageMonthly;
near(pillar1Monthly({ grossAnnual: AVG, futureYears: 44, serviceYears: 44, inPillar2: false }),
     RATES.pillar1.averagePensionMonthly, 0.5,
     'Pillar I reproduces the published 44-year average');

// The coefficients worked through in the legislative memorandum itself:
//   "keskmise palgaga inimese uhendosak 50%*1+50%*1 = 1,
//    poole keskmise palgaga inimese uhendosak 50%*0,5+50%*1 = 0,75,
//    kahekordse keskmise palgaga inimese uhendosak 50%*2+50%*1 = 1,5"
for (const [multiple, coefficient] of [[0.5, 0.75], [1, 1.0], [2, 1.5], [3, 2.0]]) {
  near(pillar1Monthly({ grossAnnual: multiple * AVG, futureYears: 30, serviceYears: 30, inPillar2: false }),
       399.24 + 30 * coefficient * 10.477, 0.01,
       `${multiple}x the average wage earns ${coefficient} a year`);
}

// RPKS 13-1: a Pillar II member accrues at 0.8x, because 16% of gross reaches
// Pillar I rather than 20%. Both figures are worked examples in the research.
near(pillar1Monthly({ grossAnnual: AVG, futureYears: 40, serviceYears: 40, inPillar2: false }), 818.32, 0.01,
     '40 years at the average wage, outside Pillar II');
near(pillar1Monthly({ grossAnnual: AVG, futureYears: 40, serviceYears: 40, inPillar2: true }), 734.50, 0.01,
     'and inside Pillar II, which costs exactly 20% of the accrual');
// The reduction lands on the accrual only - the flat base is untouched.
{
  const outside = pillar1Monthly({ grossAnnual: AVG, futureYears: 40, serviceYears: 40, inPillar2: false });
  const inside = pillar1Monthly({ grossAnnual: AVG, futureYears: 40, serviceYears: 40, inPillar2: true });
  near((outside - 399.24) * 0.8, inside - 399.24, 0.01,
       'the 20% cut applies to the accrual, not to the base amount');
}

// --- drawing the state pension early ----------------------------------------
//
// Sotsiaalkindlustusamet's published multiplier forecast, and the service scale
// from RPKS 9-1(2). Both are quoted tables, not derivations.
{
  const adj = RATES.pillar1.flexibleAdjustment;
  for (const [years, expected] of [
    ['-5', -0.3067], ['-3', -0.1988], ['-1', -0.0717],
    ['1', 0.0793], ['3', 0.2701], ['5', 0.5157],
  ]) {
    near(adj[years], expected, 1e-9, `the published multiplier at ${years} years`);
  }
  // Deferring pays more than claiming early costs, at every matching year.
  for (const n of [1, 2, 3, 4, 5]) {
    checks++;
    if (!(adj[String(n)] > -adj[String(-n)])) {
      failures.push(`deferring ${n} years did not beat claiming ${n} years early`);
    }
  }
  // Five more years of service for each year earlier.
  const svc = RATES.pillar1.earlyDrawingServiceYears;
  for (let n = 1; n <= 5; n++) {
    near(svc[n], 15 + 5 * n, 0, `${n} years early needs ${15 + 5 * n} years of service`);
  }
}

// Synthetic accrued components exercise the same decimal-unit calculation as
// an imported pension record. The complementary values are deliberately
// constructed to total exactly 30; they do not describe any person.
{
  const syntheticAccruedUnits = 12.345 + 17.655;
  const expected = 399.24 + 10.477 * syntheticAccruedUnits;
  near(pillar1Monthly({ grossAnnual: 12 * RATES.averageGrossWageMonthly,
                        unitsSoFar: syntheticAccruedUnits, futureYears: 0, serviceYears: 30 }),
       expected, 0.01, 'synthetic accrued units reproduce the Pillar I formula');
  // Units alone drive it: the salary is irrelevant once they are known.
  for (const gross of [1000, 4000, 12000]) {
    near(pillar1Monthly({ grossAnnual: gross * 12, unitsSoFar: syntheticAccruedUnits,
                          futureYears: 0, serviceYears: 30 }),
         expected, 0.01, `accrued units ignore today's salary (at ${gross}/mo)`);
  }
}

// Why the official online calculator returns a much lower Pillar I than this
// engine, resolved. Driving sotsiaalkindlustusamet.ee's calculator for a person
// born 1990 on 2000 EUR/month, not in Pillar II, retiring 2058, returns 566.83.
// That is 15.996 accrued units - and 15.996 is 32 years (2026 to 2058) at
// EXACTLY 0.5 units a year.
//
// 0.5 is not an arbitrary number. It is (solidaarosak 1.000 + kindlustusosak 0)
// / 2: the tool credits the part of the coefficient that is guaranteed by
// working at all, and credits NOTHING for the wage-linked part, because nobody
// can know a person's future earnings against the national average.
//
// So it reports a floor, not a forecast - the same conservatism it applies to
// Pillar II, where it divides the balance by the payout years with no growth.
// This engine models the wage-linked half, so it is higher by construction. The
// two answers are different questions, and neither is arithmetically wrong.
{
  const theirs = 566.83;
  const yearsToRetirement = 32;
  const solidarityOnly = (RATES.pillar1.solidarityMax + 0) * RATES.pillar1.solidarityWeight;
  near(solidarityOnly, 0.5, 1e-9, 'solidaarosak alone is worth 0.5 units a year');
  near(RATES.pillar1.baseMonthly + yearsToRetirement * solidarityOnly * RATES.pillar1.yearRateMonthly,
       theirs, 0.05,
       'the official calculator is reproduced by crediting zero kindlustusosak');
  // And this engine must sit above that floor for anyone earning near the
  // average - if it ever drops to it, the wage-linked half has been lost.
  const ours = pillar1Monthly({ grossAnnual: 12 * RATES.averageGrossWageMonthly,
                                futureYears: yearsToRetirement, serviceYears: yearsToRetirement,
                                inPillar2: false });
  near(ours > theirs + 100 ? 1 : 0, 1, 0,
       `this engine sits well above the official floor (${ours.toFixed(2)} vs ${theirs})`);
}

// --- Pillar II, from compound interest longhand ------------------------------
//
// Contributions of (own + state) share of gross, paid annually, compounding to
// the unlock date. Future value of an ordinary annuity, plus the existing pot.

{
  const gross = 36_000, rate = 0.02, r = 0.05, birthYear = 1982, start = 20_000;
  const proj = pillarProjection({
    birthYear, grossMonthly: gross / 12, pillar2Rate: rate,
    realReturn: r, currentYear: 2026, startingPillar2: start,
  });
  const n = proj.yearsToUnlock;
  const annual = gross * (rate + 0.04);           // own share plus the state's 4%
  const fv = start * (1 + r) ** n + annual * (((1 + r) ** n - 1) / r);
  near(proj.pot2, fv, 1, 'Pillar II pot matches compound interest computed longhand');
}

// --- the withdrawal rate is doing what it claims -----------------------------
//
// A portfolio at exactly the perpetual target, earning more than it pays out,
// must grow. This is the assumption the whole perpetual mode rests on.

{
  const r = simulate(PLAIN());
  const spend = r.spending.perpetual;
  const pot = r.fi.number;
  const afterOneYear = (pot - spend) * 1.05;
  checks++;
  if (!(afterOneYear > pot)) {
    failures.push('a portfolio at the perpetual target shrank in its first year');
  }
  // And the withdrawal is exactly the stated share of it.
  near(spend / pot, 0.035, 1e-9, 'the first withdrawal is exactly the withdrawal rate');
}

console.log(`\n${checks} cross-checks against independently computed arithmetic`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  failures.slice(0, 15).forEach((f) => console.log('  ' + f));
  process.exit(1);
}
console.log('the engine agrees with the textbook formulas\n');
