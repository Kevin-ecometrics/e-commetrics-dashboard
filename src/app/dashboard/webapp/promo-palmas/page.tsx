"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Tag,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  Hash,
  Percent,
  DollarSign,
  Users,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Shuffle,
} from "lucide-react";

const API_BASE_URL = "https://palmasrecovery.com";

interface PromoCode {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

const INITIAL_FORM = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10,
  expires_at: "",
  usage_limit: "",
};

export default function PromoPalmasPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showForm, setShowForm] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar los códigos de promoción");
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const suffix = Array.from({ length: 5 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    setForm((p) => ({ ...p, code: `PALMAS${suffix}` }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    setSaving(true);
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        expires_at: form.expires_at || null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      };
      const res = await fetch(`${API_BASE_URL}/promo-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Código creado exitosamente");
      setForm(INITIAL_FORM);
      setShowForm(false);
      fetchCodes();
    } catch {
      toast.error("Error al crear el código");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Código eliminado");
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Error al eliminar el código");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !current }),
      });
      if (!res.ok) throw new Error();
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
      );
    } catch {
      toast.error("Error al actualizar el código");
    }
  };

  const copyCode = async (id: number, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const total = codes.length;
  const active = codes.filter((c) => c.is_active).length;
  const totalUses = codes.reduce((sum, c) => sum + (c.usage_count ?? 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <Toaster />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Tag className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Promo Palmas
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-1">
              Gestiona los códigos de promoción para el frontend de Palmas
              Recovery
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCodes}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo código
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {total}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <ToggleRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {active}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Usos totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUses}
              </p>
            </div>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Crear nuevo código
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="ej. PALMAS20"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    title="Generar código aleatorio"
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Shuffle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Discount type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de descuento
                </label>
                <select
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      discount_type: e.target.value as "percentage" | "fixed",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>

              {/* Discount value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {form.discount_type === "percentage"
                    ? "Porcentaje de descuento"
                    : "Monto de descuento"}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {form.discount_type === "percentage" ? (
                      <Percent className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={
                      form.discount_type === "percentage" ? "100" : undefined
                    }
                    value={form.discount_value}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        discount_value: Number(e.target.value),
                      }))
                    }
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Expiry date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de expiración{" "}
                  <span className="text-gray-400">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, expires_at: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Usage limit */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Límite de usos{" "}
                  <span className="text-gray-400">
                    (opcional — vacío = ilimitado)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={form.usage_limit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, usage_limit: e.target.value }))
                    }
                    placeholder="ej. 100"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(INITIAL_FORM);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving ? "Guardando..." : "Crear código"}
              </button>
            </div>
          </form>
        )}

        {/* Codes list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Sin códigos todavía
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Crea tu primer código de promoción con el botón de arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((code) => {
              const isExpired = code.expires_at
                ? new Date(code.expires_at) < new Date()
                : false;
              const isExhausted =
                code.usage_limit !== null &&
                code.usage_count >= code.usage_limit;

              return (
                <div
                  key={code.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                          {code.code}
                        </span>
                        {!code.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Inactivo
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            Expirado
                          </span>
                        )}
                        {isExhausted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            Agotado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          {code.discount_type === "percentage" ? (
                            <Percent className="h-3.5 w-3.5" />
                          ) : (
                            <DollarSign className="h-3.5 w-3.5" />
                          )}
                          {code.discount_type === "percentage"
                            ? `${code.discount_value}% desc.`
                            : `$${code.discount_value} desc.`}
                        </span>
                        {code.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Vence{" "}
                            {new Date(code.expires_at).toLocaleDateString(
                              "es-MX"
                            )}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {code.usage_count ?? 0}
                          {code.usage_limit !== null
                            ? ` / ${code.usage_limit}`
                            : ""}{" "}
                          usos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyCode(code.id, code.code)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Copiar código"
                    >
                      {copiedId === code.id ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleToggle(code.id, code.is_active)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title={code.is_active ? "Desactivar" : "Activar"}
                    >
                      {code.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(code.id)}
                      disabled={deletingId === code.id}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {deletingId === code.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* API reference note */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">
                Endpoints requeridos en{" "}
                <code className="font-mono">https://palmasrecovery.com</code>
              </p>
              <ul className="space-y-0.5 font-mono text-xs">
                <li>GET &nbsp;&nbsp;/promo-codes</li>
                <li>
                  POST &nbsp;/promo-codes &nbsp;&nbsp;&nbsp;&#123; code,
                  discount_type, discount_value, expires_at, usage_limit &#125;
                </li>
                <li>
                  PATCH /promo-codes/:id &nbsp;&#123; is_active &#125;
                </li>
                <li>DELETE /promo-codes/:id</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
