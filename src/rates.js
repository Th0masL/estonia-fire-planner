// Estonian tax, social and pension rates.
//
// Everything the engine needs that a politician can change lives here, with the
// date it took effect. Estonia has moved income tax, VAT and the basic exemption
// three times in three years, so the annual update should be a five-minute edit
// of this file and nothing else.

export const RATES = {
  year: 2026,
  lastVerified: '2026-08',

  incomeTax: 0.22,                    // flat, from 2025-01-01
  vat: 0.24,                          // added to bank custody fees, see brokers
  basicExemptionMonthly: 700,         // universal from 2026-01-01, no income taper
  basicExemptionPensionAge: 776,

  unemploymentInsuranceEmployee: 0.016,
  socialTax: 0.33,
  socialTaxMinimumBaseMonthly: 886,   // -> EUR 292.38/mo minimum obligation
  minimumWageMonthly: 946,            // from 2026-04-01; solidarity-component threshold
  minimumAnnualWageForPension: 3 * 886 + 9 * 946, // 2026 Jan-Mar / Apr-Dec

  pillar2: {
    employeeRates: [0.02, 0.04, 0.06],  // own choice; 2% is the default
    stateRate: 0.04,                    // FIXED - does not scale with your choice
    rateChangeDeadline: '11-30',        // apply by 30 Nov, effective 1 Jan
    earlyExitTax: 0.22,                 // all-or-nothing, whole balance
    rejoinWaitYears: 10,
    payout: { annuity: 0, fundPensionRecommended: 0, lumpSum: 0.10 },
    // A pension contract pays a FIXED NOMINAL amount, set at signing from the
    // premium, your age and a guaranteed interest rate. There is no CPI or wage
    // link. The only route to an increase is "lisakasum", a share of the
    // insurer's technical profit - and Compensa's own terms §14.1 state it has
    // no obligation to pay it and you have no right to demand it. §14.4 lets a
    // rise below 5% be paid as a one-off instead of raised into the payment, so
    // small allocations never compound. Modelled as zero: an unenforceable
    // discretionary top-up is not something to plan on.
    annuityIndexed: false,
    annuityProfitShareGuaranteed: false,
    // The tax-free payout duration is remaining life expectancy at the age you
    // start, from Statistics Estonia, rounded to the nearest whole year and taken from
    // the life table of the year before last.
    //
    // Only the age-65 figure is confirmed: 19.3 years combined - 16.3 for men,
    // 21.4 for women. The spread is five years, so a household figure is a
    // simplification. Statistics Estonia publishes every age (OE045) but those
    // values are not to hand, and the curve flattens with age so interpolation
    // is unreliable; the decline below is an estimate and should be replaced
    // with the real table. Pensionikeskus's own calculator is authoritative.
    payoutYearsAtAge: 65,
    payoutYearsAtAnchor: 19.3,
    payoutYearsPerYearOfAge: 0.75,       // ESTIMATE - see above
    annuityYears: 19,                    // the anchor, rounded as the rules do

    // Only Compensa Life still writes these contracts, and an insurer may
    // refuse a balance too small to be worth administering. Two findings from
    // the 2026 research matter more than the count itself:
    annuityProviders: 1,
    // KindlTS §590 classes it as voluntary insurance, so no insurer is obliged
    // to offer one to anybody.
    annuityStatutoryObligation: false,
    // Sotsiaalkindlustusamet took over servicing contracts from insurers that
    // left, but writes no new ones. If the last seller stops, there is no
    // backstop for someone retiring after that.
    annuityStateFallbackForNewContracts: false,
  },

  pillar3: {
    maxAnnual: 6000,
    maxShareOfGross: 0.15,
    refundRate: 0.22,                   // capped by income tax actually paid
    transferableBetweenSpouses: false,  // TuMS 28-2(1-1) covers 25 & 26 only
    minHoldYears: 5,
    payout: { beforeUnlock: 0.22, lumpSumAfter: 0.10, lifetimeAnnuity: 0 },
  },

  // Pillar I, the state pension. RPKS §11(1): baasosa + staažiosak (pre-1999
  // service) + kindlustusosak (1999-2020) + ühendosa (2021 on), the last three
  // sharing one per-unit annual rate. Indexed each 1 April by 20% CPI growth
  // + 80% growth in the pension share of social tax receipts; the 2026 index
  // was 1.053.
  //
  // Self-check: the published average for a 44-year career is EUR 860.23, and
  // 399.24 + 44 x 10.477 = 860.23 exactly - so one year at the average wage is
  // worth a coefficient of 1.0, as the law intends.
  pillar1: {
    baseMonthly: 399.24,              // baasosa, flat, from 2026-04-01
    yearRateMonthly: 10.477,          // aastahinne, per unit of coefficient
    averagePensionMonthly: 860.23,    // the 44-year-service benchmark
    // RPKS 11-1, from 2021: uhendosa = (solidaarosak + kindlustusosak) / 2.
    //   kindlustusosak = your wage / the national average that year. Uncapped.
    //   solidaarosak   = 1.000 for a full year of social tax at or above the
    //                    minimum wage, and never more than that.
    // Hence the memorandum's own examples: half the average wage earns 0.75 a
    // year, the average earns 1.0, twice the average earns 1.5 - not 2.0,
    // because half the formula is frozen at the ceiling.
    solidarityWeight: 0.5,
    solidarityMax: 1.0,

    // RPKS 13-1(1): a Pillar II member has 16% of gross flowing into Pillar I
    // instead of 20%, because 4 points are diverted into their own fund. Both
    // halves of the uhendosa fall by that same 16/20, and a member's
    // solidaarosak is separately capped at 0.800 rather than 1.000 - so a
    // member accrues exactly 0.8x a non-member for identical earnings.
    //
    // This is the cost side of Pillar II, and it is not small: a 40-year average
    // earner gets EUR 818.32 outside it and EUR 734.50 inside. The diverted 4%
    // plus your own contribution is meant to more than repay that, which is
    // exactly the comparison the pension calculator exists to make.
    pillar2MemberFactor: 0.8,
    minServiceYears: 15,              // below this it is rahvapension instead
    nationalPensionMonthly: 414.10,

    // RPKS 9-1: the "paindlik vanaduspension" - the state pension itself taken
    // up to five years early, or deferred. The old fixed 0.4%/month early and
    // 0.9%/month deferred rates were replaced in 2021 by a multiplier that
    // depends on your birth date and is recalculated each 1 January, so these
    // are Sotsiaalkindlustusamet's published FORECAST, not a guaranteed rate.
    // Whatever applies when the pension is assessed is then permanent for life.
    //
    // Note the asymmetry: deferring pays more than claiming early costs.
    flexibleAdjustment: {
      // SKA forecast published for 2026. These are not guaranteed future rates:
      // the coefficient is recalculated annually and depends on the assessment date.
      '-5': -0.3067, '-4': -0.2550, '-3': -0.1988, '-2': -0.1378, '-1': -0.0717,
      '0': 0,
      '1': 0.0793, '2': 0.1688, '3': 0.2701, '4': 0.3850, '5': 0.5157,
    },
    // RPKS 9-1(2): how much service each year of early drawing requires. Steep,
    // and it lands badly on exactly the people most interested in it - a short
    // career is the whole point of retiring early, and it is what disqualifies
    // you here.
    earlyDrawingServiceYears: { 1: 20, 2: 25, 3: 30, 4: 35, 5: 40 },
    maxEarlyYears: 5,
  },

  // Statistics Estonia's 2025 annual average, and the same figure the voluntary
  // health premium is built from: RaKS §24(3) sets that premium at 0.13 x the
  // last published average gross monthly wage, rounded to 10 cents, which is
  // 2092 x 0.13 = 271.96 -> EUR 272.00. So the two are statutorily linked, and
  // each confirms the other.
  averageGrossWageMonthly: 2092,

  // Both pillars unlock at the "flexible retirement age" = state pension age - 5.
  // State pension age is life-expectancy linked from 2027, published 2 years
  // ahead, capped at +3 months/year. No official figure exists beyond ~2028.
  pensionAge: {
    // Confirmed statutory ages by birth year. Older cohorts are included so an
    // already-retired person's health/tax dates are not back-cast from 2026.
    knownByBirthYear: {
      1953: 63, 1954: 63 + 3 / 12, 1955: 63 + 6 / 12,
      1956: 63 + 9 / 12, 1957: 64, 1958: 64 + 3 / 12,
      1959: 64 + 6 / 12, 1960: 64 + 9 / 12, 1961: 65,
      1962: 65 + 1 / 12, 1963: 65 + 3 / 12,
    },
    knownByCalendarYear: { 2026: 65, 2027: 65 + 1 / 12, 2028: 65 + 3 / 12 },
    driftMonthsPerYearEstimate: 1.5,
    maxDriftMonthsPerYear: 3,
    pillarUnlockOffsetYears: -5,
  },

  healthInsurance: {
    // RaKS §24(3): 0.13 x the last published average gross monthly wage, rounded
    // to 10 cents, recalculated once a year after Statistics Estonia publishes.
    voluntaryMonthly: 272,
    voluntaryWaitMonths: 1,           // §24(4): cover starts a month after signing
    voluntaryMinTermYears: 1,         // §24(2): the contract runs at least a year
    voluntaryEndsIfMovingAbroad: true,  // §24(7), new from 2026-01-01
    childrenCoveredToAge: 19,
    // Two different provisions, routinely conflated because both are called the
    // "dependent spouse" route:
    //   - the CHILDREN-based one was abolished, cover ending 2026-01-31;
    //   - RaKS §5(4)(4), for a dependent spouse or registered partner within
    //     five years of pension age, is still in force (RT I, 06.07.2023, 6).
    // The second needs no children, but does need the supporting spouse to be
    // an insured person - so it lapses the moment they stop working too, which
    // is exactly when a FIRE household would want it.
    dependentSpouseChildrenRouteAbolished: '2026-01-31',
    dependentSpouseNearPensionYears: 5,
    ownRightRoutes: ['parental benefit', 'raising a child under 3', 'large family allowance'],
  },

  investmentAccount: {
    // Tax is computed across ALL declared accounts together, not per account.
    aggregatedAcrossAccounts: true,
    transfersBetweenOwnAccountsTaxNeutral: true,   // TuMS 17-2(4)
    currencyConversionIsDisbursement: false,       // TuMS 17-2
  },

  rental: { autoExpenseDeduction: 0.20 },   // residential only -> 17.6% effective

  crypto: {
    taxRate: 0.22,
    // Since 2025 this depends on whether the service provider is MiCA-authorised.
    lossOffsetAllowedWithMicaProvider: true,
    lossOffsetAllowedWithoutMicaProvider: false,
    investmentAccountEligibleWithMicaProvider: true,
    swapIsDisposal: true,
  },

  mortgage: {
    maxLtv: 0.85, maxLtvWithKredEx: 0.90,
    maxDsti: 0.50, maxTermYears: 30, stressRate: 0.06,
    earlyRepaymentCapMonthsInterest: 3,
    interestDeductible: false,          // abolished 2024
  },

  protection: {
    depositGuarantee: 100_000,          // per depositor per credit institution
    depositGuaranteeJointPerHolder: true,
    // TFS §25²: an extra tranche, for six months, on money from a residential
    // property sale. Tagatisfond's current guidance confirms the extra EUR 100k.
    temporaryHighBalance: 100_000,
    temporaryHighBalanceMonths: 6,
    investorCompensation: 20_000,       // backstop only; fund assets are segregated
  },

  // COMMERCIAL, not statutory. A broker changes these whenever it likes, which
  // is exactly why they belong here rather than being typed into the prose --
  // they will go stale faster than anything set by law.
  brokers: {
    // Custody on foreign securities. Both banks charge only on the part above
    // the threshold, monthly. Swedbank's cap is the figure that matters: it
    // turns a percentage into a flat maximum, which changes the answer at size.
    custodyFreeThreshold: 100_000,
    lhvCustodyAboveMonthly: 0.0001,     // 0.01%/month, no cap
    lhvCustodyAboveAnnual: 0.0012,
    swedbankCustodyAboveMonthly: 0.00008, // 0.008%/month...
    swedbankCustodyMonthlyCap: 8,       // ...but never more than this
    commissionRate: 0.0014,             // LHV and Swedbank both, foreign markets
    swedbankMinCommission: 3.90,
    lhvMinCommission: 5.00,
    lightyearFxFee: 0.0035,
    lightyearMoneyMarketFee: 0.0010,
    // VAT is added to Swedbank's custody fee unless the account holds nothing
    // but fund units. An all-ETF portfolio - which is what this guide builds -
    // is exempt. Hold single shares or bonds alongside them and the whole fee
    // gains 24%. LHV's treatment of the same fee is not published; assume VAT.
    custodyVatExemptForFundsOnly: true,
  },

  // Market rates, unlike everything else in this file, are not law and move on
  // their own. Dated so a reader can see how stale they are, and kept here so
  // there is one place to refresh rather than several pages to hunt through.
  marketRates: {
    asOf: 'August 2026',
    ecbDepositFacility: 0.0225,       // ECB, effective 17 June 2026
    moneyMarketFundNet: 0.022,        // roughly EUR STR after a 0.10% fund fee
    lightyearSavings: 0.0221,         // their published headline
    ibkrEurCash: 0.01691,             // published full tier, checked August 2026
    ibkrCashThreshold: 10_000,        // no interest at all below this
    ibkrFullRateNav: 100_000,         // below this the rate is scaled down
    termDepositBest: 0.030,           // smaller banks competing for funding
    termDepositBigBanks: 0.023,       // LHV, SEB, Swedbank, top of their range
  },
};

// Planning assumptions - not law, and the user should be able to change them.
export const DEFAULTS = {
  realReturn: 0.05,
  cashRealReturn: 0,
  swr: 0.035,
  // Real spending growth after FI: how fast the cost of the same life rises
  // ABOVE inflation. Zero means today's spending stays valid in today's money
  // forever, which is the standard FIRE assumption and probably a little
  // optimistic - care and health costs outrun the general index, and lifestyle
  // drifts. Left at zero by default because it is a judgement, not a fact.
  spendingGrowth: 0,
  // Only used for one thing: eroding a pension annuity, which is fixed in
  // NOMINAL euros. Everything else on the site is in real terms and needs no
  // inflation figure at all. 2.5% rather than the ECB's 2% target because
  // Estonian inflation has run above the euro-area average.
  inflation: 0.025,
  // 100, not 95. Estonian remaining life expectancy at 65 is about 19 years, so
  // an average pensioner reaches ~84 - but the horizon has to cover the person
  // who lives longest, and for a couple the chance one of them passes 95 is not
  // small. Fifteen extra years costs surprisingly little, because money needed
  // that far out is discounted by decades of compounding.
  planToAge: 100,
  emergencyFundMonths: 6,
  // Two independent questions, kept independent. What the PORTFOLIO must do:
  //   'perpetual' - never fall below the capital that funds permanent spending
  //                 at the withdrawal rate, so it lasts indefinitely.
  //   'drawdown'  - only has to reach planToAge, spending down to nothing.
  portfolioEnd: 'perpetual',
  // And which PENSIONS count, which changes the income in either case:
  //   'ignore' | 'ownPots' (II and III) | 'all' (plus Pillar I).
  pensionPolicy: 'ignore',
  // 'unlock'       - draw the pots as soon as the law allows, state pension age - 5.
  // 'statePension' - leave them to compound and start everything together.
  pillarDrawAge: 'unlock',
  // 'annuity'     - eluaegne pensionileping: paid for life, 0% tax, one seller.
  // 'fundPension' - fondipension: 0% tax at the recommended duration, but it
  //                 runs out, and the portfolio has to cover what follows.
  pillarPayout: 'annuity',
  // How much of each pension to actually believe. 1 = count it in full. The two
  // are separate because they fail for different reasons: your own pots are a
  // balance whose future VALUE is uncertain (returns, fees, annuity pricing),
  // while the state pension is a political promise that can simply be changed.
  potsCountedShare: 1,
  stateCountedShare: 1,
  // Years the state pension is drawn before the standard age, 0-5. Worth more
  // than it looks: health cover follows receipt of a state pension, so drawing
  // early ends the voluntary contract early too.
  statePensionEarlyYears: 0,
  // Years of working past the earliest date the plan allows. The solver finds a
  // boundary, not a target: by construction it leaves no margin at all, so this
  // is how margin gets bought.
  bufferYears: 0,
  transactionCostRate: 0.02,          // notary, state fee, valuation, bank fee
};
