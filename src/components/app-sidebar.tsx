"use client";

import * as React from "react";
import { Frame, PieChart, Map, Bot, Pencil, LucideIcon } from "lucide-react";
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
}

/**
 * Tipo para definir las acciones administrativas
 */
interface AdminAction {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
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
}

/**
 * Props del componente AppSidebar
 */
type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

/**
 * Componente principal del sidebar de la aplicación
 *
 * Funcionalidades principales:
 * 1. Muestra diferentes secciones según el rol del usuario (admin/client)
 * 2. Filtra las aplicaciones según los permisos del usuario
 * 3. Gestiona el idioma (español/inglés)
 * 4. Maneja el comportamiento responsive del sidebar
 *
 * @param props - Props heredadas del componente Sidebar
 * @returns JSX.Element
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
   * Se ejecuta solo una vez al montar
   */
  React.useEffect(() => {
    const cookieLang = Cookies.get("lang") as "es" | "en";
    if (cookieLang) {
      changeLang(cookieLang);
    }
  }, [changeLang]);

  /**
   * Manejador para cerrar el sidebar en dispositivos móviles al hacer clic en un elemento
   * Mejora la UX en dispositivos táctiles
   */
  const handleItemClick = (): void => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  /**
   * Configuración de aplicaciones disponibles en español
   * IMPORTANTE: La propiedad 'component' debe coincidir exactamente
   * con los nombres almacenados en la base de datos de permisos
   */
  const apps: AppItem[] = [
    {
      id: "qr",
      name: "Generador de QR",
      url: "/dashboard/webapp/qr",
      icon: Frame,
      component: "QR", // Coincide con permission.component === "QR"
    },
    {
      id: "vcard",
      name: "Tarjeta de Visita",
      url: "/dashboard/webapp/vcard",
      icon: Map,
      component: "Vcard", // Coincide con permission.component === "Vcard"
    },
    {
      id: "calendar",
      name: "Calendario",
      url: "/dashboard/webapp/calendar",
      icon: PieChart,
      component: "calendar", // Coincide con permission.component === "calendar"
    },
    {
      id: "blogs",
      name: "Gestor de Blogs",
      url: "/dashboard/webapp/blogs",
      icon: Bot,
      component: "blogs", // Coincide con permission.component === "blogs"
    },
    {
      id: "reforma",
      name: "Calendario Reforma",
      url: "/dashboard/webapp/calendar-reforma",
      icon: PieChart,
      component: "Reforma", // Coincide con permission.component === "Reforma"
    },
    {
      id: "monge",
      name: "Calendario Monge",
      url: "/dashboard/webapp/calendar-monge",
      icon: PieChart,
      component: "Monge",
    },
  ];

  /**
   * Configuración de aplicaciones disponibles en inglés
   * Mantiene la misma estructura y componentes que la versión en español
   */
  const appsEn: AppItem[] = [
    {
      id: "qr",
      name: "QR Generator",
      url: "/dashboard/webapp/qr",
      icon: Frame,
      component: "QR",
    },
    {
      id: "vcard",
      name: "VCard Builder",
      url: "/dashboard/webapp/vcard",
      icon: Map,
      component: "Vcard",
    },
    {
      id: "calendar",
      name: "Calendar",
      url: "/dashboard/webapp/calendar",
      icon: PieChart,
      component: "calendar",
    },
    {
      id: "blogs",
      name: "Blog Manager",
      url: "/dashboard/webapp/blogs",
      icon: Bot,
      component: "blogs",
    },
    {
      id: "reforma",
      name: "Reforma Calendar",
      url: "/dashboard/webapp/calendar-reforma",
      icon: PieChart,
      component: "Reforma",
    },
    {
      id: "monge",
      name: "Monge Calendar",
      url: "/dashboard/webapp/calendar-monge",
      icon: PieChart,
      component: "Monge",
    },
  ];

  /**
   * Función para filtrar aplicaciones según los permisos del usuario
   *
   * Lógica de filtrado:
   * 1. Si el usuario es admin: ve todas las aplicaciones
   * 2. Si el usuario es client: solo ve aplicaciones con can_view === true
   *
   * @param appsList - Lista de aplicaciones a filtrar
   * @returns AppItem[] - Lista filtrada de aplicaciones
   */
  const getFilteredApps = (appsList: AppItem[]): AppItem[] => {
    // Los administradores tienen acceso a todas las aplicaciones
    if (user?.role === "admin") {
      return appsList;
    }

    // Para usuarios client, filtrar por permisos específicos
    return appsList.filter((app: AppItem) => {
      // Buscar el permiso correspondiente a esta aplicación
      const permission = permissions.find(
        (p: Permission) => p.component === app.component
      );
      // Solo mostrar si el permiso existe y can_view es true
      return permission?.can_view === true;
    });
  };

  /**
   * Aplicaciones filtradas según el idioma actual y los permisos del usuario
   */
  const filteredApps: AppItem[] = getFilteredApps(
    lang === "es" ? apps : appsEn
  );

  /**
   * Configuración de acciones administrativas en español
   * Solo visibles para usuarios con rol 'admin'
   */
  const adminActionsEs: AdminAction[] = [
    {
      id: "create-client",
      name: "Crear Cliente",
      url: "/dashboard/create-client",
      icon: PieChart,
    },
    {
      id: "create-project",
      name: "Crear Proyecto",
      url: "/dashboard/create-project",
      icon: Map,
    },
    {
      id: "create-project-content",
      name: "Crear Contenido Proyecto",
      url: "/dashboard/create-project-content",
      icon: Bot,
    },
    {
      id: "update-client",
      name: "Actualizar Cliente",
      url: "/dashboard/update-client",
      icon: Pencil,
    },
    {
      id: "update-project",
      name: "Actualizar Proyecto",
      url: "/dashboard/update-project",
      icon: Pencil,
    },
    {
      id: "update-project-content",
      name: "Actualizar Contenido Proyecto",
      url: "/dashboard/update-project-content",
      icon: Pencil,
    },
    {
      id: "access-app",
      name: "Permisos",
      url: "/dashboard/access-app",
      icon: Pencil,
    },
  ];

  /**
   * Configuración de acciones administrativas en inglés
   */
  const adminActionsEn: AdminAction[] = [
    {
      id: "create-client",
      name: "Create Client",
      url: "/dashboard/create-client",
      icon: PieChart,
    },
    {
      id: "create-project",
      name: "Create Project",
      url: "/dashboard/create-project",
      icon: Map,
    },
    {
      id: "create-project-content",
      name: "Create Project Content",
      url: "/dashboard/create-project-content",
      icon: Bot,
    },
    {
      id: "update-client",
      name: "Update Client",
      url: "/dashboard/update-client",
      icon: Pencil,
    },
    {
      id: "update-project",
      name: "Update Project",
      url: "/dashboard/update-project",
      icon: Pencil,
    },
    {
      id: "update-project-content",
      name: "Update Project Content",
      url: "/dashboard/update-project-content",
      icon: Pencil,
    },
    {
      id: "access-app",
      name: "Permissions",
      url: "/dashboard/access-app",
      icon: Pencil,
    },
  ];

  /**
   * Acciones administrativas según el idioma actual
   */
  const adminActions: AdminAction[] =
    lang === "es" ? adminActionsEs : adminActionsEn;

  /**
   * Proyectos visibles según el rol del usuario
   *
   * Lógica de filtrado:
   * 1. Admin: ve todos los proyectos
   * 2. Client: solo ve sus propios proyectos (donde id_user coincide)
   */
  const visibleProjects: Project[] =
    user?.role === "admin"
      ? projects
      : projects.filter(
          (project: Project) => project.id_user === Number(user?.id)
        );

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header del sidebar con información del equipo/usuario */}
      <SidebarHeader>{user && <TeamSwitcher user={user} />}</SidebarHeader>

      <SidebarContent>
        {/* Sección de Acciones Administrativas - Solo visible para admins */}
        {user?.role === "admin" && adminActions.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              {lang === "es" ? "Acciones" : "Actions"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {adminActions.map((action: AdminAction) => (
                <SidebarMenuItem key={action.id}>
                  <SidebarMenuButton asChild>
                    <Link href={action.url} onClick={handleItemClick}>
                      <action.icon className="mr-2" />
                      <span>{action.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Sección de Proyectos */}
        {visibleProjects.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              {lang === "es" ? "Proyectos" : "Projects"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {user?.role === "admin" ? (
                // Para admins: dropdown con todos los proyectos
                <DropdownMenu>
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
                    className="w-60 p-0"
                    side="right"
                    align="start"
                  >
                    <SidebarMenu>
                      {visibleProjects.map((project: Project) => (
                        <SidebarMenuItem key={project.id}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={`/dashboard/${project.project_name}`}
                              onClick={handleItemClick}
                            >
                              <Frame className="mr-2" />
                              <span>
                                {project.title ?? project.project_name}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Para clients: lista directa de sus proyectos
                visibleProjects.map((project: Project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={`/dashboard/${project.project_name}`}
                        onClick={handleItemClick}
                      >
                        <Frame className="mr-2" />
                        <span>{project.title ?? project.project_name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Sección de Aplicaciones - Filtrada por permisos */}
        {filteredApps.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Apps</SidebarGroupLabel>
            <SidebarMenu>
              {filteredApps.map((app: AppItem) => (
                <SidebarMenuItem key={app.id}>
                  <SidebarMenuButton asChild>
                    <Link href={app.url} onClick={handleItemClick}>
                      <app.icon className="mr-2" />
                      <span>{app.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Sección de Cambio de Idioma */}
        {lang && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              {lang === "es" ? "Cambiar idioma" : "Change language"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {lang === "es" ? (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => changeLang("en")}>
                    🇬🇧 English
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => changeLang("es")}>
                    🇪🇸 Español
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer del sidebar con información del usuario */}
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
