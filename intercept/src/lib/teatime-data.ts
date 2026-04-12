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
            ko: 'Conway가 정식 출시되면 게임이 바뀔 수 있어. 지금까지 에이전트는 "사용자가 시작해야 움직이는" 구조였는데, Conway는 **"이벤트가 오면 스스로 깨어나는"** 구조야. 우리 끼어들기 서비스에도 적용할 만한 패턴이지.',
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

export const ALL_TEATIMES: RawTeaTime[] = [DEFAULT_TEATIME];
