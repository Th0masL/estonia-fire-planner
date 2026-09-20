# Health insurance when leaving work

Leaving work can change health coverage, but living from investments does not
by itself prove that someone is uninsured. Check each person's actual coverage
basis and dates in the Health Portal or with Tervisekassa before changing the plan.

> **Limited review — 20 September 2026:** the sources below support specific
> coverage routes, not personal entitlement. Future premiums, cross-border cases
> and individual coverage decisions remain unverified. The calculator does not
> determine legal eligibility.

## Work-based coverage is conditional

[Tervisekassa's employee guidance](https://tervisekassa.ee/en/employee-employment-contract)
requires an employment contract longer than one month or indefinite, with employer
social tax. Previously uninsured employees have a 14-day waiting period; coverage
normally ends two months after registered employment termination. “Any part-time
job immediately provides cover” is not a safe assumption.

[Board remuneration and service contracts](https://tervisekassa.ee/en/employee-contract-under-law-obligations-member-management-or-controlling-body-legal-person)
have a different declaration-based route: monthly social tax from one or more
payers must meet the minimum (€292.38 in 2026). Cover starts after the TSD
submission deadline, not simply on the day a fee is paid. Confirm payroll
obligations and registration; the simulator's salary input does not verify them.

An OÜ's total payroll outlay is not the same as an insurance premium: some is
remuneration received personally. The former comparison of the whole company
outlay with a voluntary premium did not establish which route costs less overall.
FIE and other work arrangements require their own eligibility and cost review.

## Family routes: distinguish the different bases

[SKA's child-related coverage guidance](https://sotsiaalkindlustusamet.ee/ravikindlustus)
states that the domestic dependent-spouse route tied to raising children ended
from January 2026, with existing cover ending by 31 January. That does not mean
every affected person lost all possible coverage.

Other child-related routes remain: maternity/shared-benefit recipients and
qualifying parents of under-threes; non-working recipients of large-family
allowance for 3–6 children with at least one under eight; and recipients for
seven or more children. These routes insure one parent, not automatically both.
Changing the benefit recipient or parental-leave arrangement can change who is
covered. Ask SKA to confirm the recipient and dates.

[Children under 19](https://tervisekassa.ee/en/children-age-19) have a separate
route, subject to Estonian residence or residence-permit/right conditions and
registration. Their parents need not be insured, but “unconditional worldwide
coverage until 19” would be incorrect.

### Near-pension-age dependants and cross-border cases

The [near-pension-age dependant route](https://tervisekassa.ee/kindlustatud-isiku-ulalpeetav-abikaasa-voi-registreeritud-elukaaslane-kellel-vanaduspensionieani)
still exists for a qualifying dependent spouse/registered partner near state
pension age. An application and an insured supporting partner are required.
Do not equate the supporting partner's last workday with immediate loss of their
insured status. The guidance uses both “up to five” and “less than five” years;
confirm the exact boundary and applicable supporting status with Tervisekassa.

[Cross-border family coverage](https://tervisekassa.ee/en/worker-and-family-members-living-different-countries)
can involve an S1 certificate and the competent foreign institution. The domestic
2026 change is not proof that every cross-border dependent-spouse route ended.
No individual S1 entitlement is established here.

## Unemployment registration can provide coverage

The earlier statement that registration provides no insurance was wrong.
The [Ministry's 2026 guidance](https://www.mkm.ee/too-ja-vordsed-voimalused/toohoive/huvitised-ja-toetused)
explicitly includes registered unemployed people who do not qualify for
unemployment insurance benefit. Benefit entitlement and health coverage are
different questions; the same source describes the replacement of the old
unemployment allowance with a basic-rate insurance benefit in 2026.

This is not a permanent retirement-coverage promise. Confirm registration
eligibility, job-search obligations, availability for work and actual coverage
dates with Töötukassa. This review does not establish the exact waiting period
or every exclusion for a particular applicant; do not enter a lifelong coverage
date based only on temporary registration.

## Voluntary insurance: dated price and contract limits

[Tervisekassa's voluntary-contract page](https://tervisekassa.ee/en/people/health-insurance/voluntary-health-insurance)
(updated 1 July 2026) lists **{{healthInsurance.voluntaryMonthly|money}}/month**
and **{{healthInsurance.voluntaryMonthly|money12}}/year**.

| Check | Published conditions |
|---|---|
| Eligibility | Estonian residence in the population register and no other eligible coverage basis; portal application also opens near existing cover's expiry |
| Start | Normally one month after contracting; signing while existing insurance remains valid can preserve continuity |
| Term | One year; monthly instalments do not make it a monthly cancellable contract |
| Scope | Ordinary insured benefits, excluding temporary-incapacity-for-work benefits; additional fees and co-payments remain |
| End/refund | Specified termination grounds include other coverage, moving abroad, non-payment, expiry or death; unused advance premiums are refunded by day |

The published eligibility list no longer requires prior insurance history.
Premiums change annually. Read the actual contract before signing; this review
does not establish an unrestricted right to cancel or certify all standard terms.

## Pension access and the simulator

[State-pension beneficiaries](https://tervisekassa.ee/en/beneficiaries-estonian-national-pension)
have a coverage route registered using SKA data. Accessing Pillar II/III funds,
or reaching an estimated pension age, is not the same as receiving a state pension.
Early state-pension entitlement and the permanent pension adjustment need a
personal SKA assessment. The former fixed multiplier table and claims that low
spending makes early claiming worthwhile were not a verified optimisation.

The planner budgets the configured premium per uncovered person until a
**user-confirmed ongoing coverage start**. Without that date, premiums continue
through the horizon and remain in the perpetual target. Selecting zero pension
benefits does not cancel confirmed healthcare coverage. Temporary family or
unemployment routes must not be entered as lifelong coverage.

A temporary gap is not a perpetual expense: dividing today's annual premium by
a withdrawal rate does not establish the extra FI capital required. Use the
actual uncovered period, allow separately for co-payments, and test future
premium changes. The engine does not model the contract waiting period,
annual payment commitment or every temporary coverage interval.

See [pension access and healthcare](pensions.md#healthcare-and-work-cessation-are-separate)
and the [household guide](household.md#health-insurance--check-each-persons-route).
