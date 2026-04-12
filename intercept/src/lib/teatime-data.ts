export interface Character {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar: string;
}

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

export const CHARACTERS: Record<string, Character> = {
  kobu: {
    id: 'kobu',
    name: '코부장',
    role: '개발부장',
    color: '#4A90D9',
    avatar: '/characters/Ko-bujang.svg',
  },
  oh: {
    id: 'oh',
    name: '오과장',
    role: '기획과장',
    color: '#E67E22',
    avatar: '/characters/Oh-gwajang.svg',
  },
  jem: {
    id: 'jem',
    name: '젬대리',
    role: '개발대리',
    color: '#27AE60',
    avatar: '/characters/Jem-daeri.svg',
  },
  user: {
    id: 'user',
    name: '나',
    role: '독자',
    color: '#9B59B6',
    avatar: '',
  },
};

export const TEATIME_VOL4: TeaTime = {
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
        {
          id: 'msg-hn-1',
          characterId: 'jem',
          content:
            '선배님들 주말 사이에 뉴스 폭탄이에요! Anthropic이 **Coefficient Bio라는 바이오 스타트업을 4억 달러에 인수**했대요! r/MachineLearning에서 금요일 밤부터 타래가 폭발했는데, "직원 10명도 안 되는데 4억?"이라며 난리 ㅋㅋ (4/3 발생 · 4/4 보도)',
          type: 'normal',
        },
        {
          id: 'msg-hn-2',
          characterId: 'oh',
          content:
            '해커뉴스에서도 "인재 영입치곤 비싸다" vs "기술이 핵심이다" 갑론을박이에요. 수치로 보면 직원당 약 **4천만 달러** 이상 가치를 매긴 거죠.',
          type: 'normal',
        },
        {
          id: 'msg-hn-3',
          characterId: 'kobu',
          content:
            '창업자 둘이 Genentech 프레시언트 디자인 출신이야. 단백질 설계랑 생체분자 모델링 전문가들이지. 작년 10월 Anthropic이 **Claude for Life Sciences** 출시한 게 범용 연구 보조였다면, 이번 인수는 신약 발견에 특화된 **도메인 전문성**을 산 거야.',
          type: 'normal',
        },
        {
          id: 'msg-hn-4',
          characterId: 'jem',
          content:
            '그리고 X.com에서 AI 업계 관계자들이 떠들썩한 게, Anthropic이 **정치활동위원회(PAC)**도 설립했대요! (4/4~5) IPO 준비 시그널이라는 분석이 지배적이에요.',
          type: 'normal',
        },
        {
          id: 'msg-hn-5',
          characterId: 'kobu',
          content:
            'Anthropic이 "연구소 모드"에서 "기업 모드"로 완전히 전환하고 있어.',
          type: 'normal',
        },
        {
          id: 'msg-hn-6',
          characterId: 'oh',
          content:
            'OpenAI 쪽은 경영진 대개편이에요. COO **브래드 라이트캡**이 "스페셜 프로젝트"(사실상 IPO 전담)로 이동하고, CMO 케이트 라우치는 암 치료 휴직, AGI 프로덕트 담당 피지 시모도 일시 휴직 (4/3~4). Bloomberg에 따르면 **2차 시장에서 OpenAI 수요가 줄고 Anthropic으로 자금이 이동** 중이래요.',
          type: 'normal',
        },
        {
          id: 'msg-hn-7',
          characterId: 'jem',
          content:
            '#QuitGPT 여파도 아직이에요! 2월 말 Pentagon 딜 이후 **ChatGPT 삭제 295% 급증**, 250만 명 이탈, Claude가 미국 앱스토어 1위 찍은 효과가 이어지고 있어요.',
          type: 'normal',
        },
        {
          id: 'msg-hn-8',
          characterId: 'kobu',
          content:
            '결국 Anthropic vs OpenAI IPO 레이스인데, 윤리적 포지셔닝이 시장에서도 먹히고 있다는 게 핵심이야.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Anthropic acquires Coefficient Bio for $400M+',
          url: 'https://siliconangle.com/2026/04/03/anthropic-reportedly-acquires-medical-ai-startup-coefficient-bio-400m/',
          source: 'SiliconANGLE',
          date: '2026-04-03',
          rating: 4,
        },
        {
          title: 'Anthropic acquires startup Coefficient Bio for $400 million',
          url: 'https://www.theinformation.com/articles/anthropic-acquires-startup-coefficient-bio-400-million',
          source: 'The Information',
          date: '2026-04-03',
          rating: 5,
        },
        {
          title: 'OpenAI COO shifts out of role, AGI CEO taking medical leave',
          url: 'https://www.bloomberg.com/news/articles/2026-04-03/openai-coo-shifts-out-of-role-agi-ceo-taking-medical-leave',
          source: 'Bloomberg',
          date: '2026-04-03',
          rating: 5,
        },
        {
          title: 'Anthropic and OpenAI race to IPO',
          url: 'https://www.axios.com/2026/04/03/anthropic-openai-ipo',
          source: 'Axios',
          date: '2026-04-03',
          rating: 4,
        },
        {
          title: '#QuitGPT: 250만 사용자 이탈 분석',
          url: 'https://laikalabs.ai/news/quitgpt-movement-openai-pentagon-deal-mass-exodus',
          source: 'Laika Labs',
          date: '2026-03',
          rating: 3,
        },
      ],
    },
    {
      id: 'topic-agents',
      category: 'AI 에이전트',
      subtitle: 'MCP가 인프라가 됐다, 그런데 도전자도 왔다',
      title: 'AI 에이전트 — "MCP가 인프라가 됐다, 그런데 도전자도 왔다"',
      messages: [
        {
          id: 'msg-ag-1',
          characterId: 'jem',
          content:
            '저 이번 주말에 r/LocalLLaMA 정주행했는데요! **MCP 서버 베스트 11선** 글이 318 업보트에 39 댓글 달렸어요. 근데 탑 댓글이 웃겨요 — "도구 많이 붙일수록 컨텍스트 먹어서 에이전트가 불안정해진다"래요 ㅋㅋ',
          type: 'normal',
        },
        {
          id: 'msg-ag-2',
          characterId: 'oh',
          content:
            '숫자부터 볼게요. MCP가 **월간 SDK 다운로드 9,700만**을 돌파했어요. npm 전체에서도 상위 패키지급이에요. 그리고 Linux Foundation이 **Agentic AI Foundation(AAIF)**을 출범시켰는데, MCP + Block의 goose + OpenAI의 AGENTS.md가 창립 프로젝트예요. 플래티넘 멤버가 AWS, Anthropic, Google, Microsoft, OpenAI — 빅테크 총집합이에요.',
          type: 'normal',
        },
        {
          id: 'msg-ag-3',
          characterId: 'kobu',
          content:
            '사실상의 인프라가 된 거야. 근데 도전도 있어. **Perplexity가 MCP에서 이탈**했다는 소식이 나왔고, Agent-to-Agent Protocol(A2A)이 부상 중이야. MCP는 "에이전트↔도구" 통신이고, A2A는 "에이전트↔에이전트" 통신이라 역할이 다르긴 해.',
          type: 'normal',
        },
        {
          id: 'msg-ag-4',
          characterId: 'jem',
          content:
            'YouTube에서 MCP vs A2A 비교 영상이 매일 올라오고 있어요! DEV.to 완전 가이드도 나왔고요. "MCP handles tools, A2A handles agents"라는 프레임이 정착되는 분위기예요.',
          type: 'normal',
        },
        {
          id: 'msg-ag-5',
          characterId: 'oh',
          content:
            '엔터프라이즈 쪽도 움직여요. **Domo가 AI Agent Builder + MCP Server**를 출시해서 기업 데이터를 외부 AI 플랫폼에 직접 연결하는 오케스트레이션 프레임워크를 냈어요.',
          type: 'normal',
        },
        {
          id: 'msg-ag-6',
          characterId: 'kobu',
          content:
            'Anthropic이 **Claude Code SDK를 Claude Agent SDK로 개명**한 것도 의미가 커. 코딩 도구를 넘어 범용 에이전트 빌더로 포지셔닝을 바꾼 거지. 우리 끼어들기 서비스도 MCP + A2A 조합을 고려해볼 만해.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Linux Foundation — AAIF 출범 공식 발표',
          url: 'https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation',
          source: 'Linux Foundation',
          date: '2025-12',
          rating: 5,
        },
        {
          title: 'MCP is Alive but Faces Challenges',
          url: 'https://aibusiness.com/agentic-ai/mcp-alive-faces-challenges',
          source: 'AI Business',
          date: '2026-04',
          rating: 4,
        },
        {
          title: 'MCP vs A2A: The Complete Guide',
          url: 'https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li',
          source: 'DEV.to',
          date: '2026',
          rating: 3,
        },
        {
          title: 'Domo AI Agent Builder + MCP Server',
          url: 'https://www.demandgenreport.com/industry-news/news-brief/domo-launches-ai-agent-builder-mcp-server-to-connect-enterprise-data-to-ai-ecosystem/52332/',
          source: 'Demand Gen Report',
          date: '2026-04',
          rating: 3,
        },
        {
          title: 'Reddit r/LocalLLaMA — MCP 커뮤니티 토론',
          url: 'https://www.aitooldiscovery.com/guides/local-llm-reddit',
          source: 'Reddit',
          date: '2026',
          rating: 3,
        },
      ],
    },
    {
      id: 'topic-models',
      category: 'AI 논문과 모델',
      subtitle: '5강 체제, 몇 점 차이로 엎치락뒤치락',
      title: 'AI 논문과 모델 — "5강 체제, 몇 점 차이로 엎치락뒤치락"',
      images: [
        {
          src: 'https://i.mscdn.ai/70cbb1ad-08d7-4fdc-ab31-e343780966a6/generated-images/0f15c404-37bd-4569-8f3f-ece5496ffea5.png?fm=auto&w=1200&h=630&fit=crop',
          alt: 'GPT-5.4 vs Claude Opus 4.6 vs Gemini 3.1 Pro 벤치마크 비교',
          source: 'MindStudio',
        },
      ],
      messages: [
        {
          id: 'msg-md-1',
          characterId: 'jem',
          content:
            'r/LocalLLaMA에서 매일 순위표 업데이트하는데요, 지금 **5개 프론티어 모델이 몇 점 차이**로 싸우고 있어요! 벤치마크 올라올 때마다 1위가 바뀌어요 ㅋㅋ',
          type: 'normal',
        },
        {
          id: 'msg-md-2',
          characterId: 'oh',
          content:
            'LM Council 4월 데이터 기준 — **Gemini 3.1 Pro**가 SWE-bench 78.80%, GPQA 94.3%로 종합 1위. **GPT-5.4**는 OSWorld-V **75%**로 사람 평균(72.4%)을 처음으로 초과!',
          type: 'normal',
        },
        {
          id: 'msg-md-3',
          characterId: 'kobu',
          content:
            'GPT-5.4가 특히 재밌어. 실제 데스크톱 작업을 자율 수행하는 능력이 사람을 넘었다는 거야. 3월 5일 출시됐고, 팩트 오류가 GPT-5.2 대비 33% 줄었대.',
          type: 'normal',
        },
        {
          id: 'msg-md-4',
          characterId: 'jem',
          content:
            '아 그리고 Google이 **Android AICore Developer Preview**를 열었는데요! Gemma 4 모델을 **스마트폰에서 직접 다운받아서** 에이전트 개발할 수 있대요. 나중에 Gemini Nano 4로 자동 호환이고요.',
          type: 'normal',
        },
        {
          id: 'msg-md-5',
          characterId: 'oh',
          content:
            '투자 측면에서 Q1에만 **3,000억 달러 VC 투자**가 쏟아졌어요 (Crunchbase 4/5). 파운데이션 AI 스타트업 투자가 2025년 전체 대비 **2배**. 모델 경쟁이 투자를 끌어당기고 있는 거죠.',
          type: 'normal',
        },
        {
          id: 'msg-md-6',
          characterId: 'kobu',
          content:
            '온디바이스 AI가 진짜 오고 있어. MCP 표준 + 온디바이스 모델 = 로컬에서 도는 AI 에이전트. 우리 사내망 Qwen-3.5-35b 환경에도 시사점이 크지.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'GPT-5.4 vs Claude Opus 4.6 vs Gemini 3.1 Pro 벤치마크',
          url: 'https://www.mindstudio.ai/blog/gpt-54-vs-claude-opus-46-vs-gemini-31-pro-benchmarks',
          source: 'MindStudio',
          date: '2026-04',
          rating: 5,
        },
        {
          title: 'AI Model Benchmarks Apr 2026',
          url: 'https://lmcouncil.ai/benchmarks',
          source: 'LM Council',
          date: '2026-04',
          rating: 5,
        },
        {
          title: 'GPT-5.4 성능 분석',
          url: 'https://artificialanalysis.ai/models/gpt-5-4',
          source: 'Artificial Analysis',
          date: '2026-03',
          rating: 4,
        },
        {
          title: 'AI Core Developer Preview — Gemma 4 on Android',
          url: 'https://android-developers.googleblog.com/2026/04/AI-Core-Developer-Preview.html',
          source: 'Android Developers',
          date: '2026-04',
          rating: 4,
        },
        {
          title: 'Q1 2026 record-breaking VC funding',
          url: 'https://news.crunchbase.com/venture/record-breaking-funding-ai-global-q1-2026/',
          source: 'Crunchbase',
          date: '2026-04-05',
          rating: 5,
        },
      ],
    },
    {
      id: 'topic-robots',
      category: 'AI 로봇 / 피지컬 AI',
      subtitle: '일본이 먼저 증명했다',
      title: 'AI 로봇 / 피지컬 AI — "일본이 먼저 증명했다"',
      images: [
        {
          src: 'https://techcrunch.com/wp-content/uploads/2022/09/GettyImages-965917342.jpg?resize=1200,779',
          alt: '일본 피지컬 AI 현장 투입',
          source: 'TechCrunch',
        },
      ],
      messages: [
        {
          id: 'msg-rb-1',
          characterId: 'jem',
          content:
            '유튜브에서 일본 로봇 공장 영상이 바이럴이에요! TechCrunch가 심층 기사를 냈는데 (4/5 보도), **일본에서 실험적 피지컬 AI가 실제 현장에 투입**되기 시작했대요. "아무도 안 하려는 일자리를 로봇이 채운다"는 프레임이에요.',
          type: 'normal',
        },
        {
          id: 'msg-rb-2',
          characterId: 'oh',
          content:
            '고령화 때문이죠. 일자리를 빼앗는 게 아니라 **빈 자리를 채우는 모델**. 그리고 **Anvil Robotics가 650만 달러 시드 투자**를 받았어요 (4/3). "조립식(composable) 로봇 모듈" 플랫폼이에요.',
          type: 'normal',
        },
        {
          id: 'msg-rb-3',
          characterId: 'kobu',
          content:
            '더 재밌는 건 **DeepMirror가 OpenClaw를 Unitree 로봇에 통합**한 거야. 범용 에이전트가 실제로 "보고, 움직이고, 행동하고, 복구하는" 시스템으로 나아가는 첫 단계야.',
          type: 'normal',
        },
        {
          id: 'msg-rb-4',
          characterId: 'jem',
          content:
            '이번 주가 미국 **National Robotics Week**이기도 해요! NVIDIA 블로그에서 피지컬 AI 연구 브레이크스루를 총정리했어요.',
          type: 'normal',
        },
        {
          id: 'msg-rb-5',
          characterId: 'oh',
          content:
            '**HumanX 2026 컨퍼런스**(4/8, 샌프란시스코)에서 Samsara, Aurora, Serve Robotics가 자율주행/로봇/사람 혼합 운영 마스터클래스를 열어요. 한국도 고령화 속도가 일본 못지않으니까 주목할 모델이에요.',
          type: 'normal',
        },
        {
          id: 'msg-rb-6',
          characterId: 'kobu',
          content:
            '올해가 "실험실에서 현장으로" 넘어가는 변곡점이야. 3~4시간 연속 가동 한계는 여전하지만, 빈 자리를 채운다는 것만으로도 충분한 가치가 있지.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Japan physical AI is ready for the real world',
          url: 'https://techcrunch.com/2026/04/05/japan-is-proving-experimental-physical-ai-is-ready-for-the-real-world/',
          source: 'TechCrunch',
          date: '2026-04-05',
          rating: 5,
        },
        {
          title: 'National Robotics Week — 피지컬 AI 총정리',
          url: 'https://blogs.nvidia.com/blog/national-robotics-week-2026/',
          source: 'NVIDIA Blog',
          date: '2026-04',
          rating: 5,
        },
        {
          title: 'Anvil Robotics $6.5M 시드 투자',
          url: 'https://theaiinsider.tech/2026/04/03/anvil-robotics-raises-6-5m-in-funding-for-composable-modules-physical-ai-platform/',
          source: 'The AI Insider',
          date: '2026-04-03',
          rating: 3,
        },
        {
          title: 'DeepMirror × Unitree OpenClaw 통합',
          url: 'https://natlawreview.com/press-releases/runtime-physical-ai-deepmirror-brings-openclaw-unitree-robots',
          source: 'Nat Law Review',
          date: '2026-04',
          rating: 4,
        },
        {
          title: 'HumanX 2026 Samsara 피지컬 AI',
          url: 'https://www.roboticstomorrow.com/news/2026/03/31/samsara-to-accelerate-the-future-of-physical-ai-at-humanx-2026/26342/',
          source: 'Robotics Tomorrow',
          date: '2026-03-31',
          rating: 3,
        },
      ],
    },
    {
      id: 'topic-bonus',
      category: '보너스',
      subtitle: '더 많이 쓰면서 더 안 믿는 인간들',
      title: '보너스 — "더 많이 쓰면서 더 안 믿는 인간들"',
      messages: [
        {
          id: 'msg-bn-1',
          characterId: 'oh',
          content:
            '재밌는 여론조사요. 미국인 **76%가 AI 도구를 "가끔만 또는 거의 신뢰하지 않는다"**고 답했대요 (3/30 보도). 근데 "한 번도 안 써봤다"는 **27%로 줄었어요** — 작년 33%에서.',
          type: 'normal',
        },
        {
          id: 'msg-bn-2',
          characterId: 'jem',
          content:
            'X.com에서 밈 돌고 있어요 — "AI 안 쓰면 뒤처지고, 쓰면 못 믿겠고" ㅋㅋ 레딧에서도 "우리 모두 AI 중독이면서 AI 불신자"라는 자조 글이 수천 업보트요.',
          type: 'normal',
        },
        {
          id: 'msg-bn-3',
          characterId: 'kobu',
          content:
            '모순이 아니야. 써보니까 한계를 아는 거지. "할루시네이션 한 번 경험하면 전체 신뢰가 깨진다"는 연구도 있고.',
          type: 'normal',
        },
        {
          id: 'msg-bn-4',
          characterId: 'oh',
          content:
            '그 맥락에서 이거요 — **Microsoft Copilot 이용약관에 "오락 목적으로만(entertainment purposes only)" 면책조항**이 있대요 (4/5 보도). 기업한테 판매하면서요!',
          type: 'normal',
        },
        {
          id: 'msg-bn-5',
          characterId: 'jem',
          content:
            '엥?! 업무용 도구인데 오락용이라고요?? 레딧에서 "MS가 자기 도구도 못 믿는다" 밈이 터졌어요 ㅋㅋ',
          type: 'normal',
        },
        {
          id: 'msg-bn-6',
          characterId: 'kobu',
          content:
            '법적 방어 전략이야. AI 출력물 책임을 안 지겠다는 건데, 엔터프라이즈 고객한테는 역효과일 수 있어.',
          type: 'normal',
        },
        {
          id: 'msg-bn-7',
          characterId: 'oh',
          content:
            '보안 쪽도요. AI 공격적 사이버 역량이 **5.7개월마다 두 배**로 성장 중이에요 (4/5). Ledger CTO가 CoinDesk 인터뷰에서 "**AI가 크립토 해킹을 더 싸고 쉽게** 만들고 있다"고 경고했어요.',
          type: 'normal',
        },
        {
          id: 'msg-bn-8',
          characterId: 'kobu',
          content:
            '도구는 도구야. 공격이 세지면 방어 투자도 같이 가야 해.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'AI trust poll: 76% distrust, 27% never used',
          url: 'https://techcrunch.com/2026/03/30/ai-trust-adoption-poll-more-americans-adopt-tools-fewer-say-they-can-trust-the-results/',
          source: 'TechCrunch',
          date: '2026-03-30',
          rating: 4,
        },
        {
          title: 'AI is breaking crypto security, Ledger CTO warns',
          url: 'https://www.coindesk.com/tech/2026/04/05/ai-is-making-crypto-s-security-problem-even-worse-ledger-cto-warns/',
          source: 'CoinDesk',
          date: '2026-04-05',
          rating: 4,
        },
        {
          title: 'AI retail startups tackling return problem',
          url: 'https://www.cnbc.com/2026/04/05/ai-retail-start-ups-virtual-try-on-tech-margins.html',
          source: 'CNBC',
          date: '2026-04-05',
          rating: 3,
        },
      ],
    },
  ],
};

export const TEATIME_VOL5: TeaTime = {
  id: 'teatime-2026-04-07',
  date: '2026-04-07',
  title: 'Offspace 티타임 Vol.5',
  intro: '화요일 아침, 젬대리가 헐레벌떡 뛰어 들어왔다. "선배님들! 주말 사이에 뉴스가 너무 많아서 정리가 안 돼요!" 코부장이 커피를 한 모금 마시며 "그래서 티타임이 있는 거지"라고 웃었다.',
  topics: [
    {
      id: 'v5-topic-hotnews',
      category: 'AI 핫뉴스',
      subtitle: 'OpenAI $122B, 역사상 최대 펀딩에 IPO까지',
      title: 'AI 핫뉴스 — "OpenAI $122B, 역사상 최대 펀딩에 IPO까지"',
      images: [
        {
          src: 'https://image.cnbcfm.com/api/v1/image/108124498-1738180527543-gettyimages-2196652498-OPENAI_OFFICE.jpeg?v=1738180602&w=1260&h=630',
          alt: 'OpenAI 본사 — 역대 최대 $122B 펀딩 라운드 마감',
          source: 'CNBC / Getty Images',
        },
      ],
      messages: [
        {
          id: 'v5-hn-1',
          characterId: 'jem',
          content:
            '선배님들 이거 레딧에서 난리예요! **OpenAI가 $1,220억(약 170조 원) 펀딩을 마감**했대요! 역대 모든 기업 통틀어 최대 규모래요. 기업가치가 **$8,520억**이고요! (3/31 마감 · 4/5 분석 보도)',
          type: 'normal',
        },
        {
          id: 'v5-hn-2',
          characterId: 'oh',
          content:
            '투자자 구성을 보면요 — Amazon **$500억**, NVIDIA·SoftBank 각 **$300억**. 연간 매출 $250억 돌파했지만, 2026년 **$140억 적자** 전망이에요. 흑자 전환은 2029~2030년 예상이고요.',
          type: 'normal',
        },
        {
          id: 'v5-hn-3',
          characterId: 'kobu',
          content:
            '핵심은 IPO야. COO 포함 임원 4명이 교체됐고, Q4 2026 나스닥 상장 목표로 **$1조 밸류에이션**을 타겟하고 있어. Motley Fool이 4/5에 "OpenAI IPO 전 알아야 할 5가지" 기사를 낸 것도 시그널이지.',
          type: 'normal',
        },
        {
          id: 'v5-hn-4',
          characterId: 'jem',
          content:
            '그리고 Goldman Sachs가 **반도체 매출 49% 급증** 전망을 내놨어요! (4/5 보도) AI 수요 때문에 Q4에 하드웨어 매출만 **$7,000억** 넘을 거래요.',
          type: 'normal',
        },
        {
          id: 'v5-hn-5',
          characterId: 'oh',
          content:
            '한편 Apple과 Meta가 흥미로운 동맹을 맺고 있다는 분석도 있어요. OpenAI·Google·Anthropic이 모델 개발에 수천억을 쏟는 동안, 이 둘은 **"사용자 접점 소유"**라는 장기전 전략을 취하고 있다고.',
          type: 'normal',
        },
        {
          id: 'v5-hn-6',
          characterId: 'kobu',
          content:
            'AI 인프라 투자 규모가 상식을 넘어서고 있어. Q1에만 VC 투자 $3,000억이 쏟아졌고, 이 속도면 올해 전체가 작년의 3배야. 투자 회수가 안 되면 거품론이 나올 수밖에 없는 구조지.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'OpenAI closes record-breaking $122 billion funding round',
          url: 'https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html',
          source: 'CNBC',
          date: '2026-03-31',
          rating: 5,
        },
        {
          title: '5 Things to Know About OpenAI Before Its IPO',
          url: 'https://www.fool.com/investing/2026/04/05/5-things-to-know-about-openai-before-its-ipo/',
          source: 'Motley Fool',
          date: '2026-04-05',
          rating: 4,
        },
        {
          title: 'AI-led demand to drive sharp surge in semiconductor revenues',
          url: 'https://www.aninews.in/news/business/ai-led-demand-to-drive-sharp-surge-in-semiconductor-revenues-goldman-sachs20260405145721/',
          source: 'ANI News',
          date: '2026-04-05',
          rating: 4,
        },
        {
          title: 'Apple and Meta\'s Quiet Alliance to Outlast the AI Labs',
          url: 'https://medium.com/write-a-catalyst/apple-and-metas-quiet-alliance-to-outlast-the-ai-labs-while-openai-google-and-anthropic-burn-7abcd0804e62',
          source: 'Medium',
          date: '2026-04',
          rating: 3,
        },
      ],
    },
    {
      id: 'v5-topic-agents',
      category: 'AI 에이전트',
      subtitle: 'Anthropic Conway — 잠들지 않는 에이전트가 온다',
      title: 'AI 에이전트 — "Anthropic Conway — 잠들지 않는 에이전트가 온다"',
      messages: [
        {
          id: 'v5-ag-1',
          characterId: 'jem',
          content:
            '이거 X.com에서 난리였어요! Anthropic이 **"Conway"라는 Always-On 에이전트 플랫폼**을 내부 테스트 중인 게 코드 유출로 드러났대요! (4/1~3 최초 보도) 일반 채팅이 아니라 **독립 웹 인스턴스**로 돌아가요.',
          type: 'normal',
        },
        {
          id: 'v5-ag-2',
          characterId: 'kobu',
          content:
            '핵심 기능이 무시무시해. **Webhook 트리거**(외부 이벤트가 에이전트를 깨움), Chrome 자동화, Claude Code 실행, 전용 파일 시스템(.cnw.zip). "대화형 AI에서 **자율 디지털 트윈**으로" 전환하겠다는 거야.',
          type: 'normal',
        },
        {
          id: 'v5-ag-3',
          characterId: 'oh',
          content:
            'MCP 쪽 수치도 업데이트요. 월간 SDK 다운로드 **9,700만** 돌파, A2A 프로토콜 v1.0 정식 출시(gRPC, 서명된 Agent Card). 그리고 Salesforce 보고서에 따르면 기업 평균 **AI 에이전트 12개** 운영 중인데, 절반이 단독 운영이래요.',
          type: 'normal',
        },
        {
          id: 'v5-ag-4',
          characterId: 'jem',
          content:
            'LangChain 조사도 봤는데요, **57%의 조직이 AI 에이전트를 프로덕션에 배포** 중이래요! CrewAI는 GitHub 스타 4.5만 개에 하루 1,200만 에이전트 실행이요!',
          type: 'normal',
        },
        {
          id: 'v5-ag-5',
          characterId: 'kobu',
          content:
            'Conway가 정식 출시되면 게임이 바뀔 수 있어. 지금까지 에이전트는 "사용자가 시작해야 움직이는" 구조였는데, Conway는 **"이벤트가 오면 스스로 깨어나는"** 구조야. 우리 끼어들기 서비스에도 적용할 만한 패턴이지.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Exclusive: Anthropic tests Conway agent platform',
          url: 'https://www.testingcatalog.com/exclusive-anthropic-tests-its-own-always-on-conway-agent/',
          source: 'TestingCatalog',
          date: '2026-04-01',
          rating: 4,
        },
        {
          title: 'Anthropic Tests Conway As A Persistent Agent Platform',
          url: 'https://dataconomy.com/2026/04/03/anthropic-tests-conway-platform-for-continuous-claude/',
          source: 'Dataconomy',
          date: '2026-04-03',
          rating: 4,
        },
        {
          title: 'Belitsoft Report: Enterprises Run 12 AI Agents on Average',
          url: 'https://markets.financialcontent.com/stocks/article/abnewswire-2026-4-6-belitsoft-report-2026-ai-agent-trends-enterprises-run-12-ai-agents-on-average-but-half-work-alone',
          source: 'FinancialContent',
          date: '2026-04-06',
          rating: 3,
        },
        {
          title: 'AI Agent Frameworks 2026 — 57% in Production',
          url: 'https://www.morphllm.com/ai-agent-framework',
          source: 'Morphllm',
          date: '2026-04',
          rating: 3,
        },
      ],
    },
    {
      id: 'v5-topic-models',
      category: 'AI 논문과 모델',
      subtitle: 'Gemma 4 오픈소스 대전환, Llama 4는 왜 혹평받나',
      title: 'AI 논문과 모델 — "Gemma 4 오픈소스 대전환, Llama 4는 왜 혹평받나"',
      images: [
        {
          src: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemma_4_header.width-1300.format-webp.webp',
          alt: 'Google DeepMind Gemma 4 — Apache 2.0 라이선스로 전환',
          source: 'Google Blog',
        },
      ],
      messages: [
        {
          id: 'v5-md-1',
          characterId: 'jem',
          content:
            '구글이 **Gemma 4**를 4/2에 출시했는데요, 이번에 **Apache 2.0 라이선스**로 바뀌었어요! 상업적 활용이 완전 자유! r/LocalLLaMA에서 "드디어 진짜 오픈소스"라고 환호 중이에요.',
          type: 'normal',
        },
        {
          id: 'v5-md-2',
          characterId: 'oh',
          content:
            '수치 정리하면 — 모델 크기 2B/4B/26B(MoE)/31B(Dense). **256K 컨텍스트**, 140개 언어, 네이티브 비전·오디오. 31B가 오픈 모델 Arena 리더보드 **3위**, 26B가 6위. Gemma 누적 다운로드 **4억 회** 돌파.',
          type: 'normal',
        },
        {
          id: 'v5-md-3',
          characterId: 'kobu',
          content:
            'Apache 2.0 전환이 진짜 큰 거야. 이전 Gemma 라이선스는 상업적 제약이 있어서 기업들이 배포를 꺼렸는데, 이제 그 장벽이 완전히 사라졌어. 안드로이드 기기에서 로컬 실행까지 되니까 온디바이스 생태계가 확 넓어지지.',
          type: 'normal',
        },
        {
          id: 'v5-md-4',
          characterId: 'jem',
          content:
            '반면 Meta **Llama 4**는 혹평이에요 ㅠ X.com에서 Zvi가 "Llama Does Not Look Good 4 Anything"이라고 쓸 정도로. aider 코딩 벤치마크 **16%**로 최하위권, 공개 모델과 벤치마크 모델이 다르다는 **조작 의혹**까지!',
          type: 'normal',
        },
        {
          id: 'v5-md-5',
          characterId: 'oh',
          content:
            '로컬 추론 하드웨어도 진전이 있어요. **Intel Arc Pro B70**이 $949에 **32GB VRAM**으로 출시됐는데 (3/25), r/LocalLLaMA에서 213 업보트를 받았어요. 다만 Intel이 ipex-llm 저장소를 아카이브 처리해서 소프트웨어 생태계가 문제.',
          type: 'normal',
        },
        {
          id: 'v5-md-6',
          characterId: 'kobu',
          content:
            '오픈소스 진영이 6개 랩 체제로 확장됐어 — Google(Gemma 4), Alibaba(Qwen 3.6), Meta(Llama 4), Mistral(Small 4), OpenAI(gpt-oss-120b), Zhipu(GLM-5). 프로프리어터리와 오픈소스의 격차가 거의 사라지고 있어.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Gemma 4: Byte for byte, the most capable open models',
          url: 'https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/',
          source: 'Google Blog',
          date: '2026-04-02',
          rating: 5,
        },
        {
          title: 'Llama 4: Did Meta just push the panic button?',
          url: 'https://www.interconnects.ai/p/llama-4',
          source: 'Interconnects',
          date: '2026-04',
          rating: 4,
        },
        {
          title: 'Zvi: "Llama Does Not Look Good 4 Anything"',
          url: 'https://x.com/TheZvi/status/1909960198615150935',
          source: 'X.com @TheZvi',
          date: '2026-04',
          rating: 3,
        },
        {
          title: 'Intel Arc Pro B70 — 32GB AI 추론 GPU',
          url: 'https://www.tomshardware.com/pc-components/gpus/intel-arc-pro-b70-and-arc-pro-b65-gpus-bring-32gb-of-ram-to-ai-and-pro-apps-bigger-battlemage-finally-arrives-but-its-not-for-gaming',
          source: "Tom's Hardware",
          date: '2026-03-25',
          rating: 4,
        },
        {
          title: 'Open-Source AI Landscape April 2026: Complete Guide',
          url: 'https://www.digitalapplied.com/blog/open-source-ai-landscape-april-2026-gemma-qwen-llama',
          source: 'Digital Applied',
          date: '2026-04',
          rating: 3,
        },
      ],
    },
    {
      id: 'v5-topic-robots',
      category: 'AI 로봇 / 피지컬 AI',
      subtitle: 'NVIDIA GR00T N2, 로봇에 "세계 모델"을 심다',
      title: 'AI 로봇 / 피지컬 AI — "NVIDIA GR00T N2, 로봇에 \\"세계 모델\\"을 심다"',
      images: [
        {
          src: 'https://nvidianews.nvidia.com/media/images/2025/march/nvidia-gr00t-n1/nvidia-gr00t-n1-702x395.jpg',
          alt: 'NVIDIA GR00T 로봇 파트너 에코시스템',
          source: 'NVIDIA Newsroom',
        },
      ],
      messages: [
        {
          id: 'v5-rb-1',
          characterId: 'jem',
          content:
            'NVIDIA 뉴스룸에서 대형 발표가 나왔어요! **GR00T N1.7** 상업 라이선스 Early Access 출시, 그리고 **GR00T N2 프리뷰**까지! N2는 DreamZero 기반 "세계 행동 모델" 아키텍처래요.',
          type: 'normal',
        },
        {
          id: 'v5-rb-2',
          characterId: 'oh',
          content:
            'N2 성능이 인상적이에요. 새 환경 적응 성공률이 기존 VLA 대비 **2배 이상**. 파트너가 ABB, FANUC, Figure, Agility, Universal Robots — 산업 로봇 메이저가 총출동이에요. 2026년 말 정식 출시 예정.',
          type: 'normal',
        },
        {
          id: 'v5-rb-3',
          characterId: 'kobu',
          content:
            'GR00T N2의 핵심은 "시뮬레이션에서 현실로"의 전환이야. DreamZero가 합성 데이터로 세계 모델을 학습하고, 실제 로봇에 바로 적용하는 구조지. 데이터 수집 병목을 컴퓨팅으로 대체한 거야.',
          type: 'normal',
        },
        {
          id: 'v5-rb-4',
          characterId: 'jem',
          content:
            'MIT Technology Review 기사도 재밌어요! Tesla, Figure AI, Agility 같은 회사들이 **긱 워커들에게 집에서 행동 데이터를 수집**하게 하고 있대요. 휴머노이드 훈련 데이터가 "뉴 골드러시"래요.',
          type: 'normal',
        },
        {
          id: 'v5-rb-5',
          characterId: 'oh',
          content:
            'Bank of America 전망도 있어요 — 2026년 전 세계 휴머노이드 약 **9만 대 출하**, 2030년 120만 대, 2060년에는 **30억 대**로 자동차 인구를 추월한대요. HumanX 2026 컨퍼런스가 내일(4/8) 샌프란시스코에서 열리니까 새 소식이 더 나올 거예요.',
          type: 'normal',
        },
        {
          id: 'v5-rb-6',
          characterId: 'kobu',
          content:
            '아직 3~4시간 연속 가동 한계가 있지만, 올해가 "실험실→현장" 변곡점이라는 건 확실해. 우리 사내망에서도 물리 세계와 연결된 에이전트를 생각해볼 때가 된 것 같아.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'NVIDIA Releases New Physical AI Models — GR00T N1.7 & N2',
          url: 'https://nvidianews.nvidia.com/news/nvidia-releases-new-physical-ai-models-as-global-partners-unveil-next-generation-robots',
          source: 'NVIDIA Newsroom',
          date: '2026-03',
          rating: 5,
        },
        {
          title: 'GTC 2026: Nvidia wants to swap robotics\' data problem for compute',
          url: 'https://the-decoder.com/gtc-2026-nvidia-wants-to-swap-robotics-data-problem-for-a-compute-problem/',
          source: 'The Decoder',
          date: '2026-03',
          rating: 4,
        },
        {
          title: 'The gig workers who are training humanoid robots at home',
          url: 'https://www.technologyreview.com/2026/04/01/1134863/humanoid-data-training-gig-economy-2026-breakthrough-technology/',
          source: 'MIT Technology Review',
          date: '2026-04-01',
          rating: 5,
        },
        {
          title: 'Physical AI and humanoid robots — 2026 Tech Trends',
          url: 'https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends/2026/physical-ai-humanoid-robots.html',
          source: 'Deloitte Insights',
          date: '2026',
          rating: 5,
        },
      ],
    },
    {
      id: 'v5-topic-bonus',
      category: '보너스',
      subtitle: 'AI 딥페이크가 선거 공식 무기가 됐다',
      title: '보너스 — "AI 딥페이크가 선거 공식 무기가 됐다"',
      messages: [
        {
          id: 'v5-bn-1',
          characterId: 'jem',
          content:
            'CNN에서 충격적인 기사가 나왔어요! 미국 공화당 NRSC가 텍사스 민주당 후보 **James Talarico의 딥페이크 광고를 공식 집행**했대요! (3/13 보도) 최소 5건의 딥페이크 선거 광고가 확인됐고요.',
          type: 'normal',
        },
        {
          id: 'v5-bn-2',
          characterId: 'oh',
          content:
            '더 심각한 건 **연방 차원의 규제가 없다**는 거예요. Meta와 X는 팩트체킹 시스템을 폐기한 상태고, 유권자 **50%가 "딥페이크가 투표에 영향을 줬다"**고 답했대요.',
          type: 'normal',
        },
        {
          id: 'v5-bn-3',
          characterId: 'kobu',
          content:
            '그래도 주(州) 차원에서는 움직이고 있어. 올해 **딥페이크 관련 15개 법안**이 통과됐고, 정치적 딥페이크 규제 주가 28개에서 31개로 늘었어. 45개 주에서 1,561개 AI 법안이 상정 중이야. (4/3 보도)',
          type: 'normal',
        },
        {
          id: 'v5-bn-4',
          characterId: 'jem',
          content:
            '레딧에서 밈이 돌고 있는데요 — "정치 딥페이크는 불법인데 연방법이 없어서 합법" 이런 패러독스 ㅋㅋ',
          type: 'normal',
        },
        {
          id: 'v5-bn-5',
          characterId: 'oh',
          content:
            '보안 쪽도요. 지난번에 다룬 Ledger CTO 경고 이어서, AI 공격적 사이버 역량이 **5.7개월마다 두 배**로 성장 중이에요. 크립토 해킹 비용이 AI 덕에 급감하고 있대요.',
          type: 'normal',
        },
        {
          id: 'v5-bn-6',
          characterId: 'kobu',
          content:
            '기술 발전 속도를 규제가 따라가지 못하는 전형적인 패턴이야. 다만 주 단위 입법이 빠르게 늘고 있다는 건 긍정적이야. 우리도 콘텐츠 발행할 때 출처 검증을 더 철저히 해야 해.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Republicans release AI deepfake of James Talarico',
          url: 'https://www.cnn.com/2026/03/13/politics/james-talarico-ai-deepfake-republicans-midterms',
          source: 'CNN Politics',
          date: '2026-03-13',
          rating: 5,
        },
        {
          title: 'AI deepfakes blur reality in 2026 US midterm campaigns',
          url: 'https://www.investing.com/news/politics-news/ai-deepfakes-blur-reality-in-2026-us-midterm-campaigns-4586491',
          source: 'Reuters / Investing.com',
          date: '2026-04',
          rating: 4,
        },
        {
          title: '15 deepfake bills enacted so far this year',
          url: 'https://news.ballotpedia.org/2026/04/03/15-deepfake-bills-enacted-so-far-this-year-number-of-states-with-deepfake-laws-remains-the-same/',
          source: 'Ballotpedia',
          date: '2026-04-03',
          rating: 4,
        },
        {
          title: 'AI is making crypto security worse — Ledger CTO warns',
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
 * 대표님 요청: 티타임은 3토픽 체제 (AI 핫뉴스 / AI 에이전트 / AI 로봇).
 * 원본 데이터는 그대로 유지하고, 노출 단계에서 3개만 필터링한다.
 * (models, bonus 토픽은 데이터로만 보관 — 미노출)
 */
const VISIBLE_TOPIC_KEYWORDS = ['hotnews', 'agents', 'robots'] as const;

function filterTopics(teatime: TeaTime): TeaTime {
  return {
    ...teatime,
    topics: teatime.topics.filter((t) =>
      VISIBLE_TOPIC_KEYWORDS.some((k) => t.id.includes(k))
    ),
  };
}

export const ALL_TEATIMES: TeaTime[] = [TEATIME_VOL5, TEATIME_VOL4].map(filterTopics);
