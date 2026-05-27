"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Calendar,
  RefreshCw,
  Loader2,
  CalendarClock,
  CheckCircle,
  XCircle,
  MessageSquare,
  BedDouble,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  X,
  Eye,
  Ban,
  Globe,
  Monitor,
  Pencil,
  Plus,
} from "lucide-react";

const API_BASE_URL = "https://palmasrecovery.com";

// ── interfaces ────────────────────────────────────────────────────────────────

interface Booking {
  id: number;
  confirmation_number: string;
  room_id: string;
  full_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total: number;
  price_per_night: number;
  status: string;
  certified_doctor: string;
  special_requests: string | null;
  extras: string[];
  source?: string;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

// ── constants ─────────────────────────────────────────────────────────────────

const ROOM_NAMES: Record<string, string> = {
  shared: "Shared Room",
  private: "Private Room",
  "large-private": "Large Private Room",
  vip: "VIP Suite",
};

const ROOM_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  private:       { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6", dot: "#3b82f6" },
  shared:        { bg: "rgba(16,185,129,0.1)",  color: "#10b981", dot: "#10b981" },
  "large-private": { bg: "rgba(168,85,247,0.1)", color: "#a855f7", dot: "#a855f7" },
  vip:           { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", dot: "#f59e0b" },
};
const DEFAULT_ROOM_COLOR = { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", dot: "#94a3b8" };

const ROOM_PRICES: Record<string, number> = {
  shared: 170,
  private: 180,
  "large-private": 200,
  vip: 250,
};

const EXTRA_NAMES: Record<string, string> = {
  lymphatic: "Lymphatic Massage",
  "5massages": "5 Lymphatic Massages Package",
  b01g: "Original Recovery Bra B01G",
  fvom: "Open Bust Vest FVOM",
  sfbhrs: "Reinforced Girdle SFBHRS",
  sfbhs2: "Girdle High-Back SFBHS2",
};

const EXTRA_PRICES: Record<string, number> = {
  lymphatic: 60,
  "5massages": 270,
  b01g: 80,
  fvom: 80,
  sfbhrs: 140,
  sfbhs2: 140,
};

type Tab = "calendar" | "bookings" | "contacts";

// ── helpers ───────────────────────────────────────────────────────────────────

function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Used for availability checks — excludes cancelled
function bookingOccupiesDayLocal(booking: Booking, day: Date): boolean {
  if (booking.status === "cancelled") return false;
  const checkIn = parseDateLocal(booking.check_in.slice(0, 10));
  const checkOut = parseDateLocal(booking.check_out.slice(0, 10));
  return day >= checkIn && day < checkOut;
}

// Used for calendar display — includes cancelled
function bookingOnDayLocal(booking: Booking, day: Date): boolean {
  const checkIn = parseDateLocal(booking.check_in.slice(0, 10));
  const checkOut = parseDateLocal(booking.check_out.slice(0, 10));
  return day >= checkIn && day < checkOut;
}


function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
  return days;
}

function dateToInputStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── SourceBadge ───────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source?: string }) {
  const isManual = source === "dashboard";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: isManual ? "rgba(168,85,247,0.12)" : "rgba(14,165,233,0.12)", color: isManual ? "#a855f7" : "#0ea5e9" }}>
      {isManual ? <Monitor size={11} /> : <Globe size={11} />}
      {isManual ? "Manual" : "Sitio web"}
    </span>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  readOnly,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  min?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="ec-field-label" style={{ marginBottom: 4, display: "block" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        min={min}
        className="ec-field-input"
        style={readOnly ? { cursor: "default", opacity: 0.7 } : undefined}
      />
    </div>
  );
}

// ── BookingFormModal ──────────────────────────────────────────────────────────

interface FormData {
  roomId: string;
  fullName: string;
  email: string;
  phone: string;
  certifiedDoctor: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  pricePerNight: string;
  extras: string[];
  specialRequests: string;
  total: string;
  manualTotal: boolean;
}


function BookingFormModal({
  booking,
  defaultDate,
  defaultRoom,
  onClose,
  onSuccess,
}: {
  booking: Booking | null;
  defaultDate?: string;
  defaultRoom?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = booking !== null;

  const [form, setForm] = useState<FormData>(() => {
    if (booking) {
      return {
        roomId: booking.room_id,
        fullName: booking.full_name,
        email: booking.email,
        phone: booking.phone,
        certifiedDoctor: booking.certified_doctor,
        checkIn: booking.check_in.slice(0, 10),
        checkOut: booking.check_out.slice(0, 10),
        guests: String(booking.guests),
        pricePerNight: String(booking.price_per_night),
        extras: Array.isArray(booking.extras) ? booking.extras : [],
        specialRequests: booking.special_requests ?? "",
        total: String(booking.total),
        manualTotal: false,
      };
    }
    return {
      roomId: defaultRoom ?? "",
      fullName: "",
      email: "",
      phone: "",
      certifiedDoctor: "",
      checkIn: defaultDate ?? "",
      checkOut: "",
      guests: "1",
      pricePerNight: "",
      extras: [],
      specialRequests: "",
      total: "",
      manualTotal: false,
    };
  });

  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const todayStr = useMemo(() => dateToInputStr(new Date()), []);

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff =
      parseDateLocal(form.checkOut).getTime() -
      parseDateLocal(form.checkIn).getTime();
    return Math.max(0, Math.round(diff / 86400000));
  }, [form.checkIn, form.checkOut]);

  const baseTotal = useMemo(() => {
    const extTotal = form.extras.reduce((s, e) => s + (EXTRA_PRICES[e] ?? 0), 0);
    return nights * Number(form.pricePerNight || 0) + extTotal;
  }, [nights, form.pricePerNight, form.extras]);

  const discountAmount = useMemo(() => {
    if (!promoApplied) return 0;
    if (promoApplied.discount_type === "percentage") {
      return Math.round(baseTotal * promoApplied.discount_value / 100);
    }
    return Math.min(promoApplied.discount_value, baseTotal);
  }, [promoApplied, baseTotal]);

  const autoTotal = useMemo(() => baseTotal - discountAmount, [baseTotal, discountAmount]);

  useEffect(() => {
    if (!form.manualTotal) {
      setForm((f) => ({ ...f, total: String(autoTotal) }));
    }
  }, [autoTotal, form.manualTotal]);


  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      if (!data.valid) {
        setPromoError(data.reason ?? "Código inválido");
        return;
      }
      setPromoApplied({
        code: promoCode.trim().toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
      });
      setPromoCode("");
      setPromoError("");
      setForm((f) => ({ ...f, manualTotal: false }));
    } catch {
      setPromoError("Error al validar el código");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoApplied(null);
    setForm((f) => ({ ...f, manualTotal: false }));
  };

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleExtra = (id: string) =>
    setForm((f) => ({
      ...f,
      extras: f.extras.includes(id)
        ? f.extras.filter((e) => e !== id)
        : [...f.extras, id],
      manualTotal: false,
    }));

  const extrasTotal = form.extras.reduce((s, e) => s + (EXTRA_PRICES[e] ?? 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.roomId ||
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.certifiedDoctor ||
      !form.checkIn ||
      !form.checkOut
    ) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    if (nights <= 0) {
      toast.error("La fecha de salida debe ser posterior a la de entrada");
      return;
    }
    if (!isEdit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parseDateLocal(form.checkIn) < today) {
        toast.error("No puedes crear una reserva con fecha anterior a hoy");
        return;
      }
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${booking!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: form.roomId,
            check_in: form.checkIn,
            check_out: form.checkOut,
            nights,
            guests: Number(form.guests),
            full_name: form.fullName,
            email: form.email,
            phone: form.phone,
            certified_doctor: form.certifiedDoctor,
            special_requests: form.specialRequests || null,
            extras: form.extras,
            total: Number(form.total),
            price_per_night: Number(form.pricePerNight),
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Error al editar");
        }
        toast.success("Reserva actualizada");
      } else {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: form.roomId,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            nights,
            guests: Number(form.guests),
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            certifiedDoctor: form.certifiedDoctor,
            specialRequests: form.specialRequests || null,
            extras: form.extras,
            total: Number(form.total),
            pricePerNight: Number(form.pricePerNight),
            source: "dashboard",
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Error al crear");
        }
        toast.success("Reserva creada exitosamente");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", padding: 16 }}
      onClick={onClose}
    >
      <div
        className="ec-project-card"
        style={{ borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--ec-border)", position: "sticky", top: 0, background: "var(--ec-surface-1)", zIndex: 10, borderRadius: "16px 16px 0 0" }}>
          <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>
            {isEdit ? "Editar Reserva" : "Nueva Reserva"}
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--ec-text-dim)" }}
            className="hover:bg-[var(--ec-surface-2)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Room */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Habitación *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(ROOM_NAMES).map(([id, name]) => {
                const rc = ROOM_COLORS[id] ?? DEFAULT_ROOM_COLOR;
                const isSelected = form.roomId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setField("roomId", id); if (!isEdit) setForm((f) => ({ ...f, roomId: id, pricePerNight: String(ROOM_PRICES[id] ?? ""), manualTotal: false })); }}
                    style={{ padding: "10px 8px", borderRadius: 10, border: `2px solid ${isSelected ? rc.color : "var(--ec-border)"}`, background: isSelected ? rc.bg : "transparent", color: isSelected ? rc.color : "var(--ec-text-muted)", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 140ms", textAlign: "center" }}
                  >{name}</button>
                );
              })}
            </div>
          </div>

          {/* Guest info */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Datos del huésped</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Nombre completo *"
                value={form.fullName}
                onChange={(v) => setField("fullName", v)}
                placeholder="Jane Doe"
              />
              <FormField
                label="Email *"
                type="email"
                value={form.email}
                onChange={(v) => setField("email", v)}
                placeholder="jane@email.com"
              />
              <FormField
                label="Teléfono *"
                value={form.phone}
                onChange={(v) => setField("phone", v)}
                placeholder="+1 (619) 000-0000"
              />
              <FormField
                label="Cirujano certificado *"
                value={form.certifiedDoctor}
                onChange={(v) => setField("certifiedDoctor", v)}
                placeholder="Dr. García"
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Fechas *</label>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                label="Check-in"
                type="date"
                value={form.checkIn}
                onChange={(v) => setField("checkIn", v)}
                min={!isEdit ? todayStr : undefined}
              />
              <FormField
                label="Check-out"
                type="date"
                value={form.checkOut}
                onChange={(v) => setField("checkOut", v)}
                min={form.checkIn || (!isEdit ? todayStr : undefined)}
              />
              <FormField
                label="Noches (auto)"
                value={nights > 0 ? String(nights) : ""}
                readOnly
                placeholder="—"
              />
            </div>

          </div>

          {/* Pricing */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Precios</label>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Huéspedes" type="number" min="1" value={form.guests} onChange={(v) => setField("guests", v)} />
              <FormField label="Precio / noche ($)" type="number" min="0" value={form.pricePerNight} onChange={(v) => { setField("pricePerNight", v); setField("manualTotal", false); }} placeholder="0" />
              <div>
                <label className="ec-field-label" style={{ marginBottom: 4, display: "block" }}>
                  Total ($) {!form.manualTotal && <span style={{ fontWeight: 400, opacity: 0.6 }}>(auto)</span>}
                </label>
                <input type="number" min="0" value={form.total} onChange={(e) => setForm((f) => ({ ...f, total: e.target.value, manualTotal: true }))} className="ec-field-input" />
              </div>
            </div>
          </div>

          {/* Extras */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Extras</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(EXTRA_NAMES).map(([id, name]) => {
                const checked = form.extras.includes(id);
                return (
                  <label key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, border: `1px solid ${checked ? "rgba(245,158,11,0.4)" : "var(--ec-border)"}`, background: checked ? "rgba(245,158,11,0.07)" : "transparent", cursor: "pointer", transition: "all 140ms" }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleExtra(id)} style={{ width: 16, height: 16, accentColor: "#f59e0b", cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--ec-text)", flex: 1, lineHeight: 1.3 }}>{name}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ec-text-dim)", flexShrink: 0 }}>${EXTRA_PRICES[id]}</span>
                  </label>
                );
              })}
            </div>
            {form.extras.length > 0 && (
              <p style={{ fontSize: 12, color: "var(--ec-text-dim)", marginTop: 6 }}>Subtotal extras: <strong style={{ color: "var(--ec-text)" }}>${extrasTotal}</strong></p>
            )}
          </div>

          {/* Promo code */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 8, display: "block" }}>Código promocional</label>
            {promoApplied ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <CheckCircle size={14} style={{ color: "#10b981", flexShrink: 0 }} />
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: "#10b981" }}>{promoApplied.code}</span>
                  <span style={{ color: "#10b981" }}>— {promoApplied.discount_type === "percentage" ? `${promoApplied.discount_value}% de descuento` : `$${promoApplied.discount_value} de descuento`}</span>
                </div>
                <button type="button" onClick={removePromo} style={{ padding: 4, background: "none", border: "none", cursor: "pointer", color: "#10b981", display: "flex" }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())} placeholder="CÓDIGO" className="ec-field-input" style={{ flex: 1, fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase" }} />
                <button type="button" onClick={applyPromo} disabled={!promoCode.trim() || promoLoading} className="ec-btn-secondary" style={{ padding: "8px 16px", opacity: !promoCode.trim() || promoLoading ? 0.5 : 1 }}>
                  {promoLoading && <Loader2 size={13} className="animate-spin" />}
                  Aplicar
                </button>
              </div>
            )}
            {promoError && (
              <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#ef4444", marginTop: 6 }}>
                <XCircle size={12} style={{ flexShrink: 0 }} /> {promoError}
              </p>
            )}
            {promoApplied && discountAmount > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--ec-hairline)", display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ec-text-muted)" }}><span>Subtotal</span><span>${baseTotal}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981" }}><span>Descuento ({promoApplied.discount_type === "percentage" ? `${promoApplied.discount_value}%` : `$${promoApplied.discount_value}`})</span><span>-${discountAmount}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--ec-text)", paddingTop: 4, borderTop: "1px solid var(--ec-hairline)" }}><span>Total con descuento</span><span>${autoTotal}</span></div>
              </div>
            )}
          </div>

          {/* Special requests */}
          <div>
            <label className="ec-field-label" style={{ marginBottom: 4, display: "block" }}>Solicitudes especiales</label>
            <textarea value={form.specialRequests} onChange={(e) => setField("specialRequests", e.target.value)} rows={2} placeholder="Requerimientos especiales..." className="ec-field-input" style={{ resize: "none" }} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid var(--ec-hairline)" }}>
            <button type="button" onClick={onClose} className="ec-btn-secondary" style={{ padding: "8px 16px" }}>Cancelar</button>
            <button type="submit" disabled={submitting} className="ec-btn-primary" style={{ padding: "8px 20px", opacity: submitting ? 0.7 : 1 }}>
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── BookingDetailModal ────────────────────────────────────────────────────────

function BookingDetailModal({
  booking,
  onClose,
  onCancel,
  onEdit,
}: {
  booking: Booking;
  onClose: () => void;
  onCancel: (id: number) => void;
  onEdit: (booking: Booking) => void;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  };

  const extrasTotal = booking.extras.reduce((s, e) => s + (EXTRA_PRICES[e] ?? 0), 0);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", padding: 16 }}
      onClick={onClose}
    >
      <div
        className="ec-project-card"
        style={{ borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--ec-border)" }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--ec-text-dim)", fontFamily: "var(--font-jetbrains-mono, monospace)", marginBottom: 2 }}>
              #{booking.confirmation_number}
            </p>
            <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>
              {booking.full_name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === "confirmed" && (
              <>
                <button
                  onClick={() => onEdit(booking)}
                  className="ec-btn-secondary"
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="ec-btn-danger"
                  style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                >
                  {cancelling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Ban className="h-3.5 w-3.5" />
                  )}
                  Cancelar
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--ec-text-dim)" }}
              className="hover:bg-[var(--ec-surface-2)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {booking.status === "confirmed" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                <CheckCircle className="h-3 w-3" /> Confirmada
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                <XCircle className="h-3 w-3" /> Cancelada
              </span>
            )}
            {(() => { const rc = ROOM_COLORS[booking.room_id] ?? DEFAULT_ROOM_COLOR; return (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: rc.bg, color: rc.color }}>
                <BedDouble className="h-3 w-3" />
                {ROOM_NAMES[booking.room_id] ?? booking.room_id}
              </span>
            ); })()}
            <SourceBadge source={booking.source} />
          </div>

          <div className="space-y-2">
            <DetailRow label="Email" value={booking.email} />
            <DetailRow label="Teléfono" value={booking.phone} />
            <DetailRow label="Cirujano" value={booking.certified_doctor} />
            {booking.special_requests && (
              <DetailRow label="Solicitudes" value={booking.special_requests} />
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: 12, background: "var(--ec-surface-2)", borderRadius: 12 }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--ec-text-dim)", marginBottom: 2 }}>Check-in</p>
              <p style={{ fontWeight: 600, color: "var(--ec-text)", fontSize: 14 }}>
                {parseDateLocal(booking.check_in.slice(0, 10)).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--ec-border)", borderRight: "1px solid var(--ec-border)" }}>
              <p style={{ fontSize: 11, color: "var(--ec-text-dim)", marginBottom: 2 }}>Noches</p>
              <p style={{ fontWeight: 600, color: "var(--ec-text)", fontSize: 14 }}>
                {booking.nights}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "var(--ec-text-dim)", marginBottom: 2 }}>Check-out</p>
              <p style={{ fontWeight: 600, color: "var(--ec-text)", fontSize: 14 }}>
                {parseDateLocal(booking.check_out.slice(0, 10)).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {booking.extras.length > 0 && (
            <div>
              <p className="h-eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Extras</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {booking.extras.map((e) => (
                  <div key={e} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--ec-surface-2)", borderRadius: 8, fontSize: 13 }}>
                    <span style={{ color: "var(--ec-text-muted)" }}>{EXTRA_NAMES[e] ?? e}</span>
                    <span style={{ fontWeight: 500, color: "var(--ec-text)" }}>${EXTRA_PRICES[e] ?? 0}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "var(--ec-text)" }}>
                  <span>Subtotal extras</span><span>${extrasTotal}</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12 }}>
            <span style={{ fontWeight: 600, color: "#f59e0b" }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b" }}>${booking.total} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
      <span style={{ color: "var(--ec-text-muted)", minWidth: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "var(--ec-text)", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

// ── CalendarView ──────────────────────────────────────────────────────────────

function CalendarView({
  bookings,
  onCreateForDay,
}: {
  bookings: Booking[];
  onCreateForDay: (dateStr: string, roomId?: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>(""); // "" = all rooms

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  };

  // Confirmed rooms on a day (for availability coloring)
  const confirmedRoomsOnDay = (day: Date): string[] =>
    bookings.filter((b) => bookingOccupiesDayLocal(b, day)).map((b) => b.room_id);

  // Cancelled rooms on a day (for gray dots)
  const cancelledRoomsOnDay = (day: Date): string[] =>
    bookings
      .filter((b) => b.status === "cancelled" && bookingOnDayLocal(b, day))
      .map((b) => b.room_id);

  // Is a specific room booked (confirmed only — for availability)
  const isRoomBooked = (roomId: string, day: Date): boolean =>
    bookings.some((b) => b.room_id === roomId && bookingOccupiesDayLocal(b, day));

  // Are ALL rooms booked (confirmed only)
  const isFullyBooked = (day: Date): boolean =>
    Object.keys(ROOM_NAMES).every((rid) => isRoomBooked(rid, day));

  // All bookings (confirmed + cancelled) for the side panel
  const bookingsForSelected = selectedDay
    ? bookings.filter((b) => bookingOnDayLocal(b, selectedDay))
    : [];

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelected = (d: Date) =>
    selectedDay !== null &&
    d.getDate() === selectedDay.getDate() &&
    d.getMonth() === selectedDay.getMonth() &&
    d.getFullYear() === selectedDay.getFullYear();

  // Day cell inline style based on filter
  const dayCellStyle = (day: Date, selected: boolean, todayMark: boolean): React.CSSProperties => {
    const base: React.CSSProperties = { position: "relative", borderRadius: 8, padding: 4, minHeight: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "background 140ms", width: "100%", border: "none", cursor: "pointer" };
    if (selected) return { ...base, background: "rgba(245,158,11,0.15)", outline: `2px solid #f59e0b` };
    if (roomFilter) {
      const booked = isRoomBooked(roomFilter, day);
      if (booked) return { ...base, background: todayMark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.07)" };
      return { ...base, background: todayMark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.05)" };
    }
    const fully = isFullyBooked(day);
    if (fully) return { ...base, background: "rgba(239,68,68,0.06)" };
    return { ...base, background: "transparent" };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* calendar grid */}
      <div className="lg:col-span-2 ec-project-card" style={{ padding: "16px 20px", borderRadius: 14 }}>
        {/* month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            onClick={prevMonth}
            style={{ padding: "6px 8px", borderRadius: 8, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", cursor: "pointer", display: "flex" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="font-serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--ec-text)", textTransform: "capitalize" }}>{monthName}</h3>
          <button
            onClick={nextMonth}
            style={{ padding: "6px 8px", borderRadius: 8, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", cursor: "pointer", display: "flex" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* room filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--ec-hairline)" }}>
          <button onClick={() => setRoomFilter("")} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 140ms", background: roomFilter === "" ? "var(--ec-brand)" : "var(--ec-surface-2)", color: roomFilter === "" ? "white" : "var(--ec-text-muted)", border: "1px solid var(--ec-border)" }}>Todas</button>
          {Object.entries(ROOM_NAMES).map(([id, name]) => {
            const rc = ROOM_COLORS[id] ?? DEFAULT_ROOM_COLOR;
            const active = roomFilter === id;
            return <button key={id} onClick={() => setRoomFilter(roomFilter === id ? "" : id)} style={{ padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 140ms", background: active ? rc.bg : "var(--ec-surface-2)", color: active ? rc.color : "var(--ec-text-muted)", border: `1px solid ${active ? rc.color : "var(--ec-border)"}` }}>{name}</button>;
          })}
        </div>

        {/* availability legend when filter active */}
        {roomFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, fontSize: 12, color: "var(--ec-text-dim)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 4, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "inline-block" }} />Ocupado</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 4, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", display: "inline-block" }} />Disponible</div>
          </div>
        )}

        {/* weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 4 }}>
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 500, color: "var(--ec-text-dim)", padding: "4px 0", fontFamily: "JetBrains Mono, monospace" }}>{d}</div>
          ))}
        </div>

        {/* day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const confirmedRooms = confirmedRoomsOnDay(day);
            const cancelledRooms = cancelledRoomsOnDay(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);
            const bookedByFilter = roomFilter ? isRoomBooked(roomFilter, day) : false;
            return (
              <button key={day.toISOString()} onClick={() => setSelectedDay(selected ? null : day)} style={dayCellStyle(day, selected, todayMark)}>
                <span style={{ fontSize: 12, fontWeight: 500, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: todayMark ? "#f59e0b" : "transparent", color: todayMark ? "white" : "var(--ec-text)" }}>{day.getDate()}</span>
                {!roomFilter && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                    {[...new Set(confirmedRooms)].map((roomId) => <span key={roomId} style={{ width: 6, height: 6, borderRadius: "50%", background: (ROOM_COLORS[roomId] ?? DEFAULT_ROOM_COLOR).dot, display: "inline-block" }} title={ROOM_NAMES[roomId] ?? roomId} />)}
                    {[...new Set(cancelledRooms)].map((roomId) => <span key={`c-${roomId}`} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ec-text-dim)", display: "inline-block", opacity: 0.4 }} title={`${ROOM_NAMES[roomId] ?? roomId} (cancelada)`} />)}
                  </div>
                )}
                {roomFilter && <span style={{ fontSize: 9, marginTop: 2, color: bookedByFilter ? "#ef4444" : "#10b981" }}>{bookedByFilter ? "✕" : "✓"}</span>}
              </button>
            );
          })}
        </div>

        {/* legend */}
        {!roomFilter && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ec-hairline)", display: "flex", flexWrap: "wrap", gap: 10 }}>
            {Object.entries(ROOM_NAMES).map(([id, name]) => {
              const rc = ROOM_COLORS[id] ?? DEFAULT_ROOM_COLOR;
              return <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ec-text-dim)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: rc.dot, display: "inline-block" }} />{name}</div>;
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ec-text-dim)" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ec-text-dim)", opacity: 0.4, display: "inline-block" }} />Cancelada</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ec-text-dim)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(239,68,68,0.3)", display: "inline-block" }} />Todo ocupado</div>
          </div>
        )}
      </div>

      {/* side panel */}
      <div className="ec-project-card" style={{ padding: "16px 18px", borderRadius: 14 }}>
        {selectedDay ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ec-text)", textTransform: "capitalize" }}>
                {selectedDay.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              {selectedDay >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                <button onClick={() => onCreateForDay(dateToInputStr(selectedDay), roomFilter || undefined)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, background: "#f59e0b", color: "white", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", flexShrink: 0 }}>
                  <Plus size={12} />Nueva
                </button>
              )}
            </div>

            {roomFilter && (
              <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, background: isRoomBooked(roomFilter, selectedDay) ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${isRoomBooked(roomFilter, selectedDay) ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, color: isRoomBooked(roomFilter, selectedDay) ? "#ef4444" : "#10b981" }}>
                {isRoomBooked(roomFilter, selectedDay) ? <><XCircle size={13} style={{ flexShrink: 0 }} />{ROOM_NAMES[roomFilter]} — Ocupado</> : <><CheckCircle size={13} style={{ flexShrink: 0 }} />{ROOM_NAMES[roomFilter]} — Disponible</>}
              </div>
            )}

            {bookingsForSelected.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>Sin reservas este día.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bookingsForSelected.map((b) => {
                  const isCancelled = b.status === "cancelled";
                  const rc = ROOM_COLORS[b.room_id] ?? DEFAULT_ROOM_COLOR;
                  return (
                    <div key={b.id} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--ec-border)", background: isCancelled ? "var(--ec-surface-1)" : rc.bg, opacity: isCancelled ? 0.7 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: isCancelled ? "var(--ec-text-dim)" : rc.color }}>{ROOM_NAMES[b.room_id] ?? b.room_id}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {isCancelled && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}><XCircle size={10} />Cancelada</span>}
                          <SourceBadge source={b.source} />
                        </div>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ec-text)", textDecoration: isCancelled ? "line-through" : "none" }}>{b.full_name}</p>
                      <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>
                        {parseDateLocal(b.check_in.slice(0, 10)).toLocaleDateString("es-MX", { day: "numeric", month: "short" })} → {parseDateLocal(b.check_out.slice(0, 10)).toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · {b.nights}n
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 160, textAlign: "center", gap: 8 }}>
            <Calendar size={32} style={{ color: "var(--ec-text-dim)" }} />
            <p style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>Selecciona un día para ver las reservas</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── StatCard / EmptyState ─────────────────────────────────────────────────────

function StatCard({
  icon,
  iconStyle,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconStyle: React.CSSProperties;
  label: string;
  value: string | number;
}) {
  return (
    <div className="ec-project-card" style={{ padding: "14px 18px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ padding: 8, borderRadius: 8, flexShrink: 0, ...iconStyle }}>{icon}</div>
      <div>
        <p className="h-eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>{label}</p>
        <p className="font-serif" style={{ fontSize: 26, color: "var(--ec-text)" }}>{value}</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ padding: 16, background: "var(--ec-surface-2)", borderRadius: "50%", width: 64, height: 64, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 500, color: "var(--ec-text)", marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--ec-text-dim)" }}>{desc}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CalendarioPalmasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("calendar");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>();
  const [createDefaultRoom, setCreateDefaultRoom] = useState<string | undefined>();

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar las reservas");
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar los contactos");
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchContacts();
  }, [fetchBookings, fetchContacts]);

  const handleCancelBooking = async (id: number) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: booking.email }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reserva cancelada");
      setSelectedBooking(null);
      fetchBookings();
    } catch {
      toast.error("Error al cancelar la reserva");
    }
  };

  const handleOpenEdit = (booking: Booking) => {
    setSelectedBooking(null);
    setEditingBooking(booking);
  };

  const handleCreateForDay = (dateStr: string, roomId?: string) => {
    setCreateDefaultDate(dateStr);
    setCreateDefaultRoom(roomId);
    setShowCreateModal(true);
  };

  const closeFormModal = () => {
    setShowCreateModal(false);
    setEditingBooking(null);
    setCreateDefaultDate(undefined);
    setCreateDefaultRoom(undefined);
  };

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalRevenue = confirmedBookings.reduce((s, b) => s + Number(b.total), 0);

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
          <CheckCircle className="h-3 w-3" /> Confirmada
        </span>
      );
    }
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500, background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
        <XCircle className="h-3 w-3" /> Cancelada
      </span>
    );
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "calendar", label: "Calendario" },
    { id: "bookings", label: "Reservas", count: loadingBookings ? undefined : bookings.length },
    { id: "contacts", label: "Contactos", count: loadingContacts ? undefined : contacts.length },
  ];

  return (
    <div className="fade-in-up" style={{ padding: "28px 24px" }}>
      <Toaster />

      {/* Detail modal */}
      {selectedBooking && !editingBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancelBooking}
          onEdit={handleOpenEdit}
        />
      )}

      {/* Create / Edit form modal */}
      {(showCreateModal || editingBooking) && (
        <BookingFormModal
          booking={editingBooking}
          defaultDate={createDefaultDate}
          defaultRoom={createDefaultRoom}
          onClose={closeFormModal}
          onSuccess={() => fetchBookings()}
        />
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="h-eyebrow" style={{ marginBottom: 6 }}>⎯⎯⎯  PALMAS RECOVERY</div>
            <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.025em", color: "var(--ec-text)", marginBottom: 6 }}>
              Calendario Palmas
            </h1>
            <p style={{ color: "var(--ec-text-dim)", fontSize: 13 }}>
              Panel de reservas y contactos · Palmas Recovery
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, background: "#F59E0B", color: "white", fontSize: 14, fontWeight: 600, border: 0, cursor: "pointer" }}
            >
              <Plus className="h-4 w-4" />
              Nueva Reserva
            </button>
            <button
              onClick={() => { fetchBookings(); fetchContacts(); }}
              style={{ padding: "8px", borderRadius: 10, border: "1px solid var(--ec-border)", background: "var(--ec-surface-2)", color: "var(--ec-text)", cursor: "pointer", display: "flex", alignItems: "center" }}
              title="Refrescar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BedDouble className="h-5 w-5" />}
            iconStyle={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}
            label="Total Reservas"
            value={loadingBookings ? "—" : bookings.length}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            iconStyle={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
            label="Confirmadas"
            value={loadingBookings ? "—" : confirmedBookings.length}
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            iconStyle={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
            label="Ingresos"
            value={loadingBookings ? "—" : `$${totalRevenue.toLocaleString()}`}
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5" />}
            iconStyle={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
            label="Contactos"
            value={loadingContacts ? "—" : contacts.length}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--ec-surface-2)", borderRadius: 10, padding: 4, width: "fit-content", flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: "pointer", border: 0, transition: "all 0.15s",
                background: activeTab === t.id ? "var(--ec-surface-0)" : "transparent",
                color: activeTab === t.id ? "var(--ec-text)" : "var(--ec-text-dim)",
                boxShadow: activeTab === t.id ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {t.label}
              {t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        {/* Calendar tab */}
        {activeTab === "calendar" &&
          (loadingBookings ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <CalendarView bookings={bookings} onCreateForDay={handleCreateForDay} />
          ))}

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden" }}>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={<BedDouble className="h-8 w-8 text-gray-400" />}
                title="Sin reservas"
                desc="Todavía no hay reservas registradas."
              />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--ec-hairline)", background: "var(--ec-surface-1)" }}>
                      {["Confirmación","Huésped","Habitación","Check-in","Check-out","Noches","Total","Estado","Origen",""].map((h, i) => (
                        <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ec-text-dim)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const rc = ROOM_COLORS[booking.room_id] ?? DEFAULT_ROOM_COLOR;
                      return (
                        <tr key={booking.id} style={{ borderBottom: "1px solid var(--ec-hairline)" }}>
                          <td style={{ padding: "10px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--ec-text-dim)" }}>#{booking.confirmation_number}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ fontWeight: 500, color: "var(--ec-text)" }}>{booking.full_name}</div>
                            <div style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>{booking.email}</div>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: rc.bg, color: rc.color }}>{ROOM_NAMES[booking.room_id] ?? booking.room_id}</span>
                          </td>
                          <td style={{ padding: "10px 16px", color: "var(--ec-text-muted)", whiteSpace: "nowrap" }}>{parseDateLocal(booking.check_in.slice(0, 10)).toLocaleDateString("es-MX")}</td>
                          <td style={{ padding: "10px 16px", color: "var(--ec-text-muted)", whiteSpace: "nowrap" }}>{parseDateLocal(booking.check_out.slice(0, 10)).toLocaleDateString("es-MX")}</td>
                          <td style={{ padding: "10px 16px", textAlign: "center", color: "var(--ec-text-muted)" }}>{booking.nights}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 600, color: "var(--ec-text)" }}>${booking.total}</td>
                          <td style={{ padding: "10px 16px" }}>{getStatusBadge(booking.status)}</td>
                          <td style={{ padding: "10px 16px" }}><SourceBadge source={booking.source} /></td>
                          <td style={{ padding: "10px 16px" }}>
                            <button onClick={() => setSelectedBooking(booking)} style={{ padding: "5px 6px", borderRadius: 6, background: "none", border: "none", cursor: "pointer", color: "var(--ec-text-dim)", display: "flex" }} title="Ver detalle"><Eye size={15} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contacts tab */}
        {activeTab === "contacts" && (
          <div className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden" }}>
            {loadingContacts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : contacts.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="h-8 w-8 text-gray-400" />}
                title="Sin contactos"
                desc="Todavía no hay mensajes de contacto registrados."
              />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--ec-hairline)", background: "var(--ec-surface-1)" }}>
                      {["Nombre","Contacto","Mensaje","Fecha"].map((h, i) => (
                        <th key={i} style={{ textAlign: "left", padding: "10px 16px", fontFamily: "JetBrains Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ec-text-dim)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact.id} style={{ borderBottom: "1px solid var(--ec-hairline)" }}>
                        <td style={{ padding: "10px 16px", fontWeight: 500, color: "var(--ec-text)" }}>{contact.name}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ec-text-muted)" }}><Mail size={11} style={{ flexShrink: 0 }} />{contact.email}</div>
                          {contact.phone && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ec-text-dim)", marginTop: 2 }}><Phone size={11} style={{ flexShrink: 0 }} />{contact.phone}</div>}
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--ec-text-muted)", maxWidth: 280 }}>
                          <p style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{contact.message}</p>
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--ec-text-dim)", whiteSpace: "nowrap", fontSize: 12 }}>
                          {new Date(contact.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
