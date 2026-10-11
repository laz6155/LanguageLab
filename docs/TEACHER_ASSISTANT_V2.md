# LanguageLab Academy — Teacher Assistant v2

The Academy's advanced rule-based generator is intentionally deployed separately from the legacy Eryaman Speaking Club `educator-assistant` function. No external LLM/provider is involved in this version; **do not advertise it as generative AI**.

## Changes
- Advanced **C1 and C2** discourse scaffolds alongside Pre-A1, A1, A2, B1 and B2.
- Nuanced, distinct upper-level questions and stakeholder-perspective roleplay.
- Level-specific grammar/discourse focus, advanced worksheet and homework prompts.
- Structured `success_criteria` and a practical reflection prompt in the returned package.
- Expanded educator picker and copy-to-clipboard export with rubric criteria.
- Preserves the existing saved assistant history; fixes mistaken querySelector/forEach usage.
- Still uses Supabase Auth and `verify_jwt=true` for the Edge Function. Owner/teacher permissions require separate end-to-end testing.

## Important limitation
The existing, shared classroom creation flow stores only **Pre-A1 to B2**. Academy C1/C2 packs are therefore **not silently mapped to B2**: applying them to the old builder is blocked, and the educator can copy/use the pack independently. Do not alter the original Club's level constraints without an explicit migration plan.

## Acceptance checklist
- [ ] Generate A2, B2, C1, C2 teacher packages using a real authorised teacher account.
- [ ] Compare the difficulty and question variation between levels and topics.
- [ ] Verify `smart-rules-v2` label is shown only as a rule-engine version; never claim LLM calls.
- [ ] Verify export includes practical success criteria and clear teacher guidance.
- [ ] Confirm legacy Eryaman Speaking Club generator remains available.
- [ ] Confirm C1/C2 pack cannot be saved as B2 through the old classroom builder.
- [ ] Test retrieval and deletion of saved packages on two devices.
- [ ] Have an experienced ESL teacher approve high-stakes/advanced prompts before selling these packs.
