"use client";

import { useAuth } from "@/app/context/AuthContext";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

type Project = {
  id: number;
  id_user: number;
  title: string;
  percentage: number | null;
  content: string;
  project_name: string;
};

type User = {
  id: number;
  userName: string;
};

export default function UpdateProject() {
  const { fetchProjects } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch projects and users
  useEffect(() => {
    fetchProjectsList();
    fetchUsers();
  }, []);

  const fetchProjectsList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`);
      if (!res.ok) throw new Error("Error cargando proyectos");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      toast.error("Error cargando proyectos");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/users`);
      if (!res.ok) throw new Error("Error cargando usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Error cargando usuarios");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!selectedProject) return;
    const { name, value } = e.target;
    setSelectedProject({
      ...selectedProject,
      [name]:
        name === "percentage" || name === "id_user" ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    if (!selectedProject.title || !selectedProject.project_name) {
      toast.error("Título y nombre del proyecto son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/projects/${selectedProject.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedProject),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al actualizar");
      }
      toast.success("Proyecto actualizado");
      await fetchProjectsList();
      await fetchProjects();
      setSelectedProject(null);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Error al actualizar proyecto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/projects/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar");
      }
      toast.success("Proyecto eliminado");
      await fetchProjectsList();
      await fetchProjects();
      if (selectedProject?.id === id) setSelectedProject(null);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Error al eliminar proyecto");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <Toaster position="top-center" />

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r text-white  from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <svg
                className="w-8 h-8 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold  bg-clip-text ">
              Actualizar Proyectos
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            🚀 Gestiona y actualiza tus proyectos de manera eficiente con estilo
          </p>
        </div>

        {/* Tabla proyectos */}
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-3xl border border-purple-200 dark:border-purple-700 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 dark:border-purple-700"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-purple-600 absolute top-0"></div>
              </div>
              <span className="text-lg font-medium text-purple-600 dark:text-purple-400">
                Cargando proyectos ...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="">
                  <tr>
                    {/* <th className="px-6 py-5 text-left text-sm font-bold  uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ID
                      </div>
                    </th> */}
                    <th className="px-6 py-5 text-left text-sm font-bold  uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
                        </svg>
                        Título
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold  uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        Proyecto
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-bold  uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Progreso
                      </div>
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-bold  uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Acciones
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className=" transition-all duration-300 cursor-pointer group"
                    >
                      {/* <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center  font-bold text-sm shadow-lg `}
                          >
                            #{project.id}
                          </div>
                        </div>
                      </td> */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg">
                            <svg
                              className="w-5 h-5 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold  group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {project.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg $`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {project.project_name}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {project.percentage !== null &&
                        project.percentage !== undefined ? (
                          <div className="flex items-center gap-4">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 shadow-lg ${
                                  project.percentage >= 80
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : project.percentage >= 50
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                    : "bg-gradient-to-r from-red-400 to-pink-500"
                                }`}
                                style={{ width: `${project.percentage}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-fit">
                                {project.percentage}%
                              </span>
                              {project.percentage >= 80 ? (
                                <span className="text-green-500">🎉</span>
                              ) : project.percentage >= 50 ? (
                                <span className="text-yellow-500">⚡</span>
                              ) : (
                                <span className="text-red-500">🔥</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Sin definir
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="group relative text-white bg-blue-600  px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Editar
                            </div>
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="group relative text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-red-300 disabled:to-pink-300  px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                            disabled={deleting}
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Eliminar
                            </div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              className="w-12 h-12 text-purple-500 dark:text-purple-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark: mb-2">
                              🎨 ¡Espacio creativo!
                            </p>
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                              Comienza creando tu primer proyecto increíble
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formulario de edición */}
        {selectedProject && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl  overflow-hidden">
            <div className="px-8 py-6 ">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <svg
                    className="w-8 h-8 "
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold ">Editar Proyecto</h3>
                  <p className="text-purple-100">
                    {/* ID: {selectedProject.id} • Dale vida a tu proyecto */}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-4 h-4 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
                    </svg>
                    Título del Proyecto
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={selectedProject.title}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2  rounded-2xl focus:outline-none  bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                    placeholder="🎯 Ingresa un título impactante..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    name="project_name"
                    value={selectedProject.project_name}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2  rounded-2xl focus:outline-none  bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                    placeholder="💼 Nombre corto y memorable..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Porcentaje de Progreso
                  </label>
                  <input
                    type="number"
                    name="percentage"
                    value={selectedProject.percentage ?? ""}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2  rounded-2xl focus:outline-none  bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                    min={0}
                    max={100}
                    placeholder="📊 0-100%"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dueño del Proyecto
                  </label>
                  <select
                    name="id_user"
                    value={selectedProject.id_user}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2  rounded-2xl focus:outline-none  bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                  >
                    <option value="">👤 Selecciona un usuario...</option>
                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                        className="dark:bg-gray-800 text-black dark:text-white"
                      >
                        👨‍💼 {user.userName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <svg
                    className="w-4 h-4 text-pink-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Contenido del Proyecto
                </label>
                <textarea
                  name="content"
                  value={selectedProject.content}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-4 border-2  rounded-2xl focus:outline-none  bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                  placeholder="📝 Describe los detalles emocionantes de tu proyecto..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-300  font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  <div className="flex items-center justify-center gap-3">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2  border-white border-t-transparent"></div>
                        <span></span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-white">💾 Guardar Cambios</span>
                      </>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700  font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-white">Cancelar</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
