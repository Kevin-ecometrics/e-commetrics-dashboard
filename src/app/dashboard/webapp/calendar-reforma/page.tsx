"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/app/context/LangContext";
import axios from "axios";

interface Appointment {
  date: string;
  hour: string;
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

const API_BASE_URL = "https://reformadental.com";
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

export default function CalendarReforma() {
  const { lang } = useLang();
  const [selectedDates, setSelectedDates] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blockingDate, setBlockingDate] = useState<boolean>(false);
  const [blockDateInput, setBlockDateInput] = useState<string>("");
  const [blockHourInput, setBlockHourInput] = useState<string>("");

  /** 🔹 Cargar citas */
  const fetchSelectedDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/fechas-seleccionadas`, {
        timeout: 10000,
      });
      const items: Appointment[] = Array.isArray(res.data) ? res.data : [];
      const normalized = items
        .map((item) => {
          const hour = item.hour ?? "00:00";
          const dateTime = new Date(`${item.date}T${hour}`);
          return { ...item, dateTime };
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
      const res = await axios.get(`${API_BASE_URL}/fechas-bloqueadas`, {
        timeout: 10000,
      });
      const normalized: BlockedDate[] = Array.isArray(res.data)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          res.data.map((d: any) => ({ id: d.id, date: d.date, hour: d.hour }))
        : [];
      setBlockedDates(normalized);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  }, []);

  /** 🔹 Refrescar todo (citas + bloqueadas) */
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
      await axios.post(`${API_BASE_URL}/bloquear-fecha`, {
        date: blockDateInput,
        hour: blockHourInput,
      });

      // Refrescar todo
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
      await axios.delete(`${API_BASE_URL}/desbloquear-fecha/${id}`);
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
        isBooked: selectedDates.some((s) => s.date === dateStr),
        appointmentCount: selectedDates.filter((s) => s.date === dateStr)
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
        isBooked: selectedDates.some((s) => s.date === dateStr),
        appointmentCount: selectedDates.filter((s) => s.date === dateStr)
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
        isBooked: selectedDates.some((s) => s.date === dateStr),
        appointmentCount: selectedDates.filter((s) => s.date === dateStr)
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

  const formatDateTime = useCallback(
    (date: string, hour: string) => {
      const dt = new Date(`${date}T${hour}`);
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
                    day.isToday
                      ? "bg-blue-500/20 border-blue-500 text-white"
                      : ""
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {upcomingAppointments.map((a, idx) => (
                <div
                  key={idx}
                  className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg"
                >
                  {formatDateTime(a.date, a.hour)}
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
              {Array.from({ length: 9 }, (_, i) => 9 + i).map((h) => {
                const hourStr = `${h.toString().padStart(2, "0")}:00`;
                const isBlocked = blockedDates.some(
                  (b) => b.date === blockDateInput && b.hour === hourStr
                );
                const isBooked = selectedDates.some(
                  (s) => s.date === blockDateInput && s.hour === hourStr
                );

                // 🔹 Filtrar horas pasadas si es hoy
                const today = new Date();

                // Crear Date de la fecha seleccionada en zona local
                const [year, month, day] = blockDateInput
                  .split("-")
                  .map(Number);
                const selectedDate = new Date(year, month - 1, day);

                const isToday =
                  selectedDate.getFullYear() === today.getFullYear() &&
                  selectedDate.getMonth() === today.getMonth() &&
                  selectedDate.getDate() === today.getDate();

                // Crear Date de la hora del select
                const hourDate = new Date(selectedDate);
                hourDate.setHours(h, 0, 0, 0); // h viene del map: 9 + i

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
              const today = new Date();
              const [year, month, day] = d.date.split("-").map(Number);
              const date = new Date(year, month - 1, day);

              const isToday =
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate();

              const [hourStr, minuteStr] = d.hour.split(":");
              const hourDate = new Date(date);
              hourDate.setHours(Number(hourStr), Number(minuteStr), 0, 0);

              const isPast = isToday && hourDate <= today;

              if (isPast) return null; // 🔹 No renderiza horas pasadas

              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-lg"
                >
                  <span>
                    {d.date} {d.hour}
                  </span>
                  <button
                    onClick={() => handleUnblockDate(d.id)}
                    className="text-red-400 hover:text-red-200"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
