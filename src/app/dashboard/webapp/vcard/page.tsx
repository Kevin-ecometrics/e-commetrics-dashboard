"use client";
import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  FaDownload,
  FaTrash,
  FaQrcode,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaArrowLeft,
} from "react-icons/fa";
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

export default function InnovativeQRGenerator() {
  const { lang } = useLang();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    lastname: "",
    org: "",
    phone: "",
    email: "",
    address: "",
  });
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const fieldIcons: Record<FieldKey, React.ElementType> = {
    name: FaUser,
    lastname: FaUser,
    org: FaBuilding,
    phone: FaPhone,
    email: FaEnvelope,
    address: FaMapMarkerAlt,
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
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setShowQR(true);
    setIsGenerating(false);
  };

  const handleReset = () => {
    setShowQR(false);
    setFormData({
      name: "",
      lastname: "",
      org: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  // Función para descargar el ticket completo
  const downloadCompleteTicket = async () => {
    if (!ticketRef.current) return;

    setIsDownloading(true);

    try {
      // Crear un canvas para dibujar el ticket
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Configurar dimensiones del canvas (tamaño del ticket)
      const width = 400;
      const height = 600;
      canvas.width = width * 2; // Para alta resolución
      canvas.height = height * 2;
      ctx.scale(2, 2);

      // Fondo azul
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(0, 0, width, height);

      // Configurar texto
      ctx.fillStyle = "white";
      ctx.textAlign = "left";

      // Header - Organización
      ctx.font = "14px Arial";
      ctx.globalAlpha = 0.8;
      ctx.fillText(formData.org || "CONTACT", 32, 60);

      // Initial en círculo (esquina superior derecha)
      ctx.globalAlpha = 1;
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(formData.name?.charAt(0) || "C", 360, 50);

      // Nombre principal
      ctx.textAlign = "left";
      ctx.font = "bold 32px Arial";
      ctx.fillText(formData.name || "Contact", 32, 120);
      ctx.fillText(formData.lastname || "Card", 32, 160);

      // Detalles de contacto
      ctx.font = "14px Arial";
      ctx.globalAlpha = 0.8;
      let yPos = 200;

      if (formData.org) {
        ctx.fillText(`🏢 ${formData.org}`, 32, yPos);
        yPos += 25;
      }
      if (formData.phone) {
        ctx.fillText(`📱 ${formData.phone}`, 32, yPos);
        yPos += 25;
      }
      if (formData.email) {
        ctx.fillText(`✉️ ${formData.email}`, 32, yPos);
        yPos += 25;
      }
      if (formData.address) {
        ctx.fillText(`📍 ${formData.address}`, 32, yPos);
        yPos += 25;
      }

      // Obtener el QR code
      const qrCanvas = qrRef.current?.querySelector("canvas");
      if (qrCanvas) {
        // Fondo blanco para el QR
        ctx.globalAlpha = 1;
        ctx.fillStyle = "white";
        ctx.fillRect(140, 320, 120, 120);

        // Dibujar QR code
        ctx.drawImage(qrCanvas, 150, 330, 100, 100);
      }

      // Footer
      ctx.fillStyle = "white";
      ctx.globalAlpha = 0.8;
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("📱 DIGITAL CONTACT", width / 2, 480);

      // Agujero del keychain (círculo negro)
      ctx.globalAlpha = 1;
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(width / 2, 20, 16, 0, 2 * Math.PI);
      ctx.fill();

      // Descargar la imagen
      const url = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.name || "contact"}-vcard-ticket.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating image:", error);
      // Fallback: descargar solo el QR
      downloadQROnly();
    }

    setIsDownloading(false);
  };

  // Función para descargar solo el QR
  const downloadQROnly = () => {
    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (qrCanvas) {
      const url = qrCanvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.name || "contact"}-qr-code.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.name} ${formData.lastname}\nN:${formData.lastname};${formData.name};;;\nORG:${formData.org}\nTEL;TYPE=WORK,VOICE:${formData.phone}\nEMAIL;TYPE=INTERNET,WORK:${formData.email}\nADR;TYPE=WORK:;;${formData.address};;;;\nEND:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.name || "contact"}-vcard.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full mb-6 animate-spin mx-auto" />
          <h3 className="text-white text-xl font-semibold mb-2">
            {lang === "es" ? "Generando VCard" : "Generating VCard"}
          </h3>
          <p className="text-gray-400">
            {lang === "es"
              ? "Creando tu tarjeta de contacto..."
              : "Creating your contact card..."}
          </p>
        </div>
      </div>
    );
  }

  if (showQR) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => setShowQR(false)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <FaArrowLeft />
            <span>
              {lang === "es" ? "Regresar al formulario" : "Back to form"}
            </span>
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Side - Info */}
            <div className="flex-1">
              <h1 className="text-6xl lg:text-8xl font-bold mb-4 leading-tight">
                {formData.name || "Your"}
              </h1>
              <p className="text-3xl text-white mb-4 font-bold">
                {lang === "es" ? "Tarjeta de Contacto" : "VCard"}
              </p>
              <p className="text-xl text-gray-400 mb-8">
                {lang === "es"
                  ? "Escanea para guardar la información de contacto o descarga tu tarjeta de visita digital."
                  : "Scan to save contact information or download your digital business card."}
              </p>

              <button
                onClick={downloadCompleteTicket}
                disabled={isDownloading}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:via-blue-800 disabled:to-blue-800 text-white px-10 py-5 rounded-xl font-bold text-xl transition-all duration-300 inline-flex items-center gap-4 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative z-10 flex items-center gap-4">
                  {isDownloading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>
                        {lang === "es"
                          ? "GENERANDO TICKET..."
                          : "GENERATING TICKET..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaDownload className="text-2xl" />
                      <span>
                        {lang === "es" ? "DESCARGAR TICKET" : "DOWNLOAD TICKET"}
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Right Side - Card */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                {/* Card */}
                <div
                  ref={ticketRef}
                  className="bg-blue-600 rounded-2xl p-8 w-80 relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-6 right-4 text-5xl">
                      <FaQrcode />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-sm opacity-80 uppercase font-bold">
                        {formData.org ||
                          (lang === "es" ? "CONTACTO" : "CONTACT")}
                      </div>
                      <div className="text-2xl font-bold uppercase">
                        {formData.name?.charAt(0) || "C"}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold leading-tight">
                        {formData.name ||
                          (lang === "es" ? "Contacto" : "Contact")}
                        <br />
                        {formData.lastname || "Card"}
                      </h2>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-3 mb-8 text-sm">
                      {formData.org && (
                        <div className="opacity-80">🏢 {formData.org}</div>
                      )}

                      {formData.phone && (
                        <div className="opacity-80">📱 {formData.phone}</div>
                      )}

                      {formData.email && (
                        <div className="opacity-80 truncate">
                          ✉️ {formData.email}
                        </div>
                      )}

                      {formData.address && (
                        <div className="opacity-80">📍 {formData.address}</div>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-start">
                      <div ref={qrRef} className="bg-white p-3 rounded-lg">
                        <QRCodeCanvas
                          value={`BEGIN:VCARD\nVERSION:3.0\nFN:${formData.name}\nN:${formData.lastname}\nORG:${formData.org}\nTEL;TYPE=WORK,VOICE:${formData.phone}\nEMAIL;INTERNET;WORK:${formData.email}\nADR;TYPE=WORK:;;${formData.address}\nEND:VCARD`}
                          size={120}
                          level="H"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center"></div>
                  </div>

                  {/* Keychain hole effect */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-black rounded-full"></div>
                </div>

                {/* Keychain ring */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-start mt-12">
            <button
              onClick={downloadQROnly}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FaQrcode />
              {lang === "es" ? "Descargar solo QR" : "Download QR Only"}
            </button>
            <button
              onClick={generateVCard}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FaDownload />
              {lang === "es" ? "Descargar VCF" : "Download VCF File"}
            </button>
            <button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FaTrash />
              {lang === "es" ? "Crear nueva tarjeta" : "Create New Card"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FaQrcode className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {lang === "es" ? "Generador de VCard" : "VCard Generator"}
              </h1>
              <p className="text-gray-400">
                {lang === "es" ? "Genera & Comparte" : "Generate & Share"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {(Object.entries(formData) as [FieldKey, string][]).map(([key, value]) => {
            const Icon = fieldIcons[key];
            return (
              <div key={key} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Icon className="text-blue-400 text-lg" />
                  </div>
                  <input
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone"
                        ? "tel"
                        : "text"
                    }
                    name={key}
                    placeholder={fieldLabels[key]}
                    value={value}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/90 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-600 group-hover:bg-gray-800/90"
                    maxLength={key === "phone" ? 10 : undefined}
                  />
                </div>
              </div>
            );
          })}

          <button
            onClick={handleShowQR}
            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transform hover:scale-[1.02] active:scale-[0.98] mt-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="flex items-center justify-center gap-3 relative z-10">
              {lang === "es" ? "Generar VCard" : "Generate VCard"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
