// Standalone pension calculator. Answers "what does this job do for my
// pension?" without needing a full household plan.

import { pillarProjection, netFromGross, pillar1Monthly } from './calc.js';
import { RATES } from './rates.js';
import { eur, pct, pct1 } from './format.js';
import { infoBtn, infoRow, infoNote, bindExplain } from './explain.js';

const $ = (id) => document.getElementById(id);
const read = () => ({
  birthYear: +$('birthYear').value || 1990,
  grossMonthly: +$('gross').value || 0,
  workUntilAge: +$('until').value || 63,
  pillar2Rate: +$('rate').value || 0.02,
  startingPillar2: +$('have2').value || 0,
  startingPillar3: +$('have3').value || 0,
  pillar3Annual: +$('p3').value || 0,
  realReturn: (+$('ret').value || 5) / 100,
  uninsured: $('uninsured').checked,
  currentYear: new Date().getFullYear(),
});

function render() {
  const input = read();
  if (!input.grossMonthly) {
    $('out').innerHTML = '<p class="empty">Enter a gross salary to see what it produces.</p>';
    return;
  }
  const r = pillarProjection(input);
  const c = r.contributions;

  // The same salary at each of the three permitted Pillar II rates.
  const rows = RATES.pillar2.employeeRates.map((rate) => {
    const alt = pillarProjection({ ...input, pillar2Rate: rate });
    return { rate, alt };
  });

  // Marginal value of the first euros of salary: the basic exemption means a
  // small wage is taxed far more lightly than a large one.
  const takeHomeShare = r.tax.gross > 0 ? r.tax.net / r.tax.gross : 0;

  // Employment also carries health cover. For someone who would otherwise buy a
  // voluntary contract that is real money, and it arrives now rather than at 63.
  // What Pillar II membership costs in state pension: the same career accrues
  // 20% less, because 16% of gross reaches Pillar I rather than 20%.
  const yearsWorked = Math.max(0, r.yearsWorking + (input.birthYear
    ? Math.max(0, (input.currentYear - input.birthYear) - 25) : 0));
  const grossAnnual = input.grossMonthly * 12;
  const pillar1Cost = 12 * (
    pillar1Monthly({ grossAnnual, futureYears: yearsWorked, serviceYears: yearsWorked,
      inPillar2: false }) -
    pillar1Monthly({ grossAnnual, futureYears: yearsWorked, serviceYears: yearsWorked,
      inPillar2: true }));

  const healthMonthly = input.uninsured ? RATES.healthInsurance.voluntaryMonthly : 0;
  const cashPerMonth = r.tax.net / 12 + healthMonthly;

  $('out').innerHTML = `
    <div class="stat-row">
      <div class="stat"><b>${eur(r.total)}</b><span>pension pot at ${r.unlockAge.toFixed(0)}</span></div>
      <div class="stat"><b>${eur(r.monthlyPension)}</b><span>20-year division — not an annuity quote*</span></div>
      <div class="stat"><b>${eur(c.totalAnnual / 12)}</b><span>going in each month</span></div>
      <div class="stat"><b>${eur(cashPerMonth)}</b><span>cash value per month</span></div>
    </div>
    ${!r.pensionAgeConfirmed && r.pensionAgeRange ? `<p class="warning">The retirement age is not yet official. The calculator uses a midpoint scenario; the currently supportable state-pension-age range is ${r.pensionAgeRange.min.toFixed(1)}–${r.pensionAgeRange.max.toFixed(1)}. Stress-test both ends.</p>` : ''}

    <h3>What the job is worth ${infoBtn('worth')}</h3>
    ${infoNote('worth', `A salary pays more than the salary. Alongside the net pay there is the
      state's ${pct(RATES.pillar2.stateRate)} of gross into Pillar II — money that exists only while
      you are employed — and health cover, which otherwise has to be bought. This adds up what the
      job is really worth, separating what arrives now from what is deferred to unlock age.`)}
    <table class="mini">
      <tr><th>Net salary</th><td>${eur(r.tax.net / 12)}/mo</td></tr>
      ${healthMonthly ? `<tr><th>Health insurance included <span class="muted">no separate contract to pay for</span></th><td><strong>${eur(healthMonthly)}/mo</strong></td></tr>` : ''}
      <tr><th><strong>Cash value now</strong></th><td><strong>${eur(cashPerMonth)}/mo</strong></td></tr>
      <tr class="thead"><th>Deferred, on top</th><td></td></tr>
      <tr><th>Into Pillar II <span class="muted">yours ${eur(c.ownMonthly)} + the state's ${eur(c.stateMonthly)}</span></th><td>${eur(c.totalAnnual / 12)}/mo</td></tr>
      ${c.refund ? `<tr><th>Pillar III refund</th><td>${eur(c.refund / 12)}/mo</td></tr>` : ''}
    </table>
    <p class="hint">${healthMonthly
      ? `Employment carries health cover with it, which is the part most easily missed. At
         ${eur(healthMonthly)} a month it is worth ${pct(healthMonthly / (cashPerMonth || 1))} of
         what the job is really paying, and unlike the pension it arrives immediately rather than
         at ${r.unlockAge.toFixed(0)}. On this salary the job keeps ${pct(takeHomeShare)} of gross
         as pay, and the cover comes on top of that.`
      : `Keeping ${pct(takeHomeShare)} of gross as pay. A high earner keeps about 75% of each
         additional euro — the basic exemption is why lower salaries keep more.`}</p>

    <h3>Where the money comes from ${infoBtn('sources')}</h3>
    ${infoNote('sources', `Of everything landing in your pensions each month, only part is yours.
      The state's ${pct(RATES.pillar2.stateRate)} is fixed and does <em>not</em> rise when you raise
      your own rate, and the Pillar III refund is income tax you would otherwise have paid. This
      separates the three so the real out-of-pocket cost is visible.`)}
    <table class="mini">
      <tr><th>Your Pillar II <span class="muted">${pct1(input.pillar2Rate)} of gross</span></th><td>${eur(c.ownMonthly)}/mo</td></tr>
      <tr><th>Pillar III${c.pillar3Annual ? '' : ' <span class="muted">not using it</span>'}</th><td>${eur(c.pillar3Annual / 12)}/mo</td></tr>
      <tr><th>Less the Pillar III tax refund</th><td>${c.refund ? '−' + eur(c.refund / 12) : eur(0)}/mo</td></tr>
      <tr><th><strong>Out of your own pocket</strong></th><td><strong>${eur(r.netCostAnnual / 12)}/mo</strong></td></tr>
      <tr class="thead"><th>Added by the state</th><td></td></tr>
      <tr><th>Pillar II <span class="muted">${pct1(RATES.pillar2.stateRate)} of gross, only while employed</span></th><td><strong>${eur(c.stateMonthly)}/mo</strong></td></tr>

      <tr><th><strong>Total going into pensions</strong></th><td><strong>${eur((r.netCostAnnual + c.stateAnnual + c.refund) / 12)}/mo</strong></td></tr>
      <tr><th>Paying in for</th><td>${r.yearsWorking.toFixed(0)} years, unlocking ${Math.round(r.unlockYear)}</td></tr>
      ${pillar1Cost > 1 ? `
      <tr class="thead"><th>What membership costs elsewhere</th><td></td></tr>
      <tr><th>State pension given up ${infoBtn('diverted')} <span class="muted">the state's share is diverted from it, not added to it</span></th><td>−${eur(pillar1Cost / 12)}/mo</td></tr>` : ''}
    </table>
    ${infoNote('diverted', `The state's ${pct1(RATES.pillar2.stateRate)} is not additional money. RPKS §13¹(1)
      sends ${pct(0.16)} of your gross into the state pension instead of ${pct(0.20)} once you are a
      Pillar II member — the missing four points are what lands in your own fund. Both halves of the
      Pillar I accrual formula fall by that same 16/20, so being a member earns you exactly
      <strong>${pct(1 - RATES.pillar1.pillar2MemberFactor)} less</strong> state pension for identical
      earnings.<br><br>On this salary that is ${eur(pillar1Cost / 12)} a month of state pension given
      up, against ${eur(c.stateMonthly)} a month going into your own fund — plus your own
      contribution, plus decades of compounding, which is what it has to beat. Note the cost comes
      from <em>membership</em>, not from your rate: moving from
      ${pct1(RATES.pillar2.employeeRates[0])} to ${pct1(RATES.pillar2.employeeRates[2])} adds
      nothing to it.`)}

    <p class="hint">${c.pillar3Annual
      ? `Of every ${eur((r.netCostAnnual + c.stateAnnual + c.refund) / 12)} going in, ${eur(r.netCostAnnual / 12)} is yours — the rest is the state's contribution and the tax refund.`
      : `The state puts ${(c.stateAnnual / (r.netCostAnnual || 1)).toFixed(1)}× your own contribution into
         the fund, and only while you are employed — but it is moved out of your state pension
         rather than added on top. Do not net the two: ${eur(c.stateMonthly)}/mo going in now is not
         the same kind of thing as ${eur(pillar1Cost / 12)}/mo of indexed pension from
         ${r.unlockAge.toFixed(0)}. The comparison that settles it is the pot above against that
         income — ${eur(r.total)} of fund, built from money that would otherwise have bought
         ${eur(pillar1Cost / 12)}/mo for life.`}</p>

    <h3>Take-home on this salary ${infoBtn('takehome')}</h3>
    ${infoNote('takehome', `Estonia's income tax is flat at ${pct(RATES.incomeTax)}, but the first
      €${(12 * RATES.basicExemptionMonthly).toLocaleString()} a year is exempt for everyone — so the
      <em>effective</em> rate rises with the salary and a modest wage keeps far more of itself
      proportionally. Pillar II is listed as a deduction because it leaves your pay packet, though
      unlike tax it is still your money.`)}
    <table class="mini">
      <tr><th>Gross</th><td>${eur(r.tax.gross / 12)}/mo</td></tr>
      <tr><th>Income tax <span class="muted">after the €${(12 * RATES.basicExemptionMonthly).toLocaleString()} exemption</span></th><td>−${eur(r.tax.incomeTax / 12)}/mo</td></tr>
      <tr><th>Unemployment insurance + Pillar II</th><td>−${eur((r.tax.unemploymentInsurance + r.tax.pillar2Employee) / 12)}/mo</td></tr>
      <tr><th><strong>Net</strong></th><td><strong>${eur(r.tax.net / 12)}/mo</strong></td></tr>
    </table>
    <p class="hint">${takeHomeShare > 0.9
      ? `At this level almost the whole salary survives — the basic exemption absorbs most of it.
         A high earner keeps about 75% of each additional euro.`
      : `The basic exemption covers the first €${(12 * RATES.basicExemptionMonthly).toLocaleString()}
         of gross regardless of what else you earn, which is why lower salaries keep a larger share.`}</p>

    ${(() => {
      // Show what Pillar III could add even when nothing is entered - otherwise
      // the option is invisible to the person who most needs to see it.
      const maxed = pillarProjection({ ...input, pillar3Annual: RATES.pillar3.maxAnnual });
      const cap = maxed.pillar3.cap;
      const refund = maxed.pillar3.refund;
      if (cap < 1) return '';
      const already = c.pillar3Annual >= cap - 1;
      const capReason = cap < RATES.pillar3.maxAnnual
        ? `15% of gross` : `the €${RATES.pillar3.maxAnnual.toLocaleString()} annual cap`;
      const wasted = cap * RATES.pillar3.refundRate - refund;
      return `
    <h3>${already ? 'Pillar III — already at the limit' : 'What Pillar III could add'}</h3>
    <table class="mini">
      <tr><th>Most you could pay in <span class="muted">limited by ${capReason}</span></th><td>${eur(cap)}/yr</td></tr>
      <tr><th>Income tax back <span class="muted">at ${pct(RATES.pillar3.refundRate)}</span></th><td><strong>${refund > 0 ? '+' + eur(refund) + '/yr' : 'nothing'}</strong></td></tr>
      <tr><th>Real cost after the refund</th><td>${eur(cap - refund)}/yr</td></tr>
      <tr><th>Pot at ${r.unlockAge.toFixed(0)} if maxed</th><td>${eur(maxed.total)} <span class="muted">vs ${eur(r.total)}</span></td></tr>
    </table>
    ${(() => {
      // Where the salary sits relative to the points at which Pillar III starts
      // to pay. Derived from the rates rather than hard-coded, so a change to
      // the exemption or the deduction share carries through.
      const ded = RATES.unemploymentInsuranceEmployee + input.pillar2Rate;
      const exempt = 12 * RATES.basicExemptionMonthly;
      const noTaxBelow = exempt / (1 - ded) / 12;
      const fullFrom = exempt / (1 - ded - RATES.pillar3.maxShareOfGross) / 12;
      const capBinds = RATES.pillar3.maxAnnual / RATES.pillar3.maxShareOfGross / 12;
      const g = input.grossMonthly;
      const band = g < noTaxBelow ? 0 : g < fullFrom ? 1 : g < capBinds ? 2 : 3;
      const row = (i, label, detail) =>
        `<tr class="${i === band ? 'here' : ''}"><th>${label}</th><td>${detail}</td></tr>`;
      return `
    <h4>When Pillar III starts paying ${infoBtn('bands')}</h4>
    ${infoNote('bands', `The refund is capped by the income tax you actually paid, so on a small
      salary Pillar III returns little or nothing — it would just be locking money away. These are
      the salary bands where that changes. The row in bold is where this salary falls.`)}
    <table class="mini thresholds">
      <tr class="thead"><th>Gross salary, before tax</th><td>What the refund does</td></tr>
      ${row(0, `Below ${eur(noTaxBelow)}/mo`, 'no income tax is paid, so nothing to refund')}
      ${row(1, `${eur(noTaxBelow)}–${eur(fullFrom)}/mo`, 'partial refund, limited by the tax paid')}
      ${row(2, `From ${eur(fullFrom)}/mo`, `full ${pct(RATES.pillar3.refundRate)} on the whole allowance`)}
      ${row(3, `From ${eur(capBinds)}/mo`, `the €${RATES.pillar3.maxAnnual.toLocaleString()} cap binds instead of ${pct(RATES.pillar3.maxShareOfGross)} of gross`)}
    </table>
    <p class="hint">The allowance is the <strong>lower of ${pct(RATES.pillar3.maxShareOfGross)} of gross
      and €${RATES.pillar3.maxAnnual.toLocaleString()}</strong>, refunded at ${pct(RATES.pillar3.refundRate)} —
      so the most anyone can get back is <strong>€${(RATES.pillar3.maxAnnual * RATES.pillar3.refundRate).toLocaleString()}
      a year</strong>. It is per earner and cannot be transferred to a spouse. The row in bold is
      where this salary falls.</p>`;
    })()}

    <p class="hint">${
      refund <= 0
        ? `On this salary there is no income tax left to refund, so Pillar III returns nothing —
           it would just be locking money away. Contribute in the higher earner's name instead;
           the allowance cannot be transferred between spouses.`
        : wasted > 1
          ? `The refund is capped by the income tax actually paid, so ${eur(wasted)} of the
             nominal 22% is unusable at this salary.`
          : `That is a guaranteed ${pct(RATES.pillar3.refundRate)} back on money you were going to
             save anyway. It is locked until ${r.unlockAge.toFixed(0)}, but taken then it is taxed
             at 10% rather than 22% — and 0% as a lifetime annuity.`}</p>`;
    })()}

    <h3>If the Pillar II rate changed ${infoBtn('rates')}</h3>
    ${infoNote('rates', `You may contribute ${RATES.pillar2.employeeRates.map((r) => pct1(r)).join(', ')}
      of gross, changed by 30 November for the following January. Raising it buys more pension but
      <strong>no extra match</strong> — the state's ${pct(RATES.pillar2.stateRate)} is fixed — and it
      locks the money until unlock age. Compare against putting the same amount in an investment
      account, which stays reachable.`)}
    <table class="mini">
      <tr><th>Rate</th><td>Pot at ${r.unlockAge.toFixed(0)} · out of pocket</td></tr>
      ${rows.map(({ rate, alt }) => `
        <tr><th>${pct1(rate)}${rate === input.pillar2Rate ? ' <span class="muted">current</span>' : ''}</th>
        <td>${eur(alt.total)} · ${eur(alt.netCostAnnual / 12)}/mo</td></tr>`).join('')}
    </table>
    <p class="hint">The state's 4% does <em>not</em> rise with your own rate — it is fixed. Raising
      your contribution buys more pension, but no extra match, and it locks the money until
      ${r.unlockAge.toFixed(0)}.</p>

    <p class="hint">* Qualifying lifetime or recommended-duration payments can be taxed at
      <strong>0%</strong>; a lump sum is generally taxed at 10%. The displayed monthly amount is
      only the pot divided by ${r.payoutYears} years for scale. It is neither an insurer quote nor
      the official Pensionikeskus duration and must not be used as expected pension income.</p>
  `;
}

bindExplain(render);
document.addEventListener('input', render);
document.addEventListener('change', render);
render();
