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
import Link from "next/link";
import { useLang } from "@/app/context/LangContext";

const formatProjectName = (name: string): string =>
  name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Bread(): JSX.Element {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];
  const { lang } = useLang();

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

  // Agregar proyecto (sin link porque no existe la página intermedia)
  breadcrumbItems.push(
    <BreadcrumbItem key={projectName}>
      <span className="text-muted-foreground">{projectDisplayName}</span>
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
