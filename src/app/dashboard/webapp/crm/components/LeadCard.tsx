"use client";

import { Facebook, FileSpreadsheet, UserPlus, Mail, Phone } from "lucide-react";
import { SOURCE_LABEL } from "../lib/format";
import type { Lead } from "../lib/types";
import { Badge } from "./ui";

const SOURCE_ICON = {
  facebook: <Facebook size={12} style={{ color: "#1877F2" }} />,
  csv: <FileSpreadsheet size={12} style={{ color: "var(--ec-success)" }} />,
  manual: <UserPlus size={12} style={{ color: "var(--ec-text-muted)" }} />,
} as const;

/**
 * Tarjeta arrastrable del pipeline.
 *
 * `onOpen` en vez de un <Link>: la navegacion la lleva el shell con query
 * params, no un Link a una ruta que en un export estatico no se puede generar.
 */
export function LeadCard({ lead, onDragStart, onOpen }: {
  lead: Lead;
  onDragStart: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      onClick={() => onOpen(lead.id)}
      // El tablero es de raton, pero la tarjeta tambien se abre con teclado: un
      // div con onClick y sin role no lo ven los lectores de pantalla ni el
      // recorrido con tabulador.
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(lead.id);
        }
      }}
      style={{
        cursor: "grab",
        borderRadius: 10,
        border: "1px solid var(--ec-hairline-strong)",
        background: "var(--ec-surface-1)",
        padding: 12,
        transition: "box-shadow 150ms, transform 150ms",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.boxShadow = "var(--ec-shadow-md)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lead.name}
        </span>
        <span title={SOURCE_LABEL[lead.source]} style={{ flexShrink: 0, display: "inline-flex" }}>
          {SOURCE_ICON[lead.source]}
        </span>
      </div>

      {lead.campaignName ? (
        <div style={{ marginTop: 7 }}>
          <Badge tone="brand">{lead.campaignName}</Badge>
        </div>
      ) : null}

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
        {lead.email ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11.5,
              color: "var(--ec-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <Mail size={11} style={{ flexShrink: 0 }} />
            {lead.email}
          </span>
        ) : null}
        {lead.phone ? (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--ec-text-muted)" }}>
            <Phone size={11} style={{ flexShrink: 0 }} />
            {lead.phone}
          </span>
        ) : null}
        {!lead.email && !lead.phone ? (
          <span style={{ fontSize: 11.5, color: "var(--ec-text-faint)" }}>No contact details</span>
        ) : null}
      </div>
    </div>
  );
}
