/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="max-w-lg w-full text-center relative z-10">
        {/* Logo con efecto de brillo */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 rounded-full bg-white opacity-5 animate-ping"></div>
          <img
            src="/logo.jpg"
            alt="Logo"
            className="rounded-full mx-auto size-40 relative z-10 border border-white/10"
          />
        </div>

        {/* 404 con efecto glitch sutil */}
        <div className="relative mb-8">
          <h1 className="text-8xl font-black text-white mb-2 tracking-wider relative">
            4<span className="inline-block transform rotate-12 mx-2">0</span>4
          </h1>
          <div className="absolute inset-0 text-8xl font-black text-white opacity-10 blur-sm">
            404
          </div>
        </div>

        {/* Línea decorativa */}
        <div className="w-20 h-0.5 bg-white mx-auto mb-8 opacity-30"></div>

        {/* Mensaje con tipografía mejorada */}
        <p className="text-white/80 mb-12 text-lg tracking-wide font-light">
          Esta página se ha perdido en el espacio
        </p>

        {/* Botón con efecto hover innovador */}
        <Link href="/" className="group relative inline-block">
          <div className="absolute inset-0 bg-white rounded transform group-hover:scale-105 transition-transform duration-200"></div>
          <div className="relative px-8 py-4 bg-black border border-white text-white rounded transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-200">
            <span className="font-medium tracking-wide">REGRESAR</span>
          </div>
        </Link>

        {/* Elemento decorativo inferior */}
        <div className="mt-16 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
