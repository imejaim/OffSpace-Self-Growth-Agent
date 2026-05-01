# 티타임 발행 모드 — 정기발행 vs 인터셉트 발행

## 개요

티타임 콘텐츠는 두 가지 트리거 방식으로 발행된다. 두 방식 모두 동일한 검증 파이프라인을 통과하며, `output/teatime/YYYY-MM-DD_*.md`가 소스 오브 트루스다.

---

## 정기발행 (Scheduled Publish)

| 항목 | 내용 |
|------|------|
| 트리거 | GitHub Actions cron (Phase 3 구현 예정) |
| 시작 시각 | KST 06:30 콘텐츠 생성 시작 → 07:00 노출 목표 |
| 빈도 | 매일 1회 (영업일 기준) |
| 검증 | 3-Step Publish Gate 통과 시에만 자동 머지 → CF Pages 배포 |
| 실패 시 | 텔레그램 알림 + 전날 글 유지 (fallback) |
| 현황 | Phase 2 수동 → Phase 3에서 자동화 예정 |

---

## 인터셉트 발행 (Intercept Publish)

| 항목 | 내용 |
|------|------|
| 트리거 | 대표님 수동 명령 |
| 빈도 | 비정기 — 긴급 뉴스, 실험 콘텐츠, 보강 발행 시 |
| 절차 | 정기발행과 동일한 파이프라인 (validate + md-to-archive) |
| 명령 | `npm run teatime:intercept -- YYYY-MM-DD` |

---

## 공통 규칙

- **Source of truth**: `output/teatime/YYYY-MM-DD_*.md`
- **룰북**: `.claude/rules/teatime.md`
- **3-Step Publish Gate** 필수:
  1. `teatime-skeleton.py --validate` — 구조/카테고리/링크/이미지 검증
  2. `teatime-fetch-images.py` — 외부 이미지 로컬화 (정기발행 시)
  3. `teatime-md-to-archive.py` — TS 변환 + intercept/public 이미지 복사
- **검증 기준**: 5카테고리, 이미지 2+장, 출처 링크 12+개

---

## 명령 치트시트

```bash
# 인터셉트 발행 (날짜로 자동 탐색)
cd intercept
npm run teatime:intercept -- 2026-05-01

# 또는 파일명 직접 지정
npm run teatime:intercept -- 2026-05-01_AI동향_티타임.md

# --register 플래그: teatime-data.ts ALL_TEATIMES에 자동 prepend
npm run teatime:intercept -- 2026-05-01 --register

# 검증만 (저장 없이)
npm run teatime:validate -- output/teatime/2026-05-01_AI동향_티타임.md

# TS 변환만 (미리보기)
npm run teatime:archive -- output/teatime/2026-05-01_AI동향_티타임.md --dry-run

# 이미지 로컬화만
npm run teatime:fetch-images -- output/teatime/2026-05-01_AI동향_티타임.md
```

---

## 파이프라인 산출물

| 단계 | 입력 | 산출물 |
|------|------|--------|
| validate | `output/teatime/YYYY-MM-DD_*.md` | 검증 리포트 (stdout) |
| fetch-images | MD 파일 | `output/teatime/images/YYYY-MM-DD/*.{jpg,png}` |
| md-to-archive | MD 파일 + 로컬 이미지 | `intercept/src/lib/teatime-archive/YYYY-MM-DD.ts` |
| md-to-archive | 로컬 이미지 | `intercept/public/teatime-images/YYYY-MM-DD/*` (복사) |

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `scripts/teatime-skeleton.py` | 스켈레톤 생성 + 구조 검증 |
| `scripts/teatime-fetch-images.py` | 외부 이미지 로컬화 |
| `scripts/teatime-md-to-archive.py` | MD → TS 변환 (본 문서 핵심) |
| `scripts/teatime-intercept-publish.py` | 인터셉트 발행 통합 헬퍼 |
| `intercept/src/lib/teatime-archive/` | 생성된 TS archive 저장 위치 |
| `intercept/src/lib/teatime-data.ts` | RawTeaTime 타입 정의 + ALL_TEATIMES |
| `.claude/rules/teatime.md` | 발행 룰북 (path-scoped) |
