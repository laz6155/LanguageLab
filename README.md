# LanguageLab Akademi

**A bilingual, responsive academy launch website built for GitHub Pages.**

LanguageLab Akademi is the main educational brand. **Eryaman Speaking Club is its speaking-practice and community program**, presented within the same academy identity. The current public site is a bilingual academy introduction and early-interest contact experience. It can be published without a build step and later connected to a secure backend.

## What is implemented

- Turkish / English switcher; language preference is retained locally.
- Responsive main navigation, including accessible mobile menu.
- Seven editorial homepage program cards including the free 12-lesson speaking starter (links to the existing Academy platform), with A1-A2, B1-B2, C1-C2 and educator filters. The Academy database separately stores seven program records; homepage programme IDs are still editorial and not yet dynamically synchronized.
- Learning-method, educator-studio and dedicated **Eryaman Speaking Club** section within the academy.
- Student / educator interest forms with role-specific questions, required-field validation and email draft handoff.
- Clear disclosure of which programs are active vs waitlisted. Educator and student interfaces exist, but need live end-to-end QA before broad use.
- Native accessibility controls, keyboard focus indicators and reduced-motion support.

**Important:** The contact form opens the visitor's email application. It does **not** store the form on GitHub Pages or send the message automatically. A draft is not considered submitted until the visitor presses Send in their email application. **The public homepage interest form is not yet connected to the Academy database:** it opens an email draft. The Academy course platform (`/platform/`) and inherited educator/student modules **do** connect to the existing shared Supabase project. This is not an independently owned Academy backend.

## October 2026 production status

- Learner portal: `/platform/` with Supabase course enrollment, personal tasks, lesson completion, and private CEFR skill self-check history (subjective self-report, not accredited testing).
- Educational content: 12 published speaking-starter lessons; eight English-at-Work and eight Advanced Discussion lesson drafts awaiting instructor review. See [Pilot curriculum quality gate](docs/PILOT_CURRICULUM.md).
- The Homepage interest form still opens a local email client; private tutoring uses an external form service. No central lead CRM is live.
- Full signup, SMTP confirmation, reset redirects, cross-user access and mobile behavior still require real-world QA. See [Release gate and required owner decisions](docs/RELEASE_GATE.md).

## Publish on GitHub Pages

1. Upload all files and folders in this archive into the root of `laz6155/LanguageLab` on the `main` branch (keep the same folder structure).
2. Open **Repository > Settings > Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose branch **main**, folder **/(root)**, and select **Save**.
5. Once GitHub indicates that publication is complete, the standard site address is `https://laz6155.github.io/LanguageLab/`.

Do not add a `CNAME` until an academy domain is purchased and DNS is configured.

## Develop locally

No dependencies and no build step are required. Opening `index.html` directly in a browser usually works. To serve locally over HTTP instead:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

Run source checks:

```sh
npm test
```

## Structure

```text
index.html                 Main page structure and semantic HTML
assets/css/styles.css      Design system and responsive layout
assets/js/translations.js  Turkish translations and bilingual program data
assets/js/app.js           Localization, filtering, menu and mailto form behavior
assets/icons/brand-icon.svg  Shared emblem for academy branding and favicon
.nojekyll                  GitHub Pages compatibility
.github/workflows/check.yml  Node validation checks
tests/site.test.cjs        Automated integrity tests
docs/ROADMAP.md            Architecture and implementation milestones
```

## Editing

- Change copy in `index.html` (English) and `assets/js/translations.js` (Turkish).
- Change available programs in the `programs` array in `assets/js/translations.js`.
- Maintain the navy and coral brand palette in `assets/css/styles.css` (primary colors #19305F and #EA5A56).
- Replace the temporary contact email in `index.html` and `assets/js/app.js` together once the academy gets its own mailbox.

## Next steps

Read [docs/ROADMAP.md](docs/ROADMAP.md). The educator, student and private-lesson frontends are now replicated from the original club platform. Teacher/student screens currently use the **same existing Supabase backend** rather than a separate academy database. Admin CMS, full payments, independently owned user records and central private-lesson application storage are not included. Do not add private server credentials to publicly served files.

## Brand architecture

- Parent identity: **LanguageLab Akademi**.
- Academy program: **Eryaman Speaking Club**, for online and face-to-face conversational practice.
- The existing speaking-club website remains operational during development, but is **not promoted as a separate sister brand** on the academy homepage. Its historic records are not automatically migrated or shared.
- The user-supplied emblem is reproduced as a lightweight SVG, matching the existing community artwork, with the requested navy and coral colors.
- Keep program availability honest: speaking club meetings are active; other academy programs and educator dashboard are still in development.


## Education workspaces (October 2026)

- [Educator platform](educators/) — teacher login, lesson planning, students, assignments, classroom games and school collaboration.
- [Student classroom](join/) — join by teacher code, lesson progress, assignments and results.
- [Private online English lessons](ozel-dersler/) — imported instructor profile and email application form.
- [Learning roadmap](learning-path/) — step-by-step Turkish/English guide for students, educators and schools.
- [Classroom game catalog](games/) — directs teachers to games embedded inside the educator platform.

**Backend:** These educator and classroom frontends currently connect to the pre-existing club Supabase project. This preserves existing users/lessons while avoiding edits to the club repository, but means it is a **shared system**, not an independent copy of database contents. For the complete transfer checklist, limitations and next steps, see [docs/EDUCATION_PLATFORM_INVENTORY.md](docs/EDUCATION_PLATFORM_INVENTORY.md). Do not share real student codes or teacher credentials publicly.