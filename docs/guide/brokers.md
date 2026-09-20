# Where to hold it — brokers, and parking cash

**Partial review:** the broker fee snapshot, Lightyear reporting flow and cash-rate
snapshot were checked on 20 September 2026. Other cash-product, protection and
fund claims below remain unverified. This is not a complete provider comparison.

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

Some money has a job to do soon. A deposit on a house, an emergency fund, a tax
bill due next October. Shares are the wrong place for it, and a normal savings
account pays almost nothing. The usual answer is to buy a **EUR money market fund
inside your investment account**, though a fixed-term deposit is a real
alternative and sometimes the better one.

### Why this beats a savings account

| | Savings account at a bank | Money market fund in an investment account |
|---|---|---|
| What you earn | nothing much on a current account, more on a fixed term | roughly the ECB rate, minus about 0.1% |
| Tax | you pay {{incomeTax|pct}} on the interest **in the year you receive it** | **you pay nothing** until you take out more than you put in |
| If the bank fails | the deposit guarantee pays up to {{protection.depositGuarantee|money}} | this is not a deposit, so it is not covered — see below |
| Getting your money | straight away | you sell, wait two days for settlement, then transfer |

The tax difference is the one that grows over time. Interest on a savings account
is taxed the year you earn it. Money earned inside an investment account is not
taxed until you take more out of the account than you put in. So the money that
would have gone to the Tax Board each spring stays invested and keeps earning.

### How to do it

1. **Get an investment account.** Tell the Tax Board in e-MTA that one of your
   bank accounts is an *investeerimiskonto*. Estonian providers usually make this
   a checkbox when you open a securities account. [The investment account
   guide](investment-account.md) explains the rules you have to follow.
2. **Move the cash into that account.** Every euro you put in counts as a
   contribution, and you can take that same amount back out later without paying
   tax on it.
3. **Buy a EUR money market fund** in that account. Pick an **accumulating**
   version. It pays nothing out to you, so there is nothing to declare and no
   money leaves the account.
4. **Leave it alone.** Sell it when you need the money. Allow two days for the
   sale to settle and another day to transfer the money, and work that out before
   you book the notary rather than on the day.

For a managed money-market savings product, check the underlying fund, current
fee and redemption terms directly. The previous Lightyear fee and same/next-day
access claims are not retained as verified terms. Do not promise a notary payment
date without confirming settlement and transfer timing for the actual product.

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

Plenty of people living in Estonia still have a bank account somewhere else,
often in the country they moved from. Two things decide whether it is a good
place to keep cash, and neither of them is the advertised rate.

**A tax exemption in another country does not survive Estonian residency.** Many
national savings products pay a modest rate and make it tax-free, and the tax
break is the entire point of the product. An Estonian tax resident is taxed by
Estonia on worldwide income at {{incomeTax|pct}}, and under the usual tax treaty
wording interest is taxed where the saver lives. So a tax-free account abroad is
not tax-free here, and a rate that looked competitive can end up below what an
ordinary Estonian term deposit pays. Always compare these after Estonian tax,
never on the headline.

**A second country's deposit guarantee is genuinely separate.** Every EU country
runs its own scheme covering {{protection.depositGuarantee|money}}, funded by
that state. Cash split between an Estonian bank and a bank in another EU country
is covered twice over, not once. For a balance well above the limit, that is a
real reason to keep the foreign account open even when its rate is poor.

Two pieces of admin come with it. The interest has to be declared in Estonia and
taxed here, even where the other country taxed none of it. And the foreign bank
reports the account to the Estonian tax authority automatically under the common
reporting standard, so the balance is visible either way.

### Which fund to buy

You want a fund that follows **€STR**, which is the euro short-term rate. When
people say "the ECB rate", this is roughly what they mean. Look for one that
costs less than about 0.15% a year, that is accumulating, and that trades on
Xetra so your Estonian provider can buy it.

The biggest one by far is the **Xtrackers II EUR Overnight Rate Swap UCITS ETF
1C**. Its ticker on Xetra is XEON and its ISIN is LU0290358497. It costs 0.10% a
year, it is accumulating, it is based in Luxembourg, and it holds about €22
billion. **Amundi Smart Overnight Return** (LU1190417599) costs the same and does
a similar job, though it is actively managed rather than following an index.

⚠️ **Check that you can actually buy it before you plan around it.** Neither LHV
nor Swedbank publishes a list of what you can buy. You search for the ticker or
the ISIN once you are logged in. Both banks give you broad access to Xetra and
XEON is one of the most traded things on that exchange, so it should be there,
but search for it in your own account first.

**Three things the fee doesn't tell you:**

**XEON doesn't hold what it tracks.** Instead of holding short-term loans, it has
swap agreements with several banks that pay it the rate. This is normal, and it
is why the fund is cheap, but it means you depend on those banks in a way you
wouldn't with a fund that holds the real thing. If this money absolutely has to
be there, that is worth more thought than a small difference in fees.

**It follows €STR plus 0.085%, not €STR itself.** The fee comes out of that. The
difference is small, but it explains why the rate you read about and the return
you get are not the same number.

**It is not a savings account, and it can lose money.** A money market fund is
not covered by the {{protection.depositGuarantee|money}} deposit guarantee at
all. Your money is held separately from the provider's own, which actually
protects you better in the case that matters — if the broker fails, your holding
is still yours — but it is a different kind of protection, not a bigger version
of the same one. And the value can fall. XEON lost 0.03% in 2022, when the
underlying rate was still around zero. That is a small loss, but it is a loss, so
don't treat this as a savings account.

### When a savings account is still the better choice

If the amount is small, or you might need the money within a week, or you don't
want to worry about a two-day wait before a notary appointment, use a savings
account and accept the slightly worse rate. On €20,000 over six months the
difference is about €100 before tax. That is not worth the extra complication if
you would rather not deal with it.
