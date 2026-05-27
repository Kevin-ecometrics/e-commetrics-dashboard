"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

const TYPES = [
  "Business and Objectives",
  "MVP + IDEA",
  "Business strategy",
  "Growth Hacking strategy",
  "Apps",
];

type Project = { id: number; project_name: string; id_user: number };

type ContentItem = {
  id: number;
  project_id: number;
  content_1: string;
  content_2: string;
  content_3: string;
  link: string;
  href: string;
  id_user: number;
  source: string | null;
  type: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  projectId?: number;
  content?: ContentItem | null;
  onSaved: () => void;
};

export default function ContentModal({ open, onClose, mode, projectId, content, onSaved }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    project_id: "",
    content_1: "",
    content_2: "",
    content_3: "",
    link: "",
    href: "",
    id_user: "",
    type: TYPES[0],
  });

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => toast.error("Error cargando proyectos"));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && content) {
      setForm({
        project_id: content.project_id.toString(),
        content_1: content.content_1 || "",
        content_2: content.content_2 || "",
        content_3: content.content_3 || "",
        link: content.link || "",
        href: content.href || "",
        id_user: content.id_user.toString(),
        type: content.type,
      });
      setImageFile(null);
      setImagePreview(null);
    } else {
      const pid = projectId?.toString() || "";
      setForm({
        project_id: pid,
        content_1: "",
        content_2: "",
        content_3: "",
        link: "",
        href: "",
        id_user: "",
        type: TYPES[0],
      });
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open, mode, content, projectId]);

  useEffect(() => {
    if (!form.project_id) return;
    const selected = projects.find((p) => p.id.toString() === form.project_id);
    if (selected) {
      setForm((prev) => ({ ...prev, id_user: selected.id_user.toString() }));
    }
  }, [form.project_id, projects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project_id || !form.id_user || !form.type) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("project_id", form.project_id);
      data.append("content_1", form.content_1);
      data.append("content_2", form.content_2);
      data.append("content_3", form.content_3);
      data.append("link", form.link);
      data.append("href", form.href);
      data.append("id_user", form.id_user);
      data.append("type", form.type);
      if (imageFile) data.append("image", imageFile);

      let res: Response;
      if (isEdit && content) {
        res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/project_content/${content.id}`, {
          method: "PUT",
          body: data,
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects/content`, {
          method: "POST",
          body: data,
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al guardar contenido");
      }

      toast.success(isEdit ? "Contenido actualizado" : "Contenido creado");
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al guardar contenido");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}>
      <div className="ec-project-card" style={{ borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
        {/* Modal header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--ec-hairline)", position: "sticky", top: 0, background: "var(--ec-surface-1)", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>
                {isEdit ? "EDITANDO CONTENIDO" : "NUEVO CONTENIDO"}
              </div>
              <div className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--ec-text)" }}>
                {isEdit ? `Editando: ${content?.type || ""}` : "Crear Contenido"}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ec-text-muted)", padding: 4 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Project + Type */}
          <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 12, marginBottom: 16 }}>
            <div className="h-eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>PROYECTO</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="ec-field-label">Proyecto *</label>
                <select className="ec-field-input" name="project_id" value={form.project_id} onChange={handleChange} required disabled>
                  <option value="">Selecciona un proyecto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ec-field-label">Tipo de Contenido</label>
                <select className="ec-field-input" name="type" value={form.type} onChange={handleChange}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 12, marginBottom: 16 }}>
            <div className="h-eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>CONTENIDO</div>
            <div style={{ marginBottom: 14 }}>
              <label className="ec-field-label">Título Principal</label>
              <input className="ec-field-input" type="text" name="content_1" placeholder="Título o encabezado principal" value={form.content_1} onChange={handleChange} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="ec-field-label">Descripción</label>
              <input className="ec-field-input" type="text" name="content_2" placeholder="Descripción detallada del contenido" value={form.content_2} onChange={handleChange} />
            </div>
            <div>
              <label className="ec-field-label">Notas Adicionales</label>
              <input className="ec-field-input" name="content_3" placeholder="Información adicional, comentarios..." value={form.content_3} onChange={handleChange} />
            </div>
          </div>

          {/* Links */}
          <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 12, marginBottom: 16 }}>
            <div className="h-eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>ENLACES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="ec-field-label">URL del enlace</label>
                <input className="ec-field-input" type="url" name="link" placeholder="https://ejemplo.com" value={form.link} onChange={handleChange} />
              </div>
              <div>
                <label className="ec-field-label">Texto del enlace</label>
                <input className="ec-field-input" type="text" name="href" placeholder="Ver más información" value={form.href} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 12, marginBottom: 24 }}>
            <div className="h-eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>IMAGEN</div>
            {(imagePreview || (isEdit && content?.source)) ? (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={imagePreview || `${process.env.NEXT_PUBLIC_URL}/${content?.source}`}
                  alt="Preview"
                  style={{ maxWidth: 200, borderRadius: 8, border: "1px solid var(--ec-border)" }}
                />
              </div>
            ) : null}
            <label htmlFor="content-modal-image" style={{ display: "block", cursor: "pointer" }}>
              <div style={{ border: "1.5px dashed var(--ec-border)", borderRadius: 10, padding: "20px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
                  {imageFile ? (
                    <span style={{ color: "var(--ec-brand)", fontWeight: 600 }}>{imageFile.name}</span>
                  ) : (
                    "Seleccionar imagen (PNG, JPG, GIF)"
                  )}
                </p>
              </div>
            </label>
            <input type="file" id="content-modal-image" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading || !form.project_id} className="ec-btn-primary" style={{ flex: 1, height: 44, fontSize: 14 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  {isEdit ? "Guardando..." : "Creando..."}
                </span>
              ) : (
                isEdit ? "Guardar Cambios" : "Crear Contenido"
              )}
            </button>
            <button type="button" onClick={onClose} className="ec-btn-secondary" style={{ flex: 1, height: 44, fontSize: 14 }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
