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

// Generador de QR usando QRious (cargado desde CDN)
const QRCode = ({ value, size, bgColor, fgColor }) => {
  const canvasRef = useRef(null);

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
        // Fallback: mostrar canvas simple
        const ctx = canvasRef.current.getContext("2d");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = fgColor;
        ctx.font = `${size / 20}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("QR ERROR", size / 2, size / 2);
      }
    }
  }, [value, size, bgColor, fgColor]);

  return (
    <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
  );
};

// Presets de QR comunes
const QR_PRESETS = {
  website: {
    icon: "🌐",
    label: "Sitio Web",
    placeholder: "https://tupagina.com",
    transform: (value) =>
      value.startsWith("http") ? value : `https://${value}`,
  },
  wifi: {
    icon: <Wifi className="w-4 h-4" />,
    label: "WiFi",
    fields: ["ssid", "password", "security"],
    transform: ({ ssid, password, security = "WPA" }) =>
      `WIFI:T:${security};S:${ssid};P:${password};H:false;;`,
  },
  email: {
    icon: <Mail className="w-4 h-4" />,
    label: "Email",
    fields: ["email", "subject", "body"],
    transform: ({ email, subject = "", body = "" }) =>
      `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`,
  },
  phone: {
    icon: <Phone className="w-4 h-4" />,
    label: "Teléfono",
    placeholder: "+1234567890",
    transform: (value) => `tel:${value}`,
  },
  sms: {
    icon: <Smartphone className="w-4 h-4" />,
    label: "SMS",
    fields: ["phone", "message"],
    transform: ({ phone, message = "" }) =>
      `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ""}`,
  },
};

// Paletas de colores predefinidas
const COLOR_PRESETS = [
  { name: "Clásico", bg: "#ffffff", fg: "#000000" },
  { name: "Oscuro", bg: "#1f2937", fg: "#ffffff" },
  { name: "Azul", bg: "#dbeafe", fg: "#1e40af" },
  { name: "Verde", bg: "#dcfce7", fg: "#166534" },
  { name: "Morado", bg: "#f3e8ff", fg: "#7c3aed" },
  { name: "Rosa", bg: "#fdf2f8", fg: "#be185d" },
];

export default function QRCodeGenerator() {
  // Estados principales
  const [qrType, setQrType] = useState("website");
  const [qrData, setQrData] = useState({ website: "https://example.com" });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  // Estados de personalización
  const [config, setConfig] = useState({
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
  });

  // Valor del QR calculado
  const qrValue = useMemo(() => {
    const preset = QR_PRESETS[qrType];
    const data = qrData[qrType];

    if (preset.transform) {
      if (typeof data === "string") {
        return preset.transform(data);
      } else if (typeof data === "object") {
        return preset.transform(data);
      }
    }
    return data || "";
  }, [qrType, qrData]);

  // Cálculos de validación del logo
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

  // Actualizar configuración
  const updateConfig = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Actualizar datos del QR
  const updateQrData = useCallback((type, value) => {
    setQrData((prev) => ({ ...prev, [type]: value }));
  }, []);

  // Manejo de subida de logo con validación
  const handleLogoUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validación de tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es muy grande. Máximo 5MB.");
        return;
      }

      // Validación de tipo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido.");
        return;
      }

      const url = URL.createObjectURL(file);
      setLogo(file);
      setLogoPreview(url);

      // Cleanup de URL anterior
      return () => {
        if (logoPreview) URL.revokeObjectURL(logoPreview);
      };
    },
    [logoPreview]
  );

  // Aplicar preset de colores
  const applyColorPreset = useCallback(
    (preset) => {
      updateConfig({
        qrBgColor: preset.bg,
        qrFgColor: preset.fg,
      });
    },
    [updateConfig]
  );

  // Generar y descargar PNG optimizado
  const downloadPNG = useCallback(async () => {
    if (!qrRef.current) return;

    try {
      // Buscar el canvas del QR
      const qrCanvas = qrRef.current.querySelector("canvas");
      if (!qrCanvas) {
        throw new Error("No se pudo encontrar el canvas del QR");
      }

      // Crear canvas para el resultado final
      const canvas = document.createElement("canvas");
      const totalSize = config.qrSize + config.borderWidth * 2;
      const scale = 2; // Para mejor calidad

      canvas.width = totalSize * scale;
      canvas.height = totalSize * scale;

      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fondo con border
      if (config.borderWidth > 0) {
        ctx.fillStyle = config.borderColor;
        ctx.fillRect(0, 0, totalSize, totalSize);
      }

      // Fondo principal del QR con esquinas redondeadas
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
        ctx.fillRect(
          config.borderWidth,
          config.borderWidth,
          config.qrSize,
          config.qrSize
        );
      }

      // Dibujar el QR desde el canvas
      ctx.save();
      if (config.cornerRadius > 0) {
        // Aplicar clipping para esquinas redondeadas
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

      ctx.drawImage(
        qrCanvas,
        config.borderWidth,
        config.borderWidth,
        config.qrSize,
        config.qrSize
      );
      ctx.restore();

      // Dibujar logo si existe
      if (logoPreview) {
        await new Promise((resolve) => {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const centerX = totalSize / 2;
            const centerY = totalSize / 2;
            const logoRadius = config.logoSize / 2 + config.logoPadding;

            ctx.save();

            // Sombra del logo
            if (config.shadowBlur > 0) {
              const alpha = Math.round(config.shadowOpacity * 255)
                .toString(16)
                .padStart(2, "0");
              ctx.shadowColor = config.shadowColor + alpha;
              ctx.shadowBlur = config.shadowBlur;
              ctx.shadowOffsetX = 2;
              ctx.shadowOffsetY = 2;
            }

            // Fondo del logo
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
              ctx.quadraticCurveTo(
                x + size,
                y + size,
                x + size - radius,
                y + size
              );
              ctx.lineTo(x + radius, y + size);
              ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
            }
            ctx.fill();
            ctx.restore();

            // Clipping para el logo
            ctx.save();
            ctx.beginPath();
            if (config.logoBorderRadius === 50) {
              ctx.arc(centerX, centerY, config.logoSize / 2, 0, 2 * Math.PI);
            } else {
              const radius =
                ((config.logoSize / 2) * config.logoBorderRadius) / 50;
              const x = centerX - config.logoSize / 2;
              const y = centerY - config.logoSize / 2;
              const size = config.logoSize;

              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + size - radius, y);
              ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
              ctx.lineTo(x + size, y + size - radius);
              ctx.quadraticCurveTo(
                x + size,
                y + size,
                x + size - radius,
                y + size
              );
              ctx.lineTo(x + radius, y + size);
              ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
              ctx.lineTo(x, y + radius);
              ctx.quadraticCurveTo(x, y, x + radius, y);
              ctx.closePath();
            }
            ctx.clip();

            // Dibujar logo
            ctx.drawImage(
              logoImg,
              centerX - config.logoSize / 2,
              centerY - config.logoSize / 2,
              config.logoSize,
              config.logoSize
            );
            ctx.restore();
            resolve();
          };
          logoImg.onerror = () => resolve(); // Continuar aunque falle el logo
          logoImg.src = logoPreview;
        });
      }

      // Descargar con nombre descriptivo
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

  // Copiar valor del QR
  const copyQRValue = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copiando:", err);
    }
  }, [qrValue]);

  // Restablecer configuración
  const resetDefaults = useCallback(() => {
    setConfig({
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
    });
    setLogo(null);
    setLogoPreview(null);
  }, []);

  // Renderizar campos específicos por tipo
  const renderTypeFields = () => {
    const preset = QR_PRESETS[qrType];

    if (preset.fields) {
      return (
        <div className="space-y-3">
          {preset.fields.map((field) => (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                {field === "ssid"
                  ? "Nombre WiFi"
                  : field === "password"
                  ? "Contraseña"
                  : field === "security"
                  ? "Seguridad"
                  : field === "subject"
                  ? "Asunto"
                  : field === "body"
                  ? "Mensaje"
                  : field === "phone"
                  ? "Teléfono"
                  : field === "message"
                  ? "Mensaje"
                  : field}
              </label>
              {field === "security" ? (
                <select
                  value={qrData[qrType]?.[field] || "WPA"}
                  onChange={(e) =>
                    updateQrData(qrType, {
                      ...qrData[qrType],
                      [field]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Sin contraseña</option>
                </select>
              ) : field === "body" || field === "message" ? (
                <textarea
                  value={qrData[qrType]?.[field] || ""}
                  onChange={(e) =>
                    updateQrData(qrType, {
                      ...qrData[qrType],
                      [field]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              ) : (
                <input
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                      ? "tel"
                      : field === "password"
                      ? "password"
                      : "text"
                  }
                  value={qrData[qrType]?.[field] || ""}
                  onChange={(e) =>
                    updateQrData(qrType, {
                      ...qrData[qrType],
                      [field]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={
                    field === "ssid"
                      ? "Mi WiFi"
                      : field === "email"
                      ? "ejemplo@email.com"
                      : ""
                  }
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {preset.label}
        </label>
        <input
          type="text"
          placeholder={preset.placeholder}
          value={qrData[qrType] || ""}
          onChange={(e) => updateQrData(qrType, e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Generador QR Avanzado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Crea códigos QR personalizados con control total sobre el diseño
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel de Controles */}
          <div className="space-y-6">
            {/* Tipo de QR */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tipo de Código QR
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(QR_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setQrType(key)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      qrType === key
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-xl">
                        {typeof preset.icon === "string"
                          ? preset.icon
                          : preset.icon}
                      </div>
                      <span className="text-sm font-medium">
                        {preset.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Datos del QR */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Contenido
                </h2>
                <button
                  onClick={copyQRValue}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>
              </div>
              {renderTypeFields()}

              {/* Valor generado */}
              {qrValue && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Valor generado:
                  </p>
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                    {qrValue.length > 100
                      ? qrValue.slice(0, 100) + "..."
                      : qrValue}
                  </p>
                </div>
              )}
            </div>

            {/* Configuración de diseño */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Diseño
                </h2>
                <button
                  onClick={resetDefaults}
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restablecer
                </button>
              </div>

              {/* Presets de colores */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Paletas de colores
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyColorPreset(preset)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          <div
                            className="w-4 h-4 rounded-l"
                            style={{ backgroundColor: preset.bg }}
                          />
                          <div
                            className="w-4 h-4 rounded-r"
                            style={{ backgroundColor: preset.fg }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamaño */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tamaño: {config.qrSize}px
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="32"
                    value={config.qrSize}
                    onChange={(e) =>
                      updateConfig({ qrSize: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>

                {/* Colores personalizados */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fondo
                    </label>
                    <input
                      type="color"
                      value={config.qrBgColor}
                      onChange={(e) =>
                        updateConfig({ qrBgColor: e.target.value })
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código
                    </label>
                    <input
                      type="color"
                      value={config.qrFgColor}
                      onChange={(e) =>
                        updateConfig({ qrFgColor: e.target.value })
                      }
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Borde y esquinas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Borde: {config.borderWidth}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={config.borderWidth}
                      onChange={(e) =>
                        updateConfig({ borderWidth: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Esquinas: {config.cornerRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={config.cornerRadius}
                      onChange={(e) =>
                        updateConfig({ cornerRadius: Number(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Logo
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subir logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer text-gray-700 dark:text-gray-300"
                  />
                </div>

                {logoPreview && (
                  <div className="space-y-4">
                    {/* Vista previa del logo */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Logo cargado
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {config.logoSize}px ({logoStats.percentage.toFixed(1)}
                          % del QR)
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setLogo(null);
                          setLogoPreview(null);
                          if (logoPreview) URL.revokeObjectURL(logoPreview);
                        }}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>

                    {/* Estado del logo */}
                    {logoStats.status !== "good" && (
                      <div
                        className={`flex items-start space-x-3 p-3 rounded-lg ${
                          logoStats.status === "critical"
                            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                        }`}
                      >
                        <AlertTriangle
                          className={`w-5 h-5 mt-0.5 ${
                            logoStats.status === "critical"
                              ? "text-red-500"
                              : "text-yellow-500"
                          }`}
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              logoStats.status === "critical"
                                ? "text-red-800 dark:text-red-200"
                                : "text-yellow-800 dark:text-yellow-200"
                            }`}
                          >
                            {logoStats.status === "critical"
                              ? "Logo muy grande"
                              : "Logo grande detectado"}
                          </p>
                          <p
                            className={`text-xs ${
                              logoStats.status === "critical"
                                ? "text-red-700 dark:text-red-300"
                                : "text-yellow-700 dark:text-yellow-300"
                            }`}
                          >
                            {logoStats.status === "critical"
                              ? "Puede afectar la lectura del QR. Recomendado: máximo 30%"
                              : "Verifica que el QR se escanee correctamente"}
                          </p>
                          {logoStats.status === "critical" && (
                            <button
                              onClick={() =>
                                updateConfig({
                                  logoSize: Math.round(config.qrSize * 0.25),
                                })
                              }
                              className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                            >
                              Ajustar automáticamente
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Controles del logo */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tamaño: {config.logoSize}px
                        </label>
                        <input
                          type="range"
                          min="24"
                          max="96"
                          step="4"
                          value={config.logoSize}
                          onChange={(e) =>
                            updateConfig({ logoSize: Number(e.target.value) })
                          }
                          className={`w-full ${
                            logoStats.status === "critical"
                              ? "accent-red-500"
                              : logoStats.status === "warning"
                              ? "accent-yellow-500"
                              : "accent-blue-500"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Padding: {config.logoPadding}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={config.logoPadding}
                            onChange={(e) =>
                              updateConfig({
                                logoPadding: Number(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Redondez: {config.logoBorderRadius}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            value={config.logoBorderRadius}
                            onChange={(e) =>
                              updateConfig({
                                logoBorderRadius: Number(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color de fondo
                        </label>
                        <input
                          type="color"
                          value={config.logoBgColor}
                          onChange={(e) =>
                            updateConfig({ logoBgColor: e.target.value })
                          }
                          className="w-full h-10 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Sombra */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sombra: {config.shadowBlur}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={config.shadowBlur}
                            onChange={(e) =>
                              updateConfig({
                                shadowBlur: Number(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Opacidad: {Math.round(config.shadowOpacity * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.shadowOpacity}
                            onChange={(e) =>
                              updateConfig({
                                shadowOpacity: Number(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Color
                          </label>
                          <input
                            type="color"
                            value={config.shadowColor}
                            onChange={(e) =>
                              updateConfig({ shadowColor: e.target.value })
                            }
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-fit sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Vista Previa
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>
                  {config.qrSize + config.borderWidth * 2}×
                  {config.qrSize + config.borderWidth * 2}px
                </span>
              </div>
            </div>

            {/* QR Preview */}
            <div className="flex justify-center mb-6">
              <div
                className="relative rounded-xl p-8 shadow-inner"
                style={{
                  background: `repeating-conic-gradient(#f8fafc 0% 25%, #e2e8f0 25% 50%) 50% / 20px 20px`,
                }}
              >
                <div
                  ref={qrRef}
                  className="relative"
                  style={{
                    width: config.qrSize + config.borderWidth * 2,
                    height: config.qrSize + config.borderWidth * 2,
                    backgroundColor: config.borderColor,
                    borderRadius:
                      config.cornerRadius > 0
                        ? `${config.cornerRadius}px`
                        : "0",
                    padding: `${config.borderWidth}px`,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: config.qrBgColor,
                      borderRadius:
                        config.cornerRadius > 0
                          ? `${Math.max(
                              0,
                              config.cornerRadius - config.borderWidth
                            )}px`
                          : "0",
                      overflow: "hidden",
                    }}
                  >
                    <QRCode
                      value={qrValue}
                      size={config.qrSize}
                      bgColor={config.qrBgColor}
                      fgColor={config.qrFgColor}
                    />
                  </div>

                  {logoPreview && (
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{
                        width: config.logoSize + config.logoPadding * 2,
                        height: config.logoSize + config.logoPadding * 2,
                        backgroundColor: config.logoBgColor,
                        borderRadius:
                          config.logoBorderRadius === 50
                            ? "50%"
                            : `${
                                (config.logoBorderRadius *
                                  (config.logoSize + config.logoPadding * 2)) /
                                100
                              }px`,
                        boxShadow:
                          config.shadowBlur > 0
                            ? `2px 2px ${config.shadowBlur}px ${
                                config.shadowColor
                              }${Math.round(config.shadowOpacity * 255)
                                .toString(16)
                                .padStart(2, "0")}`
                            : "none",
                      }}
                    >
                      <img
                        src={logoPreview}
                        alt="Logo"
                        style={{
                          width: config.logoSize,
                          height: config.logoSize,
                          borderRadius:
                            config.logoBorderRadius === 50
                              ? "50%"
                              : `${
                                  (config.logoBorderRadius * config.logoSize) /
                                  100
                                }px`,
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tamaño Final
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {config.qrSize + config.borderWidth * 2}px
                </div>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${
                  logoPreview
                    ? logoStats.status === "critical"
                      ? "bg-red-50 dark:bg-red-900/20"
                      : logoStats.status === "warning"
                      ? "bg-yellow-50 dark:bg-yellow-900/20"
                      : "bg-green-50 dark:bg-green-900/20"
                    : "bg-gray-50 dark:bg-gray-700/50"
                }`}
              >
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Logo
                </div>
                <div
                  className={`text-lg font-bold ${
                    logoPreview
                      ? logoStats.status === "critical"
                        ? "text-red-600 dark:text-red-400"
                        : logoStats.status === "warning"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {logoPreview
                    ? `${logoStats.percentage.toFixed(1)}%`
                    : "Sin logo"}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tipo
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {QR_PRESETS[qrType].label}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              <button
                onClick={downloadPNG}
                disabled={!qrValue}
                className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>
                  Descargar PNG ({config.qrSize + config.borderWidth * 2}×
                  {config.qrSize + config.borderWidth * 2}px)
                </span>
              </button>

              {/* Información adicional */}
              {qrValue && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Consejos para mejor rendimiento:
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>
                          • Usa colores con alto contraste para mejor
                          legibilidad
                        </li>
                        <li>• Mantén el logo bajo 30% del tamaño total</li>
                        <li>• Prueba escanear con diferentes aplicaciones</li>
                        <li>• Para impresión, usa tamaños de al menos 256px</li>
                        {logoPreview && logoStats.status === "good" && (
                          <li className="text-green-600 dark:text-green-400">
                            ✓ Tu configuración es óptima
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Error si no hay contenido */}
              {!qrValue && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Por favor ingresa el contenido para generar el código QR
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Los códigos QR se generan localmente en tu navegador</span>
          </div>
        </div>
      </div>
    </div>
  );
}
