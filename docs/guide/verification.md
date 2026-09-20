# Sources & verification

This is an initial evidence register, not a certification of the entire planner.
Only the rules listed as checked below were reverified for this register on
20 September 2026. Other guide pages may contain older figures or claims that
still need review. A passing calculation test does not establish legal correctness.

## How to read the status

- **Checked rule:** the stated, limited claim matches the named primary source on the recorded date. Individual eligibility still needs evidence.
- **Model assumption:** a deliberate simplification, not a legal rule or a forecast guarantee.
- **Open review:** not reverified in this register; do not treat it as confirmed merely because it appears elsewhere in the guide.
- **Commercial snapshot:** provider terms or market figures that need a dated, product-specific quote.

The calculator's loaded rule year, projection starting year and baseline review
date are separate. The baseline date shown elsewhere is not a claim that every
rule was checked then. Dates below apply only to their individual entries;
neither the website nor an offline copy automatically updates legislation.

## Checked rules

### Investment-account withdrawals

**Status:** checked rule. **Checked:** 20 September 2026.
**Applicable period:** current resident investment-account guidance checked on
that date; the original commencement date was not established in this review.

Taxable withdrawals arise when payments exceed prior contributions. Calculation
is chronological, after each contribution or payment, rather than an annual
netting exercise. Several investment accounts are aggregated for one taxpayer.
This is not permission to combine two household members' allowances.

**Primary source:** [EMTA — Securities and investment account](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account),
section “How are taxable gains calculated”.

**Used in:** `src/investment-account-tax.js`, `src/calc.js`, and the simulator's
unused contribution allowance and withdrawal-tax outputs.
**Limits:** account/asset eligibility, residence changes, foreign withholding,
personal deductions and declaration corrections are not inferred. Enter the
remaining allowance from actual records, not lifetime deposits or market value.

### Income tax and basic exemption

**Status:** checked rule. **Checked:** 20 September 2026.
**Applicable period:** 2026, as identified by the source's annual section.

EMTA lists withheld income tax at 22% and the general basic exemption at €700
per month (€8,400 annually), no longer reduced as income increases. It lists a
separate pensionable-age exemption of €776 per month (€9,312 annually).

**Primary source:** [EMTA — Tax rates](https://www.emta.ee/en/private-client/taxes-and-payment/declaration-income/tax-rates),
section “2026”.

**Used in:** `src/rates.js`, salary calculations in `src/calc.js`, and tax figures
in the guides. **Limits:** this checks the published rates, not every deduction,
payroll exception or person's final annual tax bill. It does not establish that
the same rates will apply throughout a multi-decade retirement.

## Model assumptions and known limits

- Investment-account tax is reserved immediately when money leaves the wrapper. This is a cash-planning convention, not the statutory tax-payment deadline.
- Investment-account balances are treated as invested. The separate Cash input is outside the wrapper; idle cash inside it is not modeled separately.
- Ordinary brokerage and crypto use an upfront gains-tax reserve and a separate after-tax return approximation, not a transaction-by-transaction tax return.
- Returns, inflation, spending growth, pension trust and withdrawal assumptions are scenarios. They do not promise future investment performance or pension entitlement.
- Pension fund withdrawals and optional lump sums are modeled; insurer annuities are not. Missing eligibility or duration information cannot establish an entitlement.
- Protected emergency cash is maintained in real euros and excluded from ordinary spending. This is a chosen planning policy.
- Retirement-date searches use quarterly and event checkpoints with local refinement. They can miss narrow feasible windows; the result is not proof of the globally earliest possible retirement date.
- Annualized cash flows are not a monthly liquidity forecast. Mortgage repricing and future legal changes are not predicted.

For implementation details, contributors should read `src/DATA-MODEL.md` and
`src/INVESTMENT-ACCOUNT-TAX.md`. Tests check the implemented conventions; they
cannot validate future outcomes or fill in missing personal evidence.

## Open review

These topics are not reverified by this register. Existing page-level citations
remain useful leads, but their presence is not a completed cross-guide audit.

| Topic | What still needs checking | Affected guidance or calculation |
|---|---|---|
| Pension contributions and payouts | Deduction scope, access dates, duration requirements, withholding and exceptions; reconcile every guide statement | Pension guides, `src/rates.js`, pension projections |
| State pension and healthcare | Service evidence, future cohort ages, minimum-contribution exceptions and actual coverage routes | Pension eligibility and healthcare costs |
| OÜ investing | Reconcile contributed principal, retained profits and extraction tax in worked examples | Company-versus-personal comparison |
| Crypto and foreign accounts | Acquisition dates, provider licences, eligible assets versus eligible accounts, losses and reporting | Tax and account guidance; crypto approximation |
| Housing and family benefits | Lending constraints, guarantees, repayment terms, property taxes and benefit eligibility | Housing guidance and household inputs |
| Cross-border and ownership | Residency changes, treaties, gifts, marital property and inheritance | Account ownership and relocation guidance |
| Protection schemes | Eligible institutions, deposits, investment claims, temporary balances and exclusions | Cash and custody guidance |
| Provider and fund comparisons | Fees, availability, fund characteristics and broker reporting, each with a quote date | Commercial snapshots in investment guides |

Before acting on one of these topics, check the relevant authority or provider
and obtain advice where personal circumstances matter. Do not interpret an open
item as proof that the existing statement is false—or as assurance that it is true.

## Maintaining this register

For each new checked entry, record the exact claim, primary-source URL and section,
effective date or applicable period, date checked, affected code and guidance,
and exclusions. Distinguish enacted rules from proposals and provider quotes
from general law. If a source cannot resolve a question, leave it explicitly open.

Contributor research questions are retained in
`docs/contributing/research-questions.md`; they are not evidence on their own.
This register replaces the previous research-round completion claims, which did
not provide enough traceable evidence to certify all the topics as verified.
