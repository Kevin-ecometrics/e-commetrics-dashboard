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
  precio?: number;
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
type AppointmentType = "normal" | "blocked";
type BlockType = "single" | "multiple";

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

// Función para obtener fecha en formato YYYY-MM-DD sin problemas de zona horaria
function isoYMD(date: Date) {
  // Usar fecha local para evitar problemas de UTC
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Función para parsear fecha y hora local sin problemas de zona horaria
function parseLocalDateTime(dateStr: string, hourStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = hourStr.split(":").map(Number);
  // Crear fecha en zona horaria local
  return new Date(year, month - 1, day, hour, minute);
}

// Función para obtener el día de la semana (0 = Domingo, 6 = Sábado)
function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

// Función para obtener horas disponibles según el día
function getAvailableHours(dateStr: string): string[] {
  const dayOfWeek = getDayOfWeek(dateStr);

  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
    return ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00"];
  } else if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
    return ["10:00", "11:00", "12:00", "13:00"];
  }
  return [];
}

// Función para obtener fechas entre un rango
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

// Función para formatear fecha para mostrar (corregida para evitar problemas de zona horaria)
function formatDateForDisplay(dateStr: string, lang: "es" | "en"): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Crear fecha en mediodía para evitar problemas de zona horaria
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return date.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Función para formatear fecha simple (sin día de la semana)
function formatDateSimple(dateStr: string, lang: "es" | "en"): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return date.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Función para obtener el texto del origen
function getOriginText(
  origen: string | undefined | null,
  lang: "es" | "en"
): string {
  if (origen === "dashboard") {
    return lang === "es" ? "Dashboard" : "Dashboard";
  }
  return lang === "es" ? "Página Web" : "Web Page";
}

// Función para obtener los estilos del badge según el origen
function getOriginBadgeStyles(origen: string | undefined | null) {
  if (!origen || origen === "null" || origen === "undefined") {
    return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30";
  }

  const origenStr = String(origen).trim().toLowerCase();

  const styles: Record<string, string> = {
    dashboard:
      "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30",
    web: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30",
    paginaweb:
      "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30",
    sitio:
      "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30",
    telefono:
      "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30",
    app: "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30",
    otro: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30",
  };

  return (
    styles[origenStr] ||
    "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30"
  );
}

export default function CalendarMonge() {
  const { lang } = useLang();

  // Obtener fecha actual al inicio
  const currentDateString = useMemo(() => isoYMD(new Date()), []);

  // Estados principales
  const [selectedDates, setSelectedDates] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blockingDate, setBlockingDate] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estados para citas del día seleccionado
  const [selectedCalendarDay, setSelectedCalendarDay] =
    useState<string>(currentDateString);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<
    Appointment[]
  >([]);

  // Estados para formularios
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormData>({
    name: "",
    phone: "",
    email: "",
    isFirstVisit: false,
    service: "Visita sucesiva",
    insurance: "Sin seguro",
    date: currentDateString,
    time: "",
  });

  // Estados para modales
  const [showAppointmentModal, setShowAppointmentModal] =
    useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [appointmentActionLoading, setAppointmentActionLoading] =
    useState<boolean>(false);

  // Estado unificado para bloqueo
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [blockType, setBlockType] = useState<BlockType>("single");
  const [blockForm, setBlockForm] = useState({
    date: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    blockAllDay: false,
  });

  // Función para actualizar citas del día seleccionado
  const updateSelectedDayAppointments = useCallback(
    (appointments: Appointment[], selectedDate: string) => {
      const dayAppointments = appointments
        .filter((apt) => apt.fecha === selectedDate)
        .sort((a, b) => a.hora.localeCompare(b.hora));
      setSelectedDayAppointments(dayAppointments);
    },
    []
  );

  // Cargar citas
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
          return {
            ...item,
            fecha: fechaStr,
            dateTime,
            origen: item.origen || undefined,
          };
        })
        .sort((a, b) => a.dateTime!.getTime() - b.dateTime!.getTime());

      setSelectedDates(normalized);
      updateSelectedDayAppointments(normalized, selectedCalendarDay);
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
  }, [lang, selectedCalendarDay, updateSelectedDayAppointments]);

  // Cargar bloqueadas
  const fetchBlockedDates = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fechas-bloqueadas/`);
      const normalized: BlockedDate[] = Array.isArray(res.data)
        ? res.data.map((d: BlockedDate) => ({
            id: d.id,
            date: d.date,
            hour: d.hour,
          }))
        : [];
      setBlockedDates(normalized);
    } catch (err) {
      console.error("Error fetching blocked dates:", err);
    }
  }, []);

  // Refrescar todo
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchSelectedDates(), fetchBlockedDates()]);
  }, [fetchSelectedDates, fetchBlockedDates]);

  // Inicializar componente
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Manejar bloqueo unificado
  const handleBlockSubmit = async () => {
    if (blockType === "single" && !blockForm.date) return;
    if (
      blockType === "multiple" &&
      (!blockForm.startDate || !blockForm.endDate)
    )
      return;

    setBlockingDate(true);
    try {
      let totalBlocked = 0;
      const datesToProcess: string[] = [];

      // Determinar fechas a procesar
      if (blockType === "single") {
        datesToProcess.push(blockForm.date);
      } else {
        const start = new Date(blockForm.startDate + "T00:00:00");
        const end = new Date(blockForm.endDate + "T23:59:59");

        if (start > end) {
          alert(
            lang === "es"
              ? "La fecha de inicio debe ser anterior a la fecha final"
              : "Start date must be before end date"
          );
          return;
        }

        const current = new Date(start);
        while (current <= end) {
          const dateStr = current.toISOString().split("T")[0];
          datesToProcess.push(dateStr);
          current.setDate(current.getDate() + 1);
        }
      }

      // Procesar cada fecha
      for (const dateStr of datesToProcess) {
        const availableHours = getAvailableHours(dateStr);
        if (availableHours.length === 0) continue;

        const hoursToBlock: string[] = [];

        if (blockForm.blockAllDay) {
          hoursToBlock.push(
            ...availableHours.map((hour) => {
              return hour.includes(":") ? hour + ":00" : hour + ":00:00";
            })
          );
        } else if (blockForm.startTime && blockForm.endTime) {
          const startHour = parseInt(blockForm.startTime.split(":")[0]);
          const endHour = parseInt(blockForm.endTime.split(":")[0]);

          if (startHour >= endHour) {
            alert(
              lang === "es"
                ? "La hora de inicio debe ser anterior a la hora final"
                : "Start time must be before end time"
            );
            setBlockingDate(false);
            return;
          }

          for (let hour = startHour; hour < endHour; hour++) {
            const hourStr = `${hour.toString().padStart(2, "0")}:00`;
            if (
              availableHours.some((available) =>
                available.startsWith(hourStr.substring(0, 5))
              )
            ) {
              hoursToBlock.push(hourStr);
            }
          }
        }

        // Bloquear cada hora
        for (const hour of hoursToBlock) {
          const hourFormatted = hour.includes(":") ? hour : hour + ":00";

          const isAlreadyBlocked = blockedDates.some(
            (d) => d.date === dateStr && d.hour === hourFormatted
          );
          const isAlreadyBooked = selectedDates.some(
            (s) => s.fecha === dateStr && s.hora === hourFormatted
          );

          if (!isAlreadyBlocked && !isAlreadyBooked) {
            await axios.post(`${API_BASE_URL}/bloquear-fecha/`, {
              date: dateStr,
              hour: hourFormatted,
            });
            totalBlocked++;
          }
        }
      }

      await refreshAll();

      // Resetear formulario y cerrar modal
      setBlockForm({
        date: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        blockAllDay: false,
      });
      setShowBlockModal(false);

      // Mostrar mensaje de éxito
      alert(
        lang === "es"
          ? `✅ Se bloquearon ${totalBlocked} horarios exitosamente`
          : `✅ ${totalBlocked} time slots blocked successfully`
      );
    } catch (err) {
      console.error("Error blocking dates:", err);
      alert(
        lang === "es"
          ? "❌ Error al bloquear los horarios"
          : "❌ Error blocking time slots"
      );
    } finally {
      setBlockingDate(false);
    }
  };

  // Funciones para citas
  const handleDeleteAppointment = async (id: number) => {
    setAppointmentActionLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/appointments/${id}`);
      await refreshAll();

      const updatedDayAppointments = selectedDayAppointments.filter(
        (appointment) => appointment.id !== id
      );
      setSelectedDayAppointments(updatedDayAppointments);

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
      await axios.put(
        `${API_BASE_URL}/api/appointments/${selectedAppointment.id}`,
        { ...appointmentForm, lang }
      );

      await refreshAll();

      const freshResponse = await axios.get(
        `${API_BASE_URL}/api/appointments/`,
        { timeout: 10000 }
      );
      const freshItems: Appointment[] = Array.isArray(freshResponse.data)
        ? freshResponse.data
        : [];
      updateSelectedDayAppointments(freshItems, selectedCalendarDay);

      setShowAppointmentModal(false);
      setSelectedAppointment(null);
      setModalType(null);
      setAppointmentForm({
        name: "",
        phone: "",
        email: "",
        isFirstVisit: false,
        service: "Visita sucesiva",
        insurance: "Sin seguro",
        date: currentDateString,
        time: "",
      });
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert(
        lang === "es"
          ? "❌ Error al actualizar la cita"
          : "❌ Error updating appointment"
      );
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

  // Funciones utilitarias
  const getAppointmentType = (appointment: Appointment): AppointmentType => {
    return appointment.nombre?.toUpperCase() === "BLOQUEADO"
      ? "blocked"
      : "normal";
  };

  const getAvailableHoursForDay = (dateStr: string) => {
    const availableHours = getAvailableHours(dateStr);
    return availableHours.filter((hour) => {
      const hourStr = `${hour}:00`;
      const isBlocked = blockedDates.some(
        (b) => b.date === dateStr && b.hour === hourStr
      );
      const isBooked = selectedDates.some(
        (s) => s.fecha === dateStr && s.hora === hourStr
      );

      const [year, month, day] = dateStr.split("-").map(Number);
      const hourNumber = parseInt(hour.split(":")[0]);
      const currentDate = new Date(year, month - 1, day, hourNumber, 0, 0, 0);
      const isPastHour = currentDate < new Date();

      return !isBlocked && !isBooked && !isPastHour;
    });
  };

  const getBlockedHoursForDay = (dateStr: string) => {
    const availableHours = getAvailableHours(dateStr);
    return availableHours.filter((hour) => {
      const hourStr = `${hour}:00`;
      const isBlocked = blockedDates.some(
        (b) => b.date === dateStr && b.hour === hourStr
      );
      const isBooked = selectedDates.some(
        (s) => s.fecha === dateStr && s.hora === hourStr
      );
      return isBlocked && !isBooked;
    });
  };

  const getBookedHoursForDay = (dateStr: string) => {
    return selectedDates
      .filter((s) => s.fecha === dateStr)
      .map((s) => s.hora.substring(0, 5));
  };

  // Obtener todos los horarios del día con su estado
  const getCompleteDaySchedule = useCallback(() => {
    if (!selectedCalendarDay) return [];

    const availableHours = getAvailableHours(selectedCalendarDay);
    const scheduleItems: Array<{
      type: "appointment" | "blocked" | "available";
      time: string;
      data?: Appointment | BlockedDate;
      hourStr: string;
      isPast: boolean;
    }> = [];

    // Obtener citas del día
    const dayAppointments = selectedDates.filter(
      (apt) => apt.fecha === selectedCalendarDay
    );

    // Obtener bloqueos del día
    const dayBlocked = blockedDates.filter(
      (block) => block.date === selectedCalendarDay
    );

    // Procesar cada hora disponible
    for (const hour of availableHours) {
      const hourStr = `${hour}:00`;
      const [year, month, day] = selectedCalendarDay.split("-").map(Number);
      const hourNumber = parseInt(hour.split(":")[0]);
      const slotDateTime = new Date(year, month - 1, day, hourNumber, 0, 0, 0);
      const isPastHour = slotDateTime < new Date();

      // Buscar si hay cita en esta hora
      const appointment = dayAppointments.find((apt) => apt.hora === hourStr);

      // Buscar si está bloqueada
      const blocked = dayBlocked.find((block) => block.hour === hourStr);

      if (appointment) {
        scheduleItems.push({
          type: "appointment",
          time: hour,
          data: appointment,
          hourStr,
          isPast: isPastHour,
        });
      } else if (blocked) {
        scheduleItems.push({
          type: "blocked",
          time: hour,
          data: blocked,
          hourStr,
          isPast: isPastHour,
        });
      } else if (!isPastHour) {
        scheduleItems.push({
          type: "available",
          time: hour,
          hourStr,
          isPast: false,
        });
      }
    }

    return scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedCalendarDay, selectedDates, blockedDates]);

  // Horarios completos del día
  const [completeDaySchedule, setCompleteDaySchedule] = useState<
    Array<{
      type: "appointment" | "blocked" | "available";
      time: string;
      data?: Appointment | BlockedDate;
      hourStr: string;
      isPast: boolean;
    }>
  >([]);

  // Actualizar el horario completo cuando cambien los datos
  useEffect(() => {
    if (selectedCalendarDay) {
      const schedule = getCompleteDaySchedule();
      setCompleteDaySchedule(schedule);
    } else {
      setCompleteDaySchedule([]);
    }
  }, [
    selectedCalendarDay,
    selectedDates,
    blockedDates,
    getCompleteDaySchedule,
  ]);

  // Navegación del calendario
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

  const goToToday = () => {
    const today = new Date();
    const todayStr = isoYMD(today);
    setCurrentDate(today);
    setSelectedCalendarDay(todayStr);

    updateSelectedDayAppointments(selectedDates, todayStr);

    setAppointmentForm((prev) => ({
      ...prev,
      date: todayStr,
    }));
  };

  // Manejar selección de día en calendario
  const handleDayClick = (dateStr: string) => {
    const dayAppointments = selectedDates
      .filter((apt) => apt.fecha === dateStr)
      .sort((a, b) => a.hora.localeCompare(b.hora));

    setSelectedDayAppointments(dayAppointments);
    setSelectedCalendarDay(dateStr);
    setAppointmentForm((prev) => ({
      ...prev,
      date: dateStr,
      time: "",
    }));
  };

  // Días del calendario
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
    const days: CalendarDay[] = [];

    // Días del mes anterior
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
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedCalendarDay,
        isBlocked: blockedDates.some((b) => b.date === dateStr),
        isBooked: selectedDates.some((s) => s.fecha === dateStr),
        appointmentCount: selectedDates.filter((s) => s.fecha === dateStr)
          .length,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const obj = new Date(year, month, d);
      const dateStr = isoYMD(obj);
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedCalendarDay,
        isBlocked: blockedDates.some((b) => b.date === dateStr),
        isBooked: selectedDates.some((s) => s.fecha === dateStr),
        appointmentCount: selectedDates.filter((s) => s.fecha === dateStr)
          .length,
      });
    }

    // Días del mes siguiente
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
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedCalendarDay,
        isBlocked: blockedDates.some((b) => b.date === dateStr),
        isBooked: selectedDates.some((s) => s.fecha === dateStr),
        appointmentCount: selectedDates.filter((s) => s.fecha === dateStr)
          .length,
      });
    }

    return days;
  }, [currentDate, blockedDates, selectedDates, selectedCalendarDay]);

  // Próximas citas (todas las citas futuras)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return selectedDates
      .filter((a) => a.dateTime && a.dateTime >= now)
      .sort((a, b) => a.dateTime!.getTime() - b.dateTime!.getTime());
  }, [selectedDates]);

  // Manejar creación de cita
  const handleCreateAppointment = async () => {
    setShowConfirmModal(false);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments-dashboard`,
        { ...appointmentForm, lang, origen: "dashboard" }
      );

      if (response.status === 201) {
        setAppointmentForm({
          name: "",
          phone: "",
          email: "",
          isFirstVisit: false,
          service: "Visita sucesiva",
          insurance: "Sin seguro",
          date: currentDateString,
          time: "",
        });
        await refreshAll();
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleShowConfirmation = () => {
    setShowConfirmModal(true);
  };

  const monthNames = lang === "es" ? MONTH_NAMES_ES : MONTH_NAMES_EN;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calcular horas para el día seleccionado
  const availableHoursForSelectedDay = selectedCalendarDay
    ? getAvailableHoursForDay(selectedCalendarDay)
    : [];
  const blockedHoursForSelectedDay = selectedCalendarDay
    ? getBlockedHoursForDay(selectedCalendarDay)
    : [];
  const bookedHoursForSelectedDay = selectedCalendarDay
    ? getBookedHoursForDay(selectedCalendarDay)
    : [];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-xl bg-gray-800/40 hover:bg-gray-800/70 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <FiChevronLeft size={22} className="text-white" />
            </button>

            <h2 className="text-xl md:text-2xl font-bold text-white select-none">
              {monthNames[month]} {year}
            </h2>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-xl bg-gray-800/40 hover:bg-gray-800/70 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <FiChevronRight size={22} className="text-white" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center font-semibold text-gray-400 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                onClick={() => handleDayClick(day.dateStr)}
                className={`
                  h-16 md:h-20 flex flex-col items-center justify-center rounded-xl border-2 cursor-pointer
                  transition-all duration-200 hover:scale-[1.02]
                  ${
                    day.isCurrentMonth
                      ? "border-gray-800"
                      : "border-gray-900 text-gray-600"
                  }
                  ${
                    day.isToday
                      ? "bg-gradient-to-br from-blue-500/30 to-blue-600/30 border-blue-500 text-white"
                      : ""
                  }
                  ${
                    day.isSelected
                      ? "bg-gradient-to-br from-purple-500/30 to-purple-600/30 border-purple-500 text-white"
                      : ""
                  }
                  ${
                    day.isBlocked
                      ? "bg-gradient-to-br from-red-500/30 to-red-600/30 border-red-500 text-red-200"
                      : ""
                  }
                  ${
                    day.isBooked
                      ? "bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500 text-green-200"
                      : ""
                  }
                `}
              >
                <span className="text-sm md:text-base font-semibold">
                  {day.day}
                </span>
                {day.appointmentCount > 0 && (
                  <span className="text-xs bg-gradient-to-r from-green-500/40 to-emerald-500/40 text-green-200 rounded-full px-2 py-0.5 mt-1">
                    {day.appointmentCount}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={goToToday}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-xl font-semibold transition-all duration-200"
            >
              {lang === "es" ? "Hoy" : "Today"}
            </button>
            <button
              onClick={() => setShowBlockModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 md:px-6 py-2 md:py-3 rounded-xl text-white font-bold text-sm md:text-base transition-all duration-200 shadow-lg shadow-red-500/20"
            >
              🔒 {lang === "es" ? "Bloquear Horarios" : "Block Time Slots"}
            </button>
          </div>
        </div>

        {/* Próximas citas */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-white">
              {selectedCalendarDay
                ? formatDateForDisplay(selectedCalendarDay, lang)
                : lang === "es"
                ? "Próximas Citas"
                : "Upcoming Appointments"}
            </h3>
            <span className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
              {selectedCalendarDay
                ? completeDaySchedule.length
                : upcomingAppointments.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">
                {lang === "es"
                  ? "Cargando citas..."
                  : "Loading appointments..."}
              </p>
            </div>
          ) : error ? (
            <p className="text-red-400 text-center py-4">{error}</p>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {selectedCalendarDay ? (
                completeDaySchedule.length > 0 ? (
                  completeDaySchedule.map((item, idx) => {
                    if (item.type === "appointment" && item.data) {
                      const a = item.data as Appointment;
                      const appointmentType = getAppointmentType(a);
                      return (
                        <div
                          key={idx}
                          className={`
                            border p-4 rounded-xl space-y-3 relative group
                            ${
                              appointmentType === "blocked"
                                ? "bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-800/30"
                                : "bg-gradient-to-br from-blue-900/10 to-blue-950/10 border-blue-800/30"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white">
                              {appointmentType === "blocked"
                                ? "⛔ " +
                                  (lang === "es" ? "Bloqueado" : "Blocked")
                                : "👤 " + a.nombre}
                            </span>
                            <div className="flex flex-col items-end gap-1">
                              {appointmentType === "normal" && (
                                <span
                                  className={`text-xs px-2 py-1 rounded border ${getOriginBadgeStyles(
                                    a.origen
                                  )}`}
                                >
                                  {getOriginText(a.origen, lang)}
                                </span>
                              )}
                              <span className="text-sm px-2 py-1 rounded bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 font-semibold">
                                {item.time}
                              </span>
                            </div>
                          </div>

                          {appointmentType === "normal" && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-300">
                                {a.primera_visita
                                  ? "⭐ " +
                                    (lang === "es"
                                      ? "Primera visita"
                                      : "First visit")
                                  : "🔄 " +
                                    (lang === "es"
                                      ? "Visita sucesiva"
                                      : "Follow-up")}
                                {" • "}
                                <span className="font-medium">
                                  {a.servicio}
                                </span>
                              </div>

                              {a.telefono && (
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                  <span className="text-blue-400">📞</span>{" "}
                                  {a.telefono}
                                </div>
                              )}
                              {a.correo && (
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                  <span className="text-green-400">✉️</span>{" "}
                                  {a.correo}
                                </div>
                              )}
                              <div className="text-sm text-gray-400 flex items-center gap-2">
                                <span className="text-yellow-400">🏥</span>
                                {a.seguro === "Sin seguro"
                                  ? lang === "es"
                                    ? "Sin seguro"
                                    : "No insurance"
                                  : a.seguro}
                              </div>

                              {a.origen === "dashboard" ? (
                                <div className="text-xs text-purple-400 mt-1 pt-1 border-t border-purple-500/20">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {lang === "es"
                                      ? "Creada desde este panel de administración"
                                      : "Created from this admin panel"}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-xs text-green-400 mt-1 pt-1 border-t border-green-500/20">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {lang === "es"
                                      ? "Creada desde la pagina de Monge"
                                      : "Created from Monge Webpage"}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {appointmentType === "blocked" ? (
                              <button
                                onClick={() =>
                                  openAppointmentModal(a, "delete")
                                }
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                              >
                                {lang === "es" ? "Eliminar" : "Delete"}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    openAppointmentModal(a, "edit")
                                  }
                                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                                >
                                  {lang === "es" ? "Editar" : "Edit"}
                                </button>
                                <button
                                  onClick={() =>
                                    openAppointmentModal(a, "delete")
                                  }
                                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                                >
                                  {lang === "es" ? "Eliminar" : "Delete"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    } else if (item.type === "blocked") {
                      return (
                        <div
                          key={idx}
                          className="border p-4 rounded-xl space-y-3 bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-800/30 relative group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white">
                              ⛔{" "}
                              {lang === "es"
                                ? "Horario Bloqueado"
                                : "Blocked Time Slot"}
                            </span>
                            <span className="text-sm px-2 py-1 rounded bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 font-semibold">
                              {item.time}
                            </span>
                          </div>
                          <div className="text-sm text-gray-300">
                            {lang === "es"
                              ? "Este horario no está disponible para reservaciones"
                              : "This time slot is not available for booking"}
                          </div>
                          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                const fakeAppointment: Appointment = {
                                  id: (item.data as BlockedDate).id,
                                  nombre: "BLOQUEADO",
                                  telefono: "",
                                  correo: "",
                                  primera_visita: 0,
                                  servicio: "",
                                  seguro: "",
                                  fecha: selectedCalendarDay,
                                  hora: item.hourStr,
                                  fecha_creacion: new Date().toISOString(),
                                  origen: "dashboard",
                                };
                                openAppointmentModal(fakeAppointment, "delete");
                              }}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                            >
                              {lang === "es"
                                ? "Eliminar Bloqueo"
                                : "Remove Block"}
                            </button>
                          </div>
                        </div>
                      );
                    } else if (item.type === "available") {
                      return (
                        <div
                          key={idx}
                          className="border p-4 rounded-xl space-y-3 bg-gradient-to-br from-green-900/20 to-emerald-950/20 border-green-800/30"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 text-lg">✓</span>
                              <span className="font-bold text-green-300">
                                {lang === "es"
                                  ? "Horario Disponible"
                                  : "Available Time Slot"}
                              </span>
                            </div>
                            <span className="text-sm px-2 py-1 rounded bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 font-semibold">
                              {item.time}
                            </span>
                          </div>
                          <div className="text-sm text-gray-300">
                            {lang === "es"
                              ? "Este horario está libre para agendar una cita"
                              : "This time slot is free to schedule an appointment"}
                          </div>
                          <button
                            onClick={() => {
                              setAppointmentForm((prev) => ({
                                ...prev,
                                date: selectedCalendarDay,
                                time: item.hourStr,
                              }));
                              document
                                .querySelector(".lg\\:col-span-3:last-child")
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                });
                            }}
                            className="w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold px-3 py-2 rounded-lg text-sm transition-all duration-200"
                          >
                            {lang === "es"
                              ? "Agendar en este horario"
                              : "Schedule at this time"}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {lang === "es"
                        ? "No hay horarios disponibles para este día"
                        : "No time slots available for this day"}
                    </p>
                  </div>
                )
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((a, idx) => {
                  const appointmentType = getAppointmentType(a);
                  return (
                    <div
                      key={idx}
                      className={`
                          border p-4 rounded-xl space-y-3 relative group
                          ${
                            appointmentType === "blocked"
                              ? "bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-800/30"
                              : "bg-gradient-to-br from-blue-900/10 to-blue-950/10 border-blue-800/30"
                          }
                        `}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white">
                          {appointmentType === "blocked"
                            ? "⛔ " + (lang === "es" ? "Bloqueado" : "Blocked")
                            : "👤 " + a.nombre}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          {appointmentType === "normal" && (
                            <span
                              className={`text-xs px-2 py-1 rounded border ${getOriginBadgeStyles(
                                a.origen
                              )}`}
                            >
                              {getOriginText(a.origen, lang)}
                            </span>
                          )}
                          <span className="text-sm px-2 py-1 rounded bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 font-semibold">
                            {a.hora.substring(0, 5)}
                          </span>
                        </div>
                      </div>

                      {appointmentType === "normal" && (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-300">
                            {a.primera_visita
                              ? "⭐ " +
                                (lang === "es"
                                  ? "Primera visita"
                                  : "First visit")
                              : "🔄 " +
                                (lang === "es"
                                  ? "Visita sucesiva"
                                  : "Follow-up")}
                            {" • "}
                            <span className="font-medium">{a.servicio}</span>
                          </div>

                          {a.telefono && (
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <span className="text-blue-400">📞</span>{" "}
                              {a.telefono}
                            </div>
                          )}
                          {a.correo && (
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <span className="text-green-400">✉️</span>{" "}
                              {a.correo}
                            </div>
                          )}
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <span className="text-yellow-400">🏥</span>
                            {a.seguro === "Sin seguro"
                              ? lang === "es"
                                ? "Sin seguro"
                                : "No insurance"
                              : a.seguro}
                          </div>

                          {a.origen === "dashboard" ? (
                            <div className="text-xs text-purple-400 mt-1 pt-1 border-t border-purple-500/20">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {lang === "es"
                                  ? "Creada desde este panel de administración"
                                  : "Created from this admin panel"}
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-green-400 mt-1 pt-1 border-t border-green-500/20">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {lang === "es"
                                  ? "Creada desde la pagina de Monge"
                                  : "Created from Monge Webpage"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {appointmentType === "blocked" ? (
                          <button
                            onClick={() => openAppointmentModal(a, "delete")}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                          >
                            {lang === "es" ? "Eliminar" : "Delete"}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openAppointmentModal(a, "edit")}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                            >
                              {lang === "es" ? "Editar" : "Edit"}
                            </button>
                            <button
                              onClick={() => openAppointmentModal(a, "delete")}
                              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200"
                            >
                              {lang === "es" ? "Eliminar" : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {lang === "es"
                      ? "No hay citas próximas"
                      : "No upcoming appointments"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Horarios del día seleccionado */}
        {/* <div className="lg:col-span-3 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {selectedCalendarDay
                ? `${
                    lang === "es" ? "Horarios para" : "Time slots for"
                  } ${formatDateForDisplay(selectedCalendarDay, lang)}`
                : lang === "es"
                ? "Horarios del Día"
                : "Day Time Slots"}
            </h3>
            <span className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold">
              {selectedCalendarDay ? availableHoursForSelectedDay.length : 0}{" "}
              {lang === "es" ? "disponibles" : "available"}
            </span>
          </div>

          {selectedCalendarDay ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-950/20 border border-green-800/30 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <h4 className="text-lg font-bold text-green-300">
                    {lang === "es" ? "Disponibles" : "Available"}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableHoursForSelectedDay.length > 0 ? (
                    availableHoursForSelectedDay.map((hour, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg border border-green-500/30 text-sm font-medium"
                      >
                        {hour}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm py-2">
                      {lang === "es"
                        ? "No hay horas disponibles"
                        : "No available hours"}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border border-blue-800/30 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <h4 className="text-lg font-bold text-blue-300">
                    {lang === "es" ? "Reservadas" : "Booked"}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bookedHoursForSelectedDay.length > 0 ? (
                    bookedHoursForSelectedDay.map((hour, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 rounded-lg border border-blue-500/30 text-sm font-medium"
                      >
                        {hour}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm py-2">
                      {lang === "es"
                        ? "No hay horas reservadas"
                        : "No booked hours"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {lang === "es"
                  ? "Selecciona un día en el calendario para ver los horarios"
                  : "Select a day in the calendar to view time slots"}
              </p>
            </div>
          )}
          </div> */}

        {/* Formulario Agendar cita */}
        <div className="lg:col-span-3 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6 text-white">
            🗓️{" "}
            {lang === "es" ? "Agendar Nueva Cita" : "Schedule New Appointment"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  👤 {lang === "es" ? "Nombre del Paciente" : "Patient Name"}
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
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={lang === "es" ? "Nombre completo" : "Full name"}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  📞 {lang === "es" ? "Teléfono" : "Phone"}
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
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={
                    lang === "es" ? "Número de teléfono" : "Phone number"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ✉️ Email
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
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  🏥 {lang === "es" ? "Tipo de Visita" : "Visit Type"}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800/70 transition-colors">
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
                    className="w-5 h-5 bg-gray-800 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="text-sm font-bold text-white">
                    {lang === "es" ? "Primera visita" : "First visit"}
                  </label>
                </div>
              </div>

              {appointmentForm.isFirstVisit && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    ⚕️ {lang === "es" ? "Servicio" : "Service"}
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={
                      lang === "es"
                        ? "Especifique el servicio"
                        : "Specify service"
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  🛡️ {lang === "es" ? "Seguro Médico" : "Medical Insurance"}
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={appointmentForm.insurance !== "Sin seguro"}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        insurance: e.target.checked ? "" : "Sin seguro",
                      }))
                    }
                    className="w-5 h-5 bg-gray-800 border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="text-sm font-bold text-white">
                    {lang === "es"
                      ? "Cuenta con seguro médico"
                      : "Has medical insurance"}
                  </label>
                </div>
              </div>

              {appointmentForm.insurance !== "Sin seguro" && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    📝 {lang === "es" ? "Nombre del Seguro" : "Insurance Name"}
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
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={
                      lang === "es" ? "Nombre del seguro" : "Insurance name"
                    }
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  📅 {lang === "es" ? "Fecha" : "Date"}
                </label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                        time: "",
                      }))
                    }
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {selectedCalendarDay &&
                    appointmentForm.date !== selectedCalendarDay && (
                      <button
                        onClick={() =>
                          setAppointmentForm((prev) => ({
                            ...prev,
                            date: selectedCalendarDay,
                            time: "",
                          }))
                        }
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl text-white font-bold text-sm transition-all duration-200"
                      >
                        {lang === "es"
                          ? "Usar día seleccionado"
                          : "Use selected day"}
                      </button>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ⏰ {lang === "es" ? "Hora" : "Time"}
                </label>
                <select
                  value={appointmentForm.time}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={!appointmentForm.date}
                >
                  <option value="">
                    -- {lang === "es" ? "Seleccionar hora" : "Select time"} --
                  </option>
                  {appointmentForm.date &&
                    getAvailableHours(appointmentForm.date).map((hour) => {
                      const hourStr = `${hour}:00`;
                      const isBlocked = blockedDates.some(
                        (b) =>
                          b.date === appointmentForm.date && b.hour === hourStr
                      );
                      const isBooked = selectedDates.some(
                        (s) =>
                          s.fecha === appointmentForm.date && s.hora === hourStr
                      );
                      const [year, month, day] = appointmentForm.date
                        .split("-")
                        .map(Number);
                      const hourNumber = parseInt(hour.split(":")[0]);
                      const currentDate = new Date(
                        year,
                        month - 1,
                        day,
                        hourNumber,
                        0,
                        0,
                        0
                      );
                      const isPastHour = currentDate < new Date();

                      if (!isBlocked && !isBooked) {
                        return (
                          <option
                            key={hourStr}
                            value={hourStr}
                            disabled={isPastHour}
                          >
                            {hour}
                          </option>
                        );
                      }
                      return null;
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700"
              >
                🚀 {lang === "es" ? "Crear Cita" : "Create Appointment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para bloquear dias */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-white">
              🔒 {lang === "es" ? "Bloquear Horarios" : "Block Time Slots"}
            </h3>

            {/* Selector de tipo de bloqueo */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  setBlockType("single");
                  // Resetear formulario al cambiar tipo
                  setBlockForm({
                    date: "",
                    startDate: "",
                    endDate: "",
                    startTime: "",
                    endTime: "",
                    blockAllDay: false,
                  });
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  blockType === "single"
                    ? "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-1">
                    1 {lang === "es" ? "Día" : "Day"}
                  </div>
                  <div className="text-sm">
                    {lang === "es" ? "Bloqueo simple" : "Single day block"}
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setBlockType("multiple");
                  // Resetear formulario al cambiar tipo
                  setBlockForm({
                    date: "",
                    startDate: "",
                    endDate: "",
                    startTime: "",
                    endTime: "",
                    blockAllDay: false,
                  });
                }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  blockType === "multiple"
                    ? "bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500 text-white"
                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold mb-1">
                    {lang === "es" ? "Varios Días" : "Multiple Days"}
                  </div>
                  <div className="text-sm">
                    {lang === "es" ? "Rango de fechas" : "Date range"}
                  </div>
                </div>
              </button>
            </div>

            <div className="space-y-4">
              {blockType === "single" ? (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    📅 {lang === "es" ? "Fecha" : "Date"}
                  </label>
                  <input
                    type="date"
                    value={blockForm.date}
                    onChange={(e) =>
                      setBlockForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        📅 {lang === "es" ? "Fecha Inicio" : "Start Date"}
                      </label>
                      <input
                        type="date"
                        value={blockForm.startDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          setBlockForm((prev) => ({
                            ...prev,
                            startDate: newStartDate,
                            // Si la fecha final está vacía o es anterior a la nueva fecha inicial,
                            // establecer la fecha final igual a la fecha inicial
                            endDate:
                              !prev.endDate ||
                              new Date(prev.endDate) < new Date(newStartDate)
                                ? newStartDate
                                : prev.endDate,
                          }));
                        }}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        📅 {lang === "es" ? "Fecha Fin" : "End Date"}
                      </label>
                      <input
                        type="date"
                        value={blockForm.endDate}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          setBlockForm((prev) => ({
                            ...prev,
                            endDate: newEndDate,
                          }));
                        }}
                        min={blockForm.startDate} // Establece el mínimo como la fecha de inicio
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:bg-gray-800/70 transition-colors">
                <input
                  type="checkbox"
                  checked={blockForm.blockAllDay}
                  onChange={(e) =>
                    setBlockForm((prev) => ({
                      ...prev,
                      blockAllDay: e.target.checked,
                      startTime: "",
                      endTime: "",
                    }))
                  }
                  className="w-5 h-5 bg-gray-800 border-gray-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <label className="text-sm font-bold text-white">
                  {lang === "es" ? "Bloquear día completo" : "Block all day"}
                </label>
              </div>

              {!blockForm.blockAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      ⏰ {lang === "es" ? "Hora Inicio" : "Start Time"}
                    </label>
                    <select
                      value={blockForm.startTime}
                      onChange={(e) =>
                        setBlockForm((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                          // Resetear hora final si la hora inicial es mayor
                          endTime:
                            prev.endTime &&
                            parseInt(e.target.value.split(":")[0]) >=
                              parseInt(prev.endTime.split(":")[0])
                              ? ""
                              : prev.endTime,
                        }))
                      }
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    >
                      <option value="">
                        -- {lang === "es" ? "Seleccionar" : "Select"} --
                      </option>
                      {[
                        "10:00",
                        "11:00",
                        "12:00",
                        "13:00",
                        "16:00",
                        "17:00",
                      ].map((hour) => (
                        <option key={hour} value={`${hour}:00`}>
                          {hour}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      ⏰ {lang === "es" ? "Hora Fin" : "End Time"}
                    </label>
                    <select
                      value={blockForm.endTime}
                      onChange={(e) =>
                        setBlockForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={!blockForm.startTime}
                    >
                      <option value="">
                        -- {lang === "es" ? "Seleccionar" : "Select"} --
                      </option>
                      {blockForm.startTime &&
                        ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00"]
                          .filter((hour) => {
                            const startHour = parseInt(
                              blockForm.startTime.split(":")[0]
                            );
                            const hourNumber = parseInt(hour.split(":")[0]);
                            return hourNumber > startHour;
                          })
                          .map((hour) => (
                            <option key={hour} value={`${hour}:00`}>
                              {hour}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockForm({
                    date: "",
                    startDate: "",
                    endDate: "",
                    startTime: "",
                    endTime: "",
                    blockAllDay: false,
                  });
                }}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all duration-200 border border-gray-700"
              >
                {lang === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                onClick={handleBlockSubmit}
                disabled={
                  blockingDate ||
                  (blockType === "single"
                    ? !blockForm.date
                    : !blockForm.startDate || !blockForm.endDate)
                }
                className={`px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 shadow-lg ${
                  blockType === "single"
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30"
                    : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-orange-500/30"
                } disabled:opacity-50`}
              >
                {blockingDate
                  ? lang === "es"
                    ? "Bloqueando..."
                    : "Blocking..."
                  : blockType === "single"
                  ? lang === "es"
                    ? "Bloquear Día"
                    : "Block Day"
                  : lang === "es"
                  ? "Bloquear Rango"
                  : "Block Range"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Cita */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-white">
              ✅ {lang === "es" ? "Confirmar Cita" : "Confirm Appointment"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-400 font-bold">
                  {lang === "es" ? "Paciente" : "Patient"}:
                </div>
                <div className="text-white font-bold">
                  {appointmentForm.name}
                </div>

                <div className="text-gray-400 font-bold">
                  {lang === "es" ? "Teléfono" : "Phone"}:
                </div>
                <div className="text-white font-bold">
                  {appointmentForm.phone}
                </div>

                {appointmentForm.email && (
                  <>
                    <div className="text-gray-400 font-bold">Email:</div>
                    <div className="text-white font-bold break-all">
                      {appointmentForm.email}
                    </div>
                  </>
                )}

                <div className="text-gray-400 font-bold">
                  {lang === "es" ? "Fecha" : "Date"}:
                </div>
                <div className="text-white font-bold">
                  {formatDateForDisplay(appointmentForm.date, lang)}
                </div>

                <div className="text-gray-400 font-bold">
                  {lang === "es" ? "Hora" : "Time"}:
                </div>
                <div className="text-white font-bold">
                  {appointmentForm.time.split(":")[0]}:
                  {appointmentForm.time.split(":")[1]}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all duration-200 border border-gray-700"
              >
                {lang === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                onClick={handleCreateAppointment}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold transition-all duration-200 shadow-lg shadow-blue-500/30"
              >
                {lang === "es" ? "Confirmar" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Citas */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl max-w-lg w-full">
            <h3 className="text-2xl font-bold mb-6 text-white">
              {modalType === "delete" ? "🗑️ " : "✏️ "}
              {modalType === "delete"
                ? lang === "es"
                  ? "Eliminar Cita"
                  : "Delete Appointment"
                : lang === "es"
                ? "Editar Cita"
                : "Edit Appointment"}
            </h3>

            {modalType === "delete" ? (
              <div className="space-y-4">
                <p className="text-gray-300">
                  {lang === "es"
                    ? "¿Estás seguro de que deseas eliminar esta cita?"
                    : "Are you sure you want to delete this appointment?"}
                </p>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="text-sm text-gray-400">
                    <strong>{lang === "es" ? "Paciente" : "Patient"}:</strong>{" "}
                    {selectedAppointment.nombre}
                  </div>
                  <div className="text-sm text-gray-400">
                    <strong>{lang === "es" ? "Fecha" : "Date"}:</strong>{" "}
                    {formatDateForDisplay(selectedAppointment.fecha, lang)}
                  </div>
                  <div className="text-sm text-gray-400">
                    <strong>{lang === "es" ? "Hora" : "Time"}:</strong>{" "}
                    {selectedAppointment.hora}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={appointmentForm.name}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={
                    lang === "es" ? "Nombre del paciente" : "Patient name"
                  }
                />

                <input
                  type="tel"
                  value={appointmentForm.phone}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={lang === "es" ? "Teléfono" : "Phone"}
                />

                <input
                  type="email"
                  value={appointmentForm.email}
                  onChange={(e) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Email"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />

                  <select
                    value={appointmentForm.time}
                    onChange={(e) =>
                      setAppointmentForm((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={!appointmentForm.date}
                  >
                    <option value="">
                      -- {lang === "es" ? "Seleccionar" : "Select"} --
                    </option>
                    {appointmentForm.date &&
                      getAvailableHours(appointmentForm.date).map((hour) => {
                        const hourStr = `${hour}:00`;
                        const isBlocked = blockedDates.some(
                          (b) =>
                            b.date === appointmentForm.date &&
                            b.hour === hourStr
                        );
                        const isBooked = selectedDates.some(
                          (s) =>
                            s.fecha === appointmentForm.date &&
                            s.hora === hourStr &&
                            s.id !== selectedAppointment?.id
                        );
                        return !isBlocked && !isBooked ? (
                          <option key={hourStr} value={hourStr}>
                            {hour}
                          </option>
                        ) : null;
                      })}
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setSelectedAppointment(null);
                  setModalType(null);
                }}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all duration-200 border border-gray-700"
              >
                {lang === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                onClick={() =>
                  modalType === "delete"
                    ? handleDeleteAppointment(selectedAppointment.id)
                    : handleEditAppointment()
                }
                disabled={appointmentActionLoading}
                className={`px-6 py-3 rounded-xl text-white font-bold transition-all duration-200 shadow-lg ${
                  modalType === "delete"
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-red-500/30"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30"
                } disabled:opacity-50`}
              >
                {appointmentActionLoading
                  ? lang === "es"
                    ? "Procesando..."
                    : "Processing..."
                  : modalType === "delete"
                  ? lang === "es"
                    ? "Eliminar"
                    : "Delete"
                  : lang === "es"
                  ? "Actualizar"
                  : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
