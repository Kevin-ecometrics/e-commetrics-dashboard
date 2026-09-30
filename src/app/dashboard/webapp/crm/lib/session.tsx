"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiLogout, apiMe, errorMessage } from "./api";
import { readStoredToken, setToken, setUnauthorizedHandler } from "./token-store";
import type { CrmUser } from "./types";

type SessionStatus = "restoring" | "authenticated" | "anonymous";

type SessionValue = {
  status: SessionStatus;
  user: CrmUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const CrmSessionContext = createContext<SessionValue | null>(null);

export function CrmSessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("restoring");
  const [user, setUser] = useState<CrmUser | null>(null);

  // Al montar, si hay token en sessionStorage se confirma contra /crm/me antes
  // de dar la app por logueada. Sin esto, un token caducado (TTL o despliegue
  // que cambia CRM_JWT_SECRET) dejaria una pantalla que parece funcionar y
  // falla en cada clic.
  useEffect(() => {
    let cancelled = false;
    const stored = readStoredToken();
    if (!stored) {
      setStatus("anonymous");
      return;
    }

    setToken(stored);
    apiMe()
      .then((me) => {
        if (cancelled) return;
        if (me) {
          setUser(me);
          setStatus("authenticated");
        } else {
          setToken(null);
          setStatus("anonymous");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        setStatus("anonymous");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // api.ts no puede tocar este estado; delega mediante el token-store.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setStatus("anonymous");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    // Primero se limpia el estado local: aunque la llamada al backend falle
    // (red caída, 502), el usuario tiene que quedar fuera de la app igual.
    setToken(null);
    setUser(null);
    setStatus("anonymous");
    void apiLogout();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ status, user, login, logout }),
    [status, user, login, logout]
  );

  return <CrmSessionContext.Provider value={value}>{children}</CrmSessionContext.Provider>;
}

export function useCrmSession(): SessionValue {
  const value = useContext(CrmSessionContext);
  if (!value) {
    throw new Error("useCrmSession se uso fuera de <CrmSessionProvider>.");
  }
  return value;
}

/** Traduce el error de un login a algo mostrable. */
export function loginErrorMessage(error: unknown): string {
  return errorMessage(error, "No se pudo iniciar sesion.");
}
