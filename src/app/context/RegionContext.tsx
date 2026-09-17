"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import type { Region } from "@/lib/pricing";

interface RegionContextProps {
  region: Region;
}

const RegionContext = createContext<RegionContextProps>({ region: "mx" });

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>("mx");

  useEffect(() => {
    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/geo`)
      .then((res) => res.json())
      .then((data: { region?: unknown }) => {
        if (!cancelled && data.region === "us") setRegion("us");
      })
      .catch(() => {
        // Detección fallida — se queda en el default "mx", igual que Ecommetrica.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RegionContext.Provider value={{ region }}>
      {children}
    </RegionContext.Provider>
  );
}

// Custom hook para usar el contexto de región
export function useRegion() {
  return useContext(RegionContext);
}
