"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Loader2, Search, RefreshCw, CheckCircle, XCircle, Clock, Mail, User, Store, Globe, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE_URL = "https://www.scaneat.mx";
const BRAND = "#059669";
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  approved:  { label: "Aprobado",   color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  rejected:  { label: "Rechazado",  color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  completed: { label: "Completado", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  failed:    { label: "Fallido",    color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

interface DemoRequest {
  id: number;
  name: string;
  email: string;
  restaurant: string;
  message: string;
  locale: string;
  token: string;
  status: "pending" | "approved" | "rejected" | "completed" | "failed";
  created_at: string;
}

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

export default function ScanEatPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`${API_BASE_URL}/api/demo/requests?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar solicitudes");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/demo/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Solicitud ${STATUS_STYLES[status]?.label.toLowerCase() ?? status}`);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: status as DemoRequest["status"] } : r));
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q)
      || r.email.toLowerCase().includes(q)
      || r.restaurant.toLowerCase().includes(q)
      || (r.message && r.message.toLowerCase().includes(q));
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const statCards = [
    { icon: Mail,      color: "#6B7280", label: "Total",       value: stats.total },
    { icon: Clock,     color: "#F59E0B", label: "Pendientes",  value: stats.pending },
    { icon: CheckCircle, color: "#10B981", label: "Aprobados", value: stats.approved },
    { icon: XCircle,   color: "#EF4444", label: "Rechazados",  value: stats.rejected },
  ];

  const statusOptions = [
    { value: "all",      label: "Todos" },
    { value: "pending",  label: "Pendientes" },
    { value: "approved", label: "Aprobados" },
    { value: "rejected", label: "Rechazados" },
    { value: "completed", label: "Completados" },
    { value: "failed",   label: "Fallidos" },
  ];

  return (
    <div style={{ padding: "28px 24px" }} className="fade-in-up">
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${BRAND}1a`, color: BRAND, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="1" />
              </svg>
            </div>
            <div>
              <div className="h-eyebrow" style={{ marginBottom: 2 }}>⎯⎯⎯  SCANEAT</div>
              <h1 className="font-serif" style={{ fontSize: 38, lineHeight: 1, letterSpacing: "-0.025em" }}>Solicitudes de Demo</h1>
            </div>
          </div>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>Gestiona las solicitudes de demostración recibidas desde scaneat.mx.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fetchRequests} title="Refrescar" style={{ padding: "9px 12px", background: "var(--ec-surface-1)", border: "1px solid var(--ec-border)", borderRadius: 10, color: "var(--ec-text-dim)", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {statCards.map(({ icon: Icon, color, label, value }) => (
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

      {/* Filters */}
      <div className="ec-project-card" style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, restaurante..."
            style={{ ...inputStyle, paddingLeft: 34, flex: 1 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
                background: statusFilter === opt.value ? BRAND : "var(--ec-surface-2)",
                border: statusFilter === opt.value ? "none" : "1px solid var(--ec-border)",
                color: statusFilter === opt.value ? "#fff" : "var(--ec-text-dim)",
                transition: "all 150ms",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BRAND}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ec-surface-2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={28} style={{ color: "var(--ec-text-dim)" }} />
          </div>
          <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, marginBottom: 6 }}>
            {search || statusFilter !== "all" ? "Sin resultados" : "Sin solicitudes todavía"}
          </h3>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 13 }}>
            {search || statusFilter !== "all" ? "Intenta con otros filtros." : "No hay solicitudes de demo registradas."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((req) => {
            const st = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
            const isExpanded = expandedId === req.id;

            return (
              <div key={req.id} className="ec-project-card" style={{ borderRadius: 12, overflow: "hidden" }}>
                {/* Main row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flexWrap: "wrap" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${st.color}1a`, color: st.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ec-text)" }}>{req.name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 100, background: st.bg, color: st.color, fontSize: 11, fontWeight: 500 }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--ec-text-dim)", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Store size={11} />{req.restaurant}
                      </span>
                      <span style={{ color: "var(--ec-border)" }}>·</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={11} />{req.email}
                      </span>
                      <span style={{ color: "var(--ec-border)" }}>·</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <CalendarDays size={11} />{new Date(req.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Globe size={11} />{req.locale === "en" ? "EN" : "ES"}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(req.id, "approved"); }}
                          disabled={updatingId === req.id}
                          title="Aprobar"
                          style={{ width: 34, height: 34, borderRadius: 8, background: "none", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {updatingId === req.id ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <CheckCircle size={15} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(req.id, "rejected"); }}
                          disabled={updatingId === req.id}
                          title="Rechazar"
                          style={{ width: 34, height: 34, borderRadius: 8, background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {updatingId === req.id ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <XCircle size={15} />}
                        </button>
                      </>
                    )}
                    <div style={{ color: "var(--ec-text-dim)" }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--ec-hairline)" }}>
                    <div style={{ paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>NOMBRE</div>
                        <div style={{ fontSize: 14, color: "var(--ec-text)" }}>{req.name}</div>
                      </div>
                      <div>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>EMAIL</div>
                        <a href={`mailto:${req.email}`} style={{ fontSize: 14, color: BRAND, textDecoration: "none" }}>{req.email}</a>
                      </div>
                      <div>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>RESTAURANTE</div>
                        <div style={{ fontSize: 14 }}>{req.restaurant}</div>
                      </div>
                      <div>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>IDIOMA</div>
                        <div style={{ fontSize: 14 }}>{req.locale === "en" ? "Inglés" : "Español"}</div>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>MENSAJE</div>
                        <div style={{ fontSize: 14, background: "var(--ec-surface-2)", padding: 12, borderRadius: 8, lineHeight: 1.5 }}>{req.message || "Sin mensaje"}</div>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>TOKEN</div>
                        <code style={{ fontSize: 11, color: "var(--ec-text-dim)", wordBreak: "break-all" }}>{req.token}</code>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="h-eyebrow" style={{ marginBottom: 4, fontSize: 10 }}>CREADO</div>
                        <div style={{ fontSize: 14 }}>{new Date(req.created_at).toLocaleString("es-MX")}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--ec-hairline)" }}>
                      {req.status !== "pending" && (
                        <button
                          onClick={() => handleStatusChange(req.id, "pending")}
                          disabled={updatingId === req.id}
                          style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", display: "flex", alignItems: "center", gap: 5 }}
                        >
                          {updatingId === req.id ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Clock size={12} />}
                          Reabrir
                        </button>
                      )}
                      {req.status !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(req.id, "completed")}
                          disabled={updatingId === req.id}
                          style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", display: "flex", alignItems: "center", gap: 5 }}
                        >
                          <CheckCircle size={12} />
                          Completado
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
