/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useLang } from "@/app/context/LangContext";
import { Edit, Lock, Mail, User, AlertCircle, Check, Upload } from "lucide-react";

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lang } = useLang();

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confPw, setConfPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUserName(user.userName);
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match("image.*")) { toast.error("Selecciona una imagen válida"); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => { if (event.target?.result) setProfileImage(event.target.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("profileImage", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/upload-profile-image`, {
      method: "POST", credentials: "include", body: formData,
    });
    if (!res.ok) throw new Error("Error al subir la imagen");
    const data = await res.json();
    return data.imageUrl;
  };

  const handlePasswordChange = async () => {
    if (!user || !currPw || !newPw || newPw !== confPw) return;
    if (newPw.length < 8) {
      toast.error(lang === "es" ? "Mínimo 8 caracteres." : "Minimum 8 characters.");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: user.id, currentPassword: currPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || (lang === "es" ? "Error al cambiar contraseña." : "Error changing password."));
        return;
      }
      toast.success(lang === "es" ? "Contraseña actualizada correctamente." : "Password updated successfully.");
      setCurrPw("");
      setNewPw("");
      setConfPw("");
    } catch {
      toast.error(lang === "es" ? "Error al cambiar contraseña." : "Error changing password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = user.profileImage;
      if (profileImageFile) {
        setIsImageUploading(true);
        imageUrl = await uploadImage(profileImageFile);
        setIsImageUploading(false);
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: user.id, email, userName, profileImage: imageUrl }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setUser({ ...user, email, userName, profileImage: imageUrl });
      toast.success(lang === "es" ? "Perfil actualizado correctamente." : "Profile updated.");
    } catch {
      toast.error(lang === "es" ? "Error al actualizar el perfil." : "Error updating profile.");
    } finally {
      setLoading(false);
      setIsImageUploading(false);
    }
  };

  if (user === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--ec-brand)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p className="h-eyebrow">{lang === "es" ? "Cargando perfil…" : "Loading profile…"}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="ec-project-card" style={{ padding: 32, textAlign: "center", maxWidth: 360 }}>
          <h2 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>
            {lang === "es" ? "Acceso requerido" : "Access required"}
          </h2>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>
            {lang === "es" ? "Inicia sesión para continuar." : "Please log in to continue."}
          </p>
        </div>
      </div>
    );
  }

  const initials = (userName || email || "?")[0]?.toUpperCase();
  const resolvedImage = profileImage
    ? profileImage.startsWith("blob:") || profileImage.startsWith("data:")
      ? profileImage
      : `${process.env.NEXT_PUBLIC_URL}/${profileImage}`
    : null;

  return (
    <div className="circuit-bg" style={{ minHeight: "100%", padding: "32px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }} className="fade-in-up">

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
            <div
              style={{
                width: 96, height: 96, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--ec-brand), #7A0E3B)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white",
                fontFamily: "var(--font-instrument-serif), serif",
                fontSize: 44,
                boxShadow: "0 12px 32px -8px rgba(189,21,92,0.45), 0 0 0 1px rgba(189,21,92,0.3)",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {resolvedImage ? (
                <img src={resolvedImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : initials}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--ec-surface-1)",
                border: "2px solid var(--ec-bg)",
                color: "var(--ec-brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
            >
              <Upload size={13} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </div>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  PROFILE</div>
          <h1 className="font-serif" style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 8 }}>
            {lang === "es" ? "Mi Cuenta" : "My Account"}
          </h1>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>
            {lang === "es" ? "Gestiona tu información personal y preferencias de seguridad." : "Manage your personal information and security preferences."}
          </p>
        </div>

        {/* Profile card */}
        <div className="ec-project-card" style={{ padding: 28, marginBottom: 16, borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(189,21,92,0.12)", color: "var(--ec-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Edit size={16} />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400 }}>
                {lang === "es" ? "Información de Perfil" : "Profile Information"}
              </h2>
              <p style={{ color: "var(--ec-text-dim)", fontSize: 12, marginTop: 2 }}>
                {lang === "es" ? "Actualiza tus datos personales." : "Update your personal information."}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="h-eyebrow" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Mail size={10} /> Email
              </label>
              <div style={{ display: "flex", alignItems: "center", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, overflow: "hidden" }}>
                <span style={{ padding: "0 12px", color: "var(--ec-brand)", display: "flex", alignItems: "center" }}><Mail size={14} /></span>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={{ flex: 1, padding: "12px 12px 12px 0", background: "transparent", border: 0, outline: "none", color: "var(--ec-text)", fontSize: 14 }}
                />
              </div>
            </div>

            <div>
              <label className="h-eyebrow" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <User size={10} /> {lang === "es" ? "Nombre de usuario" : "Username"}
              </label>
              <input
                value={userName} onChange={(e) => setUserName(e.target.value)}
                placeholder={lang === "es" ? "Tu nombre de usuario" : "Your username"}
                style={{ width: "100%", padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, outline: "none", color: "var(--ec-text)", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || isImageUploading}
              style={{
                marginTop: 4, padding: "14px", width: "100%",
                background: loading ? "var(--ec-surface-2)" : "var(--ec-brand)",
                color: loading ? "var(--ec-text-dim)" : "white",
                border: 0, borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity 0.15s",
              }}
            >
              {loading || isImageUploading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  {isImageUploading ? (lang === "es" ? "Subiendo imagen…" : "Uploading image…") : (lang === "es" ? "Actualizando…" : "Updating…")}
                </>
              ) : (
                <><Check size={15} /> {lang === "es" ? "Actualizar datos" : "Update data"}</>
              )}
            </button>
          </form>
        </div>

        {/* Password card */}
        <div className="ec-project-card" style={{ padding: 28, marginBottom: 16, borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(96,165,250,0.12)", color: "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={16} />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400 }}>
                {lang === "es" ? "Cambiar Contraseña" : "Change Password"}
              </h2>
              <p style={{ color: "var(--ec-text-dim)", fontSize: 12, marginTop: 2 }}>
                {lang === "es" ? "Mantén tu cuenta segura con una contraseña fuerte." : "Keep your account secure with a strong password."}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>
                {lang === "es" ? "Contraseña actual" : "Current password"}
              </label>
              <input
                type="password" value={currPw} onChange={(e) => setCurrPw(e.target.value)} placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, outline: "none", color: "var(--ec-text)", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>
                  {lang === "es" ? "Nueva contraseña" : "New password"}
                </label>
                <input
                  type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={lang === "es" ? "Mínimo 8 caracteres" : "Min. 8 characters"}
                  style={{ width: "100%", padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, outline: "none", color: "var(--ec-text)", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>
                  {lang === "es" ? "Confirmar nueva" : "Confirm new"}
                </label>
                <input
                  type="password" value={confPw} onChange={(e) => setConfPw(e.target.value)} placeholder={lang === "es" ? "Repite la contraseña" : "Repeat password"}
                  style={{ width: "100%", padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, outline: "none", color: "var(--ec-text)", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={pwLoading || !currPw || !newPw || newPw !== confPw}
              style={{
                marginTop: 4, padding: "12px", width: "100%",
                background: pwLoading ? "var(--ec-surface-2)" : (!currPw || !newPw || newPw !== confPw) ? "var(--ec-surface-2)" : "var(--ec-brand)",
                border: "1px solid var(--ec-border)",
                color: (pwLoading || !currPw || !newPw || newPw !== confPw) ? "var(--ec-text-dim)" : "white",
                borderRadius: 10, fontSize: 14, fontWeight: 500,
                cursor: (pwLoading || !currPw || !newPw || newPw !== confPw) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {pwLoading ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                  {lang === "es" ? "Actualizando…" : "Updating…"}
                </>
              ) : (
                <><Check size={14} /> {lang === "es" ? "Actualizar contraseña" : "Update password"}</>
              )}
            </button>
          </div>
        </div>

        {/* Info card */}
        <div style={{ padding: 16, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <AlertCircle size={18} style={{ color: "#60A5FA", flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 13, color: "#60A5FA", marginBottom: 4 }}>
                {lang === "es" ? "Información importante" : "Important information"}
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ec-text-dim)", lineHeight: 1.55 }}>
                {lang === "es"
                  ? "Los cambios se aplican inmediatamente. Usa un correo válido para recibir notificaciones. Las imágenes deben ser menores a 5MB en formato JPG, PNG o GIF."
                  : "Changes are applied immediately. Use a valid email to receive notifications. Images must be under 5MB in JPG, PNG or GIF format."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
