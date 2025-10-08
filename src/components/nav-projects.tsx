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
import { type LucideIcon } from "lucide-react";

interface NavItem {
  id: string | number;
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavProjectsProps {
  projects: NavItem[]; // proyectos reales que van dentro del dropdown
  actions?: NavItem[]; // acciones que van fuera del dropdown
}

export function NavProjects({ projects = [], actions = [] }: NavProjectsProps) {
  return (
    <>
      {/* Acciones */}
      {actions.length > 0 && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Acciones</SidebarGroupLabel>
          <SidebarMenu>
            {actions.map((action) => (
              <SidebarMenuItem key={action.id}>
                <SidebarMenuButton asChild>
                  <Link href={action.url}>
                    <action.icon />
                    <span>{action.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* Proyectos */}
      {projects.length > 0 ? (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Proyectos</SidebarGroupLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="w-full flex justify-between items-center">
                <span>Ver Proyectos</span>
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
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <Link href={project.url}>
                        <project.icon />
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarGroup>
      ) : (
        // Opcional: mostrar mensaje cuando no hay proyectos
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Proyectos</SidebarGroupLabel>
          <div className="p-4 text-gray-500 select-none text-sm">
            No hay proyectos disponibles
          </div>
        </SidebarGroup>
      )}
    </>
  );
}
