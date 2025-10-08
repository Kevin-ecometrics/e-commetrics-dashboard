"use client";

import { useState, Suspense, lazy, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "@/components/login";
import { useLang } from "@/app/context/LangContext";
const LazyLanding = lazy(() => import("@/components/landing"));

type SelectedOption = "login" | "landing" | null;
type Lang = "es" | "en";

const translations = {
  es: {
    title: "¿Qué deseas hacer?",
    login: "Ingresar al Dashboard",
    explore: "Conocer E-commetrics",
    loading: "Cargando información...",
  },
  en: {
    title: "What would you like to do?",
    login: "Go to Dashboard",
    explore: "Explore E-commetrics",
    loading: "Loading information...",
  },
};

export default function Page() {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);

  const goToLogin = () => setSelectedOption("login");
  const goToLanding = () => setSelectedOption("landing");

  const { lang, changeLang } = useLang();

  useEffect(() => {
    const existingLang = document.cookie.match(
      /(?:^|;\s*)lang=(en|es)/
    )?.[1] as Lang | undefined;

    if (!existingLang) {
      document.cookie = "lang=es; path=/; max-age=31536000";
      changeLang("es");
    } else {
      changeLang(existingLang);
    }
  }, []);

  const t = translations[lang];

  return (
    <div className="overflow-x-hidden min-h-screen">
      <AnimatePresence>
        {selectedOption === null && (
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-l from-[#BD155C] to-[#1E171E]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {t.title}
              </h2>
              <button
                onClick={goToLogin}
                className="w-full bg-[#BD155C] hover:bg-[#BD155C]/90 text-white py-2 px-4 rounded-lg mb-3 transition duration-200"
              >
                {t.login}
              </button>
              <button
                onClick={goToLanding}
                className="w-full bg-gray-100 hover:bg-gray-200 text-black py-2 px-4 rounded-lg transition duration-200"
              >
                {t.explore}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedOption === "login" && <Login goToLanding={goToLanding} />}

      {selectedOption === "landing" && (
        <Suspense
          fallback={<div className="text-center py-10">{t.loading}</div>}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LazyLanding goToLogin={goToLogin} />
          </motion.div>
        </Suspense>
      )}
    </div>
  );
}
