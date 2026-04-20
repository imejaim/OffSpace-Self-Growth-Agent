# User Operating Preferences

Updated: {{DATE}}
Status: stable

## TL;DR

- {{USER_ROLE}} operates as commander; agents handle execution.
- Reports in {{LANGUAGE}}, terse, with verified sources only.
- Prefers lightweight tooling over heavy frameworks.

## Reporting Style

- Primary language: {{LANGUAGE}}
- No unverified numbers in reports
- Format: current state → conflicts → next action

## Operating Principles

- Verify current state before any action
- Promote durable knowledge to wiki; don't let chat/logs be the only record
- Localhost-first development

## Technical Preferences

- Lightweight > framework-heavy
- Embeddable tools (e.g., SQLite) preferred
- Practical improvements that can ship immediately

## Delegation Stance

- Commander delegates all implementation to executor/reviewer agents
- Never self-approve; use independent reviewer pass

## Related Pages

- [Delegation Contract](./delegation-contract.md)
- [Holonomic Brain Operating Model](./holonomic-brain-operating-model.md)

## Change Log

- {{DATE}}: Initial version.
