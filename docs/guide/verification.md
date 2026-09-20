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

### Home-purchase and mortgage guidance

**Checked:** 20 September 2026. **Scope:** general limits and dated provider/tax
statements, not loan approval or a repayment quotation.

[Eesti Pank requirements](https://www.eestipank.ee/en/financial-stability/requirements-housing-loans)
support the LTV, DSTI, term and exception-volume figures;
[its 2024 amendment](https://www.eestipank.ee/en/press/eesti-pank-amending-requirements-banks-regulating-issuing-new-housing-loans-26012024)
establishes the change to the variable-rate affordability calculation.
[EMTA interest guidance](https://www.emta.ee/en/private-client/housing-loan-interest)
confirms the deduction ended from 2024; older examples on that page are historical.
[EMTA residence-sale guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/transfer-immovable-property/transfer-place-residence)
qualifies the exemption by use and frequency.
[LHV FAQ](https://www.lhv.ee/en/faq/home-loan) and
[Swedbank fees](https://www.swedbank.ee/private/credit/loans/home?language=ENG)
are provider snapshots, not universal early-repayment rules.

**Affected:** buying-a-home guide. Payment tables use constant-rate monthly
annuity arithmetic with no fees; they do not forecast FI dates or market rates.
Removed universal longest-term/deposit recommendations and investment thresholds.
**Open:** statutory repayment compensation, fixed-rate break costs, notice and
schedule amendments, guarantee eligibility/charges, local taxes, insurance and
personal offers. No model or numerical rate-data changes.

### Investment-account guide qualifications

**Checked:** 20 September 2026. **Scope:** limited rule review, not personal advice.

[EMTA](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account)
supports the guide's chronological allowance, reporting, residency and eligibility
qualifications. The withdrawal example is conditional arithmetic, not a forecast.
[Vanguard](https://www.vanguardinvestor.co.uk/need-help/answer/see-dividend-with-accumulation-share-class)
supports only the explanation of accumulation shares, not Estonian tax treatment.
[IRS estate-tax FAQ](https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-estate-taxes-for-nonresidents-not-citizens-of-the-united-states)
distinguishes the nonresident filing threshold from an individual's tax liability.

**Affected:** investment-account guide; no engine changes.
**Open:** fund-specific withholding/treaty comparisons, individual estate-tax
exposure, residence transitions and historic filing corrections. Removed the
unsupported domicile return premium and universal tax-free/administration-free
claims rather than replacing them with another blanket assurance.

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

### OÜ capital and profit comparison

**Status:** checked rules with a conditional arithmetic illustration.
**Checked:** 20 September 2026. **Applicable period:** standard distribution
rate from 2025; current capital guidance, original commencement not established.

Company contribution records and an owner's acquisition cost are different
tax records. The [OÜ guide](company.md) now separates principal repayment from
profit distribution and compares after-extraction amounts. Its illustration
assumes matching documented bases and a lawful repayment; it is not a corporate
tax calculator.

**Primary sources:** [EMTA corporate income tax](https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/income-tax-and-basic-exemption),
“Corporate income tax”; [equity payments](https://www.emta.ee/en/admin/content/handbook_article/771),
TuMS §50(2); [capital-reduction example](https://www.emta.ee/node/330/chapter/34422/pdf),
company reporting and personal table 6.4 (updated 20 February 2025).

**Affected:** `docs/guide/company.md`, `docs/guide/strategy-levers.md`, and their
built pages; no engine changes. **Limits:** rental comparisons, filing corrections,
specific capital procedures, shareholder loans and cross-border cases remain open.

### Crypto eligibility and reporting

**Status:** checked, limited scope. **Checked:** 20 September 2026.
**Effective date:** 1 January 2025 for the qualifying financial-asset change.
The [crypto guide](crypto.md) distinguishes qualifying acquisitions from other
property, and asset eligibility from investment-account compliance.

**Primary sources:** [EMTA Crypto-assets](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/crypto-assets),
MiCA and non-MiCA transaction sections; [EMTA investment accounts](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account),
“How to check” and “How are taxable gains calculated”.
**Affected:** crypto, investment-account and house-purchase guides; no engine changes.
**Limits:** actual licences, historic lots, self-custody migrations and specialist
income types are not individually verified. The simulator's aggregate crypto
reserve is not a legal eligibility or transaction-tax calculation.

### Pension access and fund payouts

**Status:** checked distinctions, not individual entitlement. **Checked:**
20 September 2026. **Applicable period:** current guidance; pre-2021 versus
2021-onward Pillar III entry cohorts. Original commencement dates for every
provision were not established. Current rates are not future guarantees.

**Sources:** [EMTA pension taxation](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/pension-and-insurance-indemnities),
table and notes; [Pensionikeskus III payments](https://www.pensionikeskus.ee/en/iii-pillar/payments/),
age/history; [fund pension](https://www.pensionikeskus.ee/en/iii-pillar/payments/supplementary-funded-pension/),
duration/frequency; [contribution choices](https://www.pensionikeskus.ee/en/suurempension-en/increase-the-ii-pillar-contribution/);
[EMTA deductions](https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/contributions-supplementary-funded-pension).

**Affected:** pension and strategy guides; no engine change. Fixed-age and
insurer-dependence claims removed. **Limits:** EMTA's English pre-2020 wording
differs from Pensionikeskus's explicit inclusion of 2020; contribution guidance
retains a dated start-year sentence. Both are flagged in the guide.
Individual access dates, special exceptions, spousal transfers and future reforms
remain open.

### Cash-market snapshot

**Status:** dated benchmark, not a retail quote. **Checked:** 20 September 2026.
**Effective:** 16 September 2026. The
[ECB rate table](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html)
lists a 2.50% deposit facility rate. [IBKR methodology](https://www.interactivebrokers.ie/en/accounts/fees/pricing-interest-rates.php),
calculation step 2, uses USD-equivalent NAV and balance-dependent interest.

**Affected:** `src/rates.js` benchmark metadata and the cash comparison in
the broker guide. **Limits:** no current retail yield or product ranking is
certified. Broker fees and funds still need review. The simulator's separate
legacy money-market assumption is not refreshed or verified by this entry;
its cash-opportunity message converts that nominal assumption into real terms
using entered inflation. A positive scenario difference is before personal tax,
not a guaranteed saving. Purchase/protected reserves are excluded using the
larger reserve amount to avoid double counting.

### Selected broker fees and reporting

**Status:** limited commercial snapshot. **Checked:** 20 September 2026.
The broker guide links the providers' own tariffs: Lightyear execution/custody/FX,
LHV Securities, and Swedbank Securities account and transactions, including
management/safekeeping conditions. Lightyear's investment-account help describes
the user-reviewed 2025 tax-year reporting flow, not unattended filing.

**Affected:** broker guide and custody comments in `src/rates.js`; no numerical
assumptions or calculations changed. **Limits:** these are selected services,
not total costs or a whole-market ranking. Other providers' tariffs and reporting,
exact security availability, protection and fund comparisons remain open.
The portfolio guide is explicitly marked as pending review.

### VWCE and WEBN fund comparison

**Status:** limited issuer-document snapshot. **Checked:** 20 September 2026.
[Vanguard's product page](https://www.vanguard.co.uk/uk-fund-directory/product/etf/equity/9679/ftse-all-world-ucits-etf-usd-accumulating)
and [KIID dated 28 July 2026](https://fund-docs.vanguard.com/ie00bk5bqt80-en.pdf)
support the accumulating share class, large/mid-cap mandate and 0.14% ongoing
charge. The opened KIID supersedes the older 0.19% search excerpt.
[Amundi's KID dated 28 April 2026](https://www.amundietf.com/pdfDocuments/kid-priips/IE0003XJA0J9/ENG/LUX/20260428)
supports its accumulating share class, large/mid-cap mandate and 0.07% management/
operating component, with underlying transaction costs separately estimated.

**Affected:** portfolio comparison and strategy shortlist; no engine changes.
**Limits:** not a total-cost, liquidity or performance ranking. Availability,
future fund changes and product-specific suitability remain unverified. Removed
undated holdings/size comparisons and unsupported issuer rankings. The remaining
portfolio cash, provider and tax-procedure sections are still pending review.

### Cash products and purchase-reserve withdrawals

**Status:** limited risk/tax clarification. **Checked:** 20 September 2026.
[MMF Regulation, consolidated 24 December 2024](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02017R1131-20241224),
Articles 6 and 36, distinguishes authorized MMFs from guaranteed investments.
[Tagatisfond FAQ](https://www.tf.ee/en/protection-depositors/faq) supports the
ordinary eligible-deposit limit per depositor and credit institution.
[DWS factsheet, 31 August 2026](https://etf.dws.com/download/asset/42e11275-ddf0-45d2-8319-ad55635c3a08)
identifies XEON's swap structure and counterparty/loss risk, not a guaranteed yield.
[EMTA guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account),
taxable-gains and interest sections, supports the withdrawal example and deposit
deferral conditions.

**Affected:** cash, portfolio and purchase guidance; narrow cautions in account
protection. No engine changes. **Limits:** exact redemption/settlement routes,
broker-held cash, foreign schemes, investor compensation and crisis scenarios
still require review. XEON's regulatory MMF status is not established here.

### Account protection and disrupted access

**Status:** limited legal/procedural distinctions. **Checked:** 20 September 2026.
[Tagatisfond depositor FAQ](https://www.tf.ee/en/protection-depositors/faq) and
[investor FAQ](https://www.tf.ee/en/investor-protection/faq) support the stated
limits and distinctions in the account-protection guide.
[ESMA's MiFID II Article 16](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifid-ii/article-16-organisational-requirements),
paragraphs 8–9, covers safeguarding duties.
[European Commission guidance](https://finance.ec.europa.eu/financial-markets/financial-markets-policy/securities-markets/investor-compensation-schemes_en)
distinguishes asset-return failures from market losses.
[EMTA](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account)
supports dated aggregation, own-account transfers and annual reporting.

**Affected:** account-protection guide and a rates comment; no numerical or
engine change. **Limits:** individual eligibility, custody chains, foreign schemes,
actual recovery and crisis restrictions remain open. Removed unsupported crisis
predictions and automatic-access assurances rather than certifying them.

### Foreign accounts and provider reconciliation

**Status:** general rules and limited provider facts. **Checked:** 20 September 2026.
[EMTA investment-account guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account)
supports institution categories, annual declaration and own-account transfer
distinctions. [Foreign-income guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/income-derived-foreign-state)
and [foreign-account reporting guidance](https://www.emta.ee/en/private-client/declaration-income-received-foreign-bank-account)
distinguish declaration duties from foreign tax treatment and information exchange.
[N26's EU support page](https://support.n26.com/en-eu/app-and-features/savings-and-invest/how-stocks-and-etfs-work-at-n26)
identifies Upvest and Estonia among supported markets, subject to eligibility.
It does not establish Estonian investment-account tax qualification.

**Affected:** portfolio, broker and investment-account cross-references.
Removed blanket provider rankings, fixed switching thresholds and contradictory
account-count advice. **Limits:** individual foreign accounts, current tariffs,
transfers, treaty outcomes and historic corrections remain open. No engine changes.

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
| Pension contributions and payouts | Individual entitlement, special exceptions, spousal transfers and reforms; core access/payout distinctions checked above | Pension guides, `src/rates.js`, pension projections |
| State pension and healthcare | Service evidence, future cohort ages, minimum-contribution exceptions and actual coverage routes | Pension eligibility and healthcare costs |
| OÜ investing | Rental-specific taxation, historic filing corrections and actual capital repayment procedures; core principal/profit example checked above | Company-versus-personal comparison |
| Crypto and foreign accounts | Actual provider licences, historic lots, migrations and foreign-account arrangements; general crypto distinctions checked above | Tax and account guidance; crypto approximation |
| Housing and family benefits | Lending constraints, guarantees, repayment terms, property taxes and benefit eligibility | Housing guidance and household inputs |
| Cross-border and ownership | Residency changes, treaties, gifts, marital property and inheritance | Account ownership and relocation guidance |
| Protection schemes | Core distinctions checked above; actual eligibility, foreign schemes, custody chains and recovery outcomes remain open | Cash and custody guidance |
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
