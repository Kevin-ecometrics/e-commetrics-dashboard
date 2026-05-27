"use client";

import { useAuth } from "@/app/context/AuthContext";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Briefcase, Users, FileText, Hash, TrendingUp, Plus } from "lucide-react";
import { motion } from "motion/react";

type User = {
  id: number;
  userName: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreateProject() {
  const { fetchProjects } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    id: "",
    id_user: "",
    title: "",
    percentage: 0,
    content: "",
    project_name: "",
    nameManual: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => toast.error("Error cargando usuarios"));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "title") {
      setForm((f) => ({
        ...f,
        title: value,
        project_name: f.nameManual ? f.project_name : slugify(value),
      }));
    } else if (name === "project_name") {
      setForm((f) => ({ ...f, project_name: value.replace(/\s+/g, "-"), nameManual: true }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, percentage: Number(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.id_user || !form.title || !form.project_name) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id ? Number(form.id) : null,
          id_user: Number(form.id_user),
          title: form.title,
          percentage: form.percentage,
          content: form.content,
          project_name: form.project_name,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear el proyecto");
      }

      toast.success("Proyecto creado correctamente");
      setForm({ id: "", id_user: "", title: "", percentage: 0, content: "", project_name: "", nameManual: false });
      await fetchProjects();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear el proyecto");
    } finally {
      setLoading(false);
    }
  };

  const pct = form.percentage;
  const pctColor = pct >= 80 ? "var(--ec-success)" : pct >= 50 ? "var(--ec-warning)" : pct > 0 ? "var(--ec-danger)" : "var(--ec-text-dim)";
  const pctBarClass = pct >= 80 ? "success" : pct >= 50 ? "warning" : "danger";
  const isValid = !!form.id_user && !!form.title && !!form.project_name;

  return (
    <div className="circuit-bg fade-in-up" style={{ padding: "32px 24px", minHeight: "100%" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Centered icon header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, var(--ec-brand), #7A0E3B)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
            color: "white",
            boxShadow: "0 12px 32px -8px rgba(189,21,92,0.5), 0 0 0 1px rgba(189,21,92,0.3)",
          }}>
            <Briefcase size={26} />
          </div>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>⎯⎯⎯  NUEVO PROYECTO</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)", marginBottom: 10 }}>
            Crear Proyecto
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)", maxWidth: 440, margin: "0 auto" }}>
            Configura un nuevo proyecto con todos los detalles necesarios para comenzar.
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          className="ec-project-card"
          style={{ padding: "28px 32px", borderRadius: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)", display: "flex", alignItems: "center", gap: 8 }}>
                Configuración del Proyecto
              </h2>
              <p style={{ color: "var(--ec-text-muted)", fontSize: 13, marginTop: 4 }}>
                Completa la información básica del proyecto.
              </p>
            </div>
            <span className="ec-badge ec-badge-neutral ec-badge-mono">DRAFT</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* User select */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Users size={11} /> Usuario Asignado <span style={{ color: "var(--ec-danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <select
                  className="ec-field-input"
                  name="id_user"
                  value={form.id_user}
                  onChange={handleChange}
                  style={{ appearance: "none", paddingRight: 36 }}
                  required
                >
                  <option value="">Selecciona un usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.userName}</option>
                  ))}
                </select>
                <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", pointerEvents: "none" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <FileText size={11} /> Título del Proyecto <span style={{ color: "var(--ec-danger)" }}>*</span>
              </label>
              <input
                className="ec-field-input"
                type="text"
                name="title"
                placeholder="Ej. Desarrollo de aplicación web"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Slug with /dashboard/ prefix */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Hash size={11} /> Nombre del Proyecto <span style={{ color: "var(--ec-danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--ec-text-dim)",
                  pointerEvents: "none", whiteSpace: "nowrap",
                }}>
                  /dashboard/
                </span>
                <input
                  className="ec-field-input"
                  type="text"
                  name="project_name"
                  placeholder="proyecto-web-2026"
                  value={form.project_name}
                  onChange={handleChange}
                  style={{ paddingLeft: 100, fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}
                  required
                />
              </div>
              <p className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-muted)", marginTop: 5 }}>
                Identificador único sin espacios (se generan guiones automáticamente).
              </p>
            </div>

            {/* Progress range slider */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <TrendingUp size={11} /> Progreso Inicial
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pct}
                  onChange={handleProgress}
                  style={{ flex: 1, accentColor: "var(--ec-brand)", cursor: "pointer" }}
                />
                <div style={{
                  width: 72, padding: "7px 12px",
                  background: "var(--ec-surface-1)", border: "1px solid var(--ec-hairline)", borderRadius: 10,
                  fontFamily: "JetBrains Mono, monospace", fontSize: 13, textAlign: "center",
                  color: pctColor, fontWeight: 600,
                }}>
                  {pct}<span style={{ fontSize: 10 }}>%</span>
                </div>
              </div>
              <div className="ec-progress" style={{ marginTop: 8 }}>
                <div className={`ec-progress-bar ${pctBarClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <FileText size={11} /> Descripción del Proyecto
                </span>
                <span className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-dim)" }}>
                  {form.content.length}/500
                </span>
              </label>
              <textarea
                className="ec-field-input"
                name="content"
                placeholder="Describe los objetivos, alcance y detalles importantes…"
                value={form.content}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="ec-btn-secondary"
                onClick={() => setForm({ id: "", id_user: "", title: "", percentage: 0, content: "", project_name: "", nameManual: false })}
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={loading || !isValid}
                className="ec-btn-primary"
                style={{ flex: 1, height: 44, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    Creando proyecto…
                  </>
                ) : (
                  <><Plus size={15} /> Crear Proyecto</>
                )}
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--ec-text-dim)" }}>
              Los campos marcados con <span style={{ color: "var(--ec-danger)" }}>*</span> son obligatorios.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
