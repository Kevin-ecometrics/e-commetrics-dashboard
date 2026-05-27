"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Calendar, Lock, X, User, Mail, Phone, Clock } from "lucide-react";

type Appointment = {
  id: number;
  date: string;
  name?: string;
  email?: string;
  phone?: string;
};

const DAYS_OF_WEEK = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WORKING_HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

export default function AppointmentDashboard() {
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<Date | null>(null);
  const [blockStartTime, setBlockStartTime] = useState("");
  const [blockDuration, setBlockDuration] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1 + currentWeekOffset * 7);
  const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6 + currentWeekOffset * 7);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("https://bitescreadoresdesonrisas.com/api/citas/agendadas");
        setBookedAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleWeekChange = (direction: number) => {
    setCurrentWeekOffset(currentWeekOffset + direction);
    setSelectedDay(null);
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDrawerOpen(true);
  };

  const handleBlockTime = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!blockDate || !blockStartTime || !blockDuration) {
      alert("Por favor completa todos los campos");
      return;
    }
    try {
      const dates: string[] = [];
      const startHour = parseInt(blockStartTime);
      const duration = parseInt(blockDuration);
      const localDate = new Date(blockDate);
      const localDayOfWeek = localDate.getDay();

      if (localDayOfWeek === 0) {
        alert("No se pueden bloquear horarios los domingos");
        return;
      }
      if (localDayOfWeek === 5 && startHour + duration > 16) {
        alert("No se pueden bloquear horarios que incluyan después de las 4 PM los viernes");
        return;
      }

      for (let i = 0; i < duration; i++) {
        const date = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), startHour + i, 0, 0));
        date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
        dates.push(date.toISOString());
      }

      await axios.post("https://bitescreadoresdesonrisas.com/api/disponibilidad", { dates });
      const response = await axios.get("https://bitescreadoresdesonrisas.com/api/citas/agendadas");
      setBookedAppointments(response.data);
      setBlockDate(null);
      setBlockStartTime("");
      setBlockDuration("");
      alert("Horario bloqueado exitosamente");
    } catch (error) {
      console.error("Error blocking time:", error);
      alert("Error al bloquear horario");
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      await axios.delete(`https://bitescreadoresdesonrisas.com/api/citas/delete/${selectedAppointment.id}`);
      setBookedAppointments(bookedAppointments.filter((app) => app.id !== selectedAppointment.id));
      setIsDrawerOpen(false);
      setDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Error al eliminar la cita");
    }
  };

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    return hours <= 12 ? `${hours}:00 AM` : `${hours - 12}:00 PM`;
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", background: "var(--ec-surface-2)",
    border: "1px solid var(--ec-border)", borderRadius: 10, outline: "none",
    color: "var(--ec-text)", fontSize: 14, fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--ec-brand)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p className="h-eyebrow">Cargando citas…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 24px" }} className="fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="h-eyebrow" style={{ marginBottom: 8 }}>⎯⎯⎯  BITES CREADORES DE SONRISAS</div>
        <h1 className="font-serif" style={{ fontSize: 38, lineHeight: 1, letterSpacing: "-0.025em", marginBottom: 6 }}>
          Gestión de Citas
        </h1>
        <p style={{ color: "var(--ec-text-dim)", fontSize: 14 }}>
          Visualiza y gestiona las citas de la semana.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, alignItems: "flex-start" }}>
        {/* Appointments section */}
        <div className="ec-project-card" style={{ borderRadius: 14, overflow: "hidden" }}>
          {/* Week nav bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px", background: "var(--ec-brand)",
          }}>
            <button
              onClick={() => handleWeekChange(-1)}
              style={{ background: "rgba(255,255,255,0.2)", border: 0, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
            >
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white", fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11.5, letterSpacing: "0.08em" }}>
              <Calendar size={13} />
              <span>{formatDate(startOfWeek)} — {formatDate(endOfWeek)}</span>
            </div>
            <button
              onClick={() => handleWeekChange(1)}
              style={{ background: "rgba(255,255,255,0.2)", border: 0, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day rows */}
          <div>
            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const dayAppointments = bookedAppointments.filter((app) => {
                const appDate = new Date(app.date);
                return appDate.getDay() === dayIndex + 1 && appDate >= startOfWeek && appDate <= endOfWeek;
              });
              const isOpen = selectedDay === day;

              return (
                <div key={day} style={{ borderBottom: "1px solid var(--ec-border)" }}>
                  <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: dayAppointments.length > 0 ? "var(--ec-brand)" : "var(--ec-surface-2)",
                        color: dayAppointments.length > 0 ? "white" : "var(--ec-text-dim)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 600,
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                      }}>
                        {dayAppointments.length}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ec-text)" }}>{day}</span>
                    </div>
                    <button
                      onClick={() => setSelectedDay(isOpen ? null : day)}
                      style={{ background: "none", border: 0, cursor: "pointer", color: "var(--ec-brand)", fontSize: 12, padding: "4px 8px" }}
                    >
                      {isOpen ? "▲" : "▼"}
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 20px 16px" }}>
                      {dayAppointments.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {dayAppointments
                            .sort((a, b) => new Date(a.date).getHours() - new Date(b.date).getHours())
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                onClick={() => handleSelectAppointment(appointment)}
                                style={{
                                  padding: "12px 14px",
                                  background: "var(--ec-surface-2)",
                                  border: "1px solid var(--ec-border)",
                                  borderRadius: 10, cursor: "pointer",
                                }}
                              >
                                {appointment.name ? (
                                  <>
                                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--ec-text)", marginBottom: 3 }}>
                                      {appointment.name}
                                    </p>
                                    <p style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>
                                      {formatTime(new Date(appointment.date))} · {appointment.email} · {appointment.phone}
                                    </p>
                                  </>
                                ) : (
                                  <p style={{ color: "var(--ec-text-dim)", fontSize: 13 }}>
                                    Horario bloqueado: {formatTime(new Date(appointment.date))}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p style={{ color: "var(--ec-text-dim)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                          No hay citas programadas
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Block time panel */}
        <div className="ec-project-card" style={{ padding: 20, borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <Lock size={16} style={{ color: "#F87171" }} />
            <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 400 }}>Bloquear Horarios</h2>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Fecha</label>
            <input
              type="date"
              style={inputStyle}
              onChange={(e) => setBlockDate(new Date(e.target.value))}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {blockDate && (
            <form onSubmit={handleBlockTime} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Hora de inicio</label>
                <select style={inputStyle} value={blockStartTime} onChange={(e) => setBlockStartTime(e.target.value)} required>
                  <option value="">Seleccionar hora</option>
                  {WORKING_HOURS.map((hour) => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="h-eyebrow" style={{ display: "block", marginBottom: 6 }}>Duración (horas)</label>
                <select style={inputStyle} value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)} required>
                  <option value="">Seleccionar duración</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <option key={d} value={d}>{d} hora{d > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                style={{
                  padding: "11px", background: "#F87171", color: "white",
                  border: 0, borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4,
                }}
              >
                <Lock size={13} /> Bloquear Horario
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Detail side drawer */}
      {isDrawerOpen && selectedAppointment && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}
          onClick={() => { setIsDrawerOpen(false); setDeleteConfirm(false); }}
        >
          <div
            className="ec-project-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 400, height: "100%",
              borderRadius: "16px 0 0 16px", padding: 24,
              overflowY: "auto", display: "flex", flexDirection: "column", gap: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 400 }}>Detalles de la Cita</h2>
              <button
                onClick={() => { setIsDrawerOpen(false); setDeleteConfirm(false); }}
                style={{ background: "none", border: 0, cursor: "pointer", color: "var(--ec-text-dim)", padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedAppointment.name && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <User size={14} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
                  <div>
                    <div className="h-eyebrow" style={{ marginBottom: 2 }}>NOMBRE</div>
                    <div style={{ fontSize: 14, color: "var(--ec-text)" }}>{selectedAppointment.name}</div>
                  </div>
                </div>
              )}
              {selectedAppointment.email && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <Mail size={14} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
                  <div>
                    <div className="h-eyebrow" style={{ marginBottom: 2 }}>EMAIL</div>
                    <div style={{ fontSize: 14, color: "var(--ec-text)" }}>{selectedAppointment.email}</div>
                  </div>
                </div>
              )}
              {selectedAppointment.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                  <Phone size={14} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
                  <div>
                    <div className="h-eyebrow" style={{ marginBottom: 2 }}>TELÉFONO</div>
                    <div style={{ fontSize: 14, color: "var(--ec-text)" }}>{selectedAppointment.phone}</div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 10 }}>
                <Clock size={14} style={{ color: "var(--ec-brand)", flexShrink: 0 }} />
                <div>
                  <div className="h-eyebrow" style={{ marginBottom: 2 }}>FECHA Y HORA</div>
                  <div style={{ fontSize: 14, color: "var(--ec-text)" }}>
                    {formatDate(new Date(selectedAppointment.date))} · {formatTime(new Date(selectedAppointment.date))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto" }}>
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    width: "100%", padding: "12px",
                    background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 10, color: "#F87171", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Eliminar Cita
                </button>
              ) : (
                <div style={{ padding: 16, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: "var(--ec-text)", marginBottom: 12 }}>¿Confirmar eliminación?</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      style={{ flex: 1, padding: "9px", background: "var(--ec-surface-2)", border: "1px solid var(--ec-border)", borderRadius: 8, color: "var(--ec-text)", fontSize: 12, cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteAppointment}
                      style={{ flex: 1, padding: "9px", background: "#F87171", border: 0, borderRadius: 8, color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
