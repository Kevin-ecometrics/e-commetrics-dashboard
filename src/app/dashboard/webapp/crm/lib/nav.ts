"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Navegacion interna del CRM por query params, no por rutas.
//
// Motivo tecnico: el dashboard hace `output: "export"`, y con export estatico
// Next exige `generateStaticParams` para las rutas dinamicas. Los ids de lead
// viven en MySQL y en el momento del build no existen, asi que /leads/[id] no
// se puede construir. Un query param resuelve el mismo problema sin tocar la
// configuracion del build.
//
// Contra: se pierde la semantica de rutas anidadas. A cambio se gana deep
// linking y el boton de atras del navegador, que con estado en memoria no habia.

export const VIEWS = ["pipeline", "dashboard", "settings", "lead"] as const;
export type CrmView = (typeof VIEWS)[number];

function isView(value: string | null): value is CrmView {
  return value !== null && (VIEWS as readonly string[]).includes(value);
}

export function useCrmNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawView = params.get("view");
  const view: CrmView = isView(rawView) ? rawView : "pipeline";
  const leadId = params.get("id");

  const go = (next: CrmView, id?: string) => {
    const search = new URLSearchParams();
    search.set("view", next);
    if (next === "lead") {
      if (!id) return;
      search.set("id", id);
    }
    router.push(`${pathname}?${search.toString()}`);
  };

  return {
    view,
    leadId: view === "lead" ? leadId : null,
    goPipeline: () => go("pipeline"),
    goDashboard: () => go("dashboard"),
    goSettings: () => go("settings"),
    goLead: (id: string) => go("lead", id),
  };
}
