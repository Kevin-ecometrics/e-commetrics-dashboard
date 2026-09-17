"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdEmail, MdPhone, MdOpenInNew } from "react-icons/md";
import { ArrowLeft, ArrowRight, X, Send, CheckCircle2, Star } from "lucide-react";
import axios from "axios";
import { plans, customPlan, formatUSD, planTotal, planPerService } from "@/lib/pricing";
import { useRegion } from "@/app/context/RegionContext";

type Locale = "en" | "es";

/* ── tier accent colors ───────────────────────────────────── */
const TIER_COLORS = [
  { accent: "#6366f1", soft: "rgba(99,102,241,0.10)", label: "TIER 1" },
  { accent: "#BD155C", soft: "rgba(189,21,92,0.10)",  label: "TIER 2" },
  { accent: "#f59e0b", soft: "rgba(245,158,11,0.10)", label: "TIER 3" },
  { accent: "#10b981", soft: "rgba(16,185,129,0.10)", label: "TIER 4" },
];
const CUSTOM_COLOR = { accent: "#0ea5e9", soft: "rgba(14,165,233,0.10)", label: "ALIADO" };

/* ════════════════════════════════════════════════════════════
   PACKAGES COMPONENT
════════════════════════════════════════════════════════════ */
const Packages = ({ locale }: { locale: Locale }) => {
  const { region } = useRegion();
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [showModal,    setShowModal]    = useState(false);
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);
  const [sendError,    setSendError]    = useState<string | null>(null);
  const [email,        setEmail]        = useState("");

  const pkg      = selectedId ? plans.find((p) => p.id === selectedId) ?? null : null;
  const isCustom = selectedId === customPlan.id;

  const selectPkg = (id: string) => {
    setSelectedId(id);
    setSent(false);
    setSendError(null);
  };

  const summaryLabel = isCustom
    ? `${customPlan.name[locale]} (${formatUSD(customPlan.priceFromValue[region])}/mo · ${customPlan.minDuration[locale]})`
    : pkg
    ? `${pkg.name[locale]} (${formatUSD(pkg.priceValue[region])}/mo · ${pkg.duration[locale]})`
    : "";

  const handleSend = async () => {
    if (!pkg && !isCustom) return;
    setSending(true);
    setSendError(null);
    setSent(false);
    try {
      await axios.post("https://e-commetrics.com/send-package-email", {
        locale,
        region,
        package: isCustom
          ? { title: customPlan.name[locale], price: `${formatUSD(customPlan.priceFromValue[region])}/mo` }
          : { title: pkg!.name[locale], price: `${formatUSD(pkg!.priceValue[region])}/mo`, services: pkg!.features.filter((f) => !f.usOnly || region === "us").map((f) => ({ name: f.text[locale] })) },
        total: isCustom ? customPlan.totalFromValue[region] : planTotal(pkg!, region),
        email,
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
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Section header ──────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div className="h-eyebrow" style={{ marginBottom: 14 }}>
            {locale === "es" ? "⎯⎯⎯  PAQUETES" : "⎯⎯⎯  PACKAGES"}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <h2 className="ec-page-title">
              {locale === "es" ? "Nuestros Paquetes" : "Our Packages"}
            </h2>
            <p className="ec-page-subtitle" style={{ maxWidth: "42ch", marginTop: 0 }}>
              {locale === "es"
                ? "Elige el plan según la etapa de tu negocio. Cada plan incluye la totalidad del plan anterior."
                : "Choose the plan that matches your stage. Each plan includes everything in the plan before it."}
            </p>
          </div>
        </div>

        {/* Currency / region note */}
        <div
          style={{
            marginBottom: 32,
            padding: "12px 16px",
            background: "var(--ec-surface-2)",
            border: "1px solid var(--ec-hairline)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--ec-text-dim)",
          }}
        >
          {locale === "es"
            ? `Precios en USD por mes · ${region === "us" ? "mostrando tarifa EUA / internacional" : "mostrando tarifa México"}.`
            : `Prices in USD per month · ${region === "us" ? "showing USA / international rate" : "showing Mexico rate"}.`}
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
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}
            >
              {plans.map((p, i) => {
                const tier = TIER_COLORS[i];
                return (
                  <div
                    key={p.id}
                    style={{
                      position: "relative",
                      background: "var(--ec-surface-2)",
                      border: `1px solid ${p.featured ? tier.accent : "var(--ec-hairline-strong)"}`,
                      borderRadius: 18,
                      padding: "26px 22px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      boxShadow: p.featured ? `0 0 0 1px ${tier.accent}40, var(--ec-shadow-md)` : "none",
                      transition: "all 240ms cubic-bezier(.2,.7,.2,1)",
                      cursor: "default",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute", top: 0, left: 22, right: 22, height: 3,
                        borderRadius: "0 0 4px 4px",
                        background: `linear-gradient(90deg, ${tier.accent}, ${tier.accent}80)`,
                      }}
                    />

                    {p.featured && (
                      <div style={{ position: "absolute", top: 16, right: 16 }}>
                        <span className="ec-badge ec-badge-mono" style={{ background: tier.soft, color: tier.accent, border: `1px solid ${tier.accent}40` }}>
                          {locale === "es" ? "MEJOR VALOR" : "BEST VALUE"}
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: tier.soft, display: "flex", alignItems: "center", justifyContent: "center", color: tier.accent, fontSize: 14 }}>
                        {i + 1}
                      </div>
                      <span className="h-eyebrow" style={{ color: tier.accent, fontSize: 9.5 }}>
                        {p.duration[locale].toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif" style={{ fontSize: 22, color: "var(--ec-text)", lineHeight: 1.1, marginBottom: 4 }}>
                        {p.name[locale]}
                      </h3>
                      <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>{p.tagline[locale]}</p>
                    </div>

                    <div style={{ padding: "14px 16px", background: tier.soft, borderRadius: 12, border: `1px solid ${tier.accent}25` }}>
                      <div className="font-serif" style={{ fontSize: 34, lineHeight: 1, color: tier.accent, letterSpacing: "-0.02em" }}>
                        {formatUSD(p.priceValue[region])}
                        <span className="font-mono-ec" style={{ fontSize: 12, color: "var(--ec-text-dim)", marginLeft: 4 }}>/mo</span>
                      </div>
                      <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {locale === "es" ? "Total" : "Total"} {formatUSD(planTotal(p, region))} · {p.serviceCount[region]} {locale === "es" ? "servicios" : "services"}
                      </div>
                      <div
                        className="font-mono-ec"
                        style={{
                          marginTop: 8, fontSize: 10.5, fontWeight: 600, padding: "4px 8px", borderRadius: 6, display: "inline-block",
                          background: p.featured ? tier.accent : "var(--ec-surface-3)",
                          color: p.featured ? "#fff" : "var(--ec-text-dim)",
                        }}
                      >
                        {formatUSD(planPerService(p, region))} {locale === "es" ? "por servicio/mes" : "per service/mo"}
                        {p.featured ? ` — ${locale === "es" ? "el más bajo" : "lowest"}` : ""}
                      </div>
                    </div>

                    <button
                      onClick={() => selectPkg(p.id)}
                      style={{
                        marginTop: "auto", width: "100%", padding: "12px 0", borderRadius: 11,
                        background: p.featured ? tier.accent : "var(--ec-brand-soft)",
                        color: p.featured ? "#fff" : "var(--ec-brand)",
                        border: p.featured ? "none" : `1px solid ${tier.accent}30`,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        transition: "all 200ms",
                      }}
                    >
                      {locale === "es" ? "Ver detalles" : "View details"}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}

              {/* Aliado tile */}
              <div
                style={{
                  position: "relative",
                  background: "var(--ec-surface-2)",
                  border: `1px solid var(--ec-hairline-strong)`,
                  borderRadius: 18,
                  padding: "26px 22px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    position: "absolute", top: 0, left: 22, right: 22, height: 3,
                    borderRadius: "0 0 4px 4px",
                    background: `linear-gradient(90deg, ${CUSTOM_COLOR.accent}, ${CUSTOM_COLOR.accent}80)`,
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: CUSTOM_COLOR.soft, display: "flex", alignItems: "center", justifyContent: "center", color: CUSTOM_COLOR.accent }}>
                    <Star size={15} />
                  </div>
                  <span className="h-eyebrow" style={{ color: CUSTOM_COLOR.accent, fontSize: 9.5 }}>
                    {customPlan.minDuration[locale].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif" style={{ fontSize: 22, color: "var(--ec-text)", lineHeight: 1.1, marginBottom: 4 }}>
                    {customPlan.name[locale]}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>{customPlan.tagline[locale]}</p>
                </div>
                <div style={{ padding: "14px 16px", background: CUSTOM_COLOR.soft, borderRadius: 12, border: `1px solid ${CUSTOM_COLOR.accent}25` }}>
                  <div className="font-serif" style={{ fontSize: 26, lineHeight: 1, color: CUSTOM_COLOR.accent, letterSpacing: "-0.02em" }}>
                    {locale === "es" ? "Desde" : "From"} {formatUSD(customPlan.priceFromValue[region])}
                    <span className="font-mono-ec" style={{ fontSize: 12, color: "var(--ec-text-dim)", marginLeft: 4 }}>/mo</span>
                  </div>
                  <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {locale === "es" ? "Total desde" : "Total from"} {formatUSD(customPlan.totalFromValue[region])}
                  </div>
                </div>
                <button
                  onClick={() => selectPkg(customPlan.id)}
                  style={{
                    marginTop: "auto", width: "100%", padding: "12px 0", borderRadius: 11,
                    background: "var(--ec-brand-soft)", color: "var(--ec-brand)",
                    border: `1px solid ${CUSTOM_COLOR.accent}30`,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  }}
                >
                  {locale === "es" ? "Ver detalles" : "View details"}
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════ DETAIL VIEW — regular plan ═══════════ */}
          {pkg && !isCustom && (() => {
            const tierIdx = plans.findIndex((p) => p.id === pkg.id);
            const tier = TIER_COLORS[tierIdx] || TIER_COLORS[0];
            const visibleFeatures = pkg.features.filter((f) => !f.usOnly || region === "us");
            return (
              <motion.div
                key={`detail-${pkg.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <PlanTabs locale={locale} activeId={pkg.id} onSelect={selectPkg} onBack={() => setSelectedId(null)} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Package header */}
                    <div style={{ background: "var(--ec-surface-2)", border: `1px solid ${tier.accent}40`, borderRadius: 16, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${tier.accent}, ${tier.accent}50)` }} />
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div>
                          <div className="h-eyebrow" style={{ color: tier.accent, marginBottom: 8 }}>
                            {tier.label} · {pkg.duration[locale]}
                          </div>
                          <h3 className="font-serif" style={{ fontSize: 34, color: "var(--ec-text)", lineHeight: 1.05, marginBottom: 4 }}>
                            {pkg.name[locale]}
                          </h3>
                          <p style={{ color: "var(--ec-text-muted)", fontSize: 13 }}>{pkg.tagline[locale]}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div className="font-serif" style={{ fontSize: 42, color: tier.accent, lineHeight: 1, letterSpacing: "-0.02em" }}>
                            {formatUSD(pkg.priceValue[region])}
                          </div>
                          <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                            /mo · {locale === "es" ? "total" : "total"} {formatUSD(planTotal(pkg, region))}
                          </div>
                          {pkg.featured && (
                            <span className="ec-badge ec-badge-mono" style={{ marginTop: 8, display: "inline-flex", background: tier.soft, color: tier.accent }}>
                              {locale === "es" ? "MEJOR VALOR" : "BEST VALUE"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feature list */}
                    <div>
                      <div className="h-eyebrow" style={{ marginBottom: 12 }}>
                        {locale === "es" ? "SERVICIOS INCLUIDOS" : "INCLUDED SERVICES"}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {visibleFeatures.map((f, fi) => (
                          <div
                            key={fi}
                            style={{
                              background: "var(--ec-surface-2)",
                              border: "1px solid var(--ec-hairline-strong)",
                              borderRadius: 12,
                              padding: "14px 16px",
                              display: "flex",
                              gap: 10,
                            }}
                          >
                            <CheckCircle2 size={15} style={{ color: tier.accent, marginTop: 2, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ec-text)" }}>
                                {f.text[locale]}
                                {f.usOnly && <span style={{ marginLeft: 6, color: tier.accent }}>★</span>}
                              </div>
                              {f.description && (
                                <div style={{ fontSize: 12, color: "var(--ec-text-muted)", lineHeight: 1.5, marginTop: 2 }}>
                                  {f.description[locale]}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {region === "us" && (
                        <p style={{ fontSize: 11, color: "var(--ec-text-dim)", marginTop: 10 }}>
                          ★ {locale === "es" ? "Exclusivo de la tarifa EUA / internacional." : "Exclusive to the USA / international rate."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Right column — sticky summary ── */}
                  <SummaryPanel
                    locale={locale}
                    tierAccent={tier.accent}
                    tierSoft={tier.soft}
                    title={pkg.name[locale]}
                    price={formatUSD(pkg.priceValue[region])}
                    total={formatUSD(planTotal(pkg, region))}
                    onRequest={() => setShowModal(true)}
                  />
                </div>
              </motion.div>
            );
          })()}

          {/* ════════ DETAIL VIEW — Aliado ═══════════════════ */}
          {isCustom && (
            <motion.div
              key="detail-custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <PlanTabs locale={locale} activeId={customPlan.id} onSelect={selectPkg} onBack={() => setSelectedId(null)} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ background: "var(--ec-surface-2)", border: `1px solid ${CUSTOM_COLOR.accent}40`, borderRadius: 16, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${CUSTOM_COLOR.accent}, ${CUSTOM_COLOR.accent}50)` }} />
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <div className="h-eyebrow" style={{ color: CUSTOM_COLOR.accent, marginBottom: 8 }}>
                          {CUSTOM_COLOR.label} · {customPlan.minDuration[locale]}
                        </div>
                        <h3 className="font-serif" style={{ fontSize: 34, color: "var(--ec-text)", lineHeight: 1.05, marginBottom: 4 }}>
                          {customPlan.name[locale]}
                        </h3>
                        <p style={{ color: "var(--ec-text-muted)", fontSize: 13 }}>{customPlan.tagline[locale]}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div className="font-serif" style={{ fontSize: 34, color: CUSTOM_COLOR.accent, lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {locale === "es" ? "Desde" : "From"} {formatUSD(customPlan.priceFromValue[region])}
                        </div>
                        <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                          /mo · {locale === "es" ? "total desde" : "total from"} {formatUSD(customPlan.totalFromValue[region])}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="h-eyebrow" style={{ marginBottom: 12 }}>
                      {locale === "es" ? "MÓDULO BASE — ELIGE 1" : "BASE MODULE — CHOOSE 1"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {customPlan.modules.map((m, mi) => (
                        <div
                          key={mi}
                          style={{
                            background: "var(--ec-surface-2)",
                            border: "1px solid var(--ec-hairline-strong)",
                            borderRadius: 12,
                            padding: "14px 16px",
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ec-text)" }}>{m.title[locale]}</div>
                          <div style={{ fontSize: 12, color: "var(--ec-text-muted)", lineHeight: 1.5, marginTop: 2 }}>{m.description[locale]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <SummaryPanel
                  locale={locale}
                  tierAccent={CUSTOM_COLOR.accent}
                  tierSoft={CUSTOM_COLOR.soft}
                  title={customPlan.name[locale]}
                  price={`${locale === "es" ? "Desde" : "From"} ${formatUSD(customPlan.priceFromValue[region])}`}
                  total={`${locale === "es" ? "Desde" : "From"} ${formatUSD(customPlan.totalFromValue[region])}`}
                  onRequest={() => setShowModal(true)}
                  ctaLabel={locale === "es" ? "Cotizar" : "Get a quote"}
                />
              </div>
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
              <a href="mailto:juanmanuel@ecommetrica.com" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ec-text-muted)", textDecoration: "none" }}>
                <MdEmail style={{ color: "var(--ec-brand)" }} />
                juanmanuel@ecommetrica.com
              </a>
              <a href="tel:+526646429633" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ec-text-muted)", textDecoration: "none" }}>
                <MdPhone style={{ color: "var(--ec-brand)" }} />
                +52 664 6429 633
              </a>
              <a href="https://ecommetrica.com/" target="_blank" rel="noopener noreferrer" className="ec-badge ec-badge-brand ec-badge-mono" style={{ textDecoration: "none" }}>
                <MdOpenInNew style={{ marginRight: 4 }} />
                ecommetrica.com
              </a>
            </div>
          </motion.div>
        )}

      </div>

      {/* ════════ SUMMARY MODAL ════════════════════════════ */}
      <AnimatePresence>
        {showModal && (pkg || isCustom) && (() => {
          const tierIdx = plans.findIndex((p) => p.id === selectedId);
          const tier = tierIdx >= 0 ? TIER_COLORS[tierIdx] : CUSTOM_COLOR;
          const title = isCustom ? customPlan.name[locale] : pkg!.name[locale];
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
                  maxWidth: 480,
                  width: "100%",
                  boxShadow: "var(--ec-shadow-lg)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <div style={{ background: tier.soft, borderBottom: `1px solid ${tier.accent}25`, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="h-eyebrow" style={{ color: tier.accent, marginBottom: 4 }}>
                      {locale === "es" ? "RESUMEN DEL PAQUETE" : "PACKAGE SUMMARY"}
                    </div>
                    <div className="font-serif" style={{ fontSize: 22, color: "var(--ec-text)" }}>
                      {title}
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowModal(false); setSent(false); setSendError(null); }}
                    style={{ width: 30, height: 30, borderRadius: 8, background: "var(--ec-surface-2)", border: "1px solid var(--ec-hairline-strong)", color: "var(--ec-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
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

                  <div
                    style={{
                      display: "flex", alignItems: "baseline", justifyContent: "space-between",
                      padding: "14px 16px", background: tier.soft, borderRadius: 11, border: `1px solid ${tier.accent}25`,
                    }}
                  >
                    <span className="h-eyebrow">{locale === "es" ? "RESUMEN" : "SUMMARY"}</span>
                    <span className="font-serif" style={{ fontSize: 18, color: tier.accent, letterSpacing: "-0.02em" }}>
                      {summaryLabel}
                    </span>
                  </div>

                  {!sent ? (
                    <button
                      onClick={handleSend}
                      disabled={sending || !email.includes("@")}
                      style={{
                        width: "100%", padding: "13px 0", borderRadius: 11,
                        background: tier.accent, color: "#fff", border: "none",
                        fontSize: 14, fontWeight: 600,
                        cursor: sending || !email.includes("@") ? "not-allowed" : "pointer",
                        opacity: sending || !email.includes("@") ? 0.55 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
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
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "13px 0", borderRadius: 11,
                        background: "var(--ec-success-soft)", color: "var(--ec-success)",
                        fontSize: 14, fontWeight: 600, border: "1px solid rgba(22,163,74,0.25)",
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

/* ── Shared: plan tab switcher ────────────────────────────── */
function PlanTabs({
  locale, activeId, onSelect, onBack,
}: {
  locale: Locale; activeId: string; onSelect: (id: string) => void; onBack: () => void;
}) {
  return (
    <div
      style={{
        display: "flex", gap: 6, marginBottom: 28,
        background: "var(--ec-surface-2)", border: "1px solid var(--ec-hairline)",
        borderRadius: 13, padding: 4, flexWrap: "wrap",
      }}
    >
      {plans.map((p, i) => {
        const tier = TIER_COLORS[i];
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              flex: 1, minWidth: 100, padding: "9px 14px", borderRadius: 9,
              fontSize: 12, fontWeight: active ? 600 : 500, cursor: "pointer", border: "none",
              background: active ? tier.soft : "transparent",
              color: active ? tier.accent : "var(--ec-text-muted)",
              outline: active ? `1px solid ${tier.accent}40` : "none",
              transition: "all 160ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? tier.accent : "var(--ec-hairline-strong)", flexShrink: 0 }} />
            {p.name[locale]}
          </button>
        );
      })}
      <button
        onClick={() => onSelect(customPlan.id)}
        style={{
          flex: 1, minWidth: 100, padding: "9px 14px", borderRadius: 9,
          fontSize: 12, fontWeight: activeId === customPlan.id ? 600 : 500, cursor: "pointer", border: "none",
          background: activeId === customPlan.id ? CUSTOM_COLOR.soft : "transparent",
          color: activeId === customPlan.id ? CUSTOM_COLOR.accent : "var(--ec-text-muted)",
          outline: activeId === customPlan.id ? `1px solid ${CUSTOM_COLOR.accent}40` : "none",
          transition: "all 160ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeId === customPlan.id ? CUSTOM_COLOR.accent : "var(--ec-hairline-strong)", flexShrink: 0 }} />
        {customPlan.name[locale]}
      </button>
      <button
        onClick={onBack}
        style={{
          padding: "9px 14px", borderRadius: 9, fontSize: 12, fontWeight: 500, cursor: "pointer",
          border: "1px solid var(--ec-hairline-strong)", background: "transparent", color: "var(--ec-text-muted)",
          display: "flex", alignItems: "center", gap: 5, transition: "all 160ms", flexShrink: 0,
        }}
      >
        <ArrowLeft size={12} />
        {locale === "es" ? "Todos" : "All"}
      </button>
    </div>
  );
}

/* ── Shared: sticky summary panel ─────────────────────────── */
function SummaryPanel({
  locale, tierAccent, tierSoft, title, price, total, onRequest, ctaLabel,
}: {
  locale: Locale; tierAccent: string; tierSoft: string; title: string;
  price: string; total: string; onRequest: () => void; ctaLabel?: string;
}) {
  return (
    <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "var(--ec-surface-2)", border: `1px solid ${tierAccent}40`, borderRadius: 16, overflow: "hidden", boxShadow: "var(--ec-shadow-md)" }}>
        <div style={{ background: tierSoft, borderBottom: `1px solid ${tierAccent}25`, padding: "16px 20px" }}>
          <div className="h-eyebrow" style={{ color: tierAccent, marginBottom: 6 }}>
            {locale === "es" ? "RESUMEN" : "SUMMARY"}
          </div>
          <div className="font-serif" style={{ fontSize: 20, color: "var(--ec-text)" }}>
            {title}
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
              {locale === "es" ? "Precio" : "Price"}
            </span>
            <span className="font-mono-ec" style={{ fontSize: 14, color: "var(--ec-text)", fontWeight: 600 }}>
              {price}/mo
            </span>
          </div>

          <div style={{ borderTop: "1px solid var(--ec-hairline)", paddingTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="h-eyebrow">TOTAL</span>
              <div>
                <span className="font-serif" style={{ fontSize: 24, color: tierAccent, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {total}
                </span>
                <span className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)", marginLeft: 4 }}>
                  USD
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onRequest}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 11,
              background: tierAccent, color: "#fff", border: "none",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity 160ms", marginTop: 4,
            }}
          >
            <Send size={14} />
            {ctaLabel ?? (locale === "es" ? "Solicitar paquete" : "Request package")}
          </button>

          <p style={{ fontSize: 11, color: "var(--ec-text-dim)", textAlign: "center", lineHeight: 1.5 }}>
            {locale === "es" ? "Recibirás el resumen en tu correo." : "You'll receive the summary by email."}
          </p>
        </div>
      </div>

      <div style={{ background: "var(--ec-surface-2)", border: "1px solid var(--ec-hairline)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="h-eyebrow" style={{ marginBottom: 2 }}>
          {locale === "es" ? "CONTACTO DIRECTO" : "DIRECT CONTACT"}
        </div>
        <a href="mailto:juanmanuel@ecommetrica.com" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-text-muted)", textDecoration: "none" }}>
          <MdEmail style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
          juanmanuel@ecommetrica.com
        </a>
        <a href="tel:+526646429633" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-text-muted)", textDecoration: "none" }}>
          <MdPhone style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
          +52 664 6429 633
        </a>
        <a href="https://ecommetrica.com/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ec-brand)", textDecoration: "none", fontWeight: 500 }}>
          <MdOpenInNew style={{ flexShrink: 0 }} />
          ecommetrica.com
        </a>
      </div>
    </div>
  );
}

export default Packages;
