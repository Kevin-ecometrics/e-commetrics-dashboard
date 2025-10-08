/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/app/context/AuthContext";
import { useLang } from "@/app/context/LangContext";

type Project = {
  id: number;
  id_user: number;
  title: string;
  percentage: number | null;
  content: string;
  project_name: string;
  created_at: string;
};

type ProjectContentItem = {
  id: number;
  project_id: number;
  content_1: string;
  content_2: string;
  content_3: string;
  link: string;
  href: string;
  id_user: number;
  source: string;
  type: string;
  created_at: string;
};

const types_es = [
  "Todos",
  "Name of BUSINESS and Client objectives",
  "Onboarding Package",
  "MVP + IDEA",
  "Strategy",
  "Growth Hacking",
];

const types_en = [
  "All",
  "Name of BUSINESS and Client objectives",
  "Onboarding Package",
  "MVP + IDEA",
  "Strategy",
  "Growth Hacking",
];

export default function ProjectContent({ project }: { project: Project[] }) {
  const currentProject = project[0];
  const { user } = useAuth();
  const { lang } = useLang();
  const types = lang === "es" ? types_es : types_en;

  const [contents, setContents] = useState<ProjectContentItem[]>([]);
  const [filteredType, setFilteredType] = useState(types[0]);
  const [loading, setLoading] = useState(false);

  const isOwner = Number(user?.id) === currentProject?.id_user;
  const isAdmin = user?.role === "admin";
  const canAccess = isOwner || isAdmin;

  useEffect(() => {
    const fetchContents = async () => {
      if (!currentProject?.id || !canAccess) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_URL}/api/project_content/${currentProject.id}`
        );
        setContents(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error al obtener el contenido del proyecto:", error);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [currentProject?.id, canAccess]);

  const filteredContents =
    filteredType === types[0]
      ? contents
      : contents.filter((item) => item.type === filteredType);

  if (!canAccess) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        <h1 className="text-2xl font-bold mb-2">
          {lang === "es" ? "Acceso denegado" : "Access denied"}
        </h1>
        <p>
          {lang === "es"
            ? "No tienes permiso para ver este contenido."
            : "You do not have permission to view this content."}
        </p>
      </div>
    );
  }
  return (
    <div className="p-6 min-h-screen bg-white dark:bg-black transition-colors duration-200">
      {/* Header del proyecto */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {currentProject.project_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {lang === "es" ? "Contenido del proyecto" : "Project content"}
        </p>
      </div>

      {/* Filtro por tipo */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          {lang === "es" ? "Filtrar por tipo" : "Filter by type"}
        </h2>
        <div className="flex flex-wrap gap-3">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilteredType(type)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                filteredType === type
                  ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-lg shadow-blue-500/25"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent dark:border-blue-400"></div>
        </div>
      )}

      {/* Contenido */}
      {!loading && (
        <>
          {filteredContents.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                {lang === "es"
                  ? "Sin contenido disponible"
                  : "No content available"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {lang === "es"
                  ? "No hay contenido disponible para este tipo de filtro."
                  : "No content available for this filter type."}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredContents.map((item) => (
                <article
                  key={item.id}
                  className="group bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-gray-900/70 hover:scale-[1.02] transition-all duration-300"
                >
                  {/* Imagen del contenido */}
                  {item.source ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={`${process.env.NEXT_PUBLIC_URL}/${item.source}`}
                        alt={`Imagen de ${item.type}`}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden">
                      <img
                        src="/logo.jpg"
                        alt={`Imagen de ${item.type}`}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}

                  {/* Contenido de la tarjeta */}
                  <div className="p-6 space-y-4">
                    {/* Tipo/Categoría */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {item.type}
                      </span>
                      {/* <time className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("es-ES")}
                      </time> */}
                    </div>

                    {/* Contenido principal */}
                    <div className="space-y-3">
                      {item.content_1 && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                          {item.content_1}
                        </h3>
                      )}

                      {item.content_2 && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                          {item.content_2}
                        </p>
                      )}

                      {item.content_3 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {item.content_3}
                        </p>
                      )}
                    </div>

                    {/* Enlace */}
                    {item.link && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 group/link"
                        >
                          <span>{item.href || "Ver enlace"}</span>
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer informativo */}
      {!loading && filteredContents.length > 0 && (
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {lang === "es" ? "Mostrando" : "Showing"} {filteredContents.length}{" "}
            {lang === "es" ? "elemento" : "element"}
            {filteredContents.length !== 1 ? "s" : ""}
            {filteredType !== "Todos" && ` de tipo "${filteredType}"`}
          </p>
        </div>
      )}
    </div>
  );
}
