"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/app/context/LangContext";
import axios from "axios";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Appointment {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  primera_visita: number;
  servicio: string;
  seguro: string;
  fecha: string;
  hora: string;
  fecha_creacion: string;
  dateTime?: Date;
  origen?: string;
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
  isSelected: boolean;
  isBlocked: boolean;
  isBooked: boolean;
  appointmentCount: number;
  webCount: number;
  dashboardCount: number;
  blockedCount: number;
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

type ModalType = "delete" | "edit" | null;
type BlockType = "single" | "multiple";

const API_BASE_URL = "https://reformadental.com";
const DAYS_OF_WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDateTime(dateStr: string, hourStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = hourStr.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function getAvailableHours(dateStr: string): string[] {
  const dayOfWeek = getDayOfWeek(dateStr);
  if (dayOfWeek === 0) return [];
  return ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
}

function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) return dates;
  const current = new Date(start);
  while (current <= end) {
    dates.push(isoYMD(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateForDisplay(dateStr: string, lang: "es" | "en"): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function getOriginText(origen: string | undefined | null, lang: "es" | "en"): string {
  if (origen === "dashboard") return "Dashboard";
  return lang === "es" ? "Página Web" : "Web Page";
}

function getOriginBadgeStyles(origen: string | undefined | null): React.CSSProperties {
  const base: React.CSSProperties = { fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid" };
  if (!origen || origen === "null" || origen === "undefined") {
    return { ...base, background: "rgba(34,197,94,0.12)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" };
  }
  const map: Record<string, React.CSSProperties> = {
    dashboard: { ...base, background: "rgba(168,85,247,0.12)", color: "#a855f7", borderColor: "rgba(168,85,247,0.3)" },
    web: { ...base, background: "rgba(34,197,94,0.12)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" },
    paginaweb: { ...base, background: "rgba(34,197,94,0.12)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" },
    telefono: { ...base, background: "rgba(249,115,22,0.12)", color: "#f97316", borderColor: "rgba(249,115,22,0.3)" },
  };
  return map[String(origen).trim().toLowerCase()] || { ...base, background: "rgba(100,116,139,0.12)", color: "#94a3b8", borderColor: "rgba(100,116,139,0.3)" };
}

export default function CalendarReforma() {
  const { lang } = useLang();
  const currentDateString = useMemo(() => isoYMD(new Date()), []);

  const [selectedDates, setSelectedDates] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blockingDate, setBlockingDate] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(currentDateString);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);

  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    name: "", phone: "", email: "", isFirstVisit: false,
    service: "", insurance: "Sin seguro",
    date: currentDateString, time: "",
  });

  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState<boolean>(false);

  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [blockType, setBlockType] = useState<BlockType>("single");
  const [blockForm, setBlockForm] = useState({
    date: "", startDate: "", endDate: "", startTime: "", endTime: "", blockAllDay: false,
  });

  const updateSelectedDayAppointments = useCallback((appointments: Appointment[], selectedDate: string) => {
    const dayAppointments = appointments
      .filter((apt) => apt.fecha === selectedDate)
      .sort((a, b) => a.hora.localeCompare(b.hora));
    setSelectedDayAppointments(dayAppointments);
  }, []);

  const fetchSelectedDates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/appointments`, { timeout: 10000 });
      const items: Appointment[] = Array.isArray(res.data) ? res.data : [];
      const normalized = items
        .map((item) => {
          const fechaStr = item.fecha.includes("T") ? item.fecha.split("T")[0] : item.fecha;
          const hora = item.hora ?? "00:00";
          return { ...item, fecha: fechaStr, dateTime: parseLocalDateTime(fechaStr, hora), origen: item.origen || undefined };
        })
        .sort((a, b) => a.dateTime!.getTime() - b.dateTime!.getTime());
      setSelectedDates(normalized);
      updateSelectedDayAppointments(normalized, selectedCalendarDay);
      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setSelectedDates([]);
    } finally {
      setLoading(false);
    }
  }, [lang, selectedCalendarDay, updateSelectedDayAppointments]);

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fechas-bloqueadas`);
      const normalized: BlockedDate[] = Array.isArray(res.data)
        ? res.data.map((d: BlockedDate) => ({ id: d.id, date: d.date, hour: d.hour })) : [];
      setBlockedDates(normalized);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSelectedDates(), fetchBlockedDates()]);
  }, [fetchSelectedDates, fetchBlockedDates]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const handleBlockSubmit = async () => {
    if (blockType === "single" && !blockForm.date) return;
    if (blockType === "multiple" && (!blockForm.startDate || !blockForm.endDate)) return;
    setBlockingDate(true);
    try {
      let totalBlocked = 0;
      const datesToProcess: string[] = [];
      if (blockType === "single") {
        datesToProcess.push(blockForm.date);
      } else {
        const start = new Date(blockForm.startDate + "T00:00:00");
        const end = new Date(blockForm.endDate + "T23:59:59");
        if (start > end) {
          alert(lang === "es" ? "La fecha de inicio debe ser anterior a la fecha final" : "Start date must be before end date");
          return;
        }
        const current = new Date(start);
        while (current <= end) {
          datesToProcess.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
      }
      for (const dateStr of datesToProcess) {
        const availableHours = getAvailableHours(dateStr);
        if (availableHours.length === 0) continue;
        const hoursToBlock: string[] = [];
        if (blockForm.blockAllDay) {
          hoursToBlock.push(...availableHours.map((hour) => hour.includes(":") ? hour + ":00" : hour + ":00:00"));
        } else if (blockForm.startTime && blockForm.endTime) {
          const startHour = parseInt(blockForm.startTime.split(":")[0]);
          const endHour = parseInt(blockForm.endTime.split(":")[0]);
          if (startHour >= endHour) {
            alert(lang === "es" ? "La hora de inicio debe ser anterior a la hora final" : "Start time must be before end time");
            setBlockingDate(false); return;
          }
          for (let hour = startHour; hour < endHour; hour++) {
            const hourStr = `${hour.toString().padStart(2, "0")}:00`;
            if (availableHours.some((a) => a.startsWith(hourStr.substring(0, 5)))) hoursToBlock.push(hourStr);
          }
        } else if (blockForm.startTime && !blockForm.endTime) {
          const hourStr = blockForm.startTime.includes(":") ? blockForm.startTime : blockForm.startTime + ":00";
          if (availableHours.some((a) => a.startsWith(hourStr.substring(0, 5)))) hoursToBlock.push(hourStr);
        }
        for (const hour of hoursToBlock) {
          const hourKey = hour.substring(0, 5);
          const hourFormatted = hourKey + ":00";
          const isAlreadyBlocked = blockedDates.some((d) => d.date === dateStr && d.hour.substring(0, 5) === hourKey);
          const isAlreadyBooked = selectedDates.some((s) => s.fecha === dateStr && s.hora.substring(0, 5) === hourKey);
          if (!isAlreadyBlocked && !isAlreadyBooked) {
            await axios.post(`${API_BASE_URL}/bloquear-fecha`, { date: dateStr, hour: hourFormatted });
            totalBlocked++;
          }
        }
      }
      await refreshAll();
      setBlockForm({ date: "", startDate: "", endDate: "", startTime: "", endTime: "", blockAllDay: false });
      setShowBlockModal(false);
      alert(lang === "es" ? `✅ Se bloquearon ${totalBlocked} horarios exitosamente` : `✅ ${totalBlocked} time slots blocked successfully`);
    } catch (err) {
      console.error("Error blocking dates:", err);
      alert(lang === "es" ? "❌ Error al bloquear los horarios" : "❌ Error blocking time slots");
    } finally {
      setBlockingDate(false);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    setAppointmentActionLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/appointments/${id}`);
      await refreshAll();
      setSelectedDayAppointments((prev) => prev.filter((a) => a.id !== id));
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
      setModalType(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
    } finally {
      setAppointmentActionLoading(false);
    }
  };

  const handleEditAppointment = async () => {
    if (!selectedAppointment) return;
    setAppointmentActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${selectedAppointment.id}`, { ...appointmentForm, lang });
      await refreshAll();
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
      setModalType(null);
      setAppointmentForm({ name: "", phone: "", email: "", isFirstVisit: false, service: "", insurance: "Sin seguro", date: currentDateString, time: "" });
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert(lang === "es" ? "❌ Error al actualizar la cita" : "❌ Error updating appointment");
    } finally {
      setAppointmentActionLoading(false);
    }
  };

  const openAppointmentModal = (appointment: Appointment, type: ModalType) => {
    setSelectedAppointment(appointment);
    setModalType(type);
    setShowAppointmentModal(true);
    if (type === "edit") {
      setAppointmentForm({
        name: appointment.nombre,
        phone: appointment.telefono,
        email: appointment.correo,
        isFirstVisit: appointment.primera_visita === 1,
        service: appointment.servicio,
        insurance: appointment.seguro,
        date: appointment.fecha,
        time: appointment.hora,
      });
    }
  };

  const getAppointmentType = (appointment: Appointment): "normal" | "blocked" => {
    return appointment.nombre?.toUpperCase() === "BLOQUEADO" ? "blocked" : "normal";
  };

  const getBlockedHoursForDay = (dateStr: string) => {
    const availableHours = getAvailableHours(dateStr);
    return availableHours.filter((hour) => {
      const hourKey = hour.substring(0, 5);
      return blockedDates.some((b) => b.hour.substring(0, 5) === hourKey && b.date === dateStr) &&
             !selectedDates.some((s) => s.fecha === dateStr && s.hora.substring(0, 5) === hourKey);
    });
  };

  const getBookedHoursForDay = (dateStr: string) => {
    return selectedDates.filter((s) => s.fecha === dateStr).map((s) => s.hora.substring(0, 5));
  };

  const getCompleteDaySchedule = useCallback(() => {
    if (!selectedCalendarDay) return [];
    const availableHours = getAvailableHours(selectedCalendarDay);
    const scheduleItems: Array<{ type: "appointment" | "blocked" | "available"; time: string; data?: Appointment | BlockedDate; hourStr: string; isPast: boolean }> = [];
    const dayAppointments = selectedDates.filter((apt) => apt.fecha === selectedCalendarDay);
    const dayBlocked = blockedDates.filter((block) => block.date === selectedCalendarDay);
    for (const hour of availableHours) {
      const hourKey = hour.substring(0, 5);
      const [year, month, day] = selectedCalendarDay.split("-").map(Number);
      const slotDateTime = new Date(year, month - 1, day, parseInt(hourKey.split(":")[0]), 0, 0, 0);
      const isPastHour = slotDateTime < new Date();
      const appointment = dayAppointments.find((apt) => apt.hora.substring(0, 5) === hourKey);
      const blocked = dayBlocked.find((block) => block.hour.substring(0, 5) === hourKey);
      if (appointment) {
        scheduleItems.push({ type: "appointment", time: hourKey, data: appointment, hourStr: hourKey + ":00", isPast: isPastHour });
      } else if (blocked) {
        scheduleItems.push({ type: "blocked", time: hourKey, data: blocked, hourStr: hourKey + ":00", isPast: isPastHour });
      } else if (!isPastHour) {
        scheduleItems.push({ type: "available", time: hourKey, hourStr: hourKey + ":00", isPast: false });
      }
    }
    return scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedCalendarDay, selectedDates, blockedDates]);

  const [completeDaySchedule, setCompleteDaySchedule] = useState<Array<{ type: "appointment" | "blocked" | "available"; time: string; data?: Appointment | BlockedDate; hourStr: string; isPast: boolean }>>([]);

  useEffect(() => {
    if (selectedCalendarDay) {
      setCompleteDaySchedule(getCompleteDaySchedule());
    } else {
      setCompleteDaySchedule([]);
    }
  }, [selectedCalendarDay, selectedDates, blockedDates, getCompleteDaySchedule]);

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + (dir === "next" ? 1 : -1), 1));
  };

  const goToToday = () => {
    const today = new Date();
    const todayStr = isoYMD(today);
    setCurrentDate(today);
    setSelectedCalendarDay(todayStr);
    updateSelectedDayAppointments(selectedDates, todayStr);
    setAppointmentForm((prev) => ({ ...prev, date: todayStr }));
  };

  const handleDayClick = (dateStr: string) => {
    const dayAppointments = selectedDates.filter((apt) => apt.fecha === dateStr).sort((a, b) => a.hora.localeCompare(b.hora));
    setSelectedDayAppointments(dayAppointments);
    setSelectedCalendarDay(dateStr);
    setAppointmentForm((prev) => ({ ...prev, date: dateStr, time: "" }));
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const todayStr = isoYMD(today);
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const firstDayOfWeek = firstOfMonth.getDay();
    const daysFromPrevMonth = firstDayOfWeek;
    const totalCells = 42;
    const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;
    const dateStats = new Map<string, { appointmentCount: number; webCount: number; dashboardCount: number; blockedCount: number }>();
    selectedDates.forEach((s) => {
      const k = s.fecha;
      if (!dateStats.has(k)) dateStats.set(k, { appointmentCount: 0, webCount: 0, dashboardCount: 0, blockedCount: 0 });
      const st = dateStats.get(k)!;
      st.appointmentCount++;
      if (s.origen === "dashboard") st.dashboardCount++;
      else st.webCount++;
    });
    blockedDates.forEach((b) => {
      const k = b.date;
      if (!dateStats.has(k)) dateStats.set(k, { appointmentCount: 0, webCount: 0, dashboardCount: 0, blockedCount: 0 });
      dateStats.get(k)!.blockedCount++;
    });
    const statsFor = (ds: string) => dateStats.get(ds) || { appointmentCount: 0, webCount: 0, dashboardCount: 0, blockedCount: 0 };
    const days: CalendarDay[] = [];
    const prevMonthLast = new Date(year, month, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const d = prevMonthLast.getDate() - i;
      const obj = new Date(prevMonthLast.getFullYear(), prevMonthLast.getMonth(), d);
      const dateStr = isoYMD(obj);
      const s = statsFor(dateStr);
      days.push({ day: obj.getDate(), dateStr, isCurrentMonth: false, isToday: dateStr === todayStr, isSelected: dateStr === selectedCalendarDay, isBlocked: s.blockedCount > 0, isBooked: s.appointmentCount > 0, ...s });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const obj = new Date(year, month, d);
      const dateStr = isoYMD(obj);
      const s = statsFor(dateStr);
      days.push({ day: d, dateStr, isCurrentMonth: true, isToday: dateStr === todayStr, isSelected: dateStr === selectedCalendarDay, isBlocked: s.blockedCount > 0, isBooked: s.appointmentCount > 0, ...s });
    }
    const nextMonthFirst = new Date(year, month + 1, 1);
    for (let d = 1; d <= daysFromNextMonth; d++) {
      const obj = new Date(nextMonthFirst.getFullYear(), nextMonthFirst.getMonth(), d);
      const dateStr = isoYMD(obj);
      const s = statsFor(dateStr);
      days.push({ day: d, dateStr, isCurrentMonth: false, isToday: dateStr === todayStr, isSelected: dateStr === selectedCalendarDay, isBlocked: s.blockedCount > 0, isBooked: s.appointmentCount > 0, ...s });
    }
    return days;
  }, [currentDate, blockedDates, selectedDates, selectedCalendarDay]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return selectedDates.filter((a) => a.dateTime && a.dateTime >= now).sort((a, b) => a.dateTime!.getTime() - b.dateTime!.getTime());
  }, [selectedDates]);

  const handleCreateAppointment = async () => {
    setShowConfirmModal(false);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/appointments-dashboard`, { ...appointmentForm, lang, origen: "dashboard" });
      if (response.status === 201) {
        setAppointmentForm({ name: "", phone: "", email: "", isFirstVisit: false, service: "", insurance: "Sin seguro", date: currentDateString, time: "" });
        await refreshAll();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleShowConfirmation = () => setShowConfirmModal(true);

  const monthNames = lang === "es" ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const availableHoursForSelectedDay = selectedCalendarDay ? getAvailableHours(selectedCalendarDay).filter((hour) => {
    const hourKey = hour.substring(0, 5);
    return !blockedDates.some((b) => b.hour.substring(0, 5) === hourKey && b.date === selectedCalendarDay) &&
           !selectedDates.some((s) => s.hora.substring(0, 5) === hourKey && s.fecha === selectedCalendarDay);
  }) : [];

  return (
    <div style={{ padding: "28px 24px" }} className="fade-in-up">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 18 }}>
        {/* Calendar */}
        <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => navigateMonth("prev")} style={{ padding: "8px 10px", borderRadius: 10, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <FiChevronLeft size={20} />
            </button>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)", userSelect: "none" }}>
              {monthNames[month]} {year}
            </h2>
            <button onClick={() => navigateMonth("next")} style={{ padding: "8px 10px", borderRadius: 10, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <FiChevronRight size={20} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", marginBottom: 8 }}>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} style={{ padding: "8px 0", fontSize: 12, fontWeight: 600, color: "var(--ec-text-dim)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {calendarDays.map((day, idx) => {
              let bg = "transparent";
              let borderColor = "var(--ec-border)";
              let textColor = day.isCurrentMonth ? "var(--ec-text)" : "var(--ec-text-dim)";
              if (day.isSelected) { bg = "rgba(189,21,92,0.12)"; borderColor = "var(--ec-brand)"; textColor = "var(--ec-brand)"; }
              else if (day.isToday) { bg = "rgba(99,102,241,0.12)"; borderColor = "#6366f1"; textColor = "#6366f1"; }
              else if (day.isBlocked) { bg = "rgba(239,68,68,0.1)"; borderColor = "rgba(239,68,68,0.5)"; textColor = "#ef4444"; }
              else if (day.isBooked) { bg = "rgba(34,197,94,0.1)"; borderColor = "rgba(34,197,94,0.4)"; textColor = "#22c55e"; }
              return (
                <div key={idx} onClick={() => handleDayClick(day.dateStr)} style={{ height: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 10, border: `2px solid ${borderColor}`, cursor: "pointer", background: bg, color: textColor, transition: "all 180ms", userSelect: "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{day.day}</span>
                  {(day.webCount > 0 || day.dashboardCount > 0 || day.blockedCount > 0) && (
                    <div style={{ display: "flex", gap: 3, marginTop: 1 }}>
                      {day.webCount > 0 && <span title={`Web: ${day.webCount}`} style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
                      {day.dashboardCount > 0 && <span title={`Dashboard: ${day.dashboardCount}`} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} />}
                      {day.blockedCount > 0 && <span title={`Bloqueado: ${day.blockedCount}`} style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />}
                    </div>
                  )}
                  {(day.webCount > 0 || day.dashboardCount > 0 || day.blockedCount > 0) && (
                    <div style={{ display: "flex", gap: 3, marginTop: 1, flexWrap: "wrap", justifyContent: "center" }}>
                      {day.webCount > 0 && <span style={{ fontSize: 9, lineHeight: "14px", padding: "0 4px", borderRadius: 4, background: "rgba(34,197,94,0.2)", color: "#22c55e", fontWeight: 600 }}>{day.webCount}W</span>}
                      {day.dashboardCount > 0 && <span style={{ fontSize: 9, lineHeight: "14px", padding: "0 4px", borderRadius: 4, background: "rgba(168,85,247,0.2)", color: "#a855f7", fontWeight: 600 }}>{day.dashboardCount}D</span>}
                      {day.blockedCount > 0 && <span style={{ fontSize: 9, lineHeight: "14px", padding: "0 4px", borderRadius: 4, background: "rgba(239,68,68,0.2)", color: "#ef4444", fontWeight: 600 }}>{day.blockedCount}B</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ec-hairline)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ec-text-dim)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> {lang === "es" ? "Web" : "Web"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ec-text-dim)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} /> Dashboard
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ec-text-dim)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} /> {lang === "es" ? "Bloqueado" : "Blocked"}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <button onClick={goToToday} style={{ padding: "9px 18px", borderRadius: 10, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", color: "var(--ec-text)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              {lang === "es" ? "Hoy" : "Today"}
            </button>
            <button onClick={() => setShowBlockModal(true)} style={{ padding: "9px 18px", borderRadius: 10, background: "#DC2626", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", border: 0 }}>
              🔒 {lang === "es" ? "Bloquear Horarios" : "Block Time Slots"}
            </button>
          </div>
        </div>

        {/* Day schedule */}
        <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 14, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 400, color: "var(--ec-text)" }}>
              {selectedCalendarDay ? formatDateForDisplay(selectedCalendarDay, lang) : lang === "es" ? "Próximas Citas" : "Upcoming Appointments"}
            </h3>
            <span style={{ background: "rgba(189,21,92,0.12)", color: "var(--ec-brand)", padding: "3px 12px", borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
              {selectedCalendarDay ? completeDaySchedule.length : upcomingAppointments.length}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--ec-brand)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
              <p style={{ color: "var(--ec-text-dim)", fontSize: 13 }}>{lang === "es" ? "Cargando citas..." : "Loading appointments..."}</p>
            </div>
          ) : error ? (
            <p style={{ color: "#F87171", textAlign: "center", padding: "14px 0" }}>{error}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
              {selectedCalendarDay ? (
                completeDaySchedule.length > 0 ? (
                  completeDaySchedule.map((item, idx) => {
                    if (item.type === "appointment" && item.data) {
                      const a = item.data as Appointment;
                      const appointmentType = getAppointmentType(a);
                      const cardBg = appointmentType === "blocked" ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.04)";
                      const cardBorder = appointmentType === "blocked" ? "rgba(239,68,68,0.25)" : "var(--ec-border)";
                      return (
                        <div key={idx} style={{ padding: 14, borderRadius: 12, border: `1px solid ${cardBorder}`, background: cardBg, position: "relative" }} className="group">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ec-text)" }}>
                              {appointmentType === "blocked" ? "⛔ " + (lang === "es" ? "Bloqueado" : "Blocked") : "👤 " + a.nombre}
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              {appointmentType === "normal" && <span style={getOriginBadgeStyles(a.origen)}>{getOriginText(a.origen, lang)}</span>}
                              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.12)", color: "#6366f1", fontWeight: 600 }}>{item.time}</span>
                            </div>
                          </div>
                          {appointmentType === "normal" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <div style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
                                {a.primera_visita ? "⭐ " + (lang === "es" ? "Primera visita" : "First visit") : "🔄 " + (lang === "es" ? "Visita sucesiva" : "Follow-up")}
                                {a.servicio ? " • " : ""}<span style={{ fontWeight: 500 }}>{a.servicio || ""}</span>
                              </div>
                              {a.telefono && <div style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>📞 {a.telefono}</div>}
                              {a.correo && <div style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>✉️ {a.correo}</div>}
                              <div style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>🏥 {a.seguro === "Sin seguro" || !a.seguro ? (lang === "es" ? "Sin seguro" : "No insurance") : a.seguro}</div>
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, marginTop: 10 }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {appointmentType === "blocked" ? (
                              <button onClick={() => openAppointmentModal(a, "delete")} className="ec-btn-danger" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Eliminar" : "Delete"}</button>
                            ) : (
                              <>
                                <button onClick={() => openAppointmentModal(a, "edit")} className="ec-btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Editar" : "Edit"}</button>
                                <button onClick={() => openAppointmentModal(a, "delete")} className="ec-btn-danger" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Eliminar" : "Delete"}</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    } else if (item.type === "blocked") {
                      return (
                        <div key={idx} style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", position: "relative" }} className="group">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ec-text)" }}>⛔ {lang === "es" ? "Horario Bloqueado" : "Blocked Time Slot"}</span>
                            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontWeight: 600 }}>{item.time}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>{lang === "es" ? "Este horario no está disponible para reservaciones" : "This time slot is not available for booking"}</div>
                          <div style={{ display: "flex", marginTop: 10 }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { const fakeAppointment: Appointment = { id: (item.data as BlockedDate).id, nombre: "BLOQUEADO", telefono: "", correo: "", primera_visita: 0, servicio: "", seguro: "", fecha: selectedCalendarDay, hora: item.hourStr, fecha_creacion: new Date().toISOString(), origen: "dashboard" }; openAppointmentModal(fakeAppointment, "delete"); }} className="ec-btn-danger" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Eliminar Bloqueo" : "Remove Block"}</button>
                          </div>
                        </div>
                      );
                    } else if (item.type === "available") {
                      return (
                        <div key={idx} style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.05)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "#22c55e" }}>✓ {lang === "es" ? "Horario Disponible" : "Available Time Slot"}</span>
                            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontWeight: 600 }}>{item.time}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--ec-text-muted)", marginBottom: 10 }}>{lang === "es" ? "Este horario está libre para agendar una cita" : "This time slot is free to schedule an appointment"}</div>
                          <button onClick={() => { setAppointmentForm((prev) => ({ ...prev, date: selectedCalendarDay, time: item.hourStr })); document.querySelector(".grid-cols-1\\.5fr_1fr")?.scrollIntoView({ behavior: "smooth" }); }} style={{ width: "100%", padding: "8px 12px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{lang === "es" ? "Agendar en este horario" : "Schedule at this time"}</button>
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "28px 0" }}>
                    <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>{lang === "es" ? "No hay horarios disponibles para este día" : "No time slots available for this day"}</p>
                  </div>
                )
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((a, idx) => {
                  const appointmentType = getAppointmentType(a);
                  const cardBg = appointmentType === "blocked" ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.04)";
                  const cardBorder = appointmentType === "blocked" ? "rgba(239,68,68,0.25)" : "var(--ec-border)";
                  return (
                    <div key={idx} style={{ padding: 14, borderRadius: 12, border: `1px solid ${cardBorder}`, background: cardBg, position: "relative" }} className="group">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ec-text)" }}>
                          {appointmentType === "blocked" ? "⛔ " + (lang === "es" ? "Bloqueado" : "Blocked") : "👤 " + a.nombre}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                          {appointmentType === "normal" && <span style={getOriginBadgeStyles(a.origen)}>{getOriginText(a.origen, lang)}</span>}
                          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(99,102,241,0.12)", color: "#6366f1", fontWeight: 600 }}>{a.hora.substring(0, 5)}</span>
                        </div>
                      </div>
                      {appointmentType === "normal" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ fontSize: 13, color: "var(--ec-text-muted)" }}>
                            {a.primera_visita ? "⭐ " + (lang === "es" ? "Primera visita" : "First visit") : "🔄 " + (lang === "es" ? "Visita sucesiva" : "Follow-up")}
                            {" • "}<span style={{ fontWeight: 500 }}>{a.servicio}</span>
                          </div>
                          {a.telefono && <div style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>📞 {a.telefono}</div>}
                          {a.correo && <div style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>✉️ {a.correo}</div>}
                          <div style={{ fontSize: 13, color: "var(--ec-text-dim)" }}>🏥 {a.seguro === "Sin seguro" || !a.seguro ? (lang === "es" ? "Sin seguro" : "No insurance") : a.seguro}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {appointmentType === "blocked" ? (
                          <button onClick={() => openAppointmentModal(a, "delete")} className="ec-btn-danger" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Eliminar" : "Delete"}</button>
                        ) : (
                          <>
                            <button onClick={() => openAppointmentModal(a, "edit")} className="ec-btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Editar" : "Edit"}</button>
                            <button onClick={() => openAppointmentModal(a, "delete")} className="ec-btn-danger" style={{ flex: 1, justifyContent: "center", padding: "7px 12px", fontSize: 13 }}>{lang === "es" ? "Eliminar" : "Delete"}</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>{lang === "es" ? "No hay citas próximas" : "No upcoming appointments"}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create appointment form */}
        <div className="ec-project-card" style={{ padding: "20px 24px", borderRadius: 14, gridColumn: "1 / -1" }}>
          <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)", marginBottom: 20 }}>
            🗓️ {lang === "es" ? "Agendar Nueva Cita" : "Schedule New Appointment"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>👤 {lang === "es" ? "Nombre del Paciente" : "Patient Name"}</label>
                <input type="text" value={appointmentForm.name} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, name: e.target.value }))} className="ec-field-input" placeholder={lang === "es" ? "Nombre completo" : "Full name"} />
              </div>
              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>📞 {lang === "es" ? "Teléfono" : "Phone"}</label>
                <input type="tel" value={appointmentForm.phone} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, phone: e.target.value }))} className="ec-field-input" placeholder={lang === "es" ? "Número de teléfono" : "Phone number"} />
              </div>
              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>✉️ Email</label>
                <input type="email" value={appointmentForm.email} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, email: e.target.value }))} className="ec-field-input" placeholder="email@example.com" />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>🏥 {lang === "es" ? "Tipo de Visita" : "Visit Type"}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <input type="checkbox" checked={appointmentForm.isFirstVisit} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, isFirstVisit: e.target.checked, service: e.target.checked ? "" : "Visita sucesiva" }))} style={{ width: 18, height: 18, accentColor: "var(--ec-brand)", cursor: "pointer" }} />
                  <label style={{ fontSize: 14, fontWeight: 500, color: "var(--ec-text)", cursor: "pointer" }}>{lang === "es" ? "Primera visita" : "First visit"}</label>
                </div>
              </div>

              {appointmentForm.isFirstVisit && (
                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>⚕️ {lang === "es" ? "Servicio" : "Service"}</label>
                  <input type="text" value={appointmentForm.service} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, service: e.target.value }))} className="ec-field-input" placeholder={lang === "es" ? "Especifique el servicio" : "Specify service"} />
                </div>
              )}

              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>🛡️ {lang === "es" ? "Seguro Médico" : "Medical Insurance"}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <input type="checkbox" checked={appointmentForm.insurance !== "Sin seguro"} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, insurance: e.target.checked ? "" : "Sin seguro" }))} style={{ width: 18, height: 18, accentColor: "var(--ec-brand)", cursor: "pointer" }} />
                  <label style={{ fontSize: 14, fontWeight: 500, color: "var(--ec-text)", cursor: "pointer" }}>{lang === "es" ? "Cuenta con seguro médico" : "Has medical insurance"}</label>
                </div>
              </div>

              {appointmentForm.insurance !== "Sin seguro" && (
                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>📝 {lang === "es" ? "Nombre del Seguro" : "Insurance Name"}</label>
                  <input type="text" value={appointmentForm.insurance} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, insurance: e.target.value }))} className="ec-field-input" placeholder={lang === "es" ? "Nombre del seguro" : "Insurance name"} />
                </div>
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>📅 {lang === "es" ? "Fecha" : "Date"}</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="date" value={appointmentForm.date} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, date: e.target.value, time: "" }))} className="ec-field-input" style={{ flex: 1 }} />
                  {selectedCalendarDay && appointmentForm.date !== selectedCalendarDay && (
                    <button onClick={() => setAppointmentForm((prev) => ({ ...prev, date: selectedCalendarDay, time: "" }))} className="ec-btn-secondary" style={{ padding: "10px 14px", fontSize: 13, whiteSpace: "nowrap" }}>
                      {lang === "es" ? "Usar día seleccionado" : "Use selected day"}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>⏰ {lang === "es" ? "Hora" : "Time"}</label>
                <select value={appointmentForm.time} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, time: e.target.value }))} className="ec-field-input" disabled={!appointmentForm.date}>
                  <option value="">-- {lang === "es" ? "Seleccionar hora" : "Select time"} --</option>
                  {appointmentForm.date && getAvailableHours(appointmentForm.date).map((hour) => {
                    const hourKey = hour.substring(0, 5);
                    const hourVal = `${hourKey}:00`;
                    const isBlocked = blockedDates.some((b) => b.hour.substring(0, 5) === hourKey && b.date === appointmentForm.date);
                    const isBooked = selectedDates.some((s) => s.hora.substring(0, 5) === hourKey && s.fecha === appointmentForm.date);
                    const [year, month, day] = appointmentForm.date.split("-").map(Number);
                    const isPastHour = new Date(year, month - 1, day, parseInt(hourKey.split(":")[0]), 0, 0, 0) < new Date();
                    if (!isBlocked && !isBooked) return <option key={hourVal} value={hourVal} disabled={isPastHour}>{hourKey}</option>;
                    return null;
                  })}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <button onClick={handleShowConfirmation} disabled={!appointmentForm.name || !appointmentForm.phone || !appointmentForm.date || !appointmentForm.time || (appointmentForm.isFirstVisit && !appointmentForm.service)} className="ec-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 16 }}>
                🚀 {lang === "es" ? "Crear Cita" : "Create Appointment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Block modal */}
      {showBlockModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div className="ec-project-card" style={{ padding: "28px 32px", borderRadius: 16, maxWidth: 520, width: "100%" }}>
            <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)", marginBottom: 20 }}>
              🔒 {lang === "es" ? "Bloquear Horarios" : "Block Time Slots"}
            </h3>
            <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
              <button onClick={() => { setBlockType("single"); setBlockForm({ date: "", startDate: "", endDate: "", startTime: "", endTime: "", blockAllDay: false }); }} style={{ padding: 14, borderRadius: 12, border: `2px solid ${blockType === "single" ? "#ef4444" : "var(--ec-border)"}`, background: blockType === "single" ? "rgba(239,68,68,0.08)" : "var(--ec-surface-1)", color: blockType === "single" ? "#ef4444" : "var(--ec-text-muted)", cursor: "pointer", transition: "all 160ms" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>1 {lang === "es" ? "Día" : "Day"}</div>
                  <div style={{ fontSize: 12 }}>{lang === "es" ? "Bloqueo simple" : "Single day block"}</div>
                </div>
              </button>
              <button onClick={() => { setBlockType("multiple"); setBlockForm({ date: "", startDate: "", endDate: "", startTime: "", endTime: "", blockAllDay: false }); }} style={{ padding: 14, borderRadius: 12, border: `2px solid ${blockType === "multiple" ? "#f97316" : "var(--ec-border)"}`, background: blockType === "multiple" ? "rgba(249,115,22,0.08)" : "var(--ec-surface-1)", color: blockType === "multiple" ? "#f97316" : "var(--ec-text-muted)", cursor: "pointer", transition: "all 160ms" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{lang === "es" ? "Varios Días" : "Multiple Days"}</div>
                  <div style={{ fontSize: 12 }}>{lang === "es" ? "Rango de fechas" : "Date range"}</div>
                </div>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {blockType === "single" ? (
                <div>
                  <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>📅 {lang === "es" ? "Fecha" : "Date"}</label>
                  <input type="date" value={blockForm.date} onChange={(e) => setBlockForm((prev) => ({ ...prev, date: e.target.value }))} className="ec-field-input" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>📅 {lang === "es" ? "Fecha Inicio" : "Start Date"}</label>
                    <input type="date" value={blockForm.startDate} onChange={(e) => { const d = e.target.value; setBlockForm((prev) => ({ ...prev, startDate: d, endDate: !prev.endDate || new Date(prev.endDate) < new Date(d) ? d : prev.endDate })); }} className="ec-field-input" />
                  </div>
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>📅 {lang === "es" ? "Fecha Fin" : "End Date"}</label>
                    <input type="date" value={blockForm.endDate} onChange={(e) => setBlockForm((prev) => ({ ...prev, endDate: e.target.value }))} min={blockForm.startDate} className="ec-field-input" />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                <input type="checkbox" checked={blockForm.blockAllDay} onChange={(e) => setBlockForm((prev) => ({ ...prev, blockAllDay: e.target.checked, startTime: "", endTime: "" }))} style={{ width: 18, height: 18, accentColor: "#ef4444", cursor: "pointer" }} />
                <label style={{ fontSize: 14, fontWeight: 500, color: "var(--ec-text)", cursor: "pointer" }}>{lang === "es" ? "Bloquear día completo" : "Block all day"}</label>
              </div>
              {!blockForm.blockAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>⏰ {lang === "es" ? "Hora Inicio" : "Start Time"}</label>
                    <select value={blockForm.startTime} onChange={(e) => setBlockForm((prev) => ({ ...prev, startTime: e.target.value, endTime: prev.endTime && parseInt(e.target.value.split(":")[0]) >= parseInt(prev.endTime.split(":")[0]) ? "" : prev.endTime }))} className="ec-field-input">
                      <option value="">-- {lang === "es" ? "Seleccionar" : "Select"} --</option>
                      {["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map((hour) => <option key={hour} value={`${hour}:00`}>{hour}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="ec-field-label" style={{ marginBottom: 6, display: "block" }}>⏰ {lang === "es" ? "Hora Fin" : "End Time"}</label>
                    <select value={blockForm.endTime} onChange={(e) => setBlockForm((prev) => ({ ...prev, endTime: e.target.value }))} className="ec-field-input" disabled={!blockForm.startTime}>
                      <option value="">-- {lang === "es" ? "Seleccionar" : "Select"} --</option>
                      {blockForm.startTime && ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].filter((hour) => parseInt(hour.split(":")[0]) > parseInt(blockForm.startTime.split(":")[0])).map((hour) => <option key={hour} value={`${hour}:00`}>{hour}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={() => { setShowBlockModal(false); setBlockForm({ date: "", startDate: "", endDate: "", startTime: "", endTime: "", blockAllDay: false }); }} className="ec-btn-secondary" style={{ padding: "10px 20px" }}>
                {lang === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button onClick={handleBlockSubmit} disabled={blockingDate || (blockType === "single" ? !blockForm.date : !blockForm.startDate || !blockForm.endDate)} className="ec-btn-danger" style={{ padding: "10px 20px", opacity: blockingDate ? 0.6 : 1 }}>
                {blockingDate ? (lang === "es" ? "Bloqueando..." : "Blocking...") : blockType === "single" ? (lang === "es" ? "Bloquear Horario(s)" : "Block Time Slot(s)") : (lang === "es" ? "Bloquear Rango" : "Block Range")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm appointment modal */}
      {showConfirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div className="ec-project-card" style={{ padding: "28px 32px", borderRadius: 16, maxWidth: 520, width: "100%" }}>
            <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)", marginBottom: 20 }}>
              ✅ {lang === "es" ? "Confirmar Cita" : "Confirm Appointment"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: "var(--ec-text-muted)", fontWeight: 500 }}>{lang === "es" ? "Paciente" : "Patient"}:</span>
              <span style={{ color: "var(--ec-text)", fontWeight: 600 }}>{appointmentForm.name}</span>
              <span style={{ color: "var(--ec-text-muted)", fontWeight: 500 }}>{lang === "es" ? "Teléfono" : "Phone"}:</span>
              <span style={{ color: "var(--ec-text)", fontWeight: 600 }}>{appointmentForm.phone}</span>
              {appointmentForm.email && (<><span style={{ color: "var(--ec-text-muted)", fontWeight: 500 }}>Email:</span><span style={{ color: "var(--ec-text)", fontWeight: 600, wordBreak: "break-all" }}>{appointmentForm.email}</span></>)}
              <span style={{ color: "var(--ec-text-muted)", fontWeight: 500 }}>{lang === "es" ? "Fecha" : "Date"}:</span>
              <span style={{ color: "var(--ec-text)", fontWeight: 600 }}>{formatDateForDisplay(appointmentForm.date, lang)}</span>
              <span style={{ color: "var(--ec-text-muted)", fontWeight: 500 }}>{lang === "es" ? "Hora" : "Time"}:</span>
              <span style={{ color: "var(--ec-text)", fontWeight: 600 }}>{appointmentForm.time.split(":")[0]}:{appointmentForm.time.split(":")[1]}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowConfirmModal(false)} className="ec-btn-secondary" style={{ padding: "10px 20px" }}>{lang === "es" ? "Cancelar" : "Cancel"}</button>
              <button onClick={handleCreateAppointment} className="ec-btn-primary" style={{ padding: "10px 20px" }}>{lang === "es" ? "Confirmar" : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Delete modal */}
      {showAppointmentModal && selectedAppointment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div className="ec-project-card" style={{ padding: "28px 32px", borderRadius: 16, maxWidth: 520, width: "100%" }}>
            <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, color: "var(--ec-text)", marginBottom: 20 }}>
              {modalType === "delete" ? "🗑️ " : "✏️ "}
              {modalType === "delete" ? (lang === "es" ? "Eliminar Cita" : "Delete Appointment") : (lang === "es" ? "Editar Cita" : "Edit Appointment")}
            </h3>
            {modalType === "delete" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ color: "var(--ec-text-muted)", fontSize: 14 }}>{lang === "es" ? "¿Estás seguro de que deseas eliminar esta cita?" : "Are you sure you want to delete this appointment?"}</p>
                <div style={{ padding: "12px 16px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <div style={{ fontSize: 13, color: "var(--ec-text-muted)" }}><strong style={{ color: "var(--ec-text)" }}>{lang === "es" ? "Paciente" : "Patient"}:</strong> {selectedAppointment.nombre}</div>
                  <div style={{ fontSize: 13, color: "var(--ec-text-muted)" }}><strong style={{ color: "var(--ec-text)" }}>{lang === "es" ? "Fecha" : "Date"}:</strong> {formatDateForDisplay(selectedAppointment.fecha, lang)}</div>
                  <div style={{ fontSize: 13, color: "var(--ec-text-muted)" }}><strong style={{ color: "var(--ec-text)" }}>{lang === "es" ? "Hora" : "Time"}:</strong> {selectedAppointment.hora}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="text" value={appointmentForm.name} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, name: e.target.value }))} className="ec-field-input" placeholder={lang === "es" ? "Nombre del paciente" : "Patient name"} />
                <input type="tel" value={appointmentForm.phone} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, phone: e.target.value }))} className="ec-field-input" placeholder={lang === "es" ? "Teléfono" : "Phone"} />
                <input type="email" value={appointmentForm.email} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, email: e.target.value }))} className="ec-field-input" placeholder="Email" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" value={appointmentForm.date} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, date: e.target.value }))} className="ec-field-input" />
                  <select value={appointmentForm.time} onChange={(e) => setAppointmentForm((prev) => ({ ...prev, time: e.target.value }))} className="ec-field-input" disabled={!appointmentForm.date}>
                    <option value="">-- {lang === "es" ? "Seleccionar" : "Select"} --</option>
                    {appointmentForm.date && getAvailableHours(appointmentForm.date).map((hour) => {
                      const hourKey = hour.substring(0, 5);
                      const hourVal = `${hourKey}:00`;
                      const isBlocked = blockedDates.some((b) => b.hour.substring(0, 5) === hourKey && b.date === appointmentForm.date);
                      const isBooked = selectedDates.some((s) => s.hora.substring(0, 5) === hourKey && s.fecha === appointmentForm.date && s.id !== selectedAppointment?.id);
                      return !isBlocked && !isBooked ? <option key={hourVal} value={hourVal}>{hourKey}</option> : null;
                    })}
                  </select>
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={() => { setShowAppointmentModal(false); setSelectedAppointment(null); setModalType(null); }} className="ec-btn-secondary" style={{ padding: "10px 20px" }}>{lang === "es" ? "Cancelar" : "Cancel"}</button>
              <button onClick={() => modalType === "delete" ? handleDeleteAppointment(selectedAppointment.id) : handleEditAppointment()} disabled={appointmentActionLoading} className={modalType === "delete" ? "ec-btn-danger" : "ec-btn-primary"} style={{ padding: "10px 20px", opacity: appointmentActionLoading ? 0.6 : 1 }}>
                {appointmentActionLoading ? (lang === "es" ? "Procesando..." : "Processing...") : modalType === "delete" ? (lang === "es" ? "Eliminar" : "Delete") : (lang === "es" ? "Actualizar" : "Update")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
