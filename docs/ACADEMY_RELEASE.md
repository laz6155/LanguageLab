# LanguageLab Academy learning platform

## Live modules
- `/platform/`: course catalog, learner accounts, enrollments and progress, personal tasks, calendar.
- Academy manager tools: courses, approvals, published lessons, modules, announcements, class schedule.
- `/educators/`: inherited educator classroom and lesson tools.
- `/join/`: classroom-code student participation.
- `/ozel-dersler/`: private tutoring information.
- `/learning-path/`: student, educator and institutional learning guides.

## Data ownership and security
Academy-prefixed tables are separate from existing Eryaman Speaking Club tables but currently use its **same Supabase project for authentication**. Existing club administrators are bootstrapped as Academy owners. `academy_staff` is never modified from a public client. The frontend checks the role for display only; every read and write depends on database RLS. Service keys are never shipped to browsers. The course catalog is public, enrolled lesson content and meeting links are restricted.

## Production operations checklist
1. Add `https://laz6155.github.io/LanguageLab/platform/` and `https://laz6155.github.io/LanguageLab/educators/` to **Supabase Authentication > URL Configuration > Redirect URLs**, without deleting the club's existing callback URLs.
2. Configure SMTP and confirmation templates; verify signup, login, password reset, and session persistence across browsers.
3. Enable leaked-password protection in Supabase Auth and consider MFA for administrators.
4. Test three identities on real devices: guest, student, authorized owner. Test cross-user RLS isolation. Do not treat frontend test success as a security penetration test.
5. Review privacy policy, KVKK/GDPR, underage requirements, record retention, consent and payments with relevant advisors before enrolling paying students.
6. Add secure educator permissions and attendance, payment receipts, teacher scheduling, automatic email alerts, course completion assessments, and controlled media uploads before production-scale operations.
7. Long term: plan a controlled migration to a dedicated Supabase project for LanguageLab (including account migration, verification and backups), rather than detaching shared authentication without a rollback plan.

## Important limitations
- No online payment processing, automatic class reservations, or formal certificate issuance.
- Free starter course is sample self-paced content, not proof of proficiency or externally accredited training.
- Existing educator and classroom flows remain independent user experiences using the shared data project.