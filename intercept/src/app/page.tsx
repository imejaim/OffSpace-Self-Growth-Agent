'use client'

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/context";

const TODAY = "2026-04-12";
const TODAY_TOPIC_COUNT = 5;

/* ── Step card ── */
function StepCard({
  step,
  title,
  desc,
  accent,
}: {
  step: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: "1.75rem", textAlign: "center", flex: "1 1 220px" }}
    >
      <div
        style={{
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          background: accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: "1.125rem",
          margin: "0 auto 1rem",
        }}
      >
        {step}
      </div>
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--color-navy)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
        {desc}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div>
      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--color-bg)",
          padding: "5rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "55rem", margin: "0 auto" }}>
          {/* eyebrow label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--color-bg-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-pill)",
              padding: "0.35rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-coral-dark)",
              marginBottom: "1.75rem",
              letterSpacing: "0.02em",
            }}
          >
            <span>{t.home.todayBadge} — {TODAY}</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 900,
              color: "var(--color-navy)",
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem",
            }}
          >
            {t.home.heroTitleA}{" "}
            <span style={{ color: "var(--color-coral)" }}>{t.home.heroTitleHighlight}</span>
            <br />
            {t.home.heroTitleB}
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            {t.home.heroSubtitleLine1}
            <br />
            <strong style={{ color: "var(--color-navy)" }}>{t.home.heroSubtitleStrong}</strong>
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/teatime" className="btn-primary" style={{ fontSize: "1rem" }}>
              {t.home.ctaViewToday}
            </Link>
            <a href="#how-it-works" className="btn-outline" style={{ fontSize: "1rem" }}>
              {t.home.ctaHowItWorks}
            </a>
          </div>

          {/* Character avatars row */}
          <div
            style={{
              marginTop: "3rem",
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { name: "ko" as const, label: t.characters.ko.name, avatar: "/characters/Ko-bujang.svg" },
              { name: "oh" as const, label: t.characters.oh.name, avatar: "/characters/Oh-gwajang.svg" },
              { name: "jem" as const, label: t.characters.jem.name, avatar: "/characters/Jem-daeri.svg" },
            ].map(({ name, label, avatar }) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Image
                  src={avatar}
                  alt={label}
                  width={64}
                  height={64}
                  style={{
                    borderRadius: "var(--radius-md)",
                    imageRendering: "pixelated",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color:
                      name === "ko"
                        ? "var(--color-ko)"
                        : name === "oh"
                        ? "var(--color-oh)"
                        : "var(--color-jem)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TODAY'S PREVIEW CARD ═══════════════════════════════════════ */}
      <section style={{ padding: "0 1.5rem 4rem" }}>
        <div style={{ maxWidth: "55rem", margin: "0 auto" }}>
          <div
            className="card"
            style={{
              padding: "2rem",
              borderLeft: "4px solid var(--color-coral)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-coral)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "0.35rem",
                  }}
                >
                  {t.home.todayTeatime}
                </p>
                <h2
                  style={{
                    fontSize: "1.375rem",
                    fontWeight: 800,
                    color: "var(--color-navy)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {TODAY}
                </h2>
              </div>
              <span
                style={{
                  background: "var(--color-bg-muted)",
                  color: "var(--color-coral-dark)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--color-border)",
                  whiteSpace: "nowrap",
                }}
              >
                {t.home.topicsCount(TODAY_TOPIC_COUNT)}
              </span>
            </div>

            {/* Sample conversation preview — left in original Korean (AI-generated content) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                {
                  name: "ko" as const,
                  label: t.characters.ko.name,
                  avatar: "/characters/Ko-bujang.svg",
                  text: "OpenAI $122B 펀딩 마감이 역대급인데, IPO도 올해 안에 간다더라.",
                },
                {
                  name: "oh" as const,
                  label: t.characters.oh.name,
                  avatar: "/characters/Oh-gwajang.svg",
                  text: "반도체 매출 49% 급증 전망까지. 근데 Anthropic Conway 소식 봤어요?",
                },
                {
                  name: "jem" as const,
                  label: t.characters.jem.name,
                  avatar: "/characters/Jem-daeri.svg",
                  text: "Gemma 4가 Apache 2.0으로 바뀌었어요! 드디어 진짜 오픈소스!",
                },
              ].map(({ name, label, avatar, text }) => (
                <div
                  key={name}
                  style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
                >
                  <Image
                    src={avatar}
                    alt={label}
                    width={28}
                    height={28}
                    style={{
                      borderRadius: "4px",
                      imageRendering: "pixelated",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color:
                          name === "ko"
                            ? "var(--color-ko)"
                            : name === "oh"
                            ? "var(--color-oh)"
                            : "var(--color-jem)",
                        marginRight: "0.5rem",
                      }}
                    >
                      {label}:
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>
                      {text}
                    </span>
                  </div>
                </div>
              ))}

              {/* Intercept prompt */}
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.875rem 1rem",
                  background: "var(--color-bg-muted)",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px dashed var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <span>{t.home.interceptPrompt}</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link
                href="/teatime"
                className="btn-primary"
                style={{ fontSize: "0.9rem", padding: "0.625rem 1.5rem" }}
              >
                {t.home.viewFullConversation}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{
          background: "var(--color-bg-muted)",
          padding: "4rem 1.5rem",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="section-divider" />
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                color: "var(--color-navy)",
                letterSpacing: "-0.02em",
              }}
            >
              {t.home.howItWorksTitle}
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <StepCard
              step="①"
              title={t.home.step1Title}
              desc={t.home.step1Desc}
              accent="var(--color-ko)"
            />
            <StepCard
              step="②"
              title={t.home.step2Title}
              desc={t.home.step2Desc}
              accent="var(--color-oh)"
            />
            <StepCard
              step="③"
              title={t.home.step3Title}
              desc={t.home.step3Desc}
              accent="var(--color-coral)"
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA STRIP ════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "4rem 1.5rem",
          textAlign: "center",
          background: "var(--color-bg)",
        }}
      >
        <div style={{ maxWidth: "36rem", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(1.375rem, 3vw, 1.875rem)",
              fontWeight: 800,
              color: "var(--color-navy)",
              letterSpacing: "-0.02em",
              marginBottom: "0.75rem",
            }}
          >
            {t.home.ctaStripTitle}
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginBottom: "1.75rem",
              fontSize: "1rem",
            }}
          >
            {t.home.ctaStripSubtitle}
          </p>
          <Link href="/teatime" className="btn-primary" style={{ fontSize: "1rem" }}>
            {t.home.ctaStripButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
