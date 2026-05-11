# Incident: Intercept Hallucination — Stale Training Data Response (2026-05-10)

**Date**: 2026-05-10  
**Severity**: High — production intercept responses ignored injected references, generated fabricated content  
**Status**: Patched (Pack A — commit 1df6b0b)  
**Related**: [Intercept Grounding Architecture](../architecture/intercept-grounding-architecture.md), [Option B Follow-ups](../architecture/option-b-followups-2026-05-11.md)

---

## Summary

During production testing of Vol.12, an intercept question about local LLM agent usage on Reddit triggered a response that ignored the five live `r/LocalLLaMA` references injected into the archive. The model drew entirely from training data (2023–2024 era), citing outdated tools and hardware setups that had no relation to the current topic's source material.

Pack A patched the root cause: references were not being sent to the model at all. After the fix, the same payload produced a response that cited the correct source URL and contained no fabricated content.

---

## Reproduction Case

**Question (paraphrased)**: "Can you check links for real Reddit cases of running local LLM agents?"

**Pre-patch response (summary)**: Named frameworks and hardware from 2023–2024 training data. Zero mention of the five `r/LocalLLaMA` references stored in the archive for that topic. The abstention guard did not fire because the model was not aware there were references to check.

**Post-patch response**: Cited the correct reference URL (`1t4qwzf` — "Why run local"). Contained no fabricated framework or hardware names. Abstention guard phrase ("찾지 못했습니다") fired correctly when a question fell outside the supplied references.

---

## Root Cause

### Primary — references not transmitted to model

The intercept API endpoint received only the user's message text. The `teatimeId` and `topicId` identifiers were not included in the client request payload. Without them, the server had no way to look up `topic.references` from the archive. The model received zero grounding context.

### Secondary — no abstention guard in system prompt

The system prompt had no instruction to refuse or hedge when the user asked about information outside the supplied references. The model defaulted to generating plausible-sounding content from training data rather than stating it lacked the relevant material.

### Secondary — character channel assignment not enforced

The system prompt did not specify which characters were authorised to cite which sources. In regression testing after the patch, the manager character (코부장) was observed citing Reddit URLs — a channel assigned exclusively to 젬대리. See [Option B #7](../architecture/option-b-followups-2026-05-11.md).

### Secondary — CLAUDE.md model notation mismatch

`CLAUDE.md` listed Cloudflare Workers AI Gemma 4 as the intercept model. The actual runtime chain was Llama 3.3 70B → Qwen2.5-Coder 32B → Gemma 3 12B → Gemini 2.5-flash REST. This discrepancy could mislead future agents about model capabilities and cost. Corrected in Pack A (A4).

---

## Applied Patches (Pack A — commit 1df6b0b)

| Patch | Description |
|-------|-------------|
| A1 | Client sends `teatimeId` + `topicId` in intercept payload. Server fetches archive, extracts `references` + topic messages, and injects them as a grounding block before the user message. |
| A2 | System prompt now includes an abstention guard: if the question cannot be answered from the supplied references, the character explicitly states it could not find the information. |
| A3 | System prompt now names which character may cite which source type (젬대리 → Reddit/YouTube/X; 오과장 → HN/Crunchbase/reports; 코부장 → official blogs/papers). Constraint is advisory, not hard-enforced — see Option B #7 for the follow-up. |
| A4 | `CLAUDE.md` model notation corrected to reflect the actual runtime chain. |

---

## Regression Verification

Production payload identical to the reproduction case was re-sent after Pack A deployment:

- Reference URL from archive (`1t4qwzf`) appeared in the response. PASS.
- No fabricated framework or hardware names present. PASS.
- Abstention guard phrase fired on an out-of-scope question. PASS.

---

## Remaining Weakness

A3's channel constraint is expressed as guidance in the system prompt, not as a structural rule the model cannot violate. Regression testing captured a case where 코부장 cited a Reddit URL. This is tracked as [Option B #7](../architecture/option-b-followups-2026-05-11.md).

---

## Guardrails (Post-Incident Rules)

1. The intercept API must always receive `teatimeId` and `topicId`. Requests missing these fields must be rejected or answered with the abstention guard only.
2. The system prompt must always include the abstention guard clause. Do not remove it when iterating on persona tone.
3. Any change to the model runtime chain must be reflected in `CLAUDE.md` in the same commit.
4. Regression test payload (`output/packA-regression-payload.json`) must be re-run against production after any intercept API or system prompt change.
