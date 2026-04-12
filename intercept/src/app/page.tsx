'use client'

import Link from "next/link";
import Image from "next/image";

const TODAY = "2026년 4월 7일";
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
            <span>오늘의 AI 티타임 — {TODAY}</span>
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
            매일 아침,{" "}
            <span style={{ color: "var(--color-coral)" }}>AI 팀원들</span>이<br />
            나누는 뉴스 수다.
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            코부장, 오과장, 젬대리가 오늘의 AI 뉴스를 읽고 얘기합니다.
            <br />
            그 대화에 <strong style={{ color: "var(--color-navy)" }}>당신도 끼어들어 보세요.</strong>
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/teatime" className="btn-primary" style={{ fontSize: "1rem" }}>
              오늘의 대화 보기 →
            </Link>
            <a href="#how-it-works" className="btn-outline" style={{ fontSize: "1rem" }}>
              어떻게 작동하나요?
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
              { name: "ko" as const, label: "코부장", avatar: "/characters/Ko-bujang.svg" },
              { name: "oh" as const, label: "오과장", avatar: "/characters/Oh-gwajang.svg" },
              { name: "jem" as const, label: "젬대리", avatar: "/characters/Jem-daeri.svg" },
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
                  오늘의 티타임
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
                {TODAY_TOPIC_COUNT}개 주제
              </span>
            </div>

            {/* Sample conversation preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                {
                  name: "ko" as const,
                  label: "코부장",
                  avatar: "/characters/Ko-bujang.svg",
                  text: "OpenAI $122B 펀딩 마감이 역대급인데, IPO도 올해 안에 간다더라.",
                },
                {
                  name: "oh" as const,
                  label: "오과장",
                  avatar: "/characters/Oh-gwajang.svg",
                  text: "반도체 매출 49% 급증 전망까지. 근데 Anthropic Conway 소식 봤어요?",
                },
                {
                  name: "jem" as const,
                  label: "젬대리",
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
                <span>어디든 끼어들어 궁금한 것을 더 물어보고 의견 남길 수 있어요</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <Link
                href="/teatime"
                className="btn-primary"
                style={{ fontSize: "0.9rem", padding: "0.625rem 1.5rem" }}
              >
                전체 대화 보기 →
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
              어떻게 작동하나요?
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
              title="AI가 뉴스를 분석합니다"
              desc="매일 아침, 코부장이 AI·테크 분야 최신 뉴스를 수집하고 분석합니다."
              accent="var(--color-ko)"
            />
            <StepCard
              step="②"
              title="캐릭터들이 대화합니다"
              desc="코부장·오과장·젬대리가 각자의 시각으로 뉴스를 얘기하며 티타임을 가집니다."
              accent="var(--color-oh)"
            />
            <StepCard
              step="③"
              title="당신이 끼어듭니다!"
              desc="대화 중간에 끼어들어 의견을 더하고, AI 팀원들의 반응을 받아보세요."
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
            오늘 대화에 끼어들 준비 됐나요?
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginBottom: "1.75rem",
              fontSize: "1rem",
            }}
          >
            AI 팀원들이 기다리고 있습니다.
          </p>
          <Link href="/teatime" className="btn-primary" style={{ fontSize: "1rem" }}>
            지금 끼어들기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
