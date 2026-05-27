/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { useAuth } from "@/app/context/AuthContext";
import { useLang } from "@/app/context/LangContext";
import { Hash, Target, Sparkles, Layers, TrendingUp, Zap, ExternalLink, Plus, MoreHorizontal } from "lucide-react";
import ContentModal from "@/components/ContentModal";

type Project = {
  id: number;
  id_user: number;
  title: string;
  percentage: number | null;
  content: string;
  project_name: string;
  created_at: string;
  next_review?: string;
};

type ProjectContentItem = {
  id: number;
  project_id: number;
  content_1: string;
  content_2: string;
  content_3: string;
  link: string;
  href: string;
  id_user: number;
  source: string;
  type: string;
  created_at: string;
};

const CONTENT_TYPES_ES = [
  "Todos",
  "Business and Objectives",
  "MVP + IDEA",
  "Business strategy",
  "Growth Hacking strategy",
  "Apps",
];

const CONTENT_TYPES_EN = [
  "All",
  "Business and Objectives",
  "MVP + IDEA",
  "Business strategy",
  "Growth Hacking strategy",
  "Apps",
];

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const formatDate = (dateStr: string, lang: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = lang === "es" ? MONTHS_ES : MONTHS_EN;
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

const PHASE_CONFIG = [
  {
    type: "Business and Objectives",
    icon: Target,
    accent: "#A78BFA",
    label_es: "Business & Objectives",
    label_en: "Business & Objectives",
    desc_es: "Objetivos, KPIs y posicionamiento estratégico.",
    desc_en: "Goals, KPIs and strategic positioning.",
  },
  {
    type: "MVP + IDEA",
    icon: Sparkles,
    accent: "#60A5FA",
    label_es: "MVP + Idea",
    label_en: "MVP + Idea",
    desc_es: "Concepto inicial, hipótesis, alcance del MVP.",
    desc_en: "Initial concept, hypotheses, MVP scope.",
  },
  {
    type: "Business strategy",
    icon: Layers,
    accent: "#34D399",
    label_es: "Business Strategy",
    label_en: "Business Strategy",
    desc_es: "Plan de mercado, pricing y diferenciación.",
    desc_en: "Market plan, pricing and differentiation.",
  },
  {
    type: "Growth Hacking strategy",
    icon: TrendingUp,
    accent: "#FBBF24",
    label_es: "Growth Hacking",
    label_en: "Growth Hacking",
    desc_es: "Experimentos, embudo y canales de adquisición.",
    desc_en: "Experiments, funnel and acquisition channels.",
  },
  {
    type: "Apps",
    icon: Zap,
    accent: "#F87171",
    label_es: "Apps",
    label_en: "Apps",
    desc_es: "Aplicaciones especializadas conectadas al proyecto.",
    desc_en: "Specialized apps connected to the project.",
  },
];

function CircularProgress({ value, color }: { value: number; color: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const targetOffset = c - (value / 100) * c;

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--ec-surface-2)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeLinecap="round"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          className="font-serif"
          style={{ fontSize: 40, fontWeight: 400, lineHeight: 1, color }}
        >
          {displayValue}<span style={{ fontSize: 16 }}>%</span>
        </div>
        <motion.div
          className="h-eyebrow"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ marginTop: 2, fontSize: 9 }}
        >
          OVERALL
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ProjectContent({ project: initialProject }: { project: Project[] }) {
  const { user } = useAuth();
  const { lang } = useLang();

  const [currentProject, setCurrentProject] = useState<Project | null>(initialProject[0] ?? null);
  const [contents, setContents] = useState<ProjectContentItem[]>([]);
  const [clientEmail, setClientEmail] = useState<string>("");
  const [activeType, setActiveType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editContent, setEditContent] = useState<ProjectContentItem | null>(null);

  const types = lang === "es" ? CONTENT_TYPES_ES : CONTENT_TYPES_EN;
  const allLabel = types[0];

  // Re-fetch project from API so id_user is always fresh
  useEffect(() => {
    if (!initialProject[0]?.project_name) return;
    axios
      .get(`${process.env.NEXT_PUBLIC_URL}/api/project/${initialProject[0].project_name}`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setCurrentProject(res.data[0]);
      })
      .catch(() => {});
  }, [initialProject[0]?.project_name]);

  useEffect(() => {
    if (!currentProject?.id_user) return;
    axios
      .get(`${process.env.NEXT_PUBLIC_URL}/api/users`)
      .then((res) => {
        const users = Array.isArray(res.data) ? res.data : [];
        const owner = users.find((u: any) => Number(u.id) === Number(currentProject.id_user));
        setClientEmail(owner?.email || owner?.userName || "");
      })
      .catch(() => {});
  }, [currentProject?.id_user]);

  useEffect(() => {
    if (user !== undefined) setAuthLoading(false);
  }, [user]);

  const isOwner = Number(user?.id) === currentProject?.id_user;
  const isAdmin = user?.role === "admin";
  const canAccess = isOwner || isAdmin;

  useEffect(() => {
    const fetchContents = async () => {
      if (!currentProject?.id || !canAccess) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_URL}/api/project_content/${currentProject.id}`
        );
        setContents(Array.isArray(res.data) ? res.data : []);
      } catch {
        setContents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [currentProject?.id, canAccess]);

  const pct = currentProject?.percentage ?? 0;
  const [displayPct, setDisplayPct] = useState(0);
  const progressColor = pct >= 80 ? "var(--ec-success)" : pct >= 50 ? "var(--ec-warning)" : "var(--ec-danger)";

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = 16;
    const increment = pct / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= pct) {
        setDisplayPct(pct);
        clearInterval(timer);
      } else {
        setDisplayPct(Math.round(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [pct]);
  const progressCls = pct >= 80 ? "success" : pct >= 50 ? "warning" : "danger";

  const filteredContents = activeType
    ? contents.filter((item) => item.type === activeType)
    : contents;

  if (authLoading || !currentProject) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <div
          style={{
            width: 48, height: 48,
            borderRadius: "50%",
            border: "3px solid var(--ec-hairline-strong)",
            borderTopColor: "var(--ec-brand)",
            animation: "spin 700ms linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div
        style={{
          padding: "80px 40px",
          textAlign: "center",
        }}
      >
        <div className="h-eyebrow" style={{ marginBottom: 14 }}>⎯⎯⎯  ACCESS DENIED</div>
        <h1
          className="ec-page-title"
          style={{ fontSize: 36, marginBottom: 12 }}
        >
          {lang === "es" ? "Acceso denegado" : "Access Denied"}
        </h1>
        <p style={{ color: "var(--ec-text-muted)" }}>
          {lang === "es"
            ? "No tienes permiso para ver este contenido."
            : "You do not have permission to view this content."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="circuit-bg"
      style={{
        minHeight: "100vh",
        padding: "32px 40px 80px",
        background: "var(--ec-bg)",
      }}
    >
      {/* Project hero header */}
      <div className="fade-in-up" style={{ marginBottom: 36 }}>
        {/* ID + status badge row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Hash size={11} style={{ color: "var(--ec-text-dim)" }} />
          <span
            className="font-mono-ec"
            style={{ fontSize: 11, color: "var(--ec-text-muted)" }}
          >
            {currentProject.project_name}
          </span>
          <span style={{ color: "var(--ec-text-faint)" }}>·</span>
          {pct >= 80 ? (
            <span className="ec-badge ec-badge-success">
              {lang === "es" ? "Completado" : "Completed"}
            </span>
          ) : pct >= 50 ? (
            <span className="ec-badge ec-badge-warning">
              {lang === "es" ? "En progreso" : "In progress"}
            </span>
          ) : (
            <span className="ec-badge ec-badge-danger">
              {lang === "es" ? "Iniciado" : "Started"}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, auto)",
            gap: 32,
            alignItems: "end",
            paddingBottom: 28,
            borderBottom: "1px solid var(--ec-hairline)",
          }}
        >
          <div>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "-0.025em",
                color: "var(--ec-text)",
                marginBottom: 14,
              }}
            >
              {currentProject.title}
            </h1>
            {currentProject.content && (
              <p
                style={{
                  fontSize: 15,
                  color: "var(--ec-text-muted)",
                  maxWidth: "60ch",
                  lineHeight: 1.55,
                }}
              >
                {currentProject.content}
              </p>
            )}
            <div style={{ display: "flex", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="h-eyebrow" style={{ marginBottom: 4 }}>
                  {lang === "es" ? "Progreso" : "Progress"}
                </div>
                <div
                  className="font-mono-ec"
                  style={{ fontSize: 14, color: progressColor, fontWeight: 500 }}
                >
                  {displayPct}%
                </div>
              </motion.div>
              <div style={{ width: 1, background: "var(--ec-hairline)" }} />
              <div>
                <div className="h-eyebrow" style={{ marginBottom: 4 }}>
                  {lang === "es" ? "Contenidos" : "Contents"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ec-text)" }}>
                  {contents.length}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
              <div>
                <div className="h-eyebrow" style={{ marginBottom: 4 }}>
                  {lang === "es" ? "Cliente" : "Client"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ec-text)" }}>
                  {clientEmail || "—"}
                </div>
              </div>
              <div style={{ width: 1, background: "var(--ec-hairline)" }} />
              <div>
                <div className="h-eyebrow" style={{ marginBottom: 4 }}>
                  {lang === "es" ? "Iniciado" : "Started"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ec-text)" }}>
                  {currentProject.created_at ? formatDate(currentProject.created_at, lang) : "—"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <CircularProgress value={pct} color={progressColor} />
            <button
              onClick={() => { setModalMode("create"); setEditContent(null); setModalOpen(true); }}
              className="ec-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12, whiteSpace: "nowrap", cursor: "pointer", border: "none" }}
            >
              <Plus size={14} /> {lang === "es" ? "Crear Contenido" : "Create Content"}
            </button>
          </div>
        </div>
      </div>

      {/* Phase filter strip */}
      <div className="fade-in-up" style={{ marginBottom: 32 }}>
        <div className="h-eyebrow" style={{ marginBottom: 14 }}>
          ⎯⎯⎯ {lang === "es" ? "FASES DEL PROYECTO" : "PROJECT PHASES"}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {PHASE_CONFIG.map((phase) => {
            const Ico = phase.icon;
            const count = contents.filter((c) => c.type === phase.type).length;
            const isActive = activeType === phase.type;
            return (
              <button
                key={phase.type}
                className="ec-phase-card"
                onClick={() => setActiveType(isActive ? "" : phase.type)}
                style={{
                  border: isActive
                    ? `1px solid ${phase.accent}`
                    : "1px solid var(--ec-hairline)",
                  boxShadow: isActive ? `0 0 0 4px ${phase.accent}25` : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 32, height: 32,
                      borderRadius: 8,
                      background: `${phase.accent}1a`,
                      color: phase.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Ico size={16} />
                  </div>
                  <span
                    className="ec-badge ec-badge-mono"
                    style={{
                      background: `${phase.accent}14`,
                      color: phase.accent,
                      fontSize: 10,
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      marginBottom: 2,
                      color: "var(--ec-text)",
                    }}
                  >
                    {lang === "es" ? phase.label_es : phase.label_en}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "var(--ec-text-dim)",
                    }}
                  >
                    {lang === "es" ? phase.desc_es : phase.desc_en}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active filter label */}
        {activeType && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              className="h-eyebrow"
              style={{ fontSize: 9.5 }}
            >
              {lang === "es" ? "Filtro activo:" : "Active filter:"}
            </span>
            <span
              style={{
                fontSize: 12.5,
                color: "var(--ec-brand)",
                fontWeight: 500,
              }}
            >
              {activeType}
            </span>
            <button
              onClick={() => setActiveType("")}
              style={{
                fontSize: 11,
                color: "var(--ec-text-dim)",
                background: "var(--ec-surface-1)",
                border: "1px solid var(--ec-hairline)",
                borderRadius: 6,
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              {lang === "es" ? "Limpiar" : "Clear"}
            </button>
          </div>
        )}
      </div>

      {/* Content section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div className="h-eyebrow">
            ⎯⎯⎯ {lang === "es" ? "CONTENIDO" : "CONTENT"}{" "}
            <span className="font-mono-ec" style={{ fontSize: 10, marginLeft: 6 }}>
              ({filteredContents.length})
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "48px 0",
            }}
          >
            <div
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                border: "3px solid var(--ec-hairline-strong)",
                borderTopColor: "var(--ec-brand)",
                animation: "spin 700ms linear infinite",
              }}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredContents.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
            }}
          >
            <div className="h-eyebrow" style={{ marginBottom: 14 }}>
              {lang === "es" ? "SIN CONTENIDO" : "NO CONTENT"}
            </div>
            <h3
              className="font-serif"
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: "var(--ec-text)",
                marginBottom: 8,
              }}
            >
              {lang === "es" ? "Sin elementos en esta fase" : "No items in this phase"}
            </h3>
            <p style={{ color: "var(--ec-text-muted)", fontSize: 14 }}>
              {lang === "es"
                ? "No hay contenido disponible para este filtro."
                : "No content available for this filter."}
            </p>
          </div>
        )}

        {/* Content cards grid */}
        {!loading && filteredContents.length > 0 && (
          <div
            className="stagger-children"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 18,
            }}
          >
            {filteredContents.map((item) => {
              const phase = PHASE_CONFIG.find((p) => p.type === item.type);
              const accent = phase?.accent ?? "var(--ec-brand)";

              return (
                <div
                  key={item.id}
                  style={{
                    background: "var(--ec-surface-1)",
                    border: "1px solid var(--ec-hairline-strong)",
                    borderRadius: 16,
                    overflow: "hidden",
                    transition: "all 220ms cubic-bezier(.2,.7,.2,1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="ec-content-card"
                >
                  {/* Image */}
                  {item.source ? (
                    <div style={{ position: "relative", overflow: "hidden", height: 160 }}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_URL}/${item.source}`}
                        alt={item.type}
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover",
                          transition: "transform 300ms",
                        }}
                        loading="lazy"
                        className="ec-content-img"
                      />
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <button
                          onClick={() => { setEditContent(item); setModalMode("edit"); setModalOpen(true); }}
                          style={{
                            background: "rgba(0,0,0,0.5)",
                            border: "none",
                            borderRadius: 6,
                            width: 28, height: 28,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            color: "#fff",
                          }}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        height: 80,
                        background: `${accent}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderBottom: `1px solid ${accent}25`,
                        position: "relative",
                      }}
                    >
                      {phase && (
                        <phase.icon
                          size={28}
                          style={{ color: accent, opacity: 0.7 }}
                        />
                      )}
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <button
                          onClick={() => { setEditContent(item); setModalMode("edit"); setModalOpen(true); }}
                          style={{
                            background: `${accent}20`,
                            border: "none",
                            borderRadius: 6,
                            width: 28, height: 28,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            color: accent,
                          }}
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card body */}
                  <div
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    {/* Type badge */}
                    <span
                      className="ec-badge ec-badge-mono"
                      style={{ background: `${accent}14`, color: accent, alignSelf: "flex-start" }}
                    >
                      {item.type}
                    </span>

                    {/* Content */}
                    {item.content_1 && (
                      <h3
                        className="font-serif"
                        style={{
                          fontSize: 20,
                          fontWeight: 400,
                          color: "var(--ec-text)",
                          lineHeight: 1.25,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.content_1}
                      </h3>
                    )}

                    {item.content_2 && (
                      <p
                        style={{
                          fontSize: 13.5,
                          color: "var(--ec-text-muted)",
                          lineHeight: 1.55,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.content_2}
                      </p>
                    )}

                    {item.content_3 && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--ec-text-dim)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.content_3}
                      </p>
                    )}

                    {/* Link */}
                    {item.link && (
                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: 12,
                          borderTop: "1px solid var(--ec-hairline)",
                        }}
                      >
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12.5,
                            fontWeight: 500,
                            color: accent,
                            textDecoration: "none",
                            transition: "opacity 160ms",
                          }}
                        >
                          <ExternalLink size={13} />
                          <span>{item.href || (lang === "es" ? "Ver enlace" : "View link")}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && filteredContents.length > 0 && (
        <div
          className="font-mono-ec"
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 10.5,
            color: "var(--ec-text-dim)",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {lang === "es" ? "Mostrando" : "Showing"} {filteredContents.length}{" "}
          {lang === "es" ? "de" : "of"} {contents.length}{" "}
          {lang === "es" ? "elementos" : "items"}
        </div>
      )}

      <ContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        projectId={currentProject.id}
        content={editContent}
        onSaved={() => {
          const fetchContents = async () => {
            if (!currentProject?.id) return;
            setLoading(true);
            try {
              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_URL}/api/project_content/${currentProject.id}`
              );
              setContents(Array.isArray(res.data) ? res.data : []);
            } catch {
              setContents([]);
            } finally {
              setLoading(false);
            }
          };
          fetchContents();
        }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ec-content-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--ec-shadow-md);
        }
        .ec-content-card:hover .ec-content-img {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
}
