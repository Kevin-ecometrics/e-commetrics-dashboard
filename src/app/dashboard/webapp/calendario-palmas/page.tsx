"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

const API_BASE_URL = "https://palmasrecovery.com";

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


const ROOM_NAMES: Record<string, string> = {
  private: "Private Room",
  shared: "Shared Room",
  "large-private": "Large Private Room",
  vip: "VIP Suite",
};

const ROOM_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  private: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  shared: { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  "large-private": { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  vip: { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
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

// ── helpers ──────────────────────────────────────────────────────────────────

function parseDateLocal(dateStr: string): Date {
  // "YYYY-MM-DD" → local midnight
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function bookingOccupiesDayLocal(booking: Booking, day: Date): boolean {
  if (booking.status === "cancelled") return false;
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

// ── sub-components ────────────────────────────────────────────────────────────

function BookingDetailModal({ booking, onClose, onCancel }: {
  booking: Booking;
  onClose: () => void;
  onCancel: (id: number) => void;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await onCancel(booking.id);
    setCancelling(false);
  };

  const extrasTotal = booking.extras.reduce((s, e) => s + (EXTRA_PRICES[e] ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">#{booking.confirmation_number}</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{booking.full_name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {booking.status === "confirmed" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                Cancelar
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* status */}
          <div className="flex items-center gap-2">
            {booking.status === "confirmed" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" /> Confirmada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="h-3 w-3" /> Cancelada
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROOM_COLORS[booking.room_id]?.bg ?? "bg-gray-100"} ${ROOM_COLORS[booking.room_id]?.text ?? "text-gray-600"}`}>
              <BedDouble className="h-3 w-3" />
              {ROOM_NAMES[booking.room_id] ?? booking.room_id}
            </span>
          </div>

          {/* contact */}
          <div className="grid grid-cols-1 gap-2">
            <Row label="Email" value={booking.email} />
            <Row label="Teléfono" value={booking.phone} />
            <Row label="Cirujano" value={booking.certified_doctor} />
            {booking.special_requests && <Row label="Solicitudes" value={booking.special_requests} />}
          </div>

          {/* dates */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Check-in</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {parseDateLocal(booking.check_in.slice(0, 10)).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="text-center border-x border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Noches</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{booking.nights}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Check-out</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {parseDateLocal(booking.check_out.slice(0, 10)).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>

          {/* extras */}
          {booking.extras.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Extras</p>
              <div className="space-y-1.5">
                {booking.extras.map((e) => (
                  <div key={e} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{EXTRA_NAMES[e] ?? e}</span>
                    <span className="font-medium text-gray-900 dark:text-white">${EXTRA_PRICES[e] ?? 0}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>Subtotal extras</span>
                  <span>${extrasTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* total */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <span className="font-semibold text-amber-800 dark:text-amber-300">Total</span>
            <span className="text-xl font-bold text-amber-800 dark:text-amber-300">${booking.total} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400 min-w-[90px] shrink-0">{label}</span>
      <span className="text-gray-900 dark:text-white break-all">{value}</span>
    </div>
  );
}

// ── Calendar view ─────────────────────────────────────────────────────────────

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const roomsForDay = (day: Date) =>
    bookings.filter(b => bookingOccupiesDayLocal(b, day)).map(b => b.room_id);

  const bookingsForSelected = selectedDay
    ? bookings.filter(b => bookingOccupiesDayLocal(b, selectedDay))
    : [];

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  const isSelected = (d: Date) =>
    selectedDay !== null &&
    d.getDate() === selectedDay.getDate() &&
    d.getMonth() === selectedDay.getMonth() &&
    d.getFullYear() === selectedDay.getFullYear();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* calendar grid */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        {/* nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{monthName}</h3>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">{d}</div>
          ))}
        </div>

        {/* day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* padding for first week */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}

          {days.map(day => {
            const rooms = roomsForDay(day);
            const selected = isSelected(day);
            const todayMark = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(selected ? null : day)}
                className={`relative rounded-lg p-1 min-h-[52px] flex flex-col items-center gap-0.5 transition-colors text-left w-full
                  ${selected ? "bg-amber-100 dark:bg-amber-900/40 ring-2 ring-amber-500" : "hover:bg-gray-50 dark:hover:bg-gray-800"}
                  ${todayMark && !selected ? "ring-1 ring-gray-400 dark:ring-gray-500" : ""}
                `}
              >
                <span className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full
                  ${todayMark ? "bg-amber-500 text-white" : "text-gray-700 dark:text-gray-300"}
                `}>
                  {day.getDate()}
                </span>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {[...new Set(rooms)].map(roomId => (
                    <span
                      key={roomId}
                      className={`w-2 h-2 rounded-full ${ROOM_COLORS[roomId]?.dot ?? "bg-gray-400"}`}
                      title={ROOM_NAMES[roomId] ?? roomId}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
          {Object.entries(ROOM_NAMES).map(([id, name]) => (
            <div key={id} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className={`w-2.5 h-2.5 rounded-full ${ROOM_COLORS[id]?.dot ?? "bg-gray-400"}`} />
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* side panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        {selectedDay ? (
          <>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
              {selectedDay.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
            </h3>
            {bookingsForSelected.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin reservas este día.</p>
            ) : (
              <div className="space-y-2">
                {bookingsForSelected.map(b => (
                  <div key={b.id} className={`p-3 rounded-lg border ${ROOM_COLORS[b.room_id]?.bg ?? "bg-gray-50"} border-transparent`}>
                    <p className={`text-xs font-semibold ${ROOM_COLORS[b.room_id]?.text ?? "text-gray-600"}`}>
                      {ROOM_NAMES[b.room_id] ?? b.room_id}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{b.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {parseDateLocal(b.check_in.slice(0, 10)).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      {" → "}
                      {parseDateLocal(b.check_out.slice(0, 10)).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      {" · "}{b.nights}n
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center gap-2">
            <Calendar className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Selecciona un día para ver las reservas</p>
          </div>
        )}
      </div>
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
    const booking = bookings.find(b => b.id === id);
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

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
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

  const tabs: { id: Tab; label: string; count?: number | string }[] = [
    { id: "calendar", label: "Calendario" },
    { id: "bookings", label: "Reservas", count: loadingBookings ? undefined : bookings.length },
    { id: "contacts", label: "Contactos", count: loadingContacts ? undefined : contacts.length },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <Toaster />
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancelBooking}
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario Palmas</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-1">Panel de reservas y contactos · Palmas Recovery</p>
          </div>
          <button
            onClick={() => { fetchBookings(); fetchContacts(); }}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<BedDouble className="h-5 w-5 text-blue-600 dark:text-blue-400" />} iconBg="bg-blue-100 dark:bg-blue-900/30" label="Total Reservas" value={loadingBookings ? "—" : bookings.length} />
          <StatCard icon={<CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />} iconBg="bg-emerald-100 dark:bg-emerald-900/30" label="Confirmadas" value={loadingBookings ? "—" : confirmedBookings.length} />
          <StatCard icon={<DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />} iconBg="bg-amber-100 dark:bg-amber-900/30" label="Ingresos" value={loadingBookings ? "—" : `$${totalRevenue.toLocaleString()}`} />
          <StatCard icon={<MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />} iconBg="bg-purple-100 dark:bg-purple-900/30" label="Contactos" value={loadingContacts ? "—" : contacts.length} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 w-fit flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        {/* Calendar tab */}
        {activeTab === "calendar" && (
          loadingBookings ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : <CalendarView bookings={bookings} />
        )}

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {loadingBookings ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState icon={<BedDouble className="h-8 w-8 text-gray-400" />} title="Sin reservas" desc="Todavía no hay reservas registradas." />
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
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                          #{booking.confirmation_number}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{booking.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{booking.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROOM_COLORS[booking.room_id]?.bg ?? "bg-gray-100"} ${ROOM_COLORS[booking.room_id]?.text ?? "text-gray-600"}`}>
                            {ROOM_NAMES[booking.room_id] ?? booking.room_id}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {parseDateLocal(booking.check_in.slice(0, 10)).toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {parseDateLocal(booking.check_out.slice(0, 10)).toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{booking.nights}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">${booking.total}</td>
                        <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
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
              <EmptyState icon={<MessageSquare className="h-8 w-8 text-gray-400" />} title="Sin contactos" desc="Todavía no hay mensajes de contacto registrados." />
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
                    {contacts.map(contact => (
                      <tr key={contact.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{contact.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                            <Mail className="h-3 w-3 shrink-0" />{contact.email}
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                              <Phone className="h-3 w-3 shrink-0" />{contact.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs">
                          <p className="line-clamp-2">{contact.message}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
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

function StatCard({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string | number }) {
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

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center py-20">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  );
}
