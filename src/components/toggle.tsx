"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const icon = theme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--ec-hairline)",
            background: "transparent",
            color: "var(--ec-text-muted)",
            cursor: "pointer",
            transition: "all 150ms",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(189,21,92,0.06)";
            e.currentTarget.style.borderColor = "var(--ec-brand)";
            e.currentTarget.style.color = "var(--ec-brand)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--ec-hairline)";
            e.currentTarget.style.color = "var(--ec-text-muted)";
          }}
        >
          <Sun
            size={15}
            className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
            style={{ position: "absolute" }}
          />
          <Moon
            size={15}
            className="scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
            style={{ position: "absolute" }}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        style={{ borderRadius: 12, minWidth: 180, overflow: "hidden", border: "1px solid var(--ec-hairline)" }}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 10, color: theme === "light" ? "var(--ec-brand)" : "var(--ec-text)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(189,21,92,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
        >
          <Sun size={15} style={{ color: theme === "light" ? "var(--ec-brand)" : "var(--ec-text-muted)" }} />
          <span style={{ flex: 1 }}>Light</span>
          {theme === "light" && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono, monospace)", color: "var(--ec-brand)" }}>ACTIVO</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 10, color: theme === "dark" ? "var(--ec-brand)" : "var(--ec-text)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(189,21,92,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
        >
          <Moon size={15} style={{ color: theme === "dark" ? "var(--ec-brand)" : "var(--ec-text-muted)" }} />
          <span style={{ flex: 1 }}>Dark</span>
          {theme === "dark" && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono, monospace)", color: "var(--ec-brand)" }}>ACTIVO</span>
          )}
        </DropdownMenuItem>
        <div style={{ height: 1, background: "var(--ec-hairline)", margin: "0 8px" }} />
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 10, color: theme === "system" ? "var(--ec-brand)" : "var(--ec-text)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(189,21,92,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
        >
          <Monitor size={15} style={{ color: theme === "system" ? "var(--ec-brand)" : "var(--ec-text-muted)" }} />
          <span style={{ flex: 1 }}>System</span>
          {theme === "system" && (
            <span style={{ fontSize: 10, fontFamily: "var(--font-jetbrains-mono, monospace)", color: "var(--ec-brand)" }}>ACTIVO</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
