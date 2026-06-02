"use client";

import * as React from "react";
import {
  Frame,
  UserPlus,
  UserCog,
  FolderPlus,
  FolderCog,
  FilePlus,
  FileCog,
  Shield,
  Tag,
  QrCode,
  CreditCard,
  CalendarDays,
  Newspaper,
  CalendarCheck,
  CalendarClock,
  LucideIcon,
  Search,
  Scan,
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import Cookies from "js-cookie";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { useAuth } from "@/app/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useLang } from "@/app/context/LangContext";

/**
 * Tipo para definir la estructura de una aplicación en el sidebar
 */
interface AppItem {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
  component: string; // Nombre que debe coincidir exactamente con los permisos en la base de datos
  category: "app" | "calendar";
}

/**
 * Tipo para definir las acciones administrativas
 */
interface AdminAction {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
  category: string; // Nueva propiedad para categorizar
}

/**
 * Tipo para los permisos de usuario (debe coincidir con el tipo del contexto de autenticación)
 */
interface Permission {
  component: string;
  can_view: boolean;
}

/**
 * Tipo para los proyectos (debe coincidir con el tipo del contexto de autenticación)
 */
interface Project {
  id: number;
  project_name: string;
  title?: string;
  id_user: number;
  percentage?: number | null;
}

/**
 * Props del componente AppSidebar
 */
type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

/**
 * Componente principal del sidebar de la aplicación
 */
export function AppSidebar({ ...props }: AppSidebarProps) {
  // Hooks para obtener datos del contexto de autenticación
  const { user, projects = [], permissions = [] } = useAuth();

  // Hooks para manejo del sidebar responsive
  const { setOpenMobile, isMobile } = useSidebar();

  // Hook para manejo del idioma
  const { lang, changeLang } = useLang();

  /**
   * Efecto para cargar el idioma desde las cookies al montar el componente
   */
  React.useEffect(() => {
    const cookieLang = Cookies.get("lang") as "es" | "en";
    if (cookieLang) {
      changeLang(cookieLang);
    }
  }, [changeLang]);

  const [openAdminProjects, setOpenAdminProjects] = React.useState(false);
  const [projectSearch, setProjectSearch] = React.useState("");

  const [openApps, setOpenApps] = React.useState(false);
  const [openCalendars, setOpenCalendars] = React.useState(false);
  const [appSearch, setAppSearch] = React.useState("");
  const [calendarSearch, setCalendarSearch] = React.useState("");

  const handleItemClick = (): void => {
    if (isMobile) setOpenMobile(false);
    setOpenAdminProjects(false);
    setProjectSearch("");
    setOpenApps(false);
    setOpenCalendars(false);
    setAppSearch("");
    setCalendarSearch("");
  };

  const appsByCategory = (cat: "app" | "calendar") =>
    (cat === "app" ? searchedApps : searchedCalendars).filter((app) => app.category === cat);

  const statusColor = (pct: number | null | undefined): string => {
    if (pct == null || pct === 0) return "var(--ec-danger)";
    if (pct >= 80) return "var(--ec-success)";
    if (pct >= 50) return "var(--ec-warning)";
    return "var(--ec-danger)";
  };

  /**
   * Proyectos visibles según el rol del usuario
   */
  const visibleProjects: Project[] =
    user?.role === "admin"
      ? projects
      : projects.filter(
          (project: Project) => project.id_user === Number(user?.id)
        );

  const filteredVisibleProjects = user?.role === "admin" && projectSearch
    ? visibleProjects.filter((p) => {
        const q = projectSearch.toLowerCase();
        return (p.title ?? p.project_name).toLowerCase().includes(q) || p.project_name.toLowerCase().includes(q);
      })
    : visibleProjects;

  /**
   * Configuración de aplicaciones disponibles
   */
  const apps: AppItem[] = [
    {
      id: "qr",
      name: "Generador de QR",
      url: "/dashboard/webapp/qr",
      icon: QrCode,
      component: "QR",
      category: "app",
    },
    {
      id: "vcard",
      name: "Tarjeta de Visita",
      url: "/dashboard/webapp/vcard",
      icon: CreditCard,
      component: "Vcard",
      category: "app",
    },
    {
      id: "blogs",
      name: "Gestor de Blogs",
      url: "/dashboard/webapp/blogs",
      icon: Newspaper,
      component: "blogs",
      category: "app",
    },
    {
      id: "reforma",
      name: "Calendario Reforma",
      url: "/dashboard/webapp/calendar-reforma",
      icon: CalendarCheck,
      component: "Reforma",
      category: "calendar",
    },
    {
      id: "monge",
      name: "Calendario Monge",
      url: "/dashboard/webapp/calendar-monge",
      icon: CalendarClock,
      component: "Monge",
      category: "calendar",
    },
    {
      id: "promo-palmas",
      name: "Promo Palmas",
      url: "/dashboard/webapp/promo-palmas",
      icon: Tag,
      component: "PromoPalmas",
      category: "app",
    },
    {
      id: "calendario-palmas",
      name: "Calendario Palmas",
      url: "/dashboard/webapp/calendario-palmas",
      icon: CalendarDays,
      component: "CalendarioPalmas",
      category: "calendar",
    },
    {
      id: "scan-eat",
      name: "ScanEat Demos",
      url: "/dashboard/webapp/scan-eat",
      icon: Scan,
      component: "ScanEat",
      category: "app",
    },
  ];

  const appsEn: AppItem[] = [
    {
      id: "qr",
      name: "QR Generator",
      url: "/dashboard/webapp/qr",
      icon: QrCode,
      component: "QR",
      category: "app",
    },
    {
      id: "vcard",
      name: "VCard Builder",
      url: "/dashboard/webapp/vcard",
      icon: CreditCard,
      component: "Vcard",
      category: "app",
    },
    {
      id: "blogs",
      name: "Blog Manager",
      url: "/dashboard/webapp/blogs",
      icon: Newspaper,
      component: "blogs",
      category: "app",
    },
    {
      id: "reforma",
      name: "Reforma Calendar",
      url: "/dashboard/webapp/calendar-reforma",
      icon: CalendarCheck,
      component: "Reforma",
      category: "calendar",
    },
    {
      id: "monge",
      name: "Monge Calendar",
      url: "/dashboard/webapp/calendar-monge",
      icon: CalendarClock,
      component: "Monge",
      category: "calendar",
    },
    {
      id: "promo-palmas",
      name: "Promo Palmas",
      url: "/dashboard/webapp/promo-palmas",
      icon: Tag,
      component: "PromoPalmas",
      category: "app",
    },
    {
      id: "calendario-palmas",
      name: "Palmas Calendar",
      url: "/dashboard/webapp/calendario-palmas",
      icon: CalendarDays,
      component: "CalendarioPalmas",
      category: "calendar",
    },
    {
      id: "scan-eat",
      name: "ScanEat Demos",
      url: "/dashboard/webapp/scan-eat",
      icon: Scan,
      component: "ScanEat",
      category: "app",
    },
  ];

  /**
   * Función para filtrar aplicaciones según los permisos del usuario
   */
  const getFilteredApps = (appsList: AppItem[]): AppItem[] => {
    if (user?.role === "admin") {
      return appsList;
    }

    return appsList.filter((app: AppItem) => {
      const permission = permissions.find(
        (p: Permission) => p.component === app.component
      );
      return permission?.can_view === true;
    });
  };

  const filteredApps: AppItem[] = getFilteredApps(
    lang === "es" ? apps : appsEn
  );

  const searchedApps = appSearch
    ? filteredApps.filter((a) => a.name.toLowerCase().includes(appSearch.toLowerCase()))
    : filteredApps;

  const searchedCalendars = calendarSearch
    ? filteredApps.filter((a) => a.name.toLowerCase().includes(calendarSearch.toLowerCase()))
    : filteredApps;

  /**
   * Configuración de acciones administrativas en español - AGRUPADAS POR CATEGORÍA
   */
  const adminActionsEs: AdminAction[] = [
    // Clientes
    {
      id: "create-client",
      name: "Crear Cliente",
      url: "/dashboard/create-client",
      icon: UserPlus,
      category: "clientes",
    },
    {
      id: "update-client",
      name: "Actualizar Cliente",
      url: "/dashboard/update-client",
      icon: UserCog,
      category: "clientes",
    },
    // Proyectos
    {
      id: "create-project",
      name: "Crear Proyecto",
      url: "/dashboard/create-project",
      icon: FolderPlus,
      category: "proyectos",
    },
    {
      id: "update-project",
      name: "Actualizar Proyecto",
      url: "/dashboard/update-project",
      icon: FolderCog,
      category: "proyectos",
    },
    // Contenido Proyecto
    {
      id: "create-project-content",
      name: "Crear Contenido Proyecto",
      url: "/dashboard/create-project-content",
      icon: FilePlus,
      category: "contenido",
    },
    {
      id: "update-project-content",
      name: "Actualizar Contenido Proyecto",
      url: "/dashboard/update-project-content",
      icon: FileCog,
      category: "contenido",
    },
    // Otros (sin dropdown)
    {
      id: "access-app",
      name: "Permisos",
      url: "/dashboard/access-app",
      icon: Shield,
      category: "otros",
    },
  ];

  /**
   * Configuración de acciones administrativas en inglés - AGRUPADAS POR CATEGORÍA
   */
  const adminActionsEn: AdminAction[] = [
    // Clientes
    {
      id: "create-client",
      name: "Create Client",
      url: "/dashboard/create-client",
      icon: UserPlus,
      category: "clientes",
    },
    {
      id: "update-client",
      name: "Update Client",
      url: "/dashboard/update-client",
      icon: UserCog,
      category: "clientes",
    },
    // Proyectos
    {
      id: "create-project",
      name: "Create Project",
      url: "/dashboard/create-project",
      icon: FolderPlus,
      category: "proyectos",
    },
    {
      id: "update-project",
      name: "Update Project",
      url: "/dashboard/update-project",
      icon: FolderCog,
      category: "proyectos",
    },
    // Contenido Proyecto
    {
      id: "create-project-content",
      name: "Create Project Content",
      url: "/dashboard/create-project-content",
      icon: FilePlus,
      category: "contenido",
    },
    {
      id: "update-project-content",
      name: "Update Project Content",
      url: "/dashboard/update-project-content",
      icon: FileCog,
      category: "contenido",
    },
    // Otros (sin dropdown)
    {
      id: "access-app",
      name: "Permissions",
      url: "/dashboard/access-app",
      icon: Shield,
      category: "otros",
    },
  ];

  /**
   * Acciones administrativas según el idioma actual
   */
  const adminActions: AdminAction[] =
    lang === "es" ? adminActionsEs : adminActionsEn;

  /**
   * Función para agrupar acciones por categoría
   */
  const groupActionsByCategory = (actions: AdminAction[]) => {
    const grouped: Record<string, AdminAction[]> = {};

    actions.forEach((action) => {
      if (!grouped[action.category]) {
        grouped[action.category] = [];
      }
      grouped[action.category].push(action);
    });

    return grouped;
  };

  const groupedActions = groupActionsByCategory(adminActions);

  /**
   * Traducciones de categorías
   */
  const categoryTranslations = {
    clientes: lang === "es" ? "Clientes" : "Clients",
    proyectos: lang === "es" ? "Proyectos" : "Projects",
    contenido: lang === "es" ? "Contenido Proyecto" : "Project Content",
    otros: lang === "es" ? "Otros" : "Others",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{user && <TeamSwitcher user={user} />}</SidebarHeader>

      <SidebarContent>
        {/* Sección de Acciones Administrativas - REESTRUCTURADA CON DROPDOWNS */}
        {user?.role === "admin" && Object.keys(groupedActions).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {lang === "es" ? "Acciones" : "Actions"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {/* Categoría: Clientes */}
              {groupedActions.clientes &&
                groupedActions.clientes.length > 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/dashboard/update-client"
                        onClick={handleItemClick}
                        className="flex items-center gap-2"
                      >
                        <UserCog className="w-4 h-4" />
                        <span>{categoryTranslations.clientes}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

              {/* Categoría: Proyectos */}
              {groupedActions.proyectos &&
                groupedActions.proyectos.length > 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/dashboard/update-project"
                        onClick={handleItemClick}
                        className="flex items-center gap-2"
                      >
                        <FolderCog className="w-4 h-4" />
                        <span>{categoryTranslations.proyectos}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

              {/* Categoría: Contenido Proyecto */}
              {groupedActions.contenido &&
                groupedActions.contenido.length > 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/dashboard/update-project-content"
                        onClick={handleItemClick}
                        className="flex items-center gap-2"
                      >
                        <FileCog className="w-4 h-4" />
                        <span>{categoryTranslations.contenido}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

              {/* Categoría: Otros (sin dropdown) */}
              {groupedActions.otros && groupedActions.otros.length > 0 && (
                <>
                  {groupedActions.otros.map((action: AdminAction) => (
                    <SidebarMenuItem key={action.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={action.url}
                          onClick={handleItemClick}
                          className="flex items-center gap-2"
                        >
                          <action.icon className="w-4 h-4" />
                          <span>{action.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Sección de Proyectos */}
        {visibleProjects.length > 0 && (
          <SidebarGroup className={user?.role === "admin" ? "group-data-[collapsible=icon]:hidden" : ""}>
            <SidebarGroupLabel>
              {lang === "es" ? "Proyectos" : "Projects"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {user?.role === "admin" ? (
                <DropdownMenu open={openAdminProjects} onOpenChange={(open) => { setOpenAdminProjects(open); if (!open) setProjectSearch(""); }}>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full flex justify-between items-center">
                      <span>
                        {lang === "es" ? "Ver Proyectos" : "View Projects"}
                      </span>
                      <svg
                        className="w-4 h-4 ml-2"
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
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-72 p-0"
                    side="right"
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
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          placeholder={lang === "es" ? "Buscar proyecto…" : "Search project…"}
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

                    {/* Project list */}
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {filteredVisibleProjects.length === 0 ? (
                        <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ec-text-dim)", fontSize: 12 }}>
                          {lang === "es" ? "Sin resultados" : "No results"}
                        </div>
                      ) : (
                        <SidebarMenu>
                          {filteredVisibleProjects.map((project: Project) => {
                            const dotColor = statusColor(project.percentage);
                            return (
                              <SidebarMenuItem key={project.id}>
                                <SidebarMenuButton asChild>
                                  <Link
                                    href={`/dashboard/${project.project_name}`}
                                    onClick={handleItemClick}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px" }}
                                  >
                                    <div
                                      style={{
                                        width: 6, height: 6, borderRadius: "50%",
                                        background: dotColor, flexShrink: 0,
                                        boxShadow: `0 0 0 2px ${dotColor}25`,
                                      }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, color: "var(--ec-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {project.title ?? project.project_name}
                                      </div>
                                      <div style={{ fontSize: 10, color: "var(--ec-text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {project.project_name}
                                      </div>
                                    </div>
                                    {project.percentage != null && (
                                      <span style={{ fontSize: 11, color: dotColor, fontFamily: "var(--font-jetbrains-mono, monospace)", flexShrink: 0 }}>
                                        {project.percentage}%
                                      </span>
                                    )}
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {visibleProjects.map((project: Project) => {
                    const dotColor = statusColor(project.percentage);
                    return (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          asChild
                          tooltip={project.title ?? project.project_name}
                        >
                          <Link
                            href={`/dashboard/${project.project_name}`}
                            onClick={handleItemClick}
                            style={{ display: "flex", alignItems: "center", gap: 10 }}
                          >
                            <div
                              style={{
                                width: 5, height: 5, borderRadius: "50%",
                                background: dotColor, flexShrink: 0,
                              }}
                            />
                            <span style={{ flex: 1 }}>{project.title ?? project.project_name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Sección de Aplicaciones */}
        {filteredApps.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Apps</SidebarGroupLabel>
            <SidebarMenu>
              {/* Apps */}
              {appsByCategory("app").length > 0 && (
                <SidebarMenuItem>
                  <DropdownMenu open={openApps} onOpenChange={(open) => { setOpenApps(open); if (!open) setAppSearch(""); }}>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Frame className="w-4 h-4" />
                          <span>{lang === "es" ? "Apps" : "Apps"}</span>
                        </div>
                        <svg
                          className="w-4 h-4 ml-2"
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
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-72 p-0"
                      side="right"
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
                            placeholder={lang === "es" ? "Buscar app…" : "Search app…"}
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

                      {/* App list */}
                      <div style={{ maxHeight: 280, overflowY: "auto" }}>
                        {appsByCategory("app").length === 0 ? (
                          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ec-text-dim)", fontSize: 12 }}>
                            {lang === "es" ? "Sin resultados" : "No results"}
                          </div>
                        ) : (
                          <SidebarMenu>
                            {appsByCategory("app").map((app: AppItem) => (
                              <SidebarMenuItem key={app.id}>
                                <SidebarMenuButton asChild tooltip={app.name}>
                                  <Link
                                    href={app.url}
                                    onClick={handleItemClick}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px" }}
                                  >
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ec-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <app.icon size={14} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, color: "var(--ec-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {app.name}
                                      </div>
                                      <div style={{ fontSize: 10, color: "var(--ec-text-dim)" }}>
                                        {app.category === "app" ? (lang === "es" ? "Aplicación" : "Application") : (lang === "es" ? "Calendario" : "Calendar")}
                                      </div>
                                    </div>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )}
              {/* Calendarios */}
              {appsByCategory("calendar").length > 0 && (
                <SidebarMenuItem>
                  <DropdownMenu open={openCalendars} onOpenChange={(open) => { setOpenCalendars(open); if (!open) setCalendarSearch(""); }}>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{lang === "es" ? "Calendarios" : "Calendars"}</span>
                        </div>
                        <svg
                          className="w-4 h-4 ml-2"
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
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-72 p-0"
                      side="right"
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
                            value={calendarSearch}
                            onChange={(e) => setCalendarSearch(e.target.value)}
                            placeholder={lang === "es" ? "Buscar calendario…" : "Search calendar…"}
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

                      {/* Calendar list */}
                      <div style={{ maxHeight: 280, overflowY: "auto" }}>
                        {appsByCategory("calendar").length === 0 ? (
                          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ec-text-dim)", fontSize: 12 }}>
                            {lang === "es" ? "Sin resultados" : "No results"}
                          </div>
                        ) : (
                          <SidebarMenu>
                            {appsByCategory("calendar").map((app: AppItem) => (
                              <SidebarMenuItem key={app.id}>
                                <SidebarMenuButton asChild tooltip={app.name}>
                                  <Link
                                    href={app.url}
                                    onClick={handleItemClick}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px" }}
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
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}


      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
