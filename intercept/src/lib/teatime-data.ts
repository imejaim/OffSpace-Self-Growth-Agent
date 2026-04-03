export interface Character {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface Message {
  id: string;
  characterId: string;
  content: string;
  type: 'normal' | 'intercept-answer';
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
  title: string;
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
  },
  oh: {
    id: 'oh',
    name: '오과장',
    role: '기획과장',
    color: '#E67E22',
  },
  jem: {
    id: 'jem',
    name: '젬대리',
    role: '개발대리',
    color: '#27AE60',
  },
  user: {
    id: 'user',
    name: '나',
    role: '독자',
    color: '#9B59B6',
  },
};

export const SAMPLE_TEATIME: TeaTime = {
  id: 'teatime-2026-04-03',
  date: '2026-04-03',
  title: 'Offspace 티타임 Vol.2',
  intro: '코부장, 오과장, 젬대리가 아침 커피 한 잔 들고 모였다.',
  topics: [
    {
      id: 'topic-hotnews',
      title: '핫뉴스',
      messages: [
        {
          id: 'msg-hn-1',
          characterId: 'jem',
          content:
            '대표님 이거 보셨어요? OpenAI가 **1,220억 달러 투자 유치** 마감했대요. 기업가치가 **8,520억 달러**... 어제(4월 2일) 나온 기사인데 진짜 숫자가 미쳤어요.',
          type: 'normal',
        },
        {
          id: 'msg-hn-2',
          characterId: 'kobu',
          content:
            '그런데 재밌는 건, OpenAI한테 돈이 몰리는 동시에 **2차 시장에서는 투자자들이 Anthropic 쪽으로 빠지고 있다**는 거야. 시장이 분산 투자를 시작했다는 신호지.',
          type: 'normal',
        },
        {
          id: 'msg-hn-3',
          characterId: 'oh',
          content:
            'Q1 전체로 보면 VC 투자가 **2,970억 달러**로 역대 최고인데, AI 스타트업이 81% 가져갔어요. 그리고 Alibaba가 **Qwen3.6-Plus**를 며칠 만에 또 냈더라고요. 3일 만에 세 번째 모델 릴리즈래요.',
          type: 'normal',
        },
        {
          id: 'msg-hn-4',
          characterId: 'kobu',
          content:
            'Atlassian 10% 감원 소식은 계속 이어지고 있고... 이제 "AI 안 하면 구조조정"이 현실이 된 거지. 바이오 쪽에서 **AI가 발견한 신약 후보들이 중후기 임상시험에 진입**했다는 소식도 있어. 항암제랑 희귀질환 쪽이래.',
          type: 'normal',
        },
        {
          id: 'msg-hn-5',
          characterId: 'jem',
          content: '우와 AI가 만든 약이 진짜 사람한테 테스트되는 거예요?',
          type: 'normal',
        },
        {
          id: 'msg-hn-6',
          characterId: 'kobu',
          content:
            'ㅇㅇ 올해가 "계산적 돌파"에서 "실제 의료 결과"로 넘어가는 해라고 하더라.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'Latest AI News and AI Breakthroughs 2026',
          url: 'https://www.crescendo.ai/news/latest-ai-news-and-updates',
          source: 'Crescendo',
          date: '2026-04-02',
          rating: 3,
        },
        {
          title: 'AI News & Trends April 2026: Complete Monthly Digest',
          url: 'https://www.humai.blog/ai-news-trends-april-2026-complete-monthly-digest/',
          source: 'HumAI Blog',
          date: '2026-04',
          rating: 3,
        },
        {
          title: 'Breaking Tech News April 1 2026',
          url: 'https://coaio.com/news/2026/04/breaking-tech-news-on-april-1-2026-ai-surge-cyber-threats-and-startup-2l4c/',
          source: 'Coaio',
          date: '2026-04-01',
          rating: 3,
        },
      ],
    },
    {
      id: 'topic-agents',
      title: 'AI 에이전트',
      messages: [
        {
          id: 'msg-ag-1',
          characterId: 'oh',
          content:
            '에이전트 쪽 숫자가 확 올라왔어요. Gartner 전망에 따르면 올해 말까지 **기업 앱 40%에 AI 에이전트가 탑재**된대요. 작년엔 5% 미만이었는데.',
          type: 'normal',
        },
        {
          id: 'msg-ag-2',
          characterId: 'jem',
          content:
            'Deloitte 보고서도 봤는데, **기업 75%가 올해 안에 AI 에이전트 배포 계획** 있다고 하더라고요!',
          type: 'normal',
        },
        {
          id: 'msg-ag-3',
          characterId: 'kobu',
          content:
            '문제는 보안이야. 대부분 CISO들이 에이전트 리스크에 대해 깊은 우려를 표하면서도, **실제로 성숙한 보안 체계를 갖춘 곳은 거의 없다**고 해. 배포 속도가 보안 속도를 앞서고 있는 거지.',
          type: 'normal',
        },
        {
          id: 'msg-ag-4',
          characterId: 'jem',
          content:
            '프로토콜 표준화도 진행 중이에요! Google이랑 Shopify가 **Universal Commerce Protocol(UCP)** 공동 개발했고, Anthropic의 **MCP(Model Context Protocol)**도 에이전트 통신 표준으로 자리잡고 있대요.',
          type: 'normal',
        },
        {
          id: 'msg-ag-5',
          characterId: 'kobu',
          content:
            '커머스 쪽 숫자도 인상적이야. Salesforce 데이터로는 작년 홀리데이 시즌에 **AI 에이전트가 리테일 매출의 20%를 견인**했고, McKinsey는 에이전틱 커머스가 2030년까지 **글로벌 리테일 지출 3~5조 달러를 재편**할 거라고 했어.',
          type: 'normal',
        },
        {
          id: 'msg-ag-6',
          characterId: 'oh',
          content:
            '우리도 에이전트 만드는 입장에서 MCP 표준은 꼭 따라가야 할 것 같아요.',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'AI Agents News April 2026 - STARTUP EDITION',
          url: 'https://blog.mean.ceo/ai-agents-news-april-2026/',
          source: 'Mean CEO',
          date: '2026-04',
          rating: 3,
        },
        {
          title: 'Autonomous AI agents 2026: new rules for governance',
          url: 'https://www.raconteur.net/technology/autonomous-ai-agents-2026-the-new-rules-for-business-governance',
          source: 'Raconteur',
          date: '2026-04',
          rating: 4,
        },
        {
          title: '7 Agentic AI Trends to Watch 2026',
          url: 'https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/',
          source: 'ML Mastery',
          date: '2026-03',
          rating: 3,
        },
      ],
    },
    {
      id: 'topic-models',
      title: 'AI 모델 트렌드',
      messages: [
        {
          id: 'msg-md-1',
          characterId: 'jem',
          content:
            '모델 쪽은요, 전체적으로 **274개 이상 모델이 트래킹**되고 있는데, 큰 트렌드가 두 개예요.',
          type: 'normal',
        },
        {
          id: 'msg-md-2',
          characterId: 'jem',
          content:
            '하나는 **온디바이스 AI 이동**이에요! 3B~30B 파라미터 모델들이 스마트폰, 자동차, 산업장비에서 **로컬로 돌아가는 쪽**으로 확 옮겨가고 있대요.',
          type: 'normal',
        },
        {
          id: 'msg-md-3',
          characterId: 'oh',
          content:
            '인프라 쪽에선 **vLLM Model Runner V2(MRV2)**가 3월에 나왔는데, 완전 새로 짠 거래요. 추론 속도가 16K tok/s에서 **25K tok/s로 56% 향상**됐어요.',
          type: 'normal',
        },
        {
          id: 'msg-md-4',
          characterId: 'kobu',
          content:
            'DeepSeek-V3.2는 계속 추론이랑 에이전틱 워크로드에서 오픈소스 최강급 유지하고 있고, gpt-oss도 파트너들이 파인튜닝해서 쓰기 시작했어.',
          type: 'normal',
        },
        {
          id: 'msg-md-5',
          characterId: 'jem',
          content:
            '팩트체크도 중요해요! gpt-oss 초기 발표는 작년이고, 올해는 확장판이에요. 시점이 헷갈리기 쉬워요 ㅋㅋ',
          type: 'normal',
        },
      ],
      references: [
        {
          title: 'LLM News Today April 2026',
          url: 'https://llm-stats.com/ai-news',
          source: 'LLM Stats',
          date: '2026-04-03',
          rating: 3,
        },
        {
          title: 'On-Device LLM Revolution: 3B-30B Models Moving to Edge',
          url: 'https://www.edge-ai-vision.com/2026/04/the-on-device-llm-revolution-why-3b-30b-models-are-moving-to-the-edge/',
          source: 'Edge AI Vision',
          date: '2026-04',
          rating: 4,
        },
        {
          title: 'AI Updates Today April 2026',
          url: 'https://llm-stats.com/llm-updates',
          source: 'LLM Stats',
          date: '2026-04',
          rating: 3,
        },
      ],
    },
  ],
};

export const ALL_TEATIMES: TeaTime[] = [SAMPLE_TEATIME];
