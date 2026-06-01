"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle, FaStore, FaSearch, FaGlobe, FaChartLine,
  FaMagic, FaVideo, FaMobileAlt, FaBullhorn, FaPalette,
  FaRobot, FaLightbulb, FaCode,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdOpenInNew } from "react-icons/md";
import { ArrowLeft, ArrowRight, X, Send, CheckCircle2, Plus, Minus } from "lucide-react";
import axios from "axios";

type Locale = "en" | "es";
type ServiceItem  = { name: string; details: string };
type ExtraItem    = { id: string; name: string; price: number; description: string };
type ExtraCategory = { category: string; items: ExtraItem[] };
type Package = {
  id: number; title: string; subtitle: string; price: string;
  description: string; overview: string; services: ServiceItem[];
  additionalDetails: string[]; popular?: boolean; extraServices: ExtraCategory[];
};

/* ── icon resolver ────────────────────────────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  sitio: <FaGlobe />, seo: <FaSearch />, redes: <FaChartLine />,
  analytics: <FaChartLine />, ecommerce: <FaStore />, diseño: <FaPalette />,
  publicidad: <FaBullhorn />, branding: <FaMagic />, apps: <FaMobileAlt />,
  automatizacion: <FaRobot />, consultoria: <FaLightbulb />,
  audiovisual: <FaVideo />, desarrollo: <FaCode />, default: <FaCheckCircle />,
};
const getIcon = (text: string): React.ReactNode => {
  const t = text.toLowerCase();
  if (t.includes("seo"))           return iconMap.seo;
  if (t.includes("redes"))         return iconMap.redes;
  if (t.includes("analytics") || t.includes("pixel")) return iconMap.analytics;
  if (t.includes("shopify") || t.includes("ecommerce")) return iconMap.ecommerce;
  if (t.includes("reels") || t.includes("posts"))      return iconMap.diseño;
  if (t.includes("publicidad"))    return iconMap.publicidad;
  if (t.includes("branding"))      return iconMap.branding;
  if (t.includes("app"))           return iconMap.apps;
  if (t.includes("automatización") || t.includes("automatizacion")) return iconMap.automatizacion;
  if (t.includes("consultoría") || t.includes("consultoria")) return iconMap.consultoria;
  if (t.includes("audiovisual"))   return iconMap.audiovisual;
  if (t.includes("personalizado")) return iconMap.desarrollo;
  if (t.includes("sitio web"))     return iconMap.sitio;
  return iconMap.default;
};

/* ── package data ─────────────────────────────────────────── */
const packagesData: Record<Locale, Package[]> = {
  es: [
    {
      id: 1, title: "Plan Inicial", subtitle: "Para los recién llegados",
      price: "$675/por 3 meses", description: "Incluye Paquete Básico",
      overview: "Un paquete ideal para establecer presencia en línea.",
      services: [
        { name: "Sitio Web Básico",   details: "Desarrollo de una landing page en React o Astro según necesidad o templete en Shopify." },
        { name: "SEO Inicial",        details: "Optimización básica en motores de búsqueda para mejorar visibilidad." },
        { name: "Configuración de Redes Sociales", details: "Creación y optimización de perfiles en redes sociales principales." },
        { name: "Google Analytics & Facebook Pixel", details: "Configuración de herramientas de seguimiento para análisis de tráfico." },
      ],
      additionalDetails: ["Ideal para emprendedores que están comenzando.", "Soporte técnico básico incluido.", "Entrega en un plazo de 2 semanas."],
      extraServices: [
        { category: "Diseño",     items: [{ id: "diseno-premium",  name: "Diseño Premium",    price: 150, description: "Paquete de diseño visual mejorado con gráficos personalizados" }] },
        { category: "Desarrollo", items: [{ id: "pagina-adicional", name: "Página Adicional", price: 75,  description: "Añadir una página más a tu sitio web" }] },
      ],
    },
    {
      id: 2, title: "Plan Pro", subtitle: "Para pequeñas empresas y emprendedores",
      price: "$995/por 4 meses", description: "Incluye Paquete Básico más:",
      overview: "Un paquete avanzado para pequeñas empresas.",
      services: [
        { name: "Ecommerce con Shopify",  details: "Configuración y personalización de tienda en Shopify con diseño profesional." },
        { name: "SEO Avanzado",           details: "Optimización técnica y estrategia de contenido para posicionamiento orgánico." },
        { name: "Sitio Web Avanzado",     details: "Desarrollo de una landing page en React o Astro con desarrollo avanzado." },
        { name: "Diseño de Posts & Reels", details: "Creación de contenido visual optimizado para redes sociales." },
      ],
      additionalDetails: ["Incluye análisis de mercado para estrategias de SEO.", "Soporte técnico avanzado.", "Entrega en un plazo de 4 semanas.", "El paquete más popular entre nuestros clientes."],
      popular: true,
      extraServices: [
        { category: "SEO",      items: [{ id: "seo-avanzado", name: "SEO Avanzado", price: 300, description: "Estrategia SEO integral para mejores rankings" }, { id: "optimizacion-contenido", name: "Optimización de Contenido", price: 250, description: "Optimiza el contenido de tu sitio para motores de búsqueda" }] },
        { category: "Marketing", items: [{ id: "campana-email", name: "Campaña de Email", price: 180, description: "Crear y gestionar campañas de email marketing" }] },
      ],
    },
    {
      id: 3, title: "Plan Empresa", subtitle: "Para empresas pequeñas con ambiciones",
      price: "$1185/por 6 meses", description: "Incluye Paquete Pro más:",
      overview: "Un paquete diseñado para empresas en expansión.",
      services: [
        { name: "Desarrollo Web Personalizado", details: "Creación de un sitio web en React o Astro con diseño a medida." },
        { name: "Estrategia en Redes Sociales", details: "Gestión de contenido con planificación mensual y analítica avanzada." },
        { name: "Publicidad Digital",  details: "Campañas en Google Ads, Facebook Ads e Instagram con segmentación avanzada." },
        { name: "Branding & Diseño Gráfico", details: "Diseño de identidad visual en Figma, Photoshop e Illustrator." },
      ],
      additionalDetails: ["Incluye análisis detallado de métricas de campañas.", "Soporte técnico premium.", "Entrega en un plazo de 6 semanas."],
      extraServices: [
        { category: "Analítica", items: [{ id: "analisis-trafico", name: "Análisis de Tráfico", price: 120, description: "Análisis detallado del tráfico y comportamiento de usuario" }, { id: "seguimiento-conversiones", name: "Seguimiento de Conversiones", price: 150, description: "Seguimiento y optimización de tasas de conversión" }] },
      ],
    },
    {
      id: 4, title: "Plan Personalizado", subtitle: "Para empresas grandes y corporativos",
      price: "$1555/por 8 meses", description: "Incluye Paquete Empresa más:",
      overview: "Un paquete completo para grandes corporaciones.",
      services: [
        { name: "Consultoría Estratégica",    details: "Asesoramiento personalizado para expansión digital y crecimiento." },
        { name: "Automatización de Marketing", details: "Estrategias omnicanal para posicionamiento premium en el mercado." },
        { name: "Producción Audiovisual",      details: "Videograbación y edición profesional para campañas publicitarias." },
        { name: "Desarrollo de Apps",          details: "Aplicaciones web y móviles personalizadas para optimizar procesos internos." },
      ],
      additionalDetails: ["Incluye soporte dedicado 24/7.", "Entrega en un plazo de 8 semanas.", "Acceso a herramientas exclusivas de análisis de datos."],
      extraServices: [
        { category: "Desarrollo", items: [{ id: "formulario-contacto", name: "Formulario de Contacto", price: 100, description: "Formulario de contacto con notificaciones por email" }] },
        { category: "Marketing",  items: [{ id: "anuncios-redes", name: "Anuncios en Redes Sociales", price: 220, description: "Ejecutar anuncios dirigidos en plataformas de redes sociales" }] },
      ],
    },
  ],
  en: [
    {
      id: 1, title: "Starter Plan", subtitle: "For newcomers",
      price: "$675/for 3 months", description: "Includes Basic Package",
      overview: "An ideal package to establish an online presence.",
      services: [
        { name: "Basic Website",   details: "Development of a landing page in React or Astro based on needs or Shopify template." },
        { name: "Initial SEO",     details: "Basic optimization in search engines to improve visibility." },
        { name: "Social Media Setup", details: "Creation and optimization of profiles on major social networks." },
        { name: "Google Analytics & Facebook Pixel", details: "Setup of tracking tools for traffic analysis." },
      ],
      additionalDetails: ["Ideal for entrepreneurs starting out.", "Basic technical support included.", "Delivery within 2 weeks."],
      extraServices: [
        { category: "Design",      items: [{ id: "diseno-premium",  name: "Premium Design",    price: 150, description: "Enhanced visual design package with custom graphics" }] },
        { category: "Development", items: [{ id: "pagina-adicional", name: "Additional Page",  price: 75,  description: "Add one more page to your website" }] },
      ],
    },
    {
      id: 2, title: "Pro Plan", subtitle: "For small businesses and entrepreneurs",
      price: "$995/for 4 months", description: "Includes Basic Package plus:",
      overview: "An advanced package for small businesses.",
      services: [
        { name: "Shopify Ecommerce",   details: "Setup and customization of a Shopify store with professional design." },
        { name: "Advanced SEO",        details: "Technical optimization and content strategy for organic positioning." },
        { name: "Advanced Website",    details: "Development of a landing page in React or Astro with advanced development." },
        { name: "Post & Reel Design",  details: "Creation of visually optimized content for social media." },
      ],
      additionalDetails: ["Includes market analysis for SEO strategies.", "Advanced technical support.", "Delivery within 4 weeks.", "Most popular package among our clients."],
      popular: true,
      extraServices: [
        { category: "SEO",      items: [{ id: "seo-avanzado", name: "Advanced SEO", price: 300, description: "Comprehensive SEO strategy for better rankings" }, { id: "optimizacion-contenido", name: "Content Optimization", price: 250, description: "Optimize your website content for search engines" }] },
        { category: "Marketing", items: [{ id: "campana-email", name: "Email Campaign", price: 180, description: "Create and manage email marketing campaigns" }] },
      ],
    },
    {
      id: 3, title: "Business Plan", subtitle: "For growing businesses",
      price: "$1185/for 6 months", description: "Includes Pro Package plus:",
      overview: "A package designed for expanding businesses.",
      services: [
        { name: "Custom Web Development", details: "Creation of a website in React or Astro with tailored design." },
        { name: "Social Media Strategy",  details: "Content management with monthly planning and advanced analytics." },
        { name: "Digital Advertising",    details: "Campaigns on Google Ads, Facebook Ads, and Instagram with advanced targeting." },
        { name: "Branding & Graphic Design", details: "Visual identity design in Figma, Photoshop, and Illustrator." },
      ],
      additionalDetails: ["Includes detailed campaign metrics analysis.", "Premium technical support.", "Delivery within 6 weeks."],
      extraServices: [
        { category: "Analytics", items: [{ id: "analisis-trafico", name: "Traffic Analysis", price: 120, description: "Detailed analysis of website traffic and user behavior" }, { id: "seguimiento-conversiones", name: "Conversion Tracking", price: 150, description: "Track and optimize conversion rates" }] },
      ],
    },
    {
      id: 4, title: "Corporate Plan", subtitle: "For large enterprises",
      price: "$1555/for 8 months", description: "Includes Business Package plus:",
      overview: "A complete package for large corporations.",
      services: [
        { name: "Strategic Consulting",    details: "Personalized advice for digital expansion and growth." },
        { name: "Marketing Automation",    details: "Omnichannel strategies for premium market positioning." },
        { name: "Audiovisual Production",  details: "Professional video recording and editing for advertising campaigns." },
        { name: "App Development",         details: "Custom web and mobile applications to optimize internal processes." },
      ],
      additionalDetails: ["Includes 24/7 dedicated support.", "Delivery within 8 weeks.", "Access to exclusive data analysis tools."],
      extraServices: [
        { category: "Development", items: [{ id: "formulario-contacto", name: "Contact Form", price: 100, description: "Contact form with email notifications" }] },
        { category: "Marketing",  items: [{ id: "anuncios-redes", name: "Social Media Ads", price: 220, description: "Run targeted ads on social media platforms" }] },
      ],
    },
  ],
};

/* ── tier accent colors ───────────────────────────────────── */
const TIER_COLORS = [
  { accent: "#6366f1", soft: "rgba(99,102,241,0.10)", label: "TIER 1" },
  { accent: "#BD155C", soft: "rgba(189,21,92,0.10)",  label: "TIER 2" },
  { accent: "#f59e0b", soft: "rgba(245,158,11,0.10)", label: "TIER 3" },
  { accent: "#10b981", soft: "rgba(16,185,129,0.10)", label: "TIER 4" },
];

/* ════════════════════════════════════════════════════════════
   PACKAGES COMPONENT
════════════════════════════════════════════════════════════ */
const Packages = ({ locale }: { locale: Locale }) => {
  const [selectedId,    setSelectedId]    = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showModal,     setShowModal]     = useState(false);
  const [sending,       setSending]       = useState(false);
  const [sent,          setSent]          = useState(false);
  const [sendError,     setSendError]     = useState<string | null>(null);
  const [email,         setEmail]         = useState("");

  const packages   = packagesData[locale] || [];
  const pkg        = packages.find((p) => p.id === selectedId) ?? null;
  const extras     = pkg?.extraServices ?? [];
  const basePrice  = pkg ? Number((pkg.price.match(/[\d.]+/) || [0])[0]) : 0;
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    for (const cat of extras) {
      const found = cat.items.find((i) => i.id === id);
      if (found) return sum + found.price;
    }
    return sum;
  }, 0);
  const total = basePrice + extrasTotal;

  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);

  const selectPkg = (id: number) => {
    setSelectedId(id);
    setSelectedExtras([]);
    setSent(false);
    setSendError(null);
  };

  const selectedExtrasInfo = extras.flatMap((c) => c.items).filter((i) => selectedExtras.includes(i.id));

  const handleSend = async () => {
    if (!pkg) return;
    setSending(true);
    setSendError(null);
    setSent(false);
    try {
      await axios.post("https://e-commetrics.com/send-package-email", {
        locale, package: { title: pkg.title, price: pkg.price, services: pkg.services, additionalDetails: pkg.additionalDetails },
        extras: selectedExtrasInfo, total, email,
      });
      setSent(true);
      setEmail("");
    } catch {
      setSendError(locale === "es" ? "Error al enviar. Intenta de nuevo." : "Error sending. Please try again.");
    }
    setSending(false);
  };

  return (
    <section
      id="lp-packages"
      className="circuit-bg"
      style={{ background: "var(--ec-surface-1)", padding: "80px 40px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Section header ──────────────────────────────── */}
        <div style={{ marginBottom: 52 }}>
          <div className="h-eyebrow" style={{ marginBottom: 14 }}>
            {locale === "es" ? "⎯⎯⎯  PAQUETES" : "⎯⎯⎯  PACKAGES"}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <h2 className="ec-page-title">
              {locale === "es" ? "Nuestros Paquetes" : "Our Packages"}
            </h2>
            <p className="ec-page-subtitle" style={{ maxWidth: "42ch", marginTop: 0 }}>
              {locale === "es"
                ? "Elige el plan que mejor se adapta a tu etapa de crecimiento. Todos incluyen soporte y entrega garantizada."
                : "Choose the plan that best fits your growth stage. All include support and guaranteed delivery."}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ════════ CARD GRID ════════════════════════════ */}
          {!selectedId && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              className="stagger-children"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}
            >
              {packages.map((p, i) => {
                const tier = TIER_COLORS[i];
                const priceNum = (p.price.match(/\$([\d,]+)/) || [])[1] || "";
                const pricePeriod = p.price.replace(/\$[\d,]+/, "").trim();
                return (
                  <div
                    key={p.id}
                    style={{
                      position: "relative",
                      background: "var(--ec-surface-2)",
                      border: `1px solid ${p.popular ? tier.accent : "var(--ec-hairline-strong)"}`,
                      borderRadius: 18,
                      padding: "26px 22px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                      boxShadow: p.popular ? `0 0 0 1px ${tier.accent}40, var(--ec-shadow-md)` : "none",
                      transition: "all 240ms cubic-bezier(.2,.7,.2,1)",
                      cursor: "default",
                    }}
                  >
                    {/* Tier bar top */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 22,
                        right: 22,
                        height: 3,
                        borderRadius: "0 0 4px 4px",
                        background: `linear-gradient(90deg, ${tier.accent}, ${tier.accent}80)`,
                      }}
                    />

                    {/* Popular badge */}
                    {p.popular && (
                      <div style={{ position: "absolute", top: 16, right: 16 }}>
                        <span
                          className="ec-badge ec-badge-mono"
                          style={{ background: tier.soft, color: tier.accent, border: `1px solid ${tier.accent}40` }}
                        >
                          {locale === "es" ? "MÁS POPULAR" : "MOST POPULAR"}
                        </span>
                      </div>
                    )}

                    {/* Tier label + icon */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: tier.soft,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: tier.accent, fontSize: 14,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        className="h-eyebrow"
                        style={{ color: tier.accent, fontSize: 9.5 }}
                      >
                        {tier.label}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3
                        className="font-serif"
                        style={{ fontSize: 22, color: "var(--ec-text)", lineHeight: 1.1, marginBottom: 4 }}
                      >
                        {p.title}
                      </h3>
                      <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>{p.subtitle}</p>
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        padding: "14px 16px",
                        background: tier.soft,
                        borderRadius: 12,
                        border: `1px solid ${tier.accent}25`,
                      }}
                    >
                      <div
                        className="font-serif"
                        style={{ fontSize: 38, lineHeight: 1, color: tier.accent, letterSpacing: "-0.02em" }}
                      >
                        ${priceNum}
                      </div>
                      <div
                        className="font-mono-ec"
                        style={{ fontSize: 10, color: "var(--ec-text-dim)", marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}
                      >
                        {pricePeriod}
                      </div>
                    </div>

                    {/* Service list preview */}
                    <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {p.services.map((svc, si) => (
                        <li
                          key={si}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 8,
                            fontSize: 12.5, color: "var(--ec-text-muted)",
                          }}
                        >
                          <span style={{ color: tier.accent, fontSize: 11, marginTop: 1, flexShrink: 0 }}>
                            {getIcon(svc.name)}
                          </span>
                          {svc.name}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => selectPkg(p.id)}
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        padding: "12px 0",
                        borderRadius: 11,
                        background: p.popular ? tier.accent : "var(--ec-brand-soft)",
                        color: p.popular ? "#fff" : "var(--ec-brand)",
                        border: p.popular ? "none" : `1px solid ${tier.accent}30`,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        transition: "all 200ms",
                      }}
                    >
                      {locale === "es" ? "Ver detalles" : "View details"}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ════════ DETAIL VIEW ══════════════════════════ */}
          {pkg && (
            <motion.div
              key={`detail-${pkg.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {/* Package tab switcher */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 28,
                  background: "var(--ec-surface-2)",
                  border: "1px solid var(--ec-hairline)",
                  borderRadius: 13,
                  padding: 4,
                  flexWrap: "wrap",
                }}
              >
                {packages.map((p, i) => {
                  const tier = TIER_COLORS[i];
                  const active = p.id === pkg.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => selectPkg(p.id)}
                      style={{
                        flex: 1,
                        minWidth: 100,
                        padding: "9px 14px",
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: active ? 600 : 500,
                        cursor: "pointer",
                        border: "none",
                        background: active ? tier.soft : "transparent",
                        color: active ? tier.accent : "var(--ec-text-muted)",
                        outline: active ? `1px solid ${tier.accent}40` : "none",
                        transition: "all 160ms",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: active ? tier.accent : "var(--ec-hairline-strong)",
                          flexShrink: 0,
                        }}
                      />
                      {p.title}
                    </button>
                  );
                })}

                {/* Back */}
                <button
                  onClick={() => setSelectedId(null)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "1px solid var(--ec-hairline-strong)",
                    background: "transparent",
                    color: "var(--ec-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 160ms",
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={12} />
                  {locale === "es" ? "Todos" : "All"}
                </button>
              </div>

              {/* Detail layout */}
              {(() => {
                const tierIdx = packages.findIndex((p) => p.id === pkg.id);
                const tier = TIER_COLORS[tierIdx] || TIER_COLORS[0];
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

                    {/* ── Left column ────────────────────── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                      {/* Package header */}
                      <div
                        style={{
                          background: "var(--ec-surface-2)",
                          border: `1px solid ${tier.accent}40`,
                          borderRadius: 16,
                          padding: "22px 24px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* accent line */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${tier.accent}, ${tier.accent}50)` }} />

                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                          <div>
                            <div className="h-eyebrow" style={{ color: tier.accent, marginBottom: 8 }}>
                              {tier.label} · {pkg.description}
                            </div>
                            <h3 className="font-serif" style={{ fontSize: 34, color: "var(--ec-text)", lineHeight: 1.05, marginBottom: 4 }}>
                              {pkg.title}
                            </h3>
                            <p style={{ color: "var(--ec-text-muted)", fontSize: 13 }}>{pkg.subtitle}</p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div className="font-serif" style={{ fontSize: 42, color: tier.accent, lineHeight: 1, letterSpacing: "-0.02em" }}>
                              {(pkg.price.match(/\$([\d,]+)/) || [])[1] ? `$${(pkg.price.match(/\$([\d,]+)/) || [])[1]}` : pkg.price.split("/")[0]}
                            </div>
                            <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                              {pkg.price.split("/")[1] || ""}
                            </div>
                            {pkg.popular && (
                              <span
                                className="ec-badge ec-badge-mono"
                                style={{ marginTop: 8, display: "inline-flex", background: tier.soft, color: tier.accent }}
                              >
                                {locale === "es" ? "MÁS POPULAR" : "MOST POPULAR"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Services grid */}
                      <div>
                        <div className="h-eyebrow" style={{ marginBottom: 12 }}>
                          {locale === "es" ? "SERVICIOS INCLUIDOS" : "INCLUDED SERVICES"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                          {pkg.services.map((svc, si) => (
                            <div
                              key={si}
                              style={{
                                background: "var(--ec-surface-2)",
                                border: "1px solid var(--ec-hairline-strong)",
                                borderRadius: 12,
                                padding: "16px 18px",
                                display: "flex",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 34, height: 34, borderRadius: 9,
                                  background: tier.soft,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: tier.accent, fontSize: 14, flexShrink: 0,
                                }}
                              >
                                {getIcon(svc.name)}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ec-text)", marginBottom: 4 }}>
                                  {svc.name}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--ec-text-muted)", lineHeight: 1.5 }}>
                                  {svc.details}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional details */}
                      <div
                        style={{
                          background: "var(--ec-surface-2)",
                          border: "1px solid var(--ec-hairline)",
                          borderRadius: 12,
                          padding: "18px 20px",
                        }}
                      >
                        <div className="h-eyebrow" style={{ marginBottom: 12 }}>
                          {locale === "es" ? "VENTAJAS" : "ADVANTAGES"}
                        </div>
                        <ul style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                          {pkg.additionalDetails.map((d, di) => (
                            <li key={di} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ec-text-muted)" }}>
                              <CheckCircle2 size={14} style={{ color: tier.accent, marginTop: 1, flexShrink: 0 }} />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Extra services */}
                      {extras.length > 0 && (
                        <div>
                          <div className="h-eyebrow" style={{ marginBottom: 12 }}>
                            {locale === "es" ? "SERVICIOS ADICIONALES" : "ADDITIONAL SERVICES"}
                          </div>
                          {extras.map((cat) => (
                            <div key={cat.category} style={{ marginBottom: 12 }}>
                              <div
                                className="font-mono-ec"
                                style={{ fontSize: 10, color: "var(--ec-text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}
                              >
                                — {cat.category}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                {cat.items.map((item) => {
                                  const checked = selectedExtras.includes(item.id);
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => toggleExtra(item.id)}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "14px 16px",
                                        background: checked ? tier.soft : "var(--ec-surface-2)",
                                        border: `1px solid ${checked ? tier.accent : "var(--ec-hairline-strong)"}`,
                                        borderRadius: 11,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "all 180ms",
                                        width: "100%",
                                      }}
                                    >
                                      {/* toggle icon */}
                                      <div
                                        style={{
                                          width: 22, height: 22, borderRadius: 6,
                                          background: checked ? tier.accent : "var(--ec-surface-3)",
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          flexShrink: 0, transition: "all 160ms",
                                        }}
                                      >
                                        {checked
                                          ? <Minus size={11} color="#fff" />
                                          : <Plus size={11} color="var(--ec-text-dim)" />}
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ec-text)" }}>
                                          {item.name}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: "var(--ec-text-muted)", marginTop: 2 }}>
                                          {item.description}
                                        </div>
                                      </div>
                                      <span
                                        className="font-mono-ec"
                                        style={{
                                          fontSize: 13, fontWeight: 600,
                                          color: checked ? tier.accent : "var(--ec-text-muted)",
                                          flexShrink: 0,
                                        }}
                                      >
                                        +${item.price}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Right column — sticky price summary ── */}
                    <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div
                        style={{
                          background: "var(--ec-surface-2)",
                          border: `1px solid ${tier.accent}40`,
                          borderRadius: 16,
                          overflow: "hidden",
                          boxShadow: "var(--ec-shadow-md)",
                        }}
                      >
                        {/* Summary header */}
                        <div
                          style={{
                            background: tier.soft,
                            borderBottom: `1px solid ${tier.accent}25`,
                            padding: "16px 20px",
                          }}
                        >
                          <div className="h-eyebrow" style={{ color: tier.accent, marginBottom: 6 }}>
                            {locale === "es" ? "RESUMEN" : "SUMMARY"}
                          </div>
                          <div className="font-serif" style={{ fontSize: 20, color: "var(--ec-text)" }}>
                            {pkg.title}
                          </div>
                        </div>

                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* Base price row */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
                              {locale === "es" ? "Precio base" : "Base price"}
                            </span>
                            <span className="font-mono-ec" style={{ fontSize: 14, color: "var(--ec-text)", fontWeight: 600 }}>
                              ${basePrice}
                            </span>
                          </div>

                          {/* Selected extras */}
                          {selectedExtrasInfo.map((item) => (
                            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                              <span style={{ fontSize: 12, color: "var(--ec-text-muted)", flex: 1 }}>{item.name}</span>
                              <span className="font-mono-ec" style={{ fontSize: 13, color: tier.accent, flexShrink: 0 }}>
                                +${item.price}
                              </span>
                            </div>
                          ))}

                          {/* Divider */}
                          <div style={{ borderTop: "1px solid var(--ec-hairline)", paddingTop: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span className="h-eyebrow">TOTAL</span>
                              <div>
                                <span className="font-serif" style={{ fontSize: 32, color: tier.accent, lineHeight: 1, letterSpacing: "-0.02em" }}>
                                  ${total}
                                </span>
                                <span className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginLeft: 4 }}>
                                  USD
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CTA */}
                          <button
                            onClick={() => setShowModal(true)}
                            style={{
                              width: "100%",
                              padding: "13px 0",
                              borderRadius: 11,
                              background: tier.accent,
                              color: "#fff",
                              border: "none",
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              transition: "opacity 160ms",
                              marginTop: 4,
                            }}
                          >
                            <Send size={14} />
                            {locale === "es" ? "Solicitar paquete" : "Request package"}
                          </button>

                          <p style={{ fontSize: 11, color: "var(--ec-text-dim)", textAlign: "center", lineHeight: 1.5 }}>
                            {locale === "es"
                              ? "Recibirás el resumen en tu correo."
                              : "You'll receive the summary by email."}
                          </p>
                        </div>
                      </div>

                      {/* Quick contact */}
                      <div
                        style={{
                          background: "var(--ec-surface-2)",
                          border: "1px solid var(--ec-hairline)",
                          borderRadius: 12,
                          padding: "16px 18px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <div className="h-eyebrow" style={{ marginBottom: 2 }}>
                          {locale === "es" ? "CONTACTO DIRECTO" : "DIRECT CONTACT"}
                        </div>
                        <a
                          href="mailto:juanmanuel@ecommetrica.com"
                          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-text-muted)", textDecoration: "none", transition: "color 140ms" }}
                        >
                          <MdEmail style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
                          juanmanuel@ecommetrica.com
                        </a>
                        <a
                          href="tel:+526646429633"
                          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-text-muted)", textDecoration: "none" }}
                        >
                          <MdPhone style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
                          +52 664 6429 633
                        </a>
                        <a
                          href="https://ecommetrica.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-brand)", textDecoration: "none", fontWeight: 500 }}
                        >
                          <MdOpenInNew style={{ flexShrink: 0 }} />
                          ecommetrica.com
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Contact row (grid view) ───────────────────── */}
        {!selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: 40,
              background: "var(--ec-surface-2)",
              border: "1px solid var(--ec-hairline)",
              borderRadius: 14,
              padding: "22px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 6 }}>
                {locale === "es" ? "¿TIENES DUDAS?" : "NEED HELP CHOOSING?"}
              </div>
              <p style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
                {locale === "es"
                  ? "Escríbenos y te asesoramos sin costo."
                  : "Write us and we'll advise you for free."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="mailto:juanmanuel@ecommetrica.com"
                style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ec-text-muted)", textDecoration: "none" }}
              >
                <MdEmail style={{ color: "var(--ec-brand)" }} />
                juanmanuel@ecommetrica.com
              </a>
              <a
                href="tel:+526646429633"
                style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ec-text-muted)", textDecoration: "none" }}
              >
                <MdPhone style={{ color: "var(--ec-brand)" }} />
                +52 664 6429 633
              </a>
              <a
                href="https://ecommetrica.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="ec-badge ec-badge-brand ec-badge-mono"
                style={{ textDecoration: "none" }}
              >
                <MdOpenInNew style={{ marginRight: 4 }} />
                ecommetrica.com
              </a>
            </div>
          </motion.div>
        )}

      </div>

      {/* ════════ SUMMARY MODAL ════════════════════════════ */}
      <AnimatePresence>
        {showModal && pkg && (() => {
          const tierIdx = packages.findIndex((p) => p.id === pkg.id);
          const tier = TIER_COLORS[tierIdx] || TIER_COLORS[0];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); setSent(false); setSendError(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 60,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(6px)",
                padding: 24,
              }}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "var(--ec-surface-1)",
                  border: `1px solid ${tier.accent}40`,
                  borderRadius: 20,
                  overflow: "hidden",
                  maxWidth: 500,
                  width: "100%",
                  boxShadow: "var(--ec-shadow-lg)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                {/* Modal header */}
                <div
                  style={{
                    background: tier.soft,
                    borderBottom: `1px solid ${tier.accent}25`,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div className="h-eyebrow" style={{ color: tier.accent, marginBottom: 4 }}>
                      {locale === "es" ? "RESUMEN DEL PAQUETE" : "PACKAGE SUMMARY"}
                    </div>
                    <div className="font-serif" style={{ fontSize: 22, color: "var(--ec-text)" }}>
                      {pkg.title}
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowModal(false); setSent(false); setSendError(null); }}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: "var(--ec-surface-2)",
                      border: "1px solid var(--ec-hairline-strong)",
                      color: "var(--ec-text-muted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Email input */}
                  <div>
                    <label className="ec-field-label">
                      {locale === "es" ? "Tu correo electrónico" : "Your email address"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={locale === "es" ? "ejemplo@correo.com" : "your@email.com"}
                      className="ec-field-input"
                      disabled={sending || sent}
                    />
                  </div>

                  {/* Included services */}
                  <div>
                    <div className="h-eyebrow" style={{ marginBottom: 10 }}>
                      {locale === "es" ? "SERVICIOS INCLUIDOS" : "INCLUDED SERVICES"}
                    </div>
                    <ul style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {pkg.services.map((svc, si) => (
                        <li key={si} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ec-text-muted)" }}>
                          <span style={{ color: tier.accent, fontSize: 11, flexShrink: 0 }}>{getIcon(svc.name)}</span>
                          {svc.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selected extras */}
                  {selectedExtrasInfo.length > 0 && (
                    <div>
                      <div className="h-eyebrow" style={{ marginBottom: 10 }}>
                        {locale === "es" ? "SERVICIOS ADICIONALES" : "ADDITIONAL SERVICES"}
                      </div>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {selectedExtrasInfo.map((item) => (
                          <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "var(--ec-text-muted)" }}>
                            <span>{item.name}</span>
                            <span className="font-mono-ec" style={{ color: tier.accent, fontWeight: 600 }}>+${item.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Total */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: tier.soft,
                      borderRadius: 11,
                      border: `1px solid ${tier.accent}25`,
                    }}
                  >
                    <span className="h-eyebrow">TOTAL</span>
                    <span className="font-serif" style={{ fontSize: 30, color: tier.accent, letterSpacing: "-0.02em" }}>
                      ${total} <span className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-dim)" }}>USD</span>
                    </span>
                  </div>

                  {/* Send button */}
                  {!sent ? (
                    <button
                      onClick={handleSend}
                      disabled={sending || !email.includes("@")}
                      style={{
                        width: "100%",
                        padding: "13px 0",
                        borderRadius: 11,
                        background: tier.accent,
                        color: "#fff",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: sending || !email.includes("@") ? "not-allowed" : "pointer",
                        opacity: sending || !email.includes("@") ? 0.55 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "opacity 160ms",
                      }}
                    >
                      <Send size={14} />
                      {sending
                        ? locale === "es" ? "Enviando…" : "Sending…"
                        : locale === "es" ? "Enviar resumen por correo" : "Send summary by email"}
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "13px 0",
                        borderRadius: 11,
                        background: "var(--ec-success-soft)",
                        color: "var(--ec-success)",
                        fontSize: 14,
                        fontWeight: 600,
                        border: "1px solid rgba(22,163,74,0.25)",
                      }}
                    >
                      <CheckCircle2 size={16} />
                      {locale === "es" ? "¡Correo enviado!" : "Email sent!"}
                    </div>
                  )}

                  {sendError && (
                    <p style={{ fontSize: 12.5, color: "var(--ec-danger)", textAlign: "center" }}>
                      {sendError}
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
};

export default Packages;
