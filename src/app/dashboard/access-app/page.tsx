"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Users,
  QrCode,
  CreditCard,
  Calendar,
  FileText,
  Save,
  Loader2,
  Settings,
  Tag,
} from "lucide-react";
import { motion } from "motion/react";

type User = {
  id: number;
  email: string;
  role: string;
  userName: string;
};

type ComponentAccess = {
  component:
    | "QR"
    | "Vcard"
    | "blogs"
    | "calendar"
    | "Reforma"
    | "Monge"
    | "PromoPalmas"
    | "CalendarioPalmas";
  can_view: boolean;
};

const AVAILABLE_COMPONENTS: ComponentAccess["component"][] = [
  "QR",
  "Vcard",
  "blogs",
  "calendar",
  "Reforma",
  "Monge",
  "PromoPalmas",
  "CalendarioPalmas",
];

const COMPONENT_CONFIG = {
  QR: { icon: QrCode, name: "Códigos QR" },
  Vcard: { icon: CreditCard, name: "Tarjetas de Visita" },
  blogs: { icon: FileText, name: "Blogs" },
  calendar: { icon: Calendar, name: "Calendario" },
  Reforma: { icon: Calendar, name: "Cal. Reforma" },
  Monge: { icon: Calendar, name: "Cal. Monge" },
  PromoPalmas: { icon: Tag, name: "Promo Palmas" },
  CalendarioPalmas: { icon: Calendar, name: "Cal. Palmas" },
};

const fadeUpCard = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] } },
};
const staggerCards = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] } },
};

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [permissions, setPermissions] = useState<Record<number, ComponentAccess[]>>({});
  const [savingUsers, setSavingUsers] = useState<Set<number>>(new Set());

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      const clients = data.filter((user: User) => user.role === "client");
      setUsers(clients);
      clients.forEach((user: User) => { fetchPermissions(user.id); });
    } catch {
      toast.error("Error al obtener usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPermissions = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/${userId}/apps`);
      if (!res.ok) throw new Error("Error al obtener permisos");
      const data = await res.json();
      const completePermissions = AVAILABLE_COMPONENTS.map((component) => {
        const existingPerm = data.find((perm: ComponentAccess) => perm.component === component);
        return existingPerm || { component, can_view: false };
      });
      setPermissions((prev) => ({ ...prev, [userId]: completePermissions }));
    } catch {
      const defaultPermissions = AVAILABLE_COMPONENTS.map((component) => ({ component, can_view: false }));
      setPermissions((prev) => ({ ...prev, [userId]: defaultPermissions }));
    }
  };

  const handleToggle = (userId: number, component: string) => {
    setPermissions((prev) => {
      const userPermissions = prev[userId] || [];
      const existingPermIndex = userPermissions.findIndex((perm) => perm.component === component);
      let updated;
      if (existingPermIndex >= 0) {
        updated = userPermissions.map((perm, index) =>
          index === existingPermIndex ? { ...perm, can_view: !perm.can_view } : perm
        );
      } else {
        updated = [...userPermissions, { component: component as ComponentAccess["component"], can_view: true }];
      }
      return { ...prev, [userId]: updated };
    });
  };

  const savePermissions = async (userId: number) => {
    setSavingUsers((prev) => new Set([...prev, userId]));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users/${userId}/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions[userId]),
      });
      if (!res.ok) throw new Error("Error al guardar permisos");
      toast.success("Permisos actualizados");
    } catch {
      toast.error("Error al guardar permisos");
    } finally {
      setSavingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (loadingUsers) {
    return (
      <div className="fade-in-up" style={{ padding: "28px 24px", display: "flex", alignItems: "center", gap: 10, color: "var(--ec-text-muted)" }}>
        <Loader2 className="animate-spin" size={16} style={{ color: "var(--ec-brand)" }} />
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  PERMISOS DE ACCESO</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)" }}>
            Gestión de Permisos
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)", marginTop: 6 }}>
            Controla el acceso de cada cliente a las aplicaciones del sistema.
          </p>
        </div>
      </div>

      {/* User permission cards */}
      <motion.div variants={staggerCards} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {users.map((user) => {
            const userPerms = permissions[user.id] || [];
            const isSaving = savingUsers.has(user.id);
            const activeCount = userPerms.filter((p) => p.can_view).length;

            return (
              <motion.div key={user.id} variants={fadeUpCard} className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden" }}>
                {/* User header */}
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ec-hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="ec-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ec-text)" }}>{user.userName}</div>
                      <div style={{ fontSize: 12, color: "var(--ec-text-muted)" }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ textAlign: "right" }}>
                      <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-muted)" }}>PERMISOS</div>
                      <div className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--ec-text)" }}>
                        {activeCount}
                        <span style={{ fontSize: 12, color: "var(--ec-text-muted)" }}>/{AVAILABLE_COMPONENTS.length}</span>
                      </div>
                    </div>
                    <button
                      style={{ width: 34, height: 34, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "var(--ec-brand)", color: "#fff", cursor: "pointer", transition: "opacity 150ms" }}
                      onClick={() => savePermissions(user.id)}
                      disabled={isSaving}
                      title="Guardar permisos"
                    >
                      {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    </button>
                  </div>
                </div>

                {/* App grid */}
                <div style={{ padding: "16px 20px" }}>
                  <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                    {AVAILABLE_COMPONENTS.map((component) => {
                      const perm = userPerms.find((p) => p.component === component);
                      const isChecked = perm?.can_view ?? false;
                      const config = COMPONENT_CONFIG[component] || { icon: Settings, name: component };
                      const IconComp = config.icon;

                      return (
                        <motion.div
                          key={component}
                          variants={fadeUpItem}
                          onClick={() => handleToggle(user.id, component)}
                          style={{
                            padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                            border: isChecked ? "1.5px solid var(--ec-brand)" : "1px solid var(--ec-border)",
                            background: isChecked ? "rgba(189,21,92,0.06)" : "var(--ec-surface-2)",
                            transition: "all 150ms",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                              background: isChecked ? "rgba(189,21,92,0.15)" : "var(--ec-surface-3)",
                            }}>
                              <IconComp size={14} style={{ color: isChecked ? "var(--ec-brand)" : "var(--ec-text-muted)" }} />
                            </div>
                            <div style={{
                              width: 16, height: 16, borderRadius: 4, border: isChecked ? "1.5px solid var(--ec-brand)" : "1.5px solid var(--ec-border)",
                              background: isChecked ? "var(--ec-brand)" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 150ms",
                            }}>
                              {isChecked && (
                                <svg width="9" height="9" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isChecked ? "var(--ec-brand)" : "var(--ec-text)", lineHeight: 1.2 }}>
                            {config.name}
                          </div>
                          <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-muted)", marginTop: 3 }}>
                            {isChecked ? "Activo" : "Inactivo"}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {users.length === 0 && !loadingUsers && (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--ec-text-muted)" }}>
            <Users size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No hay usuarios con rol de cliente.</p>
          </div>
        )}
    </div>
  );
}

export default Page;
