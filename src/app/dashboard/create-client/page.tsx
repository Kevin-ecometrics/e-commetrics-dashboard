"use client";

import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, CheckCircle, Shield, Users, UserPlus } from "lucide-react";
import { motion } from "motion/react";

const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const fadeUpItem = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] } } };

function CreateClient() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.confirmPassword) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const generatedUserName = form.email.split("@")[0];

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          userName: generatedUserName,
          password: form.password,
          role: form.role,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear el usuario");
      }

      toast.success("Usuario creado correctamente");
      setForm({ email: "", password: "", confirmPassword: "", role: "client" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  // 4-segment strength bars matching the design
  const pw = form.password;
  const pwStrengthColor = pw.length >= 8 ? "var(--ec-success)" : pw.length >= 6 ? "var(--ec-warning)" : "var(--ec-danger)";

  const isValid = form.email && form.password.length >= 6 && form.password === form.confirmPassword;

  return (
    <div className="circuit-bg fade-in-up" style={{ padding: "32px 24px", minHeight: "100%" }}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
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
            <UserPlus size={28} />
          </div>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>⎯⎯⎯  NUEVO USUARIO</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)", marginBottom: 10 }}>
            Crear Usuario
          </h1>
          <p style={{ fontSize: 14, color: "var(--ec-text-muted)", maxWidth: 400, margin: "0 auto" }}>
            Registra un nuevo usuario en el sistema con los permisos correspondientes.
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
          <div style={{ marginBottom: 22 }}>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em", color: "var(--ec-text)" }}>
              Información del Usuario
            </h2>
            <p style={{ color: "var(--ec-text-muted)", fontSize: 13, marginTop: 4 }}>
              Completa todos los campos para crear una nueva cuenta.
            </p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <motion.div variants={fadeUpItem}>
            {/* Email */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Mail size={11} /> Correo Electrónico <span style={{ color: "var(--ec-danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", display: "flex", pointerEvents: "none" }}>
                  <Mail size={14} />
                </span>
                <input
                  className="ec-field-input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="usuario@ejemplo.com"
                  style={{ paddingLeft: 36 }}
                />
              </div>
              {form.email && (
                <p className="font-mono-ec" style={{ fontSize: 11, color: "var(--ec-text-muted)", marginTop: 5 }}>
                  username → <span style={{ color: "var(--ec-brand)" }}>{form.email.split("@")[0]}</span>
                </p>
              )}
            </div>
            </motion.div>

            <motion.div variants={fadeUpItem}>
            {/* Passwords side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Lock size={11} /> Contraseña <span style={{ color: "var(--ec-danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="ec-field-input"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <CheckCircle size={11} /> Confirmar <span style={{ color: "var(--ec-danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="ec-field-input"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder="Repite la contraseña"
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
            </motion.div>

            <motion.div variants={fadeUpItem}>
            {/* 4-segment password strength */}
            {pw && (
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: pw.length >= n * 2
                      ? pwStrengthColor
                      : "var(--ec-surface-3)",
                    transition: "background 200ms",
                  }} />
                ))}
              </div>
            )}
            </motion.div>

            <motion.div variants={fadeUpItem}>
            {/* Match indicator */}
            {form.confirmPassword && (
              <p className="font-mono-ec" style={{ fontSize: 11, color: form.password === form.confirmPassword ? "var(--ec-success)" : "var(--ec-danger)", marginTop: -8 }}>
                {form.password === form.confirmPassword ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
              </p>
            )}
            </motion.div>

            <motion.div variants={fadeUpItem}>
            {/* Role selector */}
            <div>
              <label className="ec-field-label" style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                <Shield size={11} /> Rol del Usuario <span style={{ color: "var(--ec-danger)" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {([
                  { v: "client", Icon: Users, name: "Cliente", desc: "Acceso limitado a sus proyectos" },
                  { v: "admin",  Icon: Shield, name: "Administrador", desc: "Acceso completo al sistema" },
                ] as const).map(({ v, Icon, name, desc }) => {
                  const active = form.role === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: v }))}
                      style={{
                        padding: 16,
                        background: active ? "var(--ec-brand-soft)" : "var(--ec-surface-1)",
                        border: `1px solid ${active ? "var(--ec-brand)" : "var(--ec-hairline)"}`,
                        boxShadow: active ? "0 0 0 4px var(--ec-brand-softer)" : "none",
                        borderRadius: 12,
                        display: "flex", alignItems: "flex-start", gap: 12,
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "all 180ms",
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: active ? "var(--ec-brand)" : "var(--ec-surface-3)",
                        color: active ? "white" : "var(--ec-text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 13, color: "var(--ec-text)" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "var(--ec-text-muted)", marginTop: 2 }}>{desc}</div>
                      </div>
                      {active && <CheckCircle size={15} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
            </motion.div>

            <motion.div variants={fadeUpItem}>
            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isValid}
                className="ec-btn-primary"
                style={{ flex: 1, height: 44, fontSize: 14 }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                    Creando usuario…
                  </>
                ) : (
                  <>
                    <UserPlus size={15} /> Crear Usuario
                  </>
                )}
              </button>
            </div>
            </motion.div>

            <motion.div variants={fadeUpItem}>
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--ec-text-muted)" }}>
              Los campos marcados con <span style={{ color: "var(--ec-danger)" }}>*</span> son obligatorios.
            </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateClient;
