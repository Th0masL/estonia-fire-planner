// Action plan rules.
//
// Each rule inspects the simulated plan and, if it fires, returns a finding with
// a concrete number attached. The point is that nothing here is generic advice:
// every message quantifies what the reader specifically gains or risks.
//
// Severity ordering: critical > important > opportunity > info.

import { RATES, DEFAULTS } from './rates.js';
import { eur, pct, escapeHtml } from './format.js';

const SEVERITY_ORDER = { critical: 0, important: 1, opportunity: 2, info: 3 };

// Titles and values are plain text. Details contain authored HTML; escape any
// user text at interpolation sites in details, not in the underlying plan.
/** @returns {Array<{id,severity,title,detail,value,link}>} */
export function actionPlan(sim, input) {
  const out = [];
  const add = (f) => out.push(f);
  const people = sim.persons;
  const hh = input.household;
  const a = sim.assumptions;

  if (a.pensionPolicy === 'all') {
    for (const [i, p] of people.entries()) {
      if (p.grossAnnual >= RATES.minimumAnnualWageForPension) continue;
      add({
        id: `pension-contributions-unverified-${i}`, severity: 'important', link: 'pensions',
        title: `${p.name || 'This person'}: verify pension contribution assumptions`,
        value: `${p.estimatedServicePerYear.toFixed(2)} estimated service years/year`,
        detail: `Future service and pension units are estimated from entered gross salary only. ` +
          `Employer minimum social-tax payments, exemptions and state-paid contributions are ` +
          `not inferred. A net-income override is not evidence of pension contributions. ` +
          `Check payroll and the official pension record before relying on the projected ` +
          `eligibility or income; the actual result may differ.`,
      });
    }
  }

  // ---------------------------------------------------------------- critical

  // RaKS §5(4)(4): a dependent spouse within five years of pension age is
  // covered through an insured partner, with no children required and nothing
  // to buy. It needs the partner to still be working, so it helps before FI and
  // never after it - but while it applies, telling someone to buy a contract
  // would be telling them to pay for what they already have.
  const someoneEmployed = people.some((p) => p.employed);
  for (const p of people) {
    const yearsToPension = p.pension.statePensionAge - p.ageNow;
    const coveredBySpouse = someoneEmployed && !p.employed &&
      yearsToPension <= RATES.healthInsurance.dependentSpouseNearPensionYears &&
      yearsToPension >= 0;
    if (coveredBySpouse && !p.healthInsurance) {
      add({
        id: 'dependent-spouse-cover', severity: 'opportunity', link: 'health-insurance',
        title: `${p.name || 'This person'} is covered through their partner`,
        value: eur(RATES.healthInsurance.voluntaryMonthly) + '/month not needed',
        detail:
          `Within five years of pension age, a dependent spouse or registered partner of an ` +
          `insured person is covered by the state — RaKS §5(4)(4), still in force. No children ` +
          `are required; the route that needed them was abolished in January 2026, which is a ` +
          `different provision and the source of most confusion here. Nothing is deducted ` +
          `automatically: the person has to file for it with Tervisekassa themselves.` +
          `\n\nIt lasts only while the other partner is still working. Once both stop, ` +
          `neither is insured and the voluntary contract is needed again — so this closes the ` +
          `gap before FI, never after it.`,
      });
    }
    const insured = p.employed || p.healthInsurance || coveredBySpouse;
    if (!insured) {
      add({
        id: 'health-insurance-gap', severity: 'critical', link: 'health-insurance',
        title: `${p.name || 'This person'} may have no health insurance`,
        value: eur(RATES.healthInsurance.voluntaryMonthly) + '/month',
        detail:
          `Estonian health cover follows social tax, not residency. The route that ` +
          `insured a non-working spouse raising a child was abolished on 1 January 2026. ` +
          `Without employment, cover needs a voluntary Tervisekassa contract at ` +
          `${eur(RATES.healthInsurance.voluntaryMonthly)}/month. Cover starts a month after ` +
          `signing and the contract runs for at least a year, so a gap cannot be closed ` +
          `retroactively or bridged for a few weeks.\n\nRegistration alone is not enough: the ` +
          `health-insurance route follows receipt of an unemployment-insurance benefit. From ` +
          `2026 the basic benefit generally needs 8 insured months in the preceding 36; the ` +
          `income-based benefit needs 12. Eligibility must be checked with Töötukassa.`,
      });
    }
  }

  if (!input.excludeCrypto) {
    for (const p of people.filter((x) => (x.assets?.crypto || 0) > 0)) {
      if (!p.assets?.cryptoMicaEligible) {
        add({
          id: `crypto-tax-${p.name}`, severity: 'important', link: 'portfolio',
          title: `${p.name}: crypto tax treatment is not confirmed`,
          value: eur(p.cryptoTaxReserve) + ' gain-tax reserve',
          detail: `The plan reserves 22% of gains using the entered cost basis. Loss offsets and ` +
            `investment-account eligibility depend on acquisition through a MiCA-authorised ` +
            `provider; confirm the provider and transaction date before counting the balance.`,
        });
      }
    }
  }

  const hasDependents = !!hh.hasDependents;
  const takingMortgage = !!hh.property?.purchase;

  // Leaning on the pension is a legitimate choice, but it introduces failure
  // modes the perpetual model does not have. Each one gets said out loud.
  if (sim.fi.bridging && Number.isFinite(sim.timeline.yearsToFi)) {
    if (sim.fi.policy === 'all') {
      const stateShare = people.reduce((x, p) => x + p.statePensionIncome, 0) /
        (sim.fi.pensionIncomeAtUnlock || 1);
      add({
        id: 'depends-on-state-pension', severity: 'important', link: 'pensions',
        title: 'The plan depends on the state pension',
        value: pct(stateShare) + ' of pension income',
        detail:
          `⚠ Our figure follows the published formula and reconciles exactly with the ` +
          `government's own 44-year benchmark and worked examples — but Sotsiaalkindlustusamet's ` +
          `calculator returns materially less for a young cohort, and that disagreement is not ` +
          `yet resolved. Check your own case at sotsiaalkindlustusamet.ee before relying on this ` +
          `line, and consider believing the state pension at less than 100% until you have.\n\n` +
          `Pillar I is a promise, not an account: it is funded by whoever is working at the ` +
          `time and is indexed 80% to social tax receipts. Estonia's ratio of workers to ` +
          `pensioners worsens across this plan's horizon, and the entitlement can be changed ` +
          `without touching anyone's balance. Pillars II and III carry no such risk — they are ` +
          `your money in your own account. Switching to "Pillars II & III only" shows what the ` +
          `plan looks like if the state pension disappears.`,
      });
    }

    if (sim.fi.pillarPayout === 'fundPension' && sim.fi.pillarIncomeEndsAge) {
      const endAge = sim.fi.pillarIncomeEndsAge;
      const alone = Math.max(0, sim.assumptions.planToAge - endAge);
      add({
        id: 'payout-runs-out', severity: 'important', link: 'pensions',
        title: `Pension pots run dry at ${endAge.toFixed(0)}`,
        value: `${alone.toFixed(0)} years to cover after`,
        detail:
          `A fund pension is paced over the recommended duration and then stops — it is not a ` +
          `lifetime income. From ${Math.round(sim.fi.pillarIncomeEndsYear)} the portfolio carries ` +
          `the household again${sim.fi.policy === 'all' ? ', with only the state pension alongside it' : ' alone'}, ` +
          `for the last ${alone.toFixed(0)} years to ${sim.assumptions.planToAge}. That is priced ` +
          `into the target above. The advantage ` +
          `is that it depends on no insurer: you take it through your own pension fund.`,
      });
    }

    // The portfolio is deliberately run down to meet the pension. That makes a
    // bad first decade unrecoverable in a way the perpetual target is not.
    const bridge = sim.timeline.bridgeYears;
    if (bridge > 0) {
      add({
        id: 'bridge-sequence-risk', severity: 'info', link: 'risks',
        title: `${bridge.toFixed(0)} years on the portfolio alone`,
        value: eur(sim.spending.perpetual) + '/yr',
        detail:
          `Between stopping work and the pillars unlocking there is no income and the portfolio ` +
          `is being spent down on purpose. A poor first decade cannot be recovered from, because ` +
          `there is nothing to add and no time to wait. Hold the bridge years in something less ` +
          `volatile than the rest, and be willing to earn something in a bad opening stretch.`,
      });
    }
  }

  if (sim.fi.countsPots) {
    for (const p of people) {
      if (!p.pensionTermsKnown) {
        add({
          id: `pension-terms-${p.name}`, severity: 'critical', link: 'pensions',
          title: `${p.name}: pension income cannot be verified`,
          value: 'excluded from the plan',
          detail: `Enter the recommended tax-free duration returned by Pensionikeskus. It depends on ` +
              `age, sex and the applicable Statistics Estonia life table.`,
        });
      }
      if (!p.pillar3EligibilityKnown) {
        add({
          id: `pillar3-date-${p.name}`, severity: 'critical', link: 'pensions',
          title: `${p.name}: Pillar III access date is unknown`,
          value: 'Pillar III income excluded',
          detail: `Enter the year of the first Pillar III contribution. Accounts first funded by ` +
            `2020 and those first funded from 2021 have different favorable-withdrawal ages, and ` +
            `the five-year holding condition also applies.`,
        });
      }
    }
  }

  // A coefficient in the hundreds can only be the portal's three-decimal display
  // entered without dividing. Silently accepting it would produce a state pension
  // of hundreds of thousands a month, presented with a straight face.
  for (const p of people) {
    if (p.pillar1UnitsKnown && p.pillar1UnitsSoFar > 200) {
      add({
        id: 'pension-units-scale', severity: 'critical', link: 'pensions',
        title: `${p.name || 'This person'}: the pension units look a thousand times too big`,
        value: p.pillar1UnitsSoFar.toLocaleString('en-IE') + ' entered',
        detail:
          `The law writes these coefficients to three decimals — a year at the average wage earns ` +
          `1,000, meaning one — and the portal often shows them with the separator dropped. A ` +
          `figure like 14620 means 14.620. Divide by a thousand: ` +
          `${(p.pillar1UnitsSoFar / 1000).toFixed(3)} is almost certainly what was meant. A whole ` +
          `career is a few dozen units, never hundreds.`,
      });
    }
  }

  // Asking to draw early and not being allowed to is the most counter-intuitive
  // result in the tool: the shorter the career, the less of it you qualify for.
  if (sim.fi.statePensionEarlyRequested > sim.fi.statePensionEarlyAllowed) {
    const need = RATES.pillar1.earlyDrawingServiceYears[sim.fi.statePensionEarlyRequested];
    const have = Math.max(...people.map((p) => p.yearsWorkedAtFi));
    add({
      id: 'early-pension-service', severity: 'important', link: 'pensions',
      title: sim.fi.statePensionEarlyAllowed === 0
        ? 'Too short a career to draw the state pension early'
        : `Only ${sim.fi.statePensionEarlyAllowed} of the ${sim.fi.statePensionEarlyRequested} years early are allowed`,
      value: `${Math.round(have)} years of service, ${need} needed`,
      detail:
        `Each year of drawing the state pension early demands five more years of service: ` +
        `${Object.entries(RATES.pillar1.earlyDrawingServiceYears)
          .map(([y, n]) => `${n} years for ${y}`).join(', ')}. Stopping work at ` +
        `${Math.min(...people.map((p) => p.ageAtFi)).toFixed(0)} leaves about ${Math.round(have)} ` +
        `years, so the request has been capped rather than ignored. The bind is structural: a ` +
        `short career is the point of retiring early, and it is exactly what disqualifies you ` +
        `here. Working longer may establish eligibility. Any health-cover start must be ` +
        `confirmed separately rather than inferred from this projection.`,
    });
  }

  // Retiring early stops Pillar I accruing. That cost is invisible unless stated.
  if (sim.fi.policy === 'all' && Number.isFinite(sim.timeline.yearsToFi)) {
    for (const p of people) {
      const lost = p.statePensionIfWorkedOn - p.statePensionIncome;
      if (lost > 12 * 25) {
        add({
          id: 'state-pension-forgone', severity: 'info', link: 'pensions',
          title: `${p.name}: stopping early costs state pension`,
          value: eur(lost / 12) + '/month',
          detail:
            `Pillar I accrues per year worked, so stopping at ` +
            `${p.ageAtFi.toFixed(0)} instead of ${p.pension.statePensionAge.toFixed(0)} buys ` +
            `${eur(p.statePensionIncome / 12)} a month rather than ` +
            `${eur(p.statePensionIfWorkedOn / 12)}. That is already priced into the date above — ` +
            `it is the cost of the years, not an oversight.`,
        });
      }
    }
  }
  const uncovered = people.filter((p) => !p.lifeInsurance);
  if ((hasDependents || takingMortgage) && uncovered.length) {
    add({
      id: 'no-life-cover', severity: 'critical', link: 'household',
      title: people.length > 1 && uncovered.length === 1
        ? `${uncovered[0].name} has no life cover`
        : 'No life or disability cover',
      value: takingMortgage ? eur(sim.house.loan) + ' of debt' : 'dependents',
      detail:
        `With dependents${takingMortgage ? ' and a mortgage' : ''}, losing ` +
        `${uncovered.length === people.length ? 'an earner' : escapeHtml(uncovered[0].name)} undoes the ` +
        `whole plan. Term life is cheap at working age and should cover at least the outstanding ` +
        `loan plus several years of household spending, on ` +
        `${people.length > 1 ? 'both adults' : 'the earner'}. Disability cover matters more ` +
        `still: it is likelier than death during working years and the expenses continue.`,
    });
  }

  if (takingMortgage && sim.house.fundingShortfall > 0) {
    add({
      id: 'house-funding-shortfall', severity: 'critical', link: 'property',
      title: 'The planned purchase is not funded',
      value: eur(sim.house.fundingShortfall) + ' short',
      detail: `On the completion date the projected accessible balance does not cover the ` +
        `deposit, transaction and moving costs while retaining the selected emergency reserve. ` +
        `The simulator therefore does not report an FI date.`,
    });
  }

  const houseCash = people.reduce((s, p) => s + (p.assets?.cash || 0), 0);
  if (takingMortgage && hh.property.purchase.monthsAway <= 36 &&
      houseCash < sim.house.totalReserve) {
    add({
      id: 'house-fund-at-risk', severity: 'important', link: 'property',
      title: 'Near-term house reserve is not identified as cash',
      value: eur(sim.house.cashToComplete),
      detail:
        `Entered cash is below the completion reserve, so some funding must come from future ` +
        `saving or investment/brokerage balances. The simulator cannot see their instruments. ` +
        `Confirm that money needed within three years is not exposed to equity drawdown risk.`,
    });
  }

  // --------------------------------------------------------------- important

  for (const p of people) {
    const p3 = p.pillar3;
    if (p3.unclaimed > 1) {
      add({
        id: 'pillar3-unused', severity: 'important', link: 'pensions',
        title: `${p.name || 'You'}: Pillar III allowance not fully used`,
        value: eur(p3.unclaimed) + '/year unclaimed',
        detail:
          `Contributing ${eur(p3.cap)} a year — the lower of 15% of gross and ` +
          `${eur(RATES.pillar3.maxAnnual)} — returns ${eur(p3.maxRefund)} of income tax. ` +
          `The money goes in pre-tax, so it beats the same amount in an investment account ` +
          `even if withdrawn early at the full 22%. Pay by personal transfer rather than ` +
          `payroll deduction if a mortgage application is pending.`,
      });
    }
    if (p3.wasted > 1 && (p.pillar3Annual ?? 0) > 0) {
      add({
        id: 'pillar3-no-refund', severity: 'important', link: 'pensions',
        title: `${p.name || 'This person'}: Pillar III refund is limited`,
        value: eur(p3.refund) + '/year estimated refund',
        detail:
          `The full ${eur(p3.contribution)} payment enters the pension pot, but only ` +
          `${eur(p3.deductible)} is within the modeled deduction allowance. The refund also ` +
          `depends on available income tax. This salary-only estimate excludes other taxable ` +
          `income and deductions; it is not a full tax-return calculation.`,
      });
    }
  }

  const totalInvested = people.reduce((s, p) => s +
    (p.assets?.investmentAccount || 0) + (p.assets?.brokerage || 0), 0);
  const totalLiquid = people.reduce(
    (s, p) => s + (p.assets?.cash || 0) + (p.assets?.investmentAccount || 0) +
      (p.assets?.brokerage || 0), 0);
  if (totalInvested === 0 && totalLiquid > 10_000) {
    add({
      id: 'no-equity', severity: 'important', link: 'portfolio',
      title: 'No invested assets entered',
      value: eur(totalLiquid) + ' liquid',
      detail:
        `Existing cash keeps the entered cash real return, including after FIRE. Future ` +
        `investable savings use the investment return. Check that both assumptions reflect ` +
        `your plan, and enter any actual investment or brokerage balances separately.`,
    });
  }

  // The guarantee is per depositor PER BANK, and the tool is told one cash total
  // with no idea how it is split. So this can only ever be a prompt to check -
  // calling it "unguaranteed" asserts something the model cannot know.
  for (const p of people) {
    const cash = p.assets?.cash || 0;
    if (cash > RATES.protection.depositGuarantee) {
      const banks = Math.ceil(cash / RATES.protection.depositGuarantee);
      add({
        id: 'above-deposit-guarantee', severity: 'info', link: 'protection',
        title: `${p.name || 'You'}: check how many banks the cash sits in`,
        value: `${banks} needed to cover ${eur(cash)}`,
        detail:
          `The guarantee is ${eur(RATES.protection.depositGuarantee)} per depositor ` +
          `<strong>per bank</strong>, so ${eur(cash)} is fully covered across ${banks} ` +
          `${banks === 1 ? 'bank' : 'different banks'} and not covered at all in one. This tool ` +
          `only knows the total, so it cannot tell which — if it is already spread, there is ` +
          `nothing to do here.<br><br>Where it is concentrated, anything above the limit ranks as ` +
          `an ordinary claim and sits in the bail-in queue under the EU resolution rules. ` +
          `A joint account is covered per holder, so a couple gets ` +
          `${eur(2 * RATES.protection.depositGuarantee)} at one bank. A money market fund is a ` +
          `security rather than a deposit, so it falls outside the limit entirely — different ` +
          `risk, not a guaranteed one.`,
      });
    }
  }

  // These two are not optimisations to consider - they describe a purchase the
  // regulator will not permit, so the plan as entered cannot happen. That ranks
  // above anything about using an allowance better.
  if (sim.house && !sim.house.withinLtvLimit) {
    add({
      id: 'ltv-too-high', severity: 'critical', link: 'property',
      title: 'The deposit is too small to borrow against',
      value: pct(sim.house.ltv),
      detail: `Bank of Estonia caps housing loans at ${pct(RATES.mortgage.maxLtv)} LTV ` +
        `(${pct(RATES.mortgage.maxLtvWithKredEx)} with a KredEx guarantee). A larger deposit is needed.`,
    });
  }
  if (sim.house && sim.house.dsti > RATES.mortgage.maxDsti) {
    add({
      id: 'dsti-too-high', severity: 'critical', link: 'property',
      title: 'The loan exceeds the regulatory DSTI baseline',
      value: pct(sim.house.dsti),
      detail: `Stress-tested at ${pct(RATES.mortgage.stressRate)}, payments are ${pct(sim.house.dsti)} ` +
        `of net income against a ${pct(RATES.mortgage.maxDsti)} baseline. A bank would normally ` +
        `decline or require a smaller loan; only its limited regulatory exception quota can depart from it.`,
    });
  }

  // -------------------------------------------------------------- opportunity

  const idleCash = people.reduce((s, p) => s + (p.assets?.cash || 0), 0);
  const excessCash = Math.max(0, idleCash - (sim.house?.totalReserve || 0));
  if (excessCash > 25_000) {
    const spread = Math.max(0,
      RATES.marketRates.moneyMarketFundNet - (a.cashRealReturn || 0));
    const forgone = excessCash * spread;
    add({
      id: 'idle-cash', severity: 'opportunity', link: 'portfolio',
      title: 'Cash earning less than it could',
      value: '~' + eur(forgone) + '/year forgone',
      detail:
        `This compares the cash return entered in the plan with the dated EUR money-market ` +
        `assumption. Check the actual product yield, fees, risk and investment-account eligibility ` +
        `before moving money needed for a known near-term purpose.`,
    });
  }

  for (const p of people) {
    const held = (p.assets?.investmentAccount || 0);
    if (held > 100_000) {
      add({
        id: 'custody-fee', severity: 'info', link: 'portfolio',
        title: `${p.name || 'You'}: check the custody tariff above €100k`,
        value: 'provider-specific',
        detail:
          `This estimate applies only if the assets are held under the LHV-style custody tariff ` +
          `encoded in the assumptions. Providers and instruments differ; verify the actual tariff ` +
          `before treating this as a saving.`,
      });
    }
  }

  const nonEarners = people.filter((p) => !p.employed);
  if (nonEarners.length && people.length > 1) {
    const gross = 12_000;
    const gain = 10_871 + 12 * RATES.healthInsurance.voluntaryMonthly;
    add({
      id: 'partner-could-work', severity: 'opportunity', link: 'household',
      title: 'A second income is worth more than its size suggests',
      value: '~' + eur(gain) + '/year',
      detail:
        `An unused basic exemption means the first ${eur(12 * RATES.basicExemptionMonthly)} of ` +
        `a second salary is free of income tax, netting about 96% against a high earner's ~75% ` +
        `marginal rate. A ${eur(gross)}/year job is worth roughly ${eur(gain)} once the avoided ` +
        `health insurance premium is counted — and it removes the single-income fragility.`,
    });
  }

  if (sim.timeline.coastToPensionUnlock) {
    const c = sim.timeline.coastToPensionUnlock;
    add({
      id: 'coast-fire', severity: 'info', link: 'basics',
      title: c.years <= 0 ? 'You have already reached CoastFIRE' : 'CoastFIRE is within reach',
      value: c.years <= 0 ? 'now' : `age ${c.age.toFixed(0)}`,
      detail:
        `From that point no further accessible-portfolio saving is needed to fund retirement ` +
        `at pension access. Configured earnings and pension contributions continue; spending ` +
        `deficits still draw down assets. A pay cut or career break needs a separate scenario.`,
    });
  }

  // --------------------------------------------------------------------- info

  if (sim.timeline.bridgeYears > 0) {
    add({
      id: 'bridge', severity: 'info', link: 'pensions',
      title: 'Bridge to pension access',
      value: sim.timeline.bridgeYears.toFixed(0) + ' years',
      detail:
        `Pension pillars unlock at the state pension age minus five` +
        (sim.timeline.pensionPerPerson.length > 1
          ? `, and each person has their own date — ` +
            sim.timeline.pensionPerPerson
              .map((x) => `${escapeHtml(x.name)} at ${x.unlockAge.toFixed(0)} in ${Math.round(x.unlockYear)}`)
              .join(', ') + `. The longer wait is the one that binds`
          : `, projected at about ${sim.timeline.pension.pillarUnlockAge.toFixed(0)} for this birth year`) +
        `. Everything before then comes from the investment account — which is why the target ` +
        `above excludes pension balances entirely.`,
    });
  }

  return out.sort((x, y) => SEVERITY_ORDER[x.severity] - SEVERITY_ORDER[y.severity]);
}
