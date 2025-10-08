"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/app/context/LangContext";
import axios from "axios";

interface Appointment {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  primera_visita: number;
  servicio: string;
  seguro: string;
  fecha: string; // Puede venir como timestamp ISO o YYYY-MM-DD
  hora: string;
  precio?: number;
  fecha_creacion: string;
  dateTime?: Date;
}

interface BlockedDate {
  id: number;
  date: string;
  hour: string;
}

interface CalendarDay {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isBlocked: boolean;
  isBooked: boolean;
  appointmentCount: number;
}

interface AppointmentFormData {
  name: string;
  phone: string;
  email: string;
  isFirstVisit: boolean;
  service: string;
  insurance: string;
  date: string;
  time: string;
}

const API_BASE_URL = "https://mongeortopedia.com";
const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isoYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 🔹 Nueva función para crear Date correctamente evitando desfase
function parseLocalDateTime(dateStr: string, hourStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = hourStr.split(":").map(Number);
  const dt = new Date(year, month - 1, day, hour, minute);
  return dt;
}

export default function CalendarMonge() {
  const { lang } = useLang();
  const [selectedDates, setSelectedDates] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blockingDate, setBlockingDate] = useState<boolean>(false);
  const [blockDateInput, setBlockDateInput] = useState<string>("");
  const [blockHourInput, setBlockHourInput] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    name: "",
    phone: "",
    email: "",
    isFirstVisit: false,
    service: "Visita sucesiva", // Default value for non-first visits
    insurance: "",
    date: "",
    time: "",
  });
  /** 🔹 Cargar citas */
  const fetchSelectedDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments/`, {
        timeout: 10000,
      });
      const items: Appointment[] = Array.isArray(res.data) ? res.data : [];
      const normalized = items
        .map((item) => {
          const fechaStr = item.fecha.includes("T")
            ? item.fecha.split("T")[0]
            : item.fecha;
          const hora = item.hora ?? "00:00";
          const dateTime = parseLocalDateTime(fechaStr, hora);
          return { ...item, fecha: fechaStr, dateTime };
        })
        .sort((a, b) => a.dateTime!.getTime() - b.dateTime!.getTime());
      setSelectedDates(normalized);
    } catch (err) {
      console.error("Error fetching selected dates:", err);
      setError(
        lang === "es"
          ? "Error al cargar las citas"
          : "Error loading appointments"
      );
    } finally {
      setLoading(false);
    }
  }, [lang]);

  /** 🔹 Cargar bloqueadas */
  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fechas-bloqueadas/`);
      const normalized: BlockedDate[] = Array.isArray(res.data)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          res.data.map((d: any) => ({ id: d.id, date: d.date, hour: d.hour }))
        : [];
      setBlockedDates(normalized);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  }, []);

  /** 🔹 Refrescar todo */
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSelectedDates(), fetchBlockedDates()]);
  }, [fetchSelectedDates, fetchBlockedDates]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /** 🔹 Bloquear fecha + hora */
  const handleBlockDate = async () => {
    if (!blockDateInput || !blockHourInput || blockingDate) return;
    if (
      blockedDates.some(
        (d) => d.date === blockDateInput && d.hour === blockHourInput
      )
    )
      return;

    setBlockingDate(true);
    try {
      await axios.post(`${API_BASE_URL}/bloquear-fecha/`, {
        date: blockDateInput,
        hour: blockHourInput,
      });
      await refreshAll();
      setBlockDateInput("");
      setBlockHourInput("");
    } catch (err) {
      console.error("Error blocking date:", err);
    } finally {
      setBlockingDate(false);
    }
  };

  /** 🔹 Desbloquear */
  const handleUnblockDate = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/desbloquear-fecha/${id}/`);
      await refreshAll();
    } catch (err) {
      console.error("Error unblocking date:", err);
    }
  };

  /** 🔹 Navegación */
  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentDate(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + (dir === "next" ? 1 : -1),
          1
        )
    );
  };
  const goToToday = () => setCurrentDate(new Date());

  /** 🔹 Días del calendario */
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const firstDayOfWeek = firstOfMonth.getDay();
    const totalCells = 42;
    const daysFromPrevMonth = firstDayOfWeek;
    const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;
    const days: CalendarDay[] = [];

    const prevMonthLast = new Date(year, month, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const d = prevMonthLast.getDate() - i;
      const obj = new Date(
        prevMonthLast.getFullYear(),
        prevMonthLast.getMonth(),
        d
      );
      const dateStr = isoYMD(obj);
      days.push({
        day: obj.getDate(),
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isBlocked: blockedDates.some((b) => b.date === dateStr),
        isBooked: selectedDates.some((s) => s.fecha === dateStr),
        appointmentCount: selectedDates.filter((s) => s.fecha === dateStr)
          .length,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const obj = new Date(year, month, d);
      const dateStr = isoYMD(obj);
      const isToday = obj.toDateString() === today.toDateString();
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
        isBlocked: blockedDates.some((b) => b.date === dateStr),
        isBooked: selectedDates.some((s) => s.fecha === dateStr),
        appointmentCount: selectedDates.filter((s) => s.fecha === dateStr)
          .length,
      });
    }

    const nextMonthFirst = new Date(year, month + 1, 1);
    for (let d = 1; d <= daysFromNextMonth; d++) {
      const obj = new Date(
        nextMonthFirst.getFullYear(),
        nextMonthFirst.getMonth(),
        d
      );
      const dateStr = isoYMD(obj);
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
        isBlocked: blockedDates.some((b) => b.date === dateStr),
        isBooked: selectedDates.some((s) => s.fecha === dateStr),
        appointmentCount: selectedDates.filter((s) => s.fecha === dateStr)
          .length,
      });
    }

    return days;
  }, [currentDate, blockedDates, selectedDates]);

  /** 🔹 Próximas citas */
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return selectedDates.filter((a) => a.dateTime && a.dateTime >= now);
  }, [selectedDates]);

  const handleCreateAppointment = async () => {
    setShowConfirmModal(false);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/appointments`, {
        ...appointmentForm,
        lang,
      });

      if (response.status === 201) {
        setAppointmentForm({
          name: "",
          phone: "",
          email: "",
          service: "",
          insurance: "",
          date: "",
          time: "",
          isFirstVisit: false,
        });
        await refreshAll();
        alert(
          lang === "es"
            ? "Cita creada exitosamente"
            : "Appointment created successfully"
        );
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert(
        lang === "es" ? "Error al crear la cita" : "Error creating appointment"
      );
    }
  };

  const handleShowConfirmation = () => {
    setShowConfirmModal(true);
  };

  const formatDateTime = useCallback(
    (fecha: string, hora: string) => {
      const dt = parseLocalDateTime(fecha, hora);
      return dt.toLocaleString(lang === "es" ? "es-MX" : "en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [lang]
  );

  const monthNames = lang === "es" ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              ◀
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              ▶
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-400 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`h-20 flex flex-col items-center justify-center rounded-lg border
                ${
                  day.isCurrentMonth
                    ? "border-gray-700"
                    : "border-gray-800 text-gray-600"
                }
                ${
                  day.isToday ? "bg-blue-500/20 border-blue-500 text-white" : ""
                }
                ${
                  day.isBlocked
                    ? "bg-red-500/30 text-red-200 border-red-500"
                    : ""
                }
                ${
                  day.isBooked
                    ? "bg-green-500/20 text-green-200 border-green-500"
                    : ""
                }
              `}
              >
                <span>{day.day}</span>
                {day.appointmentCount > 0 && (
                  <span className="text-xs bg-green-500/30 text-green-200 rounded px-1 mt-1">
                    {day.appointmentCount}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={goToToday}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              {lang === "es" ? "Hoy" : "Today"}
            </button>
          </div>
        </div>

        {/* Próximas citas */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {lang === "es" ? "Próximas Citas" : "Upcoming Appointments"}
            </h3>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
              {upcomingAppointments.length}
            </span>
          </div>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-2 max-h-full overflow-y-auto">
              {upcomingAppointments.map((a, idx) => (
                <div
                  key={idx}
                  className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg"
                >
                  <div className="font-medium">{a.nombre}</div>
                  <div className="text-sm text-gray-300">
                    {formatDateTime(a.fecha, a.hora)}
                  </div>
                  <div className="text-sm text-gray-400">{a.servicio}</div>
                  {a.telefono && (
                    <div className="text-xs text-gray-500">{a.telefono}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              {lang === "es"
                ? "No hay próximas citas"
                : "No upcoming appointments"}
            </p>
          )}
        </div>

        {/* Fechas bloqueadas */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-xl lg:col-span-3">
          <h3 className="text-xl font-semibold mb-4">
            {lang === "es" ? "Fechas bloqueadas" : "Blocked Dates"}
          </h3>
          <div className="flex gap-2 items-center mt-2">
            <input
              type="date"
              value={blockDateInput}
              onChange={(e) => setBlockDateInput(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            />
            <select
              value={blockHourInput}
              onChange={(e) => setBlockHourInput(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              disabled={!blockDateInput}
            >
              <option value="">--{lang === "es" ? "Hora" : "Hour"}--</option>
              {Array.from({ length: 10 }, (_, i) => 9 + i).map((h) => {
                const hourStr = `${h.toString().padStart(2, "0")}:00`;
                const isBlocked = blockedDates.some(
                  (b) => b.date === blockDateInput && b.hour === hourStr
                );
                const isBooked = selectedDates.some(
                  (s) => s.fecha === blockDateInput && s.hora === hourStr
                );
                const today = new Date();
                const [year, month, day] = blockDateInput
                  .split("-")
                  .map(Number);
                const selectedDate = new Date(year, month - 1, day);
                const isToday =
                  selectedDate.toDateString() === today.toDateString();
                const hourDate = parseLocalDateTime(blockDateInput, hourStr);
                const isPast = isToday && hourDate <= today;
                return (
                  <option
                    key={hourStr}
                    value={hourStr}
                    disabled={isBlocked || isBooked || isPast}
                  >
                    {hourStr}{" "}
                    {isBlocked
                      ? `(${lang === "es" ? "Bloqueado" : "Blocked"})`
                      : isBooked
                      ? `(${lang === "es" ? "Paciente" : "Patient"})`
                      : ""}
                  </option>
                );
              })}
            </select>
            <button
              onClick={handleBlockDate}
              disabled={blockingDate || !blockDateInput || !blockHourInput}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {lang === "es" ? "Bloquear" : "Block"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {blockedDates.map((d) => {
              // Normalizar la fecha a YYYY-MM-DD
              const normalizedDate = d.date.includes("T")
                ? d.date.split("T")[0]
                : d.date;

              // Construir fecha/hora en local
              const dateObj = parseLocalDateTime(normalizedDate, d.hour);

              // No mostrar fechas pasadas
              if (dateObj <= new Date()) return null;

              const formattedDate = dateObj.toLocaleDateString(
                lang === "es" ? "es-ES" : "en-US",
                {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              );

              const formattedTime = dateObj.toLocaleTimeString(
                lang === "es" ? "es-ES" : "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              );

              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-lg"
                >
                  <span>{`${formattedDate}, ${formattedTime}`}</span>
                  <button
                    onClick={() => handleUnblockDate(d.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-700/50 p-8 shadow-2xl lg:col-span-3">
          <h3 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {lang === "es" ? "Agendar Nueva Cita" : "Schedule New Appointment"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {lang === "es" ? "Nombre del Paciente" : "Patient Name"}
                </label>
                <input
                  type="text"
                  value={appointmentForm.name}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {lang === "es" ? "Teléfono" : "Phone"}
                </label>
                <input
                  type="tel"
                  value={appointmentForm.phone}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={appointmentForm.email}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {lang === "es" ? "Tipo de Visita" : "Visit Type"}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600 hover:bg-gray-800/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={appointmentForm.isFirstVisit}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        isFirstVisit: e.target.checked,
                        service: e.target.checked ? "" : "Visita sucesiva",
                      }))
                    }
                    className="w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-white">
                    {lang === "es" ? "Primera visita" : "First visit"}
                  </label>
                </div>
              </div>

              {appointmentForm.isFirstVisit && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {lang === "es" ? "Servicio" : "Service"}
                  </label>
                  <input
                    type="text"
                    value={appointmentForm.service}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        service: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={
                      lang === "es"
                        ? "Especifique el servicio"
                        : "Specify service"
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {lang === "es" ? "Seguro Médico" : "Medical Insurance"}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600 hover:bg-gray-800/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={appointmentForm.insurance !== "Sin seguro"}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        insurance: e.target.checked ? "" : "Sin seguro",
                      }))
                    }
                    className="w-4 h-4 bg-gray-800 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-white">
                    {lang === "es"
                      ? "Cuenta con seguro médico"
                      : "Has medical insurance"}
                  </label>
                </div>
              </div>

              {appointmentForm.insurance !== "Sin seguro" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {lang === "es" ? "Nombre del Seguro" : "Insurance Name"}
                  </label>
                  <input
                    type="text"
                    value={appointmentForm.insurance}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        insurance: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={
                      lang === "es" ? "Nombre del seguro" : "Insurance name"
                    }
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {lang === "es" ? "Fecha" : "Date"}
                </label>
                <input
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {lang === "es" ? "Hora" : "Time"}
                </label>
                <select
                  value={appointmentForm.time}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={!appointmentForm.date}
                >
                  <option value="">
                    --{lang === "es" ? "Seleccionar" : "Select"}--
                  </option>
                  {Array.from({ length: 10 }, (_, i) => 9 + i).map((h) => {
                    const hourStr = `${h.toString().padStart(2, "0")}:00`;
                    const isBlocked = blockedDates.some(
                      (b) =>
                        b.date === appointmentForm.date && b.hour === hourStr
                    );
                    const isBooked = selectedDates.some(
                      (s) =>
                        s.fecha === appointmentForm.date && s.hora === hourStr
                    );

                    const today = new Date().toISOString().split("T")[0];
                    const currentHour = new Date().getHours();
                    const isPastHour =
                      appointmentForm.date === today && h <= currentHour;

                    return (
                      <option
                        key={hourStr}
                        value={hourStr}
                        disabled={isBlocked || isBooked || isPastHour}
                      >
                        {hourStr}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleShowConfirmation}
                disabled={
                  !appointmentForm.name ||
                  !appointmentForm.phone ||
                  !appointmentForm.date ||
                  !appointmentForm.time ||
                  (appointmentForm.isFirstVisit && !appointmentForm.service)
                }
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
              >
                {lang === "es" ? "Crear Cita" : "Create Appointment"}
              </button>
            </div>
          </div>
        </div>
        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-700/50 p-8 shadow-2xl max-w-lg w-full transform transition-all">
              <h3 className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {lang === "es" ? "Confirmar Cita" : "Confirm Appointment"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Paciente" : "Patient"}:
                  </div>
                  <div className="text-white font-semibold">
                    {appointmentForm.name}
                  </div>

                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Teléfono" : "Phone"}:
                  </div>
                  <div className="text-white font-semibold">
                    {appointmentForm.phone}
                  </div>

                  {appointmentForm.email && (
                    <>
                      <div className="text-gray-400 font-medium">Email:</div>
                      <div className="text-white font-semibold break-all">
                        {appointmentForm.email}
                      </div>
                    </>
                  )}

                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Tipo de Visita" : "Visit Type"}:
                  </div>
                  <div className="text-white font-semibold">
                    {appointmentForm.isFirstVisit
                      ? lang === "es"
                        ? "Primera visita"
                        : "First visit"
                      : lang === "es"
                      ? "Visita sucesiva"
                      : "Follow-up visit"}
                  </div>

                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Servicio" : "Service"}:
                  </div>
                  <div className="text-white font-semibold">
                    {appointmentForm.service}
                  </div>

                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Seguro Médico" : "Insurance"}:
                  </div>
                  <div className="text-white font-semibold">
                    {appointmentForm.insurance === "Sin seguro"
                      ? lang === "es"
                        ? "Sin seguro"
                        : "No insurance"
                      : appointmentForm.insurance}
                  </div>

                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Fecha" : "Date"}:
                  </div>
                  <div className="text-white font-semibold">
                    {new Date(
                      new Date(appointmentForm.date).setDate(
                        new Date(appointmentForm.date).getDate() + 1
                      )
                    ).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>

                  <div className="text-gray-400 font-medium">
                    {lang === "es" ? "Hora" : "Time"}:
                  </div>
                  <div className="text-white font-semibold">
                    {appointmentForm.time}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-all duration-200 border border-gray-700"
                >
                  {lang === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  onClick={handleCreateAppointment}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30"
                >
                  {lang === "es" ? "Confirmar" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
