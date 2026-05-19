"use client";
import React, { useEffect, useState } from "react";

type Comment = {
  id: number;
  nombre: string;
  correo: string;
  comentario: string;
  estatus: string;
  fecha_creacion: string;
  blog_id: number;
};

type BlogName = {
  id: number;
  name: string;
};

function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [blogNames, setBlogNames] = useState<BlogName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedCommentText, setSelectedCommentText] = useState("");
  const [selectedBlogName, setSelectedBlogName] = useState("");
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [blogRes, commentsRes] = await Promise.all([
          fetch("https://mongeortopedia.com/api/blogNames"),
          fetch("https://mongeortopedia.com/api/comments"),
        ]);

        if (!blogRes.ok || !commentsRes.ok) {
          throw new Error("Error en alguna de las respuestas");
        }

        const blogData = await blogRes.json();
        const commentsData = await commentsRes.json();

        setBlogNames(blogData);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = comments.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getBlogName = (id: number): string => {
    const blog = blogNames.find((blog) => blog.id === id);
    return blog ? blog.name : String(id);
  };

  const handleApproveClick = (comment: Comment) => {
    setSelectedComment(comment);
    setModalAction("approve");
    setShowModal(true);
  };

  const handleRejectClick = (comment: Comment) => {
    setSelectedComment(comment);
    setModalAction("reject");
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedComment) return;

    try {
      const newStatus = modalAction === "approve" ? "aceptado" : "rechazado";
      await fetch(
        `https://mongeortopedia.com/api/comments/${selectedComment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estatus: newStatus }),
        }
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === selectedComment.id
            ? { ...comment, estatus: newStatus }
            : comment
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleCommentClick = (commentText: string, blogId: number) => {
    setSelectedCommentText(commentText);
    setSelectedBlogName(getBlogName(blogId));
    setShowCommentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Cargando comentarios...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Comentarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los comentarios de tu blog de manera eficiente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Comentarios
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {comments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Aprobados
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {comments.filter((c) => c.estatus === "aceptado").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rechazados
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {comments.filter((c) => c.estatus === "rechazado").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  {[
                    { key: "nombre", label: "Nombre", icon: "👤" },
                    { key: "correo", label: "Correo", icon: "📧" },
                    { key: "comentario", label: "Comentario", icon: "💬" },
                    { key: "estatus", label: "Estado", icon: "🏷️" },
                    { key: "fecha", label: "Fecha", icon: "📅" },
                    { key: "acciones", label: "Acciones", icon: "⚙️" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{col.icon}</span>
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.length > 0 ? (
                  currentItems.map((comment, index) => (
                    <tr
                      key={comment.id}
                      className={`transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {comment.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {comment.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          {comment.correo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-left max-w-xs"
                          onClick={() =>
                            handleCommentClick(
                              comment.comentario,
                              comment.blog_id
                            )
                          }
                        >
                          <div className="line-clamp-2">
                            {comment.comentario.length > 50
                              ? `${comment.comentario.substring(0, 50)}...`
                              : comment.comentario}
                          </div>
                          <span className="text-xs text-blue-500 hover:underline">
                            Ver completo
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            comment.estatus === "aceptado"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              comment.estatus === "aceptado"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></span>
                          {comment.estatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(comment.fecha_creacion).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {comment.estatus === "aceptado" ? (
                          <button
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                            onClick={() => handleRejectClick(comment)}
                          >
                            Rechazar
                          </button>
                        ) : (
                          <button
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                            onClick={() => handleApproveClick(comment)}
                          >
                            Aprobar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                          ></path>
                        </svg>
                        <p className="text-lg font-medium">
                          No hay comentarios disponibles
                        </p>
                        <p className="text-sm">
                          Los comentarios aparecerán aquí cuando estén
                          disponibles
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {comments.length > itemsPerPage && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, comments.length)}
                  </span>{" "}
                  de <span className="font-medium">{comments.length}</span>{" "}
                  comentarios
                </div>
                <div className="flex gap-2">
                  {Array.from(
                    { length: Math.ceil(comments.length / itemsPerPage) },
                    (_, index) => (
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === index + 1
                            ? "bg-blue-600 text-white shadow-lg transform scale-105"
                            : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 shadow-md hover:shadow-lg"
                        }`}
                        key={index}
                        onClick={() => paginate(index + 1)}
                        disabled={currentPage === index + 1}
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      modalAction === "approve"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                    }`}
                  >
                    {modalAction === "approve" ? (
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl font-bold ml-3 text-gray-900 dark:text-white">
                    Confirmar{" "}
                    {modalAction === "approve" ? "Aprobación" : "Rechazo"}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  ¿Estás seguro de que deseas{" "}
                  {modalAction === "approve" ? "aprobar" : "rechazar"} este
                  comentario? Esta acción se puede revertir más tarde.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 ${
                      modalAction === "approve"
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    }`}
                    onClick={handleConfirmAction}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comment Detail Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold ml-3 text-gray-900 dark:text-white">
                    Comentario Completo
                  </h2>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                    {selectedCommentText}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      📝 Blog:
                    </span>{" "}
                    <span className="font-medium">{selectedBlogName}</span>
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-end">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    onClick={() => setShowCommentModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Comments;
