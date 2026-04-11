import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { LoginButton } from "@/components/LoginButton";
import { NavMenu } from "@/components/NavMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intercept — AI 대화에 끼어들다",
  description: "AI 캐릭터들의 뉴스 대화에 당신도 끼어들 수 있습니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: "var(--color-bg)" }}>
        <AuthProvider>
        {/* ── Header ── */}
        <header
          style={{
            background: "var(--color-bg-card)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              maxWidth: "72rem",
              margin: "0 auto",
              padding: "0 1.5rem",
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", textDecoration: "none" }}>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "var(--color-coral)",
                }}
              >
                INTERCEPT
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.01em",
                }}
              >
                AI 대화에 끼어들다
              </span>
            </a>

            {/* Nav */}
            <NavMenu />
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1">{children}</main>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            padding: "2rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "72rem",
              margin: "0 auto",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              © 2026 Offspace
            </span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <a href="/teatime" className="footer-link">티타임</a>
              <a href="/about" className="footer-link">소개</a>
              <a href="/feedback" className="footer-link">피드백</a>
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
