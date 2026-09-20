# Where to hold it — brokers, and parking cash

**Partial review:** the broker fee snapshot, Lightyear reporting flow, cash-rate
snapshot and limited deposit/fund distinctions were checked on 20 September 2026.
Foreign-account, product-specific protection and availability claims remain open.
This is not a complete provider comparison.

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

Lightyear also lists Baltic-share trading; the previous claim that it cannot
offer Baltic shares was incorrect. Check the exact security's availability.

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

## Parking cash: a money market fund inside the investment account

**Review scope, 20 September 2026:** compare product risk, access and tax treatment
before yield. A fund is not automatically better than a deposit.

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

Confirm trade or redemption cut-offs, settlement, holidays, withdrawal limits and
the bank transfer to the recipient. **Settlement is not the same as spendable
cash.** Do not promise a fixed two-day route to a notary payment. Keep immediately
needed emergency money accessible without requiring a market sale.

### Cash-rate snapshot and quote checklist

**Checked {{marketRates.ecbCheckedDate}}:** the ECB deposit facility rate is **{{marketRates.ecbDepositFacility|pct}}**,
effective **{{marketRates.ecbEffectiveDate}}**, replacing 2.25%. This is a policy benchmark,
not a retail savings offer or a guaranteed money-market-fund return.
Source: [ECB key interest rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html),
effective-date table.

The former August provider estimates are not verified current quotes. They
have been removed from this comparison rather than automatically increased with
the ECB rate. This page is static, including when used offline.

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

No ranking of the named banks or products has been established in this review.
Compare like-for-like annual returns after costs, taxes and access restrictions.
Do not assume a savings product pays nothing, that every money-market fund
tracks the ECB rate exactly, or that every provider settles withdrawals on the
same timetable.

Tax treatment also depends on the account arrangement, not just the product
name. Check the [investment-account rules](investment-account.md); a qualifying
wrapper can defer tax, but money withdrawn for a house can consume contribution
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

### Which fund to buy

There is no universal cash-fund recommendation here. Compare the exact share
class, costs, risks and redemption route with an eligible deposit.

One example is **XEON**, Xtrackers II EUR Overnight Rate Swap UCITS ETF 1C,
ISIN **LU0290358497**. The
[DWS factsheet dated 31 August 2026](https://etf.dws.com/download/asset/42e11275-ddf0-45d2-8319-ad55635c3a08)
describes accumulating EUR shares, indirect swap replication, a 0.10% annual
fund fee and a benchmark based on €STR plus 8.5 basis points. Checked
20 September 2026; not a live yield quote or broker-availability confirmation.
The fund fee is not the investor's all-in cost.

DWS warns about counterparty failure and investment losses. The benchmark is not
a guaranteed payout and is not the ECB deposit facility rate. This review does
not establish authorization of XEON as an MMF under the MMF Regulation; it is
described here as an overnight-rate swap ETF. CSH2 and other alternatives have
not been reverified, so no interchangeable-product shortlist is offered.

### When a savings account is still the better choice

When immediate access and capital certainty matter more than a possible yield
difference, compare eligible deposits first. Confirm notice periods and transfer
limits even on products advertised as savings accounts. A term deposit must
mature in time; an investment fund needs a workable sale/redemption route.
Neither a higher return nor faster access should be assumed without current terms.
