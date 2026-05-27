"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useLang } from "@/app/context/LangContext";
import { useTheme } from "next-themes";
import { ArrowRight, ArrowLeft, Eye, EyeOff, Sun, Moon, AtSign, Lock } from "lucide-react";

const translations = {
  en: {
    eyebrow: "SIGN IN",
    welcome: "Welcome",
    sub: "Sign in to your workspace",
    email: "Email address",
    password: "Password",
    btn: "Sign in",
    back: "Back to home",
    error: "Invalid credentials. Please try again.",
    rights: "All rights reserved · 2026",
    loading: "Verifying…",
    tagline1: "Build, measure,",
    tagline2: "iterate",
    tagline3: "— together.",
    tagSub: "Centralise clients, projects and specialised apps in one results-oriented workspace.",
  },
  es: {
    eyebrow: "INICIAR SESIÓN",
    welcome: "Bienvenido",
    sub: "Inicia sesión en tu espacio de trabajo",
    email: "Correo electrónico",
    password: "Contraseña",
    btn: "Iniciar sesión",
    back: "Volver a la página principal",
    error: "Credenciales inválidas. Inténtalo de nuevo.",
    rights: "Todos los derechos reservados · 2026",
    loading: "Verificando…",
    tagline1: "Build, measure,",
    tagline2: "iterate",
    tagline3: "— together.",
    tagSub: "Centraliza clientes, proyectos y apps especializadas en un solo espacio de trabajo orientado a resultados.",
  },
};

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.29),
      background: "#BD155C", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontFamily: "Instrument Serif, serif", fontSize: size * 0.65, color: "#fff", lineHeight: 1 }}>E</span>
    </div>
  );
}

export default function LoginPage({ goToLanding }: { goToLanding?: () => void }) {
  const { user, login } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const { lang, changeLang } = useLang();
  const { theme, setTheme } = useTheme();
  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRedirecting(true);
      router.push("/dashboard");
    }
  }, [user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch {
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  }

  if (user === undefined || redirecting) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0508", color: "rgba(255,255,255,0.5)", fontFamily: "JetBrains Mono, monospace", fontSize: 13, letterSpacing: "0.1em" }}>
        LOADING…
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh", width: "100vw" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* ── LEFT — branded panel ── */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #1A0A12 0%, #0A0508 100%)" }}>
        {/* Circuit SVG */}
        <svg
          viewBox="0 0 800 1000"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <radialGradient id="glowg" cx="0.5" cy="0.5">
              <stop offset="0" stopColor="#BD155C" stopOpacity="0.45" />
              <stop offset="1" stopColor="#BD155C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="400" cy="500" rx="380" ry="500" fill="url(#glowg)" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1={-200 + i * 60} y1={-100}
              x2={400 + i * 60} y2={1100}
              stroke="rgba(189,21,92,0.18)"
              strokeWidth={i % 5 === 0 ? 1.5 : 0.6}
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={`n${i}`}
              cx={120 + (i * 67) % 600}
              cy={120 + ((i * 137) % 800)}
              r={2.5}
              fill="#E73B85"
              opacity={0.5}
            />
          ))}
        </svg>

        {/* Left panel content */}
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 48, color: "white" }}>
          {/* Top brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LogoMark size={36} />
            <div>
              <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 19 }}>E-commetrics</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9.5, color: "rgba(255,255,255,0.45)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Workspace · Dashboard
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>
              ⎯⎯⎯&nbsp;&nbsp;GROWTH OPERATIONS
            </div>
            <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 52, fontWeight: 400, lineHeight: 1.02, letterSpacing: "-0.025em", color: "white", marginBottom: 20 }}>
              {t.tagline1}<br />
              <em style={{ color: "#E73B85", fontStyle: "italic" }}>{t.tagline2}</em> {t.tagline3}
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: "40ch", lineHeight: 1.6 }}>
              {t.tagSub}
            </p>
          </div>

          {/* Stats footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <div style={{ display: "flex", gap: 28 }}>
              {[["11", "Projects"], ["8", "Clients"], ["8", "Apps"]].map(([num, label]) => (
                <div key={label}>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Instrument Serif, serif", fontSize: 22, letterSpacing: "-0.01em" }}>{num}</div>
                  <div>{label}</div>
                </div>
              ))}
            </div>
            <div>© 2026</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div style={{ position: "relative", background: "var(--ec-surface-1)", display: "flex", flexDirection: "column" }}>
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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", background: "var(--ec-surface-2)",
              border: "1px solid var(--ec-hairline)", cursor: "pointer",
              color: "var(--ec-text-muted)", transition: "all 140ms",
            }}
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <form onSubmit={handleLogin} className="fade-in-up" style={{ width: "100%", maxWidth: 380 }}>
            {/* Eyebrow */}
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-brand)", marginBottom: 14 }}>
              ⎯⎯&nbsp;&nbsp;{t.eyebrow}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 48, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ec-text)", marginBottom: 8 }}>
              {t.welcome}
            </h1>
            <p style={{ color: "var(--ec-text-muted)", fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
              {t.sub}
            </p>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Email */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ec-text-muted)", marginBottom: 6 }}>
                  <AtSign size={11} /> {t.email}
                </label>
                <input
                  className="ec-field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "JetBrains Mono, monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ec-text-muted)", marginBottom: 6 }}>
                  <Lock size={11} /> {t.password}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="ec-field-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ec-text-muted)", padding: 0, display: "flex" }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="ec-btn-primary"
                style={{ width: "100%", height: 48, fontSize: 15, marginTop: 8, justifyContent: "center", gap: 10 }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                    {t.loading}
                  </>
                ) : (
                  <>
                    {t.btn}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <div style={{ flex: 1, height: 1, background: "var(--ec-hairline)" }} />
                <span style={{ fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10, color: "var(--ec-text-muted)" }}>
                  o vuelve
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--ec-hairline)" }} />
              </div>

              {/* Back button */}
              <button
                type="button"
                onClick={() => goToLanding?.()}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  alignSelf: "center", background: "none", border: "none",
                  cursor: "pointer", color: "var(--ec-text-muted)",
                  fontSize: 13, fontWeight: 500, padding: "6px 0",
                  transition: "color 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ec-text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ec-text-muted)")}
              >
                <ArrowLeft size={14} />
                {t.back}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "var(--ec-text-muted)", letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--ec-hairline)" }}>
          <span>{t.rights}</span>
          <span>E-COMMETRICS</span>
        </div>
      </div>
    </div>
  );
}
