/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast, Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

interface Project {
  id: number;
  title: string;
}

interface ProjectContent {
  id: number;
  project_id: number;
  content_1: string;
  content_2: string;
  content_3: string;
  link: string;
  href: string;
  id_user: number;
  source: string | null;
  type:
    | "Business and Objectives"
    | "MVP + IDEA"
    | "Business strategy"
    | "Growth Hacking strategy"
    | "Apps";
  created_at: string;
}

const CONTENT_TYPES = [
  "Business and Objectives",
  "MVP + IDEA",
  "Business strategy",
  "Growth Hacking strategy",
  "Apps",
] as const;

export default function ProjectContentByProjectEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contents, setContents] = useState<ProjectContent[]>([]);
  const [editingContent, setEditingContent] = useState<ProjectContent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectContent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<number[]>([]);

  useEffect(() => { loadData(); }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`);
      if (!projectsRes.ok) throw new Error("Error al cargar proyectos");
      const projectsData: Project[] = await projectsRes.json();

      const contentRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/project_content`);
      if (!contentRes.ok) throw new Error("Error al cargar contenido");
      const contentData: ProjectContent[] = await contentRes.json();

      const validProjectIds = new Set(projectsData.map((p) => p.id));
      const filteredContent = contentData.filter((c) => validProjectIds.has(c.project_id));

      setProjects(projectsData);
      setContents(filteredContent);
    } catch {
      toast.error("Error al obtener datos");
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match("image.*")) {
        toast.error("Por favor, selecciona un archivo de imagen válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe exceder los 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setImagePreview(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/project_content/${deleteConfirm.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Contenido eliminado");
      setContents((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      if (editingContent?.id === deleteConfirm.id) setEditingContent(null);
      setDeleteConfirm(null);
    } catch {
      toast.error("Error al eliminar contenido");
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editingContent) return;
    const { name, value } = e.target;
    setEditingContent({ ...editingContent, [name]: value });
  };

  const handleSave = async () => {
    if (!editingContent) return;
    try {
      const formData = new FormData();
      formData.append("content_1", editingContent.content_1 || "");
      formData.append("content_2", editingContent.content_2 || "");
      formData.append("content_3", editingContent.content_3 || "");
      formData.append("link", editingContent.link || "");
      formData.append("href", editingContent.href || "");
      formData.append("type", editingContent.type);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/project_content/${editingContent.id}`,
        { method: "PUT", credentials: "include", body: formData }
      );
      if (!res.ok) throw new Error("Error al guardar cambios");

      const data = await res.json();
      toast.success("Contenido actualizado");

      if (data.imageUrl) {
        setContents((prev) =>
          prev.map((c) => c.id === editingContent.id ? { ...c, source: data.imageUrl } : c)
        );
      }

      setEditingContent(null);
      setImageFile(null);
      setImagePreview(null);
      loadData();
    } catch {
      toast.error("Error al actualizar contenido");
    }
  };

  const groupContentByProject = () => {
    const map = new Map<number, ProjectContent[]>();
    for (const c of contents) {
      if (!map.has(c.project_id)) map.set(c.project_id, []);
      map.get(c.project_id)!.push(c);
    }
    return map;
  };

  if (loading) {
    return (
      <div className="fade-in-up" style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: 10, color: "var(--ec-text-muted)" }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--ec-hairline)", borderTopColor: "var(--ec-brand)", animation: "spin 0.7s linear infinite" }} />
        Cargando...
      </div>
    );
  }

  const contentByProject = groupContentByProject();

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  CONTENIDO POR PROYECTO</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)" }}>
            Editar Contenido
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)", marginTop: 6 }}>
            Modifica o elimina el contenido asociado a cada proyecto.
          </p>
        </div>
        <Link href="/dashboard/create-project-content" className="ec-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "10px 18px", fontSize: 13 }}>
          <Plus size={15} /> Crear Contenido
        </Link>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--ec-text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
          <p style={{ fontSize: 14 }}>No hay proyectos disponibles</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.map((project) => {
            const isExpanded = expandedProjects.includes(project.id);
            const projectContents = contentByProject.get(project.id) || [];

            return (
              <div key={project.id} className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden" }}>
                {/* Accordion toggle */}
                <button
                  onClick={() => toggleProject(project.id)}
                  style={{
                    width: "100%", padding: "14px 20px", display: "flex", alignItems: "center",
                    justifyContent: "space-between", background: "none", border: "none", cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h3 className="font-serif" style={{ fontSize: 16, fontWeight: 400, color: "var(--ec-text)" }}>
                      {project.title}
                    </h3>
                    <span style={{
                      padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: "rgba(189,21,92,0.10)", color: "var(--ec-brand)",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                    }}>
                      {projectContents.length}
                    </span>
                  </div>
                  <svg
                    width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--ec-text-muted)"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 200ms", flexShrink: 0 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                      style={{ borderTop: "1px solid var(--ec-hairline)", overflow: "hidden" }}
                    >
                      {projectContents.length === 0 ? (
                        <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--ec-text-muted)", fontSize: 13 }}>
                          Sin contenido en este proyecto
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table className="ec-table">
                          <thead>
                            <tr>
                              <th>Tipo</th>
                              <th>Contenido 1</th>
                              <th>Contenido 2</th>
                              <th>Contenido 3</th>
                              <th>Link</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectContents.map((content) => (
                              <tr key={content.id}>
                                <td>
                                  <span style={{
                                    display: "inline-block", padding: "3px 10px", borderRadius: 99,
                                    fontSize: 11, fontWeight: 700, background: "var(--ec-surface-2)",
                                    color: "var(--ec-text-muted)", border: "1px solid var(--ec-hairline)",
                                    whiteSpace: "nowrap",
                                  }}>
                                    {content.type}
                                  </span>
                                </td>
                                <td style={{ maxWidth: 160 }}>
                                  <span style={{ fontSize: 13, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {content.content_1 || <em style={{ color: "var(--ec-text-muted)" }}>—</em>}
                                  </span>
                                </td>
                                <td style={{ maxWidth: 160 }}>
                                  <span style={{ fontSize: 13, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {content.content_2 || <em style={{ color: "var(--ec-text-muted)" }}>—</em>}
                                  </span>
                                </td>
                                <td style={{ maxWidth: 160 }}>
                                  <span style={{ fontSize: 13, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {content.content_3 || <em style={{ color: "var(--ec-text-muted)" }}>—</em>}
                                  </span>
                                </td>
                                <td>
                                  {content.link ? (
                                    <span className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-brand)", maxWidth: 120, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {content.link}
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--ec-text-muted)", fontSize: 12 }}>—</span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                      style={{ width: 30, height: 30, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "var(--ec-brand)", color: "#fff", cursor: "pointer", transition: "opacity 150ms" }}
                                      onClick={() => { setEditingContent(content); setImageFile(null); setImagePreview(null); }}
                                      title="Editar"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      style={{ width: 30, height: 30, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--ec-hairline-strong)", background: "transparent", color: "var(--ec-text-muted)", cursor: "pointer", transition: "color 150ms" }}
                                      onClick={() => setDeleteConfirm(content)}
                                      title="Eliminar"
                                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--ec-danger)"}
                                      onMouseLeave={(e) => e.currentTarget.style.color = "var(--ec-text-muted)"}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {mounted && editingContent && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
          <div className="ec-project-card" style={{ borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto", borderTop: "3px solid var(--ec-brand)" }}>
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--ec-hairline)", position: "sticky", top: 0, background: "var(--ec-surface-1)", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>EDITANDO CONTENIDO</div>
                  <div className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--ec-text)" }}>
                    {editingContent.type}
                  </div>
                </div>
                <button
                  className="ec-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => { setEditingContent(null); setImageFile(null); setImagePreview(null); }}
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Type */}
              <div style={{ marginBottom: 16 }}>
                <label className="ec-field-label">Tipo de Contenido</label>
                <select className="ec-field-input" name="type" value={editingContent.type} onChange={handleChange}>
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div style={{ marginBottom: 16 }}>
                <label className="ec-field-label">Imagen</label>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {(imagePreview || editingContent.source) && (
                    <img
                      src={imagePreview || `${process.env.NEXT_PUBLIC_URL}${editingContent.source}`}
                      alt="Preview"
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--ec-border)", flexShrink: 0 }}
                      onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = "none"; }}
                    />
                  )}
                  <label style={{ flex: 1, cursor: "pointer" }}>
                    <div style={{ border: "1.5px dashed var(--ec-border)", borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--ec-text-muted)" }}>
                        {imageFile ? imageFile.name : "Seleccionar nueva imagen"}
                      </span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              {/* Content fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label className="ec-field-label">Contenido Principal</label>
                  <textarea className="ec-field-input" name="content_1" rows={4} value={editingContent.content_1} onChange={handleChange} style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label className="ec-field-label">Contenido Secundario</label>
                  <textarea className="ec-field-input" name="content_2" rows={4} value={editingContent.content_2} onChange={handleChange} style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label className="ec-field-label">Contenido Extra</label>
                  <textarea className="ec-field-input" name="content_3" rows={4} value={editingContent.content_3} onChange={handleChange} style={{ resize: "vertical" }} />
                </div>
              </div>

              {/* Links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                <div>
                  <label className="ec-field-label">Enlace Principal</label>
                  <input className="ec-field-input" type="text" name="link" value={editingContent.link} onChange={handleChange} placeholder="https://ejemplo.com" />
                </div>
                <div>
                  <label className="ec-field-label">Referencia Externa</label>
                  <input className="ec-field-input" type="text" name="href" value={editingContent.href} onChange={handleChange} placeholder="/ruta/recurso" />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="ec-btn-primary" style={{ flex: 1, height: 42 }} onClick={handleSave}>
                  Guardar Cambios
                </button>
                <button
                  className="ec-btn-secondary"
                  style={{ flex: 1, height: 42 }}
                  onClick={() => { setEditingContent(null); setImageFile(null); setImagePreview(null); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Delete confirmation modal */}
      {mounted && deleteConfirm && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
          onClick={() => { if (!deleting) setDeleteConfirm(null); }}
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
                ¿Eliminar contenido?
              </h3>
              <p style={{ color: "var(--ec-text-muted)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 6 }}>
                Esta acción eliminará este contenido de forma permanente.
              </p>
              {deleteConfirm.content_1 && (
                <span className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-dim)", background: "var(--ec-surface-2)", padding: "3px 10px", borderRadius: 6 }}>
                  {deleteConfirm.content_1}
                </span>
              )}
              <div style={{ width: "100%", height: 1, background: "var(--ec-hairline)", margin: "20px 0" }} />
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <button className="ec-btn-secondary" style={{ flex: 1, padding: "9px 16px", fontSize: 13 }} onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                  Cancelar
                </button>
                <button
                  style={{
                    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "var(--font-inter), var(--font-sans)",
                    background: "var(--ec-brand)", color: "#fff", border: "none", cursor: "pointer", transition: "opacity 150ms",
                  }}
                  disabled={deleting}
                  onClick={handleDeleteConfirm}
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
        </div>, document.body
      )}
    </div>
  );
}
