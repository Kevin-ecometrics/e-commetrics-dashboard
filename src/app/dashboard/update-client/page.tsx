"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Search, AlertCircle, Trash2, Edit, Check, Shield, Users, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

type User = {
  id: number;
  email: string;
  role: string;
  userName: string;
};

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", role: "client" });
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Error al obtener usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setForm({ email: user.email, role: user.role });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) { toast.error("Selecciona un usuario primero"); return; }
    if (!form.email) { toast.error("El email es obligatorio"); return; }

    try {
      setLoadingUpdate(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al actualizar usuario");
      }
      toast.success("Usuario actualizado correctamente");
      setSelectedUser(null);
      setForm({ email: "", role: "client" });
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar usuario");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al eliminar usuario");
      }
      toast.success("Usuario eliminado");
      if (selectedUser?.id === id) { setSelectedUser(null); setForm({ email: "", role: "client" }); }
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.userName.toLowerCase().includes(q));
  }, [users, search]);

  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  GESTIÓN DE USUARIOS</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)", marginBottom: 6 }}>
            Usuarios
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)" }}>
            Administra cuentas, roles y accesos.
          </p>
        </div>
        <Link href="/dashboard/create-client" className="ec-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "10px 18px", fontSize: 13 }}>
          <UserPlus size={15} /> Crear Usuario
        </Link>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Users table card */}
        <div className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden", padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ec-hairline)", display: "flex", alignItems: "center", gap: 12 }}>
            <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>
              Usuarios{" "}
              <span className="font-mono-ec" style={{ fontSize: 12, color: "var(--ec-text-dim)", marginLeft: 6 }}>
                {filtered.length}
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
            {loadingUsers && (
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--ec-hairline)", borderTopColor: "var(--ec-brand)", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
            )}
          </div>

          {!loadingUsers && filtered.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--ec-text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
              <p style={{ fontSize: 14 }}>
                {search ? "Sin resultados para esa búsqueda" : "No hay usuarios registrados"}
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: 560, overflowY: "auto" }}>
              <table className="ec-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th style={{ width: 100, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => {
                    const active = selectedUser?.id === user.id;
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                        className={active ? "ec-table-selected" : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectUser(user)}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="ec-avatar">{user.userName.charAt(0).toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 500 }}>{user.userName}</div>
                              <div className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-dim)" }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {user.role === "admin" ? (
                            <span className="ec-badge ec-badge-brand"><Shield size={10} /> Admin</span>
                          ) : (
                            <span className="ec-badge" style={{ background: "var(--ec-surface-2)", color: "var(--ec-text-muted)", border: "1px solid var(--ec-hairline)" }}>
                              <Users size={10} /> Cliente
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            style={{ width: 30, height: 30, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "var(--ec-brand)", color: "#fff", cursor: "pointer", transition: "opacity 150ms" }}
                            onClick={(e) => { e.stopPropagation(); handleSelectUser(user); }}
                            title="Editar"
                          >
                            <Edit size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer stat */}
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--ec-hairline)", display: "flex", gap: 16 }}>
            <span className="font-mono-ec" style={{ fontSize: 10.5, color: "var(--ec-text-dim)" }}>
              TOTAL <span style={{ color: "var(--ec-text)" }}>{users.length}</span>
            </span>
            <span className="font-mono-ec" style={{ fontSize: 10.5, color: "var(--ec-text-dim)" }}>
              ADMIN <span style={{ color: "var(--ec-brand)" }}>{admins}</span>
            </span>
            <span className="font-mono-ec" style={{ fontSize: 10.5, color: "var(--ec-text-dim)" }}>
              CLIENTES <span style={{ color: "var(--ec-text)" }}>{users.length - admins}</span>
            </span>
          </div>
        </div>

        {/* Edit panel — sticky */}
        <div className="ec-project-card" style={{ padding: selectedUser ? 24 : 0, borderRadius: 14, position: "sticky", top: 16, minHeight: 200 }}>
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div className="ec-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {selectedUser.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="h-eyebrow" style={{ marginBottom: 2 }}>Editando usuario</div>
                  <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)" }}>
                    {selectedUser.userName}
                  </h3>
                </div>
              </div>

              <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Correo Electrónico</label>
                  <input
                    className="ec-field-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Rol del Usuario</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(["client", "admin"] as const).map((r) => {
                      const active = form.role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, role: r }))}
                          style={{
                            padding: "10px 12px",
                            background: active ? "var(--ec-brand-soft)" : "var(--ec-surface-1)",
                            border: `1px solid ${active ? "var(--ec-brand)" : "var(--ec-hairline)"}`,
                            borderRadius: 10,
                            fontSize: 13, fontWeight: 500,
                            color: active ? "var(--ec-brand)" : "var(--ec-text-muted)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            cursor: "pointer",
                            transition: "all 150ms",
                          }}
                        >
                          {r === "admin" ? <Shield size={13} /> : <Users size={13} />}
                          {r === "admin" ? "Admin" : "Cliente"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>
                    Nueva contraseña{" "}
                    <span style={{ color: "var(--ec-text-dim)", textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(opcional)</span>
                  </label>
                  <input className="ec-field-input" type="password" placeholder="Dejar vacío para no cambiar" />
                </div>

                <div style={{ height: 1, background: "var(--ec-hairline)", margin: "4px 0" }} />

                <button type="submit" className="ec-btn-primary" disabled={loadingUpdate} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {loadingUpdate ? (
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                  ) : (
                    <><Check size={14} /> Actualizar</>
                  )}
                </button>
                <button type="button" className="ec-btn-danger" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13 }} onClick={() => setDeleteConfirm(selectedUser)}>
                  <Trash2 size={13} /> Eliminar usuario
                </button>
              </form>
            </motion.div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--ec-text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>👤</div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ec-text)", marginBottom: 4 }}>
                {"Ningún usuario seleccionado"}
              </p>
              <p style={{ fontSize: 12 }}>
                {"Haz clic en un usuario de la lista para editarlo"}
              </p>
            </div>
          )}
        </div>
      </div>

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
                ¿Eliminar usuario?
              </h3>
              <p style={{ color: "var(--ec-text-muted)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 6 }}>
                Esta acción eliminará a{" "}
                <strong style={{ color: "var(--ec-text)" }}>{deleteConfirm.userName}</strong>{" "}
                de forma permanente, junto con sus permisos y asignaciones.
              </p>
              <span className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-dim)", background: "var(--ec-surface-2)", padding: "3px 10px", borderRadius: 6 }}>
                {deleteConfirm.email}
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
