"use client";

import { useAuth } from "@/app/context/AuthContext";
import React, { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Plus, AlertCircle, Trash2, Edit, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

type Project = {
  id: number;
  id_user: number;
  title: string;
  percentage: number | null;
  content: string;
  project_name: string;
};

type User = {
  id: number;
  userName: string;
};

export default function UpdateProject() {
  const { fetchProjects } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const filteredProjects = search
    ? projects.filter((p) => {
        const q = search.toLowerCase();
        return (p.title?.toLowerCase() || "").includes(q) || (p.project_name?.toLowerCase() || "").includes(q);
      })
    : projects;

  useEffect(() => {
    fetchProjectsList();
    fetchUsers();
  }, []);

  const fetchProjectsList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`);
      if (!res.ok) throw new Error("Error cargando proyectos");
      const data = await res.json();
      setProjects(data);
    } catch {
      toast.error("Error cargando proyectos");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`);
      if (!res.ok) throw new Error("Error cargando usuarios");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Error cargando usuarios");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!selectedProject) return;
    const { name, value } = e.target;
    setSelectedProject({
      ...selectedProject,
      [name]: name === "percentage" || name === "id_user" ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    if (!selectedProject.title || !selectedProject.project_name) {
      toast.error("Título y nombre del proyecto son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProject),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al actualizar");
      }
      toast.success("Proyecto actualizado");
      await fetchProjectsList();
      await fetchProjects();
      setSelectedProject(null);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Error al actualizar proyecto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar");
      }
      toast.success("Proyecto eliminado");
      await fetchProjectsList();
      await fetchProjects();
      if (selectedProject?.id === id) setSelectedProject(null);
      setDeleteConfirm(null);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Error al eliminar proyecto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  GESTIÓN DE PROYECTOS</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)" }}>
            Proyectos
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)", marginTop: 6 }}>
            Edita los datos de un proyecto o elimínalo del sistema.
          </p>
        </div>
        <Link href="/dashboard/create-project" className="ec-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "10px 18px", fontSize: 13 }}>
          <Plus size={15} /> Crear Proyecto
        </Link>
      </div>

      {/* Projects table */}
      <div className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ec-hairline)", display: "flex", alignItems: "center", gap: 12 }}>
          <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>
            Proyectos{" "}
            <span className="font-mono-ec" style={{ fontSize: 12, color: "var(--ec-text-dim)", marginLeft: 6 }}>
              {filteredProjects.length}
            </span>
          </h2>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", pointerEvents: "none" }} />
            <input
              className="ec-field-input"
              style={{ padding: "7px 12px 7px 30px", fontSize: 12.5, width: 200 }}
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading && (
            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--ec-hairline)", borderTopColor: "var(--ec-brand)", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
          )}
        </div>

        {!loading && filteredProjects.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ec-text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
            <p style={{ fontSize: 14 }}>{search ? "Sin resultados para esa búsqueda" : "No hay proyectos registrados"}</p>
          </div>
        ) : (
          <table className="ec-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Slug</th>
                <th>Progreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => {
                const pct = project.percentage ?? 0;
                const pctColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "var(--ec-brand)";
                return (
                  <tr
                    key={project.id}
                    className={selectedProject?.id === project.id ? "ec-table-selected" : ""}
                  >
                    <td style={{ fontWeight: 500 }}>{project.title}</td>
                    <td>
                      <span className="font-mono-ec" style={{ fontSize: 12, color: "var(--ec-text-muted)", background: "var(--ec-surface-2)", padding: "3px 8px", borderRadius: 6 }}>
                        {project.project_name}
                      </span>
                    </td>
                    <td>
                      {project.percentage !== null && project.percentage !== undefined ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, height: 3, borderRadius: 99, background: "var(--ec-hairline)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pctColor, borderRadius: 99 }} />
                          </div>
                          <span className="font-mono-ec" style={{ fontSize: 12, color: pctColor, fontWeight: 700 }}>{pct}%</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--ec-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={{ width: 30, height: 30, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "var(--ec-brand)", color: "#fff", cursor: "pointer", transition: "opacity 150ms" }}
                          onClick={() => { setSelectedProject(project); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100); }}
                          title="Editar"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          style={{ width: 30, height: 30, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--ec-hairline-strong)", background: "transparent", color: "var(--ec-text-muted)", cursor: "pointer", transition: "color 150ms" }}
                          onClick={() => setDeleteConfirm(project)}
                          title="Eliminar"
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--ec-danger)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "var(--ec-text-muted)"}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {selectedProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="ec-project-card"
            style={{ padding: "28px 32px", borderRadius: 18, width: "100%", maxWidth: 600, borderTop: "3px solid var(--ec-brand)", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--ec-hairline)" }}>
              <div>
                <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-muted)", letterSpacing: "0.08em" }}>EDITANDO PROYECTO</div>
                <div className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--ec-text)" }}>{selectedProject.title}</div>
              </div>
              <button style={{ width: 30, height: 30, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--ec-hairline)", background: "transparent", color: "var(--ec-text-muted)", cursor: "pointer", fontSize: 14 }} onClick={() => setSelectedProject(null)}>
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label className="ec-field-label">Título del Proyecto</label>
                <input className="ec-field-input" type="text" name="title" value={selectedProject.title} onChange={handleChange} />
              </div>
              <div>
                <label className="ec-field-label">Nombre / Slug</label>
                <input className="ec-field-input" type="text" name="project_name" value={selectedProject.project_name} onChange={handleChange} />
              </div>
              <div>
                <label className="ec-field-label">Progreso (%)</label>
                <input className="ec-field-input" type="number" name="percentage" value={selectedProject.percentage ?? ""} onChange={handleChange} min={0} max={100} />
              </div>
              <div>
                <label className="ec-field-label">Usuario Asignado</label>
                <select className="ec-field-input" name="id_user" value={selectedProject.id_user} onChange={handleChange}>
                  <option value="">Selecciona un usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.userName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="ec-field-label">Descripción</label>
              <textarea className="ec-field-input" name="content" value={selectedProject.content} onChange={handleChange} rows={4} style={{ resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ec-btn-primary" style={{ flex: 1, height: 42 }} onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button className="ec-btn-secondary" style={{ flex: 1, height: 42 }} onClick={() => setSelectedProject(null)}>
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="ec-project-card"
            style={{ padding: "32px 36px", borderRadius: 18, width: "100%", maxWidth: 440, borderTop: "3px solid var(--ec-brand)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--ec-brand-soft)", color: "var(--ec-brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 18 }}>
                <AlertCircle size={26} />
              </div>
              <h3 className="font-serif" style={{ fontSize: 26, fontWeight: 400, color: "var(--ec-text)", marginBottom: 8, lineHeight: 1.2 }}>
                ¿Eliminar proyecto?
              </h3>
              <p style={{ color: "var(--ec-text-muted)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 6 }}>
                Esta acción eliminará{" "}
                <strong style={{ color: "var(--ec-text)" }}>{deleteConfirm.title}</strong>{" "}
                de forma permanente.
              </p>
              <span className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-dim)", background: "var(--ec-surface-2)", padding: "3px 10px", borderRadius: 6 }}>
                {deleteConfirm.project_name}
              </span>
              <div style={{ width: "100%", height: 1, background: "var(--ec-hairline)", margin: "20px 0" }} />
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button className="ec-btn-secondary" style={{ flex: 1, padding: "9px 16px", fontSize: 13 }} onClick={() => setDeleteConfirm(null)}>
                  Cancelar
                </button>
                <button
                  style={{
                    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "var(--font-inter), var(--font-sans)",
                    background: "var(--ec-brand)", color: "#fff", border: "none", cursor: "pointer", transition: "opacity 150ms",
                  }}
                  disabled={deleting}
                  onClick={() => handleDelete(deleteConfirm.id)}
                >
                  {deleting ? (
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  ) : (
                    <><Trash2 size={14} /> Eliminar</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
