# Data model

<!-- Every figure below is illustrative. This file is published; nothing in it
     describes a real person. -->

The single shape passed to `simulate()`, persisted to `localStorage`, written by
Export, and carried in a share link. Changing it means touching the engine, the
form, persistence, the share encoder and the test fixtures — so change it
deliberately.

It lives in `state.js`, which owns the defaults, the share-link codec and
`sanitise()`. That module is the **trust boundary**: a share link is a string a
stranger can edit and an exported file is a file anyone can hand-edit, so
nothing reaches the engine before `sanitise()` has repaired it. It is covered by
`test/roundtrip.mjs`.

```jsonc
{
  "version": 2,
  "currentYear": 2026,          // optional; defaults to RATES.year
  "excludeCrypto": true,        // crypto counts toward FI only when false

  "household": {
    "hasDependents": true,      // drives the life-cover finding, nothing else
    "spending": {               // all EUR per month
      "housing": 700,          // rent or current mortgage + running costs
      "childCosts": 250,        // net of any allowances received
      "childCostsEndYear": 2044, // null means no assumed end
      "other": 900,
      "buffer": 200            // irregular costs: car, dentist, travel
    },
    "rentalIncomeNetMonthly": 0,   // legacy; attributed to persons[0]
    "property": {
      "purchase": {
        "price": 260000,
        "deposit": 45000,
        "termYears": 30,
        "rate": 0.04,                 // decimal, not percent
        "runningCostsMonthly": 300,   // excludes the mortgage payment
        "movingCosts": 8000,         // removals and furnishing, one-off
        "monthsAway": 12,
        "collateralValue": 260000,
        "otherDebtMonthly": 0,
        "paidBy": "proportional"      // or a person index
      }
    }
  },

  "persons": [                  // one or two
    {
      "name": "You",
      "birthYear": 1988,
      "income": {
        "grossMonthly": 3400,
        "netMonthly": 2680,    // optional; overrides the tax model when given
        "otherNetMonthly": 0    // rental etc., belongs to this person
      },
      "assets": {
        "cash": 24000,            // counted
        "investmentAccount": 0,    // counted net of latent tax below
        "investmentAccountContributions": 0, // unused contribution allowance after prior withdrawals
        "pillar2": 21000,          // excluded — locked until unlock age
        "pillar3": 0,              // excluded
        "crypto": 4000           // excluded unless excludeCrypto is false
      },
      "pillar2Rate": 0.02,      // optional; 2%, 4% or 6%
      "pillar3Annual": 0,       // contribution, not balance
      "pillar3FirstContributionYear": null,
      "annuityMonthlyQuote": null, // required to count annuity income
      "fundPensionYears": null,    // official Pensionikeskus duration
      "lifeInsurance": false,      // pays for term life cover
      "lifeInsuranceMonthly": 0,   // premium; deducted only when the flag is set
      "healthInsurance": false,    // pays for a voluntary Tervisekassa contract
      "healthInsuranceMonthly": 272,  // defaults from rates.js, editable
      "healthCoveredAfterFi": false,
      "yearsWorkedEstonia": 12,    // separate statutory service input
      "yearsWorkedEuEea": 0,
      "nationalPensionEligible": false,
      "pillar1Units": null,        // accrued Pillar I coefficient from the SKA
                                   // portal; exact, and beats any estimate
      "allocationShare": 0.5    // share of *future* savings, normalised
    }
  ],

  "assumptions": {
    "realReturn": 0.05,
    "cashRealReturn": 0,
    "retirementCashReserve": 0, // protected household cash, today's euros, from FI onward
    "swr": 0.035,
    "spendingGrowth": 0,        // real, i.e. ON TOP of inflation, after FI
    "pensionPolicy": "ignore",  // "ignore" | "ownPots" | "all"
    "pillarDrawAge": "unlock",  // "unlock" | "statePension"
    "pillarPayout": "annuity",  // "annuity" | "fundPension"
    "transactionCostRate": 0.02,
    "emergencyFundMonths": 6
  }
}
```

## Rules the engine relies on

**Income is pooled, spending is shared.** There is one household FI target and
one FI *date*; people reach it at whatever age they happen to be.

**`allocationShare` governs future savings only.** Existing assets stay with
whoever holds them. To change who owns existing money, move it between people in
the inputs — the model will not redistribute it.

**Accessible assets and pensions are separate streams.** Cash and the
after-tax spendable value of `investmentAccount` accumulate toward the bridge;
crypto joins only when `excludeCrypto` is false. Pension pots remain locked and
can reduce later portfolio withdrawals only when the policy counts them and the
required access/payout evidence is supplied.

**Cover is per person, and premiums are outgoings.** Life cover protects one
life; a health contract insures one person. Both belong to a person rather than
the household, both reduce what can be invested, and neither becomes an asset.

**Health cover is dated per person.** `healthInsurance` records a voluntary
contract paid today. `healthCoveredAfterFi` confirms ongoing cover without an
additional premium from FI onward. Otherwise optional `healthCoverageFromYear`
sets the confirmed start of such coverage; null/missing means unknown. It is
independent of pension income policy, trust and estimated pension age. Unknown
coverage means premiums throughout the horizon and in the perpetual capital
floor. Dated premium PV is reported only within the planning horizon, not as
an infinite lifetime cost. Other medical expenses remain in household spending.
Legacy plans retain their inputs but no longer receive automatic age-based
coverage; the UI asks users to review the changed assumption. This optional
field needs no conversion of old values and retains the existing data version.
Reference: [Tervisekassa insured equivalents](https://tervisekassa.ee/en/people/health-insurance/persons-equivalent-insured-persons),
checked 19 September 2026. An entered date is a user confirmation, not a verified
legal entitlement; temporary routes need review before being treated as ongoing.

**`pensionPolicy` changes what the FI number *means*.** Under `"ignore"` it is
the selected SWR capital-floor heuristic. It is tested through `planToAge` and
must not be described as a guarantee of lasting forever. In drawdown mode it is
whatever the portfolio must be **on the day work stops**, because the balance is
allowed to run down by the planning age. `fi.number` follows the selected mode;
`fi.perpetualNumber` retains the capital-floor result, and
`fi.yearsPerpetual` / `fi.yearsBridged` retain both dates.

**The FI date and the pension are solved together, not in sequence.**
Contributions stop the day work stops, so a later FI date buys a bigger pension,
which permits an earlier date. The engine bisects on the stop date with a full
drawdown simulation inside, rather than computing a target and then a date.

**Pillar II and Pillar III have separate legal dates.** Pillar II opens at state
pension age −5. Pillar III also depends on the first-contribution year and the
five-year holding period, with grandfathering for holdings acquired by 2020.
`pillarDrawAge` decides whether each pot starts at its legal date or is deferred
until at least state pension age.

**Everything is in real terms.** `realReturn` is net of inflation, so every
figure the tool shows is in today's money and inflation needs no separate
handling. `spendingGrowth` is the different question: whether the same life gets
more expensive *faster* than the general index. It applies from the FI date
onward, and it turns the perpetual target from `spending / swr` into
`spending / (swr - growth)` — infinite when growth reaches the withdrawal rate,
which is the honest answer rather than a large finite number.

Quoted annuity income is fixed nominally and therefore decays using `inflation`.
Fund-pension income follows the modeled fund return until its entered duration
ends.

**`pillarPayout` decides whether the pension income ever stops.** An `annuity`
is paid for life, so it runs to the end of the plan. A `fundPension` is paced
over the recommended duration and then ends, and the portfolio has to carry the
household again from `fi.pillarIncomeEndsAge` to `planToAge` — priced into the
target, which is why it is higher. The duration shrinks the later the payout
starts, since it tracks remaining life expectancy at that age.

**Pension income is not invented.** An annuity counts only when the user enters
an insurer's monthly quote. A fund pension counts only when the user enters the
recommended duration returned by Pensionikeskus. Without that evidence the pot
is displayed but its income contribution is zero.

**Pillar I amount and eligibility use different evidence.** `pillar1Units` is
authoritative for the accrued amount; `yearsWorkedEstonia` is a separate explicit
input for statutory eligibility. One is never inferred from the other. EU/EEA
service may establish entitlement, but the simulator excludes the amount where
an official cross-border pro-rata calculation is required.

**Pillar I is reported net, Pillars II and III gross.** The annuity is 0%-taxed
so gross and net are the same thing; the state pension is ordinary taxable
income, charged at `incomeTax` above the larger `basicExemptionPensionAge`.
Mixing the two would overstate spendable income.

**`netMonthly` wins over the tax model when supplied.** Payslips include
deductions the model does not know about, so an explicit figure is trusted.

**Rates live in `rates.js`, never here.** Anything a politician can change
belongs there, and flows into both the calculator and the prose.

## Invariants

Enforced by `test/invariants.mjs` across generated households:

- per-person portfolios sum to the household portfolio, and to the FI target
- money spent on a house leaves someone's balance
- excluded assets never reach the target
- a negative surplus yields no FI date — compounding alone does not count
- every person has their own age, pension unlock and portfolio; the bridge uses
  the longest wait
- Pillar III reduces investable surplus by the full payment net of refund;
  only the deductible portion is limited, never the pension contribution
- life and health premiums reduce the surplus and never enter the portfolio
- nobody paying for cover is told they have none, and nobody without it is missed
- a bridged plan survives to the end of the plan, checked by an independent
  drawdown walk rather than by the solver that produced it
- counting pensions never delays FI (when the return exceeds the withdrawal rate)
- stopping work early cannot grow a pension pot, nor raise the state pension
- a refund never exceeds the income tax actually paid
- allocation shares sum to 1
- nothing rendered is `NaN`, `Infinity` or `undefined`

## Cash preservation and protected emergency reserve

This is a modeling policy, not a tax rule or an investment recommendation.
Cash and investments now remain separate. `retirementCashReserve` is protected
household cash from FI onward, in today's euros (default zero for older plans).
It remains part of total assets and the FIRE target, but cannot fund ordinary
spending or satisfy the spendable SWR capital floor. The target is shown as
spendable capital plus protected reserve. Emergency events are not simulated.

### Balances and transitions

- Keep accessible `cash` and `invested` balances separately for each person.
  `invested` initially retains the existing after-reserve valuation of investment
  accounts, brokerage and included crypto. Pension pots stay separate.
- Apply `cashRealReturn` only to cash and `realReturn` only to investments.
  Neither reaching FI nor a house purchase implicitly invests existing cash.
- Preserve the existing allocation of new investable surplus by `allocationShare`.
  New surplus continues to enter investments. This policy does not imply that
  existing cash should be invested too.
- For a house purchase, preserve the existing payer selection and fallback
  order. Calculate each person's assigned cost from their accessible balance,
  then pay from that person's cash first and sell investments for any remainder.
- The emergency reserve is a minimum cash requirement at house completion.
  Reclassify only enough remaining investments to cash to meet it; retain any
  cash already above it. This uses the existing spending-based reserve amount.
  It is not an additional expense or a second deduction from assets.
- During retirement, first offset spending by the pension income already
  counted under the chosen policy and trust settings. Fund the remaining need
  from household cash above the protected reserve, then investments. Split each bucket's withdrawal among
  its owners in proportion to their balances in that bucket; no negative balance
  or silent transfer of ownership is permitted.
- At FI, reclassify only enough investments to cash to establish the protected
  reserve. Cash retained after house completion counts toward it: the two reserves
  are not added together. No reserve is deducted from total assets as an expense.
- Refill the protected reserve from investments if a negative cash real return
  reduces its purchasing power. Keep the real reserve constant, so its nominal
  target rises with inflation. Cash interest above that target is spendable.
  If investments cannot restore the reserve, or ordinary spending cannot be
  funded without using protected principal, report infeasibility. Never borrow
  against the reserve or consume it to make a FIRE date appear feasible.
- Preserve existing treatment of pension income above spending in this slice;
  do not silently add reinvestment of that excess as part of a cash-return fix.

### Timing, returns and stress

Retain the current annual convention: the period's required withdrawal happens
before the period's return. Prorate the first partial year using its actual
duration. This is an approximation, not monthly transaction accounting.
Apply the relevant return to each remaining bucket. Stop on an unfunded
withdrawal; do not let later returns repair a negative opening balance.

An immediate market crash and bad investment-return years affect only invested
assets, not cash. Cash retains its entered return. Shared shocks to exposed
pension funds remain a separate roadmap item; until then, stress descriptions
must explicitly state that pension projections are held unchanged.

### Worked examples (synthetic, one full year)

| Opening cash / investments | Net spending | Cash / investment return | Closing cash / investments |
|---|---:|---|---|
| €800,000 / €0 | €24,000 | 0% / 5% | €776,000 / €0 |
| €40,000 / €760,000 | €24,000 | 0% / 5% | €16,000 / €798,000 |
| €10,000 / €790,000 | €24,000 | 0% / 5% | €0 / €814,800 |
| €40,000 / €760,000 | €24,000 | −2% / 5% | €15,680 / €798,000 |

These four rows use zero protected reserve. With a €20,000 reserve, €40,000 cash
and €760,000 invested, the €24,000 spending draws €20,000 cash and €4,000 investments.
At 0% cash/5% investment returns the close is €20,000 cash / €793,800 investments.
With €20,000 cash, €100,000 investments, no spending, −2% cash and 0% investment
return, €400 is transferred back to cash: closing balances €20,000 / €99,600.
€20,000 cash alone cannot finance any ordinary spending with a €20,000 reserve.

For a €40,000 cash / €760,000 invested portfolio, a 30% immediate investment
crash leaves €40,000 cash and €532,000 invested, total €572,000, before spending.
It must not turn the €40,000 cash into €28,000.

At house completion, €100,000 cash plus €200,000 investments, a €60,000 cost,
and a €20,000 reserve leave €40,000 cash and €200,000 investments. No investment
of the excess €20,000 cash is implied. Starting with €10,000 cash instead leaves
€0 cash / €150,000 invested after payment, then €20,000 cash / €130,000 invested
after reserving cash. Total assets fall only by the €60,000 purchase cost.

### Integration and acceptance

Use one pure period-transition function (`retirementStep`) in feasibility checks, final schedules,
stress tests and independent reconciliation tests. Accumulation, house completion,
ownership and coast calculations must also retain the buckets. Remove scalar
fallback paths that reinterpret cash as investments. Do not publish corrected
schedule rows while the FI solver still uses the old scalar model.

The FI-date search must use the actual projected bucket balances. For a displayed
minimum-capital search at a specified date, scale that date's projected holdings
proportionally; disclose that the target depends on this cash/investment mix.
Do not use a pure-investment hypothetical target for a cash-only household.
If both buckets are zero, test zero-capital feasibility directly and report an
unavailable target when unmet spending has no specified funding mix.

Reconcile, per person and household: opening balance, new contributions,
withdrawals, explicit bucket transfers, returns and closing balance. Test the
examples above, insufficient funds, fractional years, two-person ownership,
house completion, pension income ending before the horizon, and cash-only
stress scenarios. Verify the FI boundary with an independent withdrawal walk.

Do not introduce transaction-level withdrawal tax in this slice. Retain existing
latent-tax reserves and return semantics, with their known limitations. Explicit
taxation requires a separate migration so tax is not charged twice.
The optional reserve field defaults to zero; existing cash amounts and returns
remain unchanged on load, so no saved-data conversion is needed. The published
model-change notice explains why old plans can produce different results.
For example, an €800,000 cash-only portfolio at 0% cash/5% investment return,
spending €24,000, previously closed year one at €814,800 due to the wrong return;
it now closes at €776,000. With a 20-year zero-return cash-only horizon, required
capital is €480,000 without protection or €500,000 with a €20,000 protected reserve.
No FI date is reported beyond the planning horizon, including an excessive
optional work buffer. Analytical tests use horizons long enough to contain
their expected retirement dates rather than accepting dates after plan end.

## Compatibility notes

### Mortgage payments and lifestyle growth

`spendingGrowth` increases recurring lifestyle costs after FI, but not the
contractual mortgage payment. For a €120,000 zero-interest, ten-year loan, the
payment is €12,000/year whether lifestyle growth is 0% or 2%. With €12,000/year
living expenses, year two costs €12,240 + €12,000 = €24,240, not €24,480.
Partial start/end years prorate the mortgage separately from living expenses.

Accumulation also stops deducting payments at purchase completion plus the loan
term. The former payment then becomes additional savings, allocated using the
existing household ownership shares and contribution timing. For example, a
€12,000 annual payment ending after ten years increases annual savings by
€12,000 thereafter; two further working years add €24,000 at zero return.
Purchase timing, fractional years and investment growth are retained in both
stages. This changes projections for households working beyond mortgage payoff.
Accumulation deficits are withdrawn from pooled cash first, then investments,
proportionally to ownership within each bucket. They are not negative investment
contributions. Returns accrue before each annual withdrawal; a final partial year
uses fractional compounding and a prorated deficit. Positive savings retain the
existing annuity convention and allocation shares. These are annualized timing
approximations, not monthly liquidity forecasts. The retirement-only reserve is
not protected during accumulation. An unfunded expense makes later stop dates
infeasible even if subsequent savings could replenish assets; no borrowing is
assumed. The depleting check includes the surplus after mortgage payoff.

This correction does not complete the nominal-flow migration: mortgage payments
still remain constant in the real-euro projection. Future work must convert them
consistently during accumulation and retirement, define the price/loan valuation
date, and document the fixed-rate/no-repricing assumption. Annuity quote dates
and premium requirements are also unresolved. Tests isolate this correction
with zero inflation so they do not certify the outstanding conversion model.

Future qualifying pension service is estimated separately from pension units:
`elapsed working years × min(1, gross annual salary / annual minimum wage)`.
Entered accrued service remains authoritative; missing service remains unknown.
Net-income overrides do not establish contributions. This assumes pension
social tax on the entered salary, not employer minimum top-ups or state-paid
and special qualifying periods. Such cases need official records; the model
does not determine legal entitlement. The current minimum-wage assumption is
held constant in real terms. Healthcare uses the separate confirmed-route inputs above.
Low- and zero-salary plans counting state pension produce an explicit action-plan
warning. The employer minimum social-tax base is not automatically substituted
for salary: applicability and allocation cannot be established from these inputs.
Source: [SKA pension qualifying period](https://www.sotsiaalkindlustusamet.ee/en/pension-and-benefits/applying-pension/pension-qualifying-period),
checked 19 September 2026.

Early-pension choices are revalidated after solving both portfolio horizons.
An unsupported choice is downgraded and both dates are recomputed until stable.
Service is limited to the earlier of stopping work and starting the pension.
Choices only decrease, preventing cycles. Using the earlier horizon date and
excluding optional buffer years is conservative: the solver does not optimize
every pension-start combination or automatically upgrade a downgraded choice.
Source: [SKA flexible pension](https://sotsiaalkindlustusamet.ee/en/pension-and-benefits/types-pensions/flexible-pension),
service thresholds checked 19 September 2026.

Cost basis and unused contribution allowance are independent of market value;
losses must not reduce either on load. `investmentAccountContributions` keeps
its existing serialized key and numeric value, but its label now explicitly
means the unused allowance after prior reportable withdrawals, not lifetime
deposits. Older ambiguous inputs require user review, not guessed conversion.
Previously truncated figures require re-entry from records. No schema change
is made in this preservation fix. The current tax reserve is a snapshot
approximation; future withdrawal taxation remains outside this fix.

Reference: [EMTA securities and investment-account guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account),
contributions and payments section, checked 19 September 2026.

Bump `version` and handle the older shape on load. Share links and exported
files from earlier versions are in the wild the moment anyone uses them.
