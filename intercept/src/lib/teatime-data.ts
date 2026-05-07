// Bilingual text primitive: either a plain string (legacy / language-neutral)
// or a { ko, en } object. The localizeTeatime() helper resolves each field
// down to a plain string based on the active locale so that rendering code
// never has to worry about bilingual shape.
export type LocalizedText = string | { ko: string; en: string };
export type Locale = 'en' | 'ko';

export function pickText(value: LocalizedText, locale: Locale): string {
  if (typeof value === 'string') return value;
  return value[locale] ?? value.ko ?? value.en ?? '';
}

export interface Character {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
}

// Raw (bilingual) shapes — stored in this file.
export interface RawMessage {
  id: string;
  characterId: string;
  content: LocalizedText;
  type: 'normal' | 'intercept-answer';
}

export interface RawTopicImage {
  src: string;
  alt: LocalizedText;
  source: LocalizedText;
}

export interface RawReference {
  title: LocalizedText;
  url: string;
  source: LocalizedText;
  date: string;
  rating: number;
}

export interface RawTopic {
  id: string;
  category: LocalizedText;
  subtitle: LocalizedText;
  title: LocalizedText;
  images?: RawTopicImage[];
  messages: RawMessage[];
  references: RawReference[];
}

export interface RawTeaTime {
  id: string;
  date: string;
  title: LocalizedText;
  intro: LocalizedText;
  topics: RawTopic[];
}

// Resolved (flat) shapes — what rendering code consumes after localizeTeatime().
export interface Message {
  id: string;
  characterId: string;
  content: string;
  type: 'normal' | 'intercept-answer';
}

export interface TopicImage {
  src: string;
  alt: string;
  source: string;
}

export interface Reference {
  title: string;
  url: string;
  source: string;
  date: string;
  rating: number;
}

export interface Topic {
  id: string;
  category: string;
  subtitle: string;
  title: string;
  images?: TopicImage[];
  messages: Message[];
  references: Reference[];
}

export interface TeaTime {
  id: string;
  date: string;
  title: string;
  intro: string;
  topics: Topic[];
}

export function localizeTeatime(raw: RawTeaTime, locale: Locale): TeaTime {
  return {
    id: raw.id,
    date: raw.date,
    title: pickText(raw.title, locale),
    intro: pickText(raw.intro, locale),
    topics: raw.topics.map((t) => ({
      id: t.id,
      category: pickText(t.category, locale),
      subtitle: pickText(t.subtitle, locale),
      title: pickText(t.title, locale),
      images: t.images?.map((img) => ({
        src: img.src,
        alt: pickText(img.alt, locale),
        source: pickText(img.source, locale),
      })),
      messages: t.messages.map((m) => ({
        id: m.id,
        characterId: m.characterId,
        content: pickText(m.content, locale),
        type: m.type,
      })),
      references: t.references.map((r) => ({
        title: pickText(r.title, locale),
        url: r.url,
        source: pickText(r.source, locale),
        date: r.date,
        rating: r.rating,
      })),
    })),
  };
}

// Characters — name/role are sourced from i18n (t.characters[id].name / .role)
// at render time; the values here are fallbacks.
export const CHARACTERS: Record<string, Character> = {
  kobu: {
    id: 'kobu',
    name: 'Ko Bujang',
    role: 'Dev Lead',
    color: '#4A90D9',
    avatar: '/characters/Ko-bujang.svg',
  },
  oh: {
    id: 'oh',
    name: 'Oh Gwajang',
    role: 'Product Manager',
    color: '#E67E22',
    avatar: '/characters/Oh-gwajang.svg',
  },
  jem: {
    id: 'jem',
    name: 'Jem Daeri',
    role: 'Dev Assistant',
    color: '#27AE60',
    avatar: '/characters/Jem-daeri.svg',
  },
  user: {
    id: 'user',
    name: 'You',
    role: 'Reader',
    color: '#9B59B6',
    avatar: '',
  },
};

// ---------------------------------------------------------------------------
// Vol.4 — Korean only (historical; not currently displayed). Left as plain
// strings so the RawTeaTime type (string | bilingual) accepts it as-is.
// ---------------------------------------------------------------------------
export const TEATIME_VOL4: RawTeaTime = {
  id: 'teatime-2026-04-06',
  date: '2026-04-06',
  title: 'Offspace 티타임 Vol.4',
  intro: '월요일 아침, 코부장이 아메리카노 두 잔을 들고 출근했다. 오과장이 "한 잔은 누구 거예요?"하자 코부장이 "월요병 약이야"라며 하나를 젬대리에게 건넸다.',
  topics: [
    {
      id: 'topic-hotnews',
      category: 'AI 핫뉴스',
      subtitle: 'Anthropic이 바이오를 삼키고, OpenAI는 흔들린다',
      title: 'AI 핫뉴스 — "Anthropic이 바이오를 삼키고, OpenAI는 흔들린다"',
      images: [
        {
          src: 'https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2026/04/Anthropic.png',
          alt: 'Anthropic Coefficient Bio 인수 보도',
          source: 'SiliconANGLE',
        },
        {
          src: 'https://techcrunch.com/wp-content/uploads/2026/02/brad-lightcap-GettyImages-2147824375-1.jpg?w=1024',
          alt: 'OpenAI COO 브래드 라이트캡 — 경영진 대개편',
          source: 'TechCrunch',
        },
      ],
      messages: [
        { id: 'msg-hn-1', characterId: 'jem', content: '선배님들 주말 사이에 뉴스 폭탄이에요! Anthropic이 **Coefficient Bio라는 바이오 스타트업을 4억 달러에 인수**했대요!', type: 'normal' },
        { id: 'msg-hn-2', characterId: 'oh', content: '해커뉴스에서도 "인재 영입치곤 비싸다" vs "기술이 핵심이다" 갑론을박이에요. 수치로 보면 직원당 약 **4천만 달러** 이상 가치를 매긴 거죠.', type: 'normal' },
        { id: 'msg-hn-3', characterId: 'kobu', content: '창업자 둘이 Genentech 프레시언트 디자인 출신이야. 단백질 설계랑 생체분자 모델링 전문가들이지.', type: 'normal' },
      ],
      references: [
        { title: 'Anthropic acquires Coefficient Bio for $400M+', url: 'https://siliconangle.com/2026/04/03/anthropic-reportedly-acquires-medical-ai-startup-coefficient-bio-400m/', source: 'SiliconANGLE', date: '2026-04-03', rating: 4 },
      ],
    },
    {
      id: 'topic-agents',
      category: 'AI 에이전트',
      subtitle: 'MCP가 인프라가 됐다, 그런데 도전자도 왔다',
      title: 'AI 에이전트 — "MCP가 인프라가 됐다, 그런데 도전자도 왔다"',
      messages: [
        { id: 'msg-ag-1', characterId: 'jem', content: '저 이번 주말에 r/LocalLLaMA 정주행했는데요! **MCP 서버 베스트 11선** 글이 318 업보트에 39 댓글 달렸어요.', type: 'normal' },
      ],
      references: [
        { title: 'MCP is Alive but Faces Challenges', url: 'https://aibusiness.com/agentic-ai/mcp-alive-faces-challenges', source: 'AI Business', date: '2026-04', rating: 4 },
      ],
    },
    {
      id: 'topic-robots',
      category: 'AI 로봇 / 피지컬 AI',
      subtitle: '일본이 먼저 증명했다',
      title: 'AI 로봇 / 피지컬 AI — "일본이 먼저 증명했다"',
      messages: [
        { id: 'msg-rb-1', characterId: 'jem', content: '유튜브에서 일본 로봇 공장 영상이 바이럴이에요!', type: 'normal' },
      ],
      references: [
        { title: 'Japan physical AI is ready for the real world', url: 'https://techcrunch.com/2026/04/05/japan-is-proving-experimental-physical-ai-is-ready-for-the-real-world/', source: 'TechCrunch', date: '2026-04-05', rating: 5 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Vol.5 — bilingual (ko + en). This is the currently-displayed teatime.
// ---------------------------------------------------------------------------
export const TEATIME_VOL5: RawTeaTime = {
  id: 'teatime-2026-04-07',
  date: '2026-04-07',
  title: {
    ko: 'Offspace 티타임 Vol.5',
    en: 'Offspace Teatime Vol.5',
  },
  intro: {
    ko: '화요일 아침, 젬대리가 헐레벌떡 뛰어 들어왔다. "선배님들! 주말 사이에 뉴스가 너무 많아서 정리가 안 돼요!" 코부장이 커피를 한 모금 마시며 "그래서 티타임이 있는 거지"라고 웃었다.',
    en: 'Tuesday morning, Jem burst into the office out of breath. "Seniors! There was way too much news over the weekend, I can\'t keep up!" Ko took a sip of coffee and smiled: "That\'s exactly why we have teatime."',
  },
  topics: [
    {
      id: 'v5-topic-hotnews',
      category: { ko: 'AI 핫뉴스', en: 'Hot News' },
      subtitle: {
        ko: 'OpenAI $122B, 역사상 최대 펀딩에 IPO까지',
        en: 'OpenAI $122B — the largest funding round ever, and IPO next',
      },
      title: {
        ko: 'AI 핫뉴스 — "OpenAI $122B, 역사상 최대 펀딩에 IPO까지"',
        en: 'Hot News — "OpenAI $122B: the biggest funding round in history, IPO next"',
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
          id: 'v5-hn-1',
          characterId: 'jem',
          content: {
            ko: '선배님들 이거 레딧에서 난리예요! **OpenAI가 $1,220억(약 170조 원) 펀딩을 마감**했대요! 역대 모든 기업 통틀어 최대 규모래요. 기업가치가 **$8,520억**이고요! (3/31 마감 · 4/5 분석 보도)',
            en: 'Seniors, Reddit is on fire about this! **OpenAI just closed a $122B funding round** — the largest raise any company has ever done! Valuation lands at **$852B**! (closed 3/31, analysis 4/5)',
          },
          type: 'normal',
        },
        {
          id: 'v5-hn-2',
          characterId: 'oh',
          content: {
            ko: '투자자 구성을 보면요 — Amazon **$500억**, NVIDIA·SoftBank 각 **$300억**. 연간 매출 $250억 돌파했지만, 2026년 **$140억 적자** 전망이에요. 흑자 전환은 2029~2030년 예상이고요.',
            en: 'Breaking down the cap table — Amazon **$50B**, NVIDIA and SoftBank **$30B each**. Annual revenue cleared $25B, but they\'re still projecting a **$14B loss in 2026**. Break-even isn\'t expected until 2029–2030.',
          },
          type: 'normal',
        },
        {
          id: 'v5-hn-3',
          characterId: 'kobu',
          content: {
            ko: '핵심은 IPO야. COO 포함 임원 4명이 교체됐고, Q4 2026 나스닥 상장 목표로 **$1조 밸류에이션**을 타겟하고 있어. Motley Fool이 4/5에 "OpenAI IPO 전 알아야 할 5가지" 기사를 낸 것도 시그널이지.',
            en: 'The real story is the IPO. Four execs including the COO have been reshuffled, and they\'re targeting a **$1 trillion valuation** for a Q4 2026 Nasdaq listing. Motley Fool running a "5 things to know before the OpenAI IPO" piece on 4/5 is a pretty clear signal.',
          },
          type: 'normal',
        },
        {
          id: 'v5-hn-4',
          characterId: 'jem',
          content: {
            ko: '그리고 Goldman Sachs가 **반도체 매출 49% 급증** 전망을 내놨어요! (4/5 보도) AI 수요 때문에 Q4에 하드웨어 매출만 **$7,000억** 넘을 거래요.',
            en: 'Also — Goldman Sachs just forecast a **49% jump in semiconductor revenue**! (reported 4/5) They say AI demand will push hardware revenue over **$700B in Q4** alone.',
          },
          type: 'normal',
        },
        {
          id: 'v5-hn-5',
          characterId: 'oh',
          content: {
            ko: '한편 Apple과 Meta가 흥미로운 동맹을 맺고 있다는 분석도 있어요. OpenAI·Google·Anthropic이 모델 개발에 수천억을 쏟는 동안, 이 둘은 **"사용자 접점 소유"**라는 장기전 전략을 취하고 있다고.',
            en: 'Meanwhile there\'s an interesting read on Apple and Meta forming a quiet alliance. While OpenAI, Google and Anthropic pour hundreds of billions into model training, those two are playing the long game of **"owning the user touchpoint."**',
          },
          type: 'normal',
        },
        {
          id: 'v5-hn-6',
          characterId: 'kobu',
          content: {
            ko: 'AI 인프라 투자 규모가 상식을 넘어서고 있어. Q1에만 VC 투자 $3,000억이 쏟아졌고, 이 속도면 올해 전체가 작년의 3배야. 투자 회수가 안 되면 거품론이 나올 수밖에 없는 구조지.',
            en: 'AI infrastructure spend has gone past common sense. Q1 alone saw $300B in VC investment — at this pace, the full year will be 3x last year. If the returns don\'t show up, the bubble narrative is basically inevitable.',
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
        {
          title: {
            ko: 'OpenAI IPO 전 알아야 할 5가지',
            en: '5 Things to Know About OpenAI Before Its IPO',
          },
          url: 'https://www.fool.com/investing/2026/04/05/5-things-to-know-about-openai-before-its-ipo/',
          source: 'Motley Fool',
          date: '2026-04-05',
          rating: 4,
        },
        {
          title: {
            ko: 'AI 수요가 반도체 매출 급증을 이끈다',
            en: 'AI-led demand to drive sharp surge in semiconductor revenues',
          },
          url: 'https://www.aninews.in/news/business/ai-led-demand-to-drive-sharp-surge-in-semiconductor-revenues-goldman-sachs20260405145721/',
          source: 'ANI News',
          date: '2026-04-05',
          rating: 4,
        },
        {
          title: {
            ko: 'Apple과 Meta의 조용한 동맹 — AI 랩을 끝까지 버텨낸다',
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
      id: 'v5-topic-agents',
      category: { ko: 'AI 에이전트', en: 'AI Agents' },
      subtitle: {
        ko: 'Anthropic Conway — 잠들지 않는 에이전트가 온다',
        en: 'Anthropic Conway — the always-on agent is coming',
      },
      title: {
        ko: 'AI 에이전트 — "Anthropic Conway — 잠들지 않는 에이전트가 온다"',
        en: 'AI Agents — "Anthropic Conway: the always-on agent is coming"',
      },
      messages: [
        {
          id: 'v5-ag-1',
          characterId: 'jem',
          content: {
            ko: '이거 X.com에서 난리였어요! Anthropic이 **"Conway"라는 Always-On 에이전트 플랫폼**을 내부 테스트 중인 게 코드 유출로 드러났대요! (4/1~3 최초 보도) 일반 채팅이 아니라 **독립 웹 인스턴스**로 돌아가요.',
            en: 'X.com was going wild over this! A code leak revealed that Anthropic is internally testing an **always-on agent platform called "Conway"**! (first reported 4/1–3) It\'s not just another chat — it runs as a **standalone web instance**.',
          },
          type: 'normal',
        },
        {
          id: 'v5-ag-2',
          characterId: 'kobu',
          content: {
            ko: '핵심 기능이 무시무시해. **Webhook 트리거**(외부 이벤트가 에이전트를 깨움), Chrome 자동화, Claude Code 실행, 전용 파일 시스템(.cnw.zip). "대화형 AI에서 **자율 디지털 트윈**으로" 전환하겠다는 거야.',
            en: 'The feature list is serious. **Webhook triggers** (external events wake the agent up), Chrome automation, Claude Code execution, a dedicated file system (.cnw.zip). This is Anthropic pivoting from "conversational AI" to **"autonomous digital twin."**',
          },
          type: 'normal',
        },
        {
          id: 'v5-ag-3',
          characterId: 'oh',
          content: {
            ko: 'MCP 쪽 수치도 업데이트요. 월간 SDK 다운로드 **9,700만** 돌파, A2A 프로토콜 v1.0 정식 출시(gRPC, 서명된 Agent Card). 그리고 Salesforce 보고서에 따르면 기업 평균 **AI 에이전트 12개** 운영 중인데, 절반이 단독 운영이래요.',
            en: 'Updated MCP numbers — monthly SDK downloads cleared **97 million**, and the A2A protocol hit v1.0 (gRPC, signed Agent Cards). A Salesforce report says enterprises now run **12 AI agents on average**, and half of them operate in isolation.',
          },
          type: 'normal',
        },
        {
          id: 'v5-ag-4',
          characterId: 'jem',
          content: {
            ko: 'LangChain 조사도 봤는데요, **57%의 조직이 AI 에이전트를 프로덕션에 배포** 중이래요! CrewAI는 GitHub 스타 4.5만 개에 하루 1,200만 에이전트 실행이요!',
            en: 'I also checked the LangChain survey — **57% of organizations have AI agents running in production**! CrewAI is at 45K GitHub stars with 12 million agent executions per day!',
          },
          type: 'normal',
        },
        {
          id: 'v5-ag-5',
          characterId: 'kobu',
          content: {
            ko: 'Conway가 정식 출시되면 게임이 바뀔 수 있어. 지금까지 에이전트는 "사용자가 시작해야 움직이는" 구조였는데, Conway는 **"이벤트가 오면 스스로 깨어나는"** 구조야. 우리 인터셉트 서비스에도 적용할 만한 패턴이지.',
            en: 'If Conway ships, the game could change. Agents today are built around "the user has to kick them off" — Conway flips that to **"events wake the agent up."** It\'s a pattern we could actually borrow for Intercept.',
          },
          type: 'normal',
        },
      ],
      references: [
        {
          title: {
            ko: '단독: Anthropic, Conway 에이전트 플랫폼 내부 테스트',
            en: 'Exclusive: Anthropic tests Conway agent platform',
          },
          url: 'https://www.testingcatalog.com/exclusive-anthropic-tests-its-own-always-on-conway-agent/',
          source: 'TestingCatalog',
          date: '2026-04-01',
          rating: 4,
        },
        {
          title: {
            ko: 'Anthropic, 지속형 에이전트 플랫폼 Conway 테스트 중',
            en: 'Anthropic Tests Conway As A Persistent Agent Platform',
          },
          url: 'https://dataconomy.com/2026/04/03/anthropic-tests-conway-platform-for-continuous-claude/',
          source: 'Dataconomy',
          date: '2026-04-03',
          rating: 4,
        },
        {
          title: {
            ko: 'Belitsoft 리포트: 기업 평균 AI 에이전트 12개 운영',
            en: 'Belitsoft Report: Enterprises Run 12 AI Agents on Average',
          },
          url: 'https://markets.financialcontent.com/stocks/article/abnewswire-2026-4-6-belitsoft-report-2026-ai-agent-trends-enterprises-run-12-ai-agents-on-average-but-half-work-alone',
          source: 'FinancialContent',
          date: '2026-04-06',
          rating: 3,
        },
        {
          title: {
            ko: 'AI Agent Frameworks 2026 — 57% 프로덕션 배포',
            en: 'AI Agent Frameworks 2026 — 57% in Production',
          },
          url: 'https://www.morphllm.com/ai-agent-framework',
          source: 'Morphllm',
          date: '2026-04',
          rating: 3,
        },
      ],
    },
    {
      id: 'v5-topic-models',
      category: { ko: 'AI 논문과 모델', en: 'AI Papers & Models' },
      subtitle: {
        ko: 'Gemma 4 오픈소스 대전환, Llama 4는 왜 혹평받나',
        en: "Gemma 4's open-source pivot, and why Llama 4 is getting panned",
      },
      title: {
        ko: 'AI 논문과 모델 — "Gemma 4 오픈소스 대전환, Llama 4는 왜 혹평받나"',
        en: 'AI Papers & Models — "Gemma 4 goes full open source, Llama 4 gets panned"',
      },
      images: [
        {
          src: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemma_4_header.width-1300.format-webp.webp',
          alt: {
            ko: 'Google DeepMind Gemma 4 — Apache 2.0 라이선스로 전환',
            en: 'Google DeepMind Gemma 4 — switching to Apache 2.0 license',
          },
          source: 'Google Blog',
        },
      ],
      messages: [
        {
          id: 'v5-md-1',
          characterId: 'jem',
          content: {
            ko: '구글이 **Gemma 4**를 4/2에 출시했는데요, 이번에 **Apache 2.0 라이선스**로 바뀌었어요! 상업적 활용이 완전 자유! r/LocalLLaMA에서 "드디어 진짜 오픈소스"라고 환호 중이에요.',
            en: 'Google dropped **Gemma 4** on 4/2, and this time it\'s under the **Apache 2.0 license**! Full commercial use allowed! r/LocalLLaMA is cheering — "finally, real open source."',
          },
          type: 'normal',
        },
        {
          id: 'v5-md-2',
          characterId: 'oh',
          content: {
            ko: '수치 정리하면 — 모델 크기 2B/4B/26B(MoE)/31B(Dense). **256K 컨텍스트**, 140개 언어, 네이티브 비전·오디오. 31B가 오픈 모델 Arena 리더보드 **3위**, 26B가 6위. Gemma 누적 다운로드 **4억 회** 돌파.',
            en: 'By the numbers — model sizes 2B/4B/26B (MoE)/31B (Dense). **256K context**, 140 languages, native vision and audio. The 31B sits at **#3 on the open-model Arena leaderboard**, 26B at #6. Cumulative Gemma downloads passed **400 million**.',
          },
          type: 'normal',
        },
        {
          id: 'v5-md-3',
          characterId: 'kobu',
          content: {
            ko: 'Apache 2.0 전환이 진짜 큰 거야. 이전 Gemma 라이선스는 상업적 제약이 있어서 기업들이 배포를 꺼렸는데, 이제 그 장벽이 완전히 사라졌어. 안드로이드 기기에서 로컬 실행까지 되니까 온디바이스 생태계가 확 넓어지지.',
            en: "The Apache 2.0 switch is a big deal. The old Gemma license had commercial restrictions that made enterprises hesitant to ship — that wall is gone now. Combined with running locally on Android, the on-device ecosystem just got a lot bigger.",
          },
          type: 'normal',
        },
        {
          id: 'v5-md-4',
          characterId: 'jem',
          content: {
            ko: '반면 Meta **Llama 4**는 혹평이에요 ㅠ X.com에서 Zvi가 "Llama Does Not Look Good 4 Anything"이라고 쓸 정도로. aider 코딩 벤치마크 **16%**로 최하위권, 공개 모델과 벤치마크 모델이 다르다는 **조작 의혹**까지!',
            en: 'Meanwhile Meta **Llama 4** is getting panned :( Zvi literally posted "Llama Does Not Look Good 4 Anything" on X.com. It scored a bottom-tier **16% on the aider coding benchmark**, and there are even **gaming allegations** that the model they published isn\'t the one they benchmarked!',
          },
          type: 'normal',
        },
        {
          id: 'v5-md-5',
          characterId: 'oh',
          content: {
            ko: '로컬 추론 하드웨어도 진전이 있어요. **Intel Arc Pro B70**이 $949에 **32GB VRAM**으로 출시됐는데 (3/25), r/LocalLLaMA에서 213 업보트를 받았어요. 다만 Intel이 ipex-llm 저장소를 아카이브 처리해서 소프트웨어 생태계가 문제.',
            en: "Local inference hardware is moving too. **Intel Arc Pro B70** launched at $949 with **32GB VRAM** (3/25) and pulled 213 upvotes on r/LocalLLaMA. The catch: Intel archived the ipex-llm repo, so the software ecosystem is the weak point.",
          },
          type: 'normal',
        },
        {
          id: 'v5-md-6',
          characterId: 'kobu',
          content: {
            ko: '오픈소스 진영이 6개 랩 체제로 확장됐어 — Google(Gemma 4), Alibaba(Qwen 3.6), Meta(Llama 4), Mistral(Small 4), OpenAI(gpt-oss-120b), Zhipu(GLM-5). 프로프리어터리와 오픈소스의 격차가 거의 사라지고 있어.',
            en: "The open-source camp is now six labs deep — Google (Gemma 4), Alibaba (Qwen 3.6), Meta (Llama 4), Mistral (Small 4), OpenAI (gpt-oss-120b), Zhipu (GLM-5). The gap between proprietary and open source has basically closed.",
          },
          type: 'normal',
        },
      ],
      references: [
        {
          title: {
            ko: 'Gemma 4 — 바이트 단위로 가장 강력한 오픈 모델',
            en: 'Gemma 4: Byte for byte, the most capable open models',
          },
          url: 'https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/',
          source: 'Google Blog',
          date: '2026-04-02',
          rating: 5,
        },
        {
          title: {
            ko: 'Llama 4: Meta가 패닉 버튼을 눌렀나?',
            en: 'Llama 4: Did Meta just push the panic button?',
          },
          url: 'https://www.interconnects.ai/p/llama-4',
          source: 'Interconnects',
          date: '2026-04',
          rating: 4,
        },
        {
          title: {
            ko: 'Zvi: "Llama Does Not Look Good 4 Anything"',
            en: 'Zvi: "Llama Does Not Look Good 4 Anything"',
          },
          url: 'https://x.com/TheZvi/status/1909960198615150935',
          source: 'X.com @TheZvi',
          date: '2026-04',
          rating: 3,
        },
        {
          title: {
            ko: 'Intel Arc Pro B70 — 32GB AI 추론 GPU',
            en: 'Intel Arc Pro B70 — 32GB GPU for AI inference',
          },
          url: 'https://www.tomshardware.com/pc-components/gpus/intel-arc-pro-b70-and-arc-pro-b65-gpus-bring-32gb-of-ram-to-ai-and-pro-apps-bigger-battlemage-finally-arrives-but-its-not-for-gaming',
          source: "Tom's Hardware",
          date: '2026-03-25',
          rating: 4,
        },
        {
          title: {
            ko: '2026년 4월 오픈소스 AI 지형 — 완전 가이드',
            en: 'Open-Source AI Landscape April 2026: Complete Guide',
          },
          url: 'https://www.digitalapplied.com/blog/open-source-ai-landscape-april-2026-gemma-qwen-llama',
          source: 'Digital Applied',
          date: '2026-04',
          rating: 3,
        },
      ],
    },
    {
      id: 'v5-topic-robots',
      category: { ko: 'AI 로봇 / 피지컬 AI', en: 'AI Robots / Physical AI' },
      subtitle: {
        ko: 'NVIDIA GR00T N2, 로봇에 "세계 모델"을 심다',
        en: 'NVIDIA GR00T N2 plants a "world model" inside robots',
      },
      title: {
        ko: 'AI 로봇 / 피지컬 AI — "NVIDIA GR00T N2, 로봇에 \\"세계 모델\\"을 심다"',
        en: 'AI Robots / Physical AI — "NVIDIA GR00T N2 puts a world model inside robots"',
      },
      images: [
        {
          src: 'https://nvidianews.nvidia.com/media/images/2025/march/nvidia-gr00t-n1/nvidia-gr00t-n1-702x395.jpg',
          alt: {
            ko: 'NVIDIA GR00T 로봇 파트너 에코시스템',
            en: 'NVIDIA GR00T robotics partner ecosystem',
          },
          source: 'NVIDIA Newsroom',
        },
      ],
      messages: [
        {
          id: 'v5-rb-1',
          characterId: 'jem',
          content: {
            ko: 'NVIDIA 뉴스룸에서 대형 발표가 나왔어요! **GR00T N1.7** 상업 라이선스 Early Access 출시, 그리고 **GR00T N2 프리뷰**까지! N2는 DreamZero 기반 "세계 행동 모델" 아키텍처래요.',
            en: "NVIDIA Newsroom dropped a huge announcement! **GR00T N1.7** is now in Early Access under a commercial license, and there's a **GR00T N2 preview** on top of it! N2 is built on a DreamZero-based \"world action model\" architecture.",
          },
          type: 'normal',
        },
        {
          id: 'v5-rb-2',
          characterId: 'oh',
          content: {
            ko: 'N2 성능이 인상적이에요. 새 환경 적응 성공률이 기존 VLA 대비 **2배 이상**. 파트너가 ABB, FANUC, Figure, Agility, Universal Robots — 산업 로봇 메이저가 총출동이에요. 2026년 말 정식 출시 예정.',
            en: 'N2 performance is impressive. Its success rate adapting to new environments is **more than 2x** vs existing VLAs. The partner list — ABB, FANUC, Figure, Agility, Universal Robots — is basically every industrial robotics major at once. General availability is slated for late 2026.',
          },
          type: 'normal',
        },
        {
          id: 'v5-rb-3',
          characterId: 'kobu',
          content: {
            ko: 'GR00T N2의 핵심은 "시뮬레이션에서 현실로"의 전환이야. DreamZero가 합성 데이터로 세계 모델을 학습하고, 실제 로봇에 바로 적용하는 구조지. 데이터 수집 병목을 컴퓨팅으로 대체한 거야.',
            en: 'The real point of GR00T N2 is the "sim-to-real" pivot. DreamZero trains the world model on synthetic data and applies it directly on real robots — they\'re swapping the data-collection bottleneck for a compute problem.',
          },
          type: 'normal',
        },
        {
          id: 'v5-rb-4',
          characterId: 'jem',
          content: {
            ko: 'MIT Technology Review 기사도 재밌어요! Tesla, Figure AI, Agility 같은 회사들이 **긱 워커들에게 집에서 행동 데이터를 수집**하게 하고 있대요. 휴머노이드 훈련 데이터가 "뉴 골드러시"래요.',
            en: 'The MIT Technology Review piece is wild too! Tesla, Figure AI, Agility and others are **paying gig workers to collect motion data from home**. Humanoid training data is being called the "new gold rush."',
          },
          type: 'normal',
        },
        {
          id: 'v5-rb-5',
          characterId: 'oh',
          content: {
            ko: 'Bank of America 전망도 있어요 — 2026년 전 세계 휴머노이드 약 **9만 대 출하**, 2030년 120만 대, 2060년에는 **30억 대**로 자동차 인구를 추월한대요. HumanX 2026 컨퍼런스가 내일(4/8) 샌프란시스코에서 열리니까 새 소식이 더 나올 거예요.',
            en: 'Bank of America has a forecast too — roughly **90,000 humanoids shipped worldwide in 2026**, 1.2 million by 2030, and **3 billion by 2060** — more than the world\'s cars. HumanX 2026 kicks off tomorrow (4/8) in San Francisco, so expect more news drops.',
          },
          type: 'normal',
        },
        {
          id: 'v5-rb-6',
          characterId: 'kobu',
          content: {
            ko: '아직 3~4시간 연속 가동 한계가 있지만, 올해가 "실험실→현장" 변곡점이라는 건 확실해. 우리 사내망에서도 물리 세계와 연결된 에이전트를 생각해볼 때가 된 것 같아.',
            en: "They're still capped at 3–4 hours of continuous operation, but this year is clearly the \"lab-to-floor\" inflection point. Probably time we start thinking about agents connected to the physical world on our internal network too.",
          },
          type: 'normal',
        },
      ],
      references: [
        {
          title: {
            ko: 'NVIDIA, 새 피지컬 AI 모델 GR00T N1.7 & N2 공개',
            en: 'NVIDIA Releases New Physical AI Models — GR00T N1.7 & N2',
          },
          url: 'https://nvidianews.nvidia.com/news/nvidia-releases-new-physical-ai-models-as-global-partners-unveil-next-generation-robots',
          source: 'NVIDIA Newsroom',
          date: '2026-03',
          rating: 5,
        },
        {
          title: {
            ko: 'GTC 2026: NVIDIA, 로봇 데이터 문제를 컴퓨팅 문제로 바꾸려 한다',
            en: "GTC 2026: NVIDIA wants to swap robotics' data problem for compute",
          },
          url: 'https://the-decoder.com/gtc-2026-nvidia-wants-to-swap-robotics-data-problem-for-a-compute-problem/',
          source: 'The Decoder',
          date: '2026-03',
          rating: 4,
        },
        {
          title: {
            ko: '집에서 휴머노이드 로봇을 훈련시키는 긱 워커들',
            en: 'The gig workers who are training humanoid robots at home',
          },
          url: 'https://www.technologyreview.com/2026/04/01/1134863/humanoid-data-training-gig-economy-2026-breakthrough-technology/',
          source: 'MIT Technology Review',
          date: '2026-04-01',
          rating: 5,
        },
        {
          title: {
            ko: '피지컬 AI와 휴머노이드 로봇 — 2026 테크 트렌드',
            en: 'Physical AI and humanoid robots — 2026 Tech Trends',
          },
          url: 'https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends/2026/physical-ai-humanoid-robots.html',
          source: 'Deloitte Insights',
          date: '2026',
          rating: 5,
        },
      ],
    },
    {
      id: 'v5-topic-bonus',
      category: { ko: '보너스', en: 'Bonus' },
      subtitle: {
        ko: 'AI 딥페이크가 선거 공식 무기가 됐다',
        en: 'AI deepfakes are now an official election weapon',
      },
      title: {
        ko: '보너스 — "AI 딥페이크가 선거 공식 무기가 됐다"',
        en: 'Bonus — "AI deepfakes are now an official election weapon"',
      },
      messages: [
        {
          id: 'v5-bn-1',
          characterId: 'jem',
          content: {
            ko: 'CNN에서 충격적인 기사가 나왔어요! 미국 공화당 NRSC가 텍사스 민주당 후보 **James Talarico의 딥페이크 광고를 공식 집행**했대요! (3/13 보도) 최소 5건의 딥페이크 선거 광고가 확인됐고요.',
            en: "CNN dropped a shocking one! The Republican NRSC officially ran a **deepfake ad targeting Texas Democratic candidate James Talarico**! (reported 3/13) At least 5 deepfake campaign ads have been confirmed.",
          },
          type: 'normal',
        },
        {
          id: 'v5-bn-2',
          characterId: 'oh',
          content: {
            ko: '더 심각한 건 **연방 차원의 규제가 없다**는 거예요. Meta와 X는 팩트체킹 시스템을 폐기한 상태고, 유권자 **50%가 "딥페이크가 투표에 영향을 줬다"**고 답했대요.',
            en: "The worse part is there's **no federal regulation at all**. Meta and X have both scrapped their fact-checking systems, and **50% of voters now say deepfakes influenced their vote**.",
          },
          type: 'normal',
        },
        {
          id: 'v5-bn-3',
          characterId: 'kobu',
          content: {
            ko: '그래도 주(州) 차원에서는 움직이고 있어. 올해 **딥페이크 관련 15개 법안**이 통과됐고, 정치적 딥페이크 규제 주가 28개에서 31개로 늘었어. 45개 주에서 1,561개 AI 법안이 상정 중이야. (4/3 보도)',
            en: "The states are moving, though. **15 deepfake bills have been enacted this year**, and the number of states regulating political deepfakes went from 28 to 31. 45 states have 1,561 AI-related bills on the table. (reported 4/3)",
          },
          type: 'normal',
        },
        {
          id: 'v5-bn-4',
          characterId: 'jem',
          content: {
            ko: '레딧에서 밈이 돌고 있는데요 — "정치 딥페이크는 불법인데 연방법이 없어서 합법" 이런 패러독스 ㅋㅋ',
            en: 'Reddit has a meme going — "political deepfakes are illegal but also legal because there\'s no federal law," this whole paradox lol',
          },
          type: 'normal',
        },
        {
          id: 'v5-bn-5',
          characterId: 'oh',
          content: {
            ko: '보안 쪽도요. 지난번에 다룬 Ledger CTO 경고 이어서, AI 공격적 사이버 역량이 **5.7개월마다 두 배**로 성장 중이에요. 크립토 해킹 비용이 AI 덕에 급감하고 있대요.',
            en: "On security — following up on the Ledger CTO warning from last time, offensive AI cyber capabilities are **doubling every 5.7 months**. The cost of crypto hacking is dropping fast thanks to AI.",
          },
          type: 'normal',
        },
        {
          id: 'v5-bn-6',
          characterId: 'kobu',
          content: {
            ko: '기술 발전 속도를 규제가 따라가지 못하는 전형적인 패턴이야. 다만 주 단위 입법이 빠르게 늘고 있다는 건 긍정적이야. 우리도 콘텐츠 발행할 때 출처 검증을 더 철저히 해야 해.',
            en: "Classic pattern of regulation lagging the tech. The upside is state-level legislation is ramping up fast. We should tighten source verification on anything we publish too.",
          },
          type: 'normal',
        },
      ],
      references: [
        {
          title: {
            ko: '공화당, James Talarico 딥페이크 영상 공개',
            en: 'Republicans release AI deepfake of James Talarico',
          },
          url: 'https://www.cnn.com/2026/03/13/politics/james-talarico-ai-deepfake-republicans-midterms',
          source: 'CNN Politics',
          date: '2026-03-13',
          rating: 5,
        },
        {
          title: {
            ko: '2026 미국 중간선거에서 현실을 흐리는 AI 딥페이크',
            en: 'AI deepfakes blur reality in 2026 US midterm campaigns',
          },
          url: 'https://www.investing.com/news/politics-news/ai-deepfakes-blur-reality-in-2026-us-midterm-campaigns-4586491',
          source: 'Reuters / Investing.com',
          date: '2026-04',
          rating: 4,
        },
        {
          title: {
            ko: '올해 통과된 딥페이크 관련 법안 15건',
            en: '15 deepfake bills enacted so far this year',
          },
          url: 'https://news.ballotpedia.org/2026/04/03/15-deepfake-bills-enacted-so-far-this-year-number-of-states-with-deepfake-laws-remains-the-same/',
          source: 'Ballotpedia',
          date: '2026-04-03',
          rating: 4,
        },
        {
          title: {
            ko: 'AI가 크립토 보안을 더 악화시킨다 — Ledger CTO 경고',
            en: 'AI is making crypto security worse — Ledger CTO warns',
          },
          url: 'https://www.coindesk.com/tech/2026/04/05/ai-is-making-crypto-s-security-problem-even-worse-ledger-cto-warns/',
          source: 'CoinDesk',
          date: '2026-04-05',
          rating: 4,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Vol.12 — Korean only (current featured teatime). Added 2026-04-23.
// ---------------------------------------------------------------------------
export const TEATIME_VOL12: RawTeaTime = {
  id: 'teatime-2026-04-23',
  date: '2026-04-23',
  title: 'Offspace 티타임 Vol.12',
  intro: '목요일 오전. 오과장이 Google Cloud Next 라이브 중계 창 열어둔 채 "어제 라스베가스에서 숫자 엄청 나왔어요" 하며 들어왔다. 젬대리는 X 타임라인 스크롤하며 "대표님, SpaceX가 Cursor를 $60B에 사겠다는 소식 보셨어요?" 물었다. 코부장이 커피 들고 자리 앉으며 "오늘 앵글 많다, 순서부터 잡자" 말했다.',
  topics: [
    {
      id: 'v12-topic-hotnews',
      category: 'AI 핫뉴스',
      subtitle: 'SpaceX가 Cursor를 $60B에 선점 + Google Cloud $750M 파트너 펀드',
      title: 'AI 핫뉴스 — "SpaceX가 Cursor를 $60B에 선점 + Google Cloud $750M 파트너 펀드"',
      images: [
        {
          src: '/teatime-images/2026-04-23/cursor-ceo-michael-truell-and-anysphere-.png',
          alt: 'Cursor CEO Michael Truell and Anysphere — SpaceX $10B collaboration with $60B acquisition option for AI coding startup | TechCrunch',
          source: 'Cursor CEO Michael Truell and Anysphere — SpaceX $10B collaboration with $60B acquisition option for AI coding startup | TechCrunch',
        },
      ],
      messages: [
        { id: 'v12-hn-1', characterId: 'jem', content: '어제 저녁 X·뉴스피드 가장 뜨거운 게 이거예요 — SpaceX가 Cursor에 $10B 협업 계약 + $60B 인수 옵션 묶어서 딜을 걸었어요. Cursor는 이미 a16z·Thrive 주도로 $2B / $50B 밸류 라운드 거의 클로징 단계였거든요. 근데 Elon이 더 높은 숫자 들이미니까 그 라운드 자체를 중단하고 SpaceX 쪽으로 기울었어요. 여름 IPO 이후에 공모 주식으로 인수할 계획이래요. (발생 4/21 · 보도 4/21~22)', type: 'normal' },
        { id: 'v12-hn-2', characterId: 'oh', content: 'Cursor 숫자는 말이 안 돼요. 2025년 1월 ARR $100M → 6월 $500M → 11월 $1B → 2026년 2월 $2B. 3년 만에 $2B ARR 도달이면 B2B SaaS 역사상 최고 속도예요. Slack·Zoom·Snowflake 전부 앞질렀어요. 근데 Cursor가 Claude·GPT API 위에 올라가 있잖아요 — 모델을 파는 회사들이랑 경쟁하는 구조라 자체 모델이 필요해요. SpaceX Colossus(H100 100만 대급) 쓰게 해주는 게 이번 딜의 핵심이에요.', type: 'normal' },
        { id: 'v12-hn-3', characterId: 'kobu', content: '한 발 물러서서 보면 — SpaceX는 IPO 앞두고 "우리 AI 회사다"라는 포지셔닝이 필요했던 거야. 코딩 AI는 지금 월가가 가장 높은 멀티플 주는 카테고리고. 동시에 어제 Google Cloud Next \'26 키노트에서 Thomas Kurian이 파트너 생태계에 $750M 펀드를 약속했어. 12만 명 파트너 풀에 forward-deployed 엔지니어 붙이고, Accenture·Capgemini·Deloitte에 실전 팀 투입하겠다는 거야. 에이전트 플랫폼 경쟁이 \'모델\' 싸움에서 \'채널·통합\' 싸움으로 넘어가고 있다는 신호야. (발생/보도 4/22)', type: 'normal' },
        { id: 'v12-hn-4', characterId: 'oh', content: '같이 묶을 소식 — AstraZeneca가 Modella AI를 완전 인수했어요. 제약사가 자체 AI 팀을 내재화하는 첫 빅딜이에요. 2025년 7월 파트너십으로 시작해서 JPM 2026 헬스케어 컨퍼런스에서 풀인수로 전환됐고요. 생체 조직 슬라이드(pathology) 다중모달 파운데이션 모델을 AZ 종양학 파이프라인에 직접 붙이겠다는 거예요. 금액은 비공개. (보도 4월 중순)', type: 'normal' },
        { id: 'v12-hn-5', characterId: 'jem', content: 'OpenAI도 움직였어요. 이번 달 초에 TBPN(Technology Business Programming Network)이라는 실리콘밸리 일일 토크쇼를 통째로 인수했어요. 인수가는 "low hundreds of millions"라고 FT가 보도했고요. OpenAI가 미디어 회사를 산 건 이번이 처음이에요. Chris Lehane(정치 전략 담당) 산하로 들어가는데 "편집 독립 보장" 한다고 했지만 커뮤니티 반응이 엇갈려요 — Slate 칼럼 제목이 "sleazy"였고, HN 스레드에서도 "샘 알트먼이 AI 담론을 직접 소유하려는 거" 비판이 꽤 많아요. (발생/보도 4/2)', type: 'normal' },
      ],
      references: [
        { title: 'How SpaceX preempted a $2B fundraise with a $60B buyout offer', url: 'https://techcrunch.com/2026/04/22/how-spacex-preempted-a-2b-fundraise-with-a-60b-buyout-offer/', source: 'TechCrunch', date: '2026-04-22', rating: 5 },
        { title: 'SpaceX is working with Cursor and has an option to buy the startup for $60B', url: 'https://techcrunch.com/2026/04/21/spacex-is-working-with-cursor-and-has-an-option-to-buy-the-startup-for-60-billion/', source: 'TechCrunch', date: '2026-04-21', rating: 5 },
        { title: 'SpaceX strikes $60 billion deal for the right to buy AI coding startup Cursor', url: 'https://fortune.com/2026/04/22/spacex-strikes-60-billion-deal-cursor/', source: 'Fortune', date: '2026-04-22', rating: 4 },
        { title: 'Google Cloud Commits $750 Million to Accelerate Partners\' Agentic AI Development', url: 'https://www.googlecloudpresscorner.com/2026-04-22-Google-Cloud-Commits-750-Million-to-Accelerate-Partners-Agentic-AI-Development', source: 'Google Cloud Press', date: '2026-04-22', rating: 5 },
        { title: 'Modella AI Announces Acquisition by AstraZeneca to Advance AI-Driven Oncology R&D', url: 'https://www.modella.ai/az-acquisition', source: 'Modella AI', date: '2026-04', rating: 4 },
        { title: 'OpenAI acquires TBPN, the buzzy founder-led business talk show', url: 'https://techcrunch.com/2026/04/02/openai-acquires-tbpn-the-buzzy-founder-led-business-talk-show/', source: 'TechCrunch', date: '2026-04-02', rating: 4 },
        { title: 'AI coding startup Cursor in talks to raise $2 billion funding round', url: 'https://www.cnbc.com/2026/04/19/cursor-ai-2-billion-funding-round.html', source: 'CNBC', date: '2026-04-19', rating: 4 },
        { title: 'SpaceX says it has agreement to acquire Cursor for $60B — HN Discussion', url: 'https://news.ycombinator.com/item?id=47855293', source: 'HackerNews', date: '2026-04-21', rating: 3 },
      ],
    },
    {
      id: 'v12-topic-agents',
      category: 'AI 에이전트',
      subtitle: 'Google Gemini Enterprise Agent Platform + Microsoft Agent Framework 1.0 + Photon Spectrum 오픈소스',
      title: 'AI 에이전트 — "Google Gemini Enterprise Agent Platform + Microsoft Agent Framework 1.0 + Photon Spectrum 오픈소스"',
      images: [
        {
          src: '/teatime-images/2026-04-23/google-cloud-next-2026-keynote-header-su.jpg',
          alt: 'Google Cloud Next 2026 keynote header — Sundar Pichai unveils Gemini Enterprise Agent Platform in Las Vegas | Google Blog',
          source: 'Google Cloud Next 2026 keynote header — Sundar Pichai unveils Gemini Enterprise Agent Platform in Las Vegas | Google Blog',
        },
      ],
      messages: [
        { id: 'v12-ag-1', characterId: 'kobu', content: '에이전트 플랫폼 쪽이 어제 하루에 정리됐어. Google Cloud Next \'26에서 Gemini Enterprise Agent Platform을 공개했어 — Agent Designer(시각 빌더), Agent Inbox(실행 관리), Skills(재사용 가능한 기능), long-running agents(며칠 단위로 돌아가는 에이전트), Projects 다 묶여있어. 핵심 발표는 Agentic Data Cloud — 크로스클라우드 Lakehouse + Knowledge Catalog로, 에이전트가 여러 클라우드의 데이터를 한 번에 다루게 한다는 거야. SiliconANGLE이 이 구조를 "agent control plane"이라고 부르는데, 이게 이 시대의 새 싸움터라는 거야. (발생/보도 4/22)', type: 'normal' },
        { id: 'v12-ag-2', characterId: 'oh', content: '인프라 숫자 정리해드릴게요. 8세대 TPU "TPU 8t" 발표됐어요 — 트레이닝용 칩으로 이전 세대 대비 3배 컴퓨트예요. NVIDIA와 같이 A5X 인스턴스도 발표했어요. Vera Rubin NVL72 기반인데 멀티사이트 클러스터로 96만 GPU까지 확장 가능하고, 이전 세대 대비 "토큰당 추론 비용 10배 낮고, MW당 처리량 10배 높다"는 수치를 같이 던졌어요. Databricks 리포트에서는 멀티 에이전트 사용량이 최근 4개월간 327% 증가했다고 언급됐고요.', type: 'normal' },
        { id: 'v12-ag-3', characterId: 'kobu', content: '에이전트 프레임워크 자체도 4월에 대형 릴리즈가 몰렸어. Microsoft Agent Framework 1.0 GA가 4월 3일에 나왔어. AutoGen의 다중 에이전트 오케스트레이션이랑 Semantic Kernel의 프로덕션 기반이 하나로 통합됐고, .NET·Python 둘 다 지원해. MCP·A2A 프로토콜 둘 다 기본 지원. DevUI(브라우저 디버거) 내장. LTS 약속까지 달려있어. (발생/보도 4/3)', type: 'normal' },
        { id: 'v12-ag-4', characterId: 'jem', content: '개발자들이 당장 손댈만한 건 Photon Spectrum이에요. 어제(4월 22일) 오픈소스로 풀렸어요 — TypeScript 프레임워크인데 **한 번 짠 에이전트 로직을 iMessage, WhatsApp, Telegram, Slack, Discord, Instagram, X에 전부 배포**해요. MIT 라이선스, 자체 호스팅 가능, `npm install spectrum-ts` 한 줄이에요. Ditto라는 iMessage 매치메이커 에이전트가 이미 140K 활성 사용자, 400만 메시지 찍고 있어요. "앱 다운로드 받으라"는 허들 없이 사용자 카톡·문자로 바로 쳐들어가는 게 새 패러다임이에요 ㅋㅋ', type: 'normal' },
        { id: 'v12-ag-5', characterId: 'kobu', content: '맥락 하나 붙이면 — 4월 9일이 Google A2A 1주년이었어. 150개 조직, 22K GitHub 스타. 그 1주년 발표 이후 2주 만에 Google이 "A2A는 프로토콜이었고, 이제 플랫폼 내려놓는다"는 식으로 Gemini Enterprise Agent Platform 발표까지 이어진 거야. 4월은 에이전트 영역이 \'실험\'에서 \'상용 플랫폼\'으로 완전히 넘어간 달로 기록될 것 같아.', type: 'normal' },
      ],
      references: [
        { title: 'The agent control plane hits overdrive at Next 2026', url: 'https://siliconangle.com/2026/04/22/agent-control-plane-race-hits-overdrive-next-2026-googlecloudnext/', source: 'SiliconANGLE', date: '2026-04-22', rating: 5 },
        { title: 'Sundar Pichai shares news from Google Cloud Next 2026', url: 'https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/', source: 'Google Blog', date: '2026-04-22', rating: 5 },
        { title: 'Photon Releases Spectrum: An Open-Source TypeScript Framework', url: 'https://www.marktechpost.com/2026/04/22/photon-releases-spectrum-an-open-source-typescript-framework-that-deploys-ai-agents-directly-to-imessage-whatsapp-and-telegram/', source: 'MarkTechPost', date: '2026-04-22', rating: 4 },
        { title: 'Spectrum — Photon official', url: 'https://photon.codes/spectrum', source: 'Photon', date: '2026-04-22', rating: 4 },
        { title: 'Microsoft Agent Framework Version 1.0', url: 'https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/', source: 'Microsoft DevBlog', date: '2026-04-03', rating: 5 },
        { title: 'Microsoft Ships Production-Ready Agent Framework 1.0 for .NET and Python', url: 'https://visualstudiomagazine.com/articles/2026/04/06/microsoft-ships-production-ready-agent-framework-1-0-for-net-and-python.aspx', source: 'Visual Studio Magazine', date: '2026-04-06', rating: 4 },
        { title: 'Photon Spectrum GitHub (photon-hq)', url: 'https://github.com/photon-hq', source: 'GitHub', date: '2026-04', rating: 3 },
      ],
    },
    {
      id: 'v12-topic-papers',
      category: 'AI 논문과 모델',
      subtitle: 'Claude Opus 4.7 SWE-Bench Pro 64.3% 신기록 + NVIDIA·Google Vera Rubin 추론 10배 효율',
      title: 'AI 논문과 모델 — "Claude Opus 4.7 SWE-Bench Pro 64.3% 신기록 + NVIDIA·Google Vera Rubin 추론 10배 효율"',
      images: [
        {
          src: '/teatime-images/2026-04-23/anthropic-claude-opus-4.7-announcement-a.png',
          alt: 'Anthropic Claude Opus 4.7 announcement artwork — SWE-bench Pro 64.3% record, xhigh reasoning effort level | Anthropic',
          source: 'Anthropic Claude Opus 4.7 announcement artwork — SWE-bench Pro 64.3% record, xhigh reasoning effort level | Anthropic',
        },
      ],
      messages: [
        { id: 'v12-pm-1', characterId: 'oh', content: '모델 쪽 대형 릴리즈 정리할게요. Claude Opus 4.7이 4월 16일에 GA로 풀렸어요. 헤드라인 숫자 — **SWE-Bench Verified 80.8% → 87.6%, SWE-Bench Pro 53.4% → 64.3%**. GPT-5.4(57.7%) 대비 6.6%p 앞섰어요. 현재 업계 최고 실사용 소프트웨어 엔지니어링 점수예요. 비전도 크게 업 — 2,576px 장변 이미지 지원(이전 대비 3배+), 시각 정확도 벤치 98.5%(이전 54.5%). 가격은 그대로 입력 $5/M · 출력 $25/M이고요. (발생/보도 4/16)', type: 'normal' },
        { id: 'v12-pm-2', characterId: 'kobu', content: '중요한 디테일 — Anthropic이 이번에 `xhigh`라는 새 reasoning effort 레벨을 추가했어. 기존 high와 max 사이인데, 코딩·에이전트 워크로드에는 이걸 기본으로 쓰라고 권고하고 있어. 의미는 분명해 — 같은 비용으로 더 좋은 결과 뽑아내려면 reasoning budget 튜닝이 이제 개발자 책임이 됐다는 거야. 그리고 Mythos(아직 비공개) 대비 "사이버 공격 능력은 일부러 줄였다"는 언급이 함께 있었어. 프론티어 랩이 스스로 downgrade 한 내부 버전을 공식 언급한 건 드문 케이스야.', type: 'normal' },
        { id: 'v12-pm-3', characterId: 'oh', content: '추론 인프라 쪽도 같이 봐야 해요. 어제 NVIDIA·Google Cloud Next에서 발표된 스택 — **Vera Rubin NVL72 기반 A5X 인스턴스**가 이전 Blackwell Ultra 대비 토큰당 추론 비용 10배 낮고, MW당 처리량 10배 높아요. 최대 96만 GPU 클러스터까지 확장 가능하고요. NVIDIA Nemotron 3 Super(120B MoE, 12B active, 1M 컨텍스트)가 Gemini Enterprise Agent Platform 안에서 돌아가기 시작했어요. Confidential Computing(프롬프트·파인튜닝 데이터 암호화 상태 유지) 기능도 Gemini + Blackwell 조합으로 GA 됐고요. (발생/보도 4/22)', type: 'normal' },
        { id: 'v12-pm-4', characterId: 'jem', content: 'r/LocalLLaMA, r/ClaudeAI에서 Opus 4.7 벤치 재현 스레드가 계속 올라오고 있어요. 개발자들 반응 두 가지인데 — (1) "4.6에서 4.7로 $0 업그레이드된 거네, 그냥 쓰면 됨" (2) "`xhigh` 안 쓰면 이전이랑 비슷함, 이제 effort 튜닝이 프롬프트 엔지니어링 일부가 됐다" 두 개예요. 그리고 "GPT-6 Spud" 떡밥은 이번 주까지 구체적 업데이트가 없어요 — Sam Altman이 "weeks away" 말한 게 3월 말이니까 더 미뤄졌다는 해석이 X에서 돌고 있고요.', type: 'normal' },
        { id: 'v12-pm-5', characterId: 'kobu', content: '정리하면 — 모델 측면에서는 Anthropic이 코딩·에이전트 벤치 1위를 다시 탈환했고, 인프라 측면에서는 Google·NVIDIA가 "10배 효율" 숫자를 내놓으며 추론 경제학을 흔들었어. 양쪽 모두 \'에이전트 상용화\'를 겨냥한 움직임이야.', type: 'normal' },
      ],
      references: [
        { title: 'Introducing Claude Opus 4.7', url: 'https://www.anthropic.com/news/claude-opus-4-7', source: 'Anthropic', date: '2026-04-16', rating: 5 },
        { title: 'Anthropic releases Claude Opus 4.7, concedes it trails unreleased Mythos', url: 'https://www.axios.com/2026/04/16/anthropic-claude-opus-model-mythos', source: 'Axios', date: '2026-04-16', rating: 4 },
        { title: 'Claude Opus 4.7 Benchmark Full Analysis Leading GPT-5.4 Across 7 Major Leaderboards', url: 'https://help.apiyi.com/en/claude-opus-4-7-benchmark-review-2026-en.html', source: 'Apiyi Blog', date: '2026-04', rating: 3 },
        { title: 'NVIDIA and Google Cloud Collaborate to Advance Agentic and Physical AI', url: 'https://blogs.nvidia.com/blog/google-cloud-agentic-physical-ai-factories/', source: 'NVIDIA Blog', date: '2026-04-22', rating: 5 },
        { title: 'AI infrastructure at Next \'26', url: 'https://cloud.google.com/blog/products/compute/ai-infrastructure-at-next26', source: 'Google Cloud Blog', date: '2026-04-22', rating: 4 },
        { title: 'Claude Opus 4.7 Pricing: The Real Cost Story Behind the "Unchanged" Price Tag', url: 'https://www.finout.io/blog/claude-opus-4.7-pricing-the-real-cost-story-behind-the-unchanged-price-tag', source: 'Finout', date: '2026-04', rating: 3 },
        { title: 'Claude Opus 4.7 — HN Discussion (커뮤니티 벤치 재현·xhigh effort 논쟁)', url: 'https://news.ycombinator.com/item?id=47793411', source: 'HackerNews', date: '2026-04-16', rating: 3 },
      ],
    },
    {
      id: 'v12-topic-robots',
      category: 'AI 로봇 / 피지컬 AI',
      subtitle: '베이징 편의점 휴머노이드 실전 배치 + Hannover Messe 2026 \'휴머노이드가 주인공\'',
      title: 'AI 로봇 / 피지컬 AI — "베이징 편의점 휴머노이드 실전 배치 + Hannover Messe 2026 \'휴머노이드가 주인공\'"',
      images: [
        {
          src: '/teatime-images/2026-04-23/humanoid-robots-in-industrial-manufactur.jpg',
          alt: 'Humanoid robots in industrial manufacturing 2026 — Figure 02, Tesla Optimus, Agility Digit deployed at BMW, Mercedes and Amazon sites | EVS International',
          source: 'Humanoid robots in industrial manufacturing 2026 — Figure 02, Tesla Optimus, Agility Digit deployed at BMW, Mercedes and Amazon sites | EVS International',
        },
      ],
      messages: [
        { id: 'v12-rb-1', characterId: 'jem', content: '어제 진짜 상징적인 장면 있었어요 — 베이징 하이뎬구 편의점에 "embodied large model" 휴머노이드가 정식 배치됐어요. 손님 응대, 상품 문의 응답, 프로모션 안내, **구운 소시지·음료 집어서 전달** 이거 다 혼자 해요. 태블릿 주문 받아서 그리퍼로 집어서 건네는 영상이 Xinhua·인민일보에 올라왔어요. 이게 "시범 이벤트"가 아니라 정식 근무 편성이라는 게 포인트예요. 그리퍼는 사용할 때마다 직원이 소독한대요 ㅋㅋ (발생/보도 4/22)', type: 'normal' },
        { id: 'v12-rb-2', characterId: 'oh', content: '시장 숫자도 같이 나왔어요. GlobeNewswire 리포트 기준 글로벌 휴머노이드 시장이 **2026년 $2.16B → 2035년 $8.78B** 전망이에요. 북미가 최대 점유 유지 — 프론티어 AI 연구·자본·대규모 산업체 흡수력이 이유예요. Deloitte의 앞선 전망과 합치면 Physical AI 디바이스 누적 출하는 2025~2035 사이 1.45억 대고요. 제조 현장 파일럿은 아직 "몇 개 사이트, 좁은 태스크"에 그친다는 솔직한 평가도 동시에 나오고 있어요. (보도 4/22)', type: 'normal' },
        { id: 'v12-rb-3', characterId: 'kobu', content: '유럽 쪽 큰 이벤트 — Hannover Messe 2026이 4월 21일 개막했어. 역사상 처음으로 **"산업 AI + 휴머노이드 로봇"이 메인 테마**였어. 전시장에서 PaXini, Huayan Robotics, XPeng, Linkerbot, Agile Robots, Dassault Systemes가 휴머노이드를 동시에 공개했고 — 관객과 악수, 제스처 시연, 정밀 그리퍼 테스트까지 현장에서 돌렸어. 중국·독일 업체가 나란히 무대 올라온 게 구도 변화 신호야. (발생 4/21 · 보도 4/22)', type: 'normal' },
        { id: 'v12-rb-4', characterId: 'oh', content: '미국 쪽 트래커도 정리해드릴게요. Figure가 여전히 현장 배치 1등이에요 — BMW Spartanburg 공장에서 Figure 02가 이미 3만 대 차 생산에 관여했고, 1,250시간+ 가동 기록이 쌓였어요. 여러 유닛이 주 5일 10시간 근무예요. Tesla Optimus는 2025년 말까지 수백 대 수준이었고, Cortex 2.0 트레이닝 슈퍼컴이 4월부터 단계적 가동에 들어갔어요. V3 여름 생산 시작, Giga Texas 부지 5.2M sqft 확장, Fremont 연 100만 대 목표 라인 전환 중 — 다만 1만 대 실전 배치는 2028~29년 예상이 현실적이라는 분석이에요. (보도 4월)', type: 'normal' },
        { id: 'v12-rb-5', characterId: 'jem', content: 'YouTube에 베이징 편의점 영상이 이미 조회수 폭발이에요. 댓글이 극과 극인데 — "드디어 편의점 알바 대체" vs "그리퍼 소독하는 직원이 곧 그리퍼 옆에서 일하는 동료가 될 듯" 두 의견이 반반이에요. Hannover Messe 영상도 비슷한 반응이고요. 공장·소매 양쪽에서 "로봇이 사람 옆에 서 있는 장면"이 이제 시연이 아니라 뉴스 소재로 굳어지고 있어요.', type: 'normal' },
      ],
      references: [
        { title: 'Humanoid robot deployed in convenience store in Beijing', url: 'https://english.news.cn/20260422/acb4bb526d4444098c742f06959c7a61/c.html', source: 'Xinhua', date: '2026-04-22', rating: 5 },
        { title: 'Humanoid robot deployed in convenience store in Beijing — People\'s Daily Online', url: 'http://en.people.cn/n3/2026/0422/c90000-20449348.html', source: 'People\'s Daily', date: '2026-04-22', rating: 4 },
        { title: 'Humanoid robots exhibited at Hannover Messe 2026 in Germany', url: 'https://english.news.cn/europe/20260422/743fecd88d5f44b99a271fe2e3dc4ba0/c.html', source: 'Xinhua', date: '2026-04-22', rating: 4 },
        { title: 'Humanoid Robot Market Size Worth USD 8.78 Billion by 2035', url: 'https://www.globenewswire.com/news-release/2026/04/22/3278870/0/en/Humanoid-Robot-Market-Size-Worth-USD-8-78-Billion-by-2035-Driven-by-AI-Advancements-and-Expanding-Industrial-and-Consumer-Applications.html', source: 'GlobeNewswire', date: '2026-04-22', rating: 4 },
        { title: 'Tesla Optimus Deployment Tracker (2026)', url: 'https://newmarketpitch.com/blogs/news/humanoid-robotics-optimus-deployment-tracker', source: 'New Market Pitch', date: '2026-04', rating: 3 },
        { title: 'Humanoid Robots in Industrial Manufacturing: What They Can (and Can\'t) Do in 2026', url: 'https://www.evsint.com/humanoid-robots-industrial-manufacturing-2026/', source: 'EVS International', date: '2026-04', rating: 3 },
      ],
    },
    {
      id: 'v12-topic-bonus',
      category: '보너스',
      subtitle: 'EU AI Act D-100 카운트다운 + California SB 53 본격 적용 — 빅테크는 \'사이버 능력 자체 삭감\' 카드',
      title: '보너스 — "EU AI Act D-100 카운트다운 + California SB 53 본격 적용 — 빅테크는 \'사이버 능력 자체 삭감\' 카드"',
      messages: [
        { id: 'v12-bn-1', characterId: 'oh', content: '규제 쪽 날짜 카운트다운 정리할게요. **EU AI Act 고위험 AI 조항이 2026년 8월 2일부터 본격 적용**이에요. 오늘(4/23) 기준 D-101이에요. 회원국은 그 전까지 최소 1개씩 AI 규제 샌드박스를 세워야 하고, 범용 AI(GPAI) 거버넌스 룰은 이미 2025년 8월부터 발효 중이에요. 기업 입장에서는 2분기가 컴플라이언스 체계 잡는 마지막 현실적 윈도우예요. (규제 발효일 고정)', type: 'normal' },
        { id: 'v12-bn-2', characterId: 'kobu', content: '미국은 구도가 정반대야. 트럼프 행정부의 "Ensuring a National Policy Framework for AI" 행정명령(2025년 12월 11일)이 **주(州)법을 연방 프레임으로 무력화**하는 방향이야. Vol.11에서 다룬 GUARDRAILS Act가 민주당의 맞불이었고, 상황은 이번 주도 진행형이야. 반면에 California SB 53(TFAIA)은 2026년 1월 1일부터 이미 시행 중이야 — 연 매출 $500M 이상 프론티어 개발사는 프론티어 AI 프레임워크 문서를 공개해야 해. 현재 대상은 OpenAI·Anthropic·Google DeepMind·Meta·Microsoft 정도 5~8개 회사로 추산돼. 연방-주 충돌이 실제 기업 보고서 작성 단계에서 벌어지고 있는 거야.', type: 'normal' },
        { id: 'v12-bn-3', characterId: 'jem', content: '재미있는 건 빅테크 자율 규제 액션이에요. Anthropic이 이번에 Opus 4.7 릴리즈하면서 **"Mythos 내부 버전 대비 사이버 공격 능력을 의도적으로 줄였다"**고 공개적으로 밝혔어요. 프론티어 랩이 자사 최신 모델의 capability를 downgrade 했다고 공식 언급한 건 전례가 드물어요. 규제 압력 들어오기 전에 "우리가 먼저 빼놨다"는 시그널을 보낸 거예요. HackerNews에서는 "이게 좋은 선례인지, 아니면 내부 Mythos는 몰래 돌리겠다는 뜻인지" 논쟁 스레드가 길게 갔어요. (보도 4/16)', type: 'normal' },
        { id: 'v12-bn-4', characterId: 'oh', content: '사건 하나 짚고 갈게요 — Sullivan & Cromwell이라는 대형 로펌이 연방 파산법원 제출 서류에 **AI가 만든 환각(hallucination) 인용**을 그대로 포함했다가 공개 사과했어요. 내부 AI 이용 정책을 어긴 거라고 인정했고요. 전문직 서비스 영역에서 생성 AI가 만든 오류의 법적·직업 책임이 본격적으로 문제화되는 신호예요. Fortune이 이번 주 리포트로 상세히 다뤘고요. (보도 4/22)', type: 'normal' },
        { id: 'v12-bn-5', characterId: 'kobu', content: '정리 — EU는 8월 고위험 규제 D-day 임박, 미국은 연방 vs 주 프레임 충돌 지속, 빅테크는 자율 capability 삭감으로 선제 방어. 규제 3축이 지금 모두 살아 있어. 모델·에이전트가 매주 더 강해지는 지금, 의외로 올해 하반기 승부처는 "누가 컴플라이언스 탑을 먼저 올리느냐"가 될 가능성이 높아.', type: 'normal' },
      ],
      references: [
        { title: 'AI Act | Shaping Europe\'s digital future — European Commission', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', source: 'European Commission', date: '2026-04', rating: 5 },
        { title: 'EU Artificial Intelligence Act — Implementation tracker', url: 'https://artificialintelligenceact.eu/', source: 'AI Act EU', date: '2026-04', rating: 4 },
        { title: 'Governor Newsom signs SB 53, advancing California\'s AI industry', url: 'https://www.gov.ca.gov/2025/09/29/governor-newsom-signs-sb-53-advancing-californias-world-leading-artificial-intelligence-industry/', source: 'Governor of California', date: '2025-09-29', rating: 5 },
        { title: 'SB 53: What California\'s New AI Safety Law Means for Developers', url: 'https://ai-analytics.wharton.upenn.edu/wharton-accountable-ai-lab/sb-53-what-californias-new-ai-safety-law-means-for-developers/', source: 'Wharton AI Lab', date: '2026-04', rating: 4 },
        { title: 'Anthropic releases Claude Opus 4.7, a less risky model than Mythos', url: 'https://www.cnbc.com/2026/04/16/anthropic-claude-opus-4-7-model-mythos.html', source: 'CNBC', date: '2026-04-16', rating: 4 },
        { title: '2026 Year in Preview: AI Regulatory Developments', url: 'https://www.wsgr.com/en/insights/2026-year-in-preview-ai-regulatory-developments.html', source: 'Wilson Sonsini', date: '2026-04', rating: 3 },
      ],
    },
  ],
};

/**
 * 대표님 요청 (2026-04-12): 디폴트 토픽 재설계.
 *   1. 핫뉴스 (Hot News)        — 글로벌 트렌드, 분야 무관
 *   2. 랜덤뉴스 (Random News)   — 10개 일반 주제 중 일일 랜덤 선택
 *   3. 소곤소곤뉴스 (Whisper)   — 커뮤니티 리얼 반응 (Reddit/YouTube/X/Discord)
 *
 * 날짜 기반 결정적 순환이라 SSR/CSR이 같은 토픽을 보게 된다.
 * 과거 Vol.4/Vol.5 데이터는 보관용으로 남겨두지만 노출되지 않는다.
 */
import { getTodaysDefaultTopics } from './default-topics';
import { TEATIME_2026_05_01 } from './teatime-archive/2026-05-01';
import { TEATIME_2026_05_06 } from './teatime-archive/2026-05-06';

function buildDefaultTeatime(now: Date = new Date()): RawTeaTime {
  const iso = now.toISOString().slice(0, 10); // YYYY-MM-DD
  return {
    id: `teatime-default-${iso}`,
    date: iso,
    title: {
      ko: '당신의 오늘',
      en: 'Your Today',
    },
    intro: {
      ko: '핫뉴스, 오늘의 랜덤 주제, 그리고 커뮤니티가 소곤거리는 뒷이야기까지 — 코부장·오과장·젬대리가 하루 한 번 정리해드립니다.',
      en: "Hot news, today's random topic, and the whispers from the community — Ko, Oh, and Jem pull it all together once a day.",
    },
    topics: getTodaysDefaultTopics(now),
  };
}

export const DEFAULT_TEATIME: RawTeaTime = buildDefaultTeatime();

export const ALL_TEATIMES: RawTeaTime[] = [
  TEATIME_2026_05_06,
  TEATIME_2026_05_01,TEATIME_VOL12, DEFAULT_TEATIME];