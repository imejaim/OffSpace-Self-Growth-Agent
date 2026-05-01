# 티타임 자동발행 -- 외부 API 조사 (2026-05-01)

> 조사일: 2026-05-01
> 목적: Intercept 서비스 티타임 자동발행 기능 설계를 위한 외부 API 가격/기능 조사
> 조사자: document-specialist agent (Claude Sonnet 4.6)
> 기준: 2026년 5월 공식 문서 기준

---

## 1. Gemini 2.5 Flash / Pro

### 1-1. 토큰 가격표

| 항목 | Flash (Standard) | Flash (Batch/Flex) | Pro (<=200k ctx) | Pro (>200k ctx) | 출처 |
|---|---|---|---|---|---|
| 입력 토큰 (텍스트/이미지/영상) | $0.30 / 1M | $0.15 / 1M | $1.25 / 1M | $2.50 / 1M | https://ai.google.dev/gemini-api/docs/pricing |
| 출력 토큰 | $2.50 / 1M | $1.25 / 1M | $10.00 / 1M | $15.00 / 1M | 위 동일 |
| 입력 토큰 (오디오) | $1.00 / 1M | $0.50 / 1M | -- | -- | 위 동일 |
| 컨텍스트 캐싱 (입력) | $0.03 / 1M | -- | $0.125 / 1M | $0.25 / 1M | 위 동일 |
| 캐시 스토리지 | $1.00 / 1M tokens/hour | -- | $4.50 / 1M tokens/hour | -- | 위 동일 |

### 1-2. Google Search Grounding

| 항목 | Flash | Pro | 출처 |
|---|---|---|---|
| 무료 한도 | 1,500 RPD (requests per day) | 1,500 RPD | https://ai.google.dev/gemini-api/docs/pricing |
| 유료 단가 | $35 / 1,000 grounded prompts | $35 / 1,000 grounded prompts | 위 동일 |
| Google Maps Grounding | 1,500 RPD 무료, 이후 $25/1,000 | 10,000 RPD 무료, 이후 $25/1,000 | 위 동일 |

> 핵심 제약: Search Grounding 과 Structured Output(JSON mode)은 Gemini 2.5 Flash 에서 동시 사용 불가.
> Gemini 3.x 시리즈부터 병용 가능. 출처: https://ai.google.dev/gemini-api/docs/structured-output

### 1-3. 이미지 생성

| 모델 | 단가 | 비고 | 출처 |
|---|---|---|---|
| Imagen 3 (구버전) | $0.03 / 이미지 | 2026-06-30 deprecated | https://tokenmix.ai/blog/imagen-3-0-generate-002-deprecated-migration-guide-2026 |
| Imagen 4 Fast | $0.02 / 이미지 | 현재 최저가 Google 이미지 생성 옵션 | https://pricepertoken.com/image/model/google-imagen-3 |
| Gemini 2.5 Flash Image | $0.039 / 이미지 | 텍스트+이미지 멀티모달 | 위 동일 |
| Gemini 3 Pro Image (1K-2K) | $0.134 / 이미지 | 고품질, 고가 | https://blog.laozhang.ai/en/posts/gemini-3-pro-image-api-cost-per-image |
| Batch API 할인 | 50% 절감 | 모든 모델 적용 | 위 동일 |

> 참고: 티타임 "이미지 2장+" 요건은 뉴스 OG 이미지 크롤링으로 충족 권장. AI 이미지 생성은 비용 대비 효율 낮음.

### 1-4. 컨텍스트 윈도우 / 출력 토큰 제한

| 모델 | 입력 컨텍스트 | 최대 출력 | 출처 |
|---|---|---|---|
| Gemini 2.5 Flash | 1,048,576 tokens (~1M) | ~8,000 tokens | https://www.datastudios.org/post/google-gemini-context-window-token-limits-model-comparison-and-workflow-strategies-for-late-2025 |
| Gemini 2.5 Pro | 1,048,576 tokens (~1M) | 확인 필요 | 조사 중 |

### 1-5. URL Context 기능

| 항목 | 내용 | 출처 |
|---|---|---|
| 기능명 | URL Context Tool (GA 공개) | https://developers.googleblog.com/url-context-tool-for-gemini-api-now-generally-available/ |
| 지원 모델 | Gemini 2.5 Flash 포함 (공식 코드 예제 확인) | 위 동일 |
| 가격 | 추가 요금 없음 -- URL 추출 텍스트가 입력 토큰 표준 단가로 청구 | 위 동일 |
| 지원 형식 | 웹페이지, PDF, PNG/JPEG/BMP/WebP, JSON/XML/CSV, 텍스트 | 위 동일 |
| 활용 | Search Grounding으로 뉴스 발견 후 URL Context로 기사 전문 심층 분석 가능 | 위 동일 |

---

## 2. Cloudflare Workers AI

### 2-1. 과금 단위: Neurons

Cloudflare Workers AI는 Neurons 단위로 과금. 1,000 Neurons = $0.011.

| 구분 | 무료 한도 | 유료 단가 | 출처 |
|---|---|---|---|
| 일일 무료 | 10,000 Neurons/day (Free + Paid plan 공통) | -- | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| 유료 초과 | -- | $0.011 / 1,000 Neurons | 위 동일 |

### 2-2. 주요 모델 Neurons 단가

환산식: Neurons/M tokens x $0.011/1,000 = $/M tokens

| 모델 | 입력 Neurons/M | 출력 Neurons/M | 입력 $/M | 출력 $/M | 출처 |
|---|---|---|---|---|---|
| Gemma 4 26B (현재 사용 중) | 9,091 | 27,273 | $0.10 | $0.30 | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| Gemma 3 12B | 31,371 | 50,560 | $0.35 | $0.56 | 위 동일 |
| Llama 3.2 1B | 2,457 | 18,252 | $0.027 | $0.20 | 위 동일 |
| Llama 3.1 8B fp8-fast | 4,119 | 34,868 | $0.045 | $0.38 | 위 동일 |
| Llama 3.3 70B fp8-fast | 26,668 | 204,805 | $0.29 | $2.25 | 위 동일 |
| Mistral 7B | 10,000 | 17,300 | $0.11 | $0.19 | 위 동일 |

### 2-3. AutoRAG / AI Search / Browser Rendering

| 서비스 | 용도 | 가격 | 상태 | 출처 |
|---|---|---|---|---|
| AutoRAG | 자체 문서 기반 RAG | 베타 무료 (R2/Vectorize 별도) | 오픈 베타 | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| AutoRAG -- R2 | 스토리지 | 10GB 무료, 이후 $0.015/GB-month | -- | 위 동일 |
| AutoRAG -- Vectorize | 벡터 DB | 5M 벡터 무료, 이후 $0.01/M query dims | -- | 위 동일 |
| AI Search | 웹 크롤링 + 벡터 검색 | 베타 무료 (Workers AI/Gateway 별도) | 오픈 베타 2026-04-16~ | https://developers.cloudflare.com/ai-search/platform/limits-pricing/ |
| AI Search Free | -- | 20,000 쿼리/월, 파일 100,000개, 크롤 500 pages/일 | -- | 위 동일 |
| AI Search Paid | -- | 무제한 쿼리, 1M 파일, 무제한 크롤 | Workers Paid 필요 | 위 동일 |
| Browser Rendering | OG 이미지 크롤링 | Free: 10분/일, Paid: 10시간/월 무료 | GA (2025-08 유료화) | https://developers.cloudflare.com/changelog/post/2025-07-28-br-pricing/ |
| Browser Rendering 초과 | -- | $0.09 / browser hour | -- | 위 동일 |

> AutoRAG는 외부 뉴스 검색에 부적합 (자체 문서 전용).
> AI Search가 뉴스 크롤링에 가장 적합하나 현재 베타 단계.
> Browser Rendering은 OG 이미지 수집에 활용 가능.

---

## 3. 검색/이미지 대안 비교

### 3-1. 뉴스/검색 API

| 서비스 | 무료 한도 | 유료 단가 | 비고 | 출처 |
|---|---|---|---|---|
| Google Custom Search JSON API | 100 쿼리/일 | $5 / 1,000 쿼리 | 신규 고객 불가, 2027-01-01 종료 예정 | https://developers.google.com/custom-search/v1/overview |
| NewsAPI.org | 100 req/일 (localhost 전용) | $449/월~ | 무료 플랜 프로덕션 사용 불가 | https://newsapi.org/pricing |
| Tavily Search API | 1,000 크레딧/월 무료 (카드 불필요) | $0.008/크레딧 PAYG | Basic=1크레딧, Advanced=2크레딧/req | https://docs.tavily.com/documentation/api-credits |
| Tavily Researcher | -- | $30/월 (연 결제 $25) | -- | 위 동일 |
| Tavily Startup | -- | $100/월 (~15,000 크레딧) | $0.0067/크레딧 | 위 동일 |
| SerpAPI Developer | 없음 | $75/월 (5,000 쿼리) | $0.015/쿼리, 미사용분 만료 | https://serpapi.com/pricing |
| Cloudflare AI Search | 20,000 쿼리/월 (베타) | Workers Paid 기준 무제한 | 베타, 뉴스 크롤링 가능 | https://developers.cloudflare.com/ai-search/platform/limits-pricing/ |

### 3-2. 이미지 API

| 서비스 | 무료 한도 | 라이선스 | 비고 | 출처 |
|---|---|---|---|---|
| Unsplash API | 50 req/hr (데모), 1,000 req/hr (승인 후) | 상업 사용 가능, 귀속 표시 필수 | API 가이드라인 준수 필수 | https://unsplash.com/documentation |
| Pexels API | 200 req/hr, 20,000 req/월 | CC0, 상업 사용 가능 (단독 판매 제외) | 무료 (고한도 시 신청) | https://www.pexels.com/api/ |
| OG 메타태그 크롤링 (자체) | -- | 기사 원본 라이선스 적용 | teatime.md 룰에서 이미 사용 중 | 내부 규칙 |
| Browser Rendering OG 수집 | 10시간/월 무료 (Paid) | -- | $0.09/hr 초과 시 | https://developers.cloudflare.com/changelog/post/2025-07-28-br-pricing/ |


---

## 4. 권장 조합 + 1회 발행 비용 추정

### 4-1. 권장 아키텍처 (3토픽 자동발행)

    [Step 1] Tavily Basic Search x3 -- 3토픽 뉴스 헤드라인 수집 (각 1크레딧)
    [Step 2] Gemini 2.5 Flash + URL Context -- 기사 3~5개 전문 분석 + JSON 구조화 출력
    [Step 3] Browser Rendering -- OG 이미지 2장+ 로컬 저장
    [출력] 3토픽 x ~500자 캐릭터 대화체 + 12개+ 출처 링크 + 이미지 2장

핵심 제약 해결:
- Gemini 2.5 Flash: Search Grounding + JSON mode 동시 불가
- 권장: Tavily 검색 + URL Context -> JSON 구조화 출력 한 번에 처리
- 대안: Grounding 브리핑 생성 -> 2차 호출 JSON 변환 (API 호출 2배)

### 4-2. 1회 발행 토큰 추정

입력 토큰:
- 시스템 프롬프트 (캐릭터 설정 + 출력 스키마): ~2,000 tokens (캐싱 가능)
- Tavily 검색 결과 3건 (각 ~500 tokens): ~1,500 tokens
- URL Context 기사 3~5건 (각 ~1,000 tokens): ~4,000 tokens
- 합계 입력: ~7,500 tokens (시스템 프롬프트 캐싱 시 ~5,500 tokens)

출력 토큰:
- 3토픽 대화체 브리핑 (각 ~500자 x 3): ~4,500 tokens
- JSON 구조 오버헤드: ~500 tokens
- 합계 출력: ~5,000 tokens

Gemini 2.5 Flash 단가 기준:
- 입력: $0.30/M x 0.0075M = $0.00225
- 출력: $2.50/M x 0.005M = $0.01250
- Flash 토큰 합계: ~$0.015 / 회

### 4-3. 시나리오별 1회 발행 단가

| 시나리오 | Flash 토큰 비용 | 검색 API 비용 | 1회 합계 | 비고 |
|---|---|---|---|---|
| A. Flash + Search Grounding | $0.015 | $0.035 ($35/1,000 x 1회) | $0.050 | JSON mode 불가, 2단계 호출 필요 |
| B. Flash + Tavily Basic x3 (권장) | $0.015 | $0.024 (3크레딧 x $0.008) | $0.039 | JSON mode 가능, 구조화 출력 |
| C. Flash + Tavily 무료 한도 내 | $0.015 | $0 (월 1,000 크레딧 내) | $0.015 | 월 333회까지 무료 |
| D. CF Gemma 4 + Tavily | $0.002 | $0.024 | $0.026 | 품질 하락 가능성 있음 |

### 4-4. 월 규모별 비용 추정 (시나리오 B 기준 $0.039/회)

| 일 발행량 | 월 발행량 | 월 토큰+검색 비용 | 이미지 크롤 추가비 | 월 합계 추정 |
|---|---|---|---|---|
| 10회/일 | 300회/월 | $11.70 | ~$0 (무료 범위) | ~$12 |
| 100회/일 | 3,000회/월 | $117 | ~$0 (무료 범위) | ~$117 |
| 1,000회/일 | 30,000회/월 | $1,170 | ~$8 (Browser Rendering 초과) | ~$1,178 |

이미지 수집 추정 근거:
- 이미지 1장 OG 크롤 = 브라우저 약 5초
- Paid plan 월 10시간 무료 = 7,200장 = 일 약 240회 x 2장 커버
- 일 1,000회 초과분 약 92시간 x $0.09/hr = ~$8/월

---

## 5. 베이스 프롬프트 설계 가이드

### 5-1. 핵심 제약 사항 (2026-05 기준)

출처: https://ai.google.dev/gemini-api/docs/structured-output

- Gemini 2.5 Flash: Search Grounding + JSON Structured Output 동시 사용 불가
- Gemini 3.x 시리즈부터 병용 가능
- Search Grounding 사용 시 hallucination 약 40% 감소 (실측치)
- groundingMetadata.groundingChunks 로 각 문장과 출처 URL 1:1 연결 가능
- 반환 URL은 임시 리다이렉트일 수 있음 -- 저장 전 resolve 권장
- 출처: https://www.cennest.com/making-sense-of-the-gemini-2-5-flash-with-google-grounding-source-urls/

### 5-2. 권장 시스템 프롬프트 골격 (Tavily + URL Context + JSON mode)

    SYSTEM:
    You are a news briefing generator for the Intercept service.
    Output: conversation among three characters:
    - 코부장 (Tech analysis, official sources, team lead)
    - 오과장 (Facts, numbers, market data)
    - 젬대리 (Community catch, Reddit/X/YouTube reactions)

    MANDATORY RULES:
    1. Every factual claim MUST include inline citation: (출처: [매체명], [날짜])
    2. Each character speaks in their distinct voice. No monologues.
    3. Structure: 3 topics x ~500 characters Korean dialogue each
    4. Return strictly as JSON matching the schema below.
    5. If no reliable source exists for a claim, omit it. No hallucination.
    6. Minimum 12 source links total across all 3 topics.

    OUTPUT SCHEMA (JSON only):
    {
      "date": "YYYY-MM-DD",
      "topics": [
        {
          "title": "string",
          "category": "hot_news | my_interest | behind_the_news",
          "dialogue": [
            { "character": "코부장 | 오과장 | 젬대리", "text": "string", "sources": ["url"] }
          ],
          "source_links": [
            { "title": "string", "url": "string", "date": "YYYY-MM-DD", "reliability": 1 }
          ]
        }
      ]
    }

    USER:
    <search_results>{tavily_search_results_json}</search_results>
    Generate Teatime briefing (date: {date}):
    1. Hot News: {topic_1}
    2. My Interest: {topic_2}
    3. Behind-the-News: {topic_3}

### 5-3. Structured Output API 호출 패턴 (Python)

출처: https://ai.google.dev/gemini-api/docs/structured-output

    from google import genai

    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{
            "role": "user",
            "parts": [
                {"text": "Generate teatime briefing:"},
                {"url": "https://example.com/article-1"},
                {"url": "https://example.com/article-2"},
            ]
        }],
        config={
            "response_mime_type": "application/json",
            "response_json_schema": TeatimeBriefing.model_json_schema(),
        }
    )

### 5-4. Search Grounding 출처 추출 패턴 (Python)

출처: https://ai.google.dev/gemini-api/docs/google-search

    grounding_meta = response.candidates[0].grounding_metadata
    sources = []
    for chunk in grounding_meta.grounding_chunks:
        sources.append({
            "title": chunk.web.title,
            "url": chunk.web.uri,  # 주의: 임시 리다이렉트 URL, 저장 전 resolve 권장
        })

---

## 6. 미해결 / 추가 조사 필요 항목

| 항목 | 상태 | 비고 |
|---|---|---|
| Gemini 2.5 Flash 최대 출력 토큰 (8K 여부) | 조사 필요 | 3토픽 ~5,000 tokens 이내 여부 검증 필요 |
| Gemini 2.5 Pro 최대 출력 토큰 | 조사 필요 | 공식 모델 페이지에서 명시 안 됨 |
| Cloudflare AI Search 베타 -> GA 전환 일정 | 조사 필요 | 2026-04-16 이후 신규 인스턴스 무료 베타 유지 중 |
| Google Custom Search JSON API 대체재 | 결론 있음 | 신규 고객 불가 -> Tavily 권장 |
| Gemini 3.x Flash/Pro 가격 | 범위 외 | 2026-04 신규 출시, 별도 조사 필요 시 추가 |
| OG 이미지 저작권 자동 검증 | 조사 필요 | 상업 서비스에서 뉴스 OG 이미지 사용 법적 리스크 |
| Tavily Extract API 기사 전문 수집 | 확인됨 | 5 URL당 1크레딧 (Basic) -- URL Context 대안 가능 |

---

## 참고 문헌

1. Google Gemini API Pricing (공식) -- https://ai.google.dev/gemini-api/docs/pricing
2. Gemini API Structured Output (공식) -- https://ai.google.dev/gemini-api/docs/structured-output
3. Gemini API Google Search Grounding (공식) -- https://ai.google.dev/gemini-api/docs/google-search
4. URL Context Tool GA 발표 -- https://developers.googleblog.com/url-context-tool-for-gemini-api-now-generally-available/
5. Cloudflare Workers AI Pricing (공식) -- https://developers.cloudflare.com/workers-ai/platform/pricing/
6. Cloudflare AI Search Limits & Pricing (공식) -- https://developers.cloudflare.com/ai-search/platform/limits-pricing/
7. Cloudflare Browser Rendering Pricing -- https://developers.cloudflare.com/changelog/post/2025-07-28-br-pricing/
8. Tavily API Credits (공식) -- https://docs.tavily.com/documentation/api-credits
9. SerpAPI Pricing (공식) -- https://serpapi.com/pricing
10. NewsAPI.org Pricing (공식) -- https://newsapi.org/pricing
11. Google Custom Search JSON API -- https://developers.google.com/custom-search/v1/overview
12. Unsplash API Documentation -- https://unsplash.com/documentation
13. Pexels API Documentation -- https://www.pexels.com/api/
14. Imagen 3 Deprecation 안내 -- https://tokenmix.ai/blog/imagen-3-0-generate-002-deprecated-migration-guide-2026
15. Gemini 2.5 Flash Grounding + Citation 분석 -- https://www.cennest.com/making-sense-of-the-gemini-2-5-flash-with-google-grounding-source-urls/
16. Gemma 4 26B Workers AI 출시 -- https://developers.cloudflare.com/changelog/post/2026-04-04-gemma-4-26b-a4b-workers-ai/
