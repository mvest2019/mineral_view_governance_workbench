# Terms, Billing & Refund Governance

> **Status:** ENHANCED (deep) · **Owner:** Legal/Product · **Final approver:** Ryan · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on billing change · **Source:** Terms & Conditions. **Not legal advice; legal review required.**
> **Companion:** `legal-compliance-and-claims-governance.md`, `pricing-and-plan-governance.md`.

---

## 1. Purpose & scope
Govern **billing, refund, subscription, and arbitration wording** so it stays exactly consistent with the Terms. Billing copy is a binding commitment; any drift from the Terms creates an enforceable inconsistency. This file governs the *wording*; the *prices* live in `pricing-and-plan-governance.md`.

## 2. Rules (MUST)
- Billing/refund/subscription copy **matches the Terms exactly**; changes require legal + Ryan.
- Plan/price wording follows the canonical persona × tier matrix; the excluded old-doc pricing section is **not** a source.
- Arbitration (Texas law / Austin), liability cap, renewal terms, and Free-plan specifics are stated per the Terms.
- The 1-lease-free / Free-plan framing matches both the Terms and the pricing model.

## 3. Payment processor (open — Q-B)
Resolve **Braintree** (code) vs **Wells Fargo Cybersource** (site/FAQ) before changing any payment claim or processor reference.

## 4. Prohibited
Implying refunds/guarantees not in the Terms; contradicting arbitration/renewal terms; "money-back guaranteed" unless the Terms say so; processor references that don't match reality.

## 5. QA checklist
☐ Matches Terms ☐ Pricing-consistent (persona × tier) ☐ Processor accurate ☐ Legal-reviewed ☐ No invented guarantees ☐ Renewal/arbitration correct.

## 6. Anti-patterns
Refund promises not in the Terms; processor mismatch; price wording from the excluded doc; renewal terms that contradict the Terms.

## 7. Evidence notes & gaps
Confirmed from the Terms; processor conflict open (Q-B). Counsel review required before adoption.

---

## Deep context (2026-06-30) — billing, tiers, and refunds

**Tiers & billing.** **Free / Pro / Enterprise**; paid plans are recurring subscriptions processed through the configured payment processor (**Braintree**, per security findings). Tier + **claim limits** are enforced in code (`SUBSCRIPTION_PLAN_MAP` / `featureAccess`) and the **server is authoritative**. Terms & Conditions and policy copy are maintained by the content team and **legal-reviewed**.

**Rules (MUST):**
- **Truth in pricing:** prices, claim caps, and feature lists shown to users **match the code config**; any change is **Ryan-approved** before it ships (`pricing-and-plan-governance.md`).
- **Billing transparency:** state the billing cycle, renewal, and cancellation terms clearly; no dark patterns.
- **Refunds:** define the refund window and eligibility in the published policy; honor it consistently; log exceptions.
- **Downgrade/cancellation:** define what happens to existing **claims/portfolio access** on downgrade or cancellation (don't silently delete owner data).
- **Payment security:** PCI handled by the processor; no card data or payment secrets in code/logs (`security-governance.md`).
- **Texas/again no advice:** billing/terms don't make investment claims; estimates remain labeled.
