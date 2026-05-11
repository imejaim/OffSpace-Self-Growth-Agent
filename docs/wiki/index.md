# Wiki Index

## Architecture

- [Auth And Session Model](./architecture/auth-and-session-model.md): Login/session lifecycle, client-state propagation, middleware/proxy behavior, and failure boundaries.
- [Graphify Knowledge Graph](./architecture/graphify-knowledge-graph.md): How Graphify is installed, what environments it is connected to, and how the generated graph fits the Holonomic Brain.
- [Local-First Development Workflow](./architecture/local-first-development.md): Rule that all development happens on localhost first and deployment is the final step, to protect the Cloudflare Workers quota.
- [Payment And Operations Model](./architecture/payment-and-operations-model.md): Pricing snapshot, payment stack, verified provider routes, secret resolution pattern, and recurring operational dependencies.
- [Teatime Publishing Pipeline](./architecture/teatime-publishing-pipeline.md): 정기발행·인터셉트 발행 두 모드, 공통 5단계 파이프라인, 카테고리 룰, 캐릭터 채널 분담, 사용자 권한 정책.
- [Cloudflare Workers Deploy Checklist](./architecture/cloudflare-workers-deploy-checklist.md): deploy 전 5단계 필수 체크리스트, dev artifacts 누설 방지, curl 기반 production 검증 방법.
- [Intercept Grounding Architecture](./architecture/intercept-grounding-architecture.md): Client→server payload contract (teatimeId/topicId), server context builder, system prompt 4-axis structure, model chain (Llama 3.3 70B → Qwen2.5 → Gemma 3 → Gemini 2.5-flash), and future extension points (Pack B, RAG).
- [Option B Follow-up Work Items](./architecture/option-b-followups-2026-05-11.md): Eight follow-up tasks after the 2026-05-06 publish failure and 2026-05-10 hallucination incident — robotics sources, og fallback, pipeline step-skip, try/finally env-restore, Task Scheduler verification, Google Search grounding, hard channel enforcement, and gitignore cleanup.

## Incidents

- [2026-04-14 Login Hydration Regression](./incidents/2026-04-14-login-hydration-regression.md): Production login pill stayed in loading state or became non-interactive because hydration integrity and view initialization were broken.
- [2026-04-14 Payment Provider Regression](./incidents/2026-04-14-payment-provider-regression.md): Credits checkout failed because TossPayments easy-pay requests omitted `easyPayProvider`, and PayPal subscription setup needed fail-closed plan validation.
- [2026-04-25 PayPal Profile-Not-Found + Sign-out No-op](./incidents/2026-04-25-paypal-profile-not-found-and-signout.md): PayPal capture-order failed with `Profile not found` because profile creation was client-only; sign-out left server-rendered UI signed-in. Fixed via auth.users trigger, self-healing `add_credits`, server-side ensure on auth callback, and `router.refresh()` on sign-out.
- [2026-05-01 Teatime Publish, Feed, and Floating Characters](./incidents/2026-05-01-teatime-publish-feed-floating-characters.md): Publish did not persist to the public feed and floating characters drifted because of stale dev server state, missing publish API calls/schema fields, profile inner joins, placeholder feed UI, and fixed positioning inside a transformed carousel card.
- [2026-05-06 Teatime Publish stderr Trap](./incidents/2026-05-06-teatime-publish-stderr-trap.md): Automated daily publish aborted at 06:30 KST because validate-links.py wrote `[WARN]` to stderr; PowerShell 5.1's `2>&1` wrapped it as an ErrorRecord, causing `$ErrorActionPreference=Stop` to throw on a non-fatal warning. A secondary failure left `.env.local` unrestored when the env-restore step was not guarded in try/finally.
- [2026-05-10 Intercept Hallucination — Stale Training Data](./incidents/2026-05-10-intercept-hallucination-llama2.md): Production intercept responses ignored injected references and generated fabricated content from training data because the client payload omitted `teatimeId`/`topicId`, the server never fetched archive references, and the system prompt had no abstention guard. Fixed by Pack A (commit 1df6b0b).

## Strategy

- [Delegation Contract](./strategy/delegation-contract.md): Rule that subagents start from zero knowledge; defines the minimum context packet parents must pass.
- [Holonomic Brain Operating Model](./strategy/holonomic-brain-operating-model.md): Project identity, agent roster, IDE environments, and the rule that many agents must operate as one evolving brain.
- [LLM Wiki Adoption Plan](./strategy/llm-wiki-adoption-plan.md): How Karpathy-style LLM Wiki concepts are adapted to Intercept as a project second brain.
- [Product Identity And Surface Model](./strategy/product-identity-and-surface-model.md): Identity pivot, three-surface product structure, character roles, and durable UI direction.
- [User Operating Preferences](./strategy/user-operating-preferences.md): 대표님의 reporting style, operating principles, and technical preferences as a USER layer separate from project facts.
- [Teatime Intercept Service Upgrade](./strategy/teatime-intercept-service-upgrade.md): MD 대비 서비스 티타임 품질 갭 분석과 4단계 개선 로드맵.
- [Teatime Publishing — Tistory](./strategy/teatime-publishing-tistory.md): Tistory Open API 종료(2024-02) 확인, Playwright 반자동 발행(1안) 및 velog 채널 전환(2안) 실행 계획, 대표님 결정 필요 포인트 정리.

## Tooling

- SQLite FTS5 search index at `data/brain/brain.db` (regenerable, not source of truth). Rebuild with `python scripts/index_brain.py`, query with `python scripts/search_brain.py <query>`.
