# Offspace Intercept 프로젝트 로드맵

> 최종 업데이트: 2026-04-11 | 작성: 코부장
> 이 문서는 프로젝트의 단일 진실 공급원(Single Source of Truth)이다. 새 세션을 시작하는 에이전트는 이 문서를 먼저 읽을 것.

---

## 1. 프로젝트 비전

### 피벗 배경

원래 이 프로젝트(`18_OffSpace_Self_Growth_Agent`)는 에이전트 자체가 스스로 진화하는 시스템이었다. 그러나 2026년 4월 초, 매일 티타임 콘텐츠를 발행하며 인터랙티브 AI 뉴스 서비스로 방향이 명확해졌다. 서비스명 **Intercept(인터셉트)** 로 확정하고, Next.js 웹앱(`intercept/`)을 메인 제품으로 삼는다.

### 이중 목표 구조

| 목표 | 설명 | 주기 |
|------|------|------|
| **1. 콘텐츠 발행** | 매일 AI 동향을 코부장·오과장·젬대리 3인 티타임 대화로 정리, 티스토리 블로그 게시 | 1일 1회 |
| **2. 서비스 런칭** | 독자가 AI 대화에 직접 끼어들 수 있는 인터랙티브 뉴스 플랫폼을 글로벌 SaaS로 출시 | Phase별 |

### 서비스 컨셉

> "AI가 나누는 대화에 독자가 직접 끼어드는 인터랙티브 뉴스"

- 독자가 캐릭터들의 AI 뉴스 대화를 읽다가 끼어들기 버튼을 누르면 팀 전체가 반응
- 끼어들기 응답은 반드시 캐릭터 **최소 2명** 이상이 답변
- 아마추어 감성, MD(마크다운) 느낌의 디자인 유지
- 글로벌 서비스 지향 — 영어 콘텐츠 확장 가능 구조

---

## 2. 완료 내역 (Done)

| 세션 | 날짜 | 주요 완료 사항 |
|------|------|--------------|
| 세션 1 | 2026-04-02~03 | `CLAUDE.md` 작성, 티타임 Vol.1~2 발행, 사업분석 **Go 판정 (7.5/10)** |
| 세션 2 | 2026-04-03 | Intercept MVP 구축, MD감성 디자인, 끼어들기 API(Gemini 2.5-flash), 캐릭터 SVG 3종 |
| 세션 3 | 2026-04-04 | 캐릭터 픽셀아트 전 페이지 반영 (`imageRendering: 'pixelated'`) |
| 세션 4 | 2026-04-05 | 파일명 컨벤션 통일, 젬대리 SVG 수정, `CHARACTER_PROFILES.md` 작성, 야식타임 발행 |
| 세션 5 | 2026-04-06 | 티타임 Vol.4 발행, `TEATIME_RULES.md` 확정 |
| 세션 6 | 2026-04-07 | `FloatingCharacters.tsx` 인터랙션 완성, Pretext 통합 + 디버깅, Vol.5 발행, 캐릭터 위치 피드백 반영 |

### 현재 발행된 티타임

| 날짜 | 파일 | 비고 |
|------|------|------|
| 2026-04-02 | `output/teatime/2026-04-02_AI동향_티타임.md` | Vol.1 |
| 2026-04-03 | `output/teatime/2026-04-03_AI동향_티타임.md` | Vol.2 (레퍼런스 기준) |
| 2026-04-05 | `output/teatime/야식타임_2026-04-05.md` | 야식타임 |
| 2026-04-06 | `output/teatime/티타임_2026-04-06.md` | Vol.4 |
| 2026-04-07 | `output/teatime/티타임_2026-04-07.md` | Vol.5 |
| 2026-04-09 | `output/teatime/티타임_2026-04-09.md` | Vol.6 |

---

## 3. 현재 상태 (Current)

### 동작 중인 기능

| 기능 | 상태 | 파일 |
|------|------|------|
| 티타임 대화 페이지 (MD 감성) | 정상 | `intercept/src/app/teatime/page.tsx` |
| 끼어들기 기능 (Gemini 2.5-flash) | 정상 | `intercept/src/app/teatime/InterceptButton.tsx` |
| FloatingCharacters 인터랙션 | 정상 | `intercept/src/components/FloatingCharacters.tsx` |
| Pretext displacement 효과 | 정상 | `intercept/src/components/PretextMessage.tsx` |
| CharacterPositionContext | 정상 | `intercept/src/components/CharacterPositionContext.tsx` |
| 프라이싱 페이지 (Free/Basic $2.99/Pro $8) | 정상 | `intercept/src/app/pricing/page.tsx` |
| PayPal 구독 (플레이스홀더) | 미완성 | `intercept/src/lib/paypal-provider.tsx` |
| 빌드 (`npm run build`) | PASS | — |

### 캐릭터 시스템

| 캐릭터 | SVG 파일 | 색상 | 성격 |
|--------|---------|------|------|
| 코부장 | `Ko-bujang.svg` | 오렌지 곰고양이 | 빨간 넥타이, 듬직한 맏형, 기술 분석 담당 |
| 오과장 | `Oh-gwajang.svg` | 초록 개구리 | 안경, 현실주의 기획자, 팩트/숫자 담당 |
| 젬대리 | `Jem-daeri.svg` | 인디고 고양이 | 호기심 막내, 별 반짝, 커뮤니티 캐치 담당 |

### 캐릭터 인터랙션 동작

- 마우스 커서 추적 — 120~180px 옆 위치 유지 (클릭 영역 방해 금지)
- 클릭 액션 순환: 속닥속닥 → 커피 → 신남
- 끼어들기 입력 포커스 시 왼쪽에 집결 (listening 자세)
- 모바일: 터치 기반 포지션 추적

### 인프라

| 항목 | 내용 |
|------|------|
| 개발 서버 | `http://localhost:3000` (Next.js dev) |
| PM2 포트 | `4000` (`intercept/ecosystem.config.cjs`) |
| LLM API | **Gemini 2.5-flash** (끼어들기 응답) |
| 사내 LLM 인프라 | Blackwell Pro6000 VRAM 96GB × 2장, vLLM + Qwen-3.5-35b — **사내 블랙웰은 Intercept 서비스에 사용 불가** (2026-04-10 확인) |
| Pretext 라이브러리 | `@chenglou/pretext@0.0.4` |
| 원격 트리거 ID | `trig_01CYszYhgMvXg6jvixkoG7Px` (수동 운영 중) |
| GitHub | https://github.com/imejaim/OffSpace-Self-Growth-Agent |

---

## 4. 미결 사항 (Open Questions)

> 출처: `.omc/plans/open-questions.md` (2026-04-08 기준)

### 결제/인증 (Phase 2 착수 전 결정 필요)

| 질문 | 현재 상태 | 결정 필요 시점 |
|------|----------|-------------|
| 카카오페이/네이버페이 직접 vs 포트원(PortOne) | ~~미결~~ **[x] 포트원(PortOne) 확정 (2026-04-10)** | 완료 |
| 간편계좌이체 자동화 수준 | 미결 | Phase 2 설계 시 |
| 쿠폰 시스템 기존 코드 존재 여부 확인 | 미확인 | 즉시 확인 가능 |
| PayPal Billing Plan ID 생성 | ~~플레이스홀더~~ **[x] intercept sandbox 앱 생성 완료, Plan ID는 Dashboard에서 생성 필요 (2026-04-10)** | 완료 |
| 월 구독 가격 | ~~$2.99 재검토~~ **[x] Free 2/day · Basic $2.99/150mo · Pro $8/500mo · Pay-per-use $1/10 (2026-04-10)** | 완료 |
| 무료 사용자 일일 끼어들기 한도 | ~~3회 vs 5회 미결~~ **[x] 2회/일 확정 (2026-04-10)** | 완료 |

### 배포/인프라

| 질문 | 현재 상태 | 참고 |
|------|----------|------|
| 배포 플랫폼 (Vercel vs Cloudflare) | ~~미결~~ **[x] Cloudflare Pages 확정 (2026-04-10 CCG 분석)** | 완료 |
| Supabase 리전 | ~~도쿄 vs 싱가포르 미결~~ **[x] us-east-1 확정 (글로벌 타겟, 2026-04-10)** | 완료 |
| Supabase SSR + Next.js 16.2.2 호환성 | **해결** — Phase 0.0 PoC 완료, Fallback(NextAuth.js) 명시 | — |
| Vercel Serverless rate limiting → Upstash Redis 전환 시점 | 미결 | 사용자 수 기준 트리거 필요 |
| Supabase Realtime 전환 시점 | "동시 접속 50+" 기준 검토 필요 | — |

### 콘텐츠/UX

| 질문 | 현재 상태 |
|------|----------|
| 끼어들기 → Pretext 마크다운 챗 형식 전환 | 기획 단계 |
| Spline 3D 캐릭터 전환 (현재 픽셀아트 SVG) | 대표님 결정 필요 |
| 뒷담화 섹션 소스 수집 파이프라인 (자동 vs Gemini 검색 위임) | 미결 |

---

## 5. 로드맵 (Roadmap)

### Phase 1: 내부 완성 (현재 ~ 2주)

**목표**: 매일 안정적으로 발행하고, 핵심 UX를 완성한다.

- [ ] 매일 티타임 콘텐츠 발행 (1일 1회, 수동 운영)
  - 작성 전 `python scripts/teatime-skeleton.py YYYY-MM-DD` 실행
  - 완성 후 `python scripts/teatime-skeleton.py --validate <파일경로>` 검증
- [ ] 모바일 반응형 최종 점검 — `FloatingCharacters` 터치 동작 실기기 확인
- [ ] 끼어들기 → Pretext 마크다운 챗 형식 UX 개선
- [ ] 실 사용자 테스트 — 끼어들기 10회 내부 테스트 → 지인 5명 테스트
- [ ] Spline 3D vs 픽셀아트 유지 최종 결정
- [ ] Custom newsletter 3-topic structure 설계 (뉴스레터 커스터마이징 구조)

### Phase 2: MVP 런칭 준비 (2주 ~ 4주)

**목표**: 유료 서비스로 운영할 수 있는 최소 인프라를 갖춘다.

- [ ] Supabase 인증 연동 (이메일 + 소셜 로그인)
  - `@supabase/ssr` + Next.js 16.2.2 PoC 결과 반영
  - 실패 시 NextAuth.js fallback 실행
- [ ] 결제 시스템 — 포트원(PortOne) + PayPal 구현 (확정)
  - PayPal: `P-PLACEHOLDER_PLAN_ID` → Dashboard에서 실제 Billing Plan ID 생성
  - Supabase 리전: us-east-1 (확정)
- [ ] 요금제 구현: Free 2/day · Basic $2.99/150mo · Pro $8/500mo · Pay-per-use $1/10
- [ ] 소셜 기능 — 공개 끼어들기, 베스트 끼어들기
- [ ] Cloudflare Pages 프리뷰 배포 (확정)

### Phase 3: 퍼블릭 런칭

**목표**: 실제 사용자를 받고, 콘텐츠와 기능을 확장한다.

- [ ] Cloudflare Pages 프로덕션 배포
- [ ] 콘텐츠 확장 — 스포츠, 연예, K-pop 카테고리 추가
- [ ] 뒷담화 섹션 소스 수집 파이프라인 자동화
- [ ] 영어 콘텐츠 대응 (글로벌 서비스 지향)
- [ ] 마케팅 — 티스토리 블로그 SEO, SNS 채널 운영
- [ ] **Social = #1 moat** — Save & Publish 기능, 슬라이드 애니메이션 전환 효과
- [ ] Supabase Realtime 전환 (동시 접속 50+ 도달 시)

### Phase 4: 스폰서십 통합 (사용자 10K+ 이후)

**목표**: 광고 없이 스폰서십 기반 수익 다각화.

- [ ] 스폰서십 첫 영업 — 사용자 10K+ 달성 후 시작
- [ ] 스폰서 콘텐츠 형식 정의 (티타임 내 네이티브 광고 vs 별도 섹션)
- [ ] 스폰서십 대시보드 — 노출수, 클릭수, 끼어들기 연동 트래킹
- [ ] 도메인 확정 및 브랜드 정비 (intercept.ai / intercept.news 미정)

---

## 6. 검증 퀴즈 (Verification Quiz)

> 새 세션을 시작하는 에이전트(오과장/젬대리)는 이 퀴즈를 통해 프로젝트 핵심 사실을 확인해야 한다.

**Q1. 프로젝트의 이중 목표는?**
**Q2. 서비스 이름은?**
**Q3. 티타임 고정 카테고리 5개는? (순서 포함)**
**Q4. 출처 최소 기준 3가지는?**
**Q5. 캐릭터별 소스 채널 분담은?**
**Q6. 현재 끼어들기에 사용 중인 LLM API는?**
**Q7. 끼어들기 응답 시 최소 몇 명의 캐릭터가 반응해야 하는가?**
**Q8. 현재 PM2 배포 포트는?**
**Q9. 사업 판정 점수와 결과는?**
**Q10. Phase 1 다음 우선 작업 3가지는?**

---

### 정답

**A1.** (1) 매일 티타임 AI 뉴스 콘텐츠 발행, (2) 글로벌 인터랙티브 뉴스 SaaS 서비스 런칭

**A2.** Intercept (인터셉트)

**A3.**
1. AI 핫뉴스 — 빅테크 동향, 투자/인수/IPO, 경영진 변동
2. AI 에이전트 — 프레임워크, 프로토콜 표준, 배포 사례
3. AI 논문과 모델 — 모델 릴리즈, 벤치마크, 오픈소스, 추론 인프라
4. AI 로봇 / 피지컬 AI — 휴머노이드, 자율주행, 온디바이스 HW
5. 보너스 / 그 외 — 규제, 사회 이슈, 재미

**A4.**
- 토픽당 링크 3개 이상
- 전체 티타임 총 출처 12개 이상
- SNS/커뮤니티 출처(Reddit, YouTube, X.com, HN 등) 2개 이상

**A5.**
- **젬대리**: Reddit, YouTube, X.com, GitHub — 커뮤니티 캐치
- **오과장**: HackerNews, Crunchbase, 시장 보고서 — 팩트/숫자 보강
- **코부장**: 공식 블로그, arXiv 논문, 기술 문서 — 기술 분석, 마무리

**A6.** Gemini 2.5-flash API

**A7.** 최소 2명 (끼어들기 답변은 항상 2명 이상 반응, 독백 금지)

**A8.** 포트 4000 (`intercept/ecosystem.config.cjs`, PM2 배포)
개발 서버는 `localhost:3000`

**A9.** 7.5/10 — **Go 판정** (세션 1, 2026-04-02)

**A10.**
1. 매일 티타임 콘텐츠 생성 (`python scripts/teatime-skeleton.py YYYY-MM-DD` → 작성 → `--validate`)
2. 모바일 반응형 실기기 점검 (`FloatingCharacters` 터치 동작)
3. 끼어들기 UX → Pretext 마크다운 챗 형식 전환 기획

---

## 7. 하네스 체크리스트

> 무엇이 어디에 저장됐는지, 어떻게 잊지 않도록 했는지 매핑.

| 저장소 | 경로 | 내용 | 갱신 주기 |
|--------|------|------|---------|
| **auto-memory** | `~/.claude/projects/.../memory/MEMORY.md` | 피드백(디자인/콘텐츠/캐릭터), 사업 정보, 개발 환경 설정 | 세션마다 자동 갱신 |
| **CLAUDE.md** | `C:\Project\18_OffSpace_Self_Growth_Agent\CLAUDE.md` | 프로젝트 규칙, 티타임 발행 필수 규칙, 캐릭터 채널 분담 | 규칙 변경 시 수동 갱신 |
| **SESSION_HANDOFF.md** | `output/SESSION_HANDOFF.md` | 세션 간 인수인계 — 동작 중인 것, 다음 할 것, 알려진 이슈 | 세션 종료 시 갱신 |
| **PROJECT_ROADMAP** | `output/PROJECT_ROADMAP_2026-04-09.md` (이 문서) | 단일 진실 공급원 — 비전, 완료 내역, 미결 사항, 로드맵, 검증 퀴즈 | 마일스톤마다 갱신 |
| **project-memory.json** | `.omc/project-memory.json` | 에이전트 간 공유 메모리 (OMC 도구 활용) | OMC 에이전트 자동 |
| **open-questions.md** | `.omc/plans/open-questions.md` | 미결 기술/사업 결정 사항 목록 | 결정 발생 시 갱신 |
| **TEATIME_RULES.md** | `output/teatime/TEATIME_RULES.md` | 콘텐츠 품질 규칙 — 카테고리 구조, 출처 기준, 이미지 규칙, 템플릿 | 규칙 변경 시 수동 갱신 |
| **티타임 파일** | `output/teatime/티타임_YYYY-MM-DD.md` | 발행된 콘텐츠 원본 | 매일 추가 |

### 새 세션 시작 순서

```
1. output/PROJECT_ROADMAP_2026-04-09.md  ← 이 문서 (전체 맥락)
2. output/SESSION_HANDOFF.md              ← 직전 세션 상태
3. .omc/plans/open-questions.md           ← 미결 사항 확인
4. CLAUDE.md                              ← 발행 규칙 재확인
```

---

*최종 업데이트: 코부장 (2026-04-11)*
