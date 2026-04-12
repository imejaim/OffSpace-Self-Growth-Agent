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
  }
}
