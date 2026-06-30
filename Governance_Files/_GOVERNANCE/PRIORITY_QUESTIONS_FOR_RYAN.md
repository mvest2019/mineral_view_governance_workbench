# Mineral View — Priority Questions For Ryan

Status: LIVE
Owner: Ryan Cochran (final authority)
Last Updated: 2026-06-16
Applies To: Mineral View only

Org-wide open questions from the deep repo review, highest priority first. Each answered
question becomes a Decision (D-####) once approved.

---

### Q-0001 — Rotate exposed secrets and keys [CRITICAL]
Secrets, env files, AI/Cloudinary/Braintree keys, and a TLS private key are committed across repos. Approve immediate rotation, secret-store migration, and history scrub? **See:** `_SECURITY_RISK_REGISTER.md`, `Engineering_Standards.md`.

### Q-0002 — Which PresentationSiteAPI branch is canonical? [HIGH]
`Master` vs `Mview_Prod` differ (Mview_Prod has `db/migrations`). Which is production truth, and can the other be retired?

### Q-0003 — Confirm canonical subscription tiers and limits [HIGH]
Code says `Anonymous / Free / Pro / Premium` (+ Enterprise); the briefing says `Access / Insights / Pro`. What are the canonical customer-facing names, the persona↔tier mapping, and the exact per-tier feature/usage limits? **See:** `Pricing_And_Tiers_Policy.md`, `Customer_Communication_Style_Guide.md`.

### Q-0004 — Govern the "act-as" impersonation feature [HIGH]
Who is allowed to use `act-as-login`? Confirm it is restricted to named staff and fully audit-logged.

### Q-0005 — Single source for tier/feature gating? [MEDIUM]
`featureAccess` lives in two codebases. Approve centralizing the tier/limit definition so all surfaces read one model?

### Q-0006 — Single source for GIS/map logic? [MEDIUM]
Lease/well/nearby logic appears in three services. Should `MviewMapAPI` be the single source (others call it), or is the split intentional?

### Q-0007 — Confirm the Monthly Owner Report path [MEDIUM]
Is `sendMonthlyReportEmails.js` (PortalAPI) the canonical Monthly Owner Report generator the owner-intelligence effort should build on, routed through the corpus playbooks?

### Q-0008 — Document the data topology [MEDIUM]
What does each of the up-to-8 Mongo databases and 3 Postgres connections hold? Needed for `_SYSTEM_MAP.md`, backups, and the dossier build.

### Q-0009 — Cerebro scope and access [MEDIUM]
What exactly does `Mview-Cerebro-web` manage (users, leases, news), who uses it, and what are its access controls?

### Q-0010 — Is `comprehensive-lease-data.json` real or synthetic? [MEDIUM]
If it contains real lease data, it should move out of source control.

### Q-0011 — SEO landing pages and the no-advice guardrails [LOW]
Generated operator/county/owner pages are a major funnel. Confirm they respect the non-negotiables (no advice, estimates labeled).

### Q-0012 — Is sponsored advertising still a live revenue line? [LOW]
`SponsoredAdvertise` exists in the portal API — keep, deprecate, or document?

### Q-0013 — Who confirms analytics methodology? [MEDIUM]
The playbooks (decline, revenue, pricing, acre/well, spatial, materiality thresholds) need an SME to fill the `TODO` formulas. Who is that person, and do you approve the method before it ships?

### Q-0014 — Where is ChatGPT used today? [MEDIUM]
`Chat_GPT_KEY` is integrated. Which features call it, and should its output be brought under the corpus + non-negotiables now?
