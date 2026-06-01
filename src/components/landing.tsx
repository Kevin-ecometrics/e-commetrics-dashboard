"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Packages from "@/components/packages";
import { useLang } from "@/app/context/LangContext";
import { ArrowRight, ArrowLeft, Mail, X, Sun, Moon, Phone, ExternalLink } from "lucide-react";
import { useTheme } from "next-themes";

type Locale = "en" | "es";

type Skill = {
  id: number;
  title: string;
  percent: number;
  icon: React.ReactNode;
  description: string;
};

type Service = {
  id: number;
  key: string;
  title: string;
  description: string;
  desc2: string;
  banner: string;
};

type ConsultingItem = {
  id: number;
  title: string;
  desc: string;
  image: string;
  icon: string;
  hoverColor: string;
};

/* ─── Hero ───────────────────────────────────────────────── */
const Hero = ({ locale, goToLogin }: { locale: Locale; goToLogin: () => void }) => {
  const words =
    locale === "en"
      ? ["Simplify", "Elevate", "Innovate", "E-commetrics"]
      : ["Simplifica", "Eleva", "Innova", "E-commetrics"];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "72vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        overflow: "hidden",
        background: "var(--ec-hero-base)",
      }}
    >
      {/* Brand radial glow — subtle in light, cinematic in dark */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 60% at 75% 50%, var(--ec-hero-glow-a), transparent 60%), " +
            "radial-gradient(ellipse 50% 80% at 10% 90%, var(--ec-hero-glow-b), transparent 60%)",
        }}
      />
      {/* Grid */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `linear-gradient(var(--ec-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ec-grid-line) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Back button */}
      <button
        onClick={goToLogin}
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "var(--ec-surface-2)",
          border: "1px solid var(--ec-hairline-strong)",
          borderRadius: 8,
          padding: "7px 13px",
          color: "var(--ec-text-muted)",
          fontSize: 12,
          cursor: "pointer",
          fontFamily: "var(--font-jetbrains-mono), monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          transition: "all 160ms",
          zIndex: 10,
        }}
      >
        <ArrowLeft size={13} />
        {locale === "en" ? "Back" : "Volver"}
      </button>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 24px", maxWidth: 760, width: "100%" }}>
        <div className="h-eyebrow" style={{ marginBottom: 20, letterSpacing: "0.2em" }}>
          ⎯⎯⎯&nbsp;&nbsp;E-COMMETRICS · PLATFORM
        </div>

        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), Instrument Serif, serif",
            fontWeight: 400,
            fontSize: "clamp(52px, 9vw, 96px)",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "var(--ec-text)",
            marginBottom: 24,
            minHeight: "1.05em",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              style={{ display: "block" }}
            >
              {words[idx]}
            </motion.span>
          </AnimatePresence>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2.2vw, 19px)",
            color: "var(--ec-text-muted)",
            lineHeight: 1.55,
            maxWidth: "54ch",
            margin: "0 auto 36px",
          }}
        >
          {locale === "en"
            ? "Smart websites. Consulting and development in one place."
            : "Páginas web inteligentes. Consultoría y desarrollo en un solo lugar."}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => document.getElementById("lp-services")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              padding: "14px 28px",
              background: "var(--ec-brand)",
              color: "#fff",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 200ms",
              boxShadow: "0 8px 24px -8px rgba(189,21,92,0.5)",
            }}
          >
            {locale === "en" ? "Our Services" : "Nuestros Servicios"}
            <ArrowRight size={15} />
          </button>
          <button
            onClick={goToLogin}
            style={{
              padding: "14px 28px",
              background: "var(--ec-surface-2)",
              color: "var(--ec-text)",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              border: "1px solid var(--ec-hairline-strong)",
              cursor: "pointer",
              transition: "all 200ms",
            }}
          >
            {locale === "en" ? "Go to Dashboard" : "Ir al Dashboard"}
          </button>
        </div>
      </div>
    </section>
  );
};

/* ─── Skills ─────────────────────────────────────────────── */
const Skills = ({ locale }: { locale: Locale }) => {
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [percentages, setPercentages] = useState<number[]>([0, 0, 0, 0]);
  const animRef = useRef<number | null>(null);

  const skills: Skill[] = [
    {
      id: 1,
      title: locale === "en" ? "Strategic Consulting" : "Consultoría Estratégica",
      percent: 100,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      description:
        locale === "en"
          ? "Our recipe for success ensures safe planning based on projections and results."
          : "Nuestra receta para el éxito garantiza una planificación segura sobre proyecciones y resultados.",
    },
    {
      id: 2,
      title: locale === "en" ? "Google & Meta Optimization" : "Optimización Google y Meta",
      percent: 100,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
        </svg>
      ),
      description:
        locale === "en"
          ? "Google owns 93%+ of search intent. We put your brand where decisions happen."
          : "GOOGLE posee más del 93% de la intención de búsqueda. Ponemos tu marca donde ocurren las decisiones.",
    },
    {
      id: 3,
      title: locale === "en" ? "Marketing & Sales Automation" : "Automatización de Marketing",
      percent: 100,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      description:
        locale === "en"
          ? "Improve lead acquisition and conversions with top-tier growth hacking techniques."
          : "Mejora la adquisición de leads y conversiones con técnicas de growth hacking de primer nivel.",
    },
    {
      id: 4,
      title: locale === "en" ? "Corporate Analytics" : "Análisis Corporativo",
      percent: 100,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description:
        locale === "en"
          ? "Gain precise knowledge and time to capture inbound leads and sell nonstop."
          : "Obtén conocimiento preciso y tiempo para captar leads entrantes y vender sin parar.",
    },
  ];

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (hoveredSkill !== null) {
      let cur = 0;
      const target = skills[hoveredSkill].percent;
      const tick = () => {
        cur = Math.min(cur + 3, target);
        setPercentages((p) => p.map((v, i) => (i === hoveredSkill ? cur : 0)));
        if (cur < target) animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } else {
      setPercentages([0, 0, 0, 0]);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [hoveredSkill]);

  return (
    <section
      id="lp-skills"
      className="circuit-bg"
      style={{ background: "var(--ec-surface-1)", padding: "80px 40px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start", marginBottom: 56 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 14 }}>
              {locale === "en" ? "⎯⎯⎯  METHODOLOGY" : "⎯⎯⎯  METODOLOGÍA"}
            </div>
            <h2
              className="ec-page-title"
              style={{ marginBottom: 16 }}
            >
              {locale === "en" ? "How to do it right online?" : "¿Cómo hacerlo bien en línea?"}
            </h2>
            <p className="ec-page-subtitle">
              {locale === "en"
                ? "With 10+ years in e-Commerce, we've guided brands through digital transformation — creating visually sophisticated, technologically innovative web platforms."
                : "En más de 10 años de experiencia en e-Commerce hemos acompañado a marcas a lo largo de su transformación digital creando sitios web visualmente sofisticados y tecnológicamente innovadores."}
            </p>
          </div>

          <div
            style={{
              background: "var(--ec-surface-2)",
              border: "1px solid var(--ec-hairline-strong)",
              borderRadius: 16,
              padding: "22px 24px",
            }}
          >
            <div className="h-eyebrow" style={{ marginBottom: 12 }}>
              {locale === "en" ? "DIGITAL ECOSYSTEM" : "ECOSISTEMA DIGITAL"}
            </div>
            <p style={{ color: "var(--ec-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
              {locale === "en"
                ? "You'll walk in your own digital ecosystem, putting your business alongside your customers' Visas and Mastercards."
                : "Caminarás en tu propio ecosistema digital poniendo tu negocio al lado de las Visas y Mastercards de tus Clientes."}
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {["E-Commerce", "SEO", "Meta Ads", "Google Ads"].map((tag) => (
                <span key={tag} className="ec-badge ec-badge-brand ec-badge-mono">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills cards */}
        <div
          className="stagger-children"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}
        >
          {skills.map((skill, i) => (
            <div
              key={skill.id}
              onMouseEnter={() => setHoveredSkill(i)}
              onMouseLeave={() => setHoveredSkill(null)}
              style={{
                background: "var(--ec-surface-2)",
                border: `1px solid ${hoveredSkill === i ? "var(--ec-brand)" : "var(--ec-hairline-strong)"}`,
                borderRadius: 14,
                padding: "20px",
                cursor: "pointer",
                transition: "all 220ms cubic-bezier(.2,.7,.2,1)",
                transform: hoveredSkill === i ? "translateY(-3px)" : "none",
                boxShadow: hoveredSkill === i ? "var(--ec-shadow-brand)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Icon + percent */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: hoveredSkill === i ? "var(--ec-brand)" : "var(--ec-brand-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: hoveredSkill === i ? "#fff" : "var(--ec-brand)",
                    transition: "all 220ms",
                    flexShrink: 0,
                  }}
                >
                  {skill.icon}
                </div>
                <span
                  className="font-mono-ec"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: hoveredSkill === i ? "var(--ec-brand)" : "var(--ec-text-dim)",
                    transition: "color 200ms",
                  }}
                >
                  {percentages[i]}%
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-serif"
                style={{ fontSize: 18, color: "var(--ec-text)", lineHeight: 1.2 }}
              >
                {skill.title}
              </h3>

              {/* Description */}
              <p style={{ color: "var(--ec-text-muted)", fontSize: 13, lineHeight: 1.55 }}>
                {skill.description}
              </p>

              {/* Progress bar */}
              <div className="ec-progress" style={{ marginTop: "auto" }}>
                <div
                  className="ec-progress-bar brand"
                  style={{
                    width: hoveredSkill === i ? `${percentages[i]}%` : "0%",
                    transition: "width 300ms ease-out",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Services ───────────────────────────────────────────── */
const getServiceIcon = (key: string, color = "var(--ec-brand)"): React.ReactNode => {
  const props = { className: "w-6 h-6", fill: "none", stroke: color, viewBox: "0 0 24 24" };
  switch (key) {
    case "video": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    case "brand": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
    case "writing": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
    case "web": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>;
    case "webapp": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>;
    case "desing": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>;
    case "ecommerce": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
    case "planning": return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
    default: return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>;
  }
};

const Services = ({ locale }: { locale: Locale }) => {
  const [selected, setSelected] = useState<Service | null>(null);

  const services: Service[] = [
    { id: 1, key: "video", title: locale === "en" ? "Video Production" : "Video Producción", description: locale === "en" ? "Pre-production, production, and post-production to bring your vision to life." : "Pre, producción y post producción para transformar tu visión en realidad.", desc2: locale === "en" ? "We design and execute all key processes of pre-production, production, and post-production to transform our clients' vision into reality." : "Diseñamos y ejecutamos todos los procesos clave de preproducción, producción y post producción para transformar la visión de nuestros clientes en realidad.", banner: "https://ecommetrica.com/banner1.webp" },
    { id: 2, key: "brand", title: locale === "en" ? "Brand Identity" : "Identidad de Marca", description: locale === "en" ? "Beyond a logo — unified name, colors, and marketing strategy." : "Más allá de un logo: nombre, colores y estrategia de marketing unificados.", desc2: locale === "en" ? "Beyond a logo, we unify name, colors, and marketing strategy for powerful visual coherence." : "Más allá de un logo, unificamos nombre, colores y estrategia de marketing para lograr una coherencia visual poderosa.", banner: "https://ecommetrica.com/banner2.webp" },
    { id: 3, key: "writing", title: locale === "en" ? "Creative Writing" : "Escritura Creativa", description: locale === "en" ? "Soul and personality for your brand through narrative and storytelling." : "Alma y personalidad para tu marca a través de narrativa y storytelling.", desc2: locale === "en" ? "We give soul and personality to your brand while playing with imagination to create stories that connect." : "Le damos alma y personalidad a tu marca mientras creamos narrativas e historias que conecten con las personas.", banner: "https://ecommetrica.com/banner3.webp" },
    { id: 4, key: "web", title: locale === "en" ? "Web Positioning" : "Posicionamiento Web", description: locale === "en" ? "Comprehensive SEO strategies that maximize lead retention and conversion." : "Estrategias SEO integrales que maximizan la retención y conversión de leads.", desc2: locale === "en" ? "We boost your business on search engines with strategies that maximize lead retention and conversion." : "Impulsamos tu negocio en motores de búsqueda con estrategias integrales que maximizan la retención de leads.", banner: "https://ecommetrica.com/banner4.webp" },
    { id: 5, key: "webapp", title: locale === "en" ? "Programming & WebApps" : "Programación y WebApps", description: locale === "en" ? "Impactful, adaptable websites and web applications that grow with you." : "Páginas web y aplicaciones impactantes y adaptables que crecen contigo.", desc2: locale === "en" ? "We develop impactful and adaptable online pages and stores that grow with you." : "Desarrollamos páginas y tiendas en línea impactantes y adaptables que crecen contigo.", banner: "https://ecommetrica.com/banner5.webp" },
    { id: 6, key: "desing", title: locale === "en" ? "Web Design" : "Diseño Web", description: locale === "en" ? "UX-focused design and interface that stands out from the competition." : "Diseño de interfaz centrado en UX que destaca del resto.", desc2: locale === "en" ? "We focus on providing a user experience (UX) and interface design that stands out from the rest." : "Nos enfocamos en brindar una experiencia de usuario (UX) y diseño de interfaz que destaque del resto.", banner: "https://ecommetrica.com/banner6.webp" },
    { id: 7, key: "ecommerce", title: "E-commerce", description: locale === "en" ? "B2C and B2B specialists — step-by-step strategic plan for your growth." : "Especialistas B2C y B2B — plan estratégico paso a paso para tu crecimiento.", desc2: locale === "en" ? "We specialize in B2C, B2B. We guide you step by step to design a strategic plan that drives your growth." : "Nos especializamos en B2C, B2B. Te guiamos paso a paso para diseñar un plan estratégico que impulse tu crecimiento.", banner: "https://ecommetrica.com/banner7.webp" },
    { id: 8, key: "planning", title: locale === "en" ? "Strategic Planning" : "Planeación Estratégica", description: locale === "en" ? "Identify improvement opportunities and implement growth strategies." : "Identifica oportunidades de mejora e implementa estrategias de crecimiento.", desc2: locale === "en" ? "We focus on the growth of your business, helping you identify improvement opportunities and implement strategies." : "Nos enfocamos en el crecimiento de tu negocio, ayudándote a identificar oportunidades de mejora e implementar estrategias.", banner: "https://ecommetrica.com/banner8.webp" },
  ];

  return (
    <section
      id="lp-services"
      className="circuit-bg"
      style={{ background: "var(--ec-surface-1)", padding: "80px 40px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div className="h-eyebrow" style={{ marginBottom: 14 }}>
            {locale === "en" ? "⎯⎯⎯  SERVICES" : "⎯⎯⎯  SERVICIOS"}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <h2 className="ec-page-title">
              {locale === "en" ? "Our Services" : "Nuestros Servicios"}
            </h2>
            <p className="ec-page-subtitle" style={{ maxWidth: "44ch", marginTop: 0 }}>
              {locale === "en"
                ? "We create strategies and technology for different businesses with a multidisciplinary team in digital marketing and production."
                : "Creamos estrategias y tecnología para diferentes negocios con un equipo multidisciplinario en marketing digital y producción."}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div
          className="stagger-children"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}
        >
          {services.map((svc) => (
            <motion.div
              key={svc.id}
              onClick={() => setSelected(svc)}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.4 }}
              style={{
                background: "var(--ec-surface-2)",
                border: "1px solid var(--ec-hairline-strong)",
                borderRadius: 14,
                padding: "22px",
                cursor: "pointer",
                transition: "all 220ms cubic-bezier(.2,.7,.2,1)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
              whileHover={{ y: -3, boxShadow: "var(--ec-shadow-md)" } as never}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--ec-brand-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getServiceIcon(svc.key)}
                </div>
                <h3
                  className="font-serif"
                  style={{ fontSize: 20, color: "var(--ec-text)", lineHeight: 1.15 }}
                >
                  {svc.title}
                </h3>
              </div>

              <p style={{ color: "var(--ec-text-muted)", fontSize: 13, lineHeight: 1.6 }}>
                {svc.description}
              </p>

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--ec-brand)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  letterSpacing: "0.06em",
                }}
              >
                <span>{locale === "en" ? "LEARN MORE" : "SABER MÁS"}</span>
                <ArrowRight size={12} />
              </div>

              {/* Brand accent line */}
              <div
                style={{
                  height: 2,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--ec-brand), var(--ec-brand-glow), transparent)",
                  opacity: 0.4,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA row */}
        <div
          style={{
            marginTop: 48,
            padding: "24px 28px",
            background: "var(--ec-surface-2)",
            border: "1px solid var(--ec-hairline)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>
              {locale === "en" ? "ANY QUESTIONS?" : "¿ALGUNA PREGUNTA?"}
            </div>
            <p style={{ color: "var(--ec-text-muted)", fontSize: 14 }}>
              {locale === "en" ? "We love to answer." : "Nos encanta responder."}
            </p>
          </div>
          <button
            className="ec-btn-primary"
            onClick={() => window.open("mailto:admin@e-commetrics.com", "_blank")}
          >
            <Mail size={15} />
            {locale === "en" ? "Ask us anything" : "Escríbenos"}
          </button>
        </div>
      </div>

      {/* Service modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--ec-surface-1)",
                border: "1px solid var(--ec-hairline-strong)",
                borderRadius: 18,
                overflow: "hidden",
                maxWidth: 480,
                width: "100%",
                boxShadow: "var(--ec-shadow-lg)",
              }}
            >
              {/* Banner */}
              <div style={{ position: "relative", height: 180 }}>
                <Image
                  src={selected.banner}
                  alt={selected.title}
                  fill
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  loader={({ src }) => src}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, var(--ec-surface-2) 0%, transparent 60%)",
                  }}
                />
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "20px 24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "var(--ec-brand-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getServiceIcon(selected.key)}
                  </div>
                  <h3
                    className="font-serif"
                    style={{ fontSize: 26, color: "var(--ec-text)", lineHeight: 1.1 }}
                  >
                    {selected.title}
                  </h3>
                </div>
                <p style={{ color: "var(--ec-text-muted)", fontSize: 14, lineHeight: 1.65 }}>
                  {selected.desc2}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

/* ─── Consulting ─────────────────────────────────────────── */
const Consulting = ({ locale }: { locale: Locale }) => {
  const items: ConsultingItem[] = [
    { id: 1, title: locale === "en" ? "Programming" : "Programación", desc: locale === "en" ? "Fast and secure websites." : "Páginas Web, rápida y segura.", image: "https://ecommetrica.com/programacion.webp", icon: "https://ecommetrica.com/MarketingIcon.svg", hoverColor: "bg-gradient-to-br from-blue-500/80 to-purple-600/10" },
    { id: 2, title: "Marketing", desc: locale === "en" ? "We provide the best S.S.L. with NameCheap." : "Tenemos el mejor S.S.L. con NameCheap.", image: "https://ecommetrica.com/marketing.webp", icon: "https://ecommetrica.com/MarketingIcon.svg", hoverColor: "bg-gradient-to-br from-purple-600/80 to-black/10" },
    { id: 3, title: "SEO", desc: locale === "en" ? "Your site will be better structured for Google©." : "Tu sitio estará mejor estructurado para Google©.", image: "https://ecommetrica.com/SEO.webp", icon: "https://ecommetrica.com/SeoIcon.svg", hoverColor: "bg-gradient-to-br from-violet-700/80 to-purple-900/10" },
    { id: 4, title: "Web Master", desc: locale === "en" ? "Fast, secure and reliable hosting." : "Hospedaje rápido, seguro y confiable.", image: "https://ecommetrica.com/webMaster.webp", icon: "https://ecommetrica.com/WebMasterIcon.svg", hoverColor: "bg-gradient-to-br from-pink-500/80 to-rose-600/10" },
  ];

  return (
    <section className="circuit-bg" style={{ background: "var(--ec-surface-1)", padding: "80px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="h-eyebrow" style={{ marginBottom: 14 }}>
            {locale === "en" ? "⎯⎯⎯  CONSULTING PACKAGES" : "⎯⎯⎯  PAQUETES DE CONSULTORÍA"}
          </div>
          <h2 className="ec-page-title" style={{ marginBottom: 14 }}>
            {locale === "en" ? "What's Inside Our Consulting?" : "¿Qué hay dentro de la Consultoría?"}
          </h2>
          <p className="ec-page-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
            {locale === "en" ? "In any package you get:" : "En cualquier paquete tienes:"}
          </p>
        </div>

        {/* Cards */}
        <div
          className="stagger-children"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4 }}
              className={`group relative h-80 rounded-2xl overflow-hidden bg-cover bg-center cursor-pointer flex items-end justify-start`}
              style={{ backgroundImage: `url('${item.image}')` }}
            >
              <div className="absolute inset-0 bg-black/60 z-0 group-hover:opacity-0 transition-opacity duration-300" />
              <div className={`absolute inset-0 ${item.hoverColor} opacity-0 group-hover:opacity-100 transition-all duration-300 z-0`} />

              {/* EC brand accent overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(189,21,92,0.3) 0%, transparent 50%)",
                  opacity: 0,
                  transition: "opacity 300ms",
                  zIndex: 1,
                }}
                className="group-hover:opacity-100"
              />

              <div className="relative z-10 p-5">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Image src={item.icon} alt={item.title} height={22} width={22} loading="lazy" />
                </div>
                <h3
                  className="font-serif"
                  style={{ fontSize: 22, color: "white", marginBottom: 6 }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    opacity: 0,
                    transform: "translateY(6px)",
                    transition: "all 300ms",
                  }}
                  className="group-hover:opacity-100 group-hover:translate-y-0"
                >
                  {item.desc}
                </p>
              </div>

              {/* Bottom tag */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 10,
                }}
              >
                <span className="ec-badge ec-badge-brand ec-badge-mono" style={{ background: "rgba(189,21,92,0.9)", color: "white" }}>
                  EC
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Footer ──────────────────────────────────────────────── */
const Footer = ({ locale, goToLogin }: { locale: Locale; goToLogin: () => void }) => (
  <motion.footer
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    style={{ position: "relative", overflow: "hidden", background: "var(--ec-hero-base)" }}
  >
    {/* Brand radial glow */}
    <div
      style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background:
          "radial-gradient(ellipse 80% 60% at 75% 50%, var(--ec-hero-glow-a), transparent 60%), " +
          "radial-gradient(ellipse 60% 70% at 15% 80%, var(--ec-hero-glow-b), transparent 65%)",
      }}
    />
    {/* Grid */}
    <div
      style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(var(--ec-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ec-grid-line) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
      }}
    />

    {/* Brand accent bar */}
    <div style={{ height: 3, background: "linear-gradient(90deg, transparent, var(--ec-brand), transparent)" }} />

    {/* Main footer body */}
    <div
      style={{
        position: "relative", zIndex: 2,
        maxWidth: 1100, margin: "0 auto",
        padding: "64px 40px 48px",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1.3fr",
        gap: 48,
        alignItems: "start",
      }}
    >
      {/* ── Col 1: Brand ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: "var(--ec-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 16px -4px rgba(189,21,92,0.5)",
            }}
          >
            <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 24, color: "#fff", lineHeight: 1 }}>E</span>
          </div>
          <div>
            <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 20, color: "var(--ec-text)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              E-commetrics
            </div>
            <div className="font-mono-ec" style={{ fontSize: 9, color: "var(--ec-text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>
              Workspace · 2026
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 13, color: "var(--ec-text-muted)", lineHeight: 1.65, maxWidth: "28ch" }}>
          {locale === "en"
            ? "Smart websites. Consulting and development in one place."
            : "Páginas web inteligentes. Consultoría y desarrollo en un solo lugar."}
        </p>

        {/* Contact links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <a
            href="mailto:juanmanuel@ecommetrica.com"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-text-muted)", textDecoration: "none", transition: "color 140ms" }}
          >
            <Mail size={14} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
            juanmanuel@ecommetrica.com
          </a>
          <a
            href="tel:+526646429633"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-text-muted)", textDecoration: "none" }}
          >
            <Phone size={14} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
            +52 664 642 9633
          </a>
          <a
            href="https://ecommetrica.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-brand)", textDecoration: "none", fontWeight: 500 }}
          >
            <ExternalLink size={14} style={{ flexShrink: 0 }} />
            ecommetrica.com
          </a>
        </div>
      </div>

      {/* ── Col 2: Plataforma ── */}
      <div>
        <div className="h-eyebrow" style={{ marginBottom: 18 }}>
          {locale === "en" ? "PLATFORM" : "PLATAFORMA"}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
          {[
            { label: locale === "en" ? "Dashboard" : "Dashboard", action: goToLogin },
            { label: locale === "en" ? "Methodology" : "Metodología", action: () => document.getElementById("lp-skills")?.scrollIntoView({ behavior: "smooth" }) },
            { label: locale === "en" ? "Services" : "Servicios", action: () => document.getElementById("lp-services")?.scrollIntoView({ behavior: "smooth" }) },
            { label: locale === "en" ? "Packages" : "Paquetes", action: () => document.getElementById("lp-packages")?.scrollIntoView({ behavior: "smooth" }) },
          ].map((item) => (
            <li key={item.label}>
              <button
                onClick={item.action}
                style={{
                  background: "none", border: "none", padding: 0,
                  fontSize: 13, color: "var(--ec-text-muted)",
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 7,
                  transition: "color 140ms",
                }}
              >
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ec-brand)", flexShrink: 0, opacity: 0.6 }} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Col 3: Servicios ── */}
      <div>
        <div className="h-eyebrow" style={{ marginBottom: 18 }}>
          {locale === "en" ? "SERVICES" : "SERVICIOS"}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
          {[
            locale === "en" ? "Web Design" : "Diseño Web",
            locale === "en" ? "Programming" : "Programación",
            "SEO",
            locale === "en" ? "Branding" : "Branding",
            "E-commerce",
            locale === "en" ? "Consulting" : "Consultoría",
          ].map((svc) => (
            <li key={svc} style={{ fontSize: 13, color: "var(--ec-text-muted)", display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ec-brand)", flexShrink: 0, opacity: 0.6 }} />
              {svc}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Col 4: CTA ── */}
      <div
        style={{
          background: "var(--ec-surface-2)",
          border: "1px solid var(--ec-hairline-strong)",
          borderRadius: 16,
          padding: "24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>
            {locale === "en" ? "READY TO START?" : "¿LISTO PARA EMPEZAR?"}
          </div>
          <p style={{ fontSize: 13, color: "var(--ec-text-muted)", lineHeight: 1.6 }}>
            {locale === "en"
              ? "Access your project dashboard or contact us to get started."
              : "Accede a tu panel de proyectos o contáctanos para comenzar."}
          </p>
        </div>

        <button
          onClick={goToLogin}
          className="ec-btn-primary"
          style={{ width: "100%", justifyContent: "center", gap: 8 }}
        >
          {locale === "en" ? "Go to Dashboard" : "Ir al Dashboard"}
          <ArrowRight size={14} />
        </button>

        <a
          href="mailto:juanmanuel@ecommetrica.com"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "9px 0",
            borderRadius: 9,
            background: "transparent",
            color: "var(--ec-text-muted)",
            fontSize: 13, fontWeight: 500,
            border: "1px solid var(--ec-hairline-strong)",
            textDecoration: "none",
            transition: "all 140ms",
          }}
        >
          <Mail size={15} />
          {locale === "en" ? "Send us a message" : "Envíanos un mensaje"}
        </a>
      </div>
    </div>

    {/* ── Bottom bar ── */}
    <div
      style={{
        position: "relative", zIndex: 2,
        borderTop: "1px solid var(--ec-hairline)",
        maxWidth: 1100, margin: "0 auto",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-faint)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        © {new Date().getFullYear()} E-Commetrics · {locale === "en" ? "All rights reserved" : "Todos los derechos reservados"}
      </span>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <span className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          SECURE · ENCRYPTED · MX
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ec-success)", display: "inline-block" }} />
          <span className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {locale === "en" ? "ALL SYSTEMS ONLINE" : "TODOS LOS SISTEMAS ACTIVOS"}
          </span>
        </div>
      </div>
    </div>
  </motion.footer>
);

/* ─── Root export ────────────────────────────────────────── */
export default function Landing({ goToLogin }: { goToLogin: () => void }) {
  const { lang, changeLang } = useLang();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    const cookieLang = match?.[2];
    if (cookieLang === "en" || cookieLang === "es") {
      changeLang(cookieLang as Locale);
    }
  }, []);

  const toggleLocale = () => {
    const next: Locale = lang === "en" ? "es" : "en";
    changeLang(next);
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ec-surface-1)" }}>
      {/* Controls: theme + lang */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, display: "flex", gap: 8 }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: "var(--ec-surface-1)",
            border: "1px solid var(--ec-hairline-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "var(--ec-shadow-sm)", transition: "all 140ms",
            color: "var(--ec-text-muted)",
          }}
          title={theme === "dark" ? (lang === "es" ? "Modo claro" : "Light mode") : (lang === "es" ? "Modo oscuro" : "Dark mode")}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={toggleLocale}
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: "var(--ec-surface-1)",
            border: "1px solid var(--ec-hairline-strong)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "var(--ec-shadow-sm)", transition: "all 140ms",
          }}
          title={lang === "en" ? "Cambiar a Español" : "Switch to English"}
        >
          {lang === "en" ? (
            <Image src="/MX.svg" width={22} height={22} alt="MX" />
          ) : (
            <Image src="/USA.svg" width={22} height={22} alt="EN" />
          )}
        </button>
      </div>

      <Hero locale={lang as Locale} goToLogin={goToLogin} />
      <Skills locale={lang as Locale} />
      <Services locale={lang as Locale} />
      <Packages locale={lang as Locale} />
      <Consulting locale={lang as Locale} />
      <Footer locale={lang as Locale} goToLogin={goToLogin} />
    </div>
  );
}
