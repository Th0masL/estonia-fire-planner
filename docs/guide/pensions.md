# Pension pillars II and III

Keep three questions separate: when money can be withdrawn, when favourable
tax treatment applies, and when the plan actually starts using it. Neither
pillar should be represented by a universal age 60 or 65.

## Access ages and payout conditions

Pillar II retirement payouts can start up to five years before state pension
age. Ordinary qualifying-age lump sums and short-term pensions are taxed at
10%; earlier exits generally attract 22%. Qualifying long-term pensions paid
at least quarterly can be exempt. Special exemptions exist, including assessed
no-work-ability cases; these are not inferred by the simulator.
Source: [EMTA pension taxation](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/pension-and-insurance-indemnities),
“Taxation of pensions” and its notes, checked 20 September 2026.

Pillar III permits earlier withdrawals; its favourable-tax age is not an
absolute lock. First units acquired or a pension contract concluded before
1 January 2021 can establish the age-55 route. For entrants from 2021, the age
threshold follows state pension age minus five. The ordinary 10% lump-sum route
also requires at least five years of accumulation; otherwise 22% generally
applies. Check original acquisition/contract records, not the date of a recent
fund switch. [Pensionikeskus: III pillar payments](https://www.pensionikeskus.ee/en/iii-pillar/payments/),
checked 20 September 2026.

The pre-2021 boundary includes 2020. EMTA's English note says “before 2020”,
while Pensionikeskus explicitly includes joining in 2020. This wording
discrepancy is flagged here rather than silently treating the English summaries
as identical. Confirm individual entitlement with the provider.

The calculator's future pension ages are estimates where not officially known.
Do not confuse the Pillar II payout threshold with eligibility for a flexible
state pension: these are separate decisions. Early-exit administration, rejoining
rules and pending reforms are **not reverified in this guide update**.

## 2%, 4% or 6% — should you raise your rate?

Pillar II's personal contribution can be 2%, 4% or 6%; the state contribution
remains 4%. Increasing the personal rate does not increase that state amount.
Pensionikeskus describes annual changes submitted by 30 November for the next
calendar year. Its page also retains a dated “start in 2026” sentence: check the
actual effective date when applying rather than interpreting that as a rolling
promise. [Pensionikeskus: contribution choices](https://www.pensionikeskus.ee/en/suurempension-en/increase-the-ii-pillar-contribution/),
checked 20 September 2026.

A higher rate directs more salary into pension assets and leaves less available
for the bridge to pension payments, a home purchase or other near-term needs.
Compare net cash flow, fees, access conditions and uncertainty rather than
assuming the highest rate always wins. Pillar III does not universally have an
earlier favourable-tax age than Pillar II.

## Pillar III contributions and deductions

The deduction limit is the lower of 15% of income taxable in Estonia and
{{pillar3.maxAnnual|money}} annually. It is not a contribution ceiling or a
guaranteed refund. Other deductions and available income tax affect the benefit.
[EMTA contribution guidance](https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/contributions-supplementary-funded-pension),
checked 20 September 2026, lists basic exemption and education/donation
deductions before Pillar III.

The planner invests the full entered payment. Accessible savings fall by that
payment minus the estimated refund. The estimate uses salary only; it does not
prepare a complete tax return or model employer contributions. Other eligible
income may matter even without employment. Verify the actual deduction and
refund in the tax return.

### The spousal transfer caveat for single-earner households

The simulator calculates deductions separately for each person and does not
transfer unused allowance between partners. Do not interpret one person's
unused limit as an automatic refund for the other. Spousal-transfer legal
details were not reverified in this update; consult EMTA before relying on a
household-level deduction strategy.

### Comparing wrappers

Compare the same net cash outlay, actual usable deduction, refund timing,
fees, investment exposure and eventual withdrawal tax. A fully available refund
can favour pension saving, but that assumption does not hold for every person.
The earlier unconditional “beats the investment account” examples and provider
fee claims have been removed rather than presented as universal conclusions.

## Should the pension count toward your FI number?

The simulator supports a zero-benefit comparison and a pension-inclusive plan.
“Without pensions” means pension benefits contribute zero—not that pension
contributions already deducted from salary become available savings.

Pension policy selects whether to count own pots or also eligible state pension;
the trust percentage reduces the benefits the plan relies on. It is a scenario
haircut, not a probability estimate, market guarantee or legal change to ownership.
Funded pots are assets, but future value, access rules and tax treatment can
change. State pension depends on entitlement and future rules rather than a
personal investment balance.

The accessible portfolio must cover spending before pension payments, any
shortfall while they are paid, and spending after fund payments end. Counting
pensions does not mean the portfolio can be permanently abandoned at pension age.
Compare both views and test adverse returns and a long planning horizon.

## Choosing the payout: fund withdrawals or lump sum

**Fund-based withdrawals are the default.** A fund pension redeems units over
a selected term; payments depend on fund value. Pensionikeskus describes the
recommended term using age and published remaining-life-expectancy data, rounded
to whole years. The recommended or longer term with at least quarterly payments
can qualify for exemption. It is not a lifetime guarantee.
[Pensionikeskus: supplementary funded pension](https://www.pensionikeskus.ee/en/iii-pillar/payments/supplementary-funded-pension/),
checked 20 September 2026.

Enter the official applicable duration, not a universal 19-year assumption.
The simulator requires a supplied duration for fund income. Its annualized
projection redeems fixed units, leaves the remaining pot invested, and stops
payments at the end of the term. Market stress also affects modeled pension
funds. This is not a precise monthly provider payment quote.

**Optional lump sum:** the model deducts standard 10% withholding at qualifying
ages and allocates the counted net receipt between cash and investments. Receipt
occurs at the later of FIRE and the selected qualifying draw date. That is a
model convention, not an obligation to withdraw then. Unknown Pillar III
eligibility remains excluded. Early exits, special exemptions and tax-return
refunds are not modeled.

**No insurer annuity is modeled.** Future quotes and availability are unknown.
The plan does not rely on an insurer remaining in business to sell a new contract.
No current provider count or blanket contract terms are asserted here.

## Healthcare and work cessation are separate

Pension-pot access does not establish healthcare entitlement. The simulator
requires an explicit coverage assumption or confirmed coverage date; otherwise
it retains the modeled voluntary premium, currently
{{healthInsurance.voluntaryMonthly|money}} per month. Deferring pension withdrawals
does not automatically align healthcare with state-pension age. Check the
[health-insurance guide](health-insurance.md) and actual entitlement separately.

At modeled work cessation, salary-funded pension contributions stop. This is a
simulation assumption, not a claim that voluntary Pillar III payments legally
require employment. Deferring withdrawals exposes the pot to further returns
and losses while extending the portfolio-funded interval.

## Projection limits for low salaries

The planner estimates future pension service and units from gross salary, not
actual social-tax records. In 2026 the employer minimum social-tax base is
€886/month (€292.38 tax); this is distinct from the current minimum wage.
Applicability depends on circumstances and exceptions. The calculator does not
infer minimum top-ups, state-paid contributions or special qualifying periods.
Low- and zero-salary state-pension projections therefore carry a warning.
Check payroll and official records; net income alone does not establish accrual.
Historical service and accrued units must be entered separately.

Sources checked 19 September 2026:
[EMTA social tax](https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/social-tax)
and [SKA pension qualifying period](https://www.sotsiaalkindlustusamet.ee/en/pension-and-benefits/applying-pension/pension-qualifying-period).
The rates are verified; a particular person's entitlement is not.

## Verification scope

This update checks the access/payout distinctions and named contribution rules,
not every pension-law exception. Future cohort ages, individual entitlement,
early-exit reforms, spousal transfers, cross-border taxation and insurer terms
remain open here. The standard rates are current-source snapshots, not promises
for the retirement year. See the [evidence register](verification.md).
