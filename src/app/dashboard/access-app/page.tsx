"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Users,
  QrCode,
  CreditCard,
  Calendar,
  FileText,
  Save,
  Mail,
  Shield,
  CheckCircle2,
  Loader2,
  Settings,
  Tag,
} from "lucide-react";

type User = {
  id: number;
  email: string;
  role: string;
  userName: string;
};

type ComponentAccess = {
  component:
    | "QR"
    | "Vcard"
    | "blogs"
    | "calendar"
    | "Reforma"
    | "Monge"
    | "PromoPalmas"
    | "CalendarioPalmas";
  can_view: boolean;
};

const AVAILABLE_COMPONENTS: ComponentAccess["component"][] = [
  "QR",
  "Vcard",
  "blogs",
  "calendar",
  "Reforma",
  "Monge",
  "PromoPalmas",
  "CalendarioPalmas",
];

// Mapeo de componentes a iconos y nombres legibles
const COMPONENT_CONFIG = {
  QR: {
    icon: QrCode,
    name: "Códigos QR",
    color:
      "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900",
  },
  Vcard: {
    icon: CreditCard,
    name: "Tarjetas de Visita",
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900",
  },
  blogs: {
    icon: FileText,
    name: "Blogs",
    color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900",
  },
  calendar: {
    icon: Calendar,
    name: "Calendario",
    color:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900",
  },
  Reforma: {
    icon: Calendar,
    name: "Calendario de Reforma",
    color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900",
  },
  Monge: {
    icon: Calendar,
    name: "Calendario de Monge",
    color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900",
  },
  PromoPalmas: {
    icon: Tag,
    name: "Promo Palmas",
    color:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900",
  },
  CalendarioPalmas: {
    icon: Calendar,
    name: "Calendario Palmas",
    color:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900",
  },
};

function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [permissions, setPermissions] = useState<
    Record<number, ComponentAccess[]>
  >({});
  const [savingUsers, setSavingUsers] = useState<Set<number>>(new Set());

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      const clients = data.filter((user: User) => user.role === "client");

      setUsers(clients);

      // fetch permissions for each user
      clients.forEach((user: User) => {
        fetchPermissions(user.id);
      });
    } catch (error) {
      toast.error("Error al obtener usuarios");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch permissions for one user - FUNCIÓN MEJORADA
  const fetchPermissions = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/users/${userId}/apps`
      );
      if (!res.ok) throw new Error("Error al obtener permisos");
      const data = await res.json();

      // Asegurar que todos los componentes disponibles estén representados
      const completePermissions = AVAILABLE_COMPONENTS.map((component) => {
        const existingPerm = data.find(
          (perm: ComponentAccess) => perm.component === component
        );
        return existingPerm || { component, can_view: false };
      });

      setPermissions((prev) => ({ ...prev, [userId]: completePermissions }));
    } catch {
      // Si hay error, crear permisos por defecto
      const defaultPermissions = AVAILABLE_COMPONENTS.map((component) => ({
        component,
        can_view: false,
      }));
      setPermissions((prev) => ({ ...prev, [userId]: defaultPermissions }));
      toast.error(`Error al cargar permisos de usuario ID ${userId}`);
    }
  };

  // Toggle checkbox - FUNCIÓN CORREGIDA
  const handleToggle = (userId: number, component: string) => {
    setPermissions((prev) => {
      const userPermissions = prev[userId] || [];

      // Buscar si el permiso ya existe
      const existingPermIndex = userPermissions.findIndex(
        (perm) => perm.component === component
      );

      let updated;
      if (existingPermIndex >= 0) {
        // Si existe, actualizar
        updated = userPermissions.map((perm, index) =>
          index === existingPermIndex
            ? { ...perm, can_view: !perm.can_view }
            : perm
        );
      } else {
        // Si no existe, agregar nuevo permiso
        updated = [
          ...userPermissions,
          {
            component: component as ComponentAccess["component"],
            can_view: true,
          },
        ];
      }

      return { ...prev, [userId]: updated };
    });
  };

  // Save permissions for user
  const savePermissions = async (userId: number) => {
    setSavingUsers((prev) => new Set([...prev, userId]));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/users/${userId}/apps`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permissions[userId]),
        }
      );
      if (!res.ok) throw new Error("Error al guardar permisos");
      toast.success("Permisos actualizados");
    } catch (err) {
      toast.error("Error al guardar permisos");
    } finally {
      setSavingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Cargando usuarios...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Permisos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Administra los permisos de acceso a componentes para cada usuario
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total Usuarios
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Componentes
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {AVAILABLE_COMPONENTS.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Permisos Activos
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {
                    Object.values(permissions)
                      .flat()
                      .filter((p) => p.can_view).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {users.map((user) => {
            const userPerms = permissions[user.id] || [];
            const isSaving = savingUsers.has(user.id);
            const activePermissions = userPerms.filter(
              (p) => p.can_view
            ).length;

            return (
              <div
                key={user.id}
                className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* User Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {user.userName}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Permisos activos
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {activePermissions}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">
                          / {AVAILABLE_COMPONENTS.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {AVAILABLE_COMPONENTS.map((component) => {
                      const perm = userPerms.find(
                        (p) => p.component === component
                      );
                      const isChecked = perm?.can_view ?? false;
                      const config = COMPONENT_CONFIG[component];

                      // Si no hay config, usar valores por defecto
                      const componentConfig = config || {
                        icon: Settings,
                        name: component,
                        color:
                          "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900",
                      };

                      const IconComponent = componentConfig.icon;

                      return (
                        <div
                          key={component}
                          className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            isChecked
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 bg-white dark:bg-black hover:border-gray-300 dark:hover:border-gray-500"
                          }`}
                          onClick={() => handleToggle(user.id, component)}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className={`p-2 rounded-lg ${componentConfig.color}`}
                              >
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggle(user.id, component);
                                  }}
                                  className="w-5 h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                              {componentConfig.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {isChecked ? "Acceso permitido" : "Sin acceso"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => savePermissions(user.id)}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isSaving
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && !loadingUsers && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay usuarios disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No se encontraron usuarios con rol de cliente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
