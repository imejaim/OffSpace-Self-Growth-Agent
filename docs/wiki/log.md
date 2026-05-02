# Wiki Log

## [2026-04-25] incident | paypal profile-not-found + sign-out no-op

- PayPal Sandbox capture failed with `addCredits failed: Profile not found` because profile creation was only on the client; user existed in `auth.users` but not in `public.profiles`.
- Sign-out cleared local React state but left SSR cache stale, so server-rendered UI kept showing the previous user.
- Fix: added `auth.users` insert trigger and self-healing `add_credits` in `003_profile_self_heal.sql`; `auth/callback` and `addCredits` now ensure the profile row server-side; `signOut` now calls `router.refresh()` to invalidate the App Router cache.
- Recorded in `docs/wiki/incidents/2026-04-25-paypal-profile-not-found-and-signout.md`.

## [2026-04-14] wiki | bootstrap

- Created `docs/raw/` as the immutable source layer.
- Created `docs/wiki/` with schema, index, and log files.
- Added first architecture page for auth/session knowledge.
- Added first incident page for the production login regression and fix.
- Added second-brain adoption plan aligned to the LLM Wiki pattern.

## [2026-04-14] incident | login hydration regression

- Recorded the login regression as a first-class incident instead of leaving it only in meeting logs.
- Promoted the auth/session fix into durable architecture knowledge and prevention rules.

## [2026-04-14] memory | project memory update

- Updated machine-readable project memory to point agents to the wiki layer.
- Added explicit note that auth regressions must be documented in `docs/wiki/incidents/`.

## [2026-04-14] strategy | holonomic brain

- Added the `Holonomic Brain` operating model for the repository.
- Recorded the multi-agent roster, nicknames, and working environments.
- Promoted project identity and agent self-model knowledge into first-class durable memory.

## [2026-04-14] docs | archive cleanup

- Moved historical `ULTRAPLAN` snapshots out of the main `docs/` surface into `docs/archive/plans/2026-04-13/`.
- Kept `AnCo_Meeting.md` at the top level because it is still an active operational note.
- Added an archive readme so historical docs stay discoverable without competing with the wiki.

## [2026-04-14] crystallization | meeting notes

- Promoted the product identity pivot and three-surface service model out of `AnCo_Meeting.md` into a strategy page.
- Promoted pricing and payment setup dependencies out of the meeting notes into an architecture page.
- Reduced the risk that core product and operations knowledge remains trapped in operational logs.

## [2026-04-14] tooling | graphify

- Installed Graphify and connected it to Codex, Gemini CLI, OpenCode, and Antigravity.
- Generated the initial code graph in `graphify-out/`.
- Recorded the rule that Graphify is the structural graph layer and the wiki remains the curated durable knowledge layer.

## [2026-04-14] architecture | local-first development rule

- Cloudflare reported the daily Workers request limit exceeded on `interceptnews.app` with no real user traffic.
- Root causes: developing against the deployed site instead of localhost, `workers_dev = true` exposing the `*.workers.dev` subdomain, and `middleware.ts` running `supabase.auth.getUser()` on every non-static hit.
- Added `docs/wiki/architecture/local-first-development.md` as the durable rule: `npm run dev` is the primary surface; deployment is the final step after local verification.
- Updated `intercept/.env.local` so `NEXT_PUBLIC_SITE_URL` points at `http://localhost:3000`, preventing OAuth redirects and share links from bouncing back to prod during local dev.
- Flagged `workers_dev = false` as a required prod config change (pending operator approval).
- **Update (same day)**: operator approved. Set `workers_dev = false` in `intercept/wrangler.toml`, fixed a blocking TypeScript error in `TeatimeView.tsx` (implicit any on `messagesToRender.map` callback), and deployed. Wrangler confirmed: `workers.dev route is disabled`; only `interceptnews.app` and `www.interceptnews.app` remain as public entrypoints. Post-deploy smoke tests passed (root, /teatime, /feed all 200).
- Tightened `intercept/src/middleware.ts` matcher to exclude `/api/*`, webhooks, cron, and common static extensions, so API routes and external webhooks no longer trigger a redundant `supabase.auth.getUser()` per hit. Session refresh remains active for page navigations.
- Verified local payment flow works on `localhost:3000`: `/pricing` returns 200, `/api/payment/paypal/create-order` returns 401 without auth (route alive), `/api/payment/portone/confirm` returns 401 without auth (route alive). PayPal and PortOne libs already use a `resolveEnv()` helper that falls back to `process.env`, so sandbox credentials from `.env.local` are picked up without code changes.

## [2026-04-14] knowledge | payment domain into the Holonomic Brain

- Added `docs/raw/payment/intercept-payment-stack-2026-04-14.md` — full verified facts from direct code read: providers, route surface, `resolveEnv` pattern, credit economy rates, tier mapping, known gaps.
- Added `docs/raw/payment/env-variables-2026-04-14.md` — public/secret env var snapshot with purpose and consumer for each key.
- Promoted the facts into `docs/wiki/architecture/payment-and-operations-model.md` under a new "Verified Stack (2026-04-14)" section linking back to the raw files.
- Established the "지식화" workflow as a durable feedback memory so future agents know exactly what to do when the operator says "이것 지식화해": raw → wiki → index → log → machine memory.

## [2026-04-14] tooling | holonomic brain visualization

- Built a single-file HTML force-directed graph viewer that merges code nodes from `graphify-out/graph.json` with `docs/wiki/*` knowledge nodes and `docs/raw/*` source nodes into one shared visualization, colored by layer.
- Stored at `graphify-out/holonomic-brain.html`, regenerable via `scripts/build_brain_viz.py`.

## [2026-04-14] incident | payment provider regression

- Confirmed from official PortOne docs that TossPayments no longer allows `payMethod: EASY_PAY` without `easyPay.easyPayProvider`; the old assumption about an implicit unified picker was stale after the 2024-01-31 update.
- Updated `intercept/src/components/PaymentSelector.tsx` to add explicit provider choice (`KAKAOPAY`, `NAVERPAY`, `TOSSPAY`), include `redirectUrl` for mobile, and surface clearer contract/test-mode failures.
- Recorded the checkout failure and its prevention rules in `docs/raw/payment/portone-tosspayments-easypay-2026-04-14.md` and `docs/wiki/incidents/2026-04-14-payment-provider-regression.md`.
- Extended `docs/wiki/architecture/payment-and-operations-model.md` so payment knowledge now includes provider-specific checkout rules, fail-closed PayPal setup rules, and pricing-page escape-path checks.

## [2026-04-16] strategy | brain-system additions

- Added USER preferences layer at `docs/wiki/strategy/user-operating-preferences.md` to hold 대표님의 reporting style and operating principles, separate from project facts.
- Added delegation contract at `docs/wiki/strategy/delegation-contract.md`: subagents start from zero knowledge; parent must pass explicit minimum context packet.
- Added regenerable SQLite FTS5 search index at `data/brain/brain.db`, rebuilt via `scripts/index_brain.py`, queried via `scripts/search_brain.py`.

## [2026-04-20] brand | "끼어들기" → "인터셉트" 표기 통일 (안팀장)

- 서비스 전반의 사용자향 카피에서 "끼어들기"를 "인터셉트"로 일괄 치환. 코드 식별자(kobu/oh/jem, route /api/intercept)는 변경 없음.
- 영향 범위: API 시스템 프롬프트(`api/intercept`, `api/teatime/chatter`), `api/og`, `i18n/ko.ts`, `translations.json`, AppShell·ShareCard·FeedView·MyKeepView·PricingHeader, profile/share/feedback/pricing-credits 페이지.
- 동시에 `<a>`→`<Link>` prefetch 정리, `ShareCard` 하이드레이션 안정화, `FloatingCharacters` 클램프 보강을 같은 묶음에서 진행.
- 캐릭터 페르소나 프롬프트도 "프리미엄 매거진" 톤으로 강화: 코부장(테크 리드), 오과장(마켓 전략가), 젬대리(커뮤니티 스카우트). 각 take 2~4문장·구체 수치/사례 권장.

## [2026-04-20] payment | wrangler 환경/시크릿 정리 (안팀장)

- `intercept/wrangler.toml` 에 `PAYPAL_CLIENT_ID` (서버측), `CRON_SECRET`, `PAYPAL_WEBHOOK_ID` 시크릿 명시.
- TossPayments 테스트 시크릿 의존성 정리(`PORTONE_TEST_SECRET_KEY` 주석 제거), 시크릿 등록 명령을 `wrangler versions secret put` 으로 갱신.
- 직전 커밋 `e122460 feat(payment): finalize intercept-exclusive paypal subscription` 의 환경 변수 매칭 작업.
- 잔존 이슈: `PAYPAL_CLIENT_ID` 가 `[vars]` 평문(공개 키와 동일값). 후속에서 시크릿로 재배치 검토 필요 — 안팀장 핑.

## [2026-04-20] tooling | graphify 출력물 ignore + 다중 IDE 에이전트 표준화

- `.gitignore` 에 `graphify-out/`, `intercept/graphify-out/` 추가. 환경별(Codex/Gemini/OpenCode/Antigravity) 재생성 산출물이라 커밋 시 diff 폭발 방지 목적.
- `.codex/hooks.json`, `.gemini/settings.json`, `.opencode/plugins/graphify.js`, `.agent/rules·workflows/graphify.md`, 루트 `AGENTS.md`/`GEMINI.md`/`opencode.json` 신설 — 모든 에이전트가 동일한 graphify 그래프 사용·재생성하도록 통일.
- `holonomic-brain-kit/` 내 README/scripts/templates/example 정리: 다른 프로젝트로 복제 가능한 포터블 킷 형태로 갖춤.

## [2026-04-21] strategy | tistory publishing investigation

- Tistory Open API가 2024년 2월 완전 종료된 사실 확인 (신규 앱 등록 불가, 모든 엔드포인트 차단).
- 1안: Playwright 브라우저 자동화 (MD→HTML 변환 + 에디터 자동 입력 + 승인 게이트) 실행 계획 수립.
- 2안: velog 채널 전환 (MD 네이티브, 개발자 독자층) 대안으로 제시.
- 대표님 결정 필요 항목 5개 도출 (계정 존재 여부, 채널 선택, 승인 게이트 방식, 이미지 전략, 발행 타이밍).
- `docs/wiki/strategy/teatime-publishing-tistory.md` 신설.

## [2026-04-20] content | 티타임 Vol.10 발행

- `output/teatime/2026-04-20_AI동향_티타임.md` 생성. `python scripts/teatime-skeleton.py --validate` 통과(errors 0, warnings 0). 링크 25/이미지 2/SNS 다수.
- 헤드라인: Anthropic 매출 OpenAI 첫 추월, MS Agent Framework 1.0 LTS, Gemma 4 오픈소스, Boston Dynamics IPO 준비, EU AI Act 약화 움직임.

## [2026-04-21] strategy | intercept teatime service upgrade plan

- Track 3 분석: 서비스 티타임 콘텐츠 밀도가 MD 대비 ~20~25% 수준. 데이터 모델은 이미 MD 스키마와 1:1 대응(`RawReference.rating`, `RawTopicImage.source`, 바이링구얼).
- 진짜 병목은 `default-topics.ts` seed 얕음과 MD→TS 변환기 부재.
- 4단계 로드맵 (0: 모델 minor 확장 / 1: 변환기 / 2: UI / 3: cron 자동화). Vol.10·11 수동 포팅이 2일 내 효과 가장 큼.
- 결정 필요 포인트 6건: 카테고리 체계, 바이링구얼 번역, 아카이브 노출, 수동 포팅 우선, 이미지 호스팅, SNS 배치.
