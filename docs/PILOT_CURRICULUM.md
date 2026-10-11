# LanguageLab Akademi — Pilot Curriculum & Quality Control

Status: **2026-10-11, editorial pilot**. The full lesson text is stored in the access-controlled Supabase course tables, not in this public repository. This document contains the **syllabus only**. It is not a CEFR certification.

## Pilot programmes

| Programme | CEFR range | Existing + new | Availability |
|---|---|---:|---|
| English Speaking Starter (speaking-starter) | A1–A2 | 4 existing + 8 new = 12 | Published |
| English at Work (english-at-work) | B1–B2 | 8 new | Draft / waitlist |
| Advanced Discussion (advanced-discussion) | C1–C2 | 8 new | Draft / waitlist |

**Important:** Course statuses remain unchanged. The two waitlist programmes are not advertised as instantly available paid classes. The 16 lesson drafts require human teaching review before publication. All newly drafted lessons include Turkish and English instructions, model responses and teacher observation prompts.

### A1–A2 — Everyday Speaking Missions
1. Meet someone new — introductions + follow-up questions
2. Order at a café — polite requests + changes
3. Ask for directions — route vocabulary + confirmation
4. Make weekend plans — invitations + alternative plans
5. Talk about last weekend — short chronological narration
6. Solve a small problem politely — requests + repair
7. Give a recommendation — reasons + preferences
8. Tell a short story — sequencing + feelings

### B1–B2 — English at Work: Practical Speaking
1. Introduce yourself professionally — concise work introductions
2. Make small talk before a meeting — rapport + transitions
3. Clarify a task — requirements and confirmation
4. Give a project status update — progress, blocker, next action
5. Pitch an idea — problem, solution, benefit, ask
6. Disagree constructively — acknowledgement + compromise
7. Handle a difficult customer — empathy without false promises
8. Handle a job interview — STAR and specific outcomes

### C1–C2 — Advanced Discussion Lab
1. Artificial intelligence in education — conditional claims and oversight
2. A four-day working week — evidence and sector-specific effects
3. Speech and responsibility on social media — competing legitimate interests
4. Sustainable consumption choices — lifecycle and distributional trade-offs
5. Universities and employability — false dichotomies and long-term outcomes
6. Tourism and cultural identity — local impacts and policy exceptions
7. Fairness in algorithmic decisions — appeals, auditability and bias
8. The future of cities — phased interventions and accessibility

## Review gate (required before promoting draft programmes)
- [ ] Instructor verifies CEFR-appropriate vocabulary, speech functions and complexity.
- [ ] Instructor checks all model answers for grammar, naturalness and cultural sensitivity.
- [ ] Every lesson has a clear observable can-do objective and a task that tests it.
- [ ] Review prompts for ambiguity, accidental bias, repetition, unsafe advice and nonsense.
- [ ] Verify 25/45/50-minute lesson timings with learners and adjust for group size.
- [ ] Check Turkish/English parity; key activity expectations must be consistent.
- [ ] Check mobile lesson rendering: newlines, long words and screen-reader reading order.
- [ ] Reproduce a class with a genuine educator and a consenting pilot learner.
- [ ] Keep score labels as learner **self-assessment**; do not imply third-party CEFR certification.

## Technical source of truth
- `public.academy_courses`: programme metadata and availability.
- `public.academy_modules` and `public.academy_lessons`: controlled pilot lesson content.
- `public.academy_skill_checks`: private learner reflections; RLS confines entries to the learner.
- Teacher lesson builder and `/join/` still use the inherited ESC teaching tables. A mapping plan is required before unifying histories.
- The entire academic content is not maintained in GitHub Pages: **do not copy commercial/private lesson text to public HTML or JS**.

## Pilot outcomes (targets, not achieved claims)
- A student can find the correct course, read a structured task and complete an activity.
- A teacher can conduct the lesson without inventing essential questions mid-session.
- Two independent reviewers agree that a sample lesson matches the intended CEFR range.
- No draft content is visible to non-managers until explicitly published and a student is enrolled.
