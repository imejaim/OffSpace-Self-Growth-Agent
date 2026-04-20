# Wiki Index

## Architecture

- [Auth And Session Model](./architecture/auth-and-session-model.md): Login/session lifecycle, client-state propagation, middleware/proxy behavior, and failure boundaries.
- [Graphify Knowledge Graph](./architecture/graphify-knowledge-graph.md): How Graphify is installed, what environments it is connected to, and how the generated graph fits the Holonomic Brain.
- [Local-First Development Workflow](./architecture/local-first-development.md): Rule that all development happens on localhost first and deployment is the final step, to protect the Cloudflare Workers quota.
- [Payment And Operations Model](./architecture/payment-and-operations-model.md): Pricing snapshot, payment stack, verified provider routes, secret resolution pattern, and recurring operational dependencies.

## Incidents

- [2026-04-14 Login Hydration Regression](./incidents/2026-04-14-login-hydration-regression.md): Production login pill stayed in loading state or became non-interactive because hydration integrity and view initialization were broken.
- [2026-04-14 Payment Provider Regression](./incidents/2026-04-14-payment-provider-regression.md): Credits checkout failed because TossPayments easy-pay requests omitted `easyPayProvider`, and PayPal subscription setup needed fail-closed plan validation.

## Strategy

- [Delegation Contract](./strategy/delegation-contract.md): Rule that subagents start from zero knowledge; defines the minimum context packet parents must pass.
- [Holonomic Brain Operating Model](./strategy/holonomic-brain-operating-model.md): Project identity, agent roster, IDE environments, and the rule that many agents must operate as one evolving brain.
- [LLM Wiki Adoption Plan](./strategy/llm-wiki-adoption-plan.md): How Karpathy-style LLM Wiki concepts are adapted to Intercept as a project second brain.
- [Product Identity And Surface Model](./strategy/product-identity-and-surface-model.md): Identity pivot, three-surface product structure, character roles, and durable UI direction.
- [User Operating Preferences](./strategy/user-operating-preferences.md): 대표님의 reporting style, operating principles, and technical preferences as a USER layer separate from project facts.

## Tooling

- SQLite FTS5 search index at `data/brain/brain.db` (regenerable, not source of truth). Rebuild with `python scripts/index_brain.py`, query with `python scripts/search_brain.py <query>`.
