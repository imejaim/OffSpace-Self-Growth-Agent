# 세션 리포트 — 2026-04-07 (월)

## 완료 작업

### 1. 캐릭터 인터랙션 강화 (FloatingCharacters.tsx)

**기능 업그레이드:**
- 랜덤 바운싱 애니메이션 → **마우스 커서 추적** 방식으로 변경
- 클릭 시 액션 순환 (3가지 상태):
  - 속닥속닥 (whispering) — 말풍선 점 애니메이션
  - 커피 (coffee break) — 커피잔 들기
  - 신남 (excited) — 손들기
- 캐릭터별 맞춤 대사 (코부장/오과장/젬대리)
- **이동 방향 좌우 반전** — 인간미 있는 움직임
- **bob 애니메이션** — 상하 미세 진동으로 생동감 추가
- **가까이 있으면 자동 whispering** — 120~180px 거리에서 속닥거림 자동 활성화
- 끼어들기 인풋 포커스 시 캐릭터가 입력란 왼쪽에 모여 듣는 자세

**UX 개선:**
- 마우스 위에 직접 오면 클릭 방해 → 마우스로부터 120~180px 옆 위치 유지
- 부드러운 ease-out 이동 (responsiveness 개선)
- 모바일: 터치 기반 포지션 추적 (마우스 없이도 동작)

**기술 상세:**
- `MouseEvent` 좌표 추적으로 실시간 위치 계산
- `requestAnimationFrame` 기반 고성능 애니메이션
- CSS `transform` + `transition`으로 GPU 가속

---

### 2. 티타임 Vol.5 발행 (2026-04-07 화요일)

**발행 파일:** `output/teatime/티타임_2026-04-07.md`

**고정 카테고리 (5개) 준수:**
1. **AI 핫뉴스** — OpenAI $122B 펀딩 수순/IPO 준비, Goldman Sachs 반도체 49% 급증
2. **AI 에이전트** — Anthropic Conway Always-On 에이전트, MCP (Modelcontextprotocol) 97M 다운로드 돌파
3. **AI 논문과 모델** — Gemma 4 Apache 2.0 오픈소스 릴리즈, Llama 4 혹평/철회, Intel Arc Pro B70 발표
4. **AI 로봇 / 피지컬 AI** — NVIDIA GR00T N1.7/N2 휴머노이드, 긱워커 로봇 훈련 데이터셋 공개
5. **보너스 / 그 외** — AI 딥페이크 선거 무기화 경고, 미국 15개 주 딥페이크 규제 법안

**출처/이미지 검증:**
- 총 **21개 출처** (필수 기준 12개+) ✅
- SNS 소스 **2개+** (Reddit, YouTube, X.com, HN) 포함 ✅
- 이미지 **3장** — 해당 뉴스 기사 실제 대표 이미지 사용 ✅
- (발생일 · 보도일) 병기 ✅

**캐릭터 채널 분담:**
- 젬대리: Reddit, YouTube, X.com → 커뮤니티 캐치
- 오과장: HackerNews, Crunchbase, 시장 보고서 → 팩트/숫자 보강
- 코부장: 공식 블로그, 논문, 기술 문서 → 기술 분석, 마무리

**검증 완료:**
```bash
python scripts/teatime-skeleton.py --validate output/teatime/티타임_2026-04-07.md
# 결과: PASS ✅
```

---

### 3. 홈페이지 업데이트 (intercept/src/app/page.tsx)

**변경 사항:**
- 현재 날짜를 2026-04-07로 업데이트
- 미리보기 대화 샘플을 Vol.5 콘텐츠로 변경
- 아바타 경로 통일: `Ko-bujang.svg`, `Oh-gwajang.svg`, `Jem-daeri.svg`

**렌더링 확인:**
- ✅ 캐릭터 이미지 로드 정상
- ✅ 반응형 레이아웃 유지
- ✅ MD 감성 스타일 일관성

---

### 4. Pretext 라이브러리 통합 완료

**설치:**
```bash
npm install @chenglou/pretext@0.0.4
```

**적용 범위:**
- `CharacterPositionContext` — 캐릭터 위치 전역 공유 상태
- `PretextMessage` 컴포넌트 — 캐릭터 근처 텍스트 자동 displacement 효과
- `teatime/page.tsx` — 대화 콘텐츠에 적용

**디버깅 완료:**
- ✅ `CharacterPositionContext` 값 검증 통과
- ✅ `position: absolute` / `relative` 계층 구조 정리
- ✅ React 19 호환성 확인
- ✅ **빌드 성공** (`npm run build`) — TypeScript 컴파일, 정적 생성 모두 통과
- ✅ 실제 pretext displacement 효과 동작 확인

**피드백 반영 — 캐릭터 위치 조정:**
- 캐릭터 이동 반경 및 입력란 근처 집결 포지션 재조정
- 모바일 터치 좌표 기준 위치 오프셋 튜닝

---

## 변경 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `intercept/src/components/FloatingCharacters.tsx` | 마우스 추적, 액션 순환, listening dots, whispering 기능 추가; 위치 피드백 반영 |
| `intercept/src/app/page.tsx` | 날짜 업데이트, Vol.5 미리보기, 아바타 경로 통일 |
| `intercept/src/app/teatime/page.tsx` | PretextMessage 컴포넌트 적용 완료 |
| `intercept/package.json` | @chenglou/pretext v0.0.4 추가 |
| `output/teatime/티타임_2026-04-07.md` | 신규 발행 (21개 출처, 3장 이미지) |

---

## 현재 프로젝트 상태

### 완료된 것
- ✅ 캐릭터 인터랙션 강화 (마우스 추적, 액션 순환)
- ✅ 티타임 Vol.5 발행 (카테고리/출처/이미지 검증 통과)
- ✅ 홈페이지 최신화
- ✅ Pretext 라이브러리 통합 및 디버깅 완료
- ✅ 캐릭터 위치 피드백 반영
- ✅ `npm run build` 성공

### 다음 우선 작업
- 🔲 Pretext markdown-chat: 끼어들기를 pretext 마크다운 챗으로 표현
- 🔲 Spline 3D 캐릭터: 탐색 단계
- 🔲 4/8 티타임 콘텐츠 생성
- 🔲 모바일 반응형 최종 점검

---

## 빌드 및 배포 상태

```bash
$ npm run build
✅ PASS — TypeScript 컴파일, 정적 생성 모두 성공

$ npm run dev
# http://localhost:3000 — 정상 동작
```

**배포:**
- PM2 설정: `intercept/ecosystem.config.cjs` (포트 4000)
- 상태: 준비 완료 (`pm2 start ecosystem.config.cjs` 가능)

---

## 대표님 결정 대기 중

1. **3D 캐릭터 도입 여부** — Spline vs 기존 픽셀아트 유지
2. **끼어들기 소셜 기능** — 공개/비공개, 베스트 끼어들기, 중첩 응답
3. **주제 확장** — 현재 AI 뉴스. 스포츠/연예/K-pop 추가 여부

---

*보고 작성: 코부장 (2026-04-07 심야)*
