"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLang } from "@/app/context/LangContext";
import axios from "axios";
import { ChevronLeft, ChevronRight, Lock, Calendar, X, CheckCircle } from "lucide-react";

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
const MONTH_NAMES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

  const fetchSelectedDates = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/fechas-seleccionadas`, { timeout: 10000 });
      const items: Appointment[] = Array.isArray(res.data) ? res.data : [];
      setSelectedDates(items.map((item) => ({ ...item, dateTime: new Date(`${item.date}T${item.hour ?? "00:00"}`) })).sort((a, b) => a.dateTime!.getTime() - b.dateTime!.getTime()));
    } catch {
      setError(lang === "es" ? "Error al cargar las citas" : "Error loading appointments");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fechas-bloqueadas`, { timeout: 10000 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setBlockedDates(Array.isArray(res.data) ? res.data.map((d: any) => ({ id: d.id, date: d.date, hour: d.hour })) : []);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSelectedDates(), fetchBlockedDates()]);
  }, [fetchSelectedDates, fetchBlockedDates]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const handleBlockDate = async () => {
    if (!blockDateInput || !blockHourInput || blockingDate) return;
    if (blockedDates.some((d) => d.date === blockDateInput && d.hour === blockHourInput)) return;
    setBlockingDate(true);
    try {
      await axios.post(`${API_BASE_URL}/bloquear-fecha`, { date: blockDateInput, hour: blockHourInput });
      await refreshAll();
      setBlockDateInput(""); setBlockHourInput("");
    } catch (err) {
      console.error("Error blocking date:", err);
    } finally {
      setBlockingDate(false);
    }
  };

  const handleUnblockDate = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/desbloquear-fecha/${id}`);
      await refreshAll();
    } catch (err) {
      console.error("Error unblocking date:", err);
    }
  };

  const navigateMonth = (dir: "prev" | "next") => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + (dir === "next" ? 1 : -1), 1));
  };
  const goToToday = () => setCurrentDate(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const firstDayOfWeek = firstOfMonth.getDay();
    const days: CalendarDay[] = [];

    const prevMonthLast = new Date(year, month, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLast.getDate() - i;
      const obj = new Date(prevMonthLast.getFullYear(), prevMonthLast.getMonth(), d);
      const dateStr = isoYMD(obj);
      days.push({ day: obj.getDate(), dateStr, isCurrentMonth: false, isToday: false, isBlocked: blockedDates.some((b) => b.date === dateStr), isBooked: selectedDates.some((s) => s.date === dateStr), appointmentCount: selectedDates.filter((s) => s.date === dateStr).length });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const obj = new Date(year, month, d);
      const dateStr = isoYMD(obj);
      days.push({ day: d, dateStr, isCurrentMonth: true, isToday: obj.toDateString() === today.toDateString(), isBlocked: blockedDates.some((b) => b.date === dateStr), isBooked: selectedDates.some((s) => s.date === dateStr), appointmentCount: selectedDates.filter((s) => s.date === dateStr).length });
    }
    const remaining = 42 - days.length;
    const nextMonthFirst = new Date(year, month + 1, 1);
    for (let d = 1; d <= remaining; d++) {
      const obj = new Date(nextMonthFirst.getFullYear(), nextMonthFirst.getMonth(), d);
      const dateStr = isoYMD(obj);
      days.push({ day: d, dateStr, isCurrentMonth: false, isToday: false, isBlocked: blockedDates.some((b) => b.date === dateStr), isBooked: selectedDates.some((s) => s.date === dateStr), appointmentCount: selectedDates.filter((s) => s.date === dateStr).length });
    }
    return days;
  }, [currentDate, blockedDates, selectedDates]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return selectedDates.filter((a) => a.dateTime && a.dateTime >= now);
  }, [selectedDates]);

  const formatDateTime = useCallback((date: string, hour: string) => {
    const dt = new Date(`${date}T${hour}`);
    return dt.toLocaleString(lang === "es" ? "es-MX" : "en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }, [lang]);

  const monthNames = lang === "es" ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const inputStyle = {
    padding: "10px 14px",
    background: "var(--ec-surface-2)",
    border: "1px solid var(--ec-border)",
    borderRadius: 10,
    outline: "none",
    color: "var(--ec-text)",
    fontSize: 14,
    fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "28px 24px" }} className="fade-in-up">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>⎯⎯⎯  REFORMA DENTAL</div>
          <h1 className="font-serif" style={{ fontSize: 40, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 8 }}>
            {lang === "es" ? "Calendario · Reforma" : "Calendar · Reforma"}
          </h1>
          <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>
            {lang === "es" ? "Gestiona las fechas y horarios bloqueados de Reforma Dental." : "Manage blocked dates and times for Reforma Dental."}
          </p>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 100, background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          {lang === "es" ? "Sistema activo" : "System active"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 18, marginBottom: 18 }}>
        {/* Calendar */}
        <div className="ec-project-card" style={{ padding: 24, borderRadius: 14 }}>
          {/* Nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button onClick={() => navigateMonth("prev")} style={{ width: 36, height: 36, borderRadius: 8, background: "none", border: "1px solid var(--ec-border)", color: "var(--ec-brand)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 400, textTransform: "capitalize" }}>
              {monthNames[month]} {year}
            </h3>
            <button onClick={() => navigateMonth("next")} style={{ width: 36, height: 36, borderRadius: 8, background: "none", border: "1px solid var(--ec-border)", color: "var(--ec-brand)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* DOW headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ec-text-dim)", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {calendarDays.map((day, idx) => {
              const borderColor = day.isBlocked ? "#F87171" : day.isToday ? "var(--ec-brand)" : "var(--ec-border)";
              const bg = day.isBlocked ? "rgba(248,113,113,0.12)" : day.isToday ? "rgba(189,21,92,0.12)" : day.isBooked ? "rgba(16,185,129,0.1)" : "var(--ec-surface-1)";
              const textColor = !day.isCurrentMonth ? "var(--ec-text-dim)" : day.isToday ? "var(--ec-brand)" : "var(--ec-text)";
              return (
                <div key={idx} style={{ minHeight: 56, padding: 6, border: `1px solid ${borderColor}`, borderRadius: 10, background: bg, color: textColor, fontSize: 13, fontWeight: day.isToday ? 600 : 400, display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative" }}>
                  <span>{day.day}</span>
                  {day.appointmentCount > 0 && (
                    <span style={{ marginTop: "auto", alignSelf: "center", width: 20, height: 20, borderRadius: 6, background: "#10B981", color: "white", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jetbrains-mono), monospace" }}>{day.appointmentCount}</span>
                  )}
                  {day.isBlocked && <span style={{ position: "absolute", bottom: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#F87171" }} />}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ec-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={goToToday} style={{ padding: "7px 14px", background: "var(--ec-brand)", color: "white", border: 0, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {lang === "es" ? "Hoy" : "Today"}
            </button>
            <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--ec-text-dim)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ec-brand)" }} />{lang === "es" ? "Hoy" : "Today"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />{lang === "es" ? "Con citas" : "Booked"}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F87171" }} />{lang === "es" ? "Bloqueado" : "Blocked"}</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Upcoming */}
          <div className="ec-project-card" style={{ padding: 20, borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Calendar size={16} style={{ color: "var(--ec-brand)" }} />
              <h3 className="font-serif" style={{ fontSize: 19, fontWeight: 400 }}>
                {lang === "es" ? "Próximas citas" : "Upcoming"}
              </h3>
              <span style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 100, background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11 }}>
                {upcomingAppointments.length}
              </span>
            </div>
            {loading ? (
              <p className="h-eyebrow">{lang === "es" ? "Cargando…" : "Loading…"}</p>
            ) : error ? (
              <p style={{ color: "#F87171", fontSize: 13 }}>{error}</p>
            ) : upcomingAppointments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                {upcomingAppointments.map((a, idx) => (
                  <div key={idx} style={{ padding: "8px 12px", background: "rgba(189,21,92,0.08)", border: "1px solid rgba(189,21,92,0.2)", borderRadius: 8, fontSize: 12, color: "var(--ec-text)" }}>
                    {formatDateTime(a.date, a.hour)}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "16px 0", textAlign: "center", color: "var(--ec-text-dim)", fontSize: 13 }}>
                <CheckCircle size={20} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                {lang === "es" ? "Sin citas próximas" : "No upcoming appointments"}
              </div>
            )}
          </div>

          {/* Block form */}
          <div className="ec-project-card" style={{ padding: 20, borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Lock size={16} style={{ color: "#F87171" }} />
              <h3 className="font-serif" style={{ fontSize: 19, fontWeight: 400 }}>
                {lang === "es" ? "Bloquear fecha" : "Block date"}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Fecha</label>
                <input type="date" value={blockDateInput} onChange={(e) => setBlockDateInput(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Hora</label>
                <select value={blockHourInput} onChange={(e) => setBlockHourInput(e.target.value)} disabled={!blockDateInput} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" as const, cursor: blockDateInput ? "pointer" : "not-allowed" }}>
                  <option value="">— {lang === "es" ? "Hora" : "Hour"} —</option>
                  {Array.from({ length: 9 }, (_, i) => 9 + i).map((h) => {
                    const hourStr = `${h.toString().padStart(2, "0")}:00`;
                    const isBlocked = blockedDates.some((b) => b.date === blockDateInput && b.hour === hourStr);
                    const isBooked = selectedDates.some((s) => s.date === blockDateInput && s.hour === hourStr);
                    const today = new Date();
                    const [y, mo, d] = blockDateInput ? blockDateInput.split("-").map(Number) : [0, 0, 0];
                    const selDate = new Date(y, mo - 1, d);
                    const hourDate = new Date(selDate); hourDate.setHours(h, 0, 0, 0);
                    const isToday = blockDateInput ? selDate.toDateString() === today.toDateString() : false;
                    const isPast = isToday && hourDate <= today;
                    return (
                      <option key={hourStr} value={hourStr} disabled={isBlocked || isBooked || isPast}>
                        {hourStr}{isBlocked ? ` (${lang === "es" ? "Bloqueado" : "Blocked"})` : isBooked ? ` (${lang === "es" ? "Paciente" : "Patient"})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button onClick={handleBlockDate} disabled={blockingDate || !blockDateInput || !blockHourInput}
                style={{ padding: "11px", background: !blockDateInput || !blockHourInput ? "var(--ec-surface-2)" : "#F87171", color: !blockDateInput || !blockHourInput ? "var(--ec-text-dim)" : "white", border: 0, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: !blockDateInput || !blockHourInput ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Lock size={13} /> {lang === "es" ? "Bloquear" : "Block"}
              </button>
            </div>

            {blockedDates.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--ec-border)" }}>
                <div className="h-eyebrow" style={{ marginBottom: 8 }}>{lang === "es" ? "BLOQUEOS ACTIVOS" : "ACTIVE BLOCKS"}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {blockedDates.map((d) => {
                    const today = new Date();
                    const [y, mo, day] = d.date.split("-").map(Number);
                    const date = new Date(y, mo - 1, day);
                    const [hStr, mStr] = d.hour.split(":");
                    const hourDate = new Date(date); hourDate.setHours(Number(hStr), Number(mStr), 0, 0);
                    const isToday = date.toDateString() === today.toDateString();
                    if (isToday && hourDate <= today) return null;
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(248,113,113,0.1)", borderRadius: 8, fontSize: 12.5 }}>
                        <Lock size={12} style={{ color: "#F87171", flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{d.date} · {d.hour}</span>
                        <button onClick={() => handleUnblockDate(d.id)} style={{ width: 20, height: 20, borderRadius: 4, background: "none", border: 0, color: "#F87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
