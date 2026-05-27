"use client";

import { useState, Suspense, lazy, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "@/components/login";
import { useLang } from "@/app/context/LangContext";
import { useTheme } from "next-themes";
import { ArrowRight, Layout, Compass, Sun, Moon } from "lucide-react";

const LazyLanding = lazy(() => import("@/components/landing"));

type SelectedOption = "login" | "landing" | null;
type Lang = "es" | "en";

const translations = {
  es: {
    title: "¿Qué deseas hacer?",
    subtitle: "Continúa al panel de gestión o conoce más sobre la plataforma.",
    login: "Ingresar al Dashboard",
    explore: "Conocer E-commetrics",
    loading: "Cargando información...",
    systems: "Todos los sistemas activos",
  },
  en: {
    title: "What would you like to do?",
    subtitle: "Continue to the management panel or learn more about the platform.",
    login: "Go to Dashboard",
    explore: "Explore E-commetrics",
    loading: "Loading information...",
    systems: "All systems online",
  },
};

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.29),
      background: "var(--ec-brand)", display: "flex",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: "Instrument Serif, serif", fontSize: size * 0.65, color: "#fff", lineHeight: 1 }}>E</span>
    </div>
  );
}

export default function Page() {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const goToLogin = () => setSelectedOption("login");
  const goToLanding = () => setSelectedOption("landing");

  const { lang, changeLang } = useLang();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const existingLang = document.cookie.match(
      /(?:^|;\s*)lang=(en|es)/
    )?.[1] as Lang | undefined;

    if (!existingLang) {
      document.cookie = "lang=es; path=/; max-age=31536000";
      changeLang("es");
    } else {
      changeLang(existingLang);
    }
  }, []);

  const t = translations[lang];

  return (
    <div className="overflow-x-hidden min-h-screen">
      <AnimatePresence>
        {selectedOption === null && (
          <motion.div
            key="entry"
            style={{ position: "fixed", inset: 0, overflow: "hidden" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* Background layers */}
            <div className="hero-bg" />
            <div className="hero-grid" />

            {/* Top-left brand */}
            <div style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
              <LogoMark size={28} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 17, color: "white" }}>
                  E-commetrics
                </span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Workspace
                </span>
              </div>
            </div>

            {/* Top-right controls */}
            <div style={{ position: "absolute", top: 24, right: 24, display: "flex", gap: 8, zIndex: 10 }}>
              <div className="entry-toggle-pill">
                <button
                  className={lang === "es" ? "active" : ""}
                  onClick={() => { changeLang("es"); document.cookie = "lang=es; path=/; max-age=31536000"; }}
                >
                  ES
                </button>
                <button
                  className={lang === "en" ? "active" : ""}
                  onClick={() => { changeLang("en"); document.cookie = "lang=en; path=/; max-age=31536000"; }}
                >
                  EN
                </button>
              </div>
              <button
                className="entry-icon-btn"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            {/* Center card */}
            <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
              <motion.div
                className="fade-in-up"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                style={{
                  width: "min(520px, calc(100% - 32px))",
                  background: "rgba(18,12,18,0.65)",
                  backdropFilter: "blur(28px) saturate(140%)",
                  WebkitBackdropFilter: "blur(28px) saturate(140%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 22,
                  padding: 36,
                  boxShadow: "0 32px 80px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                  color: "white",
                }}
              >
                {/* Eyebrow */}
                <div style={{
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
                  marginBottom: 18,
                }}>
                  ⎯⎯⎯&nbsp;&nbsp;START HERE
                </div>

                {/* Title */}
                <h1 style={{
                  fontFamily: "Instrument Serif, serif",
                  fontWeight: 400, fontSize: 42, lineHeight: 1.05,
                  letterSpacing: "-0.02em", color: "white", marginBottom: 10,
                }}>
                  {t.title}
                </h1>

                {/* Subtitle */}
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 28, maxWidth: "36ch", lineHeight: 1.55 }}>
                  {t.subtitle}
                </p>

                {/* Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Dashboard button */}
                  <button
                    onClick={goToLogin}
                    onMouseEnter={() => setHoverIdx(0)}
                    onMouseLeave={() => setHoverIdx(null)}
                    style={{
                      position: "relative",
                      padding: "18px 22px",
                      background: hoverIdx === 0 ? "#E73B85" : "#BD155C",
                      color: "white",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 500,
                      display: "flex", alignItems: "center",
                      border: "none", cursor: "pointer",
                      transition: "all 240ms cubic-bezier(.2,.7,.2,1)",
                      transform: hoverIdx === 0 ? "translateY(-2px)" : "none",
                      boxShadow: hoverIdx === 0
                        ? "0 16px 40px -12px rgba(189,21,92,0.7), 0 0 0 1px #E73B85"
                        : "0 6px 16px -6px rgba(189,21,92,0.5), 0 0 0 1px #BD155C",
                      overflow: "hidden",
                    }}
                  >
                    <Layout size={18} style={{ marginRight: 14, opacity: 0.9, flexShrink: 0 }} />
                    <span>{t.login}</span>
                    <ArrowRight
                      size={16}
                      style={{
                        marginLeft: "auto",
                        transform: hoverIdx === 0 ? "translateX(4px)" : "none",
                        transition: "transform 200ms",
                      }}
                    />
                  </button>

                  {/* Explore button */}
                  <button
                    onClick={goToLanding}
                    onMouseEnter={() => setHoverIdx(1)}
                    onMouseLeave={() => setHoverIdx(null)}
                    style={{
                      padding: "18px 22px",
                      background: hoverIdx === 1 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                      color: "white",
                      borderRadius: 14,
                      fontSize: 15,
                      fontWeight: 500,
                      display: "flex", alignItems: "center",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      transition: "all 240ms cubic-bezier(.2,.7,.2,1)",
                      transform: hoverIdx === 1 ? "translateY(-2px)" : "none",
                    }}
                  >
                    <Compass size={18} style={{ marginRight: 14, opacity: 0.9, flexShrink: 0 }} />
                    <span>{t.explore}</span>
                    <ArrowRight
                      size={16}
                      style={{
                        marginLeft: "auto",
                        opacity: 0.6,
                        transform: hoverIdx === 1 ? "translateX(4px)" : "none",
                        transition: "transform 200ms",
                      }}
                    />
                  </button>
                </div>

                {/* Footer meta */}
                <div style={{
                  marginTop: 28, paddingTop: 20,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
                  fontSize: 10.5, color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>
                  <span>v2.0 · 2026</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                    {t.systems}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Bottom-left label */}
            <div style={{
              position: "absolute", bottom: 18, left: 24,
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 10, color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.15em", zIndex: 2,
            }}>
              E-COMMETRICS · WORKSPACE · 2026
            </div>

            {/* Bottom-right label */}
            <div style={{
              position: "absolute", bottom: 18, right: 24,
              fontFamily: "var(--font-jetbrains-mono), JetBrains Mono, monospace",
              fontSize: 10, color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.15em", zIndex: 2,
            }}>
              SECURE · ENCRYPTED · MX
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOption === "login" && <Login goToLanding={goToLanding} />}

      {selectedOption === "landing" && (
        <Suspense fallback={<div className="text-center py-10">{t.loading}</div>}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LazyLanding goToLogin={goToLogin} />
          </motion.div>
        </Suspense>
      )}
    </div>
  );
}
