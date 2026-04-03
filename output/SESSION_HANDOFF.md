# 세션 핸드오프 — 2026-04-03

> 다음 세션에서 이 문서를 읽고 이어서 진행하세요.

## 프로젝트 개요

**Offspace Self-Growth Agent** — 스스로 진화하는 AI 에이전트 시스템.
매일 AI 동향을 파악하고 코부장·덱과장·제대리 3인 티타임 대화로 정리.
GitHub: https://github.com/imejaim/OffSpace-Self-Growth-Agent

## 오늘 완료한 것

| 완료 항목 | 파일 위치 |
|----------|----------|
| CLAUDE.md 생성 | `/CLAUDE.md` |
| 티타임 Vol.1 (4/2) | `/output/teatime/2026-04-02_AI동향_티타임.md` |
| 티타임 Vol.2 (4/3) + 끼어들기 답변 3건 | `/output/teatime/2026-04-03_AI동향_티타임.md` |
| 끼어들기 뉴스앱 사업분석 (471줄) | `/output/business/끼어들기_뉴스앱_사업분석.md` |
| 웹앱 디자인 레퍼런스 10선 | `/output/design/웹앱_디자인_레퍼런스_10선.md` |
| 티타임 레이아웃 제안서 + HTML 프로토타입 v1 | `/output/design/teatime_layout_proposal.md`, `teatime_prototype.html` |
| NYT 레이아웃 레퍼런스 이미지 | `/output/design/reference/nyt_layout_ref*.png` |
| 매일 04:28 KST 원격 트리거 설정 | `trig_01CYszYhgMvXg6jvixkoG7Px` (단, git push 인증 문제로 실패 → 당분간 수동) |

## 대표님 결정사항 (확정)

- 티타임 자동화는 **당분간 수동**으로 진행
- 콘텐츠 발행: **1일 1회**
- 끼어들기 응답: **캐릭터 2명**이 답변
- **글로벌 서비스** 지향
- GitHub 마크다운이 HTML보다 좋음 → **아마추어 감성, 진짜 수다 느낌** 유지
- 사업분석 결과 **Go 판정** (7.5/10)

## 다음 세션에서 해야 할 것 (대표님 결정 대기)

### 1. 서비스명 확정
대표님 후보:
- **Intercept (인터셉트)** — 대표님 유력 후보
- TableTalk, 끼톡, 버틴(Butt-in), 사이다(CIDER) 등 추가 후보

### 2. 디자인 방향 선택
Top 3 레퍼런스:
1. **Hacker News** — 극단적 미니멀, 아마추어 레전드
2. **theSkimm** — 이름:텍스트 방식, 친구 같은 톤
3. **Muzli Chat UI** — 채팅 UI 60개+ 모음

→ 방향 확정 후 **프로토타입 1~2개 제작**

### 3. 추가 검토 사항
- 사용자 페르소나/캐릭터 시스템 설계
- 소셜 기능 (공개 끼어들기, 베스트 끼어들기, 중첩 끼어들기)
- 주제 확장 (스포츠, 연예, K-pop 등) + 캐릭터 다양성 (여성, 신입)
- 기술 스택 결정 (Google AI Studio, Next.js+Vercel, Cloudflare 등)
- 끼어들기 1회당 API 비용 시뮬레이션
- 끼어들기 수동 테스트 10건 → 지인 5명 테스트

## 사내 인프라 참고 (대표님이 공유)

- Blackwell Pro6000 VRAM 96GB × 2장
- 현재: vLLM + Qwen-3.5-35b 서빙 중, opencode + OMO 셋팅 중
- 검토 예정: ① MRV2 업그레이드 → ② Qwen-3.5-120b → ③ DeepSeek-V3.2 툴콜링 → ④ gpt-oss
- (급하지 않음, 여유 있을 때 하나씩)

## 원격 트리거 정보

- ID: `trig_01CYszYhgMvXg6jvixkoG7Px`
- 스케줄: 매일 19:28 UTC (04:28 KST)
- 상태: enabled이지만 git push 인증 문제로 결과물 미반영
- 관리: https://claude.ai/code/scheduled/trig_01CYszYhgMvXg6jvixkoG7Px
