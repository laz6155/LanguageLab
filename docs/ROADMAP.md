# LanguageLab Academy - Product & technical roadmap

## Product position

LanguageLab Akademi will be a dedicated language learning and educator platform. Eryaman Speaking Club remains an independent, existing community and events site; the academy can link to it, but does not reuse its database without an explicit integration design.

## Stage 0: Public foundation (in this archive)

- Public bilingual homepage, program exploration and educator story.
- Responsive accessibility baseline.
- Early-interest email handoff with transparent status text.
- Static hosting via GitHub Pages, no platform vendor lock-in.

## Stage 1: Real accounts and data (not implemented)

- Choose and configure an independent Supabase project for LanguageLab.
- Build student / educator / admin account registration and login.
- Define role claims and server-enforced authorization using RLS.
- Implement a persistent, access-controlled application inbox.
- Add KVKK privacy notice, applicable terms, consent/communications preferences, retention/deletion process and spam protection **before** collecting application data in the database.
- Introduce staging and production environments and encrypted secret management.

## Stage 2: Educator workspace (not implemented)

- Reusable activities and question banks grouped by language proficiency.
- Lesson flow designer, curriculum modules and assignment templates.
- Group/session roster with role-based access.
- Media resources and import/export with appropriate permissions.
- Teacher analytics scoped to their own courses and learners.

## Stage 3: Learner experience (not implemented)

- Learning dashboard, CEFR levels and clear course enrollment rules.
- Class scheduling, online class links, exercises and progress tracking.
- Student/teacher messaging and teacher feedback policies.
- Content availability control and learner accessibility checks.

## Stage 4: Academy operations (not implemented)

- Admin CMS, course catalog management and scheduled publication.
- Application/admissions management and audit trails.
- Prices, invoicing and compliant payment integration (use a certified PSP, never collect raw card data in frontend code).
- Domain migration, transactional email and customer support flows.
- Security review, backups, monitoring, data protection and incident procedures.

## Suggested future database entities

`profiles`, `roles`, `courses`, `course_levels`, `cohorts`, `sessions`, `enrollments`, `activities`, `submissions`, `feedback`, `applications`, `payments`, `audit_logs`.

All learner-facing tables must use explicit row-level security policies; teacher read access must be scoped to assigned courses/cohorts. Never embed Supabase `service_role` keys in GitHub Pages JavaScript. A public anonymous key by itself is not authorization.

## Product integrity rules

- Do not label planned programs as open for enrollment until scheduling, pricing and delivery exist.
- Do not claim recognized certificates, official accreditation or MEB authorization without documented verification.
- Do not claim student counts, results or teacher numbers without records.
- Include actual legal notices, transparent fees and cancellation policies before taking payments.
- Plan adult/minor safeguarding policy before admitting users under 18.