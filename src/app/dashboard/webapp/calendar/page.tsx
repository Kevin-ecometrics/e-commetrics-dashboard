"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Appointment = {
  id: number;
  date: string;
  name?: string;
  email?: string;
  phone?: string;
};

const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const WORKING_HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM

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

  // Calculate current week range
  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay() + 1 + currentWeekOffset * 7
  );
  const endOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay() + 6 + currentWeekOffset * 7
  );

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          "https://bitescreadoresdesonrisas.com/api/citas/agendadas"
        );
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

      // Crear fecha local a partir del input
      const localDate = new Date(blockDate);

      // Obtener día de la semana local (0=Domingo, 1=Lunes, ..., 6=Sábado)
      const localDayOfWeek = localDate.getDay();

      // Validar que no sea domingo
      if (localDayOfWeek === 0) {
        alert("No se pueden bloquear horarios los domingos");
        return;
      }

      // Validar que no sea viernes con horario que incluya después de las 4 PM
      if (localDayOfWeek === 5) {
        // Viernes
        const endHour = startHour + duration;
        if (endHour > 16) {
          alert(
            "No se pueden bloquear horarios que incluyan después de las 4 PM los viernes"
          );
          return;
        }
      }

      for (let i = 0; i < duration; i++) {
        // Crear fecha en UTC con ajuste de 24 horas
        const date = new Date(
          Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            startHour + i,
            0,
            0
          )
        );

        // Ajustar sumando 24 horas para compensar el desfase
        date.setTime(date.getTime() + 24 * 60 * 60 * 1000);

        dates.push(date.toISOString());
      }

      await axios.post(
        "https://bitescreadoresdesonrisas.com/api/disponibilidad",
        { dates }
      );

      // Refresh appointments
      const response = await axios.get(
        "https://bitescreadoresdesonrisas.com/api/citas/agendadas"
      );
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

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta cita?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://bitescreadoresdesonrisas.com/api/citas/delete/${selectedAppointment.id}`
      );
      setBookedAppointments(
        bookedAppointments.filter((app) => app.id !== selectedAppointment.id)
      );
      setIsDrawerOpen(false);
      alert("Cita eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Error al eliminar la cita");
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    return hours <= 12 ? `${hours}:00 AM` : `${hours - 12}:00 PM`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 dark:border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Gestión de Citas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center bg-gradient-to-r from-pink-500 to-purple-600 p-4">
              <button
                onClick={() => handleWeekChange(-1)}
                className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <FaChevronLeft />
              </button>
              <span className="text-white font-medium">
                {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
              </span>
              <button
                onClick={() => handleWeekChange(1)}
                className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {DAYS_OF_WEEK.map((day, dayIndex) => {
                const dayAppointments = bookedAppointments.filter((app) => {
                  const appDate = new Date(app.date);
                  return (
                    appDate.getDay() === dayIndex + 1 &&
                    appDate >= startOfWeek &&
                    appDate <= endOfWeek
                  );
                });

                return (
                  <div
                    key={day}
                    className={`p-4 ${
                      dayIndex % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          {dayAppointments.length}
                        </span>
                        <span className="font-medium">{day}</span>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedDay(selectedDay === day ? null : day)
                        }
                        className="text-pink-500 dark:text-pink-400"
                      >
                        {selectedDay === day ? "▲" : "▼"}
                      </button>
                    </div>

                    {selectedDay === day && (
                      <div className="mt-4 space-y-3">
                        {dayAppointments.length > 0 ? (
                          dayAppointments
                            .sort(
                              (a, b) =>
                                new Date(a.date).getHours() -
                                new Date(b.date).getHours()
                            )
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                                onClick={() =>
                                  handleSelectAppointment(appointment)
                                }
                              >
                                {appointment.name ? (
                                  <>
                                    <p className="font-medium">
                                      {appointment.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {formatTime(new Date(appointment.date))} -{" "}
                                      {appointment.email} - {appointment.phone}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-gray-600 dark:text-gray-300">
                                    Horario bloqueado:{" "}
                                    {formatTime(new Date(appointment.date))}
                                  </p>
                                )}
                              </div>
                            ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
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

          {/* Blocking Panel */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Bloquear Horarios</h2>

            <div className="mb-6">
              <label className="block mb-2">Seleccionar fecha:</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                onChange={(e) => setBlockDate(new Date(e.target.value))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {blockDate && (
              <form onSubmit={handleBlockTime} className="space-y-4">
                <div>
                  <label className="block mb-2">Hora de inicio:</label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {WORKING_HOURS.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}:00
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Duración (horas):</label>
                  <select
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar duración</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} hora{duration > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Bloquear Horario
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Appointment Detail Drawer */}
      {isDrawerOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full shadow-xl p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Detalles de la Cita</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedAppointment.name && (
                <div>
                  <h3 className="text-lg font-medium">Nombre:</h3>
                  <p>{selectedAppointment.name}</p>
                </div>
              )}

              {selectedAppointment.email && (
                <div>
                  <h3 className="text-lg font-medium">Email:</h3>
                  <p>{selectedAppointment.email}</p>
                </div>
              )}

              {selectedAppointment.phone && (
                <div>
                  <h3 className="text-lg font-medium">Teléfono:</h3>
                  <p>{selectedAppointment.phone}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium">Fecha y Hora:</h3>
                <p>
                  {formatDate(new Date(selectedAppointment.date))} -{" "}
                  {formatTime(new Date(selectedAppointment.date))}
                </p>
              </div>

              <button
                onClick={handleDeleteAppointment}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-200 mt-6"
              >
                Eliminar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
