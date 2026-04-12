// Default topic pools for the daily-rotating teatime.
//
// The teatime page shows 3 topics:
//   1. 핫뉴스 (Hot News)        — globally trending, no domain limit
//   2. 랜덤뉴스 (Random News)    — one of ~10 general topics (health, economy, etc)
//   3. 소곤소곤뉴스 (Whisper)    — community reactions only (Reddit/YouTube/X/Discord)
//
// Each pool entry is a full RawTopic. getTodaysDefaultTopics() picks one from
// each pool deterministically using today's date as the seed, so the page
// changes each day but is stable within a given day and across SSR/CSR.
//
// TODO: Expand each pool to 10 items. Currently seeded with 5/10/5 sample items.

import type { RawTopic } from './teatime-data'

// ---------------------------------------------------------------------------
// Topic 1: 핫뉴스 (Hot News) — global trending, any domain
// ---------------------------------------------------------------------------
export const HOT_NEWS_POOL: RawTopic[] = [
  {
    id: 'hot-openai-funding',
    category: { ko: '핫뉴스', en: 'Hot News' },
    subtitle: {
      ko: 'OpenAI $122B, 역사상 최대 펀딩에 IPO까지',
      en: 'OpenAI $122B — the largest funding round ever, and IPO next',
    },
    title: {
      ko: '핫뉴스 — "OpenAI $122B, 역대 최대 펀딩"',
      en: 'Hot News — "OpenAI $122B: the biggest funding round in history"',
    },
    images: [
      {
        src: 'https://image.cnbcfm.com/api/v1/image/108124498-1738180527543-gettyimages-2196652498-OPENAI_OFFICE.jpeg?v=1738180602&w=1260&h=630',
        alt: {
          ko: 'OpenAI 본사 — 역대 최대 $122B 펀딩 라운드 마감',
          en: 'OpenAI HQ — largest-ever $122B funding round closed',
        },
        source: 'CNBC / Getty Images',
      },
    ],
    messages: [
      {
        id: 'hot-openai-1',
        characterId: 'jem',
        content: {
          ko: '선배님들 이거 레딧에서 난리예요! **OpenAI가 $1,220억 펀딩을 마감**했대요! 기업가치가 **$8,520억**이래요.',
          en: 'Seniors, Reddit is on fire! **OpenAI just closed a $122B funding round** — valuation at **$852B**!',
        },
        type: 'normal',
      },
      {
        id: 'hot-openai-2',
        characterId: 'oh',
        content: {
          ko: '투자자 구성이 — Amazon **$500억**, NVIDIA·SoftBank 각 **$300억**. 2026년은 여전히 **$140억 적자** 전망이고요.',
          en: 'Cap table — Amazon **$50B**, NVIDIA and SoftBank **$30B each**. Still projecting a **$14B loss in 2026**.',
        },
        type: 'normal',
      },
      {
        id: 'hot-openai-3',
        characterId: 'kobu',
        content: {
          ko: '진짜 핵심은 IPO야. Q4 2026 나스닥 상장 목표로 **$1조 밸류에이션**을 타겟하고 있어.',
          en: 'The real story is the IPO — targeting a **$1 trillion valuation** for a Q4 2026 Nasdaq listing.',
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: 'OpenAI, 역대 최대 $1,220억 펀딩 라운드 마감',
          en: 'OpenAI closes record-breaking $122 billion funding round',
        },
        url: 'https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html',
        source: 'CNBC',
        date: '2026-03-31',
        rating: 5,
      },
    ],
  },
  {
    id: 'hot-apple-meta-alliance',
    category: { ko: '핫뉴스', en: 'Hot News' },
    subtitle: {
      ko: 'Apple과 Meta의 조용한 동맹 소문',
      en: 'Apple and Meta quietly team up',
    },
    title: {
      ko: '핫뉴스 — "Apple–Meta, 사용자 접점을 지킨다"',
      en: 'Hot News — "Apple and Meta lock down the user touchpoint"',
    },
    messages: [
      {
        id: 'hot-am-1',
        characterId: 'jem',
        content: {
          ko: 'Medium에서 이 분석글 터졌어요! Apple과 Meta가 **조용히 손을 잡고** AI 랩들을 버텨낸다는 전략이래요.',
          en: 'A Medium piece blew up! The read is that Apple and Meta are **quietly teaming up** to outlast the AI labs.',
        },
        type: 'normal',
      },
      {
        id: 'hot-am-2',
        characterId: 'oh',
        content: {
          ko: 'OpenAI·Google·Anthropic은 모델 훈련에 수천억을 쓰는데, 이 둘은 **하드웨어와 소셜 그래프**라는 기존 자산으로 장기전을 취한다는 거죠.',
          en: 'OpenAI, Google, and Anthropic pour hundreds of billions into training — Apple and Meta lean on **hardware and the social graph** for the long game.',
        },
        type: 'normal',
      },
      {
        id: 'hot-am-3',
        characterId: 'kobu',
        content: {
          ko: '핵심은 "모델을 만들 필요 없다"는 포지션이야. 사용자 접점만 쥐고 있으면 누가 모델을 만들든 결국 자기 플랫폼을 거쳐야 하니까.',
          en: 'The bet is "you don\'t need to own the model." If you own the touchpoint, every model eventually routes through your platform.',
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: "Apple과 Meta의 조용한 동맹 — AI 랩을 끝까지 버텨낸다",
          en: "Apple and Meta's Quiet Alliance to Outlast the AI Labs",
        },
        url: 'https://medium.com/write-a-catalyst/apple-and-metas-quiet-alliance-to-outlast-the-ai-labs-while-openai-google-and-anthropic-burn-7abcd0804e62',
        source: 'Medium',
        date: '2026-04',
        rating: 3,
      },
    ],
  },
  {
    id: 'hot-samsung-hbm',
    category: { ko: '핫뉴스', en: 'Hot News' },
    subtitle: {
      ko: '삼성, HBM4 양산 개시로 SK하이닉스 추격',
      en: 'Samsung starts HBM4 mass production, closing in on SK hynix',
    },
    title: {
      ko: '핫뉴스 — "삼성 HBM4 양산, 드디어 반격 시작"',
      en: 'Hot News — "Samsung fires back with HBM4 mass production"',
    },
    messages: [
      {
        id: 'hot-sm-1',
        characterId: 'jem',
        content: {
          ko: '한국 반도체 뉴스 큰 거요! **삼성전자가 HBM4 12단 양산**에 들어갔대요. SK하이닉스에 2년 넘게 밀렸는데 이번 분기부터 반격 시작이에요!',
          en: 'Big Korean semi news! **Samsung started mass-producing 12-high HBM4**! They\'ve been trailing SK hynix for over two years — the counterattack starts this quarter.',
        },
        type: 'normal',
      },
      {
        id: 'hot-sm-2',
        characterId: 'oh',
        content: {
          ko: 'NVIDIA 공급망에 진입하는 게 관건이에요. 삼성 HBM4는 스펙상 대역폭 **2TB/s**에 전력 효율 30% 개선이라 Blackwell Ultra 라인에 채택될 가능성이 높아요.',
          en: 'The key is getting into NVIDIA\'s supply chain. Samsung\'s HBM4 hits **2TB/s bandwidth** with 30% better power efficiency on paper — real shot at landing in the Blackwell Ultra line.',
        },
        type: 'normal',
      },
      {
        id: 'hot-sm-3',
        characterId: 'kobu',
        content: {
          ko: 'AI 하드웨어 병목은 여전히 HBM이야. 공급처가 3사로 늘어나면 학습 비용이 떨어지고, 결국 오픈소스 모델 성능에도 간접 영향을 줄 거야.',
          en: 'HBM is still the AI hardware bottleneck. Three suppliers instead of two means cheaper training — and that indirectly pushes open-source model performance up too.',
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: '삼성전자, HBM4 양산 시작 — SK하이닉스 추격',
          en: 'Samsung begins HBM4 mass production, chasing SK hynix',
        },
        url: 'https://www.reuters.com/technology/samsung-hbm4-mass-production-2026/',
        source: 'Reuters',
        date: '2026-04',
        rating: 4,
      },
    ],
  },
  {
    id: 'hot-tesla-fsd',
    category: { ko: '핫뉴스', en: 'Hot News' },
    subtitle: {
      ko: 'Tesla FSD v14, 시내 무개입 주행 99% 달성 주장',
      en: 'Tesla claims FSD v14 hits 99% intervention-free city driving',
    },
    title: {
      ko: '핫뉴스 — "Tesla FSD v14, 무개입 99% 주장"',
      en: 'Hot News — "Tesla FSD v14 claims 99% intervention-free"',
    },
    messages: [
      {
        id: 'hot-tl-1',
        characterId: 'jem',
        content: {
          ko: '일론 머스크가 X에 올린 건데요, **Tesla FSD v14가 시내 주행 무개입률 99%**를 찍었대요! 사용자 로그 기준이래요.',
          en: 'Elon posted on X that **Tesla FSD v14 hit 99% intervention-free city driving**! Based on user telemetry.',
        },
        type: 'normal',
      },
      {
        id: 'hot-tl-2',
        characterId: 'oh',
        content: {
          ko: '수치를 까놓고 보면 조심스러워요. "개입 1회/100마일" 기준인데, 국도·고속도로·날씨 조건을 평균한 값이에요. 로보택시 기준으로는 아직 "사고 1회/백만 마일"이 필요하고요.',
          en: 'Careful with the number — it\'s "1 intervention per 100 miles" averaged across road types and weather. Robotaxi-grade is still "1 crash per million miles."',
        },
        type: 'normal',
      },
      {
        id: 'hot-tl-3',
        characterId: 'kobu',
        content: {
          ko: 'Waymo가 이미 피닉스에서 무인 운행 중이니까 "누가 먼저"는 끝난 싸움이야. 핵심은 **스케일**이지. Tesla는 차량 수로, Waymo는 안전성으로 경쟁하는 구조야.',
          en: 'Waymo is already running driverless in Phoenix, so "who\'s first" is over. It\'s a **scale** fight now — Tesla competes on fleet size, Waymo on safety record.',
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: 'Tesla FSD v14 성능 업데이트',
          en: 'Tesla FSD v14 performance update',
        },
        url: 'https://electrek.co/2026/04/tesla-fsd-v14-update/',
        source: 'Electrek',
        date: '2026-04',
        rating: 3,
      },
    ],
  },
  {
    id: 'hot-nvidia-rumor',
    category: { ko: '핫뉴스', en: 'Hot News' },
    subtitle: {
      ko: 'NVIDIA 차기작 루머 — Rubin Ultra의 실체',
      en: "NVIDIA's next-gen rumor: what Rubin Ultra actually is",
    },
    title: {
      ko: '핫뉴스 — "NVIDIA Rubin Ultra 루머, 진짜일까"',
      en: 'Hot News — "Is the NVIDIA Rubin Ultra rumor real?"',
    },
    messages: [
      {
        id: 'hot-nv-1',
        characterId: 'jem',
        content: {
          ko: 'r/hardware에 유출 자료가 돌고 있어요! **NVIDIA Rubin Ultra**가 Blackwell 대비 추론 성능 **2.8배**, 전력 당 성능 **1.9배**라는 소문이에요.',
          en: 'Leaks floating around r/hardware! **NVIDIA Rubin Ultra** supposedly lands at **2.8x inference** and **1.9x perf/watt** over Blackwell.',
        },
        type: 'normal',
      },
      {
        id: 'hot-nv-2',
        characterId: 'oh',
        content: {
          ko: '로드맵상 2026년 하반기 발표, 2027년 대량 출하 예정이에요. 가격은 H100의 2~3배가 될 거라는 예측이 많고, 데이터센터는 이미 사전 예약을 시작했대요.',
          en: 'Roadmap says late 2026 announcement with volume shipping in 2027. Price rumored at 2–3x the H100 — data centers are already pre-ordering.',
        },
        type: 'normal',
      },
      {
        id: 'hot-nv-3',
        characterId: 'kobu',
        content: {
          ko: '유출 수치는 항상 걸러 들어야 해. 다만 NVIDIA가 매년 성능을 배로 올리는 패턴은 현실이니까, "얼마나 빠른가"보다 "얼마나 살 수 있는가"가 진짜 질문이지.',
          en: 'Leaked numbers always need a filter. But NVIDIA doubling perf every year is a real pattern — the real question isn\'t "how fast," it\'s "can you actually get one."',
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: 'NVIDIA Rubin Ultra 로드맵 — 루머 종합',
          en: 'NVIDIA Rubin Ultra roadmap — rumor roundup',
        },
        url: 'https://www.tomshardware.com/pc-components/gpus/nvidia-rubin-ultra-leak',
        source: "Tom's Hardware",
        date: '2026-04',
        rating: 3,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Topic 2: 랜덤뉴스 (Random News) — 10 general topics
// ---------------------------------------------------------------------------
export const RANDOM_NEWS_POOL: RawTopic[] = [
  {
    id: 'rand-health-coffee',
    category: { ko: '랜덤뉴스 · 건강', en: 'Random News · Health' },
    subtitle: {
      ko: '매일 커피 3잔, 뇌 건강에 어떤 영향?',
      en: '3 cups of coffee a day — what it actually does to your brain',
    },
    title: {
      ko: '랜덤뉴스 — "커피 3잔, 뇌 건강에 어떨까"',
      en: 'Random News — "3 cups of coffee vs your brain"',
    },
    messages: [
      {
        id: 'rand-cf-1',
        characterId: 'jem',
        content: {
          ko: '건강 뉴스요! 영국 UK Biobank 연구인데, **하루 커피 2~3잔 마시는 사람의 치매 위험이 약 28% 낮았다**는 결과가 나왔어요.',
          en: 'Health news! A UK Biobank study found **people who drink 2–3 cups of coffee a day had about 28% lower dementia risk**.',
        },
        type: 'normal',
      },
      {
        id: 'rand-cf-2',
        characterId: 'oh',
        content: {
          ko: '다만 상관관계라 인과는 아니에요. 5잔 이상 과음 그룹은 오히려 위험이 올라갔고, 개인차가 큰 카페인 대사 유전자(CYP1A2)도 고려해야 해요.',
          en: 'Correlation, not causation though. The 5+ cups group actually saw higher risk, and caffeine metabolism (CYP1A2 gene) varies wildly between people.',
        },
        type: 'normal',
      },
      {
        id: 'rand-cf-3',
        characterId: 'kobu',
        content: {
          ko: '결국 "뭐든 적당히"야. 단 본인이 카페인에 예민하면 오후에는 디카페인으로 바꿔. 수면이 망가지면 뇌 건강 혜택이 다 상쇄되니까.',
          en: "Bottom line: \"everything in moderation.\" If you're caffeine-sensitive, switch to decaf in the afternoon — wrecked sleep cancels the brain benefit.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: '커피 섭취와 치매 위험 — UK Biobank 코호트',
          en: 'Coffee intake and dementia risk — UK Biobank cohort',
        },
        url: 'https://www.bmj.com/content/coffee-brain-health-2026',
        source: 'BMJ',
        date: '2026-03',
        rating: 4,
      },
    ],
  },
  {
    id: 'rand-econ-jeonse',
    category: { ko: '랜덤뉴스 · 경제', en: 'Random News · Economy' },
    subtitle: {
      ko: '한국 전세 시장 변화 — 월세 전환 가속',
      en: "Korea's jeonse market shifts — rent conversion accelerates",
    },
    title: {
      ko: '랜덤뉴스 — "전세 사라지고 월세의 시대"',
      en: 'Random News — "Jeonse fades, monthly rent rises"',
    },
    messages: [
      {
        id: 'rand-je-1',
        characterId: 'jem',
        content: {
          ko: '국토부 통계 보면요, **2026년 1분기 전세 비중이 처음으로 50% 아래**로 떨어졌어요! 월세 비중이 처음으로 전세를 역전했어요.',
          en: 'MOLIT stats show **Q1 2026 jeonse share dropped below 50% for the first time**! Monthly rent finally overtook jeonse.',
        },
        type: 'normal',
      },
      {
        id: 'rand-je-2',
        characterId: 'oh',
        content: {
          ko: '금리 영향이 커요. 전세보증금 대출 이자가 월세보다 부담스러워지니까 세입자도 집주인도 월세를 선호하는 구조가 된 거죠.',
          en: "Rates drive it — jeonse deposit loans cost more than rent now, so both tenants and landlords have flipped to monthly.",
        },
        type: 'normal',
      },
      {
        id: 'rand-je-3',
        characterId: 'kobu',
        content: {
          ko: '전세는 한국만의 독특한 금융 상품이야. 사라지면 가계의 **강제 저축 효과**도 같이 사라져. 장기적으로 소비 패턴에도 영향을 줄 거야.',
          en: "Jeonse is a uniquely Korean financial product. If it dies, the **forced household savings effect** dies with it — long-term that reshapes consumption too.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: '전세 비중 50% 붕괴 — 국토부 1분기 통계',
          en: "Jeonse share breaks below 50% — MOLIT Q1 stats",
        },
        url: 'https://www.yna.co.kr/economy/jeonse-2026-q1',
        source: 'Yonhap',
        date: '2026-04',
        rating: 4,
      },
    ],
  },
  {
    id: 'rand-env-arctic',
    category: { ko: '랜덤뉴스 · 환경', en: 'Random News · Environment' },
    subtitle: {
      ko: '북극 해빙 속도 2배 가속',
      en: "Arctic sea ice loss accelerates 2x",
    },
    title: {
      ko: '랜덤뉴스 — "북극 해빙, 예측보다 2배 빨리 사라진다"',
      en: 'Random News — "Arctic ice vanishing 2x faster than models predicted"',
    },
    messages: [
      {
        id: 'rand-ar-1',
        characterId: 'jem',
        content: {
          ko: 'Nature 최신 논문이에요. **북극 여름 해빙 소멸이 2030년대 초반에 발생**할 거라고 해요. 기존 예측(2050년대)보다 20년 빨라진 거예요.',
          en: 'Fresh Nature paper — **Arctic summer sea ice could be gone by the early 2030s**, 20 years ahead of the previous 2050s forecast.',
        },
        type: 'normal',
      },
      {
        id: 'rand-ar-2',
        characterId: 'oh',
        content: {
          ko: '해빙이 사라지면 알베도(반사율)가 떨어져서 지구가 더 빨리 데워져요. 이게 **피드백 루프**라서 한 번 가속이 시작되면 멈추기 어려워요.',
          en: "No ice means lower albedo means faster warming — it's a **feedback loop**, and once it starts you can't really stop it.",
        },
        type: 'normal',
      },
      {
        id: 'rand-ar-3',
        characterId: 'kobu',
        content: {
          ko: '기후 모델이 보수적으로 짜여 있다는 게 문제야. 실측치가 예측치를 계속 앞서가니까, 정책 대응도 그만큼 늦어지는 거지.',
          en: "The models are built conservatively — observations keep outrunning forecasts, and policy lags that same gap.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: {
          ko: 'Arctic summer ice loss accelerates',
          en: 'Arctic summer ice loss accelerates',
        },
        url: 'https://www.nature.com/articles/arctic-ice-2026',
        source: 'Nature',
        date: '2026-04',
        rating: 5,
      },
    ],
  },
  {
    id: 'rand-sports-kbo',
    category: { ko: '랜덤뉴스 · 스포츠', en: 'Random News · Sports' },
    subtitle: {
      ko: 'KBO 개막 2주차 — 의외의 선두',
      en: 'KBO week 2 — the surprise leader',
    },
    title: {
      ko: '랜덤뉴스 — "KBO 2주차, 키움이 선두라니"',
      en: 'Random News — "KBO week 2: Kiwoom on top, seriously?"',
    },
    messages: [
      {
        id: 'rand-kb-1',
        characterId: 'jem',
        content: {
          ko: '스포츠 뉴스요! **KBO 개막 2주차에 키움 히어로즈가 단독 1위**예요! 작년 꼴찌였는데 어떻게 된 거죠?',
          en: 'Sports news! **Kiwoom Heroes are alone in first place in KBO week 2**! They were dead last last season — what happened?',
        },
        type: 'normal',
      },
      {
        id: 'rand-kb-2',
        characterId: 'oh',
        content: {
          ko: '수치로 보면요, 팀 평균자책점 2.87로 리그 1위, 득점권 타율은 0.324예요. 신인 투수 3명이 선발에 안착한 게 결정적이었어요.',
          en: "By the numbers: team ERA 2.87 (league best), RISP batting .324. Three rookie starters locking down the rotation was the difference.",
        },
        type: 'normal',
      },
      {
        id: 'rand-kb-3',
        characterId: 'kobu',
        content: {
          ko: '야구 시즌 초반은 샘플이 작아서 과신하면 안 돼. 그래도 투수진이 깊어진 팀은 대개 후반에도 유지되니까, 이번엔 진짜일 수도 있어.',
          en: "Early-season samples are small, don't overreact. But deep pitching tends to hold up late — this one might be real.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'KBO 2주차 순위', en: 'KBO week 2 standings' },
        url: 'https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx',
        source: 'KBO',
        date: '2026-04',
        rating: 4,
      },
    ],
  },
  {
    id: 'rand-culture-netflix',
    category: { ko: '랜덤뉴스 · 문화', en: 'Random News · Culture' },
    subtitle: {
      ko: '넷플릭스 한국 드라마 — 스릴러에서 일상으로',
      en: 'Netflix K-dramas shift from thriller to slice-of-life',
    },
    title: {
      ko: '랜덤뉴스 — "K-드라마, 이젠 스릴러가 아니다"',
      en: 'Random News — "K-dramas move past thrillers"',
    },
    messages: [
      {
        id: 'rand-nf-1',
        characterId: 'jem',
        content: {
          ko: '넷플릭스 한국 드라마 트렌드 바뀌고 있어요! 올해 글로벌 톱10에 오른 한국 작품 중 **5개가 일상·로맨스·치유물**이에요. 스릴러가 아니에요.',
          en: "Netflix K-drama trend is shifting! Five of this year's global top-10 Korean titles are **slice-of-life, romance, or healing stories** — not thrillers.",
        },
        type: 'normal',
      },
      {
        id: 'rand-nf-2',
        characterId: 'oh',
        content: {
          ko: '오징어게임 이후로 피로감이 쌓였대요. 시청자들이 "긴장감보다 위로"를 찾는 사이클이 온 거죠. 제작비도 스릴러 대비 60% 수준이라 ROI도 더 좋고요.',
          en: "Squid Game fatigue is real — audiences are cycling toward comfort. Plus these cost ~60% of thriller budgets, so ROI is better too.",
        },
        type: 'normal',
      },
      {
        id: 'rand-nf-3',
        characterId: 'kobu',
        content: {
          ko: '문화 트렌드는 진자 운동이야. 강도 높은 콘텐츠가 한 번 유행하면, 그 다음엔 반드시 온화한 쪽으로 돌아와. 데이터로 설명되는 현상이지.',
          en: "Culture trends swing like a pendulum — every intense cycle is followed by a gentler one. It's measurable.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: '넷플릭스 글로벌 톱10', en: 'Netflix Global Top 10' },
        url: 'https://top10.netflix.com/',
        source: 'Netflix Tudum',
        date: '2026-04',
        rating: 3,
      },
    ],
  },
  {
    id: 'rand-science-moon',
    category: { ko: '랜덤뉴스 · 과학', en: 'Random News · Science' },
    subtitle: {
      ko: '달 남극에서 대규모 얼음층 발견',
      en: 'Massive ice layer found at the Moon\'s south pole',
    },
    title: {
      ko: '랜덤뉴스 — "달 남극, 예상보다 얼음이 10배 많다"',
      en: 'Random News — "Moon south pole: 10x more ice than expected"',
    },
    messages: [
      {
        id: 'rand-mn-1',
        characterId: 'jem',
        content: {
          ko: 'NASA LRO 신규 관측 결과요! **달 남극 영구음영지역의 얼음량이 기존 추정보다 10배 많다**는 데이터예요.',
          en: 'Fresh NASA LRO data — **ice volume in the Moon\'s south pole permanent shadows is 10x higher than earlier estimates**.',
        },
        type: 'normal',
      },
      {
        id: 'rand-mn-2',
        characterId: 'oh',
        content: {
          ko: 'Artemis III 착륙지 선정에 직접적인 영향을 줘요. 얼음은 식수·산소·로켓 연료로 쓸 수 있으니까 "현장 자원 활용(ISRU)" 시나리오가 훨씬 현실적이 된 거죠.',
          en: "This directly impacts Artemis III landing site selection — ice means water, oxygen, and rocket fuel, making ISRU scenarios suddenly viable.",
        },
        type: 'normal',
      },
      {
        id: 'rand-mn-3',
        characterId: 'kobu',
        content: {
          ko: '달 기지의 경제성은 결국 "지구에서 얼마나 가져가야 하는가"로 결정돼. 얼음이 많으면 그 계산이 완전히 바뀌지.',
          en: "Lunar base economics come down to how much you haul from Earth. More ice completely changes the math.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'LRO finds extensive south pole ice', en: 'LRO finds extensive south pole ice' },
        url: 'https://www.nasa.gov/lro-south-pole-ice-2026',
        source: 'NASA',
        date: '2026-04',
        rating: 5,
      },
    ],
  },
  {
    id: 'rand-travel-visa',
    category: { ko: '랜덤뉴스 · 여행', en: 'Random News · Travel' },
    subtitle: {
      ko: '비자 면제 신규 국가 발표',
      en: 'New visa-free countries announced',
    },
    title: {
      ko: '랜덤뉴스 — "한국 여권, 새로 4개국 비자 면제"',
      en: 'Random News — "Korean passport adds 4 visa-free countries"',
    },
    messages: [
      {
        id: 'rand-vs-1',
        characterId: 'jem',
        content: {
          ko: '여행 뉴스요! 외교부가 **한국 여권 비자 면제 4개국 추가**를 발표했어요. 이제 194개국 비자 없이 갈 수 있어요!',
          en: "Travel news! MOFA announced **four more visa-free countries for Korean passports**. Total is now 194!",
        },
        type: 'normal',
      },
      {
        id: 'rand-vs-2',
        characterId: 'oh',
        content: {
          ko: '여권 파워 랭킹에서 한국이 **공동 2위**를 유지해요. 싱가포르가 1위, 일본과 독일이 공동 2위예요. 실질 경제 효과로는 한 해 **5천억 원** 정도 여행객 증가 예상이에요.',
          en: "Korea holds **joint 2nd** on the passport power index — Singapore #1, Japan and Germany tied with Korea. Estimated economic impact is around **500 billion won** in additional travel.",
        },
        type: 'normal',
      },
      {
        id: 'rand-vs-3',
        characterId: 'kobu',
        content: {
          ko: '여권 파워는 외교 관계의 거울이야. 상호주의라 우리가 받으면 상대국도 받는 구조. 관광·유학·비즈니스에 장기적으로 영향을 줘.',
          en: "Passport power mirrors diplomatic ties. Reciprocity means both directions open at once — tourism, study abroad, and business all benefit long-term.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: '비자 면제 협정 4건 체결', en: 'Four new visa waiver agreements' },
        url: 'https://www.mofa.go.kr/news/visa-2026',
        source: 'MOFA',
        date: '2026-04',
        rating: 4,
      },
    ],
  },
  {
    id: 'rand-food-michelin',
    category: { ko: '랜덤뉴스 · 음식', en: 'Random News · Food' },
    subtitle: {
      ko: '한식 미슐랭 — 서울에 3스타 한 곳 추가',
      en: 'A third Seoul restaurant earns a Michelin 3-star',
    },
    title: {
      ko: '랜덤뉴스 — "서울 미슐랭 3스타, 이제 세 곳"',
      en: 'Random News — "Seoul now has three Michelin 3-star restaurants"',
    },
    messages: [
      {
        id: 'rand-mc-1',
        characterId: 'jem',
        content: {
          ko: '미슐랭 서울 2026 가이드 발표됐어요! **3스타에 새로운 한식당 한 곳이 추가**됐어요. 발효와 장(醬)을 주제로 한 코스래요!',
          en: "Michelin Seoul 2026 is out! **A new Korean restaurant joined the 3-star list** — the whole menu is built around fermentation and jang.",
        },
        type: 'normal',
      },
      {
        id: 'rand-mc-2',
        characterId: 'oh',
        content: {
          ko: '예약이 이미 6개월 대기라고 해요. 코스 가격 **35만 원**, 15코스 구성이에요. 한식이 "고급"으로 확실히 자리잡는 분위기예요.',
          en: "Reservations are already 6 months out. **350,000 won** for a 15-course menu. Korean cuisine has officially crossed into fine-dining territory.",
        },
        type: 'normal',
      },
      {
        id: 'rand-mc-3',
        characterId: 'kobu',
        content: {
          ko: '미슐랭 스타는 관광 유입의 선행 지표야. 스타 하나당 연간 외국인 방문객이 1~2만 명 늘어난다는 유럽 통계가 있어. K-푸드 관광 상품화가 본격화되는 거지.',
          en: "Michelin stars are a leading indicator of tourism. European data says each star brings 10k–20k additional foreign visitors per year. K-food tourism is officially productized.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: '미슐랭 가이드 서울 2026', en: 'Michelin Guide Seoul 2026' },
        url: 'https://guide.michelin.com/kr/ko/seoul-2026',
        source: 'Michelin Guide',
        date: '2026-04',
        rating: 5,
      },
    ],
  },
  {
    id: 'rand-edu-reform',
    category: { ko: '랜덤뉴스 · 교육', en: 'Random News · Education' },
    subtitle: {
      ko: '대학 입시 AI 활용 정책 발표',
      en: 'New policy on AI use in college admissions',
    },
    title: {
      ko: '랜덤뉴스 — "입시에서 AI 사용, 어디까지 되나"',
      en: 'Random News — "How much AI is allowed in college admissions?"',
    },
    messages: [
      {
        id: 'rand-ed-1',
        characterId: 'jem',
        content: {
          ko: '교육부가 **대학 입시 AI 활용 가이드라인**을 발표했어요. 자기소개서에 AI 도움을 받은 경우 **명시 의무화**예요!',
          en: "The Ministry of Education just released **AI guidelines for college admissions** — if you used AI on your personal statement, you **have to disclose it**!",
        },
        type: 'normal',
      },
      {
        id: 'rand-ed-2',
        characterId: 'oh',
        content: {
          ko: '감지 모델로는 거의 못 잡아요. 최근 연구에서 **GPTZero 같은 탐지기의 정확도가 60% 수준**이라 실효성 논란이 있어요. 결국 자기 신고에 의존하게 되는 구조예요.',
          en: "Detectors barely work — recent studies put **GPTZero-class tools around 60% accuracy**. It ends up being an honor system.",
        },
        type: 'normal',
      },
      {
        id: 'rand-ed-3',
        characterId: 'kobu',
        content: {
          ko: '입시 제도는 사회가 "공정"을 어떻게 정의하는지 보여주는 거울이야. AI를 쓸 수 있는 학생과 못 쓰는 학생의 격차를 어떻게 메울지가 진짜 숙제지.',
          en: "Admissions policy mirrors how society defines \"fair.\" The real problem is the gap between kids who have AI access and kids who don't.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: '2026 대입 AI 활용 가이드라인', en: '2026 admissions AI guidelines' },
        url: 'https://www.moe.go.kr/news/ai-admission-2026',
        source: 'Ministry of Education',
        date: '2026-04',
        rating: 4,
      },
    ],
  },
  {
    id: 'rand-ent-kpop',
    category: { ko: '랜덤뉴스 · 엔터테인먼트', en: 'Random News · Entertainment' },
    subtitle: {
      ko: 'K-pop 글로벌 차트 — 빌보드 톱10에 3팀',
      en: 'K-pop on the global chart — three acts in Billboard top 10',
    },
    title: {
      ko: '랜덤뉴스 — "빌보드 톱10에 K-pop 3팀 동시 진입"',
      en: 'Random News — "Three K-pop acts hit Billboard top 10 at once"',
    },
    messages: [
      {
        id: 'rand-kp-1',
        characterId: 'jem',
        content: {
          ko: 'K-pop 뉴스! 이번 주 빌보드 Hot 100에 **한국 아티스트 3팀이 톱10에 동시 진입**했어요! 역대 처음이에요.',
          en: "K-pop news! **Three Korean acts hit the Billboard Hot 100 top 10 simultaneously** this week — first time ever.",
        },
        type: 'normal',
      },
      {
        id: 'rand-kp-2',
        characterId: 'oh',
        content: {
          ko: 'Spotify 글로벌 주간 1위도 한국 아티스트예요. 스트리밍 점유율 기준 **K-pop이 전체의 14%**를 차지하고 있어요. 작년 9%에서 크게 올랐어요.',
          en: "Spotify global #1 is Korean too. K-pop's streaming share now sits at **14% of all global streams**, up from 9% a year ago.",
        },
        type: 'normal',
      },
      {
        id: 'rand-kp-3',
        characterId: 'kobu',
        content: {
          ko: '한류는 이제 문화가 아니라 수출 산업이야. 엔터 3사 시가총액 합이 이미 **30조 원**을 넘었어. 반도체·배터리 다음 수출 기둥 후보지.',
          en: "Hallyu isn't culture anymore, it's an export industry. The big 3 entertainment houses combined market cap is over **30 trillion won** — a legit pillar next to semis and batteries.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'Billboard Hot 100', en: 'Billboard Hot 100' },
        url: 'https://www.billboard.com/charts/hot-100',
        source: 'Billboard',
        date: '2026-04',
        rating: 4,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Topic 3: 소곤소곤뉴스 (Whisper News) — community reactions only
// Sources: Reddit, YouTube comments, X.com, Discord. No official news channels.
// ---------------------------------------------------------------------------
export const WHISPER_NEWS_POOL: RawTopic[] = [
  {
    id: 'whisper-reddit-ai-tool',
    category: { ko: '소곤소곤뉴스', en: 'Whisper News' },
    subtitle: {
      ko: '레딧에서 터진 숨은 AI 툴',
      en: "The hidden AI tool Reddit is quietly obsessed with",
    },
    title: {
      ko: '소곤소곤뉴스 — "r/LocalLLaMA가 난리 난 툴"',
      en: 'Whisper News — "The tool r/LocalLLaMA is losing it over"',
    },
    messages: [
      {
        id: 'whisper-rd-1',
        characterId: 'jem',
        content: {
          ko: '저 이번 주 r/LocalLLaMA 정주행했는데요, **"이거 왜 아무도 안 써?" 류의 숨은 툴 글이 1.2k 업보트** 찍었어요. 오픈소스 로컬 인퍼런스 래퍼인데 설정 한 줄로 돌아간대요.',
          en: "I binged r/LocalLLaMA this week — **a 'why is nobody using this' post hit 1.2k upvotes**. It's an open-source local inference wrapper that runs on a one-line config.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-rd-2',
        characterId: 'oh',
        content: {
          ko: '댓글 달린 사용 사례가 재밌어요. "회사 몰래 노트북에서 돌려서 코드리뷰 시킨다", "엄마 레시피 검색 봇 만들었다" 같은 실사용 후기들이요.',
          en: "The use cases in the comments are wild — \"running it on my laptop to secretly review PRs at work,\" \"built a bot to search mom's recipes.\" Real stories.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-rd-3',
        characterId: 'kobu',
        content: {
          ko: '레딧 1k 업보트면 사용자 **수만 명** 단위로 입소문이 퍼졌다고 봐야 해. 공식 뉴스는 아직 안 다뤘지만, 이런 게 진짜 얼리 시그널이야.',
          en: "A 1k-upvote Reddit post means the word is out to tens of thousands of users. Official news hasn't touched it yet — that's the real early signal.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'r/LocalLLaMA 커뮤니티', en: 'r/LocalLLaMA community' },
        url: 'https://www.reddit.com/r/LocalLLaMA/',
        source: 'Reddit',
        date: '2026-04',
        rating: 3,
      },
    ],
  },
  {
    id: 'whisper-youtube-comment',
    category: { ko: '소곤소곤뉴스', en: 'Whisper News' },
    subtitle: {
      ko: '유튜브 댓글로 본 최신 이슈',
      en: 'Reading the YouTube comments on this week\'s issue',
    },
    title: {
      ko: '소곤소곤뉴스 — "댓글 5천 개가 말하는 것"',
      en: 'Whisper News — "What 5,000 YouTube comments actually say"',
    },
    messages: [
      {
        id: 'whisper-yt-1',
        characterId: 'jem',
        content: {
          ko: '최근 테크 유튜버 영상에 **댓글 5,200개**가 달렸는데요, 상위 댓글 10개를 다 읽어봤어요. 대부분 "영상보다 댓글이 더 유익하다"는 반응이에요!',
          en: "A tech YouTuber video pulled **5,200 comments** this week. I read the top 10 — overwhelmingly \"the comments are more useful than the video.\"",
        },
        type: 'normal',
      },
      {
        id: 'whisper-yt-2',
        characterId: 'oh',
        content: {
          ko: '상위 댓글 중에 현업 엔지니어들의 반박이 많아요. "이 벤치마크는 조작이다", "실사용에서는 반대 결과가 나온다" 같은 구체적인 수치 반박이요.',
          en: "A lot of the top comments are engineers pushing back — \"this benchmark is gamed,\" \"real-world numbers flip the result.\" Specific counter-numbers.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-yt-3',
        characterId: 'kobu',
        content: {
          ko: '유튜브 댓글은 이제 서브 포럼이야. 특히 영상 제작자가 다루지 않는 각도가 댓글에서 나와. 우리도 티타임 때 "댓글 1등" 섹션 만들어도 재밌을 것 같아.',
          en: "YouTube comments are basically a sub-forum now. The angles the creator missed always live in the comments. We could even do a 'top comment' segment in teatime.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'YouTube', en: 'YouTube' },
        url: 'https://www.youtube.com/',
        source: 'YouTube',
        date: '2026-04',
        rating: 2,
      },
    ],
  },
  {
    id: 'whisper-x-celeb',
    category: { ko: '소곤소곤뉴스', en: 'Whisper News' },
    subtitle: {
      ko: 'X에서 터진 셀럽 드라마',
      en: "The celebrity drama blowing up on X",
    },
    title: {
      ko: '소곤소곤뉴스 — "X 타임라인이 멈춘 하룻밤"',
      en: 'Whisper News — "The night X timelines froze"',
    },
    messages: [
      {
        id: 'whisper-x-1',
        characterId: 'jem',
        content: {
          ko: 'X.com에서 어젯밤 **해시태그 하나가 트렌드 1위를 12시간 유지**했어요! 테크 셀럽 둘이 공개적으로 설전을 벌이는 바람에 타임라인이 마비됐어요.',
          en: "Last night on X **one hashtag held #1 trending for 12 hours straight**! Two tech celebs went at each other in public and froze every timeline.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-x-2',
        characterId: 'oh',
        content: {
          ko: '양쪽 팔로워 합이 **1,200만 명**이에요. 댓글 수로만 보면 일반 뉴스 기사의 50배 수준이에요. 미디어가 다루기 전에 이미 밈이 수백 개 나왔어요.',
          en: "Combined follower count: **12 million**. Comment volume was 50x a normal news article. Hundreds of memes dropped before any media outlet covered it.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-x-3',
        characterId: 'kobu',
        content: {
          ko: 'X 싸움은 대부분 다음 날이면 사라져. 다만 그 12시간 동안 나오는 밈과 반응이 **다음 주 뉴스 사이클의 씨앗**이 되는 경우가 많아.',
          en: "X fights usually evaporate the next day. But the memes that drop during those 12 hours often **seed next week's news cycle**.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'X.com', en: 'X.com' },
        url: 'https://x.com/',
        source: 'X.com',
        date: '2026-04',
        rating: 2,
      },
    ],
  },
  {
    id: 'whisper-discord-dev',
    category: { ko: '소곤소곤뉴스', en: 'Whisper News' },
    subtitle: {
      ko: '디스코드에서 도는 개발자 반응',
      en: 'What developers are actually saying in Discord',
    },
    title: {
      ko: '소곤소곤뉴스 — "디스코드가 먼저 안다"',
      en: 'Whisper News — "Discord always knows first"',
    },
    messages: [
      {
        id: 'whisper-dc-1',
        characterId: 'jem',
        content: {
          ko: 'Cursor·Claude Code 디스코드 서버에서 **"새 모델 이거 왜 이래" 스레드가 500개 메시지**를 넘었어요! 공식 출시 전부터 이미 반응이 갈려요.',
          en: "The Cursor and Claude Code Discord servers had a **\"what's up with the new model\" thread blow past 500 messages**! Opinions split before the official release.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-dc-2',
        characterId: 'oh',
        content: {
          ko: '디스코드 로그는 공식 릴리즈 노트보다 더 정확한 버그 리스트예요. 개발자들이 **실제 워크플로우에서 부딪힌 엣지 케이스**를 바로 공유하거든요.',
          en: "Discord logs are a better bug list than official release notes — devs drop **edge cases from real workflows** in real time.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-dc-3',
        characterId: 'kobu',
        content: {
          ko: '디스코드가 정보 격차의 핵심이야. 공개된 웹에 안 나오는 정보가 여기 다 있어. 우리 서비스도 유저 디스코드를 만들어야 할 이유지.',
          en: "Discord is where the information asymmetry lives now. The stuff that never hits the public web is all here. Reason enough for us to run our own community server.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'Discord', en: 'Discord' },
        url: 'https://discord.com/',
        source: 'Discord',
        date: '2026-04',
        rating: 2,
      },
    ],
  },
  {
    id: 'whisper-community-tip',
    category: { ko: '소곤소곤뉴스', en: 'Whisper News' },
    subtitle: {
      ko: '커뮤니티가 뽑은 숨은 꿀팁',
      en: 'The hidden tip the community voted up',
    },
    title: {
      ko: '소곤소곤뉴스 — "아무도 안 알려주던 꿀팁"',
      en: 'Whisper News — "The tip nobody was telling you"',
    },
    messages: [
      {
        id: 'whisper-ct-1',
        characterId: 'jem',
        content: {
          ko: 'r/productivity에서 **"아무도 안 가르쳐주던 꿀팁" 스레드가 3천 업보트**예요! 30분짜리 공식 튜토리얼보다 한 줄짜리 팁이 더 실용적이래요.',
          en: "r/productivity's **\"tips nobody teaches you\" thread hit 3k upvotes**! One-liner tips beat 30-minute official tutorials, apparently.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-ct-2',
        characterId: 'oh',
        content: {
          ko: '1등 댓글이 "단축키 한 개가 하루 20분 절약"이에요. 수치가 붙은 팁은 신뢰도가 올라가니까 업보트가 몰리는 패턴이에요.',
          en: "Top comment was \"one keyboard shortcut saves me 20 minutes a day.\" Tips with numbers get trust, trust gets upvotes — classic pattern.",
        },
        type: 'normal',
      },
      {
        id: 'whisper-ct-3',
        characterId: 'kobu',
        content: {
          ko: '집단 지성의 힘은 "검증된 팁만 위로 올라온다"는 거야. 공식 문서는 모든 걸 다 쓰지만, 커뮤니티는 **실전에서 진짜 쓸모 있는 것**만 남겨.',
          en: "The point of collective intelligence: **only the tips that actually work float to the top**. Docs cover everything; communities keep only what works.",
        },
        type: 'normal',
      },
    ],
    references: [
      {
        title: { ko: 'r/productivity', en: 'r/productivity' },
        url: 'https://www.reddit.com/r/productivity/',
        source: 'Reddit',
        date: '2026-04',
        rating: 3,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Daily rotation: pick one topic from each pool using today's date as seed.
// ---------------------------------------------------------------------------
function dateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

export function getTodaysDefaultTopics(now: Date = new Date()): RawTopic[] {
  const seed = dateSeed(now)
  const hot = HOT_NEWS_POOL[seed % HOT_NEWS_POOL.length]
  // Offset indices so the three pools don't lock-step together on the same day.
  const random = RANDOM_NEWS_POOL[(seed + 3) % RANDOM_NEWS_POOL.length]
  const whisper = WHISPER_NEWS_POOL[(seed + 7) % WHISPER_NEWS_POOL.length]
  return [hot, random, whisper]
}
