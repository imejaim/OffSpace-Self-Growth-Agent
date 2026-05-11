# Intercept Grounding Architecture

**Created**: 2026-05-11  
**Status**: Stable (Pack A applied)  
**Incident reference**: [2026-05-10 Hallucination Incident](../incidents/2026-05-10-intercept-hallucination-llama2.md)

---

## Purpose

This page documents how the intercept feature grounds model responses in the current teatime archive so they do not drift into training-data hallucination.

---

## Client → Server Payload Contract

```typescript
// POST /api/intercept
{
  teatimeId: string;        // e.g. "2026-05-10"
  topicId: string;          // e.g. "topic-3" (AI Papers & Models)
  userMessage: string;      // user's intercept question
  conversationContext: {    // prior turns in this intercept session
    role: "user" | "assistant";
    content: string;
  }[];
}
```

Fields `teatimeId` and `topicId` are required. Requests missing either field are rejected or answered with the abstention guard only (no model call).

---

## Server Context Builder

1. Call `getTopicById(teatimeId, topicId)` to retrieve the topic record from the teatime archive.
2. Extract `topic.references` (source URLs + titles + ratings) and `topic.messages` (character conversation turns).
3. Assemble a grounding block:

```
[GROUNDING — Topic: {topic.category}]
References available:
- {ref.title} ({ref.url}) — rating {ref.rating}
...

Character conversation so far:
{messages...}
```

4. Prepend the grounding block to the system prompt before the user message.

---

## System Prompt Structure (4 Axes)

| Axis | Content |
|------|---------|
| Persona | Character identity, tone, and role for the two characters responding |
| Channel assignment | Which character may cite which source type (see below) |
| Abstention guard | If the question cannot be answered from the grounding block, state explicitly that the information was not found in the references |
| Response format | Return a JSON array of two character responses: `[{character, message}, {character, message}]` |

### Channel Assignment (Pack A A3)

| Character | Authorised sources |
|-----------|-------------------|
| 젬대리 | Reddit, YouTube, X.com, GitHub community posts |
| 오과장 | HackerNews, Crunchbase, market/analyst reports |
| 코부장 | Official blogs, research papers, technical documentation |

This is currently expressed as a prompt guideline. Hard enforcement is tracked as [Option B #7](./option-b-followups-2026-05-11.md).

---

## Model Chain

Requests are dispatched in priority order until one succeeds:

1. **Cloudflare Workers AI — Llama 3.3 70B** (primary)
2. **Cloudflare Workers AI — Qwen2.5-Coder 32B** (fallback)
3. **Cloudflare Workers AI — Gemma 3 12B** (fallback)
4. **Gemini 2.5-flash REST** (final fallback, via `GEMINI_API_KEY`)

> Note: `CLAUDE.md` previously listed "Gemma 4" as the intercept model. This was a documentation error corrected in Pack A (A4). The actual chain is as above.

---

## Abstention Guard

The system prompt instructs characters to respond with a refusal phrase (e.g. "관련 자료를 찾지 못했습니다") when the user question falls outside what the grounding block can answer. This prevents the model from generating plausible-but-fabricated content from training data.

---

## Regression Test Artifact

`output/packA-regression-payload.json` contains the exact request payload used to verify Pack A. Re-run this payload against production after any change to:

- `/api/intercept` request/response shape
- System prompt content
- Model chain configuration

---

## Future Extension Points

| Feature | Status | Reference |
|---------|--------|-----------|
| Google Search grounding (`tools:[{googleSearch:{}}]`) | Planned | [Option B #6](./option-b-followups-2026-05-11.md) |
| Per-character sequential model calls | Not started | — |
| Vector search RAG over full archive | Not started | — |
| Hard character channel enforcement | Planned | [Option B #7](./option-b-followups-2026-05-11.md) |
