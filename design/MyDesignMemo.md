# 디자인 메모

## 레퍼런스 도구

- https://aistudio.google.com/apps — AI Studio 빌드탭
- https://mobbin.com/ — UI 이미지 레퍼런스
- https://app.spline.design/discover — 3D 소스

✅ [**Curated Design**](https://curated.design/) – 고품질 예시와 함께 미니멀리스트 UI 영감 ✅ [**Saaspo**](https://saaspo.com/) – SaaS 대시보드 및 B2B 제품에 딱 맞아요 ✅ [**Website Vice**](https://websitevice.com/) – AI, SaaS 및 27개 이상의 디자인 카테고리를 위한 최고의 리소스 ✅ [**Godly Website**](https://godly.website/) – 대담하고 시각적으로 멋진 웹 디자인을 보여줍니다 ✅ [**Mobbin**](https://mobbin.com/) – 최고의 앱에서 실제 모바일 UI 패턴 ✅ [**Cosmos**](https://cosmos.so/) – 깔끔하고 현대적이며 미니멀리스트 UI 영감 ✅ [**Bento Grids**](https://bentogrids.com/) – 구조화된 그리드 기반 UI 디자인 영감 ✅ [**Rebrand Gallery**](https://rebrand.gallery/) – 브랜드 리디자인 및 변환 쇼케이스 ✅ [**Seesaw Website**](https://seesaw.website/) – 우아하고 미니멀리스트 UI 디자인 ✅ [**Lapa Ninja**](https://lapa.ninja/) – 전환에 초점을 맞춘 랜딩 페이지 모음 ✅ [**One Page Love**](https://onepagelove.com/) – 최고의 단일 페이지 웹사이트 디자인 ✅ [**SiteInspire**](https://siteinspire.com/) – 우아하고 세련된 웹 디자인 영감 ✅ [**Httpster**](https://httpster.net/) – 기발하고 독특한 웹 디자인 예시 ✅ [**Minimal Gallery**](https://minimal.gallery/) – 깔끔하고 미니멀리스트 UI 디자인 ✅ [**CSS Design Awards**](https://cssdesignawards.com/) – 수상 경력에 빛나는 최첨단 UI 디자인 ✅ [**Collect UI**](https://collectui.com/) – UI 구성 요소 및 패턴 라이브러리 ✅ [**Brutalist Websites**](https://brutalistwebsites.com/) – 대담하고 독특하며 날것의 웹 디자인 ✅ [**Muzli**](https://muz.li/) – 실시간 디자인 영감 및 UI 트렌드 ✅ [**UI Movement**](https://uimovement.com/) – 인터랙티브하고 애니메이션된 UI 디자인 모음 ✅ [**Awwwards**](https://awwwards.com/) – 전 세계 최고의 웹 디자인 쇼케이스 ✅ [**Call to Inspiration**](https://calltoinspiration.com/) – 전환율이 높은 마케팅 및 랜딩 페이지 ✅ [**Prettyfolio**](https://prettyfolio.com/) – 멋진 포트폴리오 디자인 허브 ✅ [**UI8**](https://ui8.net/) – 디자이너를 위한 프리미엄 UI 키트 및 템플릿 ✅ [**Pafolios**](https://pafolios.com/) – 크리에이티브를 위한 포트폴리오 디자인 영감 ✅ [**Handheld Design**](https://handheld.design/) – 모바일 앱 및 반응형 UI 영감

## 디자인 실험 1: 캐릭터 인터랙션 (구현 완료)

- [X] 캐릭터들이 마우스 따라 모여서 속닥거리는 효과
- [X] 클릭하면 속닥속닥, 커피 마시기 등 액션 전환
- [X] 마우스 움직이면 포인터 위치를 따라가기 (걷는 애니메이션)
- [X] 사용자가 끼어들기 타이핑 시 근처에서 듣는척하기
- [X] 캐릭터 드래그 → 해당 위치에 고정 (pin), 다시 클릭하면 합류 (2026-04-08)
- [X] 캐릭터 3명 모두 마우스 오른쪽에 세로 정렬 — 클릭 영역 방해 방지 (2026-04-08)
- [ ] 캐릭터 배치를 삼각형 형태로 변경 (둘러앉은 느낌) — 상하 일렬 배치에서 개선 필요 (2026-04-08)
- [ ] 말풍선 방향을 캐릭터 위치에 따라 자동 조정 (겹침 방지) (2026-04-08)

## 디자인 실험 2: Pretext 텍스트 레이아웃 (부분 적용)

레퍼런스:

- https://chenglou.me/pretext/dynamic-layout/
- https://illustrated-manuscript.vercel.app/ — 마우스 따라 용이 움직이면 글자가 이동
- https://chenglou.me/pretext/markdown-chat/ — 마크다운 채팅 레이아웃

적용 상태: PretextMessage 컴포넌트로 대화 텍스트에 동적 레이아웃 적용 중.
향후: 답변 생성 중 글자 위에서 캐릭터가 춤/속닥거리는 효과 추가 가능.

## 디자인 실험 3: Spline 3D 입체 캐릭터 (준비만 완료)

- https://app.spline.design/ui/f58cebd7-7c3b-4f95-b608-24d925db94ce
- `SplineCharacter.tsx` 컴포넌트 구현 완료 (@splinetool/react-spline)
- 현재 **미사용** — SVG 픽셀아트 아바타 사용 중
- 향후: 캐릭터 프로필 페이지나 인트로에서 3D 입체 캐릭터 활용 가능

## 끼어들기 UI 변경 이력 (2026-04-08)

### Before

- 사이드바(오른쪽 슬라이드 패널) + Portal 방식
- 데스크탑: 고정 사이드바 340px
- 모바일: 하단 시트 오버레이
- 문제: 본문과 분리되어 "끼어드는" 느낌이 약함

### After

- **인라인 방식** — 해당 메시지 바로 아래에 입력창+대화 표시
- Portal/backdrop 제거, 본문 흐름 안에 자연스럽게 배치
- 글 아래에 직접 끼어들기 때문에 "끼어드는" 느낌 강화
- 모바일에서도 동일 인라인 레이아웃 (마진 조정)

## 기능 요구사항 (구현 대기)

### 1. 인증/로그인

- 소셜 로그인 (Google, Kakao 등)
- 비로그인 사용자는 끼어들기 제한

### 2. 과금 정책

- **1회성 상품**: 끼어들기 10회 / $1
- **구독제**: 월정액으로 무제한 끼어들기
- 비로그인 사용자에게 체험 끼어들기 1~2회 제공 후 로그인 유도

### 3. 소셜 기능

- 다른 사용자의 끼어들기 내용 보기
- 끼어들기에 좋아요/공감 반응
- 인기 끼어들기 하이라이트

> 위 기능은 디자인 작업 완료 후 별도 기획 단계에서 상세 설계 예정

## 하지 말아야 할 것들 (Anti-patterns)

- **캐릭터 상하 일렬 배치 금지** — 말풍선이 겹쳐서 캐릭터가 안 보임. 삼각형/둥글게 배치할 것
- **말풍선 방향은 캐릭터 위치 기준** — 오른쪽에 있으면 오른쪽으로, 왼쪽이면 왼쪽으로. 캐릭터 얼굴이 가려지면 안 됨
- **답변 대기 애니메이션은 반드시 끼어들기 입력 근처에서** — 화면 상단으로 가면 시선이 분산됨
- **flipX 적용 시 아바타만 뒤집기** — 말풍선/텍스트까지 뒤집으면 글자가 반전됨
- **Pretext 영역과 입력창 겹침 금지** — 캐릭터가 OVERLAP_MARGIN(80px) 안에 있으면 글쓰기 불가
