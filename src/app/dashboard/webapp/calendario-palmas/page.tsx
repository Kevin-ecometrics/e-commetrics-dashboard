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
  status: string;
  certified_doctor: string;
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

type Tab = "bookings" | "contacts";

export default function CalendarioPalmasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

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

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          Confirmada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="h-3 w-3" />
        Cancelada
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <Toaster />
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
              Panel de reservas y contactos de Palmas Recovery
            </p>
          </div>
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

        {/* Coming soon + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Coming soon banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <Calendar className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-800/60 text-amber-700 dark:text-amber-300">
              Próximamente
            </span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                Calendario Interactivo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                La gestión de disponibilidad por fecha estará disponible pronto
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BedDouble className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total Reservas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loadingBookings ? "—" : bookings.length}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Confirmadas
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loadingBookings ? "—" : confirmedBookings.length}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Contactos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loadingContacts ? "—" : contacts.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Reservas{!loadingBookings && ` (${bookings.length})`}
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "contacts"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Contactos{!loadingContacts && ` (${contacts.length})`}
          </button>
        </div>

        {/* Bookings table */}
        {activeTab === "bookings" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {loadingBookings ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BedDouble className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  Sin reservas
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Todavía no hay reservas registradas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Confirmación
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Huésped
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Habitación
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Check-in
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Check-out
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Noches
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Total
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Estado
                      </th>
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
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {ROOM_NAMES[booking.room_id] || booking.room_id}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {new Date(booking.check_in).toLocaleDateString(
                            "es-MX"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {new Date(booking.check_out).toLocaleDateString(
                            "es-MX"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {booking.nights}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          ${booking.total}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(booking.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contacts table */}
        {activeTab === "contacts" && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {loadingContacts ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-20">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                  Sin contactos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Todavía no hay mensajes de contacto registrados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Contacto
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Mensaje
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                        Fecha
                      </th>
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
                          {new Date(contact.created_at).toLocaleDateString(
                            "es-MX",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
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
