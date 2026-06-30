# Forms, Contact & Conversion Governance

> **Status:** ENHANCED (deep) · **Owner:** Product/Frontend · **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly
> **Companion:** `contact-information-governance.md`, `privacy-and-data-use-governance.md`, `event-tracking-and-dashboard-governance.md`, `free-tier-and-upgrade-path-governance.md`.

---

## 1. Purpose & scope
Govern forms, lead capture, CTAs, and conversion paths — balancing conversion with **privacy** and **honest messaging**. Forms are where PII enters the system, so they inherit the privacy rules; CTAs are where claims/urgency live, so they inherit the constitution.

## 2. Form rules (MUST)
- Labeled, accessible fields with clear required markers. **Phone is required + validated** at registration (the asterisk is visual; `required` + server-side validation enforce it).
- Validate **client and server side**; never trust client-only validation.
- Collect only the data needed; honor the Privacy Policy; **no PII in URLs, query strings, or logs**.
- Clear confirmation and error states, implemented as in-app modals/toasts (not browser dialogs).

## 3. CTA & conversion rules
One **primary** CTA per view (claim / sign up / upgrade / contact). Upgrade CTAs follow `free-tier-and-upgrade-path-governance.md` — state the real limit and benefit, match canonical pricing, **no false urgency, no guaranteed value**.

## 4. Tracking
Track conversions per `event-tracking-and-dashboard-governance.md`; respect consent/privacy; **no PII** in event names or payloads.

## 5. QA checklist
☐ Labeled/accessible fields ☐ Client + server validation ☐ Minimal data collected ☐ No PII in URL/logs ☐ Confirmation/error states ☐ One primary CTA ☐ Compliant upgrade copy ☐ Consent-respecting tracking.

## 6. Anti-patterns
Client-only validation; PII in URLs/query strings; competing CTAs; false-urgency upgrade copy; over-collecting data; browser-dialog confirmations.

## 7. Evidence notes & gaps
Confirmed from registration/profile work + the contact page; the phone-required + validation decision is confirmed from prior work.

---

## Deep context (2026-06-30) — forms, conversion, and engagement popups

Forms (signup, claim, contact, newsletter) and **visit-based engagement popups** are the conversion layer.

**Rules (MUST):**
- **Three-layer validation:** visual indicator (required asterisk) **and** HTML `required` enforcement **and** **server-side validation** — all three; never trust the client alone.
- **Conversion honesty:** CTAs reflect real next steps (search → claim → upgrade); no misleading urgency; **claim-state-aware** messaging (don't prompt a claimed user to claim).
- **Engagement popups:** the visit-count popup system targets by activity/visit count with interaction tracking — frequency-capped and dismissible; never blocks core tasks; respects the analytics/privacy line.
- **PII & security:** form data follows `privacy-and-data-use-governance.md`; endpoints are rate-limited and spam-protected; submissions don't put PII in URLs.
- **Accessibility:** labeled fields, focus management, keyboard support, clear error states (`accessibility-governance.md`).
