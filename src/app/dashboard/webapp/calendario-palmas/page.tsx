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

const ROOM_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  private: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  shared: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  "large-private": {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  vip: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
};

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
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isManual
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
      }`}
    >
      {isManual ? <Monitor className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
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
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        min={min}
        className={`w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
          readOnly
            ? "bg-gray-50 dark:bg-gray-800/50 cursor-default"
            : "bg-white dark:bg-gray-800"
        }`}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? "Editar Reserva" : "Nueva Reserva"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Room */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Habitación *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(ROOM_NAMES).map(([id, name]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setField("roomId", id);
                    if (!isEdit) {
                      setForm((f) => ({
                        ...f,
                        roomId: id,
                        pricePerNight: String(ROOM_PRICES[id] ?? ""),
                        manualTotal: false,
                      }));
                    }
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-colors text-center ${
                    form.roomId === id
                      ? `${ROOM_COLORS[id].bg} ${ROOM_COLORS[id].text} border-current`
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Guest info */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Datos del huésped
            </label>
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Fechas *
            </label>
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Precios
            </label>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                label="Huéspedes"
                type="number"
                min="1"
                value={form.guests}
                onChange={(v) => setField("guests", v)}
              />
              <FormField
                label="Precio / noche ($)"
                type="number"
                min="0"
                value={form.pricePerNight}
                onChange={(v) => {
                  setField("pricePerNight", v);
                  setField("manualTotal", false);
                }}
                placeholder="0"
              />
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total ($){" "}
                  {!form.manualTotal && (
                    <span className="text-gray-400 font-normal">(auto)</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.total}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, total: e.target.value, manualTotal: true }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Extras */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Extras
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(EXTRA_NAMES).map(([id, name]) => (
                <label
                  key={id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    form.extras.includes(id)
                      ? "bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.extras.includes(id)}
                    onChange={() => toggleExtra(id)}
                    className="rounded border-gray-300 accent-amber-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-tight">
                    {name}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
                    ${EXTRA_PRICES[id]}
                  </span>
                </label>
              ))}
            </div>
            {form.extras.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 pl-1">
                Subtotal extras:{" "}
                <strong className="text-gray-700 dark:text-gray-300">${extrasTotal}</strong>
              </p>
            )}
          </div>

          {/* Promo code */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Código promocional
            </label>
            {promoApplied ? (
              <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {promoApplied.code}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    —{" "}
                    {promoApplied.discount_type === "percentage"
                      ? `${promoApplied.discount_value}% de descuento`
                      : `$${promoApplied.discount_value} de descuento`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removePromo}
                  className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                  placeholder="CÓDIGO"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={!promoCode.trim() || promoLoading}
                  className="px-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300 text-white dark:text-gray-900 text-sm font-medium disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                >
                  {promoLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Aplicar
                </button>
              </div>
            )}
            {promoError && (
              <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1.5">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                {promoError}
              </p>
            )}
            {/* Discount breakdown */}
            {promoApplied && discountAmount > 0 && (
              <div className="mt-2 space-y-1 px-1 text-sm border-t border-gray-100 dark:border-gray-800 pt-2">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${baseTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>
                    Descuento (
                    {promoApplied.discount_type === "percentage"
                      ? `${promoApplied.discount_value}%`
                      : `$${promoApplied.discount_value}`}
                    )
                  </span>
                  <span>-${discountAmount}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Total con descuento</span>
                  <span>${autoTotal}</span>
                </div>
              </div>
            )}
          </div>

          {/* Special requests */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Solicitudes especiales
            </label>
            <textarea
              value={form.specialRequests}
              onChange={(e) => setField("specialRequests", e.target.value)}
              rows={2}
              placeholder="Requerimientos especiales..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              #{booking.confirmation_number}
            </p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {booking.full_name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === "confirmed" && (
              <>
                <button
                  onClick={() => onEdit(booking)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
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
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {booking.status === "confirmed" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" /> Confirmada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="h-3 w-3" /> Cancelada
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROOM_COLORS[booking.room_id]?.bg ?? "bg-gray-100"} ${ROOM_COLORS[booking.room_id]?.text ?? "text-gray-600"}`}
            >
              <BedDouble className="h-3 w-3" />
              {ROOM_NAMES[booking.room_id] ?? booking.room_id}
            </span>
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

          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Check-in</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {parseDateLocal(booking.check_in.slice(0, 10)).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div className="text-center border-x border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Noches</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {booking.nights}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Check-out</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {parseDateLocal(booking.check_out.slice(0, 10)).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>

          {booking.extras.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Extras
              </p>
              <div className="space-y-1.5">
                {booking.extras.map((e) => (
                  <div
                    key={e}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{EXTRA_NAMES[e] ?? e}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${EXTRA_PRICES[e] ?? 0}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>Subtotal extras</span>
                  <span>${extrasTotal}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <span className="font-semibold text-amber-800 dark:text-amber-300">Total</span>
            <span className="text-xl font-bold text-amber-800 dark:text-amber-300">
              ${booking.total} USD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400 min-w-[90px] shrink-0">{label}</span>
      <span className="text-gray-900 dark:text-white break-all">{value}</span>
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

  // Day cell background based on filter
  const dayCellClass = (day: Date, selected: boolean, todayMark: boolean): string => {
    const base = "relative rounded-lg p-1 min-h-[52px] flex flex-col items-center gap-0.5 transition-colors w-full";

    if (selected) {
      return `${base} bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-500${todayMark ? " ring-offset-1" : ""}`;
    }

    if (roomFilter) {
      const booked = isRoomBooked(roomFilter, day);
      if (booked) {
        return `${base} bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30${todayMark ? " ring-1 ring-red-400" : ""}`;
      }
      return `${base} bg-emerald-50/60 dark:bg-emerald-900/10 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20${todayMark ? " ring-1 ring-emerald-400" : ""}`;
    }

    // No filter: show red tint only if ALL rooms fully booked
    const fully = isFullyBooked(day);
    if (fully) {
      return `${base} bg-red-50/70 dark:bg-red-900/10 hover:bg-red-100/70 dark:hover:bg-red-900/20${todayMark ? " ring-1 ring-gray-400" : ""}`;
    }
    return `${base} hover:bg-gray-50 dark:hover:bg-gray-800${todayMark ? " ring-1 ring-gray-400 dark:ring-gray-500" : ""}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* calendar grid */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        {/* month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{monthName}</h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* room filter */}
        <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setRoomFilter("")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              roomFilter === ""
                ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Todas
          </button>
          {Object.entries(ROOM_NAMES).map(([id, name]) => (
            <button
              key={id}
              onClick={() => setRoomFilter(roomFilter === id ? "" : id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                roomFilter === id
                  ? `${ROOM_COLORS[id].bg} ${ROOM_COLORS[id].text}`
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* availability legend when filter active */}
        {roomFilter && (
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800" />
              Ocupado
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100/60 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" />
              Disponible
            </div>
          </div>
        )}

        {/* weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const confirmedRooms = confirmedRoomsOnDay(day);
            const cancelledRooms = cancelledRoomsOnDay(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);
            const bookedByFilter = roomFilter ? isRoomBooked(roomFilter, day) : false;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(selected ? null : day)}
                className={dayCellClass(day, selected, todayMark)}
              >
                <span
                  className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                    todayMark
                      ? "bg-amber-500 text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {day.getDate()}
                </span>

                {/* dots — hide when filter active, replaced by background color */}
                {!roomFilter && (
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {[...new Set(confirmedRooms)].map((roomId) => (
                      <span
                        key={roomId}
                        className={`w-2 h-2 rounded-full ${ROOM_COLORS[roomId]?.dot ?? "bg-gray-400"}`}
                        title={ROOM_NAMES[roomId] ?? roomId}
                      />
                    ))}
                    {[...new Set(cancelledRooms)].map((roomId) => (
                      <span
                        key={`c-${roomId}`}
                        className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"
                        title={`${ROOM_NAMES[roomId] ?? roomId} (cancelada)`}
                      />
                    ))}
                  </div>
                )}

                {/* icon when filter active */}
                {roomFilter && (
                  <span className="text-[9px] leading-none mt-0.5">
                    {bookedByFilter ? "✕" : "✓"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* legend */}
        {!roomFilter && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
            {Object.entries(ROOM_NAMES).map(([id, name]) => (
              <div
                key={id}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${ROOM_COLORS[id]?.dot ?? "bg-gray-400"}`} />
                {name}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              Cancelada
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded bg-red-200 dark:bg-red-900/50" />
              Todo ocupado
            </div>
          </div>
        )}
      </div>

      {/* side panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        {selectedDay ? (
          <>
            <div className="flex items-start justify-between mb-3 gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white capitalize text-sm">
                {selectedDay.toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              {selectedDay >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                <button
                  onClick={() => onCreateForDay(dateToInputStr(selectedDay), roomFilter || undefined)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors shrink-0"
                >
                  <Plus className="h-3 w-3" />
                  Nueva
                </button>
              )}
            </div>

            {/* availability summary per room when filter active */}
            {roomFilter && (
              <div
                className={`mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                  isRoomBooked(roomFilter, selectedDay)
                    ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                }`}
              >
                {isRoomBooked(roomFilter, selectedDay) ? (
                  <>
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {ROOM_NAMES[roomFilter]} — Ocupado
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    {ROOM_NAMES[roomFilter]} — Disponible
                  </>
                )}
              </div>
            )}

            {bookingsForSelected.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin reservas este día.</p>
            ) : (
              <div className="space-y-2">
                {bookingsForSelected.map((b) => {
                  const isCancelled = b.status === "cancelled";
                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-lg border ${
                        isCancelled
                          ? "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 opacity-70"
                          : `${ROOM_COLORS[b.room_id]?.bg ?? "bg-gray-50"} border-transparent`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p
                          className={`text-xs font-semibold ${
                            isCancelled
                              ? "text-gray-400 dark:text-gray-500"
                              : ROOM_COLORS[b.room_id]?.text ?? "text-gray-600"
                          }`}
                        >
                          {ROOM_NAMES[b.room_id] ?? b.room_id}
                        </p>
                        <div className="flex items-center gap-1">
                          {isCancelled && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                              <XCircle className="h-2.5 w-2.5" /> Cancelada
                            </span>
                          )}
                          <SourceBadge source={b.source} />
                        </div>
                      </div>
                      <p className={`text-sm font-medium ${isCancelled ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                        {b.full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {parseDateLocal(b.check_in.slice(0, 10)).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" → "}
                        {parseDateLocal(b.check_out.slice(0, 10)).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" · "}
                        {b.nights}n
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center gap-2">
            <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Selecciona un día para ver las reservas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── StatCard / EmptyState ─────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2 ${iconBg} rounded-lg shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
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
    <div className="text-center py-20">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{desc}</p>
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" /> Confirmada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
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
    <div className="min-h-screen bg-white dark:bg-black p-6">
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <CalendarClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Calendario Palmas
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-1">
              Panel de reservas y contactos · Palmas Recovery
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nueva Reserva
            </button>
            <button
              onClick={() => {
                fetchBookings();
                fetchContacts();
              }}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BedDouble className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Total Reservas"
            value={loadingBookings ? "—" : bookings.length}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            label="Confirmadas"
            value={loadingBookings ? "—" : confirmedBookings.length}
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            label="Ingresos"
            value={loadingBookings ? "—" : `$${totalRevenue.toLocaleString()}`}
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            label="Contactos"
            value={loadingContacts ? "—" : contacts.length}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 w-fit flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Confirmación</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Huésped</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Habitación</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Check-in</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Check-out</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Noches</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Estado</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Origen</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                          #{booking.confirmation_number}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {booking.full_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROOM_COLORS[booking.room_id]?.bg ?? "bg-gray-100"} ${ROOM_COLORS[booking.room_id]?.text ?? "text-gray-600"}`}
                          >
                            {ROOM_NAMES[booking.room_id] ?? booking.room_id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {parseDateLocal(booking.check_in.slice(0, 10)).toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {parseDateLocal(booking.check_out.slice(0, 10)).toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {booking.nights}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          ${booking.total}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                        <td className="px-4 py-3">
                          <SourceBadge source={booking.source} />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contacts tab */}
        {activeTab === "contacts" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Nombre</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Contacto</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Mensaje</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <Mail className="h-3 w-3 shrink-0" />
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                              <Phone className="h-3 w-3 shrink-0" />
                              {contact.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs">
                          <p className="line-clamp-2">{contact.message}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {new Date(contact.created_at).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
