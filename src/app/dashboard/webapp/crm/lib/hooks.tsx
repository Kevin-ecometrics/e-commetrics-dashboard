"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { errorMessage } from "./api";

// Capa de datos minima, sin librerias.
//
// El CRM original invalidaba con un contador `refreshKey` reescrito a mano en
// cuatro sitios. Aqui hay un unico `revision` en contexto: las mutaciones lo
// incrementan y todo lo montado vuelve a pedir. Mismo comportamiento, un solo
// sitio donde puede equivocarse.

const CrmDataContext = createContext<{ revision: number; bump: () => void } | null>(null);

export function CrmDataProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((n) => n + 1), []);

  const value = useMemo(() => ({ revision, bump }), [revision, bump]);
  return <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>;
}

function useCrmData() {
  const value = useContext(CrmDataContext);
  if (!value) {
    throw new Error("useResource se uso fuera de <CrmDataProvider>.");
  }
  return value;
}

type Resource<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** Pide los datos otra vez sin esperar a una mutacion. */
  reload: () => void;
};

/**
 * Pide `fetcher` y expone su estado.
 *
 * `key` es la dependencia explicita: cambia cuando los datos de la pantalla
 * cambian (por ejemplo el id del lead abierto). Se pasa como string y no como
 * array para no meter un spread en las dependencias, que eslint marca.
 *
 * El fetcher se guarda en un ref, asi que no hace falta memorizarlo con
 * useCallback y no puede provocar un bucle por cambiar de identidad en cada
 * render.
 */
export function useResource<T>(key: string, fetcher: () => Promise<T>): Resource<T> {
  const { revision } = useCrmData();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // No se borra `data`: durante un refresco fallido conviene conservar lo
        // que ya se estaba viendo en vez de dejar la pantalla en blanco.
        setError(errorMessage(err));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, revision, manual]);

  const reload = useCallback(() => setManual((n) => n + 1), []);

  return { data, error, loading, reload };
}

type Mutation<TArgs extends unknown[], TResult> = {
  run: (...args: TArgs) => Promise<TResult | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

/**
 * Envuelve una llamada de escritura: lleva su propio estado de carga y error y,
 * si tiene exito, refresca las lecturas montadas.
 *
 * `onError` recibe el mensaje ya transformado a string y el error original, para
 * que la pantalla pueda mirar el status HTTP sin tener que parsear el mensaje.
 * Si no se pasa `onError`, el mensaje queda en `error` y hay que mirarlo a mano.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options?: {
    onSuccess?: (result: TResult) => void;
    onError?: (message: string, error: unknown) => void;
  }
): Mutation<TArgs, TResult> {
  const { bump } = useCrmData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fnRef = useRef(fn);
  fnRef.current = fn;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current(...args);
        setLoading(false);
        optionsRef.current?.onSuccess?.(result);
        bump();
        return result;
      } catch (err) {
        setLoading(false);
        // Se usa errorMessage() y no err.message porque axios solo dice
        // "Request failed with status code 400" y el mensaje util ("Lead not
        // found") viene en el { error } del cuerpo.
        const message = errorMessage(err);
        setError(message);
        optionsRef.current?.onError?.(message, err);
        return null;
      }
    },
    [bump]
  );

  const reset = useCallback(() => setError(null), []);

  return { run, loading, error, reset };
}
