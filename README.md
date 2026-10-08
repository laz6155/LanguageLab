# LanguageLab Akademi

**A bilingual, responsive academy launch website built for GitHub Pages.**

LanguageLab is a separate project from Eryaman Speaking Club. Its first release is a public academy introduction and an early-interest contact experience. The repository is deliberately lightweight so it can be published without a build step and later connected to a secure backend.

## What is implemented

- Turkish / English switcher; language preference is retained locally.
- Responsive main navigation, including accessible mobile menu.
- Six planned-program cards with A1-A2, B1-B2, C1-C2 and educator filters.
- Learning-method, educator-studio and community sections.
- Student / educator interest forms with role-specific questions, required-field validation and email draft handoff.
- Clear disclosure that programs and the educator dashboard are **planned**, not live services.
- Native accessibility controls, keyboard focus indicators and reduced-motion support.

**Important:** The contact form opens the visitor's email application. It does **not** store the form on GitHub Pages or send the message automatically. A draft is not considered submitted until the visitor presses Send in their email application. Supabase has **not** yet been connected.

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
assets/icons/brand-icon.svg  Brand favicon
.nojekyll                  GitHub Pages compatibility
.github/workflows/check.yml  Node validation checks
tests/site.test.cjs        Automated integrity tests
docs/ROADMAP.md            Architecture and implementation milestones
```

## Editing

- Change copy in `index.html` (English) and `assets/js/translations.js` (Turkish).
- Change available programs in the `programs` array in `assets/js/translations.js`.
- Change the palette/layout in `assets/css/styles.css`.
- Replace the temporary contact email in `index.html` and `assets/js/app.js` together once the academy gets its own mailbox.

## Next steps

Read [docs/ROADMAP.md](docs/ROADMAP.md). Authentication, student records, educator tools, admin CMS, payments and true application storage are **not** in the first release. Do not collect or process real student records in this repository or expose private API credentials in any committed frontend file.