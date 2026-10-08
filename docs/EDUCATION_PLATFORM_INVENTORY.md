# LanguageLab Akademi — Education platform transfer inventory

Updated: 2026-10-08. Original source is the existing Eryaman Speaking Club website. That repository and the original Supabase database have **not** been edited by this migration.

## The new Academy paths

| Academy path | Audience | Status / source |
|---|---|---|
| `/educators/` | Educators & schools | Replicated educator platform UI and application JavaScript |
| `/join/` | Students | Replicated class-code joining and student dashboard |
| `/ozel-dersler/` | Private lesson prospects | Replicated existing instructor profile & application form |
| `/games/` | Teachers | Academy index for educator-embedded classroom games; not a full copy of the club's independent public games collection |
| `/learning-path/` | Students, educators, schools | New role-based guidance, Turkish and English |

## Educator features now present in the Academy copy

- [x] Teacher account interface (sign in, sign up, password reset, persistent session handled by Supabase)
- [x] Teacher profile and classroom creation/management
- [x] Classroom join codes and copyable links adjusted to project-path hosting
- [x] Private student tracking interface
- [x] Lesson builder with topics, age groups, levels, learning goals and durations
- [x] Curriculum hub and CEFR-based teaching flow (with Türkiye curriculum options in the original source)
- [x] Classroom assistant and lesson-package preparation workflow
- [x] Lesson library, class planning, teacher calendar interface
- [x] Educator's 15 embedded classroom games, interactive classroom tools, full-screen game actions
- [x] Student participation, live activity flow and results overview
- [x] Homework/assignment flows, deadlines, teacher feedback
- [x] School workspace/team membership/lesson sharing UI
- [x] Turkish and English controls maintained from original

## Student features now present in the Academy copy

- [x] Join by code and name (no mandatory student email account)
- [x] Student class summary and current lesson overview
- [x] Live lesson stage, prompt, progress and participation interface
- [x] Assigned work, deadlines, assignment submission and completed lesson history
- [x] Teacher feedback and results shown where original implementation provides them
- [x] Turkish/English interface
- [x] Role-specific Academy roadmaps, do/don't hints and device-local checklist progress

## Private lessons now present

- [x] Existing online English teacher profile and teaching approach
- [x] Existing application form mechanism (external email-based service, not Academy's central database)
- [x] Original instructor's photos imported from locally embedded image SVG assets
- [x] New Academy header, icon, links and project-hosted post-submission redirect

## Operational constraints / IMPORTANT

The first working copy uses the same **Eryaman Speaking Club Supabase project**, via its browser-publishable key, for teacher accounts, class records, student joins and assignments. It does **not** replicate the Supabase database and it does not create an independent tenant. Changes teachers make in Academy educator screens can therefore affect the same records visible in the older club educator screens. The original repository and database schema have not been changed.

The shared Supabase project must allow the Academy URL in **Authentication → URL Configuration → Redirect URLs** for new teacher email confirmation and password reset links: `https://laz6155.github.io/LanguageLab/educators/**` (or suitable exact educator callback URL). Existing Supabase Site URL should not be changed until an independent Academy project is available. Until the additional redirect is configured, a confirmation/reset email may return to the original project's URL.

Security controls and RLS are inherited from the original project; this migration **does not independently certify their security**. A separate audit and a distinct Academy Supabase project are needed before wider international multi-tenant rollout.

The private lesson form continues submitting to its original instructor's FormSubmit email. It is not connected to an Academy CRM or payment service. The Academy introductory interest form separately composes a mailto draft.

## Next engineering milestones (not claimed as built)

1. **Independent Academy data project:** create a dedicated Academy Supabase project following organization/cost approval, export or opt-in transfer appropriate educator data, maintain separate teacher/student tenant boundaries, add RLS and structured migrations.
2. **Role-based identity:** separate school admin, teacher, student/guardian permissions and account recovery without role escalation. Keep class-code join short-lived/scoped, add consent/legal retention processes.
3. **Student dashboard 2.0:** clear class list, week calendar, assignment timeline, progress by CEFR skill (speaking/listening/reading/writing), feedback history, reminders and accessible mobile views.
4. **Teacher experience 2.0:** class templates, reusable lesson blueprints, attendance, automatic assignment rubric feedback, activity tagging, smart filters, printable materials, reliable draft autosave and session restore.
5. **International pathing:** shared CEFR proficiency targets, additional languages, national curriculum overlays only where verified, locale/timezone/calendar preferences and localization QA.
6. **Private lessons:** multilingual instructor directory, availability, discovery call, instructor verification, transparent pricing and refund/cancellation process, application persistence and approvals.
7. **Institution workspace:** scoped multi-school memberships, permissions, mentor approvals, teaching analytics only for authorized school users, reporting and export.
8. **Accessibility/security:** keyboard support, WCAG contrast, rate limiting, audit logs, privacy/consent, backups, periodic vulnerability/security review.
9. **Automated tests:** student/teacher actor A/B end-to-end QA on a non-production environment, authorization negatives, mobile flow, data persistence and email confirmation.

## Manual QA checklist before broad public invitations

- Teacher sign-in with an authorized existing account on Academy. After login: select/create class, test one lesson, reload and verify class remains; do not create real production test students without informed consent.
- On a separate browser session use the class join code on the Academy student panel, verify assigned content only, and test a purposely incorrect code.
- Test private lesson form only with explicit instructor coordination; do not create synthetic public applications.
- Confirm redirected email confirmation/reset URLs after allowlisting the Academy origin in Supabase.
- Check mobile navigation, accessibility and the three roadmap roles on iPhone and desktop.
- Verify original club URLs still work unchanged after Academy deployment.