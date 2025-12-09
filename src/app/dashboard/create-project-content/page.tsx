"use client";

import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const TYPES = [
  "Business and Objectives",
  "MVP + IDEA",
  "Business strategy",
  "Growth Hacking strategy",
  "Apps",
];

type User = { id: number; userName: string };
type Project = { id: number; project_name: string; id_user: number };

export default function CreateProjectContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    project_id: "",
    content_1: "",
    content_2: "",
    content_3: "",
    link: "",
    href: "",
    id_user: "",
    type: TYPES[0],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar usuarios y proyectos al montar
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => toast.error("Error cargando usuarios"));

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`)
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => toast.error("Error cargando proyectos"));
  }, []);

  // Cuando seleccionan un proyecto, asignar automáticamente el usuario dueño
  useEffect(() => {
    if (!form.project_id) return;
    const selected = projects.find((p) => p.id.toString() === form.project_id);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        id_user: selected.id_user.toString(),
      }));
    }
  }, [form.project_id, projects]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // genera vista previa
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.project_id || !form.id_user || !form.type) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("project_id", form.project_id);
      data.append("content_1", form.content_1);
      data.append("content_2", form.content_2);
      data.append("content_3", form.content_3);
      data.append("link", form.link);
      data.append("href", form.href);
      data.append("id_user", form.id_user);
      data.append("type", form.type);
      if (imageFile) data.append("image", imageFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/projects/content`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear el contenido");
      }

      const json = await res.json();
      toast.success(
        `Contenido creado correctamente. Imagen URL: ${
          json.imageUrl || "Ninguna"
        }`
      );

      // Reset form
      setForm({
        project_id: "",
        content_1: "",
        content_2: "",
        content_3: "",
        link: "",
        href: "",
        id_user: "",
        type: TYPES[0],
      });
      setImageFile(null);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al crear el contenido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <Toaster
          position="top-center"
          toastOptions={{
            className: "dark:bg-gray-800 dark:text-white",
            duration: 4000,
          }}
        />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Crear Contenido del Proyecto
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Añade contenido multimedia y enlaces relevantes para enriquecer tu
            proyecto
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 shadow-2xl dark:shadow-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Información del Contenido
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Completa los detalles para agregar contenido al proyecto
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Project Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Proyecto *
                  </label>
                  <div className="relative">
                    <select
                      name="project_id"
                      value={form.project_id}
                      onChange={handleChange}
                      required
                      className="w-full pl-4 pr-10 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200 appearance-none bg-white dark:bg-gray-800"
                    >
                      <option value="">Selecciona un proyecto</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.project_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content Fields Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Content 1 */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 10h6M9 14h6"
                        />
                      </svg>
                      Título Principal
                    </label>
                    <input
                      type="text"
                      name="content_1"
                      placeholder="Título o encabezado principal"
                      value={form.content_1}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                    />
                  </div>

                  {/* Content 2 */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Descripción
                    </label>
                    <input
                      type="text"
                      name="content_2"
                      placeholder="Descripción detallada del contenido"
                      value={form.content_2}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Content 3 - Full Width */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Notas Adicionales
                  </label>
                  <input
                    name="content_3"
                    placeholder="Información adicional, comentarios o notas relevantes..."
                    value={form.content_3}
                    onChange={handleChange}
                    className="w-full pl-4 pr-4 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200 resize-none"
                  />
                </div>

                {/* Link Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Enlaces y Referencias
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Link URL */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        URL del enlace
                      </label>
                      <input
                        type="url"
                        name="link"
                        placeholder="https://ejemplo.com"
                        value={form.link}
                        onChange={handleChange}
                        className="w-full pl-4 pr-4 py-3 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      />
                    </div>

                    {/* Link Name */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Texto del enlace
                      </label>
                      <input
                        type="text"
                        name="href"
                        placeholder="Ver más información"
                        value={form.href}
                        onChange={handleChange}
                        className="w-full pl-4 pr-4 py-3 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* User Selection (Disabled) */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Usuario Asignado *
                    </label>
                    <div className="relative">
                      <select
                        name="id_user"
                        value={form.id_user}
                        onChange={handleChange}
                        required
                        disabled
                        className="w-full pl-4 pr-10 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed appearance-none"
                      >
                        <option value="">Usuario auto-asignado</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.userName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Se asigna automáticamente basado en el proyecto
                      seleccionado
                    </p>
                  </div>

                  {/* Type Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Tipo de Contenido
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full pl-4 pr-10 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white transition-all duration-200 appearance-none bg-white dark:bg-gray-800"
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 space-y-4">
                  <label className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Imagen del Contenido
                  </label>

                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-200">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                          Seleccionar imagen
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF hasta 10MB
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Feedback visual del archivo seleccionado */}
                  {imageFile && (
                    <div className="text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Imagen seleccionada: <strong>{imageFile.name}</strong>
                      </p>
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="mt-2 mx-auto max-w-xs rounded shadow"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading || !form.project_id}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Creando Contenido...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Crear Contenido</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                Guía para crear contenido
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800 dark:text-purple-200">
              <ul className="space-y-1">
                <li>
                  • <strong>Título Principal:</strong> Usa un encabezado claro y
                  descriptivo
                </li>
                <li>
                  • <strong>Descripción:</strong> Explica el propósito del
                  contenido
                </li>
                <li>
                  • <strong>Notas:</strong> Añade contexto adicional si es
                  necesario
                </li>
              </ul>
              <ul className="space-y-1">
                <li>
                  • <strong>Enlaces:</strong> Incluye recursos externos
                  relevantes
                </li>
                <li>
                  • <strong>Imágenes:</strong> Ayudan a visualizar mejor el
                  contenido
                </li>
                <li>
                  • <strong>Tipo:</strong> Categoriza para mejor organización
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
