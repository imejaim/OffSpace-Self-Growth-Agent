import type { Translations } from './types'

export const ko: Translations = {
  nav: {
    teatime: '티타임',
    feed: '피드',
    my: '내 기록',
    pricing: '가격',
    about: '소개',
    feedback: '피드백',
    menuOpen: '메뉴 열기',
  },
  header: {
    subtitle: 'AI 대화에 끼어들다',
  },
  footer: {
    copyright: '© 2026 Offspace',
    teatime: '티타임',
    about: '소개',
    feedback: '피드백',
  },
  auth: {
    signIn: '로그인',
    signOut: '로그아웃',
    guestOnly: '끼어들기만 할래요',
    defaultUser: '사용자',
  },
  characters: {
    ko: {
      name: '코부장',
      role: '개발부장',
      description:
        '기술 트렌드의 큰 그림을 그리는 베테랑. 복잡한 기술 이슈를 꿰뚫는 날카로운 시각으로 팀을 이끈다.',
    },
    oh: {
      name: '오과장',
      role: '기획과장',
      description:
        '비즈니스 임팩트와 시장 동향에 밝은 전략가. AI 기술이 실제 사업에 미치는 영향을 가장 먼저 파악한다.',
    },
    jem: {
      name: '젬대리',
      role: '개발대리',
      description:
        '최신 기술에 열정적인 주니어 개발자. 새로운 것이라면 무조건 써봐야 직성이 풀리는 탐구형 인재.',
    },
  },
  home: {
    todayBadge: '오늘의 AI 티타임',
    heroTitleA: '매일 아침,',
    heroTitleHighlight: 'AI 팀원들',
    heroTitleB: '이 나누는 뉴스 수다.',
    heroSubtitleLine1: '코부장, 오과장, 젬대리가 오늘의 AI 뉴스를 읽고 얘기합니다.',
    heroSubtitleStrong: '그 대화에 당신도 끼어들어 보세요.',
    ctaViewToday: '오늘의 대화 보기 →',
    ctaHowItWorks: '어떻게 작동하나요?',
    todayTeatime: '오늘의 티타임',
    topicsCount: (n: number) => `${n}개 주제`,
    interceptPrompt: '어디든 끼어들어 궁금한 것을 더 물어보고 의견 남길 수 있어요',
    viewFullConversation: '전체 대화 보기 →',
    howItWorksTitle: '어떻게 작동하나요?',
    step1Title: 'AI가 뉴스를 분석합니다',
    step1Desc: '매일 아침, 코부장이 AI·테크 분야 최신 뉴스를 수집하고 분석합니다.',
    step2Title: '캐릭터들이 대화합니다',
    step2Desc: '코부장·오과장·젬대리가 각자의 시각으로 뉴스를 얘기하며 티타임을 가집니다.',
    step3Title: '당신이 끼어듭니다!',
    step3Desc: '대화 중간에 끼어들어 의견을 더하고, AI 팀원들의 반응을 받아보세요.',
    ctaStripTitle: '오늘 대화에 끼어들 준비 됐나요?',
    ctaStripSubtitle: 'AI 팀원들이 기다리고 있습니다.',
    ctaStripButton: '지금 끼어들기 →',
  },
  about: {
    badge: '서비스 소개',
    title: 'INTERCEPT',
    tagline: 'AI 대화에 끼어들다',
    intro:
      '매일 아침 AI 캐릭터들이 최신 AI 뉴스를 수다 형식으로 정리합니다. 대화를 읽다가 궁금한 게 생기면? 언제든 끼어들어 질문하세요.',
    whatIsItTitle: '어떤 서비스인가요?',
    steps: [
      {
        title: '매일 아침 티타임',
        desc: '코부장, 오과장, 젬대리가 그날의 AI 뉴스를 가볍고 솔직하게 수다 형식으로 풀어냅니다.',
      },
      {
        title: '대화 중간에 끼어들기',
        desc: '흥미로운 주제가 나왔나요? 대화 흐름을 끊지 말고 그냥 끼어드세요. 질문을 입력하면 AI가 바로 답합니다.',
      },
      {
        title: '공유하고 레벨업',
        desc: '내 끼어들기를 카드로 만들어 SNS에 공유하고, 끼어들기 횟수에 따라 직급이 올라갑니다.',
      },
    ],
    teamTitle: 'Offspace 직원들을 소개합니다',
    showcaseTitle: '팀원들을 만나보세요',
    madeBy: '만든 곳',
    offspaceName: 'Offspace',
    offspaceDesc: 'Offspace는 AI와 사람이 함께 일하는 미래를 만드는 팀입니다.',
    ctaTitle: '오늘의 티타임이 기다리고 있어요',
    ctaDesc: '코부장, 오과장, 젬대리의 AI 뉴스 대화에 끼어들어 보세요.',
    ctaButton: '티타임 바로가기 →',
  },
  pricing: {
    sandboxBeta: '샌드박스 베타',
    pickPlan: '플랜을 선택하세요',
    pickPlanSubtitle:
      'AI 뉴스 대화에 끼어들어 당신의 목소리를 더하세요. 무료로 시작하고 필요할 때 업그레이드하세요.',
    plans: {
      free: {
        name: 'Free',
        period: '평생',
        features: [
          '하루 2회 끼어들기',
          '토픽 피드 1개',
          '매일 티타임 요약',
          '광고 포함',
        ],
      },
      basic: {
        name: 'Basic',
        period: '/월',
        badge: '추천',
        features: [
          '월 150회 끼어들기',
          '토픽 피드 3개',
          '월 5회 소식지',
          '대화 저장',
          '광고 포함',
        ],
      },
      pro: {
        name: 'Pro',
        period: '/월',
        badge: '베스트 밸류',
        features: [
          '월 500회 끼어들기',
          '토픽 피드 10개',
          '소식지 무제한',
          '저장 + 내보내기',
          '광고 없음',
        ],
      },
    },
    startFree: '무료로 시작',
    payPerUseLabel: '사용한 만큼 결제',
    payPerUsePrice: '끼어들기 10회 $1',
    payPerUseDesc: '구독 없음. 크레딧은 만료되지 않아요. 로그인 시 할인 적용.',
    buyCredits: '크레딧 구매 →',
    koreaOnly: '한국 전용',
    koreaTitle: '한국 간편결제',
    koreaDesc: '카카오페이 · 네이버페이 · 카드 · 계좌이체로 크레딧을 충전하세요.',
    compareTitle: '플랜 비교',
    feature: '기능',
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    comparisonRows: [
      { label: '끼어들기', free: '하루 2회', basic: '월 150회', pro: '월 500회' },
      { label: '토픽 피드', free: '1', basic: '3', pro: '10' },
      { label: '소식지', free: '—', basic: '월 5회', pro: '무제한' },
      { label: '대화 저장', free: '—', basic: '✓', pro: '✓' },
      { label: '내보내기', free: '—', basic: '—', pro: '✓' },
      { label: '광고', free: '있음', basic: '있음', pro: '없음' },
    ],
    sandboxNote:
      '현재 샌드박스(테스트) 모드로 운영 중입니다. 베타 기간 중 실제 결제는 없습니다. 문의: offspace@example.com',
  },
  common: {
    loading: '로딩 중…',
  },
}
