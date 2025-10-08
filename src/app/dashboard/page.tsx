"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useLang } from "@/app/context/LangContext";
// Define el tipo del proyecto
type Project = {
  id: number;
  id_user: number;
  title: string;
  percentage: number;
  content: string;
  project_name: string;
};

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLang();

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user) {
      if (user.role === "admin") {
        fetchProjects();
      } else {
        fetchProjects(Number(user.id));
      }
    }
  }, [user, router]);

  const fetchProjects = async (userId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = userId
        ? `${process.env.NEXT_PUBLIC_URL}/api/projects/${userId}`
        : `${process.env.NEXT_PUBLIC_URL}/api/projects`;
      const res = await fetch(url, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al cargar los proyectos");
      }
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("No se pudieron cargar los proyectos");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Cargando proyectos...
          </p>
        </div>
      </div>
    );
  }

  if (user === null) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {lang === "es" ? "Tus Proyectos" : "Your Projects"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {lang === "es"
                  ? "Gestiona y supervisa todos tus proyectos desde aquí"
                  : "Manage and supervise all your projects from here"}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {projects.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lang === "es" ? "Proyectos" : "Projects"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {projects.filter((p) => p.percentage >= 80).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lang === "es" ? "Completados" : "Completed"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {projects.length === 0 && !loading && !error ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {lang === "es"
                ? "No tienes proyectos aún"
                : "You don't have any projects yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {lang === "es"
                ? "Cuando se te asignen proyectos, aparecerán aquí"
                : "When you are assigned projects, they will appear here"}
            </p>
            <button
              onClick={() => fetchProjects(Number(user.id))}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {lang === "es" ? "Actualizar" : "Update"}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const progressColor =
                project.percentage >= 80
                  ? "bg-green-500 dark:bg-green-400"
                  : project.percentage >= 50
                  ? "bg-yellow-500 dark:bg-yellow-400"
                  : "bg-red-500 dark:bg-red-400";

              const progressBg =
                project.percentage >= 80
                  ? "bg-green-100 dark:bg-green-900/30"
                  : project.percentage >= 50
                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                  : "bg-red-100 dark:bg-red-900/30";

              return (
                <article
                  key={project.id}
                  className="group bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-gray-900/70 hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Header de la tarjeta */}
                  <div className="p-6 pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {project.title}
                        </h2>
                      </div>

                      {/* Status indicator */}
                      <div
                        className={`w-3 h-3 rounded-full ${progressColor} flex-shrink-0 mt-1`}
                      ></div>
                    </div>
                  </div>

                  {/* Contenido principal */}
                  <div className="px-6 pb-6 space-y-4">
                    {/* Nombre del proyecto */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400 dark:text-gray-500"
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lang === "es" ? "Proyecto" : "Project"}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 ">
                        {project.project_name}
                      </p>
                    </div>

                    {/* Progreso */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {lang === "es" ? "Progreso" : "Progress"}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {project.percentage ?? 0}%
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div
                        className={`w-full ${progressBg} rounded-full h-2.5 overflow-hidden`}
                      >
                        <div
                          className={`h-full ${progressColor} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${project.percentage ?? 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Contenido */}
                    {project.content && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400 dark:text-gray-500"
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
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {lang === "es" ? "Descripción" : "Description"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {project.content}
                        </p>
                      </div>
                    )}

                    {/* Botón de acción */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Link
                        href={`/dashboard/${project.project_name}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 group/link"
                      >
                        <span>
                          {lang === "es" ? "Ir al proyecto" : "Go to project"}
                        </span>
                        <svg
                          className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer informativo */}
        {projects.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {lang === "es" ? "Mostrando" : "Showing"}
                {projects.length} {lang === "es" ? "proyecto" : "project"}
                {projects.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
