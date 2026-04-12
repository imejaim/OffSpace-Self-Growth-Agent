export type Locale = 'en' | 'ko'

export interface Translations {
  // Header / Nav
  nav: {
    teatime: string
    feed: string
    my: string
    pricing: string
    about: string
    feedback: string
    menuOpen: string
  }
  header: {
    subtitle: string
  }
  footer: {
    copyright: string
    teatime: string
    about: string
    feedback: string
  }
  // Auth / Login
  auth: {
    signIn: string
    signOut: string
    guestOnly: string
    defaultUser: string
    signInRequired: string
    changeNickname: string
  }
  // Characters
  characters: {
    ko: {
      name: string
      role: string
      description: string
    }
    oh: {
      name: string
      role: string
      description: string
    }
    jem: {
      name: string
      role: string
      description: string
    }
  }
  // Home page
  home: {
    todayBadge: string
    heroTitleA: string
    heroTitleHighlight: string
    heroTitleB: string
    heroSubtitleLine1: string
    heroSubtitleStrong: string
    ctaViewToday: string
    ctaHowItWorks: string
    todayTeatime: string
    topicsCount: (n: number) => string
    interceptPrompt: string
    viewFullConversation: string
    howItWorksTitle: string
    step1Title: string
    step1Desc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
    ctaStripTitle: string
    ctaStripSubtitle: string
    ctaStripButton: string
  }
  // About page
  about: {
    badge: string
    title: string
    tagline: string
    intro: string
    whatIsItTitle: string
    steps: Array<{ title: string; desc: string }>
    teamTitle: string
    showcaseTitle: string
    madeBy: string
    offspaceName: string
    offspaceDesc: string
    ctaTitle: string
    ctaDesc: string
    ctaButton: string
  }
  // Pricing page
  pricing: {
    sandboxBeta: string
    pickPlan: string
    pickPlanSubtitle: string
    plans: {
      free: { name: string; period: string; features: string[] }
      basic: { name: string; period: string; badge: string; features: string[] }
      pro: { name: string; period: string; badge: string; features: string[] }
    }
    startFree: string
    payPerUseLabel: string
    payPerUsePrice: string
    payPerUseDesc: string
    buyCredits: string
    koreaOnly: string
    koreaTitle: string
    koreaDesc: string
    compareTitle: string
    feature: string
    free: string
    basic: string
    pro: string
    comparisonRows: Array<{ label: string; free: string; basic: string; pro: string }>
    sandboxNote: string
  }
  // Common
  common: {
    loading: string
    you: string
  }
  // 3-tier carousel navigation
  carousel: {
    myKeep: string
    instantPage: string
    sns: string
    prevPage: string
    nextPage: string
    myKeepPeek: string
    instantPagePeek: string
    snsPeek: string
  }
  // My Keep page
  my: {
    title: string
    subtitle: string
    searchPlaceholder: string
    signInPrompt: string
    goHome: string
    emptyTitle: string
    emptyDesc: string
    emptyHint: string
    emptyForSearch: (q: string) => string
    howStep1: string
    howStep2: string
    howStep3: string
    goToTeatime: string
    loadFailed: string
    loadMore: string
    loading: string
    tabIntercepts: string
    tabNewsletters: string
    newsletterEmpty: string
  }
  // Newsletter page
  newsletter: {
    title: string
    subtitle: string
    hotNews: string
    myInterest: string
    behindNews: string
    placeholderInterest: string
    placeholderHotNews: string
    placeholderBehindNews: string
    format: string
    brief: string
    detailed: string
    generate: string
    generating: string
    remaining: (n: number) => string
    yourNewsletter: string
    signInRequired: string
    signInDesc: string
    goHome: string
    paidFeature: string
    upgradeDesc: string
    seePricing: string
  }
  // Feed page
  feed: {
    title: string
    subtitle: string
    tabAll: string
    tabFollowing: string
    refresh: string
    loadFailed: string
    noFollowing: string
    noPublic: string
    loadMore: string
    authRequired: string
    followSuccess: string
    unfollowSuccess: string
    followFailed: string
  }
  // Teatime page
  teatime: {
    offspaceTeatime: string
    interceptHint: string
    interceptButton: string
    referenceLinks: string
    footerDesc: string
    editTopicHint: string
    chatterButton: string
    chatterGenerating: string
    chatterRegenerate: string
    chatterRevert: string
    chatterReplaceFailed: string
    chatterAiGenerated: string
    keepButton: string
    publishButton: string
    saveSuccess: string
    publishSuccess: string
    interceptPanelTitle: string
    interceptPlaceholder: string
    interceptSend: string
    interceptClose: string
    interceptInputAria: string
    interceptNetworkError: string
  }
}
