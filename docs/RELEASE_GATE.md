# LanguageLab Akademi — Release Gate & Integration Backlog

Audit date: 2026-10-11. Scope: **current production club Supabase is shared by two frontends**. Do not delete records, rotate keys or create a new paid project without a migration/rollback plan.

## P0: What must work before public student recruitment

| Area | Acceptance test | Owner | Status |
|---|---|---|---|
| Supabase Auth | Registration, confirmation, login, logout, password recovery in Safari/Chrome, phone and desktop | Technical + account owner | Manual QA required |
| Redirect links | Allow Academy `/platform/` and `/educators/` callback URLs without replacing the club's current redirect URLs | Account owner | Configure/verify |
| Confirmation email | Test actual external mailbox with a configured sender/SMTP; inspect Auth logs for failures | Account owner | External sender decision |
| Identity isolation | Guest cannot read private lessons/meeting URLs, student A cannot read student B records, non-owner cannot edit programmes | Technical | Negative end-to-end QA required |
| Learner journey | Free enrollment, lesson open, mark done, refresh, review task, skill self-check, delete self-check, password reset | QA | Live actor tests required |
| Teacher journey | Login, create class, invite consenting test student, generate lesson, assign work, grade result, refresh and sign out | QA | Live actor tests required |
| Leads & privacy | Submit opt-in form; confirm record stored and visible only to managers; published privacy notice reviewed | Technical + legal owner | Blocked on approved privacy notice |
| Course truth | Programme status shown on homepage and `/platform/` is consistent with DB; draft content inaccessible | Technical | Backend integration needed |
| Backups & restoration | Establish restore procedure/ownership before new production migrations | Account owner | Needs operations plan |

### Negative authorization tests
- Unknown / expired class code does not expose learner identity or assignments.
- A signed-in student cannot query another student's profile, skill checks, tasks, progress or enrollment.
- A normal teacher cannot update Academy manager programmes or staff roles.
- An anonymous browser cannot read applicant information or private class meeting links.
- No public GitHub Pages asset includes secret or service-role keys.

### Monitoring and honest UI
- Prefer explicit empty states to success messages when the backend reports errors.
- Track only minimal aggregate operational metrics until an approved data policy exists.
- Admin actions need audit history, confirmation where destructive, and a tested rollback.
- Never label automated self-reflection as a validated CEFR proficiency test.

## P1: Education and workflow quality
- Single student identity across Academy account and class code experience: scoped linking, not a blanket database join.
- One lesson content contract for teacher plan, worksheet, conversation activity and homework.
- Speaking rubrics for intelligibility, interaction, task achievement and actionable feedback.
- Draft autosave for educator lesson editing; verify refresh does not revert to stale state.
- Better games tagging by topic, CEFR, maturity, time and learning objective; human QA against nonsense/repetition.
- Teacher Assistant: evolve rule templates to teacher-reviewed content; only claim genuine AI generation if an actual LLM integration is active.
- Real browser integration tests and exploratory testing with 10 consenting educators/20 learners as **pilot targets only**.

## P2: Operations and business readiness
- Booking, attendance, reminders, cancellation windows and payment reconciliation.
- Contracts, receipts, refund rules, instructor verification and customer support.
- Distinct academy Supabase with separate Auth/project credentials and staged migration.
- Organization-level instructor/workspace memberships with least-privilege access.
- Consent, retention, deletion workflow, transfer-impact review for internationally hosted data.

## Actions that require the owner's decision
1. **Brand and domain**: confirm the final academy name and registered domain before SEO/canonical links.
2. **Legal notice**: provide/approve data controller identity, processing notices, retention and cross-border hosting disclosure under applicable KVKK/GDPR requirements.
3. **Auth emails**: choose an outbound SMTP provider and authenticate a sender domain; add Academy redirects in Supabase.
4. **Payments**: select processor and billing entity only after legal/accounting review.
5. **Separate database**: agree new project organization/plan and migration before copying any real student records.
6. **Pilot users**: approve volunteer accounts to verify end-to-end user flows.

## Recommended change management
Each feature: source branch → static/automated checks → non-production verification when possible → verify RLS and privacy boundaries → PR review → production merge → spot-check and rollback instructions. Roll out P0 gates before promoting the other 16 pilot lessons.
