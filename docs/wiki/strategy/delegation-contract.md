# Delegation Contract

Updated: 2026-04-16
Status: stable

## Purpose

Subagents start from zero knowledge. When Ko-bujang (or any orchestrating agent) delegates a task, the receiving agent has no access to prior conversation history, implied context, or ambient project understanding. Every delegation must therefore include an explicit context packet. Without it, the subagent will guess, and guesses introduce errors that compound across multi-agent sessions.

## Core Rules

1. **State the goal precisely.** One sentence describing what done looks like from the user's perspective. Not "fix the bug" — "reproduce the PayPal webhook 400 in staging, identify the root cause, apply a fix, and promote a guardrail rule to the wiki."
2. **Specify the read list.** Name every file or wiki page the subagent must read before touching anything. Do not assume prior knowledge of architecture or incidents.
3. **Specify write-allowed paths.** List the exact directories or files the subagent is permitted to modify. Paths not on the list must not be changed without asking.
4. **Provide current confirmed facts with sources.** Pass only verified facts (production logs, build output, confirmed API responses). Do not pass meeting-log assumptions as facts.
5. **Define the completion condition.** State what evidence the subagent must produce before reporting done (test pass, diagnostics clean, wiki page updated, etc.).

## Minimum Context Packet Checklist

Every delegation message must include all of the following:

- [ ] **Goal**: one-sentence completion definition
- [ ] **Read list**: file paths or wiki pages required before starting
- [ ] **Write-allowed paths**: explicit list of modifiable files/directories
- [ ] **Current confirmed facts**: only verified data, with source cited inline
- [ ] **Completion condition**: evidence required to close the task

If any item is missing, the receiving agent must ask before proceeding.

## Prohibitions

- **No implicit "just continue"**: never delegate with only "keep going" or "finish this". Always re-state goal and context.
- **No unsourced numbers**: do not pass estimated metrics, guessed user counts, or unverified error rates as facts in a context packet.
- **No cross-agent file ownership violations**: if a file is being actively modified by another agent (see `docs/wiki/strategy/holonomic-brain-operating-model.md` concurrency protocol), do not delegate writes to that file without sequencing confirmation from 대표님.
- **No silent scope expansion**: the subagent must not modify files outside the write-allowed list, even if it believes the change would be helpful.

## Applied Examples

### Payment Regression Debugging

**Goal**: Reproduce the PayPal webhook 400 error in the staging environment, identify root cause, apply a fix, and promote a guardrail rule to the incidents wiki.

**Read list**:
- `docs/wiki/architecture/payment-and-operations-model.md`
- Any existing entries under `docs/wiki/incidents/` related to payment

**Write-allowed paths**:
- `intercept/src/app/api/payment/**`
- `intercept/src/lib/paypal.ts`
- `docs/wiki/incidents/` (new file only)

**Completion condition**: staging webhook returns 200, a new incident page exists under `docs/wiki/incidents/` with root cause + guardrail rule, diagnostics clean on modified files.

---

### Teatime Content Delegation

**Goal**: Generate today's teatime conversation for the three standard categories and update both the output file and the source data file together.

**Read list**:
- `docs/wiki/strategy/product-identity-and-surface-model.md`
- `.claude/rules/teatime.md`

**Write-allowed paths**:
- `output/teatime/**`
- `intercept/src/lib/teatime-data.ts`

**Completion condition**: both `output/teatime/` file and `intercept/src/lib/teatime-data.ts` updated in the same operation; character voice and category structure match the teatime rules; no other files modified.

## Related Pages

- [Holonomic Brain Operating Model](./holonomic-brain-operating-model.md)
- [User Operating Preferences](./user-operating-preferences.md)
