# Academy inquiry CRM — staged, NOT live

Status: **2026-10-11**. Work is isolated on the `academy-private-inquiries-crm-staging-20261011` branch. The live homepage still prepares an email draft.

## Prepared
- `database/academy_inquiries_STAGING.sql`: constrained inquiry table and RLS. **No anonymous database grants.** Authenticated manager/owner can view, edit status or handle deletion.
- `supabase/functions/academy-inquiry/index.ts`: server-side public intake endpoint. It keeps the service-role key in the Edge runtime, checks input, enforces consent, supports a honeypot and limited fingerprint/email throttling.
- Homepage `assets/js/app.js`: an opt-in form submission implementation exists but `INQUIRY_CRM_ENABLED=false` by design, retaining the existing email-draft workflow until the owner approves the data processing text.
- `/platform/`: manager-only inquiries inbox with simple new/contacted/closed states. The inbox should not be merged live before the table exists.
- Regression tests verify private table access, opt-in flag and no anonymous client data reads.

## Important security limitations
- The Edge endpoint is **not deployed**, because the legal notice and cross-border storage arrangements have not been signed off. It must not be treated as a live lead collector.
- Origin allowlists and one-per-hour email throttling are not authentication or complete abuse prevention. Set an appropriate CAPTCHA/WAF, rate limits, monitoring, and operational retention/deletion before promotion.
- Salted daily IP hashes are still potentially personal data; limit access and disclose them in the final notice.
- Data collection must **not** be enabled by merely flipping `INQUIRY_CRM_ENABLED`. Apply schema, deploy function with reviewed settings, add an approved privacy notice and contact consent, then run real submissions and privacy tests first.
- Supabase project is shared with the original Eryaman Speaking Club. Do not touch the original tables or secrets.

## Owner input required prior to launch
1. Legal data-controller name, address, contact details, approved retention duration, required notices and lawful basis; legal review of KVKK and international data transfer.
2. Domain and sender email (the current marketing identity is provisional).
3. Whether an anti-bot provider such as Turnstile will be configured, and which domain should be allowlisted.
4. Sign-off on exact Turkish/English application and consent language.

## Launch checklist
- [ ] Legal/processing information approved and linked before the submit button.
- [ ] Domain and origin/redirect configuration verified.
- [ ] Apply SQL migration, verify manager SELECT policy and public SELECT denial.
- [ ] Deploy reviewed Edge Function; avoid logging contact information.
- [ ] Add CAPTCHA/WAF and robust abuse monitoring.
- [ ] Confirm true/false `INQUIRY_CRM_ENABLED` behavior.
- [ ] Verify student and educator applications enter CRM **once**, with no false success on API failure.
- [ ] Verify guest/student cannot read any inquiry and manager can change status.
- [ ] Confirm data access/deletion procedure and rollback to current mailto behavior.
