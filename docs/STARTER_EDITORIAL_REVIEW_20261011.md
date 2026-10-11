# Starter Foundations: unpublished expansion review

Recorded 2026-10-11. These materials are **draft educational content**, not certified assessments. The full lesson text stays in the manager-protected Supabase database. This public document includes only titles, publication status and review procedures.

## What changed safely

Four **unpublished** 20-minute expanded lesson drafts were inserted into an **unpublished** module named `Conversation Foundations - Editorial Drafts`, under the existing `speaking-starter` course. No original lesson was overwritten, archived or unpublished. The existing 12 published lessons remain published.

| Original micro-lesson | Corresponding private editorial draft | Focus |
|---|---|---|
| Introductions and greetings | Introductions and greetings - expanded draft | 45–60-second introduction, two questions and a repair phrase |
| Keep a conversation going | Keeping a conversation going - expanded draft | Expanded answers and relevant follow-up questions |
| Talk about your routine | Daily routines - expanded draft | Basic time expressions, routines, partner questions |
| Your next step | My four-week speaking plan - expanded draft | Measurable, sustainable four-week practice plan |

Each draft provides Turkish and English instructions, a can-do goal, a warm-up, six-part lesson timing, a supported model, teacher observation criteria (0/1/2), a solo alternative, and a follow-up task. A quick duplicate-body check does not replace human editorial review.

**Measured after insertion:** 32 Academy lessons overall; 12 published; 20 unpublished. For `speaking-starter`, 12 published + 4 new unpublished, in three modules. The new module and all its lessons have `is_published=false`.

## How to find them

Academy owner -> `/platform/` -> Academy management -> Lesson content -> select the **Free Speaking Starter** course. The draft module is named `Conversation Foundations - Editorial Drafts`. Manager-only access depends on Academy Auth + RLS; confirm this with an actual guest/student negative test before publication.

## Teacher review — four drafts, one checklist per lesson

- [ ] Is the goal observable and appropriate for **A1–A2**?
- [ ] Are the Turkish and English versions semantically aligned (tasks, timing, examples)?
- [ ] Is the target language natural and correct? Are instructions actionable without extra explanations?
- [ ] Are the tasks interesting, respectful, age-appropriate and realistic for small groups?
- [ ] Are the role-play/solo alternatives practical for different learner preferences?
- [ ] Does the model leave enough room for original learner speech rather than memorisation?
- [ ] Does the 20-minute timing hold in a small-group rehearsal?
- [ ] Can the instructor consistently apply the proposed three-point observation criteria?
- [ ] Did a second reviewer check at least a representative sample?
- [ ] Are accessibility, mobile line wrapping, and keyboard use acceptable?

Use the 10-dimension rubric in [CONTENT_QA_AUDIT_20261011.md](CONTENT_QA_AUDIT_20261011.md). These scores are teacher observations, **not CEFR certificates**.

## Publication / rollback requirements

1. **Do not** simply publish the draft module: that would put duplicate foundation lessons into the learner's program.
2. Decide whether to replace the four micro-lessons in place or preserve both as differently labelled activities.
3. Before replacement, establish a private, restorable backup of original lesson bodies with original IDs. Do not commit commercial lesson text to public GitHub.
4. Create a reviewed, reversible change with human sign-off. Verify the original published lesson count, module access and cross-account RLS.
5. Verify student content, completion history (lesson IDs must not unexpectedly change), mobile display, TR/EN parity, then release.
6. If any check fails, restore the original material; the existing private draft module can stay unpublished.

## Source-of-truth verification

Run the following read-only query as a project administrator:

```sql
select c.slug,m.title_en as module,m.is_published as module_live,
       count(l.id) as lessons,
       count(l.id) filter(where l.is_published and m.is_published) as published_lessons
from public.academy_courses c
join public.academy_modules m on m.course_id=c.id
left join public.academy_lessons l on l.module_id=m.id
where c.slug='speaking-starter'
group by c.slug,m.id
order by m.position;
```

The Academy's production P0 checks remain in [RELEASE_GATE.md](RELEASE_GATE.md). This draft does not resolve SMTP, signup, real-browser or privacy-release dependencies.
