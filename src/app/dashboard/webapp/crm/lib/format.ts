"use client";

import type { ActivityType, LeadSource, MessageChannel } from "./types";

/** Etiquetas en ingles a proposito: el CRM original estaba en ingles y los datos de Meta tambien. */
export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  note: "Note",
  stage_change: "Stage change",
  system: "System",
  message_sent: "Message sent",
  message_failed: "Message failed",
  capi_sent: "Facebook event sent",
  capi_failed: "Facebook event failed",
};

export const CHANNEL_LABEL: Record<MessageChannel, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export const SOURCE_LABEL: Record<LeadSource, string> = {
  facebook: "Facebook",
  csv: "CSV",
  manual: "Manual",
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;

/** "platform" e "is_organic" son ruido interno de Meta; el resto son respuestas del formulario. */
export const HIDDEN_FIELD_KEYS = new Set(["platform", "is_organic"]);

/** "fecha_de_contacto?" -> "Fecha de contacto?" */
export function formatFieldLabel(key: string): string {
  const words = key.replace(/_/g, " ").replace(/\?$/, "").trim();
  const label = words.charAt(0).toUpperCase() + words.slice(1);
  return key.endsWith("?") ? `${label}?` : label;
}

export function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" && ISO_DATE_RE.test(value)) {
    return new Date(value).toLocaleString();
  }
  return String(value);
}

/** Oculta el contacto si no hay nada que enseñar, sin ensuciar el JSX. */
export function contactLine(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "never";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

export function isOverdue(isoDueAt: string, now = Date.now()): boolean {
  return new Date(isoDueAt).getTime() < now;
}

export function isDueWithin(isoDueAt: string, ms: number, now = Date.now()): boolean {
  return new Date(isoDueAt).getTime() <= now + ms;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fábrica de un archivo y lo descarga.
 *
 * El CSV no puede descargarse con un <a href> porque el token va en un header
 * de peticion y una navegacion no lleva headers.
 */
export function downloadTextFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
