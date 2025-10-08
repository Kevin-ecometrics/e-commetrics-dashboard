/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface User {
  userName: string;
  profileImage?: string | null;
}

export function TeamSwitcher({ user }: { user: User }) {
  // Construye la URL de la imagen de forma segura
  const profileImageUrl = user?.profileImage
    ? `https://ecommetrica.com${user.profileImage.startsWith("/") ? "" : "/"}${
        user.profileImage
      }`
    : "/logo.jpg";

  return (
    <SidebarMenu>
      <Link href="/dashboard">
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="relative w-9 h-9 rounded-full overflow-hidden">
                <img
                  src={profileImageUrl}
                  alt={`${user?.userName}'s profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    const target = e.target as HTMLImageElement;
                    target.src = "/logo.jpg";
                  }}
                />
              </div>
              <p className="text-black dark:text-white">{user?.userName}</p>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </Link>
    </SidebarMenu>
  );
}
