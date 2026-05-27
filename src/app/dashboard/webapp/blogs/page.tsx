"use client";
import React, { useEffect, useState } from "react";
import { MessageCircle, CheckCircle, Clock, X, Check, Search, Mail, Users } from "lucide-react";

type Comment = {
  id: number;
  nombre: string;
  correo: string;
  comentario: string;
  estatus: string;
  fecha_creacion: string;
  blog_id: number;
};

type BlogName = {
  id: number;
  name: string;
};

const AVATAR_COLORS = ["#A78BFA","#60A5FA","#34D399","#FBBF24","#F87171","#F472B6","#818CF8","#2DD4BF"];

function BlogManagerPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [blogNames, setBlogNames] = useState<BlogName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedCommentText, setSelectedCommentText] = useState("");
  const [selectedBlogName, setSelectedBlogName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogRes, commentsRes] = await Promise.all([
          fetch("https://mongeortopedia.com/api/blogNames"),
          fetch("https://mongeortopedia.com/api/comments"),
        ]);
        if (!blogRes.ok || !commentsRes.ok) throw new Error("Error en alguna de las respuestas");
        setBlogNames(await blogRes.json());
        setComments(await commentsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBlogName = (id: number): string => blogNames.find((b) => b.id === id)?.name ?? String(id);

  const filtered = comments
    .filter((c) => filter === "all" || c.estatus === filter)
    .filter((c) => !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || c.comentario.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleApproveClick = (c: Comment) => { setSelectedComment(c); setModalAction("approve"); setShowModal(true); };
  const handleRejectClick = (c: Comment) => { setSelectedComment(c); setModalAction("reject"); setShowModal(true); };

  const handleConfirmAction = async () => {
    if (!selectedComment) return;
    try {
      const newStatus = modalAction === "approve" ? "aceptado" : "rechazado";
      await fetch(`https://mongeortopedia.com/api/comments/${selectedComment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: newStatus }),
      });
      setComments((prev) => prev.map((c) => c.id === selectedComment.id ? { ...c, estatus: newStatus } : c));
      setShowModal(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const total = comments.length;
  const approved = comments.filter((c) => c.estatus === "aceptado").length;
  const pending = comments.filter((c) => !["aceptado", "rechazado"].includes(c.estatus)).length;
  const rejected = comments.filter((c) => c.estatus === "rechazado").length;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--ec-brand)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p className="h-eyebrow">Cargando comentarios…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 24px" }} className="fade-in-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>⎯⎯⎯  BLOG MANAGER</div>
          <h1 className="font-serif" style={{ fontSize: 40, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 8 }}>Gestión de Comentarios</h1>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>Administra los comentarios del blog: aprueba, rechaza o consulta el contenido completo.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: MessageCircle, color: "#60A5FA", label: "Total", value: total },
          { icon: CheckCircle,   color: "#10B981", label: "Aprobados", value: approved },
          { icon: Clock,         color: "#FBBF24", label: "Pendientes", value: pending },
          { icon: X,             color: "#F87171", label: "Rechazados", value: rejected },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="ec-project-card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, borderRadius: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}1a`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={20} />
            </div>
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 2 }}>{label}</div>
              <div className="font-serif" style={{ fontSize: 28, lineHeight: 1, color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", background: "var(--ec-surface-1)", border: "1px solid var(--ec-border)", borderRadius: 10, padding: 3, gap: 2 }}>
          {[
            { id: "all", label: `Todos`, count: total },
            { id: "pendiente", label: "Pendientes", count: pending },
            { id: "aceptado", label: "Aprobados", count: approved },
            { id: "rechazado", label: "Rechazados", count: rejected },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); setCurrentPage(1); }}
              style={{
                padding: "6px 12px", borderRadius: 8, border: 0,
                background: filter === f.id ? "var(--ec-brand)" : "transparent",
                color: filter === f.id ? "white" : "var(--ec-text-dim)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {f.label} <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, opacity: 0.7, marginLeft: 4 }}>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)" }} />
          <input
            style={{ padding: "8px 12px 8px 30px", background: "var(--ec-surface-1)", border: "1px solid var(--ec-border)", borderRadius: 10, outline: "none", color: "var(--ec-text)", fontSize: 13, width: 260 }}
            placeholder="Buscar comentario o autor…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="ec-project-card" style={{ overflow: "hidden", borderRadius: 14 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--ec-border)" }}>
                {["Nombre", "Correo", "Comentario", "Estado", "Blog", "Acciones"].map((h, i) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: i === 5 ? "right" : "left", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-text-dim)", fontWeight: 400, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 16px", textAlign: "center", color: "var(--ec-text-dim)" }}>
                    <MessageCircle size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <p className="font-serif" style={{ fontSize: 20 }}>Sin comentarios</p>
                  </td>
                </tr>
              ) : pageItems.map((comment, i) => {
                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const isApproved = comment.estatus === "aceptado";
                const isRejected = comment.estatus === "rechazado";
                return (
                  <tr key={comment.id} style={{ borderBottom: "1px solid var(--ec-border)" }}>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${avatarColor}22`, color: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                          {comment.nombre[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{comment.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, padding: "4px 8px", background: "var(--ec-surface-2)", borderRadius: 6, border: "1px solid var(--ec-border)", color: "var(--ec-text-dim)" }}>
                        {comment.correo}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", maxWidth: 240 }}>
                      <div style={{ fontSize: 13, color: "var(--ec-text-dim)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {comment.comentario}
                      </div>
                      <button
                        onClick={() => { setSelectedCommentText(comment.comentario); setSelectedBlogName(getBlogName(comment.blog_id)); setShowCommentModal(true); }}
                        style={{ color: "var(--ec-brand)", fontSize: 11.5, marginTop: 2, background: "none", border: 0, padding: 0, cursor: "pointer" }}
                      >
                        Ver completo
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      {isApproved ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: 11.5, fontWeight: 500 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} /> aprobado
                        </span>
                      ) : isRejected ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: "rgba(248,113,113,0.12)", color: "#F87171", fontSize: 11.5, fontWeight: 500 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F87171" }} /> rechazado
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, background: "rgba(251,191,36,0.12)", color: "#FBBF24", fontSize: 11.5, fontWeight: 500 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FBBF24" }} /> pendiente
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "var(--ec-text-dim)", whiteSpace: "nowrap" }}>
                      {getBlogName(comment.blog_id).slice(0, 20)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", gap: 4 }}>
                        {!isApproved && (
                          <button onClick={() => handleApproveClick(comment)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "rgba(16,185,129,0.12)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, fontSize: 11.5, cursor: "pointer" }}>
                            <Check size={12} /> Aceptar
                          </button>
                        )}
                        {!isRejected && (
                          <button onClick={() => handleRejectClick(comment)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: "rgba(248,113,113,0.12)", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontSize: 11.5, cursor: "pointer" }}>
                            <X size={12} /> Rechazar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--ec-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, color: "var(--ec-text-dim)" }}>
              {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "1px solid var(--ec-border)",
                    background: currentPage === i + 1 ? "var(--ec-brand)" : "var(--ec-surface-1)",
                    color: currentPage === i + 1 ? "white" : "var(--ec-text-dim)",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={() => setShowModal(false)}>
          <div className="ec-project-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, width: "100%", padding: 28, borderRadius: 18 }}>
            <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 400, marginBottom: 8 }}>
              Confirmar {modalAction === "approve" ? "Aprobación" : "Rechazo"}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--ec-text-dim)", lineHeight: 1.6, marginBottom: 24 }}>
              ¿Deseas {modalAction === "approve" ? "aprobar" : "rechazar"} este comentario? Esta acción se puede revertir más tarde.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 18px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, color: "var(--ec-text)", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleConfirmAction} style={{ padding: "10px 18px", background: modalAction === "approve" ? "#10B981" : "#F87171", border: 0, borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {modalAction === "approve" ? "Aprobar" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Detail Modal */}
      {showCommentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={() => setShowCommentModal(false)}>
          <div className="ec-project-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, width: "100%", padding: 0, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--ec-border)", display: "flex", alignItems: "center", gap: 12 }}>
              <MessageCircle size={18} style={{ color: "var(--ec-brand)" }} />
              <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400 }}>Comentario Completo</h3>
              <button onClick={() => setShowCommentModal(false)} style={{ marginLeft: "auto", background: "none", border: 0, color: "var(--ec-text-dim)", cursor: "pointer", padding: 4 }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ padding: 16, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 12, fontSize: 14, lineHeight: 1.6, color: "var(--ec-text)", marginBottom: 14 }}>
                &ldquo;{selectedCommentText}&rdquo;
              </div>
              <div className="h-eyebrow" style={{ marginBottom: 4 }}>BLOG</div>
              <p style={{ fontSize: 13, color: "var(--ec-text)" }}>{selectedBlogName}</p>
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--ec-border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCommentModal(false)} style={{ padding: "10px 24px", background: "var(--ec-brand)", border: 0, borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogManagerPage;
