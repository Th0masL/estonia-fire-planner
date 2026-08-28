# Crypto

Worth knowing precisely, because the rules are unusually unforgiving and easy to get wrong.

> 🟢 **Changed from 1 January 2025:** qualifying crypto acquired through a MiCA-authorised service provider can be treated as a financial asset. If bought with funds from a declared investment account, it can use normal investment-account deferral. Provider authorisation and the acquisition route must be checked for the actual transaction.

| | Treatment |
|---|---|
| Investment account eligible? | **Yes, conditionally** — must be acquired via a **MiCA-licensed** provider with IK funds |
| Tax on disposal (outside an IK) | **22%** on the gain |
| What counts as a disposal | Selling to EUR, **swapping one coin for another**, and spending it |
| **Loss offset** | **Conditional.** Allowed for qualifying crypto transactions through a MiCA-authorised provider; not allowed under the older "other property" treatment |
| Gain on a swap | Market value received **minus acquisition cost** of what you gave up |
| Mining | **Business income**, Form E |
| Staking | Ordinary income at market value on the date received |
| Reporting | Table 6.3 (Estonian) / 8.3 (foreign platforms), or **6.5 if inside an IK** |
| Long-term holding relief | None |
| Provider constraint | Verify that the provider was MiCA-authorised on the acquisition date. The simulator does not infer this from the custodian name |

**The no-loss-offset rule still applies to non-qualifying holdings.** For crypto remaining under the older “other property” treatment, a losing disposal cannot reduce a gain. Qualifying MiCA-provider transactions receive financial-asset treatment instead. Keep the provider authorisation and acquisition evidence: the distinction is transaction-specific.

**The catch for coins bought before the change.** The new eligibility applies to crypto *acquired* through a licensed provider using investment-account money. **Self-custodied coins bought outside that route stay under the old regime** — 22% on every disposal, no loss offset. Coins in a hardware wallet cannot be moved into an investment account without being sold first, and that sale is itself the taxable event the account is meant to defer. So the change improves the tax treatment of future purchases only. It does nothing for coins bought earlier.

**Consequences for planning:**

- Self-custodied crypto bought outside the regime stays the **least tax-efficient** holding available, and the hardest to restructure
- **Every swap is a taxable event.** Rebalancing between coins costs real money in a way that rebalancing inside an IK does not
- There's **no tax reason to delay diversifying out.** No holding-period relief exists, so the decision is purely about your market view, not tax timing
- Reconstruct your **cost basis now**, while records are still retrievable. Doing it years later, after exchanges have shut down or purged history, is genuinely painful
- If you buy more crypto in future, **route it through the IK via a MiCA-licensed provider** — same asset, materially better tax treatment
- If crypto is funding the house deposit, see [property-purchase.md](property-purchase.md#funding-the-down-payment-from-crypto)
