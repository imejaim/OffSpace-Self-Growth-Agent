# Teatime Tistory 발행 경로 조사 및 계획

**작성일**: 2026-04-21
**상태**: 조사 완료 / 대표님 결정 대기
**담당**: Track 2 (발행 채널)

---

## 1. 핵심 결론

**Tistory Open API는 2024년 2월 완전 종료됐다.** 신규 앱 등록 불가, 기존 앱도 모든 기능이 차단된 상태다. 공식 서비스 페이지(`tistory.github.io/document-tistory-apis`)는 종료 안내만 남아 있다.

따라서 "API를 통한 완전 자동 발행"은 더 이상 합법적으로 불가능하다. 대안은 두 가지다:

- **1안 (권장)**: Playwright 브라우저 자동화 — Tistory 로그인 후 에디터에 직접 붙여넣기 자동화
- **2안 (대안)**: velog 또는 GitHub Pages로 채널 변경 — 공식 API 또는 파일 기반 발행 가능

---

## 2. Tistory Open API 가용성 (2026-04-21 기준)

| 항목 | 상태 |
|------|------|
| 신규 앱 등록 | 불가 (2023년 하반기부터 중단) |
| 기존 앱 OAuth 토큰 발급 | 불가 |
| 글 작성 API (`POST /apis/post/write`) | 종료 (2024-02 완료) |
| 이미지 업로드 API | 종료 (2024-01 최초 종료) |
| 카테고리 조회 API | 종료 |
| 공식 문서 상태 | 종료 안내 페이지만 유지 |

**참고**: WooilJeong/tistory PyPI 패키지(브라우저 자동화 기반)는 존재하나, Tistory 공식 Open API 의존이 아닌 selenium 기반으로 추정. API 종료 이후 유지보수 상태 불분명.

---

## 3. 추천 경로

### 1안 (권장): Playwright 반자동 발행

**개요**: MD 파일을 HTML로 변환 → Playwright로 Tistory 에디터에 자동 입력 → 대표님이 미리보기 확인 후 발행 버튼 클릭

**흐름**:
```
output/teatime/YYYY-MM-DD_*.md
  → (pandoc or markdown-it) → HTML
  → (이미지 URL 치환: 상대경로 → Tistory CDN URL)
  → Playwright: tistory.com 로그인 → 새 글 → HTML 붙여넣기 → 임시저장
  → [대표님 확인 게이트]
  → 대표님: 발행 클릭
```

**장점**:
- Tistory 계정 그대로 유지
- 기존 독자/SEO 히스토리 보존
- 자동화율 높음 (90% 자동, 10% 수동 확인)

**단점**:
- Tistory UI 변경 시 스크립트 깨짐 (유지보수 필요)
- 이미지를 Tistory에 먼저 업로드해야 URL 확보 가능 (첫 발행 시 이미지 수동 업로드 후 URL 치환 필요 — 또는 외부 CDN 사용)
- Playwright 환경 설정 필요 (Node.js 또는 Python)

**구현 단계** (상세):

| 단계 | 내용 | 비고 |
|------|------|------|
| 0. 계정 확인 | Tistory 계정 존재 여부 + 블로그 URL 확인 | 대표님 직접 확인 |
| 1. 변환기 | `pandoc` 또는 `python-markdown` 으로 MD → HTML | 캐릭터 대화 블록 인라인 style 처리 필요 |
| 2. 이미지 처리 | 상대경로 이미지 → 외부 URL로 치환 | Cloudflare R2 또는 직접 Tistory 업로드 후 URL 회수 |
| 3. 스크립트 작성 | Playwright Python: 로그인 → 글쓰기 → HTML 삽입 → 임시저장 | `playwright install chromium` |
| 4. 카테고리 설정 | 글 저장 후 카테고리·태그·공개 설정 | UI 셀렉터 매핑 |
| 5. 승인 게이트 | 임시저장 후 대표님 알림 → 확인 후 발행 | 터미널 pause 또는 Telegram 알림 |
| 6. 발행 URL 기록 | 발행 완료 후 URL을 `output/teatime/published.log` 에 기록 | |

**예상 작업량**: 3~5인시 (스크립트 작성 + 이미지 파이프라인 + 테스트)

---

### 2안 (대안): velog 채널 변경

**개요**: Tistory 대신 velog를 공식 발행 채널로 사용. velog는 MD 에디터 네이티브 지원, 개발자 커뮤니티 도달력이 높음.

**흐름**:
```
output/teatime/YYYY-MM-DD_*.md
  → velog 에디터에 MD 직접 붙여넣기 (또는 velog GraphQL API 비공식 사용)
  → 발행
```

**장점**:
- MD 그대로 붙여넣기 가능 (변환 불필요)
- 개발자·AI 관심사 독자층과 적합
- 플랫폼 유지보수 리스크 없음

**단점**:
- 공식 퍼블릭 API 없음 (비공식 GraphQL 엔드포인트만 존재, 언제든 차단 가능)
- 대표님이 이미 Tistory에 히스토리/독자가 있다면 채널 전환 비용 발생
- 캐릭터 박스(코부장/오과장/젬대리 색상 구분 UI)를 velog에서 재현하려면 HTML raw 블록 필요

**적합한 상황**: Tistory 히스토리가 없거나 새 채널로 분리 발행을 원하는 경우

---

## 4. 변환 파이프라인 상세

### MD → HTML 변환

```
입력: output/teatime/YYYY-MM-DD_AI동향_티타임.md
도구: pandoc 또는 python markdown-it
출력: 임시 HTML (인라인 style 포함)
```

**캐릭터 대화 블록 처리**:
- 현재 MD 포맷: `**코부장**: 텍스트`
- Tistory HTML로: `<p><strong style="color:#E8631A">코부장</strong>: 텍스트</p>`
- 처리 방식: pandoc Lua filter 또는 Python 후처리 정규식

**이미지 경로 처리**:
- 현재: `![설명](https://...)`  — 이미 외부 URL 사용 중 (Vol.10 확인)
- Tistory 발행 시: 외부 URL 그대로 삽입 가능 (별도 업로드 불필요할 가능성 높음)
- 단, Tistory가 외부 이미지를 리사이즈/캐시하지 않으면 로딩 지연 발생 가능

**출처 링크 블록**:
- 현재: `> 📎 **이번 토픽 참고 링크**` 형식
- HTML 변환 시: `<blockquote>` 또는 커스텀 `<div>` 로 처리

### SEO 메타

| 필드 | 값 |
|------|-----|
| 제목 | `Offspace 티타임 Vol.N — YYYY년 MM월 DD일` |
| 태그 | `AI동향, 티타임, 코부장, 오과장, 젬대리, Intercept` + 헤드라인 키워드 |
| 카테고리 | Tistory 카테고리 ID (초기 1회 수동 조회) |
| 공개 설정 | 발행 시 "공개" |

---

## 5. 운영 모델 (매일 아침 발행 흐름)

```
[D-1 저녁] teatime MD 초안 완성 + validate 통과
    ↓
[D-1 밤 또는 D-0 아침] 발행 스크립트 실행
    → pandoc 변환
    → 이미지 URL 검증
    → Playwright: Tistory 임시저장
    ↓
[대표님 확인 게이트] 알림 수신 → 미리보기 확인 → 발행 버튼 클릭
    ↓
[발행 완료] URL 자동 기록 → (선택) SNS 공유
```

**실패 fallback (수동 복붙 가이드)**:
1. `output/teatime/YYYY-MM-DD_AI동향_티타임.md` 열기
2. Tistory 에디터 → HTML 모드로 전환
3. pandoc 변환 HTML 전체 복붙
4. 이미지 URL 직접 확인 후 발행

---

## 6. 리스크 및 불확실성

| 리스크 | 수준 | 비고 |
|--------|------|------|
| Tistory UI 변경으로 Playwright 스크립트 깨짐 | 중간 | 월 1회 점검 필요 |
| 외부 이미지 URL 만료 (뉴스 사이트 삭제) | 중간 | Cloudflare R2에 미러링 검토 |
| 캐릭터 색상 UI가 Tistory 에디터에서 깨짐 | 낮음-중간 | 테스트 선행 필요 |
| velog 비공식 API 차단 (2안 선택 시) | 높음 | 2안의 핵심 리스크 |
| 대표님 Tistory 계정 없거나 블로그 미개설 | 확인 필요 | 발행 전 선행 조건 |

---

## 7. 대표님 결정 필요 포인트

1. **Tistory 계정 존재 여부**: Tistory 계정이 있는지, 블로그 URL이 있는지 확인 필요. 없다면 2안(velog) 또는 신규 개설 중 선택.

2. **발행 채널 결정**: Tistory 유지 (1안) vs. velog 전환 (2안) vs. 두 채널 동시 발행

3. **승인 게이트 방식**: 완전 자동 발행(임시저장 후 자동 발행) vs. 반자동(임시저장 후 대표님 확인). 권장은 반자동(확인 게이트 있음).

4. **이미지 전략**: 외부 URL 그대로 사용 vs. Cloudflare R2에 미러링 후 영구 URL 사용

5. **발행 타이밍**: 매일 아침 몇 시 발행? (스케줄러 설정에 필요)

---

## 8. 예상 작업량 요약

| 작업 | 인시 |
|------|------|
| 0. Tistory 계정 확인 + 블로그 개설(필요 시) | 0.5h (대표님 직접) |
| 1. pandoc MD→HTML 변환기 + 캐릭터 후처리 | 2h |
| 2. Playwright 자동화 스크립트 (로그인→임시저장) | 2h |
| 3. 이미지 URL 검증 로직 | 0.5h |
| 4. 발행 URL 기록 + 알림 연동 (선택) | 1h |
| 5. 테스트 발행 + 수정 | 1h |
| **합계** | **7h (executor 1명 기준)** |

---

## 참고 링크

- [Tistory Open API 서비스 종료 안내](https://tistory.github.io/document-tistory-apis/) — 공식 종료 페이지
- [티스토리, Open API 종료 공지 (클리앙)](https://www.clien.net/service/board/news/18490186) — 커뮤니티 반응
- [WooilJeong/tistory — Python 브라우저 자동화 라이브러리](https://github.com/WooilJeong/tistory)
- [Pandoc 공식 문서](https://pandoc.org/MANUAL.html)
- [velog GitHub](https://github.com/velog-io/velog)
