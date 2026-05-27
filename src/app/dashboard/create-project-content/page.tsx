"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "motion/react";

const TYPES = [
  "Business and Objectives",
  "MVP + IDEA",
  "Business strategy",
  "Growth Hacking strategy",
  "Apps",
];

type User = { id: number; userName: string };
type Project = { id: number; project_name: string; id_user: number };

const fadeUpCard = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] } },
};
const staggerCards = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function CreateProjectContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => toast.error("Error cargando usuarios"));

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => toast.error("Error cargando proyectos"));
  }, []);

  useEffect(() => {
    if (!form.project_id) return;
    const selected = projects.find((p) => p.id.toString() === form.project_id);
    if (selected) {
      setForm((prev) => ({ ...prev, id_user: selected.id_user.toString() }));
    }
  }, [form.project_id, projects]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects/content`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear el contenido");
      }

      const json = await res.json();
      toast.success(`Contenido creado correctamente. Imagen URL: ${json.imageUrl || "Ninguna"}`);

      setForm({
        project_id: "",
        content_1: "",
        content_2: "",
        content_3: "",
        link: "",
        href: "",
        id_user: "",
        type: TYPES[0],
      });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al crear el contenido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Page header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  NUEVO CONTENIDO</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)", marginBottom: 6 }}>
            Crear Contenido
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)" }}>
            Añade contenido multimedia y enlaces relevantes a un proyecto.
          </p>
        </div>

        <motion.form variants={staggerCards} initial="hidden" animate="visible" onSubmit={handleSubmit}>
          <motion.div variants={fadeUpCard} className="ec-project-card" style={{ padding: "24px 28px", borderRadius: 16, marginBottom: 16 }}>
            <div className="h-eyebrow" style={{ marginBottom: 16, fontSize: 10 }}>PROYECTO</div>

            {/* Project + Type row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label className="ec-field-label">Proyecto *</label>
                <select className="ec-field-input" name="project_id" value={form.project_id} onChange={handleChange} required>
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

            {form.id_user && (
              <div style={{ padding: "8px 12px", background: "rgba(189,21,92,0.06)", borderRadius: 8, border: "1px solid rgba(189,21,92,0.15)" }}>
                <span className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-brand)" }}>
                  Usuario asignado automáticamente desde el proyecto
                </span>
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUpCard} className="ec-project-card" style={{ padding: "24px 28px", borderRadius: 16, marginBottom: 16 }}>
            <div className="h-eyebrow" style={{ marginBottom: 16, fontSize: 10 }}>CONTENIDO</div>

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
          </motion.div>

          <motion.div variants={fadeUpCard} className="ec-project-card" style={{ padding: "24px 28px", borderRadius: 16, marginBottom: 16 }}>
            <div className="h-eyebrow" style={{ marginBottom: 16, fontSize: 10 }}>ENLACES</div>

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
          </motion.div>

          <motion.div variants={fadeUpCard} className="ec-project-card" style={{ padding: "24px 28px", borderRadius: 16, marginBottom: 24 }}>
            <div className="h-eyebrow" style={{ marginBottom: 16, fontSize: 10 }}>IMAGEN</div>

            <label htmlFor="image" style={{ display: "block", cursor: "pointer" }}>
              <div style={{
                border: "1.5px dashed var(--ec-border)", borderRadius: 10, padding: "24px 20px",
                textAlign: "center", transition: "border-color 150ms",
              }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--ec-text-muted)" style={{ margin: "0 auto 10px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
                  {imageFile ? (
                    <span style={{ color: "var(--ec-brand)", fontWeight: 600 }}>{imageFile.name}</span>
                  ) : (
                    "Seleccionar imagen (PNG, JPG, GIF)"
                  )}
                </p>
              </div>
            </label>
            <input type="file" id="image" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

            {previewUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={previewUrl} alt="Vista previa" style={{ marginTop: 12, maxWidth: 240, borderRadius: 8, border: "1px solid var(--ec-border)" }} />
            )}
          </motion.div>

          <motion.button
            variants={fadeUpCard}
            type="submit"
            disabled={loading || !form.project_id}
            className="ec-btn-primary"
            style={{ width: "100%", height: 46, fontSize: 15 }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                Creando contenido...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Contenido
              </>
            )}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
