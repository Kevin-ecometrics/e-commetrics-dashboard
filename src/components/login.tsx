"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { ModeToggle } from "@/components/toggle";
import { useLang } from "@/app/context/LangContext";
const translations = {
  en: {
    login_welcome: "Welcome",
    login_letsGetStarted: "Let's get started",
    login_emailPlaceholder: "Email",
    login_passwordPlaceholder: "Password",
    login_enter: "Login",
    login_error: "Invalid credentials. Please try again.",
    login_allRightsReserved: "All rights reserved",
    go_to_landing: "Go to e-commetrics",
  },
  es: {
    login_welcome: "Bienvenido",
    login_letsGetStarted: "Vamos a comenzar",
    login_emailPlaceholder: "Correo electrónico",
    login_passwordPlaceholder: "Contraseña",
    login_enter: "Entrar",
    login_error: "Credenciales inválidas. Inténtalo de nuevo.",
    login_allRightsReserved: "Todos los derechos reservados",
    go_to_landing: "Ir a e-commetrics",
  },
};

export default function LoginPage({
  goToLanding,
}: {
  goToLanding?: () => void;
}) {
  const { user, login } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const { lang, changeLang } = useLang();

  const t = translations[lang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (user) {
      setRedirecting(true);
      router.push("/dashboard");
    }
  }, [user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      toast.error(t.login_error);
    }
  }

  if (user === undefined || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen text-black dark:text-white bg-gray-100 dark:bg-gray-950">
        Loading...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-screen w-screen text-black dark:text-white bg-gray-100 dark:bg-gray-950 relative">
      <section className="col-span-2 bg-[url(/hero.webp)] bg-cover bg-center h-screen hidden lg:block" />
      <section className="col-span-1 bg-white dark:bg-gray-900 flex items-center justify-center min-h-[600px] relative">
        <div className={`font-bold text-center px-4`}>
          {/* Idioma */}
          <div className="mb-6 absolute top-8 left-8">
            <button
              onClick={() => changeLang(lang === "en" ? "es" : "en")}
              className="text-blue-600 text-xl hover:scale-110 transition-transform"
              title={lang === "en" ? "Cambiar a Español" : "Switch to English"}
            >
              <Image
                src={lang === "en" ? "/MX.svg" : "/USA.svg"}
                width={40}
                height={40}
                alt={lang === "en" ? "Bandera de México" : "USA Flag"}
                className="shadow-md"
              />
            </button>
          </div>

          <div className="mb-6 absolute top-8 right-8">
            <ModeToggle />
          </div>

          {/* Encabezado */}
          <h1 className="text-3xl text-[#33244c] dark:text-white">
            {t.login_welcome}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            {t.login_letsGetStarted}
          </p>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4 w-80">
            <input
              type="email"
              placeholder={t.login_emailPlaceholder}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.login_passwordPlaceholder}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-black dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-900 hover:bg-[#361F4C] hover:text-white dark:hover:bg-[#5e3e78] text-sm transition-colors duration-300"
            >
              {t.login_enter}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-gray-500 dark:text-gray-400 text-sm hidden md:block">
            {t.login_allRightsReserved} {year}
          </div>

          {/* Botón volver a landing */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => goToLanding?.()}
              className="mt-4 bg-white dark:bg-transparent text-[#BD155C] hover:text-white hover:bg-[#BD155C] transition duration-300 px-8 py-2 rounded-xl shadow-lg border border-[#BD155C] text-sm"
            >
              {t.go_to_landing}
            </button>
          </div>
        </div>
        <Toaster />
      </section>
    </div>
  );
}
