"use client";

import React, { JSX } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useLang } from "@/app/context/LangContext";
import { useAuth } from "@/app/context/AuthContext";
import {
  QrCode, CreditCard, Newspaper, CalendarDays, CalendarCheck, CalendarClock, Tag, Search,
} from "lucide-react";


const formatProjectName = (name: string): string =>
  name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface AppItem {
  id: string;
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  component: string;
  category: "app" | "calendar";
}

const apps: AppItem[] = [
  { id: "qr", name: "Generador de QR", url: "/dashboard/webapp/qr", icon: QrCode, component: "QR", category: "app" },
  { id: "vcard", name: "Tarjeta de Visita", url: "/dashboard/webapp/vcard", icon: CreditCard, component: "Vcard", category: "app" },
  { id: "blogs", name: "Gestor de Blogs", url: "/dashboard/webapp/blogs", icon: Newspaper, component: "blogs", category: "app" },
  { id: "calendar", name: "Calendario", url: "/dashboard/webapp/calendar", icon: CalendarDays, component: "calendar", category: "calendar" },
  { id: "reforma", name: "Calendario Reforma", url: "/dashboard/webapp/calendar-reforma", icon: CalendarCheck, component: "Reforma", category: "calendar" },
  { id: "monge", name: "Calendario Monge", url: "/dashboard/webapp/calendar-monge", icon: CalendarClock, component: "Monge", category: "calendar" },
  { id: "promo-palmas", name: "Promo Palmas", url: "/dashboard/webapp/promo-palmas", icon: Tag, component: "PromoPalmas", category: "app" },
  { id: "calendario-palmas", name: "Calendario Palmas", url: "/dashboard/webapp/calendario-palmas", icon: CalendarDays, component: "CalendarioPalmas", category: "calendar" },
];

const appsEn: AppItem[] = [
  { id: "qr", name: "QR Generator", url: "/dashboard/webapp/qr", icon: QrCode, component: "QR", category: "app" },
  { id: "vcard", name: "VCard Builder", url: "/dashboard/webapp/vcard", icon: CreditCard, component: "Vcard", category: "app" },
  { id: "blogs", name: "Blog Manager", url: "/dashboard/webapp/blogs", icon: Newspaper, component: "blogs", category: "app" },
  { id: "calendar", name: "Calendar", url: "/dashboard/webapp/calendar", icon: CalendarDays, component: "calendar", category: "calendar" },
  { id: "reforma", name: "Reforma Calendar", url: "/dashboard/webapp/calendar-reforma", icon: CalendarCheck, component: "Reforma", category: "calendar" },
  { id: "monge", name: "Monge Calendar", url: "/dashboard/webapp/calendar-monge", icon: CalendarClock, component: "Monge", category: "calendar" },
  { id: "promo-palmas", name: "Promo Palmas", url: "/dashboard/webapp/promo-palmas", icon: Tag, component: "PromoPalmas", category: "app" },
  { id: "calendario-palmas", name: "Palmas Calendar", url: "/dashboard/webapp/calendario-palmas", icon: CalendarDays, component: "CalendarioPalmas", category: "calendar" },
];

export default function Bread(): JSX.Element {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];
  const { lang } = useLang();
  const { user, permissions } = useAuth();
  const [openProjectMenu, setOpenProjectMenu] = React.useState(false);
  const [appSearch, setAppSearch] = React.useState("");

  const currentApps = lang === "es" ? apps : appsEn;

  const getFilteredApps = (): AppItem[] => {
    if (user?.role === "admin") return currentApps;
    return currentApps.filter((app) => {
      const permission = permissions.find((p) => p.component === app.component);
      return permission?.can_view === true;
    });
  };

  const filteredApps = getFilteredApps();

  const searchedApps = appSearch
    ? filteredApps.filter((a) => a.name.toLowerCase().includes(appSearch.toLowerCase()))
    : filteredApps;

  // Solo Dashboard
  if (segments.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span className="dark:text-white text-black">Dashboard</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Rutas que deben ser omitidas del breadcrumb
  const hiddenRoutes = new Set(["webapp"]);

  // Mapeo de nombres para mostrar
  const routeNames: Record<string, string> = {
    account: lang === "es" ? "Cuenta" : "Account",
    "create-client": lang === "es" ? "Crear Cliente" : "Create Client",
    qr: lang === "es" ? "Generador de QR" : "QR Generator",
    vcard: lang === "es" ? "Generador de Contactos" : "Contact Generator",
    "access-app": lang === "es" ? "Permisos" : "Permission",
  };

  // Para rutas de 2 niveles (/dashboard/algo)
  if (segments.length === 2) {
    const [, currentPage] = segments;
    const isKnownRoute = currentPage in routeNames;
    const displayName =
      routeNames[currentPage] || formatProjectName(currentPage);

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {isKnownRoute || filteredApps.length === 0 ? (
              <BreadcrumbPage>{displayName}</BreadcrumbPage>
            ) : (
              <DropdownMenu open={openProjectMenu} onOpenChange={(open) => { setOpenProjectMenu(open); if (!open) setAppSearch(""); }}>
                <DropdownMenuTrigger asChild>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--ec-text-muted)",
                      fontSize: "inherit",
                      fontFamily: "inherit",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {displayName}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 9l6 6 6-6"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-72 p-0"
                  side="bottom"
                  align="start"
                  style={{ borderRadius: 14, overflow: "hidden" }}
                >
                  {/* Search */}
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ec-hairline)" }}>
                    <div style={{ position: "relative" }}>
                      <Search
                        size={13}
                        style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", pointerEvents: "none" }}
                      />
                      <input
                        value={appSearch}
                        onChange={(e) => setAppSearch(e.target.value)}
                        placeholder={lang === "es" ? "Buscar…" : "Search…"}
                        style={{
                          width: "100%", padding: "7px 10px 7px 30px", fontSize: 12,
                          border: "1px solid var(--ec-hairline)", borderRadius: 8,
                          background: "var(--ec-surface-2)", color: "var(--ec-text)",
                          outline: "none",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {searchedApps.length === 0 ? (
                      <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ec-text-dim)", fontSize: 12 }}>
                        {lang === "es" ? "Sin resultados" : "No results"}
                      </div>
                    ) : (
                      <>
                        {searchedApps.filter((a) => a.category === "app").length > 0 && (
                          <>
                            <div className="text-xs font-semibold px-3 py-2" style={{ color: "var(--ec-text-dim)", letterSpacing: "0.05em" }}>
                              {lang === "es" ? "Apps" : "Apps"}
                            </div>
                            {searchedApps.filter((a) => a.category === "app").map((app) => (
                              <Link
                                key={app.id}
                                href={app.url}
                                onClick={() => { setOpenProjectMenu(false); setAppSearch(""); }}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", textDecoration: "none", color: "inherit", fontSize: 13 }}
                                className="hover:bg-accent focus:bg-accent outline-none"
                              >
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ec-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <app.icon size={14} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, color: "var(--ec-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {app.name}
                                  </div>
                                  <div style={{ fontSize: 10, color: "var(--ec-text-dim)" }}>
                                    {lang === "es" ? "Aplicación" : "Application"}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                        {searchedApps.filter((a) => a.category === "calendar").length > 0 && (
                          <>
                            <div className="text-xs font-semibold px-3 py-2" style={{ color: "var(--ec-text-dim)", letterSpacing: "0.05em" }}>
                              {lang === "es" ? "Calendarios" : "Calendars"}
                            </div>
                            {searchedApps.filter((a) => a.category === "calendar").map((app) => (
                              <Link
                                key={app.id}
                                href={app.url}
                                onClick={() => { setOpenProjectMenu(false); setAppSearch(""); }}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", textDecoration: "none", color: "inherit", fontSize: 13 }}
                                className="hover:bg-accent focus:bg-accent outline-none"
                              >
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ec-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <app.icon size={14} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, color: "var(--ec-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {app.name}
                                  </div>
                                  <div style={{ fontSize: 10, color: "var(--ec-text-dim)" }}>
                                    {lang === "es" ? "Calendario" : "Calendar"}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Para rutas de 3+ niveles (/dashboard/proyecto/pagina)
  const [, projectName, ...restSegments] = segments;

  // Si el proyecto está en rutas ocultas, saltarlo
  if (hiddenRoutes.has(projectName)) {
    // Tratar como si fuera una ruta de 2 niveles
    const currentPage = restSegments[restSegments.length - 1];
    const displayName =
      routeNames[currentPage] || formatProjectName(currentPage);

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{displayName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
  const projectDisplayName =
    routeNames[projectName] || formatProjectName(projectName);
  const breadcrumbItems: JSX.Element[] = [];

  // Agregar proyecto con dropdown de apps/calendarios
  breadcrumbItems.push(
    <BreadcrumbItem key={projectName}>
      {filteredApps.length === 0 ? (
        <span className="text-muted-foreground">{projectDisplayName}</span>
      ) : (
      <DropdownMenu open={openProjectMenu} onOpenChange={(open) => { setOpenProjectMenu(open); if (!open) setAppSearch(""); }}>
        <DropdownMenuTrigger asChild>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ec-text-muted)",
              fontSize: "inherit",
              fontFamily: "inherit",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {projectDisplayName}
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 p-0"
          side="bottom"
          align="start"
          style={{ borderRadius: 14, overflow: "hidden" }}
        >
          {/* Search */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--ec-hairline)" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={13}
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ec-text-dim)", pointerEvents: "none" }}
              />
              <input
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder={lang === "es" ? "Buscar…" : "Search…"}
                style={{
                  width: "100%", padding: "7px 10px 7px 30px", fontSize: 12,
                  border: "1px solid var(--ec-hairline)", borderRadius: 8,
                  background: "var(--ec-surface-2)", color: "var(--ec-text)",
                  outline: "none",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {searchedApps.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ec-text-dim)", fontSize: 12 }}>
                {lang === "es" ? "Sin resultados" : "No results"}
              </div>
            ) : (
              <>
                {searchedApps.filter((a) => a.category === "app").length > 0 && (
                  <>
                    <div className="text-xs font-semibold px-3 py-2" style={{ color: "var(--ec-text-dim)", letterSpacing: "0.05em" }}>
                      {lang === "es" ? "Apps" : "Apps"}
                    </div>
                    {searchedApps.filter((a) => a.category === "app").map((app) => (
                      <Link
                        key={app.id}
                        href={app.url}
                        onClick={() => { setOpenProjectMenu(false); setAppSearch(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", textDecoration: "none", color: "inherit", fontSize: 13 }}
                        className="hover:bg-accent focus:bg-accent outline-none"
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ec-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <app.icon size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "var(--ec-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {app.name}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--ec-text-dim)" }}>
                            {lang === "es" ? "Aplicación" : "Application"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
                {searchedApps.filter((a) => a.category === "calendar").length > 0 && (
                  <>
                    <div className="text-xs font-semibold px-3 py-2" style={{ color: "var(--ec-text-dim)", letterSpacing: "0.05em" }}>
                      {lang === "es" ? "Calendarios" : "Calendars"}
                    </div>
                    {searchedApps.filter((a) => a.category === "calendar").map((app) => (
                      <Link
                        key={app.id}
                        href={app.url}
                        onClick={() => { setOpenProjectMenu(false); setAppSearch(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", textDecoration: "none", color: "inherit", fontSize: 13 }}
                        className="hover:bg-accent focus:bg-accent outline-none"
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ec-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <app.icon size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: "var(--ec-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {app.name}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--ec-text-dim)" }}>
                            {lang === "es" ? "Calendario" : "Calendar"}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      )}
    </BreadcrumbItem>
  );

  // Agregar resto de segmentos
  restSegments.forEach((segment, index) => {
    const displayName = routeNames[segment] || formatProjectName(segment);
    const isLast = index === restSegments.length - 1;

    breadcrumbItems.push(<BreadcrumbSeparator key={`sep-${segment}`} />);

    if (isLast) {
      breadcrumbItems.push(
        <BreadcrumbItem key={segment}>
          <BreadcrumbPage>{displayName}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    } else {
      breadcrumbItems.push(
        <BreadcrumbItem key={segment}>
          <span className="text-muted-foreground">{displayName}</span>
        </BreadcrumbItem>
      );
    }
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/dashboard">Dashboard</Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbItems}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
