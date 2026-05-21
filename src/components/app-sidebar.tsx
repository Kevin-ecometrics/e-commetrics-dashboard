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

  const [openClientes, setOpenClientes] = React.useState(false);
  const [openProyectos, setOpenProyectos] = React.useState(false);
  const [openContenido, setOpenContenido] = React.useState(false);
  const [openAdminProjects, setOpenAdminProjects] = React.useState(false);

  const handleItemClick = (): void => {
    if (isMobile) setOpenMobile(false);
    setOpenClientes(false);
    setOpenProyectos(false);
    setOpenContenido(false);
    setOpenAdminProjects(false);
  };

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
    },
    {
      id: "vcard",
      name: "Tarjeta de Visita",
      url: "/dashboard/webapp/vcard",
      icon: CreditCard,
      component: "Vcard",
    },
    {
      id: "calendar",
      name: "Calendario",
      url: "/dashboard/webapp/calendar",
      icon: CalendarDays,
      component: "calendar",
    },
    {
      id: "blogs",
      name: "Gestor de Blogs",
      url: "/dashboard/webapp/blogs",
      icon: Newspaper,
      component: "blogs",
    },
    {
      id: "reforma",
      name: "Calendario Reforma",
      url: "/dashboard/webapp/calendar-reforma",
      icon: CalendarCheck,
      component: "Reforma",
    },
    {
      id: "monge",
      name: "Calendario Monge",
      url: "/dashboard/webapp/calendar-monge",
      icon: CalendarClock,
      component: "Monge",
    },
    {
      id: "promo-palmas",
      name: "Promo Palmas",
      url: "/dashboard/webapp/promo-palmas",
      icon: Tag,
      component: "PromoPalmas",
    },
    {
      id: "calendario-palmas",
      name: "Calendario Palmas",
      url: "/dashboard/webapp/calendario-palmas",
      icon: CalendarDays,
      component: "CalendarioPalmas",
    },
  ];

  const appsEn: AppItem[] = [
    {
      id: "qr",
      name: "QR Generator",
      url: "/dashboard/webapp/qr",
      icon: QrCode,
      component: "QR",
    },
    {
      id: "vcard",
      name: "VCard Builder",
      url: "/dashboard/webapp/vcard",
      icon: CreditCard,
      component: "Vcard",
    },
    {
      id: "calendar",
      name: "Calendar",
      url: "/dashboard/webapp/calendar",
      icon: CalendarDays,
      component: "calendar",
    },
    {
      id: "blogs",
      name: "Blog Manager",
      url: "/dashboard/webapp/blogs",
      icon: Newspaper,
      component: "blogs",
    },
    {
      id: "reforma",
      name: "Reforma Calendar",
      url: "/dashboard/webapp/calendar-reforma",
      icon: CalendarCheck,
      component: "Reforma",
    },
    {
      id: "monge",
      name: "Monge Calendar",
      url: "/dashboard/webapp/calendar-monge",
      icon: CalendarClock,
      component: "Monge",
    },
    {
      id: "promo-palmas",
      name: "Promo Palmas",
      url: "/dashboard/webapp/promo-palmas",
      icon: Tag,
      component: "PromoPalmas",
    },
    {
      id: "calendario-palmas",
      name: "Palmas Calendar",
      url: "/dashboard/webapp/calendario-palmas",
      icon: CalendarDays,
      component: "CalendarioPalmas",
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

  /**
   * Proyectos visibles según el rol del usuario
   */
  const visibleProjects: Project[] =
    user?.role === "admin"
      ? projects
      : projects.filter(
          (project: Project) => project.id_user === Number(user?.id)
        );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{user && <TeamSwitcher user={user} />}</SidebarHeader>

      <SidebarContent>
        {/* Sección de Acciones Administrativas - REESTRUCTURADA CON DROPDOWNS */}
        {user?.role === "admin" && Object.keys(groupedActions).length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              {lang === "es" ? "Acciones" : "Actions"}
            </SidebarGroupLabel>
            <SidebarMenu>
              {/* Categoría: Clientes */}
              {groupedActions.clientes &&
                groupedActions.clientes.length > 0 && (
                  <SidebarMenuItem>
                    <DropdownMenu open={openClientes} onOpenChange={setOpenClientes}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            <span>{categoryTranslations.clientes}</span>
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
                        className="w-56 p-0"
                        side="right"
                        align="start"
                      >
                        <SidebarMenu>
                          {groupedActions.clientes.map(
                            (action: AdminAction) => (
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
                            )
                          )}
                        </SidebarMenu>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                )}

              {/* Categoría: Proyectos */}
              {groupedActions.proyectos &&
                groupedActions.proyectos.length > 0 && (
                  <SidebarMenuItem>
                    <DropdownMenu open={openProyectos} onOpenChange={setOpenProyectos}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FolderPlus className="w-4 h-4" />
                            <span>{categoryTranslations.proyectos}</span>
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
                        className="w-56 p-0"
                        side="right"
                        align="start"
                      >
                        <SidebarMenu>
                          {groupedActions.proyectos.map(
                            (action: AdminAction) => (
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
                            )
                          )}
                        </SidebarMenu>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                )}

              {/* Categoría: Contenido Proyecto */}
              {groupedActions.contenido &&
                groupedActions.contenido.length > 0 && (
                  <SidebarMenuItem>
                    <DropdownMenu open={openContenido} onOpenChange={setOpenContenido}>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FilePlus className="w-4 h-4" />
                            <span>{categoryTranslations.contenido}</span>
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
                        className="w-56 p-0"
                        side="right"
                        align="start"
                      >
                        <SidebarMenu>
                          {groupedActions.contenido.map(
                            (action: AdminAction) => (
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
                            )
                          )}
                        </SidebarMenu>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                <DropdownMenu open={openAdminProjects} onOpenChange={setOpenAdminProjects}>
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
                visibleProjects.map((project: Project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={project.title ?? project.project_name}
                    >
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

        {/* Sección de Aplicaciones */}
        {filteredApps.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Apps</SidebarGroupLabel>
            <SidebarMenu>
              {filteredApps.map((app: AppItem) => (
                <SidebarMenuItem key={app.id}>
                  <SidebarMenuButton asChild tooltip={app.name}>
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
              {lang === "es" ? "Idioma" : "Language"}
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => changeLang(lang === "es" ? "en" : "es")}
                  className="gap-2"
                >
                  {lang === "es" ? (
                    <>
                      {/* Bandera USA */}
                      <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-[2px] flex-shrink-0">
                        <rect width="20" height="14" fill="#B22234" />
                        <rect y="1.08" width="20" height="1.08" fill="white" />
                        <rect y="3.23" width="20" height="1.08" fill="white" />
                        <rect y="5.38" width="20" height="1.08" fill="white" />
                        <rect y="7.54" width="20" height="1.08" fill="white" />
                        <rect y="9.69" width="20" height="1.08" fill="white" />
                        <rect y="11.85" width="20" height="1.08" fill="white" />
                        <rect width="8" height="7.54" fill="#3C3B6E" />
                      </svg>
                      <span className="text-sm">English</span>
                    </>
                  ) : (
                    <>
                      {/* Bandera México */}
                      <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-[2px] flex-shrink-0">
                        <rect width="20" height="14" fill="white" />
                        <rect width="6.67" height="14" fill="#006847" />
                        <rect x="13.33" width="6.67" height="14" fill="#CE1126" />
                      </svg>
                      <span className="text-sm">Español</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
