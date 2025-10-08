"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import Cookies from "js-cookie";

type LangType = "es" | "en";

interface LangContextProps {
  lang: LangType;
  changeLang: (newLang: LangType) => void;
}

const LangContext = createContext<LangContextProps>({
  lang: "es",
  changeLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangType>("es");

  useEffect(() => {
    const cookieLang = Cookies.get("lang") as LangType | undefined;
    if (cookieLang) {
      setLang(cookieLang);
    } else {
      Cookies.set("lang", "es", { expires: 365 });
      setLang("es");
    }
  }, []);

  const changeLang = (newLang: LangType) => {
    Cookies.set("lang", newLang, { expires: 365 });
    setLang(newLang);
  };

  return (
    <LangContext.Provider value={{ lang, changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

// Custom hook para usar el contexto de idioma
export function useLang() {
  return useContext(LangContext);
}
