# Where to hold it — brokers, and parking cash

**Partial review:** the broker fee snapshot, Lightyear reporting flow, cash-rate
snapshot and limited deposit/fund distinctions were checked on 20 September 2026.
Foreign-account, product-specific protection and availability claims remain open.
This is not a complete provider comparison.

**Cash-parking clarification, 4 October 2026:** start with
[how ECB rates and XEON relate](#ecb-rates-str-and-xeon-in-plain-language),
then [compare bank savings products](#compare-bank-savings-products-in-estonia)
and [check the deposit guarantee](account-protection.md#is-my-parked-cash-covered).
The dated bank offers below are a limited snapshot, not a live ranking.

**Looking for a market product rather than a bank offer?** Read
[market products for temporary cash](#market-products-for-temporary-cash),
then the [worked short-term cost example](#does-a-short-holding-period-cover-the-costs).
Product mechanics and selected tariffs were checked on 4 October 2026;
broker availability and personal tax eligibility are not certified.

## Choosing a broker

Compare the account you would actually open, the securities you would buy and
your expected order sizes. Execution fees are only one cost: check custody,
currency conversion, spreads, fund charges, transfers and taxes too. A provider
with no ETF execution fee is not a promise of cost-free investing.

### Broker fee snapshot

Checked 20 September 2026 against each provider's own tariff. These are selected
standard-account charges, not personalized quotes or a ranking.

| Provider and service | Selected published charges | Important limits |
|---|---|---|
| Lightyear ETFs | No execution or custody fee; currency conversion {{brokers.lightyearFxFee|pct}} | Fund manager fees still apply. Other instruments and services have separate prices. |
| LHV standard account, internet/mobile foreign shares in listed markets | {{brokers.commissionRate|pct}}, minimum {{brokers.lhvMinCommission|money2}} | Do not substitute Growth Account pricing; confirm the tariff for your exact instrument. |
| Swedbank securities account, internet-bank shares/ETFs in listed foreign markets | {{brokers.commissionRate|pct}}, minimum {{brokers.swedbankMinCommission|money2}} | Branch/brokerage and other markets have different tariffs. |

Sources: [Lightyear pricing](https://lightyear.com/en-ee/pricing), execution,
custody and conversion sections; [LHV price list](https://www.lhv.ee/en/price-list),
Securities section (marked valid from 9 June 2025);
[Swedbank price list](https://www.swedbank.ee/private/home/more/pricesrates?language=ENG),
Securities account and transactions. The check date is not a promise that prices
will remain unchanged.

Lightyear also lists Baltic-share trading. Check the exact security's availability.

### Custody fees are not the total cost

LHV's standard account lists {{brokers.lhvCustodyAboveMonthly|pct3}} monthly
on the part above {{brokers.custodyFreeThreshold|money}}, plus VAT, for securities
outside its listed Baltic-share and pension-unit exemptions. It uses the month's
average market value. Growth Account has separate purchase and management fees.

Swedbank's listed “other investments” custody charge is
{{brokers.swedbankCustodyAboveMonthly|pct3}} monthly on the excess above
{{brokers.custodyFreeThreshold|money}}, capped at
{{brokers.swedbankCustodyMonthlyCap|money}} for that fee, before applicable VAT.
It uses month-end values. Its VAT exemption requires holdings consisting only of
the qualifying fund units/shares described in its tariff; do not assume every
ETF account qualifies. **The custody cap is not an all-in cost cap.** Other
services and depositary-receipt charges can add costs.

Use the management/safekeeping sections of the linked bank tariffs and confirm
any exemption with the bank. This guide does not establish an LHV VAT exemption.

### Reporting still needs your review

A reporting integration does not remove your responsibility to keep records and
check the declaration. Do not assume an account is reported correctly merely
because its provider is Estonian.

[Lightyear's investment-account reporting instructions](https://lightyear.com/en-ee/help/trading-and-investments/tax-reporting-investment-accounts)
describe a user-started flow: generate the report, review transactions and
investment-account transfers, confirm it, and send the information to EMTA.
That is not unattended filing. Its published instructions concern the 2025
tax-year flow; later filing screens and requirements may differ.

Check which account type the report covers and reconcile deposits, withdrawals
and transfers with your records. See [the investment-account guide](investment-account.md)
for the distinction between ordinary taxation and the investment-account system.
Current reporting workflows for the other providers are still an open review;
this guide does not claim that a foreign broker can never add reporting support.

### Before opening an account

- Check the exact ISIN, exchange, trading currency and account type.
- Request a total-cost illustration for your order size and expected holdings.
  A bank exchange rate can contain a spread even without a separate conversion fee.
- Confirm the reporting workflow, downloadable records and transfer-out process.
- Check the contracting entity, custody arrangements and the protection applicable
  to the particular cash or investment product. These are not interchangeable.
- Use multiple providers only where the benefits justify the added administration;
  there is no universally correct number of accounts.

**Still unverified:** current SEB, Luminor and Interactive Brokers tariffs;
instrument-by-instrument availability; other providers' reporting workflows;
and product-specific protection. Their omission is not a recommendation against
them. Fund comparisons elsewhere in the guide also need their own dated review.

---

<span id="parking-cash-a-money-market-fund-inside-the-investment-account"></span>

## Parking cash: bank deposits and investment funds

**Review scope, 20 September 2026:** compare product risk, access and tax treatment
before yield. A fund is not automatically better than a deposit.

“Parking cash” means holding money temporarily while trying to earn something on
it. It is a purpose, not a legal product category. You can park money in a bank
deposit or buy a low-volatility investment, but those have different protections.

### ECB rates, €STR and XEON in plain language

These are related, but they are not the same rate or product:

| Name | What it means for your money |
|---|---|
| ECB deposit facility rate | The rate eligible banks receive on overnight deposits with the Eurosystem. It is not an account you can open as a retail saver. |
| €STR (euro short-term rate) | An overnight wholesale borrowing-rate benchmark calculated from market transactions. ECB policy influences it, but it is not identical to the policy rate. |
| Your bank's savings rate | The bank's own offer, with its own access rules. It need not equal €STR or move immediately when the ECB changes rates. |
| XEON | A tradable ETF designed to track an overnight-rate index. You buy fund units, not an ECB deposit. |

Sources: [ECB interest-rate explainer](https://data.ecb.europa.eu/methodology/what-are-interest-rates)
and [ECB explanation of €STR](https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_short-term_rate/html/eurostr_overview.en.html).

XEON's benchmark compounds **€STR + 0.085 percentage points**; its stated annual
fund fee is **0.10%**. As a rough illustration, if €STR stayed at a hypothetical
2%, subtracting that fee gives about **1.985%** before trading costs, tax and
tracking differences. This is an approximation, not a current yield or promise.
The [DWS factsheet](https://etf.dws.com/download/asset/42e11275-ddf0-45d2-8319-ad55635c3a08)
also identifies swap replication and accumulating shares: returns stay in the
fund rather than arriving as monthly interest in your bank account.

If overnight rates fall, the future return can fall too; negative returns are
possible. To spend the money, sell units and wait for settlement and withdrawal.
**XEON is not covered by the {{protection.depositGuarantee|money}} bank-deposit guarantee.** Buying it through
a bank does not change that. See the [protection explanation](account-protection.md#is-my-parked-cash-covered).

### Market products for temporary cash

**Yes: euro overnight-rate ETFs and euro money-market funds are market-based
ways to park money.** A bank or broker is the route to buying them, not the
source of a promotional interest promise. Their returns vary with market rates.
They are candidates for money whose access date is flexible, not substitutes
for immediately accessible emergency cash or a capital guarantee.

“ETF” describes an exchange-traded fund structure; “money-market fund” is a
regulated investment category. These overlap: an MMF can be an ETF, but an
overnight-rate ETF is not automatically an authorized MMF.

| Example | How it earns a return | Main distinction |
|---|---|---|
| XEON — overnight-rate swap ETF | A swap delivers an overnight-index return | Counterparty risk; not a bank deposit |
| Vanguard EUR Cash UCITS ETF — physical MMF | A portfolio of short-term instruments | Credit and liquidity risks remain without an index swap |
| BlackRock MMF through a platform | Short-term instruments, with subscriptions/redemptions through the provider | Access, fees and share class depend on the platform |

**XEON:** see the [benchmark explanation above](#ecb-rates-str-and-xeon-in-plain-language)
and [exact share-class identifier](#which-fund-to-buy). In an accumulating fund,
income stays invested. Normally, positive net overnight returns increase its
value gradually; that is not a promise that its exchange price always rises.
You realize the sale proceeds when you sell, rather than receiving monthly bank
interest. Trading prices and execution costs also affect your outcome.

**Physical MMF example:** Vanguard EUR Cash UCITS ETF (EUR) Accumulating,
ISIN **IE000SOORXS0**, lists a **0.07% annual ongoing charge**. It is a regulated
short-term variable-NAV MMF holding instruments such as Treasury bills, deposits
and reverse repos (short-term lending against securities). It aims to preserve
capital and provide euro money-market returns, but explicitly does not guarantee
the money invested. Its benchmark is compounded €STR, not a promised tracking
return. The same share class has different exchange tickers: **VCAA** on Deutsche
Boerse and **VCSHA** in Amsterdam. Match the ISIN, not just the ticker.
[Vanguard product information](https://www.vanguard.co.uk/professional/product/etf/money-market/E060/vanguard-eur-cash-ucits-etf-eur-acc),
checked 4 October 2026. Availability through any particular Estonian broker is
**unverified**. Physical holdings remove reliance on XEON's index-swap structure,
not all investment risk.

Its [UK investor-information document, dated 17 February 2026](https://fund-docs.vanguard.com/ie000soorxs0-en.pdf)
describes a short-term horizon of less than one year and warns about credit,
counterparty and negative-yield risks. The 0.07% ongoing charge excludes portfolio
transaction costs. This document helps explain the product; obtain the applicable
current retail KID from your broker rather than treating a UK document as proof
of Estonian distribution eligibility.

**Non-exchange access example:** Lightyear's Estonia help page confirms access
to BlackRock MMFs. Its Savings feature buys and sells fund units; it is not a
bank savings deposit. The provider says most orders process within minutes,
occasionally until the next business day; withdrawal to a bank is a further
step. Check the exact fund/share class, current net yield and total fees in the
app. Do not subtract fees twice from a yield already stated after fees, or
treat a recent annualized yield as a fixed future rate.
[Lightyear MMF information](https://lightyear.com/en-ee/help/trading-and-investments/vaults-money-market-fund-mmf),
checked 4 October 2026. This confirms a route available in Estonia, not a
guaranteed personal onboarding decision or bank-arrival deadline.

**None of these fund units has the bank-deposit guarantee.** Liquidity can
deteriorate during market stress; normal access estimates are not guarantees.
See also the provider's [investment-risk disclosures](https://lightyear.com/en-eu/risk-disclosures).
For money you will spend in euros, compare EUR exposure: a higher USD yield
introduces exchange-rate risk. A EUR trading price alone does not establish
that the underlying investment has EUR-only exposure. Ordinary short-duration
bond funds are also not interchangeable with overnight products: their prices
can respond differently to interest-rate and credit changes.

### Deposits and funds do different jobs

| Product | What to check before using it for a near-term payment |
|---|---|
| Instant-access bank deposit | Eligible institution and depositor, guarantee limit, withdrawal and transfer conditions, current net rate |
| Term deposit | Maturity before the payment date, early-exit restrictions, guarantee eligibility and tax arrangement |
| Authorized money market fund | Capital can fluctuate; inspect portfolio, fees, redemption terms and liquidity risks |
| Overnight-rate ETF | Inspect the exact index and replication method; selling also involves spread, settlement and broker access |
| Short-duration bond fund | Do not assume short duration means no price losses or equivalence to an MMF |

For eligible Estonian deposits, the ordinary guarantee is
{{protection.depositGuarantee|money}} per depositor per credit institution,
including accrued interest—not per account or brand. Check the legal institution
and scheme, particularly for branches or broker-held cash.
[Tagatisfond's FAQ](https://www.tf.ee/en/protection-depositors/faq),
“To what value are deposits guaranteed?”, is the source for this limited claim.

Under [the EU Money Market Funds Regulation](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02017R1131-20241224),
Articles 6 and 36, MMF is an authorized designation and funds must disclose that
capital is not guaranteed. An overnight-rate ETF or bond fund should not be
labelled an authorized MMF merely because it is used to park cash.

### Tax deferral is not a tax exemption

For an Estonian tax resident, separate two arrangements:

- **Ordinary securities taxation:** realized sale gains are declared, with
  qualifying documented purchase/sale costs taken into account. Reinvesting the
  proceeds does not itself defer that tax. Distributions need their own treatment.
- **Investment-account system:** qualifying financial assets bought and sold
  under the account rules can defer tax while proceeds remain within the system.
  Taxable withdrawals depend on contributions and payments in date order across
  the person's investment accounts, not the profit on one particular ETF sale.

The [EMTA guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account)
was rechecked on 4 October 2026. This is not a ruling that every fund, broker or
cash movement qualifies. Confirm the account, asset eligibility and reporting
route before using the system; see [investment-account rules](investment-account.md).

[EMTA's investment-account guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/securities-and-investment-account),
“How are taxable gains calculated”, uses dated payments and contributions across
the taxpayer's investment accounts. A house payment can consume the remaining
contribution allowance. Accumulation inside a fund does not make its gains tax-free.

**Illustration:** with no other account movements, contribute €50,000, earn
€1,000 and withdraw all €51,000. The taxable excess is **€1,000**, not zero.
Withdrawing only €50,000 uses that allowance; it does not exempt the remaining
gain from a later taxable withdrawal. This example ignores fees and other relief.

Deferral is not exclusive to funds: EMTA's “Financial assets, interest and dividend”
section also covers qualifying deposits and the notification/receipt conditions
for deferring interest. Compare products using the same tax assumptions.

### Plan the payment, not just the sale

EU exchange-traded securities normally use **T+2 settlement** at this review
date: two business days after the trade, not two calendar days. The planned
EU transition to T+1 is 11 October 2027. Neither timetable promises when your
bank account will be credited; non-exchange fund redemptions can have different
terms. [ESMA settlement roadmap](https://www.esma.europa.eu/sites/default/files/2025-06/High-level_Roadmap_to_T_1_Securities_Settlement_in_the_EU.pdf).

Confirm trade or redemption cut-offs, settlement, holidays, withdrawal limits and
the bank transfer to the recipient. **Settlement is not the same as spendable
cash.** Do not promise a fixed two-day route to a notary payment. Keep immediately
needed emergency money accessible without requiring a market sale.

### Does a short holding period cover the costs?

Use a fictional **€20,000 held for three months**, with a hypothetical **2% annual
return after fund charges**. Neither figure is a current product quote.

| Calculation | Approximate amount |
|---|---:|
| Return before broker costs and personal tax: €20,000 × 2% × 3/12 | €100 |
| Purchase commission at {{brokers.commissionRate|pct}} | €28 |
| Sale commission at {{brokers.commissionRate|pct}}, using an unchanged sale value for simplicity | €28 |
| Remaining after those commissions alone | €44 |

The commission rate is the selected listed foreign-market tariff in the
[LHV](https://www.lhv.ee/en/price-list) and
[Swedbank](https://www.swedbank.ee/private/home/more/pricesrates?language=ENG)
online securities schedules, rechecked 4 October 2026. Confirm the exact ETF,
venue and account tariff; this is not an executable quote. The real sale fee
depends on sale value. Spread, any custody charges and tax reduce the result
further. The fund charge is already in the assumed return, so do not deduct it
again. Existing holdings can affect custody fees.

By comparison, a hypothetical fee-free deposit at **1.5%** would earn about
**€75** over the same period before tax. A higher fund yield can therefore lose
to a lower deposit rate after costs. At the assumed 0.5-percentage-point yield
advantage, €56 of commissions alone takes about **6.7 months** to recover:
€56 ÷ (€20,000 × 0.005) × 12. Rates, fees and risks need not stay constant.

[Lightyear's own tariff](https://lightyear.com/en-ee/pricing) lists no ETF
execution or custody fee, but fund costs and bid–ask spreads still apply.
That does not establish that it offers either named ETF. Compare your actual
all-in order preview, not another broker's marketing comparison.

**Practical sequence:** identify the ISIN and EUR exposure; read the current
KID and redemption terms; check purchase, sale and holding costs; confirm tax
handling; and leave time to sell and transfer out before the payment date.
A limit order can constrain an ETF's execution price but may not fill.

### Compare bank savings products in Estonia

**Sources checked 4 October 2026.** These are EUR retail savings products, not
fixed-term offers. Rates below are advertised annual nominal rates before tax,
not inflation-adjusted returns. Variable rates can change. Each bank name links
to its own product information; reconfirm the offer before depositing.

| Bank / product | Advertised annual rate | Getting money back / important condition |
|---|---|---|
| [LHV Savings Account](https://www.lhv.ee/en/faq/savings-account) | 1.65% | Withdraw to your own LHV account without advance notice or withdrawal fee. Interest credited monthly. |
| [SEB Savings deposit](https://www.seb.ee/en/private/savings-and-investments/savings/savings-deposit-privates) | 1.65% | Free withdrawal from the third day; same-day transfer costs 0.5%, minimum €1.60. |
| [Coop Pank Cash Drawer](https://www.cooppank.ee/en/info/faq/cash-drawer) | 2.00% | Free next-day withdrawal; immediate access has a fee. Closing before month-end forfeits that month's interest. |
| [Luminor Bloom savings](https://bloom.luminor.ee/en) | 1.50% standard; 3.00% eligible promotional money | Advertises instant access. The 3% campaign ends 31 December 2026; conditions below. |
| [Swedbank Easy Saver](https://www.swedbank.ee/private/investor/deposits/easySaver?language=ENG) | **Not verified** | Free immediate withdrawals advertised. The rate field was empty in the retrieved page; check the bank's current quote. |

**Luminor campaign:** the [published rules](https://luminor.ee/s3fs-public/documents/luminor_savings_account_terms_and_conditions_ee_eng.pdf)
limit 3% to at most €100,000 of qualifying new money. Qualification is recalculated
daily against total Luminor balances on 15 September 2026; simply moving existing
money between your Luminor accounts does not qualify. After the campaign, the
then-current standard rate applies. The 3% is annualized, not a 3% payout for
the remaining campaign months. Bloom also has onboarding restrictions: the
product page describes adult Estonian-resident EU citizens and lists exclusions.
Confirm eligibility rather than assuming the offer is available to everyone.

**Deposit protection:** eligible deposits at the Estonian entities AS LHV Pank,
AS SEB Pank, Coop Pank AS, Luminor Bank AS and Swedbank AS fall under Estonia's
Tagatisfond scheme; these entities appear on its
[deposit-scheme member list](https://www.tf.ee/et/hoiustajate-kaitse/liikmete-nimekiri).
The ordinary limit is {{protection.depositGuarantee|money}} per person **across all eligible deposits at that
same bank**, including interest—not {{protection.depositGuarantee|money}} for each product in this table.
Check the deposit information sheet for your actual contract. The Luminor
campaign's €100,000 rate cap does not create an extra guarantee allowance.

### How to compare offers fairly

- Start with the date you need the money. Separate immediate-access savings
  from fixed-term deposits; compare term quotes for the **same amount and term**.
  For example, [SEB's rate page](https://www.seb.ee/en/private/deposit-rates)
  advertises term rates “up to 2.5%”; that is not a verified 3-, 6- or 12-month
  quote. A matched term-deposit comparison remains **unverified here**.
- Ask for the euro amount after account fees, withdrawal fees and applicable
  taxes. Check promotional caps, expiry, minimum balances and day-count basis.
  The figures above do not establish every provider's all-in net return.
- For scale, €10,000 at 1.65% earns roughly €165 over a full year; at 2%, roughly
  €200. That €35 difference assumes unchanged rates and ignores compounding,
  fees and taxes. A €3 monthly account fee would already cost €36 a year.
- For an ETF, include purchase/sale commissions and the bid–ask spread (the gap
  between buying and selling prices). Do not compare a past fund return with a
  guaranteed future deposit payout as if they were the same thing.
- Leave room below the guarantee limit for accrued interest and other balances
  at the same institution. The [protection guide](account-protection.md#is-my-parked-cash-covered)
  gives a worked example.

### Cash-rate snapshot and quote checklist

**Checked {{marketRates.ecbCheckedDate}}:** the ECB deposit facility rate is **{{marketRates.ecbDepositFacility|pct}}**,
effective **{{marketRates.ecbEffectiveDate}}**, replacing 2.25%. This is a policy benchmark,
not a retail savings offer or a guaranteed money-market-fund return.
Source: [ECB key interest rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html),
effective-date table.

The ECB table was rechecked on 4 October 2026 with the same result. Do not
automatically increase retail offers when the ECB rate changes. The bank
snapshot above has its own check date; this page is static, including offline.

| Route | Evidence needed before comparing |
|---|---|
| Bank savings or term deposit | Dated offer for the currency, amount and term; early-access conditions; institution and applicable protection |
| Money-market fund | Exact share class, dated yield measure, fees, risk disclosures and settlement/redemption terms |
| Lightyear Savings | Estonia-specific current offer, underlying fund, net fee treatment and withdrawal timing |
| Interactive Brokers cash | Currency tier, interest-bearing balance, total account NAV, applicable entity and current rate |

IBKR's published methodology makes the effective return balance-dependent:
a headline rate is not earned on the whole balance. Its full-rate NAV threshold
is expressed in **USD equivalent**, not a universal EUR threshold. Use the
[provider's cash-interest calculator](https://www.interactivebrokers.ie/en/accounts/fees/pricing-interest-rates.php)
for the actual account. Methodology checked 20 September 2026; an individual
account's current yield is **not verified here**.

No universal best bank or product has been established in this review.
Compare like-for-like annual returns after costs, taxes and access restrictions.
Do not assume a savings product pays nothing, that every money-market fund
tracks the ECB rate exactly, or that every provider settles withdrawals on the
same timetable.

Tax treatment also depends on the account arrangement, not just the product
name. Check the [investment-account rules](investment-account.md); a qualifying
investment account can defer tax, but money withdrawn for a house can consume contribution
allowance and generate taxable withdrawals.

**Simulator limit:** the cash-return input is a real-return assumption, not a
live nominal bank quote. This documentation refresh does not change that input,
the projection engine or provider eligibility. The broader broker-fee,
protection and fund comparisons elsewhere on this page remain **open review**;
the date above certifies only the stated benchmark and limited methodology check.

### Cash at a bank in another country

**Checked 20 September 2026:** foreign tax treatment does not by itself determine
the Estonian result. [EMTA's foreign-income guidance](https://www.emta.ee/en/private-client/taxes-and-payment/taxable-income/income-derived-foreign-state)
requires Estonian residents to declare relevant foreign income, with treatment
depending on the income and circumstances. Check treaty relief, foreign tax
credits and any qualifying investment-account arrangement rather than assuming
every foreign receipt incurs the full Estonian rate again.

[EMTA's foreign-account reporting guidance](https://www.emta.ee/en/private-client/declaration-income-received-foreign-bank-account)
describes international information exchange alongside the taxpayer's declaration
obligation. Information exchange is not a completed tax return and does not
establish that a particular transaction has been classified correctly.

For deposit protection, identify the legal institution and applicable scheme,
not just the country of the app or brand. The
[protection guide](account-protection.md) distinguishes eligible deposits from
broker cash and fund holdings. Do not infer another guarantee allowance simply
because an account is offered in another country.

**Still unverified:** individual foreign-product exemptions, treaty outcomes,
cash-sweep arrangements and account-specific guarantee coverage.

<span id="which-fund-to-buy"></span>

### Cash-fund examples

There is no universal cash-fund recommendation here. Compare the exact share
class, costs, risks and redemption route with an eligible deposit.

One example is **XEON**, Xtrackers II EUR Overnight Rate Swap UCITS ETF 1C,
ISIN **LU0290358497**. The
[DWS factsheet dated 31 August 2026](https://etf.dws.com/download/asset/42e11275-ddf0-45d2-8319-ad55635c3a08)
supports the mechanics explained above; rechecked 4 October 2026. It is not
a live yield quote or confirmation that your broker offers the fund.

DWS warns about counterparty failure and investment losses. This review does
not establish authorization of XEON as an MMF under the MMF Regulation; it is
described here as an overnight-rate swap ETF. The
[market-product examples](#market-products-for-temporary-cash) contrast it with
a physical MMF and a non-exchange access route, not equivalent guarantees.
CSH2 and other alternatives have not been reverified. Live yields, order-book
spreads, broker-specific availability, actual transfer times and individual
investment-account eligibility remain **unverified**.

### When a savings account is still the better choice

When immediate access and capital certainty matter more than a possible yield
difference, compare eligible deposits first. Confirm notice periods and transfer
limits even on products advertised as savings accounts. A term deposit must
mature in time; an investment fund needs a workable sale/redemption route.
Neither a higher return nor faster access should be assumed without current terms.
