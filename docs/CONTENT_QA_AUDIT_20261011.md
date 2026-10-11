# LanguageLab Akademi — Measured Content QA and Pilot Readiness

Audit: 2026-10-11. Scope: live **academy-prefixed** tables of the existing shared Supabase project, plus Academy code. Read-only inspection; no learner records were copied. The Academy site and the original Speaking Club continue to share the authentication project.

## Observed data (not marketing claims)

| Programme | Course status | Lessons in database | Published lessons | Short lessons (<300 chars in either language) | Distinct TR / EN bodies |
|---|---|---:|---:|---:|---|
| `speaking-starter` | open | 12 | 12 | **4** | 12 / 12 |
| `english-at-work` | waitlist | 8 | 0 | 0 | 8 / 8 |
| `advanced-discussion` | waitlist | 8 | 0 | 0 | 8 / 8 |
| **Total** | — | **28** | **12** | **4** | 28 / 28 |

- The other four defined programmes have no lessons in these academy tables.
- All 28 rows have Turkish and English titles and content. The exact-body duplicate check and simple `TODO`/`lorem` placeholder scan found none.
- These tests **do not** assess grammar, pedagogical correctness, meaning equivalence, completeness, originality, or age suitability. Editors must do that.
- The four shortest starter lessons have approximately **233–281 characters per language**. They are introductory notes, not credible full-length lessons by themselves.
- At audit time `academy_enrollments`, `academy_progress`, `academy_tasks`, `academy_sessions` and `academy_skill_checks` each have **zero records**. Product performance cannot yet be inferred from usage.
- The waitlist lesson modules and lessons are **unpublished**, intentionally. Do not make them publicly accessible without editorial sign-off.
- The Academy Teacher Assistant v2 remains rule-based, not an integrated external LLM. Human review remains mandatory.

## Prioritised content work (without changing live published text)

### P0: Correct learner expectations
- Keep draft/waitlist programmes labelled as planned; do not describe them as available courses.
- Treat the published first four starter lessons as introductory **micro-lessons** until a teacher approves an expanded version.
- Display a clear self-assessment disclaimer: the skill-check is not an externally validated CEFR diagnostic.

### P1: Expand and review the starter
- Add (in a **reviewed draft**, not directly overwriting the published row) an observable can-do objective, 4–6 level-appropriate expressions, guided model, 3–5 tasks, pair-work/adapted solo task, feedback rubric, and a follow-up/homework task to each short lesson.
- Verify the title, objective, instructions, prompts and model answers are semantically equivalent in TR and EN.
- Check claims of suggested duration with an actual educator; character count is a **triage signal**, not a duration measurement.
- Add lesson review metadata only after agreeing an editorial workflow and a reversible schema migration.

### P1: Teacher-approved course drafts
- Each of the 16 waitlist draft lessons needs independent reviews before `is_published` is changed.
- A representative B1–B2 lesson must be tried with real speaking learners; a representative C1–C2 lesson must be reviewed for authentic complexity and neutral discussion framing.
- Do not publish all sixteen based only on passing automated checks.

## Proposed editorial quality rubric (0–2 points each)

| Dimension | 0 = needs work | 1 = usable after edits | 2 = acceptable |
|---|---|---|---|
| CEFR alignment | Language level inappropriate | Mixed or unclear | Matched to target level |
| Can-do objective | Missing / unverifiable | Partly measurable | Observable speaking outcome |
| Instruction clarity | Learners cannot act | Needs clarification | Clear steps and example |
| Interaction design | No meaningful interaction | Limited follow-up | Exchange, follow-up, repair |
| Scaffolding | No model/support | Partial model | Examples and differentiation |
| Accuracy & naturalness | Error or unnatural wording | Minor edits needed | Teacher-approved |
| TR / EN parity | Meaning mismatch | Minor differences | Equivalent learner task |
| Suitability & safety | Problematic/irrelevant | Ambiguous | Inclusive, age-appropriate |
| Timing & workload | Unrealistic | Needs trial | Educator-tested |
| Feedback & next step | Missing | Partial | Clear rubric, practice next |

**Candidate release rule (proposed):** 16/20 minimum, with *no zero* in Accuracy, CEFR alignment, TR/EN parity or Suitability; a second reviewer confirms a sample. This is an internal acceptance criterion only, not an accreditation claim.

## End-to-end pilot test matrix

| Actor | Scenario | Evidence required | Gate |
|---|---|---|---|
| Guest | Catalog view; no private lesson/meeting data | Browser + RLS negative check | P0 |
| New learner | Sign-up -> email confirmation -> first login | Real email delivery, account record | P0 |
| Learner A | Self-enrol starter -> open lesson -> finish -> reload | Completion persists on server | P0 |
| Learner B | Attempt another learner's tasks, skill checks, progress | Every unauthorised read/write denied | P0 |
| Academy owner | Approve an opted-in request; edit a draft; refresh | Audit result persists, no other course edits | P0 |
| Teacher | Lesson plan -> class -> consenting student join -> assignment | Work saved, student sees only own class | P0 |
| Mobile student | Safari/Chrome and keyboard navigation | No blocked actions or unreadable layout | P0 |
| Teacher reviewer | Test content objective, tasks, timing and feedback | Rubric score + documented changes | P1 |

Do not perform the matrix on uninformed real students. Use approved pilot users and non-sensitive test content.

## Reproducible read-only QA queries

```sql
select c.slug,
       count(l.id) as lessons,
       count(l.id) filter (where l.is_published and m.is_published) as published_lessons,
       count(l.id) filter (where length(trim(l.content_tr)) < 300
                            or length(trim(l.content_en)) < 300) as short_lessons,
       count(distinct md5(l.content_tr)) as distinct_tr_bodies,
       count(distinct md5(l.content_en)) as distinct_en_bodies
from public.academy_courses c
left join public.academy_modules m on m.course_id=c.id
left join public.academy_lessons l on l.module_id=m.id
group by c.slug order by c.slug;
```

```sql
select 'academy_enrollments' as metric, count(*) as total from public.academy_enrollments
union all select 'academy_progress', count(*) from public.academy_progress
union all select 'academy_skill_checks', count(*) from public.academy_skill_checks
union all select 'academy_sessions', count(*) from public.academy_sessions;
```

Both queries are **read-only**. They should be rerun after each planned publication.

## Release boundary and dependencies

Do not switch the staged public inquiry API on before KVKK/privacy approval, abuse controls and role isolation checks. The independent Academy Auth migration, SMTP sender and payments require owner action. See [RELEASE_GATE.md](RELEASE_GATE.md) and [PILOT_CURRICULUM.md](PILOT_CURRICULUM.md).

**Next technical targets:** bugfix for unsaved profile form drafts, live browser registration tests, independently scoped Academy/classroom learner identity mapping, and content-editor draft versioning. None is certified by this document.
