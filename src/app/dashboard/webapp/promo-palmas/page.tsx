"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Tag, Plus, Trash2, Copy, Check, RefreshCw, Calendar, Hash, Percent, DollarSign, Users, Eye, EyeOff, Loader2, Shuffle } from "lucide-react";

const API_BASE_URL = "https://palmasrecovery.com";
const PALMAS_COLOR = "#10B981";

interface PromoCode {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

const INITIAL_FORM = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10,
  expires_at: "",
  usage_limit: "",
};

export default function PromoPalmasPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar los códigos de promoción");
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((p) => ({ ...p, code: `PALMAS${suffix}` }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          expires_at: form.expires_at || null,
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Código creado exitosamente");
      setForm(INITIAL_FORM); setShowForm(false); fetchCodes();
    } catch {
      toast.error("Error al crear el código");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Código eliminado");
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Error al eliminar el código");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      if (!res.ok) throw new Error();
      setCodes((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c));
    } catch {
      toast.error("Error al actualizar el código");
    }
  };

  const copyCode = async (id: number, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const total = codes.length;
  const active = codes.filter((c) => c.is_active).length;
  const totalUses = codes.reduce((sum, c) => sum + (c.usage_count ?? 0), 0);

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "var(--ec-surface-2)",
    border: "1px solid var(--ec-border)",
    borderRadius: 10,
    outline: "none",
    color: "var(--ec-text)",
    fontSize: 14,
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "28px 24px" }} className="fade-in-up">
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${PALMAS_COLOR}1a`, color: PALMAS_COLOR, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tag size={18} />
            </div>
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 2 }}>⎯⎯⎯  PALMAS RECOVERY</div>
              <h1 className="font-serif" style={{ fontSize: 38, lineHeight: 1, letterSpacing: "-0.025em" }}>Promo Palmas</h1>
            </div>
          </div>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>Gestiona los códigos de promoción para el frontend de Palmas Recovery.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fetchCodes} title="Refrescar" style={{ padding: "9px 12px", background: "var(--ec-surface-1)", border: "1px solid var(--ec-border)", borderRadius: 10, color: "var(--ec-text-dim)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setShowForm((s) => !s)} style={{ padding: "9px 16px", background: PALMAS_COLOR, border: 0, borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> Nuevo código
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { icon: Hash,  color: "#60A5FA", label: "Total",        value: total },
          { icon: Check, color: PALMAS_COLOR, label: "Activos",   value: active },
          { icon: Users, color: "#A78BFA", label: "Usos totales", value: totalUses },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="ec-project-card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, borderRadius: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}1a`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 2 }}>{label}</div>
              <div className="font-serif" style={{ fontSize: 26, lineHeight: 1, color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="ec-project-card" style={{ padding: 24, marginBottom: 20, borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Plus size={16} style={{ color: PALMAS_COLOR }} />
            <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400 }}>Crear nuevo código</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Código</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text" value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="ej. PALMAS20" required
                  style={{ ...inputStyle, flex: 1, fontFamily: "var(--font-jetbrains-mono), monospace" }}
                />
                <button type="button" onClick={generateCode} title="Generar código aleatorio" style={{ padding: "0 12px", background: "var(--ec-surface-1)", border: "1px solid var(--ec-border)", borderRadius: 10, color: "var(--ec-text-dim)", cursor: "pointer" }}>
                  <Shuffle size={14} />
                </button>
              </div>
            </div>
            <div>
              <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Tipo de descuento</label>
              <select value={form.discount_type} onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value as "percentage" | "fixed" }))}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>
                {form.discount_type === "percentage" ? "Porcentaje" : "Monto"}
              </label>
              <div style={{ display: "flex", alignItems: "center", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, overflow: "hidden" }}>
                <span style={{ padding: "0 10px", color: "var(--ec-text-dim)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {form.discount_type === "percentage" ? <Percent size={13} /> : <DollarSign size={13} />}
                </span>
                <input type="number" min="1" max={form.discount_type === "percentage" ? "100" : undefined}
                  value={form.discount_value} onChange={(e) => setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))} required
                  style={{ flex: 1, padding: "11px 12px 11px 4px", background: "transparent", border: 0, outline: "none", color: "var(--ec-text)", fontSize: 14 }}
                />
              </div>
            </div>
            <div>
              <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Fecha de expiración <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--ec-text-dim)", fontSize: 10 }}>(opcional)</span></label>
              <div style={{ display: "flex", alignItems: "center", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, overflow: "hidden" }}>
                <span style={{ padding: "0 10px", color: "var(--ec-text-dim)", display: "flex", alignItems: "center", flexShrink: 0 }}><Calendar size={13} /></span>
                <input type="date" value={form.expires_at} onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                  style={{ flex: 1, padding: "11px 12px 11px 4px", background: "transparent", border: 0, outline: "none", color: "var(--ec-text)", fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Límite de usos <span style={{ textTransform: "none", letterSpacing: 0, color: "var(--ec-text-dim)", fontSize: 10 }}>(opcional — vacío = ilimitado)</span></label>
              <div style={{ display: "flex", alignItems: "center", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, overflow: "hidden" }}>
                <span style={{ padding: "0 10px", color: "var(--ec-text-dim)", display: "flex", alignItems: "center", flexShrink: 0 }}><Users size={13} /></span>
                <input type="number" min="1" value={form.usage_limit} onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))} placeholder="ej. 100"
                  style={{ flex: 1, padding: "11px 12px 11px 4px", background: "transparent", border: 0, outline: "none", color: "var(--ec-text)", fontSize: 14 }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => { setShowForm(false); setForm(INITIAL_FORM); }}
              style={{ padding: "10px 18px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, color: "var(--ec-text)", fontSize: 13, cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: "10px 18px", background: PALMAS_COLOR, border: 0, borderRadius: 10, color: "white", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Plus size={13} />}
              {saving ? "Guardando…" : "Crear código"}
            </button>
          </div>
        </form>
      )}

      {/* Codes list */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${PALMAS_COLOR}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ec-surface-2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tag size={28} style={{ color: "var(--ec-text-dim)" }} />
          </div>
          <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Sin códigos todavía</h3>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 13 }}>Crea tu primer código de promoción con el botón de arriba.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {codes.map((code) => {
            const isExpired = code.expires_at ? new Date(code.expires_at) < new Date() : false;
            const isExhausted = code.usage_limit !== null && code.usage_count >= code.usage_limit;

            return (
              <div key={code.id} className="ec-project-card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 18, borderRadius: 12, flexWrap: "wrap" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: code.is_active ? `${PALMAS_COLOR}1a` : "var(--ec-surface-2)", color: code.is_active ? PALMAS_COLOR : "var(--ec-text-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Tag size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <code style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 16, fontWeight: 500, color: code.is_active ? PALMAS_COLOR : "var(--ec-text-dim)" }}>{code.code}</code>
                    {code.is_active && !isExpired && !isExhausted && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 100, background: `${PALMAS_COLOR}1a`, color: PALMAS_COLOR, fontSize: 11 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: PALMAS_COLOR }} /> activo
                      </span>
                    )}
                    {isExpired && <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(248,113,113,0.12)", color: "#F87171", fontSize: 11 }}>Expirado</span>}
                    {isExhausted && <span style={{ padding: "2px 8px", borderRadius: 100, background: "rgba(251,191,36,0.12)", color: "#FBBF24", fontSize: 11 }}>Agotado</span>}
                    {!code.is_active && <span style={{ padding: "2px 8px", borderRadius: 100, background: "var(--ec-surface-2)", color: "var(--ec-text-dim)", fontSize: 11 }}>Inactivo</span>}
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--ec-text-dim)", flexWrap: "wrap" }}>
                    <span>{code.discount_type === "percentage" ? `${code.discount_value}% descuento` : `$${code.discount_value} fijo`}</span>
                    <span style={{ color: "var(--ec-border)" }}>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={11} />{code.usage_count ?? 0}{code.usage_limit !== null ? ` / ${code.usage_limit}` : ""} usos</span>
                    {code.expires_at && (
                      <><span style={{ color: "var(--ec-border)" }}>·</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{new Date(code.expires_at).toLocaleDateString("es-MX")}</span></>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => copyCode(code.id, code.code)} title="Copiar"
                    style={{ width: 34, height: 34, borderRadius: 8, background: "none", border: "1px solid var(--ec-border)", color: "var(--ec-text-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {copiedId === code.id ? <Check size={14} style={{ color: PALMAS_COLOR }} /> : <Copy size={14} />}
                  </button>
                  <button onClick={() => handleToggle(code.id, code.is_active)} title={code.is_active ? "Desactivar" : "Activar"}
                    style={{ width: 34, height: 34, borderRadius: 8, background: "none", border: "1px solid var(--ec-border)", color: code.is_active ? PALMAS_COLOR : "var(--ec-text-dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {code.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleDelete(code.id)} disabled={deletingId === code.id} title="Eliminar"
                    style={{ width: 34, height: 34, borderRadius: 8, background: "none", border: "1px solid rgba(248,113,113,0.3)", color: "#F87171", cursor: deletingId === code.id ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: deletingId === code.id ? 0.5 : 1 }}>
                    {deletingId === code.id ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
