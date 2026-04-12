# CLAUDE.md

## Project Identity

**Intercept (끼어들기)** — Personal news platform where users define their own topics and an AI character team (코부장·오과장·젬대리) turns them into a fresh conversational news brief every morning. Users can "intercept" the conversation with their own questions and takes.

**Identity pivot (2026-04-12)**: Formerly positioned as an "AI news" service (about AI/tech news). Now pivoted to "당신만의 뉴스 / Your news, your way" — the topics belong to the user; the AI team is the delivery mechanism, not the subject.

- **Service**: Global SaaS, English default + i18n (Korean priority)
- **Stage**: MVP development (Phase 0~2 in progress)
- **GitHub**: https://github.com/imejaim/OffSpace-Self-Growth-Agent

## Dual Goals

1. **Daily Publishing** — Teatime conversations by 코부장·오과장·젬대리 (demo content showcasing the service), posted to Tistory blog
2. **Service Launch** — Users pick their own topics, the AI team turns them into personal news, users intercept the conversation and share on social feed

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16.2.2, React 19, Tailwind 4 |
| Backend | Next.js App Router (Route Handlers, `nodejs` runtime) |
| DB/Auth | Supabase (us-east-1) — Google OAuth + Anonymous |
| Payments | PayPal (global) + PortOne/NaverPay (Korea) |
| AI Models | Cloudflare Workers AI Gemma 4 (intercepts) / Gemini 2.5-flash (newsletters) |
| Deploy | Cloudflare Pages |
| Dev server | `localhost:3000` / PM2 port `4000` |

## Pricing (Confirmed 2026-04-10)

| Plan | Price | Intercepts | Topics | Newsletter | Save | Ads |
|------|-------|-----------|--------|------------|------|-----|
| Free | $0 | 2/day (~60/mo) | 1 | No | No | Yes |
| Basic | $2.99/mo | 150/mo | 3 | 5/mo | Yes | Yes |
| Pro | $8/mo | 500/mo | 10 | Unlimited | Yes+Export | No |
| Pay-per-use | $1/10 | Credits | — | — | If logged in | — |

## Core Product: Custom Newsletter

3-topic structure (user customizable):
1. **Hot News** — trending across all categories
2. **My Interest** — user-defined topic (free text input)
3. **Behind-the-News** — community voices from Reddit/Discord/X/YouTube (젬대리's domain)

## Strategy

- **Social = #1 moat** — network effects defend against BigTech copying
- **Sponsorship + Subscription** dual revenue (ads with character reactions)
- **12~18 month window** before platform giants add character news features

## Characters

| Character | File | Color | Role |
|-----------|------|-------|------|
| 코부장 | `Ko-bujang.svg` | Orange bear-cat | Tech analysis, team lead |
| 오과장 | `Oh-gwajang.svg` | Green frog | Facts/numbers, planning |
| 젬대리 | `Jem-daeri.svg` | Indigo cat | Community catch, behind-the-news |

Pixel art style — `imageRendering: 'pixelated'`

## Agent Role: 코부장 = Commander Only

- **DO**: Orchestrate agents, review results, communicate with 대표님
- **DO NOT**: Write code directly — delegate to executor/reviewer agents
- **QA**: Use verifier/code-reviewer agents, not manual inspection

## Language

- **UI/Service**: English default + i18n (Korean priority)
- **Internal docs/commits**: Korean
- **Code**: English variable/function names

## Key References

- **Ultra Plan**: `.omc/plans/intercept-login-payment-social.md` (Round 3)
- **Teatime Rules**: `.claude/rules/teatime.md` (path-scoped, loads only for teatime work)
- **Session Handoff**: `output/SESSION_HANDOFF.md`
- **Memory**: `~/.claude/projects/.../memory/MEMORY.md`

<!-- Maintainer: Last updated 2026-04-11. Blackwell servers NOT available for Intercept. -->
