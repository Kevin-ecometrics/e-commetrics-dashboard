"use client";
import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Trash, QrCode, User, Mail, Phone, Building, MapPin, ArrowLeft } from "lucide-react";
import { useLang } from "@/app/context/LangContext";

type FormData = {
  name: string;
  lastname: string;
  org: string;
  phone: string;
  email: string;
  address: string;
};

type FieldKey = keyof FormData;

export default function VCardPage() {
  const { lang } = useLang();
  const [formData, setFormData] = useState<FormData>({ name: "", lastname: "", org: "", phone: "", email: "", address: "" });
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const fieldIcons: Record<FieldKey, React.ElementType> = {
    name: User, lastname: User, org: Building, phone: Phone, email: Mail, address: MapPin,
  };

  const fieldLabels: Record<FieldKey, string> = {
    name: lang === "es" ? "Nombre" : "First Name",
    lastname: lang === "es" ? "Apellido" : "Last Name",
    org: lang === "es" ? "Organización" : "Organization",
    phone: lang === "es" ? "Número de Teléfono" : "Phone Number",
    email: lang === "es" ? "Correo Electrónico" : "Email Address",
    address: lang === "es" ? "Dirección" : "Address",
  };

  const handleShowQR = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setShowQR(true);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setShowQR(false);
    setFormData({ name: "", lastname: "", org: "", phone: "", email: "", address: "" });
  };

  const downloadQROnly = () => {
    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (qrCanvas) {
      const url = qrCanvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.name || "contact"}-qr-code.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  const downloadCompleteTicket = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const width = 400, height = 600;
      canvas.width = width * 2; canvas.height = height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = "#BD155C";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "white"; ctx.textAlign = "left";
      ctx.font = "14px Arial"; ctx.globalAlpha = 0.8;
      ctx.fillText((formData.org || "CONTACT").slice(0, 3).toUpperCase(), 32, 60);
      ctx.globalAlpha = 1; ctx.font = "bold 24px Arial"; ctx.textAlign = "center";
      ctx.fillText(formData.name?.charAt(0) || "C", 360, 50);
      ctx.textAlign = "left"; ctx.font = "bold 32px Arial";
      ctx.fillText(formData.name || "Contact", 32, 120);
      ctx.fillText(formData.lastname || "Card", 32, 160);
      ctx.font = "14px Arial"; ctx.globalAlpha = 0.8;
      let yPos = 200;
      if (formData.org) { ctx.fillText(`🏢 ${formData.org}`, 32, yPos); yPos += 25; }
      if (formData.phone) { ctx.fillText(`📱 ${formData.phone}`, 32, yPos); yPos += 25; }
      if (formData.email) { ctx.fillText(`✉️ ${formData.email}`, 32, yPos); yPos += 25; }
      if (formData.address) { ctx.fillText(`📍 ${formData.address}`, 32, yPos); yPos += 25; }
      const qrCanvas = qrRef.current?.querySelector("canvas");
      if (qrCanvas) {
        ctx.globalAlpha = 1; ctx.fillStyle = "white";
        ctx.fillRect(140, 320, 120, 120);
        ctx.drawImage(qrCanvas, 150, 330, 100, 100);
      }
      ctx.fillStyle = "white"; ctx.globalAlpha = 0.8; ctx.font = "12px Arial";
      ctx.textAlign = "center"; ctx.fillText("📱 DIGITAL CONTACT", width / 2, 480);
      ctx.globalAlpha = 1; ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath(); ctx.arc(width / 2, 20, 16, 0, 2 * Math.PI); ctx.fill();
      const url = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a"); a.href = url;
      a.download = `${formData.name || "contact"}-vcard-ticket.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {
      downloadQROnly();
    }
    setIsDownloading(false);
  };

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.name} ${formData.lastname}\nN:${formData.lastname};${formData.name};;;\nORG:${formData.org}\nTEL;TYPE=WORK,VOICE:${formData.phone}\nEMAIL;TYPE=INTERNET,WORK:${formData.email}\nADR;TYPE=WORK:;;${formData.address};;;;\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${formData.name || "contact"}-vcard.vcf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--ec-brand)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p className="h-eyebrow">{lang === "es" ? "Generando VCard…" : "Generating VCard…"}</p>
        </div>
      </div>
    );
  }

  if (showQR) {
    return (
      <div style={{ padding: "32px 24px" }} className="fade-in-up">
        <button onClick={() => setShowQR(false)} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ec-text-dim)", background: "none", border: 0, cursor: "pointer", fontSize: 13, marginBottom: 32 }}>
          <ArrowLeft size={14} /> {lang === "es" ? "Regresar al formulario" : "Back to form"}
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 56, alignItems: "center", maxWidth: 900, margin: "0 auto" }}>
          {/* Left info */}
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 10 }}>⎯⎯⎯  YOUR VCARD</div>
            <h1 className="font-serif" style={{ fontSize: 64, fontWeight: 400, lineHeight: 0.95, letterSpacing: "-0.025em", marginBottom: 16, textTransform: "lowercase" }}>
              {formData.name || "Untitled"} {formData.lastname}
            </h1>
            <div className="h-eyebrow" style={{ color: "var(--ec-brand)", marginBottom: 16 }}>VCARD</div>
            <p style={{ color: "var(--ec-text-dim)", fontSize: 14, lineHeight: 1.6, maxWidth: "42ch", marginBottom: 24 }}>
              {lang === "es"
                ? "Escanea para guardar la información de contacto o descarga tu tarjeta de presentación digital."
                : "Scan to save contact information or download your digital business card."}
            </p>

            <button
              onClick={downloadCompleteTicket}
              disabled={isDownloading}
              style={{ padding: "14px 28px", background: "var(--ec-brand)", color: "white", border: 0, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: isDownloading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: 16, opacity: isDownloading ? 0.7 : 1, width: 260 }}
            >
              {isDownloading
                ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} /> {lang === "es" ? "Generando…" : "Generating…"}</>
                : <><Download size={16} /> {lang === "es" ? "DESCARGAR TICKET" : "DOWNLOAD TICKET"}</>
              }
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={downloadQROnly} style={{ padding: "10px 16px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10, color: "var(--ec-text)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <QrCode size={13} /> {lang === "es" ? "Solo QR" : "QR Only"}
              </button>
              <button onClick={generateVCard} style={{ padding: "10px 16px", background: "#7A0E3B", border: 0, borderRadius: 10, color: "white", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Download size={13} /> {lang === "es" ? "Archivo .VCF" : ".VCF File"}
              </button>
              <button onClick={handleReset} style={{ padding: "10px 16px", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, color: "#F87171", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Trash size={13} /> {lang === "es" ? "Nueva tarjeta" : "New card"}
              </button>
            </div>
          </div>

          {/* VCard ticket */}
          <div
            ref={ticketRef}
            style={{
              position: "relative",
              background: "linear-gradient(135deg, var(--ec-brand), #7A0E3B)",
              borderRadius: 22,
              padding: 26,
              color: "white",
              aspectRatio: "0.7/1",
              display: "flex", flexDirection: "column",
              boxShadow: "0 24px 64px -16px rgba(189,21,92,0.5), 0 0 0 1px rgba(189,21,92,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Hole at top */}
            <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 28, height: 12, background: "rgba(0,0,0,0.4)", borderRadius: "0 0 12px 12px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <span className="h-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>{(formData.org?.slice(0,3) || "VCD").toUpperCase()}</span>
              <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.18)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-instrument-serif), serif", fontSize: 18 }}>
                {(formData.name?.[0] || "?").toUpperCase()}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div className="font-serif" style={{ fontSize: 32, lineHeight: 1, marginBottom: 6 }}>{formData.name || "Name"}</div>
              <div className="font-serif" style={{ fontSize: 32, lineHeight: 1, marginBottom: 20 }}>{formData.lastname || "Lastname"}</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, opacity: 0.85 }}>
                {formData.org && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Building size={11} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formData.org}</span></div>}
                {formData.phone && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={11} /><span>{formData.phone}</span></div>}
                {formData.email && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={11} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formData.email}</span></div>}
                {formData.address && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={11} /><span>{formData.address}</span></div>}
              </div>
            </div>

            <div ref={qrRef} style={{ background: "white", padding: 8, borderRadius: 8, alignSelf: "center", marginTop: 18 }}>
              <QRCodeCanvas
                value={`BEGIN:VCARD\nVERSION:3.0\nFN:${formData.name} ${formData.lastname}\nN:${formData.lastname};${formData.name};;;\nORG:${formData.org}\nTEL;TYPE=WORK,VOICE:${formData.phone}\nEMAIL;INTERNET;WORK:${formData.email}\nADR;TYPE=WORK:;;${formData.address}\nEND:VCARD`}
                size={100}
                level="H"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", display: "flex", alignItems: "flex-start", justifyContent: "center" }} className="fade-in-up">
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  VCARD BUILDER</div>
          <h1 className="font-serif" style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 10 }}>
            {lang === "es" ? "Tarjeta Digital" : "Digital Card"}
          </h1>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>
            {lang === "es" ? "Genera tu tarjeta de presentación y compártela como QR o archivo .vcf." : "Generate your business card and share it as a QR or .vcf file."}
          </p>
        </div>

        <div className="ec-project-card" style={{ padding: 28, borderRadius: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid var(--ec-border)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(189,21,92,0.12)", color: "var(--ec-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400 }}>VCard Generator</h2>
              <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>Generate &amp; Share</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {(["name", "lastname"] as FieldKey[]).map((key) => {
                const Icon = fieldIcons[key];
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 12, overflow: "hidden" }}>
                    <span style={{ paddingLeft: 12, paddingRight: 4, color: "var(--ec-brand)", display: "flex", alignItems: "center", flexShrink: 0 }}><Icon size={14} /></span>
                    <input
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={fieldLabels[key]}
                      style={{ flex: 1, padding: "11px 12px 11px 4px", background: "transparent", border: 0, outline: "none", color: "var(--ec-text)", fontSize: 14 }}
                    />
                  </div>
                );
              })}
            </div>

            {(["org", "phone", "email", "address"] as FieldKey[]).map((key) => {
              const Icon = fieldIcons[key];
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 12, overflow: "hidden" }}>
                  <span style={{ paddingLeft: 12, paddingRight: 4, color: "var(--ec-brand)", display: "flex", alignItems: "center", flexShrink: 0 }}><Icon size={14} /></span>
                  <input
                    type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={fieldLabels[key]}
                    maxLength={key === "phone" ? 15 : undefined}
                    style={{ flex: 1, padding: "11px 12px 11px 4px", background: "transparent", border: 0, outline: "none", color: "var(--ec-text)", fontSize: 14 }}
                  />
                </div>
              );
            })}

            <button
              onClick={handleShowQR}
              disabled={!formData.name}
              style={{
                marginTop: 8, padding: "14px",
                background: formData.name ? "var(--ec-brand)" : "var(--ec-surface-2)",
                color: formData.name ? "white" : "var(--ec-text-dim)",
                border: 0, borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: formData.name ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {lang === "es" ? "Generar VCard" : "Generate VCard"} <ArrowLeft size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
