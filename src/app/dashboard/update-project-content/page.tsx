/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

interface Project {
  id: number;
  title: string;
}

interface ProjectContent {
  id: number;
  project_id: number;
  content_1: string;
  content_2: string;
  content_3: string;
  link: string;
  href: string;
  id_user: number;
  source: string | null;
  type:
    | "Name of BUSINESS and Client objectives"
    | "Onboarding Package"
    | "MVP + IDEA"
    | "Strategy"
    | "Growth Hacking";
  created_at: string;
}

export default function ProjectContentByProjectEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contents, setContents] = useState<ProjectContent[]>([]);
  const [editingContent, setEditingContent] = useState<ProjectContent | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const projectsRes = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/projects`
      );
      if (!projectsRes.ok) throw new Error("Error al cargar proyectos");
      const projectsData: Project[] = await projectsRes.json();

      const contentRes = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/project_content`
      );
      if (!contentRes.ok) throw new Error("Error al cargar contenido");
      const contentData: ProjectContent[] = await contentRes.json();

      const validProjectIds = new Set(projectsData.map((p) => p.id));
      const filteredContent = contentData.filter((c) =>
        validProjectIds.has(c.project_id)
      );

      setProjects(projectsData);
      setContents(filteredContent);
    } catch {
      toast.error("Error al obtener datos");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validaciones
      if (!file.type.match("image.*")) {
        toast.error("Por favor, selecciona un archivo de imagen válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe exceder los 5MB");
        return;
      }

      setImageFile(file);

      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este contenido?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/project_content/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Contenido eliminado");
      setContents((prev) => prev.filter((c) => c.id !== id));
      if (editingContent?.id === id) setEditingContent(null);
    } catch {
      toast.error("Error al eliminar contenido");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editingContent) return;
    const { name, value } = e.target;
    setEditingContent({ ...editingContent, [name]: value });
  };

  const handleSave = async () => {
    if (!editingContent) return;

    try {
      const formData = new FormData();

      // Agregar campos de texto
      formData.append("content_1", editingContent.content_1 || "");
      formData.append("content_2", editingContent.content_2 || "");
      formData.append("content_3", editingContent.content_3 || "");
      formData.append("link", editingContent.link || "");
      formData.append("href", editingContent.href || "");
      formData.append("type", editingContent.type);

      // Agregar imagen si existe
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/project_content/${editingContent.id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Error al guardar cambios");

      const data = await res.json();
      toast.success("Contenido actualizado");

      // Actualizar el estado con la nueva imagen si se subió
      if (data.imageUrl) {
        setContents((prev) =>
          prev.map((c) =>
            c.id === editingContent.id ? { ...c, source: data.imageUrl } : c
          )
        );
      }

      setEditingContent(null);
      setImageFile(null);
      setImagePreview(null);
      loadData();
    } catch (err) {
      toast.error("Error al actualizar contenido");
    }
  };

  // Agrupa contenido por project_id
  const groupContentByProject = () => {
    const map = new Map<number, ProjectContent[]>();
    for (const c of contents) {
      if (!map.has(c.project_id)) map.set(c.project_id, []);
      map.get(c.project_id)!.push(c);
    }
    return map;
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  const contentByProject = groupContentByProject();

  // Para el select de tipos de contenido en edición
  const contentTypes = [
    "Name of BUSINESS and Client objectives",
    "Onboarding Package",
    "MVP + IDEA",
    "Strategy",
    "Growth Hacking",
  ] as const;

  return (
    <div className="min-h-screen dark:text-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <Toaster position="top-center" />

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl">
              <svg
                className="w-10 h-10 text-white"
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
            <h2 className="text-5xl font-bold">Contenido por Proyecto</h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            🎨 Gestiona y organiza todo el contenido de tus proyectos en un solo
            lugar
          </p>
        </div>

        {/* Projects List */}
        {projects.map((project) => (
          <div
            key={project.id}
            className="mb-12 bg-white dark:bg-gray-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200 dark:border-indigo-700 overflow-hidden"
          >
            {/* Project Header */}
            <div className="px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <svg
                    className="w-8 h-8"
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
                  <h3 className="text-2xl font-bold">🚀 {project.title}</h3>
                </div>
              </div>
            </div>

            {/* Content Table */}
            <div className="p-8">
              {contentByProject.get(project.id)?.length ? (
                <div className="overflow-x-auto rounded-2xl border-2 border-indigo-200 dark:border-indigo-700">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Tipo
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Contenido 1
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Contenido 2
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Contenido 3
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
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
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            Link
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                            Href
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
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
                    <tbody className="divide-y divide-indigo-100 dark:divide-indigo-800">
                      {contentByProject.get(project.id)!.map((content) => (
                        <tr
                          key={content.id}
                          className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {content.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm whitespace-pre-wrap line-clamp-6 truncate group-hover:whitespace-normal transition-all duration-300">
                                {content.content_1 || (
                                  <span className="text-gray-400 italic">
                                    Sin contenido
                                  </span>
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm whitespace-pre-wrap line-clamp-6 truncate group-hover:whitespace-normal transition-all duration-300">
                                {content.content_2 || (
                                  <span className="text-gray-400 italic">
                                    Sin contenido
                                  </span>
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm whitespace-pre-wrap truncate line-clamp-6 group-hover:whitespace-normal transition-all duration-300">
                                {content.content_3 || (
                                  <span className="text-gray-400 italic">
                                    Sin contenido
                                  </span>
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {content.link ? (
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300 break-all max-w-32 truncate">
                                  {content.link}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-sm">
                                🔗 Sin enlace
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {content.href ? (
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                                  <svg
                                    className="w-4 h-4 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300 break-all max-w-32 truncate">
                                  {content.href}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-sm">
                                📎 Sin referencia
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={() => {
                                  setEditingContent(content);
                                  setImageFile(null);
                                  setImagePreview(null);
                                }}
                                className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                <div className="flex items-center gap-2 text-white">
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
                                onClick={() => handleDelete(content.id)}
                                className="group relative bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              >
                                <div className="flex items-center gap-2 text-white">
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
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-12 h-12 text-indigo-500 dark:text-indigo-400"
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
                      <p className="text-2xl font-bold mb-2">
                        📝 ¡Espacio creativo disponible!
                      </p>
                      <p className="text-lg text-gray-500 dark:text-gray-400">
                        Este proyecto está listo para recibir contenido
                        increíble
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center shadow-xl">
                <svg
                  className="w-16 h-16 text-indigo-500 dark:text-indigo-400"
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
                <p className="text-3xl font-bold mb-4">
                  🚀 ¡El universo de proyectos te espera!
                </p>
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  Crea tu primer proyecto para comenzar la aventura
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Editing Panel */}
        {editingContent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200 dark:border-indigo-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <svg
                        className="w-8 h-8"
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
                      <h3 className="text-2xl font-bold">Editar Contenido</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingContent(null);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg
                      className="w-6 h-6"
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
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Type Selector */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <svg
                        className="w-4 h-4 text-indigo-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Tipo de Contenido
                    </label>
                    <select
                      name="type"
                      value={editingContent.type}
                      onChange={handleChange}
                      className="w-full px-4 focus:outline-none py-4 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                    >
                      {contentTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                          className="dark:bg-gray-800"
                        >
                          🏷️ {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                    <div className="flex items-center gap-4">
                      {(imagePreview || editingContent.source) && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={
                              imagePreview ||
                              `${process.env.NEXT_PUBLIC_URL}${editingContent.source}`
                            }
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "";
                              target.className = "hidden";
                            }}
                          />
                        </div>
                      )}
                      <label className="flex-1">
                        <div className="cursor-pointer bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800/30 dark:hover:to-purple-800/30 border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl p-4 text-center transition-all duration-300">
                          <svg
                            className="w-8 h-8 mx-auto text-indigo-500 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {imageFile
                              ? "Cambiar imagen"
                              : editingContent.source
                              ? "Cambiar imagen"
                              : "Subir imagen"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Content Fields Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contenido Principal
                      </label>
                      <textarea
                        name="content_1"
                        className="w-full px-4 focus:outline-none py-4 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                        rows={4}
                        value={editingContent.content_1}
                        onChange={handleChange}
                        placeholder="📝 Escribe el contenido principal aquí..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <svg
                          className="w-4 h-4 text-purple-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contenido Secundario
                      </label>
                      <textarea
                        name="content_2"
                        className="w-full px-4 focus:outline-none py-4 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                        rows={4}
                        value={editingContent.content_2}
                        onChange={handleChange}
                        placeholder="💡 Información adicional relevante..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <svg
                          className="w-4 h-4 text-pink-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Contenido Extra
                      </label>
                      <textarea
                        name="content_3"
                        className="w-full px-4 focus:outline-none py-4 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                        rows={4}
                        value={editingContent.content_3}
                        onChange={handleChange}
                        placeholder="✨ Detalles complementarios..."
                      />
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <svg
                          className="w-4 h-4 text-cyan-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                        Enlace Principal
                      </label>
                      <input
                        type="text"
                        name="link"
                        className="w-full px-4 focus:outline-none py-4 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                        value={editingContent.link}
                        onChange={handleChange}
                        placeholder="🔗 https://ejemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Referencia Externa
                      </label>
                      <input
                        type="text"
                        name="href"
                        className="w-full px-4 focus:outline-none py-4 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                        value={editingContent.href}
                        onChange={handleChange}
                        placeholder="📎 /ruta/recurso"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSave}
                      className="flex-1 sm:flex-none group relative text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-emerald-700 font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg
                          className="w-5 h-5"
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
                        <span>💾 Guardar Cambios</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setEditingContent(null);
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg
                          className="w-5 h-5"
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
                        <span>Cancelar</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
