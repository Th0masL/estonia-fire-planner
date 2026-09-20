# Household, not individual

Dependants and multiple adults change both cash flows and risks. Model the
household budget while keeping ownership, tax and individual eligibility distinct.

> **Limited review — 20 September 2026:** the linked sources support the specific
> current rules below, not a household's entitlement or future benefit amounts.
> Municipal fees, personal insurance quotes, cross-border cases and legal
> arrangements remain unverified. This is not a family-benefit calculator.

## Allowances and accounts are individual

| Item | What to check for each person |
|---|---|
| Pillar III deduction | Up to {{pillar3.maxAnnual|money}} annually, limited by eligible income and available tax; not a guaranteed refund |
| General basic exemption | {{basicExemptionMonthly|money}} monthly in 2026; reduces taxable income, not a cash payment to each adult |
| Investment accounts | Several accounts are possible; the tax calculation combines the same taxpayer's accounts, not both partners' accounts |
| Pillar II | Check membership, actual contributions and applicable state-paid contributions; an account does not imply ongoing accrual |

[EMTA's general exemption guidance](https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/calculation-basic-exemption)
and [pensionable-age exemption guidance](https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/basic-exemption-pensionable-age)
distinguish the general exemption from the separate 2026 pensionable-age amount
of €776/month. Do not add these two allowances together or assume a non-earner
receives their unused exemption as cash.

The [investment-account rules](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account)
require qualifying residence, accounts, assets and reporting. They are not
unconditional, and opening a second person's account does not resolve ownership
or transfer questions. See the [investment-account guide](investment-account.md).

Pillar III capacity depends on each taxpayer, including eligible non-salary
income. The simulator does not transfer unused allowances between partners;
[spousal-transfer details remain open](pensions.md#the-spousal-transfer-caveat-for-single-earner-households).

[SKA's supplementary Pillar II contributions](https://www.sotsiaalkindlustusamet.ee/perehuvitised-ja-muud-toetused/ravi-ja-pensionikindlustus/kogumispensioni-taiendavad-sissemaksed)
provide a child-related route for an eligible parent of an under-three. Therefore
“Pillar II accrues only on earned income” is too broad. Recipient choice and
pension consequences need checking; these additional contributions are not
automatically modeled by the simulator.

## Child costs and benefits need separate estimates

There is no verified universal “cheap child” budget. Estimate housing, food,
childcare, transport, activities, equipment, care needs and lost earnings from
your own circumstances. Check local school, meal and kindergarten charges,
availability and subsidies; this guide does not verify a municipality's fees.

[Higher-education guidance](https://www.hm.ee/en/education-research-and-youth-affairs/general-education/higher-education)
describes free full-time Estonian-language study, but
[tuition conditions and repeat-study restrictions](https://www.hm.ee/korgharidus-ja-teadus/korgharidus/tasuta-korgharidus-ja-oppekulude-huvitamine)
matter. Language alone does not guarantee tuition-free study. Budget living,
travel and materials separately and confirm the institution's terms.

### Child and large-family allowances

[SKA's published rates](https://sotsiaalkindlustusamet.ee/en/family-benefits-and-allowances/family-benefits-overview/child-and-family-benefits-rates),
checked 20 September 2026, list:

| Benefit | Monthly amount | Qualification to check |
|---|---|---|
| Child allowance | €80 for each of the first two; €100 for each additional child | Eligible children and recipient arrangement |
| Large-family allowance | €450 for 3–6; €650 for 7 or more | Qualifying children receiving child allowance; not just lifetime number of births |

The [child-allowance guidance](https://www.sotsiaalkindlustusamet.ee/perehuvitised-ja-muud-toetused/peretoetused/lapsetoetus)
normally ends entitlement at 19, with a school-year extension for qualifying
students without secondary education. Birth registration can generate an
e-service offer; confirm the award and recipient rather than assuming nothing
needs doing. Moving from abroad or changing family circumstances may require
contact with SKA. Cross-border coordination and personal eligibility remain open.

### Health insurance — check each person's route

The domestic child-related dependent-spouse route ended in January 2026, but
other family routes remain. Confirm which parent is insured: changing benefit
recipients or parental leave can change coverage. A child's third birthday does
not prove that every other route has ended.

Children have a separate residence-based route; near-pension-age dependants
and cross-border S1 cases need distinct checks. See the
[reviewed healthcare guide](health-insurance.md#family-routes-distinguish-the-different-bases)
for the sources, conditions and unresolved personal questions.

Model the actual uncovered period and possible future premiums. Do not treat a
temporary gap as a perpetual expense or assume that one working partner covers
the other. Temporary coverage is not a confirmed lifelong healthcare start.

## Plan household risks without ranking them

### The FI number is a household number

Agree on spending, work and risk preferences, and keep account ownership visible.
Two incomes can help, but losses can be correlated through the same employer,
sector, location or caregiving event. No probability of simultaneous income loss
or ranking of relationship risks is established here.

Compare different stopping dates and income-loss scenarios. One partner's
continued employment does not automatically insure the other.

### Spending is not flat — model it in phases

Separate an ongoing baseline from costs with a defensible end date. Do not assume
all support ends when a child leaves home: education, disability, care needs or
help with housing can continue. A smaller target is not automatically a more
accurate one.

The simulator's child-cost end year ends that entered spending component; leaving
it blank keeps the cost ongoing. It does not infer when children become
independent. Avoid counting the same cost in both the baseline and child-cost
input. Assess future one-off support separately if the available inputs cannot
represent its timing.

### Review life and disability risks

Estimate the shortfall if either adult dies or cannot work, including the
replacement cost of unpaid care. Compare debts, ongoing needs, accessible assets,
survivor income and existing benefits before choosing a sum insured.

Compare actual policy quotes, exclusions, definitions, waiting periods, duration,
beneficiaries and portability. Standalone and lender-linked products can differ;
neither is established as universally cheaper or better. Life, critical-illness
and disability cover are different products. This guide establishes neither a
relative probability of claims nor a universally necessary amount of insurance.

The simulator's life-cover checkbox records a user declaration, not policy
adequacy or separate disability coverage. Its warning is a prompt to review the
risk, not an insurance recommendation.

### Legal structure

Review wills, guardianship arrangements, property ownership, access on death or
incapacity, and relevant jurisdictions. Shared budgeting is not evidence of equal
legal ownership. Inheritance, later asset sales and foreign taxes are distinct
questions. No personal succession or cross-border tax outcome is verified here;
obtain jurisdiction-specific advice before relying on an arrangement.

## Modelling changes in family size

### Shared parental benefit uses a reference period

[SKA's shared-benefit guidance](https://sotsiaalkindlustusamet.ee/en/family-benefits-and-allowances/family-benefits-overview/shared-parental-benefit)
uses the recipient's eligible income over the 12 calendar months preceding the
nine full calendar months before the birth month, not simply the previous
calendar year. For a July 2026 birth, that ordinary reference period is October
2024–September 2025; October 2025–June 2026 is excluded.

Eligible income, excluded days, floors and exceptions can affect the award.
The benefit is taxable and paid for planned days: do not enter a gross monthly
cap as guaranteed net household income. Maternity, paternity and shared benefit
have different rules; use SKA's assessment for the actual recipient.

### The 2026 cap and earnings rule are different changes

[SKA's cap-transition explanation](https://www.sotsiaalkindlustusamet.ee/uudised/vanemahuvitise-ulempiir-ja-selle-muudatused-2026-aastal)
describes the 2026 maximum of **€3,806.10 gross/month** and explains why expected
versus actual birth dates can produce different caps by benefit type. Its example
of an expected January 2026 birth occurring in December 2025 gives a working
mother's maternity cap of €3,806.10 but shared/paternity caps of €5,265.09.
“All children born before 2026 keep the old cap” is not a complete rule.

**Source caveat:** the English shared-benefit page retains a conflicting ×3 line
inside its ×2 cap explanation. The dated Estonian transition explanation and
published amount are used here; no general cap formula or complete transition
calculator is certified.

[SKA's earnings announcement](https://www.sotsiaalkindlustusamet.ee/uudised/vanemahuvitise-saamise-ajal-tulu-teenimine)
removes the earnings reduction for planned benefit periods starting from
1 January 2026. This does not remove eligibility, recipient or leave conditions.
In particular, shared-benefit entitlement generally follows the parent on
parental leave when one parent takes that leave; do not assume the higher earner
can always claim while the other parent stays on leave.

### Use dated cash flows, not a promised FIRE-date shift

Compare additional costs, time away from work and confirmed net benefits, with
their start and end dates. Do not assume a new child advances or delays FIRE by
a fixed number of years. Housing guarantees also need separate eligibility and
lender checks; having a third child does not establish approval or a quoted
down payment. See [buying a home](property-purchase.md).

The simulator does not calculate family-benefit entitlement or schedule parental
leave and changing benefit receipts. Do not put a temporary benefit into an
ongoing income field and assume it will stop automatically. Use separately
reconciled cash-flow scenarios where the input structure cannot express the dates.

## What the simulator needs at household level

- Each adult's income, assets, pensions and confirmed coverage.
- Shared spending with no duplicated household costs.
- Explicit child-cost end dates only where justified.
- Protected cash, debt and housing plans.
- Separately checked temporary benefits, leave-related income changes and future support.
