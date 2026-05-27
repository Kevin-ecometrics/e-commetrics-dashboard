"use client";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Download,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Smartphone,
  Wifi,
  Mail,
  Phone,
} from "lucide-react";

declare global {
  interface Window {
    QRious: new (options: {
      element: HTMLCanvasElement | null;
      value: string;
      size: number;
      background: string;
      foreground: string;
      level: string;
    }) => void;
  }
}

type QRCodeProps = {
  value: string;
  size: number;
  bgColor: string;
  fgColor: string;
};

// Generador de QR usando QRious (cargado desde CDN)
const QRCode = ({ value, size, bgColor, fgColor }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Cargar QRious si no está disponible
    if (typeof window.QRious === "undefined") {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";
      script.onload = () => generateQR();
      document.head.appendChild(script);
    } else {
      generateQR();
    }

    function generateQR() {
      try {
        new window.QRious({
          element: canvasRef.current,
          value: value,
          size: size,
          background: bgColor,
          foreground: fgColor,
          level: "M",
        });
      } catch (error) {
        console.error("Error generando QR:", error);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
          ctx.fillStyle = fgColor;
          ctx.font = `${size / 20}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText("QR ERROR", size / 2, size / 2);
        }
      }
    }
  }, [value, size, bgColor, fgColor]);

  return (
    <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
  );
};

type PresetSimple = {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  transform: (value: string) => string;
  fields?: undefined;
};

type PresetMultiField = {
  icon: React.ReactNode;
  label: string;
  fields: string[];
  transform: (data: Record<string, string>) => string;
  placeholder?: undefined;
};

type QRPreset = PresetSimple | PresetMultiField;

// Presets de QR comunes
const QR_PRESETS: Record<string, QRPreset> = {
  website: {
    icon: "🌐",
    label: "Sitio Web",
    placeholder: "https://tupagina.com",
    transform: (value: string) =>
      value.startsWith("http") ? value : `https://${value}`,
  },
  wifi: {
    icon: <Wifi className="w-4 h-4" />,
    label: "WiFi",
    fields: ["ssid", "password", "security"],
    transform: ({ ssid, password, security = "WPA" }: Record<string, string>) =>
      `WIFI:T:${security};S:${ssid};P:${password};H:false;;`,
  },
  email: {
    icon: <Mail className="w-4 h-4" />,
    label: "Email",
    fields: ["email", "subject", "body"],
    transform: ({ email, subject = "", body = "" }: Record<string, string>) =>
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  },
  phone: {
    icon: <Phone className="w-4 h-4" />,
    label: "Teléfono",
    placeholder: "+1234567890",
    transform: (value: string) => `tel:${value}`,
  },
  sms: {
    icon: <Smartphone className="w-4 h-4" />,
    label: "SMS",
    fields: ["phone", "message"],
    transform: ({ phone, message = "" }: Record<string, string>) =>
      `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ""}`,
  },
};

type ColorPreset = { name: string; bg: string; fg: string };

// Paletas de colores predefinidas
const COLOR_PRESETS: ColorPreset[] = [
  { name: "Clásico", bg: "#ffffff", fg: "#000000" },
  { name: "Oscuro", bg: "#1f2937", fg: "#ffffff" },
  { name: "Azul", bg: "#dbeafe", fg: "#1e40af" },
  { name: "Verde", bg: "#dcfce7", fg: "#166534" },
  { name: "Morado", bg: "#f3e8ff", fg: "#7c3aed" },
  { name: "Rosa", bg: "#fdf2f8", fg: "#be185d" },
];

type Config = {
  qrSize: number;
  logoSize: number;
  logoPadding: number;
  qrBgColor: string;
  qrFgColor: string;
  logoBgColor: string;
  logoBorderRadius: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOpacity: number;
  borderWidth: number;
  borderColor: string;
  cornerRadius: number;
};

const DEFAULT_CONFIG: Config = {
  qrSize: 256,
  logoSize: 48,
  logoPadding: 8,
  qrBgColor: "#ffffff",
  qrFgColor: "#000000",
  logoBgColor: "#ffffff",
  logoBorderRadius: 50,
  shadowBlur: 8,
  shadowColor: "#000000",
  shadowOpacity: 0.3,
  borderWidth: 0,
  borderColor: "#000000",
  cornerRadius: 0,
};

export default function QRCodeGenerator() {
  const [qrType, setQrType] = useState("website");
  const [qrData, setQrData] = useState<Record<string, string | Record<string, string>>>({ website: "https://example.com" });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

  const qrValue = useMemo(() => {
    const preset = QR_PRESETS[qrType];
    const data = qrData[qrType];

    if (typeof data === "string") {
      return (preset as PresetSimple).transform(data);
    } else if (typeof data === "object") {
      return (preset as PresetMultiField).transform(data as Record<string, string>);
    }
    return "";
  }, [qrType, qrData]);

  const logoStats = useMemo(() => {
    const percentage =
      ((config.logoSize + config.logoPadding * 2) / config.qrSize) * 100;
    return {
      percentage,
      isWarning: percentage > 20,
      isCritical: percentage > 30,
      status:
        percentage > 30 ? "critical" : percentage > 20 ? "warning" : "good",
    };
  }, [config.logoSize, config.logoPadding, config.qrSize]);

  const updateConfig = useCallback((updates: Partial<Config>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateQrData = useCallback((type: string, value: string | Record<string, string>) => {
    setQrData((prev) => ({ ...prev, [type]: value }));
  }, []);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es muy grande. Máximo 5MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido.");
        return;
      }

      const url = URL.createObjectURL(file);
      setLogo(file);
      setLogoPreview(url);

      return () => {
        if (logoPreview) URL.revokeObjectURL(logoPreview);
      };
    },
    [logoPreview]
  );

  const applyColorPreset = useCallback(
    (preset: ColorPreset) => {
      updateConfig({
        qrBgColor: preset.bg,
        qrFgColor: preset.fg,
      });
    },
    [updateConfig]
  );

  const downloadPNG = useCallback(async () => {
    if (!qrRef.current) return;

    try {
      const qrCanvas = qrRef.current.querySelector("canvas");
      if (!qrCanvas) throw new Error("No se pudo encontrar el canvas del QR");

      const canvas = document.createElement("canvas");
      const totalSize = config.qrSize + config.borderWidth * 2;
      const scale = 2;

      canvas.width = totalSize * scale;
      canvas.height = totalSize * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (config.borderWidth > 0) {
        ctx.fillStyle = config.borderColor;
        ctx.fillRect(0, 0, totalSize, totalSize);
      }

      ctx.fillStyle = config.qrBgColor;
      if (config.cornerRadius > 0) {
        ctx.beginPath();
        const x = config.borderWidth;
        const y = config.borderWidth;
        const w = config.qrSize;
        const h = config.qrSize;
        const r = config.cornerRadius;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(config.borderWidth, config.borderWidth, config.qrSize, config.qrSize);
      }

      ctx.save();
      if (config.cornerRadius > 0) {
        ctx.beginPath();
        const x = config.borderWidth;
        const y = config.borderWidth;
        const w = config.qrSize;
        const h = config.qrSize;
        const r = Math.max(0, config.cornerRadius - config.borderWidth);
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(qrCanvas, config.borderWidth, config.borderWidth, config.qrSize, config.qrSize);
      ctx.restore();

      if (logoPreview) {
        await new Promise<void>((resolve) => {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const centerX = totalSize / 2;
            const centerY = totalSize / 2;
            const logoRadius = config.logoSize / 2 + config.logoPadding;

            ctx.save();

            if (config.shadowBlur > 0) {
              const alpha = Math.round(config.shadowOpacity * 255).toString(16).padStart(2, "0");
              ctx.shadowColor = config.shadowColor + alpha;
              ctx.shadowBlur = config.shadowBlur;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
            }

            ctx.fillStyle = config.logoBgColor;
            ctx.beginPath();
            if (config.logoBorderRadius === 50) {
              ctx.arc(centerX, centerY, logoRadius, 0, 2 * Math.PI);
            } else {
              const radius = (logoRadius * config.logoBorderRadius) / 50;
              const x = centerX - logoRadius;
              const y = centerY - logoRadius;
              const size = logoRadius * 2;
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + size - radius, y);
              ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
              ctx.lineTo(x + size, y + size - radius);
              ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
              ctx.lineTo(x + radius, y + size);
              ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
            }
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            if (config.logoBorderRadius === 50) {
              ctx.arc(centerX, centerY, config.logoSize / 2, 0, 2 * Math.PI);
            } else {
              const radius = ((config.logoSize / 2) * config.logoBorderRadius) / 50;
              const x = centerX - config.logoSize / 2;
              const y = centerY - config.logoSize / 2;
              const size = config.logoSize;
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + size - radius, y);
              ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
              ctx.lineTo(x + size, y + size - radius);
              ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
              ctx.lineTo(x + radius, y + size);
              ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
            }
            ctx.clip();
            ctx.drawImage(logoImg, centerX - config.logoSize / 2, centerY - config.logoSize / 2, config.logoSize, config.logoSize);
            ctx.restore();
            resolve();
          };
          logoImg.onerror = () => resolve();
          logoImg.src = logoPreview;
        });
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `qr_${qrType}_${totalSize}x${totalSize}_${timestamp}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png", 0.95);
      link.click();
    } catch (error) {
      console.error("Error generando PNG:", error);
      alert("Error al generar la imagen. Por favor intenta nuevamente.");
    }
  }, [config, logoPreview, qrType]);

  const copyQRValue = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copiando:", err);
    }
  }, [qrValue]);

  const resetDefaults = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setLogo(null);
    setLogoPreview(null);
  }, []);

  const renderTypeFields = () => {
    const preset = QR_PRESETS[qrType];

    if (preset.fields) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {preset.fields.map((field) => (
            <div key={field}>
              <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>
                {field === "ssid" ? "Nombre WiFi"
                  : field === "password" ? "Contraseña"
                  : field === "security" ? "Seguridad"
                  : field === "subject" ? "Asunto"
                  : field === "body" ? "Mensaje"
                  : field === "phone" ? "Teléfono"
                  : field === "message" ? "Mensaje"
                  : field}
              </label>
              {field === "security" ? (
                <select
                  value={(qrData[qrType] as Record<string, string>)?.[field] || "WPA"}
                  onChange={(e) =>
                    updateQrData(qrType, {
                      ...(qrData[qrType] as Record<string, string>),
                      [field]: e.target.value,
                    })
                  }
                  className="ec-field-input"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Sin contraseña</option>
                </select>
              ) : field === "body" || field === "message" ? (
                <textarea
                  value={(qrData[qrType] as Record<string, string>)?.[field] || ""}
                  onChange={(e) =>
                    updateQrData(qrType, {
                      ...(qrData[qrType] as Record<string, string>),
                      [field]: e.target.value,
                    })
                  }
                  className="ec-field-input"
                  rows={3}
                />
              ) : (
                <input
                  type={field === "email" ? "email" : field === "phone" ? "tel" : field === "password" ? "password" : "text"}
                  value={(qrData[qrType] as Record<string, string>)?.[field] || ""}
                  onChange={(e) =>
                    updateQrData(qrType, {
                      ...(qrData[qrType] as Record<string, string>),
                      [field]: e.target.value,
                    })
                  }
                  className="ec-field-input"
                  placeholder={field === "ssid" ? "Mi WiFi" : field === "email" ? "ejemplo@email.com" : ""}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label className="ec-field-label">{preset.label}</label>
        <input
          type="text"
          placeholder={(preset as PresetSimple).placeholder}
          value={(qrData[qrType] as string) || ""}
          onChange={(e) => updateQrData(qrType, e.target.value)}
          className="ec-field-input"
        />
      </div>
    );
  };

  // suppress unused variable warning
  void logo;

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  QR GENERATOR</div>
          <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 8, color: "var(--ec-text)" }}>
            Generador QR Avanzado
          </h1>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>
            Crea códigos QR personalizados con control total sobre el diseño
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel de Controles */}
          <div className="space-y-6">
            {/* Tipo de QR */}
            <div className="ec-project-card" style={{ padding: 24, borderRadius: 14 }}>
              <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)", marginBottom: 14 }}>
                Tipo de Código QR
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(QR_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setQrType(key)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: qrType === key ? "2px solid var(--ec-brand)" : "2px solid var(--ec-border)",
                      background: qrType === key ? "rgba(189,21,92,0.08)" : "transparent",
                      color: qrType === key ? "var(--ec-brand)" : "var(--ec-text-muted)",
                      cursor: "pointer",
                      transition: "all 160ms",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 20 }}>{preset.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{preset.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Datos del QR */}
            <div className="ec-project-card" style={{ padding: 24, borderRadius: 14 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>Contenido</h2>
                <button
                  onClick={copyQRValue}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", fontSize: 13,
                    background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)",
                    borderRadius: 8, cursor: "pointer", color: "var(--ec-text-muted)",
                    transition: "all 140ms",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>
              </div>
              {renderTypeFields()}

              {qrValue && (
                <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <p style={{ fontSize: 11, color: "var(--ec-text-dim)", marginBottom: 4, fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>Valor generado</p>
                  <p style={{ fontSize: 13, fontFamily: "JetBrains Mono, monospace", color: "var(--ec-text-muted)", wordBreak: "break-all" }}>
                    {qrValue.length > 100 ? qrValue.slice(0, 100) + "..." : qrValue}
                  </p>
                </div>
              )}
            </div>

            {/* Configuración de diseño */}
            <div className="ec-project-card" style={{ padding: 24, borderRadius: 14 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>Diseño</h2>
                <button
                  onClick={resetDefaults}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", fontSize: 13,
                    background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)",
                    borderRadius: 8, cursor: "pointer", color: "var(--ec-text-muted)",
                    transition: "all 140ms",
                  }}
                >
                  <RotateCcw size={14} />
                  Restablecer
                </button>
              </div>

              {/* Presets de colores */}
              <div style={{ marginBottom: 20 }}>
                <p className="ec-field-label" style={{ marginBottom: 10 }}>Paletas de colores</p>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      style={{
                        padding: "7px 10px", borderRadius: 8,
                        border: "1px solid var(--ec-border)", background: "var(--ec-surface-1)",
                        cursor: "pointer", transition: "border-color 140ms",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex" }}>
                          <div style={{ width: 16, height: 16, borderRadius: "4px 0 0 4px", backgroundColor: preset.bg }} />
                          <div style={{ width: 16, height: 16, borderRadius: "0 4px 4px 0", backgroundColor: preset.fg }} />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Tamaño: {config.qrSize}px</label>
                  <input type="range" min="128" max="512" step="32" value={config.qrSize} onChange={(e) => updateConfig({ qrSize: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Fondo</label>
                    <input type="color" value={config.qrBgColor} onChange={(e) => updateConfig({ qrBgColor: e.target.value })} style={{ width: "100%", height: 40, borderRadius: 8, cursor: "pointer", border: "1px solid var(--ec-border)" }} />
                  </div>
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Código</label>
                    <input type="color" value={config.qrFgColor} onChange={(e) => updateConfig({ qrFgColor: e.target.value })} style={{ width: "100%", height: 40, borderRadius: 8, cursor: "pointer", border: "1px solid var(--ec-border)" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Borde: {config.borderWidth}px</label>
                    <input type="range" min="0" max="20" value={config.borderWidth} onChange={(e) => updateConfig({ borderWidth: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                  </div>
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Esquinas: {config.cornerRadius}px</label>
                    <input type="range" min="0" max="50" value={config.cornerRadius} onChange={(e) => updateConfig({ cornerRadius: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div style={{ borderTop: "1px solid var(--ec-hairline)", paddingTop: 20 }}>
                <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--ec-text)", marginBottom: 14 }}>Logo</h3>
                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Subir logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ width: "100%", fontSize: 13, cursor: "pointer", color: "var(--ec-text-muted)" }} />
                </div>

                {logoPreview && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoPreview} alt="Logo preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ec-text)" }}>Logo cargado</p>
                        <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>{config.logoSize}px ({logoStats.percentage.toFixed(1)}% del QR)</p>
                      </div>
                      <button
                        onClick={() => { setLogo(null); setLogoPreview(null); if (logoPreview) URL.revokeObjectURL(logoPreview); }}
                        style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>

                    {logoStats.status !== "good" && (
                      <div style={{
                        display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10,
                        background: logoStats.status === "critical" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                        border: `1px solid ${logoStats.status === "critical" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                      }}>
                        <AlertTriangle size={16} style={{ marginTop: 1, color: logoStats.status === "critical" ? "#ef4444" : "#f59e0b", flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: logoStats.status === "critical" ? "#ef4444" : "#f59e0b" }}>
                            {logoStats.status === "critical" ? "Logo muy grande" : "Logo grande detectado"}
                          </p>
                          <p style={{ fontSize: 12, color: "var(--ec-text-dim)", marginTop: 2 }}>
                            {logoStats.status === "critical" ? "Puede afectar la lectura del QR. Recomendado: máximo 30%" : "Verifica que el QR se escanee correctamente"}
                          </p>
                          {logoStats.status === "critical" && (
                            <button onClick={() => updateConfig({ logoSize: Math.round(config.qrSize * 0.25) })} style={{ marginTop: 8, padding: "4px 10px", background: "#ef4444", color: "white", fontSize: 12, borderRadius: 6, border: "none", cursor: "pointer" }}>
                              Ajustar automáticamente
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Tamaño: {config.logoSize}px</label>
                        <input type="range" min="24" max="96" step="4" value={config.logoSize} onChange={(e) => updateConfig({ logoSize: Number(e.target.value) })} style={{ width: "100%", accentColor: logoStats.status === "critical" ? "#ef4444" : logoStats.status === "warning" ? "#f59e0b" : "var(--ec-brand)" }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Padding: {config.logoPadding}px</label>
                          <input type="range" min="0" max="20" value={config.logoPadding} onChange={(e) => updateConfig({ logoPadding: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                        </div>
                        <div>
                          <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Redondez: {config.logoBorderRadius}%</label>
                          <input type="range" min="0" max="50" value={config.logoBorderRadius} onChange={(e) => updateConfig({ logoBorderRadius: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                        </div>
                      </div>
                      <div>
                        <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Color de fondo</label>
                        <input type="color" value={config.logoBgColor} onChange={(e) => updateConfig({ logoBgColor: e.target.value })} style={{ width: "100%", height: 40, borderRadius: 8, cursor: "pointer", border: "1px solid var(--ec-border)" }} />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Sombra: {config.shadowBlur}px</label>
                          <input type="range" min="0" max="20" value={config.shadowBlur} onChange={(e) => updateConfig({ shadowBlur: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                        </div>
                        <div>
                          <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Opacidad: {Math.round(config.shadowOpacity * 100)}%</label>
                          <input type="range" min="0" max="1" step="0.1" value={config.shadowOpacity} onChange={(e) => updateConfig({ shadowOpacity: Number(e.target.value) })} style={{ width: "100%", accentColor: "var(--ec-brand)" }} />
                        </div>
                        <div>
                          <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>Color</label>
                          <input type="color" value={config.shadowColor} onChange={(e) => updateConfig({ shadowColor: e.target.value })} style={{ width: "100%", height: 32, borderRadius: 6, cursor: "pointer", border: "1px solid var(--ec-border)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="ec-project-card" style={{ padding: 24, borderRadius: 14, height: "fit-content", position: "sticky", top: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>Vista Previa</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ec-text-dim)" }}>
                <Info size={14} />
                <span>{config.qrSize + config.borderWidth * 2}×{config.qrSize + config.borderWidth * 2}px</span>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative rounded-xl p-8 shadow-inner" style={{ background: `repeating-conic-gradient(#f8fafc 0% 25%, #e2e8f0 25% 50%) 50% / 20px 20px` }}>
                <div
                  ref={qrRef}
                  className="relative"
                  style={{
                    width: config.qrSize + config.borderWidth * 2,
                    height: config.qrSize + config.borderWidth * 2,
                    backgroundColor: config.borderColor,
                    borderRadius: config.cornerRadius > 0 ? `${config.cornerRadius}px` : "0",
                    padding: `${config.borderWidth}px`,
                  }}
                >
                  <div style={{ backgroundColor: config.qrBgColor, borderRadius: config.cornerRadius > 0 ? `${Math.max(0, config.cornerRadius - config.borderWidth)}px` : "0", overflow: "hidden" }}>
                    <QRCode value={qrValue} size={config.qrSize} bgColor={config.qrBgColor} fgColor={config.qrFgColor} />
                  </div>

                  {logoPreview && (
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{
                        width: config.logoSize + config.logoPadding * 2,
                        height: config.logoSize + config.logoPadding * 2,
                        backgroundColor: config.logoBgColor,
                        borderRadius: config.logoBorderRadius === 50 ? "50%" : `${(config.logoBorderRadius * (config.logoSize + config.logoPadding * 2)) / 100}px`,
                        boxShadow: config.shadowBlur > 0 ? `2px 2px ${config.shadowBlur}px ${config.shadowColor}${Math.round(config.shadowOpacity * 255).toString(16).padStart(2, "0")}` : "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoPreview}
                        alt="Logo"
                        style={{
                          width: config.logoSize,
                          height: config.logoSize,
                          borderRadius: config.logoBorderRadius === 50 ? "50%" : `${(config.logoBorderRadius * config.logoSize) / 100}px`,
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
              <div style={{ textAlign: "center", padding: "10px 8px", background: "var(--ec-surface-2)", borderRadius: 10, border: "1px solid var(--ec-border)" }}>
                <div style={{ fontSize: 12, color: "var(--ec-text-dim)", marginBottom: 4 }}>Tamaño Final</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ec-text)" }}>{config.qrSize + config.borderWidth * 2}px</div>
              </div>
              <div style={{
                textAlign: "center", padding: "10px 8px", borderRadius: 10, border: "1px solid var(--ec-border)",
                background: logoPreview
                  ? logoStats.status === "critical" ? "rgba(239,68,68,0.08)"
                  : logoStats.status === "warning" ? "rgba(245,158,11,0.08)"
                  : "rgba(34,197,94,0.08)"
                  : "var(--ec-surface-2)",
              }}>
                <div style={{ fontSize: 12, color: "var(--ec-text-dim)", marginBottom: 4 }}>Logo</div>
                <div style={{
                  fontSize: 16, fontWeight: 600,
                  color: logoPreview
                    ? logoStats.status === "critical" ? "#ef4444"
                    : logoStats.status === "warning" ? "#f59e0b"
                    : "#22c55e"
                    : "var(--ec-text)",
                }}>
                  {logoPreview ? `${logoStats.percentage.toFixed(1)}%` : "Sin logo"}
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 8px", background: "var(--ec-surface-2)", borderRadius: 10, border: "1px solid var(--ec-border)" }}>
                <div style={{ fontSize: 12, color: "var(--ec-text-dim)", marginBottom: 4 }}>Tipo</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ec-text)" }}>{QR_PRESETS[qrType].label}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={downloadPNG}
                disabled={!qrValue}
                className="ec-btn-primary"
                style={{ width: "100%", justifyContent: "center", gap: 10, padding: "14px 20px", fontSize: 14, opacity: !qrValue ? 0.5 : 1, cursor: !qrValue ? "not-allowed" : "pointer" }}
              >
                <Download size={18} />
                <span>Descargar PNG ({config.qrSize + config.borderWidth * 2}×{config.qrSize + config.borderWidth * 2}px)</span>
              </button>

              {qrValue && (
                <div style={{ padding: "12px 16px", background: "rgba(189,21,92,0.06)", border: "1px solid rgba(189,21,92,0.2)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Info size={15} style={{ color: "var(--ec-brand)", marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ec-text)", marginBottom: 6 }}>Consejos para mejor rendimiento:</p>
                      <ul style={{ fontSize: 12, color: "var(--ec-text-muted)", display: "flex", flexDirection: "column", gap: 3 }}>
                        <li>• Usa colores con alto contraste para mejor legibilidad</li>
                        <li>• Mantén el logo bajo 30% del tamaño total</li>
                        <li>• Prueba escanear con diferentes aplicaciones</li>
                        <li>• Para impresión, usa tamaños de al menos 256px</li>
                        {logoPreview && logoStats.status === "good" && (
                          <li style={{ color: "#22c55e" }}>✓ Tu configuración es óptima</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {!qrValue && (
                <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>Por favor ingresa el contenido para generar el código QR</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 999, fontSize: 12, color: "var(--ec-text-dim)" }}>
            <Info size={13} />
            <span>Los códigos QR se generan localmente en tu navegador</span>
          </div>
        </div>
      </div>
    </div>
  );
}
