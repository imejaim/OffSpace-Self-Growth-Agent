# Delegation Contract

Updated: {{DATE}}
Status: stable

## Purpose

Subagents do not inherit the parent session's implicit context. Every delegation must include an explicit context packet. Without it, the subagent will guess, and guesses introduce drift.

## Core Rules

1. Assume the subagent knows nothing about the current session.
2. Pass the minimum context packet (see below) before any work begins.
3. Results must land as code diffs, wiki updates, or structured log entries — not chat-only conclusions.
4. When parallel agents may touch the same file, record a lock in the task tracker first.
5. The parent is responsible for verifying the result against the completion condition.

## Minimum Context Packet

Every delegation must include:

- [ ] One-sentence goal
- [ ] Read list: which brain/wiki documents the subagent must load
- [ ] Write-allowed paths and write-forbidden paths
- [ ] Current confirmed facts with sources (no unsourced numbers)
- [ ] Completion condition (how to know the task is done)

## Prohibitions

- Implicit "just continue from where I left off" delegation
- Passing unverified numbers without source attribution
- Overwriting files another agent is actively editing

## Applied Examples

### Example 1: {{EXAMPLE_1_TITLE}}

- **Goal**: {{EXAMPLE_1_GOAL}}
- **Read**: {{EXAMPLE_1_READ_LIST}}
- **Write allowed**: {{EXAMPLE_1_WRITE_PATHS}}
- **Completion**: {{EXAMPLE_1_DONE_CONDITION}}

### Example 2: {{EXAMPLE_2_TITLE}}

- **Goal**: {{EXAMPLE_2_GOAL}}
- **Read**: {{EXAMPLE_2_READ_LIST}}
- **Write allowed**: {{EXAMPLE_2_WRITE_PATHS}}
- **Completion**: {{EXAMPLE_2_DONE_CONDITION}}

## Related Pages

- [User Operating Preferences](./user-operating-preferences.md)
- [Holonomic Brain Operating Model](./holonomic-brain-operating-model.md)

## Change Log

- {{DATE}}: Initial version.
