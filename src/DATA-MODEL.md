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
contract paid today. After FI the engine budgets voluntary cover until state
pension age unless `healthCoveredAfterFi` confirms another route such as S1.

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

## Changing the shape

Future qualifying pension service is estimated separately from pension units:
`elapsed working years × min(1, gross annual salary / annual minimum wage)`.
Entered accrued service remains authoritative; missing service remains unknown.
Net-income overrides do not establish contributions. This assumes pension
social tax on the entered salary, not employer minimum top-ups or state-paid
and special qualifying periods. Such cases need official records; the model
does not determine legal entitlement. The current minimum-wage assumption is
held constant in real terms. This does not fix healthcare eligibility or the
early-pension solver's final-date revalidation.
Source: [SKA pension qualifying period](https://www.sotsiaalkindlustusamet.ee/en/pension-and-benefits/applying-pension/pension-qualifying-period),
checked 19 September 2026.

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
