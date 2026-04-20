# Intercept 서비스 티타임 발행 개선안

> **Status**: Draft · 2026-04-21
> **Track**: Track 3 — 서비스(Intercept) 발행 채널 품질 개선
> **Author**: architect (opus)

## Summary

서비스 티타임은 **MD 대비 콘텐츠 밀도 약 20~25% 수준** (토픽당 링크 1개 vs MD 5~6개, 이미지 0~1장 vs MD 2~3장, 메시지 3개 vs MD 4~5개, 카테고리 3개 vs MD 5개). 다행히 **TypeScript 데이터 모델(`RawReference.rating`, `RawTopicImage.source`, `pickText` 바이링구얼)은 이미 MD 스키마와 1:1 대응**하므로, 실제 변경 규모는 **minor**. 핵심 리스크는 데이터 모델이 아니라 (1) `default-topics.ts`의 얕은 수작업 풀, (2) MD→TS 자동 변환기 부재, (3) MD 5개 카테고리와 서비스 3개(핫/랜덤/소곤) 체계 불일치다.

## Analysis

### A. 서비스 티타임 현재 상태 (2026-04-21 기준)

| 항목 | 값 | 근거 |
|---|---|---|
| 노출 중인 데이터 | `DEFAULT_TEATIME` 단 1건 | `intercept/src/lib/teatime-data.ts:857-859` — `ALL_TEATIMES = [DEFAULT_TEATIME]` |
| 토픽 수 | 3개 (핫/랜덤/소곤) | `default-topics.ts:1076-1083` — `getTodaysDefaultTopics` |
| 토픽당 평균 메시지 수 | 3개 (jem/oh/kobu 각 1턴) | `default-topics.ts` 전 풀 동일 |
| 토픽당 평균 문장 수 | 한 턴당 1문장, 토픽당 약 3문장 | `default-topics.ts:42-69` 등 |
| 토픽당 참고 링크 | **1개** (모든 풀 공통) | `default-topics.ts:70-81, 122-134, ...` |
| 이미지 포함률 | HOT_NEWS_POOL[0] 1건만 포함 / 총 20토픽 중 1장 | `default-topics.ts:30-40` 이외 `images` 필드 없음 |
| 별점 스펙 존재 | 있음 | `teatime-data.ts:40` — `rating: number` |
| 바이링구얼 | 완비 | `teatime-data.ts:1-11, 101-131` |
| 인터셉트 기능 | 메시지별 "끼어들기" 버튼 | `TeatimeView.tsx:104-112` |
| 과거 Vol 데이터 | Vol.4·Vol.5는 파일에 남아있으나 **노출 안 됨** | `teatime-data.ts:171, 233` 선언 후 `ALL_TEATIMES`에서 제외 |

### B. MD(Vol.10/11) vs 서비스 Gap 매핑

| 축 | MD 실측 | 서비스 실측 | Gap |
|---|---|---|---|
| 카테고리 체계 | 5개 고정 (핫/에이전트/논문/로봇/보너스) | 3개 (핫/랜덤/소곤) | **상이 — 통합 필요** |
| 토픽당 메시지 수 | 4~5개 | 3개 | 약 -40% |
| 메시지당 길이 | 2~4문장, 구체 수치·기업명 | 1문장, 추상 요약 | -60% 밀도 |
| 참고 링크/토픽 | 5~6개 | 1개 | **-80%** |
| 링크 구조 | `[title](url) \| source \| date \| ★★★★★` | `title/url/source/date/rating` 필드 있음, 실제는 1건만 | 스키마는 OK, 데이터만 부족 |
| 이미지 | 토픽 2~3개에 상단 배치, 캡션·출처 포함 | 20토픽 중 1장만 | -95% |
| SNS/커뮤니티 참조 | Reddit/X/YouTube/HN 자연 인용 | `소곤소곤` 풀에만 집중 | MD는 분산 인용, 서비스는 분리 섹션 |
| (발생일·보도일) 병기 | "(발생 4/7 · 보도 4/14)" 형식 | 없음 | 스키마에 없음 |
| 인트로/아웃트로 | 상황극 + 캐릭터 마무리 멘트 | `intro`만 있음, 아웃트로 없음 | 부분 gap |
| 요약 테이블 | 있음 | 없음 | gap |

### C. 근본 원인 (Root Cause)

1. **데이터 모델은 문제가 아니다.** `RawReference`(title, url, source, date, rating), `RawTopicImage`(src, alt, source), `RawMessage`, `RawTopic`, `RawTeaTime` 스키마는 MD 요구사항을 모두 담아낸다 (`teatime-data.ts:22-59`). Vol.5(`teatime-data.ts:233-827`)가 이미 그걸 증명한다 — 토픽당 4~6 메시지, 4~5 참고, 이미지 포함, 바이링구얼.
2. **진짜 문제는 `default-topics.ts`의 "seed" 풀 데이터가 얕게 작성된 것.** 파일 주석 `TODO: Expand each pool to 10 items. Currently seeded with 5/10/5 sample items.` (`default-topics.ts:13`)가 이미 미완성임을 자인한다.
3. **MD → 서비스 파이프라인 부재.** `scripts/teatime-skeleton.py`는 MD 템플릿 생성·검증 전담이지 TS 데이터 변환은 하지 않는다. 매일 MD 한 편씩 쌓이는데 서비스에는 한 번도 반영되지 않는다.
4. **카테고리 피벗 히스토리.** `teatime-data.ts:829-837` 주석에 2026-04-12 대표님 지시로 3토픽 체계 도입이 기록됨. MD 5개 고정 룰(`.claude/rules/teatime.md:14-20`)과 충돌. 두 체계는 **서로 다른 서비스 경로**를 타야 한다.

## Root Cause

서비스 티타임 품질이 MD 대비 낮은 원인은 데이터 모델 한계가 아니라, **(1) MD를 서비스 데이터로 자동 변환하는 파이프라인이 존재하지 않는다**는 것, 그리고 **(2) 수동 seed 풀(`default-topics.ts`)이 MVP seed 수준에 멈춰 있다**는 것이다. MD는 매일 규칙적으로 생성·검증되는데, 서비스는 그 결과물을 소비하지 않고 별개의 얇은 풀을 그대로 노출한다.

## Recommendations

### 단계별 로드맵 (4단계)

**0단계 — 데이터 모델 minor 확장 (1일, 저위험)**
- `RawReference`에 `occurredDate?: string` 추가 (보도일과 분리). 기존 `date`는 보도일로 해석.
- `RawTopic`에 `summary?: LocalizedText`(티타임 요약 테이블용), `closingLines?: RawMessage[]`(아웃트로) 추가.
- `RawTeaTime`에 `vol?: number`, `weekday?: string`, `nextDate?: string` 추가.
- **기존 Vol.4/Vol.5/DEFAULT 호환** — 모두 optional이므로 타입 빌드 깨지지 않음.

**1단계 — MD→TS 변환기 작성 (2~3일, 중위험)**
- 위치: `scripts/teatime_md_to_service.py` (snake_case, 기존 파이썬 컨벤션 일치).
- 입력: `output/teatime/YYYY-MM-DD_*.md`. 출력: `intercept/src/lib/teatime-archive/YYYY-MM-DD.ts` (새 디렉토리).
- 파싱 규칙:
  - `## N. [카테고리] — "부제"` → Topic(id, category, subtitle, title)
  - `![alt](url)` → TopicImage (alt를 ko, 추론으로 en)
  - `**캐릭터**: 내용` → Message (한→영 번역은 1단계에선 ko-only, 2단계에 Gemini 번역 파이프 연결)
  - `> - [title](url) | 매체 | 날짜 | ★★★★★` → Reference (별점 개수를 rating으로)
  - `(발생 X · 보도 Y)` → Message 메타데이터 또는 Reference.occurredDate
- 검증: 변환 후 `teatime-skeleton.py --validate` 재실행 + 변환 결과를 `Vitest`로 shape 테스트.
- Vol.10·Vol.11을 시범 변환 → `TEATIME_VOL10`, `TEATIME_VOL11` 추가, `ALL_TEATIMES`에 등록.

**2단계 — 서비스 UI 확장 (2일, 중위험)**
- `TeatimeView.tsx` 변경점:
  - 이미지가 여러 장일 때 mosaic 레이아웃 이미 존재 (`TeatimeView.tsx:160`). 그대로 활용.
  - `ReferenceList`에 발생일 표시 추가 (있으면): `reference.occurredDate` → "발생 X · 보도 Y"
  - 새 섹션: 티타임 요약 테이블 (`topic.summary` 수집 → 테이블 렌더)
  - 아웃트로 (`closingLines`) — 푸터 위에 렌더
  - 카테고리 체계 병존: `teatime.variant: 'default' | 'daily-md'` 필드를 `RawTeaTime`에 추가. 기본은 3토픽 변형, md-daily는 5토픽 변형.
- 라우팅: `/teatime` 기본 = `DEFAULT_TEATIME`(3토픽 피벗 준수). `/teatime/archive/[date]` 신설 = MD 변환 결과(5토픽).
- 과거 Vol 접근은 `ALL_TEATIMES` 전체 렌더 대신 아카이브 전용 뷰에서.

**3단계 — 매일 자동 동기화 (1주, 중위험)**
- GitHub Actions cron (매일 07:00 KST): `scripts/teatime_md_to_service.py --today` 실행 → `intercept/src/lib/teatime-archive/` 업데이트 → PR 자동 생성.
- 또는 build-time 통합: `npm run build`가 `scripts/teatime_md_to_service.py --all`을 prebuild로 호출.
- **런타임 DB 접근은 안 함** — Cloudflare Workers quota 이슈(2026-04-14 기록 참조)와 Local-first 원칙에 어긋남.

### 우선순위

1. **[HIGH · 2일] Vol.10·Vol.11 수동 포팅 (`TEATIME_VOL10/11`을 손으로 `teatime-data.ts`에 추가)** — 변환기 없이도 MD의 풍성함이 서비스에 즉시 반영됨. 효과 가장 큼.
2. **[HIGH · 3일] 1단계 변환기 작성** — 수동 포팅을 자동화해 미래 티타임에 적용.
3. **[MEDIUM · 2일] 2단계 UI 확장** — 요약 테이블, 아웃트로, 발생일 병기.
4. **[LOW · 1주] 3단계 자동화** — 매일 자동 동기화.
5. **[OPTIONAL] 0단계 데이터 모델 확장** — 1단계와 함께 진행해도 되고, 1단계에서 필드 부족 판단되면 그때 추가해도 됨.

## Trade-offs

| 옵션 | Pros | Cons |
|---|---|---|
| **A. 수동 포팅 먼저** | 2일 내 품질 개선 가시화, 변환기 사양 정의 근거 확보 | 단발성, 매일 반복해야 함 |
| **B. 변환기 우선** | 지속 가능, 모든 MD 재사용 | 파싱 엣지케이스 디버깅 2~3일 소모. 결과 검증 부담 |
| **C. 3토픽 유지 + 풀만 10개로 확장** | 대표님 4-12 피벗 지시 준수, MD는 Tistory 전용 분리 | MD의 depth/링크 풍성함을 놓침. Track 3 목표 미달 |
| **D. 3토픽·5토픽 병존 (권장)** | 두 세계관 모두 유지. 기본은 가벼운 3토픽 피드, 깊이 원하면 archive | UI 라우팅 복잡도 증가, 두 체계 유지 비용 |
| **E. 런타임 MD 파싱** | 자동 최신화 | Workers CPU quota 소모, Local-first 원칙 위반 |
| **F. 빌드타임 MD 파싱 (권장)** | quota 안전, 재현 가능 | 배포 주기 의존 (cron PR로 완화) |

## 대표님 결정 필요 포인트

1. **카테고리 체계 전략** — 옵션 C(3토픽 유지) / D(병존, 권장) / MD 5토픽으로 통일 중 선택. 2026-04-12 피벗 지시의 유효 범위 재확인 필요.
2. **바이링구얼 생성 책임** — MD는 한국어 전용, 서비스는 ko+en 필수. 변환기에서 영어 번역을 (a) Gemini 2.5-flash로 자동 생성 / (b) ko-only 노출 / (c) 수동 번역 큐. 크레딧·KSD(Known Source Date) 리스크 있음.
3. **아카이브 노출 범위** — 매일 MD를 `/teatime/archive/[date]`로 전체 공개할지, 유료 Pro 플랜 한정으로 할지 (Pricing 표 "Save+Export" Pro 기능과 연계).
4. **수동 포팅 우선 여부** — 변환기(1단계) 전에 Vol.10/11만 수동 포팅할지, 변환기 완성 후 일괄 변환할지.
5. **이미지 수급** — MD의 `webp/jpg` 외부 URL을 그대로 쓸지, Cloudflare Images로 자체 호스팅할지 (외부 URL은 링크 rot 위험).
6. **SNS/커뮤니티 인용 배치** — MD처럼 카테고리별로 분산 인용할지, 서비스 "소곤소곤" 토픽에만 모을지.

## Referenced Files

- `intercept/src/lib/teatime-data.ts` — 데이터 타입 스키마 및 현재 노출 엔트리 정의
- `intercept/src/lib/default-topics.ts` — 3토픽 seed 풀 (TODO: expand to 10 주석 포함)
- `intercept/src/components/views/TeatimeView.tsx` — 현재 렌더링 구조
- `intercept/src/app/teatime/page.tsx` — 라우트 진입점
- `output/teatime/2026-04-20_AI동향_티타임.md` — MD 품질 기준 (Vol.10)
- `output/teatime/2026-04-21_AI동향_티타임.md` — MD 품질 기준 (Vol.11)
- `.claude/rules/teatime.md` — MD 발행 규칙 (5카테고리, 링크 12+, 이미지 2+)
- `scripts/teatime-skeleton.py` — MD 스켈레톤 생성·검증기 (변환기 X)
