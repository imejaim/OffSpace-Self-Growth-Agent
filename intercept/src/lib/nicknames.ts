/**
 * Nickname generator for Intercept news service
 * Provides fun Korean-English mixed nicknames suitable for an AI news platform
 */

const NICKNAMES = [
  // Korean-English mixed
  "궁금한판다",
  "뉴스헌터42",
  "호기심토끼",
  "인터셉터99",
  "떡밥탐정",
  "소식통이오",
  "정보파이롯",
  "뉴스나인",
  "큐레이터랩",
  "뉴스버디",
  "트렌드스타",
  "정보사냥꾼",
  "뉴스스파이",
  "톡톡정보",
  "최신파이",
  "뉴스리더",
  "뉴스킹",
  "끼어든자",
  "뉴스핵터",
  "정보꾼",

  // English
  "CuriousCat",
  "BreakingBear",
  "NewsNinja",
  "PixelPenguin",
  "NewsHunter",
  "InfoSeeker",
  "TrendSpotter",
  "NewsWhisperer",
  "ByteReader",
  "DataDetective",
  "NewsGatherer",
  "InfoJunkie",
  "NewsVoyager",
  "CurioBot",
  "NewsAlpha",
  "InsightHawk",
  "NewsWatcher",
  "TechSnooper",
  "StoryFinder",
  "NewsEagle",
];

/**
 * Generate a random nickname with a 2-digit number suffix
 * @returns Random nickname (e.g., "궁금한판다42")
 */
export function generateNickname(): string {
  const nickname = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  const suffix = Math.floor(Math.random() * 100);
  return `${nickname}${suffix}`;
}

/**
 * Generate a unique nickname that doesn't exist in the provided set
 * @param existing Set of already-used nicknames
 * @returns Unique nickname not in the existing set
 */
export function generateUniqueNickname(existing: Set<string>): string {
  let nickname: string;
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    nickname = generateNickname();
    attempts++;
  } while (existing.has(nickname) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    throw new Error(
      "Unable to generate unique nickname after 1000 attempts. Too many existing nicknames."
    );
  }

  return nickname;
}

/**
 * Get the full list of available base nicknames (without number suffix)
 * @returns Array of 40+ base nicknames
 */
export function getNicknamesList(): string[] {
  return [...NICKNAMES];
}
