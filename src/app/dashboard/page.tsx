"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLang } from "@/app/context/LangContext";
import { Hash, ArrowRight, CheckCircle, Activity, Clock, Search } from "lucide-react";

type Project = {
  id: number;
  id_user: number;
  title: string;
  percentage: number;
  content: string;
  project_name: string;
};

type Filter = "all" | "completed" | "progress";

function progressClass(n: number) {
  return n >= 80 ? "success" : n >= 50 ? "warning" : "danger";
}

function progressColor(n: number) {
  return n >= 80
    ? "var(--ec-success)"
    : n >= 50
    ? "var(--ec-warning)"
    : "var(--ec-danger)";
}

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const { lang } = useLang();

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user) {
      if (user.role === "admin") {
        fetchProjects();
      } else {
        fetchProjects(Number(user.id));
      }
    }
  }, [user, router]);

  const fetchProjects = async (userId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = userId
        ? `${process.env.NEXT_PUBLIC_URL}/api/projects/${userId}`
        : `${process.env.NEXT_PUBLIC_URL}/api/projects`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar los proyectos");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setError(lang === "es" ? "No se pudieron cargar los proyectos" : "Could not load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const total = projects.length;
  const completed = useMemo(() => projects.filter((p) => p.percentage >= 80).length, [projects]);
  const inProgress = total - completed;

  const visible = useMemo(() => {
    let result = projects;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.project_name.toLowerCase().includes(q)
      );
    }
    if (filter === "completed") return result.filter((p) => p.percentage >= 80);
    if (filter === "progress") return result.filter((p) => p.percentage < 80);
    return result;
  }, [projects, filter, search]);

  if (user === undefined || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--ec-bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid var(--ec-hairline-strong)",
              borderTopColor: "var(--ec-brand)",
              animation: "spin 700ms linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p
            className="font-mono-ec"
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--ec-text-dim)",
            }}
          >
            {lang === "es" ? "Cargando proyectos…" : "Loading projects…"}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user === null) return null;

  return (
    <div
      className="circuit-bg"
      style={{
        minHeight: "100vh",
        padding: "32px 40px 80px",
        background: "var(--ec-bg)",
      }}
    >
      {/* Page header */}
      <div className="ec-page-header fade-in-up">
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 12 }}>
            {user?.role === "admin"
              ? "⎯⎯⎯  ADMIN VIEW"
              : "⎯⎯⎯  CLIENT VIEW"}
          </div>
          <h1 className="ec-page-title">
            {lang === "es" ? "Tus Proyectos" : "Your Projects"}
          </h1>
          <p className="ec-page-subtitle">
            {lang === "es"
              ? "Gestiona y supervisa todos tus proyectos desde un solo lugar."
              : "Manage and supervise all your projects from one place."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <div className="ec-stat-tile">
            <span className="ec-stat-tile-num" style={{ color: "var(--ec-brand)" }}>
              {total}
            </span>
            <span className="ec-stat-tile-label">
              {lang === "es" ? "Total" : "Total"}
            </span>
          </div>
          <div className="ec-stat-tile">
            <span className="ec-stat-tile-num" style={{ color: "var(--ec-success)" }}>
              {completed}
            </span>
            <span className="ec-stat-tile-label">
              {lang === "es" ? "Completados" : "Completed"}
            </span>
          </div>
          <div className="ec-stat-tile">
            <span className="ec-stat-tile-num" style={{ color: "var(--ec-warning)" }}>
              {inProgress}
            </span>
            <span className="ec-stat-tile-label">
              {lang === "es" ? "En progreso" : "In progress"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="ec-segmented">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            {lang === "es" ? "Todos" : "All"}{" "}
            <span className="font-mono-ec" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>{total}</span>
          </button>
          <button
            className={filter === "progress" ? "active" : ""}
            onClick={() => setFilter("progress")}
          >
            {lang === "es" ? "En progreso" : "In progress"}{" "}
            <span className="font-mono-ec" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>{inProgress}</span>
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            {lang === "es" ? "Completados" : "Completed"}{" "}
            <span className="font-mono-ec" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>{completed}</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", pointerEvents: "none" }} />
            <input
              className="ec-field-input"
              style={{ paddingLeft: 32, width: 220, padding: "8px 12px 8px 32px", fontSize: 13 }}
              placeholder={lang === "es" ? "Buscar proyecto…" : "Search project…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            marginBottom: 24,
            padding: "14px 18px",
            background: "var(--ec-danger-soft)",
            border: "1px solid rgba(248,113,113,0.3)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "var(--ec-danger)", fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {visible.length === 0 && !loading && !error && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
          }}
        >
          <div
            className="h-eyebrow"
            style={{ marginBottom: 16 }}
          >
            {lang === "es" ? "SIN RESULTADOS" : "NO RESULTS"}
          </div>
          <h3
            className="ec-page-title"
            style={{ fontSize: 32, marginBottom: 10 }}
          >
            {lang === "es" ? "No hay proyectos" : "No projects found"}
          </h3>
          <p style={{ color: "var(--ec-text-muted)", fontSize: 14 }}>
            {filter !== "all"
              ? lang === "es"
                ? "Prueba con otro filtro"
                : "Try a different filter"
              : lang === "es"
              ? "Cuando se te asignen proyectos, aparecerán aquí"
              : "Projects assigned to you will appear here"}
          </p>
        </div>
      )}

      {/* Project cards grid */}
      {visible.length > 0 && (
        <div
          className="stagger-children"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {visible.map((project) => {
            const cls = progressClass(project.percentage ?? 0);
            const color = progressColor(project.percentage ?? 0);
            const pct = project.percentage ?? 0;

            return (
              <Link
                key={project.id}
                href={`/dashboard/${project.project_name}`}
                className="ec-project-card"
              >
                {/* Card header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      className="font-serif"
                      style={{
                        fontSize: 22,
                        lineHeight: 1.15,
                        letterSpacing: "-0.01em",
                        fontWeight: 400,
                        color: "var(--ec-text)",
                        marginBottom: 6,
                      }}
                    >
                      {project.title}
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Hash
                        size={11}
                        style={{ color: "var(--ec-text-dim)", flexShrink: 0 }}
                      />
                      <span
                        className="font-mono-ec"
                        style={{
                          fontSize: 11,
                          color: "var(--ec-text-muted)",
                        }}
                      >
                        {project.project_name}
                      </span>
                    </div>
                  </div>
                  <span
                    className="status-dot"
                    style={{
                      width: 9,
                      height: 9,
                      background: color,
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Status badge */}
                <div>
                  {pct >= 80 ? (
                    <span className="ec-badge ec-badge-success">
                      <CheckCircle size={10} />
                      {lang === "es" ? "Completado" : "Completed"}
                    </span>
                  ) : pct >= 50 ? (
                    <span className="ec-badge ec-badge-warning">
                      <Activity size={10} />
                      {lang === "es" ? "En progreso" : "In progress"}
                    </span>
                  ) : (
                    <span className="ec-badge ec-badge-danger">
                      <Clock size={10} />
                      {lang === "es" ? "Iniciado" : "Started"}
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      className="h-eyebrow"
                      style={{ fontSize: 9.5 }}
                    >
                      {lang === "es" ? "Progreso" : "Progress"}
                    </span>
                    <span
                      className="font-mono-ec"
                      style={{ fontSize: 13, color }}
                    >
                      {pct}
                      <span style={{ fontSize: 10, marginLeft: 1 }}>%</span>
                    </span>
                  </div>
                  <div className="ec-progress">
                    <div
                      className={`ec-progress-bar ${cls}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {project.content && (
                  <div>
                    <div
                      className="h-eyebrow"
                      style={{ fontSize: 9.5, marginBottom: 6 }}
                    >
                      {lang === "es" ? "Descripción" : "Description"}
                    </div>
                    <p
                      style={{
                        color: "var(--ec-text-muted)",
                        fontSize: 13,
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.content}
                    </p>
                  </div>
                )}

                {/* Action */}
                <div
                  style={{
                    marginTop: "auto",
                    padding: "11px 14px",
                    borderRadius: 10,
                    background: "var(--ec-brand-soft)",
                    color: "var(--ec-brand)",
                    fontWeight: 500,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 200ms",
                  }}
                  className="pc-action"
                >
                  <span>
                    {lang === "es" ? "Abrir proyecto" : "Open project"}
                  </span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer count */}
      {visible.length > 0 && (
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
          {lang === "es" ? "Mostrando" : "Showing"} {visible.length}{" "}
          {lang === "es" ? "de" : "of"} {total}{" "}
          {lang === "es" ? "proyectos" : "projects"}
        </div>
      )}

      {/* PC action hover effect */}
      <style>{`
        .ec-project-card:hover .pc-action {
          background: var(--ec-brand);
          color: var(--ec-brand-on);
        }
      `}</style>
    </div>
  );
}
