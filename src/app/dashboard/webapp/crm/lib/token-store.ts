"use client";

// El token vive aqui y no en session.tsx por una razon concreta: api.ts lo
// necesita para el interceptor de axios, y session.tsx necesita api.ts para
// llamar a /login. Si el token viviera en el contexto de React, tendriamos un
// ciclo de imports entre los dos. Este modulo es plano, sin React, y ambos lo
// importan sin problema.

const STORAGE_KEY = "crm.token";

let current: string | null = null;
let unauthorized: (() => void) | null = null;

/** El token vigente, o null si no hay sesion. */
export function getToken(): string | null {
  return current;
}

/** Fija el token en memoria y en sessionStorage, o lo borra de los dos. */
export function setToken(next: string | null): void {
  current = next;
  try {
    if (next) window.sessionStorage.setItem(STORAGE_KEY, next);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Modo privado de Safari o storage bloqueado: la sesion durara lo que
    // dure esta pestana, que es el mismo comportamiento que sin storage.
  }
}

/**
 * api.ts lo llama cuando el backend responde 401. No puede tocar el estado de
 * React, asi que el aviso le llega por este callback.
 */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorized = fn;
}

export function notifyUnauthorized(): void {
  unauthorized?.();
}

/** Lo lee session.tsx al montar para recuperar la sesion tras un F5. */
export function readStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
