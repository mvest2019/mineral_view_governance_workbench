# Mineral View — Security Risk Register

Status: LIVE
Owner: Ryan Cochran (final authority)
Last Updated: 2026-06-16
Applies To: Mineral View only

Each risk is a `### <heading>` block with a `**Severity:**` line (CRITICAL / HIGH / MEDIUM).
No secret values are recorded here — only the risk and the fix.

### Application secrets committed in repositories
**Severity:** CRITICAL
**Observation:** `.env`, `production_env.txt`, `staging_env.txt`, and `*-config.txt` are committed across repos, exposing DB connection strings, `JWT_SECRET`, Braintree `MERCHENT_ID`, `Chat_GPT_KEY`, `CLOUDINARY_API_SECRET`, `PUBLIC_API_SECRET`, and Google/Microsoft client secrets.
**Impact:** Anyone with repo access gains production credentials — full data, payment, AI, and email exposure.
**Recommended action:** Rotate every exposed secret now; move to a secret store / environment variables; add to `.gitignore`; scrub git history.

### TLS private key and certificate committed
**Severity:** CRITICAL
**Observation:** `key.pem`, `server.crt`, and `csr.pem` are present in the PresentationSiteAPI repos.
**Impact:** A leaked private key allows impersonation and potential decryption of TLS traffic.
**Recommended action:** Treat the key as compromised, reissue the certificate, remove key material from the repo and history.

### Internal "act-as" user impersonation
**Severity:** HIGH
**Observation:** `act-as` / `act-as-login` endpoints and `internalActAsService` let internal users operate as any member.
**Impact:** Without tight restriction and auditing, it enables privacy violations and cross-customer data exposure.
**Recommended action:** Restrict to named staff roles, require full audit logging of every act-as session, document the policy.

### Unrestricted CORS on the portal API
**Severity:** HIGH
**Observation:** `MViewPortalAPI` uses `app.use(cors())` with no allowed-origin restriction.
**Impact:** Any website can call the API from a user's browser, enabling cross-origin abuse.
**Recommended action:** Restrict CORS to the known Mineral View front-end origins.

### Third-party API keys for AI and media committed
**Severity:** HIGH
**Observation:** `Chat_GPT_KEY` (OpenAI) and `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` appear in committed config.
**Impact:** Stolen keys allow billed usage and content manipulation under Mineral View's accounts.
**Recommended action:** Rotate, move to a secret store, monitor usage.

### Payment credentials exposure (Braintree)
**Severity:** HIGH
**Observation:** Braintree `MERCHENT_ID` and related config sit in committed files.
**Impact:** Payment-system configuration exposure; combined with other secrets raises fraud risk.
**Recommended action:** Rotate Braintree credentials; isolate payment config in the secret store.

### Divergent production branches
**Severity:** MEDIUM
**Observation:** Two long-lived branches of `PresentationSiteAPI` (`Master`, `Mview_Prod`) differ.
**Impact:** Security fixes applied to one branch may never reach the other.
**Recommended action:** Pick one canonical branch; reconcile and retire the other.

### Tier/feature limits enforced in two codebases
**Severity:** MEDIUM
**Observation:** `featureAccess` middleware is duplicated across `MviewMapAPI` and `PresentationSiteAPI`.
**Impact:** Inconsistent enforcement could let a tier exceed paid limits on one surface.
**Recommended action:** Centralize the tier/limit definition; have both read the same source.

### Bundled data fixtures in source control
**Severity:** MEDIUM
**Observation:** Files such as `comprehensive-lease-data.json` ship inside a repo.
**Impact:** Real data in source control can leak and bloat history.
**Recommended action:** Confirm whether the data is synthetic; if real, move it out of the repo.

### Undocumented multi-database topology
**Severity:** MEDIUM
**Observation:** Up to 8 Mongo databases and 3 Postgres connections are referenced without documentation.
**Impact:** Unclear data ownership complicates access control, backups, and incident response.
**Recommended action:** Document each database's purpose and access scope in `_SYSTEM_MAP.md`.
